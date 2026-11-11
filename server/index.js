import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import compression from 'compression'
import express from 'express'
import geoip from 'geoip-lite'
import helmet from 'helmet'
import postgres from 'postgres'
import { getChangedCourseLessonIds, remapReusedCourseLessonIds } from './course-lesson-identities.js'
import { buildClientMetadata, displayClientIp, parseNickname, sanitizeClientHints } from './client-metadata.js'
import { getLatestSubmittedQuizAttempts } from './quiz-performance.js'
import { areSolverFollowUpsComplete, areSolverProblemsComplete, getStepByStepSolverSessionView, isValidStepByStepSolverConfig, normalizeSolverAnswer } from './step-by-step-solver-engine.js'
import { expireQuizAnswers, getQuizDeadline, getQuizTimeLimitSeconds, hasScheduledClassQuizzes, isQuizExpired } from './quiz-timing.js'
import { generateVerificationCode, hashVerificationCode, isValidEmailAddress, sendEnrollmentVerificationEmail, verificationCodeLifetimeMinutes, verificationIpMaxRequests, verificationIpWindowMinutes, verificationMaxIncorrectAttempts, verificationResendCooldownSeconds, verifiedEnrollmentWindowMinutes } from './enrollment-verification.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set.')
}

const sql = postgres(databaseUrl, { max: 10, ssl: 'require', prepare: false })
const scrypt = promisify(scryptCallback)
const app = express()
const configuredProxyTrust = process.env.TRUST_PROXY
const proxyTrustSetting = configuredProxyTrust === undefined || configuredProxyTrust === 'false'
  ? false
  : configuredProxyTrust === 'true'
    ? true
    : /^\d+$/.test(configuredProxyTrust)
      ? Number(configuredProxyTrust)
      : configuredProxyTrust.split(',').map((value) => value.trim()).filter(Boolean)
app.set('trust proxy', proxyTrustSetting)
app.use(helmet({
  hsts: false,
  contentSecurityPolicy: {
    useDefaults: true,
    reportOnly: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'https://challenges.cloudflare.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'media-src': ["'self'", 'blob:', 'https:'],
      'frame-src': ['https://www.youtube-nocookie.com', 'https://player.vimeo.com', 'https://maps.google.com', 'https://www.google.com', 'https://challenges.cloudflare.com'],
      'connect-src': ["'self'", 'https://challenges.cloudflare.com'],
      'report-uri': ['/api/csp-report'],
    },
  },
}))
app.use(compression())
const port = Number(process.env.PORT ?? 3001)
const distDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const isTestChapa = process.env.CHAPA_MODE !== 'live'
const sessionCookieName = 'coursespace-session'
const deviceCookieName = 'coursespace-device'
const sessionPolicies = {
  student: { idleMs: 14 * 86400000, absoluteMs: 60 * 86400000, maxSessions: 3 },
  parent: { idleMs: 14 * 86400000, absoluteMs: 60 * 86400000, maxSessions: 3 },
  tutor: { idleMs: 8 * 3600000, absoluteMs: 7 * 86400000, maxSessions: 3 },
  admin: { idleMs: 30 * 60000, absoluteMs: 8 * 3600000, maxSessions: 2 },
}
const defaultSessionPolicy = sessionPolicies.student

const hashToken = (token) => createHash('sha256').update(token).digest('hex')
const getCookieValue = (request, name) => request.headers.cookie?.split(';').map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`))?.slice(name.length + 1)
const setSecurityCookies = (response, token, deviceId, role) => {
  const idleSeconds = Math.floor(sessionPolicyFor(role).idleMs / 1000)
  response.setHeader('Set-Cookie', [
    `${sessionCookieName}=${token}; HttpOnly; Secure; Path=/; SameSite=None; Partitioned; Max-Age=${idleSeconds}`,
    `${deviceCookieName}=${deviceId}; HttpOnly; Secure; Path=/; SameSite=None; Partitioned; Max-Age=31536000`,
  ])
}
const clearSecurityCookies = (response) => response.setHeader('Set-Cookie', `${sessionCookieName}=; HttpOnly; Secure; Path=/; SameSite=None; Partitioned; Max-Age=0`)
const getClientMetadata = (request, clientHints = null) => ({
  ...buildClientMetadata(request.get('user-agent'), clientHints),
  ip: request.ip ?? request.socket.remoteAddress ?? 'unknown',
})
const getGeoLocation = async (ip) => {
  const address = ip.startsWith('::ffff:') ? ip.slice(7) : ip
  const location = geoip.lookup(address)
  const timezoneCity = location?.timezone && !location.timezone.startsWith('Etc/') ? location.timezone.split('/').pop().replace(/_/g, ' ') : null
  return { country: location?.country || null, city: location?.city || timezoneCity }
}
const maskIpAddress = (ip) => ip.includes(':') ? `${ip.split(':').slice(0, 3).join(':')}:…` : ip.split('.').map((part, index) => index < 2 ? part : '•').join('.')
const sessionPolicyFor = (role) => sessionPolicies[role] ?? defaultSessionPolicy
const getDeviceId = (request) => {
  request.securityDeviceId ??= getCookieValue(request, deviceCookieName) ?? randomBytes(24).toString('base64url')
  return request.securityDeviceId
}
const getTurnstileSecret = () => process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY

const verifyTurnstile = async (token, ip) => {
  const secret = getTurnstileSecret()
  if (!secret || typeof token !== 'string' || !token) return false
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip })
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    if (!result.ok) return false
    return (await result.json()).success === true
  } catch {
    return false
  }
}

const getSecurityEncryptionKey = () => {
  const key = Buffer.from(process.env.SECURITY_ENCRYPTION_KEY ?? '', 'base64url')
  if (key.length !== 32) throw new Error('SECURITY_ENCRYPTION_KEY must be a base64url-encoded 32-byte key.')
  return key
}
const encryptTotpSecret = (secret) => {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getSecurityEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.')
}
const decryptTotpSecret = (value) => {
  const [encodedIv, encodedTag, encodedData] = value.split('.')
  const decipher = createDecipheriv('aes-256-gcm', getSecurityEncryptionKey(), Buffer.from(encodedIv, 'base64url'))
  decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encodedData, 'base64url')), decipher.final()]).toString('utf8')
}
const encodeBase32 = (buffer) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits) output += alphabet[(value << (5 - bits)) & 31]
  return output
}
const createTotp = (secret, timestamp = Date.now()) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const normalized = secret.toUpperCase().replace(/=+$/g, '')
  let bits = 0
  let value = 0
  const bytes = []
  for (const character of normalized) {
    value = (value << 5) | alphabet.indexOf(character)
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(timestamp / 30000)))
  const digest = createHmac('sha1', Buffer.from(bytes)).update(counter).digest()
  const offset = digest[digest.length - 1] & 15
  const code = ((digest[offset] & 127) << 24) | ((digest[offset + 1] & 255) << 16) | ((digest[offset + 2] & 255) << 8) | (digest[offset + 3] & 255)
  return String(code % 1000000).padStart(6, '0')
}
const verifyTotp = (secret, code) => {
  const candidate = String(code ?? '').replace(/\s+/g, '')
  if (!/^\d{6}$/.test(candidate)) return false
  const supplied = Buffer.from(candidate)
  return [-30000, 0, 30000].some((offset) => timingSafeEqual(supplied, Buffer.from(createTotp(secret, Date.now() + offset))))
}
const hashBackupCode = (code) => createHash('sha256').update(code).digest('hex')
const seedTutors = [
  { name: 'Maya Chen', email: 'maya@example.com', status: 'Active' },
  { name: 'Leon Kennedy', email: 'leon@example.com', status: 'Active' },
  { name: 'Jhon Dwirian', email: 'jhon@example.com', status: 'Inactive' },
  { name: 'Rizki Known', email: 'rizki@example.com', status: 'Active' },
]

const gamificationBadgeSeeds = [
  { id: 'first-quiz-passed', name: 'First Quiz Passed', icon: 'quiz', description: 'Passed your first quiz and started building assessment momentum.', criteria: 'Pass 1 quiz' },
  { id: 'seven-day-streak', name: '7-Day Streak', icon: 'streak', description: 'Kept your learning habit going for seven days.', criteria: 'Reach a 7-day streak' },
  { id: 'perfect-attendance', name: 'Perfect Attendance', icon: 'attendance', description: 'Attended every live session currently tracked for your cohort.', criteria: 'Attend every live session' },
  { id: 'course-completed', name: 'Course Completed', icon: 'course', description: 'Completed every lesson in a course.', criteria: 'Complete 1 course' },
  { id: 'lesson-momentum', name: 'Lesson Momentum', icon: 'momentum', description: 'Completed ten lessons across your learning plan.', criteria: 'Complete 10 lessons' },
]

const gamificationChallengeSeeds = [
  { id: 'daily-lesson', title: 'Complete 1 lesson today', type: 'daily', criteria: 'lesson_today', xpReward: 30, pointsReward: 10, sortOrder: 1 },
  { id: 'daily-quiz', title: 'Pass a quiz today', type: 'daily', criteria: 'quiz_today', xpReward: 45, pointsReward: 15, sortOrder: 2 },
  { id: 'daily-live', title: 'Attend a live session today', type: 'daily', criteria: 'live_today', xpReward: 50, pointsReward: 18, sortOrder: 3 },
  { id: 'weekly-live', title: 'Attend both live sessions this week', type: 'weekly', criteria: 'live_week', xpReward: 80, pointsReward: 30, sortOrder: 1 },
  { id: 'weekly-lessons', title: 'Complete 3 lessons this week', type: 'weekly', criteria: 'lesson_week', xpReward: 90, pointsReward: 35, sortOrder: 2 },
]

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex')
  const hash = await scrypt(password, salt, 64)
  return `${salt}:${Buffer.from(hash).toString('hex')}`
}

const verifyPassword = async (password, storedHash) => {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) return false

  const derivedHash = Buffer.from(await scrypt(password, salt, 64))
  const savedHash = Buffer.from(hash, 'hex')
  return derivedHash.length === savedHash.length && timingSafeEqual(derivedHash, savedHash)
}

const isValidEmail = (email) => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const isValidCredentials = (email, password) => (
  isValidEmail(email) &&
  typeof password === 'string' &&
  password.length >= 8 &&
  password.length <= 128
)

const quoteIdentifier = (identifier) => `"${identifier.replaceAll('"', '""')}"`

const ensureColumns = async (tableName, columns) => {
  const existingColumns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
  `
  const existingColumnNames = new Set(existingColumns.map(({ column_name }) => column_name))

  for (const [columnName, definition] of Object.entries(columns)) {
    if (!existingColumnNames.has(columnName)) {
      await sql.unsafe(`ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN IF NOT EXISTS ${quoteIdentifier(columnName)} ${definition}`)
    }
  }
}

const ensureNullable = async (tableName, columnName) => {
  const [column] = await sql`
    SELECT is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${columnName}
  `
  if (column?.is_nullable === 'NO') {
    await sql.unsafe(`ALTER TABLE ${quoteIdentifier(tableName)} ALTER COLUMN ${quoteIdentifier(columnName)} DROP NOT NULL`)
  }
}

const initializeDatabase = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS tutors (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await ensureColumns('users', {
    name: "TEXT NOT NULL DEFAULT ''",
    phone: "TEXT NOT NULL DEFAULT ''",
    status: "TEXT NOT NULL DEFAULT 'Active'",
    locked_until: 'TIMESTAMPTZ',
    account_locked: 'BOOLEAN NOT NULL DEFAULT false',
    must_reset_password: 'BOOLEAN NOT NULL DEFAULT false',
  })

  await sql`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `
  await ensureColumns('auth_sessions', {
    token_hashed: 'BOOLEAN NOT NULL DEFAULT false',
    created_at: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    last_active_at: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    idle_expires_at: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    absolute_expires_at: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    ended_at: 'TIMESTAMPTZ',
    ended_reason: "TEXT NOT NULL DEFAULT ''",
    device_id: "TEXT NOT NULL DEFAULT ''",
    client_ip: "TEXT NOT NULL DEFAULT 'unknown'",
    country: 'TEXT',
    city: 'TEXT',
    browser: "TEXT NOT NULL DEFAULT 'Unknown'",
    os: "TEXT NOT NULL DEFAULT 'Unknown'",
    device_type: "TEXT NOT NULL DEFAULT 'unknown'",
    user_agent: "TEXT NOT NULL DEFAULT ''",
    browser_version: 'TEXT',
    os_version: 'TEXT',
    device_vendor: 'TEXT',
    device_model: 'TEXT',
    nickname: 'TEXT',
  })
  const legacySessions = await sql`SELECT token, expires_at FROM auth_sessions WHERE token_hashed = false`
  for (const session of legacySessions) {
    await sql`
      UPDATE auth_sessions
      SET token = ${hashToken(session.token)}, token_hashed = true, created_at = COALESCE(created_at, NOW()),
          last_active_at = NOW(), idle_expires_at = ${session.expires_at}, absolute_expires_at = ${session.expires_at}
      WHERE token = ${session.token}
    `
  }
  await sql`CREATE INDEX IF NOT EXISTS auth_sessions_user_active_idx ON auth_sessions(user_id, last_active_at DESC) WHERE ended_at IS NULL`
  await sql`CREATE INDEX IF NOT EXISTS auth_sessions_idle_expiry_idx ON auth_sessions(idle_expires_at)`

  await sql`
    CREATE TABLE IF NOT EXISTS login_events (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      email TEXT NOT NULL,
      succeeded BOOLEAN NOT NULL,
      reason TEXT NOT NULL,
      client_ip TEXT NOT NULL,
      country TEXT,
      city TEXT,
      browser TEXT NOT NULL,
      os TEXT NOT NULL,
      device_type TEXT NOT NULL,
      device_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS login_events_user_date_idx ON login_events(user_id, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS login_events_ip_date_idx ON login_events(client_ip, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS login_events_email_date_idx ON login_events(email, created_at DESC)`
  await sql`
    CREATE TABLE IF NOT EXISTS security_alerts (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      alert_type TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS security_alerts_user_date_idx ON security_alerts(user_id, created_at DESC)`
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      before_state JSONB,
      after_state JSONB,
      client_ip TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS admin_audit_log_date_idx ON admin_audit_log(created_at DESC)`
  await sql`
    CREATE TABLE IF NOT EXISTS two_factor_secrets (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      encrypted_secret TEXT NOT NULL,
      backup_code_hashes JSONB NOT NULL DEFAULT '[]'::jsonb,
      enabled_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS password_reset_tokens_expiry_idx ON password_reset_tokens(expires_at)`

  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      age_or_grade TEXT NOT NULL,
      relationship TEXT NOT NULL CHECK (relationship IN ('Parent', 'Guardian', 'Self')),
      preferred_language TEXT NOT NULL,
      emergency_phone TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `


  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      cover TEXT NOT NULL,
      rating NUMERIC(2, 1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
      rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      category TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Beginner',
      tutor TEXT NOT NULL DEFAULT '',
      tutor_id BIGINT REFERENCES tutors(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'Published',
      students INTEGER NOT NULL DEFAULT 0 CHECK (students >= 0),
      description TEXT NOT NULL DEFAULT '',
      long_description TEXT NOT NULL DEFAULT '',
      learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
      requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
      certificate BOOLEAN NOT NULL DEFAULT false,
      modules JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await ensureColumns('courses', {
    level: "TEXT NOT NULL DEFAULT 'Beginner'",
    tutor: "TEXT NOT NULL DEFAULT ''",
    tutor_id: 'BIGINT REFERENCES tutors(id) ON DELETE SET NULL',
    status: "TEXT NOT NULL DEFAULT 'Published'",
    students: 'INTEGER NOT NULL DEFAULT 0',
    description: "TEXT NOT NULL DEFAULT ''",
    long_description: "TEXT NOT NULL DEFAULT ''",
    learning_outcomes: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    requirements: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    certificate: 'BOOLEAN NOT NULL DEFAULT false',
    modules: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    updated_at: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  })

  await sql`
    CREATE TABLE IF NOT EXISTS practice_exams (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      published BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS practice_questions (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      exam_id BIGINT NOT NULL REFERENCES practice_exams(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      topic TEXT NOT NULL DEFAULT '',
      options JSONB NOT NULL DEFAULT '[]'::jsonb,
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await ensureColumns('practice_questions', {
    topic: "TEXT NOT NULL DEFAULT ''",
  })

  await sql`
    CREATE TABLE IF NOT EXISTS bookstore_items (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      currency TEXT NOT NULL DEFAULT 'ETB',
      cover_data TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT false,
      download_file BYTEA NOT NULL,
      download_file_name TEXT NOT NULL,
      download_mime_type TEXT NOT NULL,
      download_size_bytes BIGINT NOT NULL CHECK (download_size_bytes > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE TABLE IF NOT EXISTS bookstore_downloads (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bookstore_item_id BIGINT NOT NULL REFERENCES bookstore_items(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
  await sql`CREATE INDEX IF NOT EXISTS bookstore_downloads_item_idx ON bookstore_downloads (bookstore_item_id, downloaded_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS bookstore_items_published_idx ON bookstore_items (published, created_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
      student_data JSONB NOT NULL,
      amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
      currency TEXT NOT NULL DEFAULT 'ETB',
      chapa_reference TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    )
  `
  await ensureColumns('payments', {
    practice_exam_id: 'BIGINT REFERENCES practice_exams(id) ON DELETE RESTRICT',
    bookstore_item_id: 'BIGINT REFERENCES bookstore_items(id) ON DELETE RESTRICT',
    currency: "TEXT NOT NULL DEFAULT 'ETB'",
    chapa_reference: 'TEXT',
    payment_method: "TEXT NOT NULL DEFAULT 'chapa'",
    verification_status: "TEXT CHECK (verification_status IN ('pending', 'approved', 'declined'))",
    proof_image: 'BYTEA',
    proof_mime_type: 'TEXT',
    proof_file_name: 'TEXT',
    contact_data: 'JSONB',
    review_note: 'TEXT',
    reviewed_by: 'BIGINT REFERENCES users(id) ON DELETE SET NULL',
    reviewed_at: 'TIMESTAMPTZ',
  })
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS payments_chapa_reference_idx ON payments(chapa_reference) WHERE chapa_reference IS NOT NULL`

  await sql`
    CREATE TABLE IF NOT EXISTS practice_purchases (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exam_id BIGINT NOT NULL REFERENCES practice_exams(id) ON DELETE RESTRICT,
      payment_id BIGINT UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,
      purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, exam_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS bookstore_purchases (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bookstore_item_id BIGINT NOT NULL REFERENCES bookstore_items(id) ON DELETE RESTRICT,
      payment_id BIGINT UNIQUE NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
      purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, bookstore_item_id)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS bookstore_purchases_user_idx ON bookstore_purchases (user_id, purchased_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
      payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (student_id, course_id, payment_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS practice_answers (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      enrollment_id BIGINT REFERENCES enrollments(id) ON DELETE CASCADE,
      exam_id BIGINT REFERENCES practice_exams(id) ON DELETE CASCADE,
      lesson_id BIGINT,
      question_id BIGINT NOT NULL,
      topic TEXT NOT NULL,
      correct BOOLEAN NOT NULL,
      answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (enrollment_id IS NOT NULL OR exam_id IS NOT NULL)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS practice_answers_user_idx ON practice_answers(user_id, answered_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS practice_answers_enrollment_idx ON practice_answers(enrollment_id, answered_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      program_id TEXT NOT NULL CHECK (program_id IN ('international-online-interactive', 'summer-camp', 'ministry-exam-prep')),
      title TEXT NOT NULL,
      cover TEXT NOT NULL DEFAULT '',
      tutor_id BIGINT REFERENCES tutors(id) ON DELETE SET NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      schedule JSONB NOT NULL DEFAULT '{"days": [], "time": "", "flexible": false}'::jsonb,
      meeting_link TEXT NOT NULL,
      course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('pending_schedule', 'open', 'full', 'closed')),
      published BOOLEAN NOT NULL DEFAULT true,
      modules JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await ensureColumns('classes', {
    cover: "TEXT NOT NULL DEFAULT ''",
    modules: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    grade_level: 'SMALLINT CHECK (grade_level BETWEEN 1 AND 12)',
    exam_date: 'DATE',
  })
  await sql`
    CREATE TABLE IF NOT EXISTS course_reviews (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL DEFAULT '' CHECK (char_length(comment) <= 1000),
      is_hidden BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (course_id, user_id)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS class_reviews (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL DEFAULT '' CHECK (char_length(comment) <= 1000),
      is_hidden BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (class_id, user_id)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS course_reviews_visible_idx ON course_reviews (course_id, created_at DESC) WHERE is_hidden = false`
  await sql`CREATE INDEX IF NOT EXISTS class_reviews_visible_idx ON class_reviews (class_id, created_at DESC) WHERE is_hidden = false`
  await ensureColumns('enrollments', {
    class_id: 'BIGINT REFERENCES classes(id) ON DELETE SET NULL',
    class_status: "TEXT CHECK (class_status IN ('enrolled', 'waitlisted'))",
  })
  await ensureNullable('enrollments', 'course_id')
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS enrollments_class_payment_idx ON enrollments (student_id, payment_id) WHERE course_id IS NULL`
  await ensureColumns('payments', {
    class_id: 'BIGINT REFERENCES classes(id) ON DELETE SET NULL',
  })
  await ensureNullable('payments', 'course_id')
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS payments_manual_pending_course_idx ON payments(user_id, course_id) WHERE payment_method = 'manual' AND verification_status = 'pending' AND course_id IS NOT NULL`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS payments_manual_pending_class_idx ON payments(user_id, class_id) WHERE payment_method = 'manual' AND verification_status = 'pending' AND class_id IS NOT NULL`
  await sql`
    CREATE TABLE IF NOT EXISTS enrollment_email_verifications (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT NOT NULL,
      target_key TEXT NOT NULL,
      code_hash TEXT,
      code_expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_sent_at TIMESTAMPTZ NOT NULL,
      verified_until TIMESTAMPTZ,
      UNIQUE (email, target_key)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS enrollment_code_send_requests (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      ip TEXT NOT NULL,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS enrollment_code_send_requests_ip_idx ON enrollment_code_send_requests(ip, requested_at)`

  await ensureColumns('users', { username: 'TEXT', one_time_password_expires_at: 'TIMESTAMPTZ' })
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users(username) WHERE username IS NOT NULL`

  await sql`
    CREATE TABLE IF NOT EXISTS sponsors (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
      contact TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      seat_limit INTEGER CHECK (seat_limit IS NULL OR seat_limit >= 0),
      end_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS sponsor_payments (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      sponsor_id BIGINT NOT NULL REFERENCES sponsors(id) ON DELETE RESTRICT,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      reference TEXT NOT NULL DEFAULT '' CHECK (char_length(reference) <= 200),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK ((status = 'paid') = (paid_at IS NOT NULL))
    )
  `
  await ensureColumns('sponsor_payments', {
    course_id: 'BIGINT REFERENCES courses(id) ON DELETE RESTRICT',
    class_id: 'BIGINT REFERENCES classes(id) ON DELETE RESTRICT',
    invoice_name: 'TEXT',
    invoice_type: 'TEXT',
    invoice_data: 'BYTEA'
  })
  await ensureColumns('enrollments', {
    source: "TEXT NOT NULL DEFAULT 'paid' CHECK (source IN ('paid', 'free_grant', 'sponsored'))",
    access_status: "TEXT NOT NULL DEFAULT 'active' CHECK (access_status IN ('active', 'revoked', 'expired'))",
    expires_at: 'TIMESTAMPTZ',
    sponsor_id: 'BIGINT REFERENCES sponsors(id) ON DELETE RESTRICT',
    granted_by: 'BIGINT REFERENCES users(id) ON DELETE SET NULL',
    grant_reason: "TEXT CHECK (grant_reason IN ('Scholarship', 'Staff', 'Promotion', 'Sponsored', 'Other'))",
    grant_note: 'TEXT',
    revoked_at: 'TIMESTAMPTZ',
    revoked_by: 'BIGINT REFERENCES users(id) ON DELETE SET NULL',
  })
  await ensureNullable('enrollments', 'payment_id')
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS enrollments_active_grant_course_idx ON enrollments (user_id, course_id) WHERE payment_id IS NULL AND class_id IS NULL AND access_status = 'active'`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS enrollments_active_grant_class_idx ON enrollments (user_id, class_id) WHERE payment_id IS NULL AND class_id IS NOT NULL AND access_status = 'active'`
  await sql`CREATE INDEX IF NOT EXISTS enrollments_sponsor_idx ON enrollments (sponsor_id) WHERE sponsor_id IS NOT NULL`

  await sql`
    CREATE TABLE IF NOT EXISTS access_import_batches (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      admin_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      grant_options JSONB NOT NULL,
      rows JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS course_progress (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      started BOOLEAN NOT NULL DEFAULT false,
      time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
      quiz_results JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, course_id)
    )
  `
  await ensureColumns('course_progress', {
    time_spent_seconds: 'INTEGER NOT NULL DEFAULT 0',
    quiz_results: "JSONB NOT NULL DEFAULT '{}'::jsonb",
  })

  await sql`
    CREATE TABLE IF NOT EXISTS student_lesson_progress (
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      active_seconds INTEGER NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
      video_position_seconds NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (video_position_seconds >= 0),
      last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (enrollment_id, lesson_id)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS article_help_requests (
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      section_index INTEGER NOT NULL CHECK (section_index >= 0),
      question TEXT CHECK (char_length(question) <= 1000),
      flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      question_at TIMESTAMPTZ,
      PRIMARY KEY (enrollment_id, lesson_id, section_index)
    )
  `
  await ensureColumns('article_help_requests', {
    status: "TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved'))",
    teacher_reply: 'TEXT CHECK (char_length(teacher_reply) <= 2000)',
    teacher_reply_at: 'TIMESTAMPTZ',
    resolved_at: 'TIMESTAMPTZ',
  })
  await sql`
    CREATE TABLE IF NOT EXISTS article_checkpoint_responses (
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      checkpoint_id BIGINT NOT NULL,
      selected_option INTEGER CHECK (selected_option >= 0),
      skipped BOOLEAN NOT NULL DEFAULT FALSE,
      is_correct BOOLEAN,
      answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (enrollment_id, lesson_id, checkpoint_id),
      CHECK ((skipped AND selected_option IS NULL AND is_correct IS NULL) OR (NOT skipped AND selected_option IS NOT NULL AND is_correct IS NOT NULL))
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS step_by_step_solver_sessions (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      problem_id BIGINT NOT NULL,
      current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0),
      revealed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
      follow_up_results JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS step_by_step_solver_active_session_idx ON step_by_step_solver_sessions (enrollment_id, lesson_id) WHERE is_active = TRUE`
  await sql`CREATE INDEX IF NOT EXISTS step_by_step_solver_session_history_idx ON step_by_step_solver_sessions (enrollment_id, lesson_id, created_at DESC)`
  await sql`
    CREATE TABLE IF NOT EXISTS step_by_step_solver_attempts (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      session_id BIGINT NOT NULL REFERENCES step_by_step_solver_sessions(id) ON DELETE CASCADE,
      attempt_kind TEXT NOT NULL CHECK (attempt_kind IN ('step', 'reveal', 'follow-up')),
      item_id BIGINT NOT NULL,
      answer TEXT NOT NULL DEFAULT '',
      is_correct BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS step_by_step_solver_attempt_session_idx ON step_by_step_solver_attempts (session_id, created_at)`

  await sql`
    CREATE TABLE IF NOT EXISTS class_attendance (
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
      marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (enrollment_id, lesson_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS class_session_join_logs (
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (enrollment_id, lesson_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      active_seconds INTEGER NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
      time_limit_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_limit_seconds >= 0),
      deadline_at TIMESTAMPTZ,
      answers JSONB,
      score INTEGER CHECK (score BETWEEN 0 AND 100),
      passed BOOLEAN,
      submitted_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK ((submitted_at IS NULL AND score IS NULL AND passed IS NULL) OR (submitted_at IS NOT NULL AND score IS NOT NULL AND passed IS NOT NULL))
    )
  `
  await ensureColumns('quiz_attempts', {
    time_limit_seconds: 'INTEGER NOT NULL DEFAULT 0',
    deadline_at: 'TIMESTAMPTZ',
    violations: "JSONB NOT NULL DEFAULT '[]'::jsonb",
    disqualified: 'BOOLEAN NOT NULL DEFAULT false',
    retake_approved: 'BOOLEAN NOT NULL DEFAULT false',
  })
  await sql`UPDATE quiz_attempts SET deadline_at = started_at + time_limit_seconds * INTERVAL '1 second' WHERE deadline_at IS NULL AND submitted_at IS NULL AND time_limit_seconds > 0`
  await sql`CREATE INDEX IF NOT EXISTS student_lesson_progress_enrollment_idx ON student_lesson_progress(enrollment_id, last_accessed_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS quiz_attempts_enrollment_lesson_idx ON quiz_attempts(enrollment_id, lesson_id, submitted_at DESC)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempts_one_open_attempt_idx ON quiz_attempts(enrollment_id, lesson_id) WHERE submitted_at IS NULL`

  await sql`
    CREATE TABLE IF NOT EXISTS study_plans (
      enrollment_id BIGINT PRIMARY KEY REFERENCES enrollments(id) ON DELETE CASCADE,
      lesson_order JSONB NOT NULL DEFAULT '[]'::jsonb,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS syllabus_topics (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      grade SMALLINT NOT NULL CHECK (grade IN (6, 8, 12)),
      title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
      description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
      position INTEGER NOT NULL CHECK (position >= 1),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS syllabus_topics_grade_title_idx ON syllabus_topics (grade, LOWER(title))`
  await sql`CREATE INDEX IF NOT EXISTS syllabus_topics_grade_position_idx ON syllabus_topics (grade, position)`

  await sql`
    CREATE TABLE IF NOT EXISTS gamification_activity_rewards (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_type TEXT NOT NULL CHECK (source_type IN ('lesson', 'quiz', 'live')),
      source_id TEXT NOT NULL,
      xp INTEGER NOT NULL CHECK (xp >= 0),
      points INTEGER NOT NULL CHECK (points >= 0),
      awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, source_type, source_id)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS gamification_student_stats (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
      level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
      points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
      current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
      longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS gamification_badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      criteria TEXT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS gamification_achievements (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id TEXT NOT NULL REFERENCES gamification_badges(id) ON DELETE CASCADE,
      unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, badge_id)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS gamification_challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
      xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
      points_reward INTEGER NOT NULL CHECK (points_reward >= 0),
      criteria TEXT NOT NULL DEFAULT 'lesson_today',
      sort_order INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true
    )
  `
  await ensureColumns('gamification_challenges', {
    criteria: "TEXT NOT NULL DEFAULT 'lesson_today'",
  })
  await sql`
    CREATE TABLE IF NOT EXISTS gamification_challenge_completions (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id TEXT NOT NULL REFERENCES gamification_challenges(id) ON DELETE CASCADE,
      period_key TEXT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, challenge_id, period_key)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS gamification_activity_rewards_user_idx ON gamification_activity_rewards(user_id, awarded_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS gamification_achievements_user_idx ON gamification_achievements(user_id, unlocked_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS gamification_challenge_completions_user_idx ON gamification_challenge_completions(user_id, completed_at DESC)`
  await sql`
    CREATE TABLE IF NOT EXISTS csp_violation_reports (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      document_url TEXT NOT NULL,
      violated_directive TEXT NOT NULL,
      blocked_url TEXT NOT NULL,
      source_file TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  for (const badge of gamificationBadgeSeeds) {
    await sql`
      INSERT INTO gamification_badges ${sql(badge)}
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon, description = EXCLUDED.description, criteria = EXCLUDED.criteria
    `
  }
  for (const challenge of gamificationChallengeSeeds) {
    await sql`
      INSERT INTO gamification_challenges (id, title, type, criteria, xp_reward, points_reward, sort_order)
      VALUES (${challenge.id}, ${challenge.title}, ${challenge.type}, ${challenge.criteria}, ${challenge.xpReward}, ${challenge.pointsReward}, ${challenge.sortOrder})
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, type = EXCLUDED.type, criteria = EXCLUDED.criteria, xp_reward = EXCLUDED.xp_reward, points_reward = EXCLUDED.points_reward, sort_order = EXCLUDED.sort_order
    `
  }

  for (const seedTutor of seedTutors) {
    await sql`
      INSERT INTO tutors ${sql(seedTutor)}
      ON CONFLICT (email) DO NOTHING
    `
    await sql`
      INSERT INTO users ${sql({ name: seedTutor.name, email: seedTutor.email, password_hash: await hashPassword(randomBytes(9).toString('base64url')), role: 'tutor', status: seedTutor.status === 'Active' ? 'Active' : 'Suspended' })}
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = 'tutor'
    `
  }

  await sql`
    UPDATE tutors
    SET status = 'Inactive'
    WHERE status = 'Pending'
  `

  await sql`
    UPDATE courses
    SET tutor_id = tutors.id
    FROM tutors
    WHERE courses.tutor_id IS NULL
      AND LOWER(TRIM(courses.tutor)) = LOWER(tutors.name)
  `
}

const courseColumns = sql.unsafe(`
  id::INTEGER AS id,
  title,
  cover,
  COALESCE((SELECT AVG(reviews.rating) FROM course_reviews reviews WHERE reviews.course_id = courses.id AND reviews.is_hidden = false), 0)::FLOAT AS rating,
  (SELECT COUNT(*)::INTEGER FROM course_reviews reviews WHERE reviews.course_id = courses.id AND reviews.is_hidden = false) AS "ratingCount",
  price::FLOAT AS price,
  category,
  level,
  tutor,
  status,
  students,
  description,
  long_description AS "longDescription",
  learning_outcomes AS "learningOutcomes",
  requirements,
  certificate,
  modules,
  to_char(updated_at, 'FMMonth DD, YYYY') AS "updatedAt"
`)

const courseSummaryColumns = sql.unsafe(`
  id::INTEGER AS id,
  title,
  cover,
  COALESCE((SELECT AVG(reviews.rating) FROM course_reviews reviews WHERE reviews.course_id = courses.id AND reviews.is_hidden = false), 0)::FLOAT AS rating,
  (SELECT COUNT(*)::INTEGER FROM course_reviews reviews WHERE reviews.course_id = courses.id AND reviews.is_hidden = false) AS "ratingCount",
  price::FLOAT AS price,
  category,
  level,
  description,
  COALESCE((
    SELECT jsonb_agg(DISTINCT lesson_item.lesson ->> 'type')
    FROM jsonb_array_elements(CASE WHEN jsonb_typeof(courses.modules) = 'array' THEN courses.modules ELSE '[]'::jsonb END) AS module_item(module)
    CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(module_item.module -> 'lessons') = 'array' THEN module_item.module -> 'lessons' ELSE '[]'::jsonb END) AS lesson_item(lesson)
  ), '[]'::jsonb) AS "lessonTypes"
`)

const tutorColumns = sql.unsafe(`
  id::INTEGER AS id,
  name,
  email,
  phone,
  bio,
  status,
  to_char(created_at, 'FMMonth DD, YYYY') AS "createdAt"
`)

const parseCourseId = (value) => /^\d+$/.test(value) ? Number(value) : null
const parseTutorId = (value) => /^\d+$/.test(value) ? Number(value) : null

const parseTutorPayload = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const status = body.status === undefined ? 'Active' : body.status
  const assignedCourseIds = body.assignedCourseIds === undefined ? null : body.assignedCourseIds
  const validCourseIds = Array.isArray(assignedCourseIds) && assignedCourseIds.every((id) => Number.isInteger(id) && id > 0)

  if (!name || name.length > 120 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length > 40 || bio.length > 95 || (status !== 'Active' && status !== 'Inactive') || (assignedCourseIds !== null && !validCourseIds)) {
    return null
  }

  return { name, email, phone, bio, status, assignedCourseIds }
}

const parseTutorStatus = (body) => body && typeof body === 'object' && !Array.isArray(body) && (body.status === 'Active' || body.status === 'Inactive') ? body.status : null

const addAssignedCoursesToTutors = async (tutors) => {
  if (tutors.length === 0) return []

  const tutorIds = tutors.map((tutor) => tutor.id)
  const tutorNameKeys = tutors.map((tutor) => tutor.name.toLowerCase())
  const [courses, classes] = await Promise.all([
    sql`
      SELECT id::INTEGER AS id, title, category, students, tutor_id::INTEGER AS "tutorId", LOWER(TRIM(tutor)) AS "tutorKey"
      FROM courses
      WHERE tutor_id = ANY(${tutorIds})
         OR (tutor_id IS NULL AND LOWER(TRIM(tutor)) = ANY(${tutorNameKeys}))
      ORDER BY id
    `,
    sql`
      SELECT id::INTEGER AS id, title, tutor_id::INTEGER AS "tutorId"
      FROM classes
      WHERE tutor_id = ANY(${tutorIds})
      ORDER BY id
    `,
  ])

  return tutors.map((tutor) => {
    const nameKey = tutor.name.toLowerCase()
    const assignedCourses = courses
      .filter((course) => course.tutorId === tutor.id || (course.tutorId === null && course.tutorKey === nameKey))
      .map(({ id, title, category, students }) => ({ id, title, category, students }))
    const assignedClasses = classes
      .filter((classRecord) => classRecord.tutorId === tutor.id)
      .map(({ id, title }) => ({ id, title }))
    return { ...tutor, assignedCourses, assignedCourseIds: assignedCourses.map((course) => course.id), assignedClasses }
  })
}

const addAssignedCourses = async (tutor) => (await addAssignedCoursesToTutors([tutor]))[0]

const readTutor = async (id) => {
  const [tutor] = await sql`
    SELECT ${tutorColumns}
    FROM tutors
    WHERE id = ${id}
  `
  return tutor ? addAssignedCourses(tutor) : null
}

const findTutorIdByName = async (name) => {
  const [tutor] = await sql`
    SELECT id
    FROM tutors
    WHERE LOWER(TRIM(name)) = LOWER(${name})
  `
  return tutor?.id ?? null
}

const updateTutorAssignments = async (tutorId, tutorName, assignedCourseIds, previousTutorName = '') => {
  if (assignedCourseIds === null) return
  const retainedCourses = assignedCourseIds.length ? sql`AND id NOT IN ${sql(assignedCourseIds)}` : sql``
  await sql`
    UPDATE courses
    SET tutor_id = NULL, tutor = ''
    WHERE (tutor_id = ${tutorId} OR (tutor_id IS NULL AND LOWER(TRIM(tutor)) = LOWER(${previousTutorName || tutorName})))
      ${retainedCourses}
  `
  if (assignedCourseIds.length) {
    await sql`
      UPDATE courses
      SET tutor_id = ${tutorId}, tutor = ${tutorName}
      WHERE id IN ${sql(assignedCourseIds)}
    `
  }
}

const getSessionToken = (request) => getCookieValue(request, sessionCookieName)

const recordLoginEvent = async ({ userId, email, succeeded, reason, metadata, deviceId, location }) => sql`
  INSERT INTO login_events ${sql({ user_id: userId, email, succeeded, reason, client_ip: metadata.ip, country: location.country, city: location.city, browser: metadata.browser, os: metadata.os, device_type: metadata.deviceType, device_id: deviceId })}
`

const createAuthSession = async (userId, role, request, clientHints = null) => {
  const metadata = getClientMetadata(request, clientHints)
  const location = await getGeoLocation(metadata.ip)
  const deviceId = getDeviceId(request)
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = hashToken(rawToken)
  const policy = sessionPolicyFor(role)
  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + policy.absoluteMs)
  const result = await sql.begin(async (transaction) => {
    await transaction`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`
    const previousToken = getSessionToken(request)
    if (previousToken) await transaction`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'login_rotated' WHERE token = ${hashToken(previousToken)} AND ended_at IS NULL`
    const [sameDevice] = await transaction`
      SELECT user_agent, browser_version, os_version, device_vendor, device_model, nickname
      FROM auth_sessions
      WHERE user_id = ${userId} AND device_id = ${deviceId}
      ORDER BY created_at DESC
      LIMIT 1
    `
    if (sameDevice) await transaction`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'device_relogin' WHERE user_id = ${userId} AND device_id = ${deviceId} AND ended_at IS NULL`
    const active = await transaction`
      SELECT token, device_id FROM auth_sessions
      WHERE user_id = ${userId} AND ended_at IS NULL AND idle_expires_at > NOW() AND absolute_expires_at > NOW()
      ORDER BY last_active_at ASC
      FOR UPDATE
    `
    const replacedSession = active.length >= policy.maxSessions ? active[0] : null
    if (replacedSession) await transaction`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'session_limit' WHERE token = ${replacedSession.token}`
    const reuseStoredDetails = !clientHints && sameDevice?.user_agent === metadata.userAgent
    const details = reuseStoredDetails ? {
      browser_version: sameDevice.browser_version,
      os_version: sameDevice.os_version,
      device_vendor: sameDevice.device_vendor,
      device_model: sameDevice.device_model,
    } : {
      browser_version: metadata.browserVersion,
      os_version: metadata.osVersion,
      device_vendor: metadata.deviceVendor,
      device_model: metadata.deviceModel,
    }
    await transaction`
      INSERT INTO auth_sessions ${transaction({
        token: tokenHash,
        token_hashed: true,
        user_id: userId,
        expires_at: expiresAt,
        created_at: createdAt,
        last_active_at: createdAt,
        idle_expires_at: new Date(Math.min(createdAt.getTime() + policy.idleMs, expiresAt.getTime())),
        absolute_expires_at: expiresAt,
        device_id: deviceId,
        client_ip: metadata.ip,
        country: location.country,
        city: location.city,
        browser: metadata.browser,
        os: metadata.os,
        device_type: metadata.deviceType,
        user_agent: metadata.userAgent,
        nickname: sameDevice?.nickname ?? null,
        ...details,
      })}
    `
    return { replacedSession }
  })
  if (result.replacedSession) await sql`INSERT INTO security_alerts ${sql({ user_id: userId, alert_type: 'session_limit', message: 'Your oldest session was signed out because your account reached its active-session limit.' })}`
  return { rawToken, deviceId, metadata, location }
}

const loadAuthenticatedUser = async (request, response) => {
  const rawToken = getSessionToken(request)
  if (!rawToken) return false
  const tokenHash = hashToken(rawToken)
  const [session] = await sql`
    SELECT auth_sessions.user_id AS "userId", users.role, users.must_reset_password AS "mustResetPassword", auth_sessions.token
    FROM auth_sessions
    INNER JOIN users ON users.id = auth_sessions.user_id
    WHERE auth_sessions.token = ${tokenHash}
      AND auth_sessions.ended_at IS NULL
      AND auth_sessions.idle_expires_at > NOW()
      AND auth_sessions.absolute_expires_at > NOW()
      AND users.status = 'Active'
      AND users.account_locked = false
      AND (users.locked_until IS NULL OR users.locked_until <= NOW())
  `
  if (!session) {
    if (response && getSessionToken(request)) clearSecurityCookies(response)
    return false
  }
  const policy = sessionPolicyFor(session.role)
  await sql`
    UPDATE auth_sessions
    SET last_active_at = NOW(),
        idle_expires_at = LEAST(NOW() + ${policy.idleMs} * INTERVAL '1 millisecond', absolute_expires_at),
        expires_at = LEAST(NOW() + ${policy.idleMs} * INTERVAL '1 millisecond', absolute_expires_at)
    WHERE token = ${tokenHash}
  `
  request.userId = Number(session.userId)
  request.userRole = session.role
  request.mustResetPassword = session.mustResetPassword
  request.sessionTokenHash = tokenHash
  request.sessionId = tokenHash
  response?.append('Set-Cookie', `${sessionCookieName}=${rawToken}; HttpOnly; Secure; Path=/; SameSite=None; Partitioned; Max-Age=${Math.floor(policy.idleMs / 1000)}`)
  return true
}

const createSecurityAlert = async (userId, alertType, message, metadata = {}) => sql`
  INSERT INTO security_alerts ${sql({ user_id: userId, alert_type: alertType, message, metadata })}
`

const recordAuthenticationAttempt = async ({ user, email, succeeded, reason, request }) => {
  const metadata = getClientMetadata(request)
  const deviceId = getDeviceId(request)
  const location = await getGeoLocation(metadata.ip)
  await recordLoginEvent({ userId: user?.id ?? null, email: email.slice(0, 254), succeeded, reason, metadata, deviceId, location })
  if (!succeeded) {
    const [ipFailure] = await sql`
      SELECT COUNT(*)::INTEGER AS count FROM login_events
      WHERE client_ip = ${metadata.ip} AND succeeded = false AND created_at > NOW() - INTERVAL '15 minutes'
    `
    const [accountFailure] = await sql`
      SELECT COUNT(*)::INTEGER AS count FROM login_events
      WHERE email = ${email.slice(0, 254)} AND succeeded = false AND created_at > NOW() - INTERVAL '15 minutes'
    `
    if (user && accountFailure.count >= 5) {
      const [locked] = await sql`UPDATE users SET locked_until = NOW() + INTERVAL '15 minutes' WHERE id = ${user.id} AND (locked_until IS NULL OR locked_until <= NOW()) RETURNING id`
      if (locked) await createSecurityAlert(user.id, 'account_locked', 'Your account was temporarily locked after repeated unsuccessful sign-in attempts.')
    }
    return { metadata, deviceId, location, ipLimited: ipFailure.count >= 30, accountFailureCount: accountFailure.count }
  }
  const [knownDevice] = await sql`
    SELECT EXISTS(SELECT 1 FROM login_events WHERE user_id = ${user.id} AND device_id = ${deviceId} AND succeeded = true AND id <> (SELECT MAX(id) FROM login_events WHERE user_id = ${user.id})) AS known
  `
  const [previousLogin] = await sql`
    SELECT country FROM login_events
    WHERE user_id = ${user.id} AND succeeded = true AND id <> (SELECT MAX(id) FROM login_events WHERE user_id = ${user.id})
    ORDER BY created_at DESC LIMIT 1
  `
  if (!knownDevice.known) await createSecurityAlert(user.id, 'new_device', 'A sign-in from a new device was detected.', { browser: metadata.browser, os: metadata.os, deviceType: metadata.deviceType })
  if (location.country && previousLogin?.country && location.country !== previousLogin.country) await createSecurityAlert(user.id, 'new_country', 'A sign-in from a new country was detected.', { country: location.country })
  const [recentCountries] = await sql`
    SELECT COUNT(DISTINCT country)::INTEGER AS count FROM login_events
    WHERE user_id = ${user.id} AND succeeded = true AND country IS NOT NULL AND created_at > NOW() - INTERVAL '1 hour'
  `
  const [recentDevices] = await sql`
    SELECT COUNT(DISTINCT device_id)::INTEGER AS count FROM login_events
    WHERE user_id = ${user.id} AND succeeded = true AND created_at > NOW() - INTERVAL '24 hours'
  `
  if (recentCountries.count >= 2) await createSecurityAlert(user.id, 'multiple_countries', 'Successful sign-ins from multiple countries were detected within a short period.', { window: '1 hour' })
  if (recentCountries.count >= 3 || recentDevices.count >= 5) await createSecurityAlert(user.id, 'possible_account_sharing', 'Unusual sign-in activity may indicate account sharing. This alert is for administrator review only.', { countries: recentCountries.count, devices: recentDevices.count })
  return { metadata, deviceId, location, ipLimited: false, accountFailureCount: 0 }
}

const writeAdminAudit = async (request, action, targetUserId, beforeState, afterState) => {
  const metadata = getClientMetadata(request)
  await sql`
    INSERT INTO admin_audit_log ${sql({ actor_user_id: request.userId, action, target_user_id: targetUserId, before_state: beforeState, after_state: afterState, client_ip: metadata.ip })}
  `
}

const rotateAuthenticatedSession = async (request, response, reason) => {
  await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = ${reason} WHERE user_id = ${request.userId} AND ended_at IS NULL`
  request.securityDeviceId = getDeviceId(request)
  const session = await createAuthSession(request.userId, request.userRole, request)
  setSecurityCookies(response, session.rawToken, session.deviceId, request.userRole)
}

const verifySecondFactor = async (userId, code) => {
  const normalizedCode = String(code ?? '').trim()
  return sql.begin(async (transaction) => {
    const [record] = await transaction`SELECT encrypted_secret, backup_code_hashes FROM two_factor_secrets WHERE user_id = ${userId} AND enabled_at IS NOT NULL FOR UPDATE`
    if (!record) return false
    if (verifyTotp(decryptTotpSecret(record.encrypted_secret), normalizedCode)) return true
    const backupHashes = Array.isArray(record.backup_code_hashes) ? record.backup_code_hashes : []
    const suppliedHash = hashBackupCode(normalizedCode)
    if (!backupHashes.includes(suppliedHash)) return false
    await transaction`UPDATE two_factor_secrets SET backup_code_hashes = ${JSON.stringify(backupHashes.filter((hash) => hash !== suppliedHash))}::jsonb, updated_at = NOW() WHERE user_id = ${userId}`
    return true
  })
}

const requireAuthenticated = async (request, response, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.get('origin')
    if (origin) {
      try {
        if (new URL(origin).host !== request.get('host')) return response.status(403).json({ message: 'Request origin is not allowed.' })
      } catch {
        return response.status(403).json({ message: 'Request origin is not allowed.' })
      }
    }
    if (request.get('sec-fetch-site') === 'cross-site') return response.status(403).json({ message: 'Request origin is not allowed.' })
  }
  if (!await loadAuthenticatedUser(request, response)) return response.status(401).json({ message: 'Authentication is required.' })
  if (request.mustResetPassword && request.path !== '/api/auth/change-password' && !request.path.startsWith('/api/auth/security/')) return response.status(403).json({ message: 'A password change is required before using this account.' })
  return next()
}

const requireAdmin = async (request, response, next) => {
  await requireAuthenticated(request, response, () => {
    if (request.userRole !== 'admin') return response.status(403).json({ message: 'Admin access is required.' })
    return next()
  })
}

const requireAdminOrTutor = async (request, response, next) => {
  await requireAuthenticated(request, response, () => {
    if (request.userRole !== 'admin' && request.userRole !== 'tutor') return response.status(403).json({ message: 'Admin or tutor authentication is required.' })
    return next()
  })
}

const requireTutor = async (request, response, next) => {
  await requireAuthenticated(request, response, async () => {
    if (request.userRole !== 'tutor') return response.status(403).json({ message: 'Tutor authentication is required.' })
    const [tutor] = await sql`
      SELECT tutors.id::INTEGER AS id,
             tutors.name,
             tutors.email,
             tutors.phone,
             tutors.bio,
             tutors.status,
             to_char(tutors.created_at, 'FMMonth DD, YYYY') AS "createdAt"
      FROM tutors
      INNER JOIN users ON LOWER(TRIM(users.email)) = LOWER(TRIM(tutors.email))
      WHERE users.id = ${request.userId}
        AND users.role = 'tutor'
    `
    if (!tutor) return response.status(403).json({ message: 'Tutor profile not found.' })
    request.tutor = await addAssignedCourses(tutor)
    request.tutorId = Number(tutor.id)
    return next()
  })
}

const isValidTutorProfile = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const profile = {}
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 120) return null
    profile.name = body.name.trim()
  }
  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string' || body.phone.trim().length > 40) return null
    profile.phone = body.phone.trim()
  }
  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string' || body.bio.trim().length > 2000) return null
    profile.bio = body.bio.trim()
  }
  return Object.keys(profile).length ? profile : null
}

const isValidUserProfile = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  if (!name || name.length > 120 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length > 40) return null
  return { name, email, phone }
}

const isValidCourseCover = (cover) => cover.length <= 10 * 1024 * 1024 && (cover.startsWith('/') || /^https?:\/\//i.test(cover) || /^data:image\/(?:avif|gif|jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(cover))

const bookstoreDownloadMimeTypes = new Set([
  'application/pdf',
  'application/epub+zip',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const parseBookstoreFile = (fileData, fileName) => {
  if (typeof fileData !== 'string' || typeof fileName !== 'string') return null
  const match = fileData.match(/^data:([A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+);base64,([A-Za-z0-9+/=]+)$/)
  const safeFileName = fileName.trim().replace(/[\r\n"]/g, '')
  if (!match || !bookstoreDownloadMimeTypes.has(match[1].toLowerCase()) || !safeFileName || safeFileName.length > 255 || /[\\/]/.test(safeFileName)) return null
  const content = Buffer.from(match[2], 'base64')
  if (!content.length || content.length > 20 * 1024 * 1024) return null
  return { content, fileName: safeFileName, mimeType: match[1].toLowerCase() }
}

const parseBookstorePayload = (body, requireFile) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const coverData = typeof body.coverData === 'string' ? body.coverData.trim() : ''
  const price = Number(body.price)
  const published = body.published
  const hasFileFields = body.fileData !== undefined || body.fileName !== undefined
  const file = hasFileFields ? parseBookstoreFile(body.fileData, body.fileName) : null
  if (!title || title.length > 31 || description.length > 192 || !category || category.length > 16 || !isValidCourseCover(coverData) || !Number.isFinite(price) || price < 0 || typeof published !== 'boolean' || (requireFile && !file) || (hasFileFields && !file)) return null
  return { title, description, category, price, cover_data: coverData, published, file }
}

const bookstoreItemColumns = sql.unsafe(`
  id::INTEGER AS id,
  title,
  description,
  category,
  price::FLOAT AS price,
  currency,
  cover_data AS "coverData",
  published,
  download_file_name AS "fileName",
  download_size_bytes::INTEGER AS "fileSizeBytes",
  (SELECT COUNT(*)::INTEGER FROM bookstore_downloads WHERE bookstore_downloads.bookstore_item_id = bookstore_items.id) AS "downloadCount",
  to_char(updated_at, 'Mon DD, YYYY') AS "updatedAt"
`)

const readBookstoreItem = async (id) => {
  const [item] = await sql`SELECT ${bookstoreItemColumns} FROM bookstore_items WHERE id = ${id}`
  return item ?? null
}

const parseCoursePayload = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const level = typeof body.level === 'string' ? body.level.trim() : ''
  const tutor = typeof body.tutor === 'string' ? body.tutor.trim() : ''
  const cover = typeof body.cover === 'string' ? body.cover.trim() : ''
  const status = body.status === 'Published' || body.status === 'Draft' ? body.status : null
  const price = Number(body.price)
  const students = Number(body.students)
  const learningOutcomes = Array.isArray(body.learningOutcomes) && body.learningOutcomes.every((value) => typeof value === 'string') ? body.learningOutcomes : null
  const requirements = Array.isArray(body.requirements) && body.requirements.every((value) => typeof value === 'string') ? body.requirements : null
  const modules = Array.isArray(body.modules) ? body.modules : null
  const courseLessons = modules ? getCourseLessons(modules) : []
  const hasInvalidSolverLesson = courseLessons.some((lesson) => lesson?.type === 'stepByStepSolver' && !isValidStepByStepSolverConfig(lesson.stepByStepSolver))
  const hasLiveLesson = courseLessons.some((lesson) => lesson?.type === 'live')

  if (!title || !category || !level || !isValidCourseCover(cover) || !status || !Number.isFinite(price) || price < 0 || !Number.isInteger(students) || students < 0 || !learningOutcomes || !requirements || !modules || hasInvalidSolverLesson || hasLiveLesson || typeof body.description !== 'string' || typeof body.longDescription !== 'string' || typeof body.certificate !== 'boolean') {
    return null
  }

  return {
    title,
    cover,
    price,
    category,
    level,
    tutor,
    status,
    students,
    description: body.description,
    long_description: body.longDescription,
    learning_outcomes: JSON.stringify(learningOutcomes),
    requirements: JSON.stringify(requirements),
    certificate: body.certificate,
    modules: JSON.stringify(modules),
  }
}

const deserializeJson = (value) => typeof value === 'string' ? JSON.parse(value) : value

const isClassEnrollmentClosed = (schedule) => {
  const startDate = typeof schedule?.startDate === 'string' ? schedule.startDate.trim() : ''
  if (!startDate) return false
  const timestamp = Date.parse(/^\\d{4}-\\d{2}-\\d{2}$/.test(startDate) ? `${startDate}T00:00:00` : startDate)
  return Number.isFinite(timestamp) && timestamp < Date.now()
}

const deserializeCourse = (course) => course ? {
  ...course,
  learningOutcomes: deserializeJson(course.learningOutcomes),
  requirements: deserializeJson(course.requirements),
  modules: deserializeJson(course.modules),
} : null

const getCourseLessons = (modules) => Array.isArray(modules)
  ? modules.flatMap((module) => Array.isArray(module?.lessons) ? module.lessons : [])
  : []

const sanitizeModulesForLearner = (modules) => Array.isArray(modules)
  ? modules.map((module) => ({
    ...module,
    lessons: Array.isArray(module?.lessons)
      ? module.lessons.map(({ quizQuestions, stepByStepSolver, articleCheckpoints, ...lesson }) => ({
        ...lesson,
        quizQuestions: Array.isArray(quizQuestions)
          ? quizQuestions.map(({ correctOption, ...question }) => question)
          : quizQuestions,
        ...(lesson.type === 'stepByStepSolver' ? { stepByStepSolver: { problems: (stepByStepSolver?.problems ?? []).map(({ id, prompt }) => ({ id, prompt })) } } : {}),
        ...(Array.isArray(articleCheckpoints) ? { articleCheckpoints: articleCheckpoints.map(({ id, question, options }) => ({ id, question, options })) } : {}),
      }))
      : [],
  }))
  : []

const sanitizeCourseForLearner = (course) => course ? {
  ...course,
  modules: sanitizeModulesForLearner(course.modules),
} : null

const parseEnrollmentId = (value) => /^\d+$/.test(value) ? Number(value) : null
const maxEngagementSeconds = 60

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const getEnrollmentProgress = (modules, lessonProgress) => {
  const lessons = getCourseLessons(modules).filter((lesson) => lesson.type !== 'practice')
  const completedLessonIds = lessons
    .filter((lesson) => lessonProgress?.[lesson.id]?.completedAt)
    .map((lesson) => lesson.id)
  const allCompletedLessonIds = lessons
    .map((lesson) => lesson.id)
    .filter((lessonId) => completedLessonIds.includes(lessonId))

  return {
    completedLessonIds: allCompletedLessonIds,
    progressPercentage: Math.round((allCompletedLessonIds.length / Math.max(1, lessons.length)) * 100),
  }
}

const normalizeQuizAnswers = (answers, questions) => {
  const parsedAnswers = deserializeJson(answers)
  if (!isPlainObject(parsedAnswers)) return {}
  const questionIds = new Set(questions.map((question) => String(question.id)))
  const hasQuestionId = (value) => questionIds.has(value)
  const directAnswers = Object.fromEntries(Object.entries(parsedAnswers).filter(([id]) => hasQuestionId(id)))
  if (Object.keys(directAnswers).length > 0) return directAnswers
  for (const key of ['answers', 'responses']) {
    const nestedAnswers = deserializeJson(parsedAnswers[key])
    if (!isPlainObject(nestedAnswers)) continue
    const matchingAnswers = Object.fromEntries(Object.entries(nestedAnswers).filter(([id]) => hasQuestionId(id)))
    if (Object.keys(matchingAnswers).length > 0) return matchingAnswers
  }
  return directAnswers
}

const getQuestionResults = (modules, attempt) => {
  if (!attempt?.submittedAt) return undefined
  const questions = getCourseLessons(modules).find((lesson) => lesson?.id === attempt.lessonId)?.quizQuestions ?? []
  const answers = normalizeQuizAnswers(attempt.answers, questions)
  return questions.map((question) => {
    const rawRecord = answers[String(question.id)]
    const record = Number.isInteger(rawRecord) ? { status: 'answered', value: rawRecord } : rawRecord
    const selected = selectedOptionFromRecord(record, question)
    const studentAnswer = typeof record?.value === 'string'
      ? record.value
      : Array.isArray(record?.value)
        ? record.value.join(', ')
        : selected === null
          ? null
          : question.options[selected] ?? null
    return { questionId: Number(question.id), question: question.question, studentAnswer, correctAnswer: question.options[question.correctOption] ?? null, status: record?.status ?? 'unanswered' }
  })
}

const getTopicPerformance = (modules, quizAttempts, practiceAnswers) => {
  const topics = new Map()
  const addAnswer = (topic, correct) => {
    const label = typeof topic === 'string' ? topic.trim() : ''
    if (!label) return
    const key = label.toLocaleLowerCase()
    const current = topics.get(key) ?? { topic: label, correct: 0, total: 0 }
    current.correct += correct ? 1 : 0
    current.total += 1
    topics.set(key, current)
  }
  const lessons = getCourseLessons(modules)
  for (const attempt of getLatestSubmittedQuizAttempts(quizAttempts.filter((item) => !item.disqualified))) {
    const questions = lessons.find((lesson) => lesson?.id === attempt.lessonId)?.quizQuestions ?? []
    const answers = normalizeQuizAnswers(attempt.answers, questions)
    for (const question of questions) {
      const selectedOption = selectedOptionFromRecord(answers[String(question.id)], question)
      if (selectedOption !== null) addAnswer(question.topic, selectedOption === question.correctOption)
    }
  }
  const courseTopics = new Set(lessons.flatMap((lesson) => [
    ...(lesson.quizQuestions ?? []).map((question) => question.topic),
    ...(lesson.practiceQuestions ?? []).map((question) => question.topic),
  ]).filter((topic) => typeof topic === 'string').map((topic) => topic.trim().toLocaleLowerCase()))
  for (const answer of Array.isArray(practiceAnswers) ? practiceAnswers : []) {
    if (courseTopics.has(String(answer.topic ?? '').trim().toLocaleLowerCase())) addAnswer(answer.topic, answer.correct)
  }
  return [...topics.values()].map((area) => ({
    ...area,
    accuracy: Math.round((area.correct / area.total) * 100),
    practiceLessons: lessons.filter((lesson) => lesson.type === 'practice' && (lesson.practiceQuestions ?? []).some((question) => question.topic?.trim().toLocaleLowerCase() === area.topic.toLocaleLowerCase())).map((lesson) => ({ lessonId: Number(lesson.id), lessonTitle: lesson.title })),
  }))
}

const getWeakAreas = (modules, quizAttempts, practiceAnswers) => getTopicPerformance(modules, quizAttempts, practiceAnswers)
  .filter((area) => area.accuracy < 60)
  .sort((first, second) => first.accuracy - second.accuracy || first.topic.localeCompare(second.topic))

const getAdminWeakAreas = async (classId = null) => {
  const classCondition = classId === null ? sql`` : sql`AND enrollments.class_id = ${classId}`
  const records = await sql`
    SELECT enrollments.student_id AS "studentId",
           CASE WHEN classes.id IS NULL THEN courses.modules ELSE classes.modules END AS modules,
           quiz_summary."quizAttempts",
           practice_summary."practiceAnswers"
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
               'lessonId', lesson_id,
               'answers', COALESCE(answers, '{}'::jsonb),
               'submittedAt', submitted_at
             )), '[]'::jsonb) AS "quizAttempts"
      FROM quiz_attempts
      WHERE enrollment_id = enrollments.id
    ) AS quiz_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('topic', topic, 'correct', correct)), '[]'::jsonb) AS "practiceAnswers"
      FROM practice_answers
      WHERE enrollment_id = enrollments.id
    ) AS practice_summary ON true

    WHERE enrollments.class_id IS NOT NULL
      AND classes.published = true
      AND enrollments.class_status = 'enrolled'
      ${classCondition}
  `
  const topics = new Map()
  for (const record of records) {
    const areas = getTopicPerformance(deserializeJson(record.modules) ?? [], deserializeJson(record.quizAttempts) ?? [], deserializeJson(record.practiceAnswers) ?? [])
    for (const area of areas) {
      const key = area.topic.toLocaleLowerCase()
      const current = topics.get(key) ?? { topic: area.topic, correct: 0, total: 0, affectedStudentIds: new Set() }
      current.correct += area.correct
      current.total += area.total
      if (area.accuracy < 60) current.affectedStudentIds.add(Number(record.studentId))
      topics.set(key, current)
    }
  }
  return [...topics.values()]
    .map(({ affectedStudentIds, ...area }) => ({ ...area, accuracy: Math.round((area.correct / area.total) * 100), affectedStudents: affectedStudentIds.size }))
    .filter((area) => area.accuracy < 60)
    .sort((first, second) => first.accuracy - second.accuracy || second.affectedStudents - first.affectedStudents || first.topic.localeCompare(second.topic))
    .slice(0, 5)
}

const serializeEnrollment = (enrollment) => {
  const modules = deserializeJson(enrollment.modules)
  const learningOutcomes = deserializeJson(enrollment.learningOutcomes)
  const rawLessonProgress = deserializeJson(enrollment.lessonProgress)
  const rawQuizAttempts = deserializeJson(enrollment.quizAttempts)
  const quizAttempts = Array.isArray(rawQuizAttempts) ? rawQuizAttempts.map((attempt) => ({ ...attempt, questionResults: getQuestionResults(modules, attempt) })) : []
  const practiceAnswers = deserializeJson(enrollment.practiceAnswers)
  const lessonProgress = isPlainObject(rawLessonProgress) ? rawLessonProgress : {}
  const { completedLessonIds, progressPercentage } = getEnrollmentProgress(modules, lessonProgress)

  return {
    ...enrollment,
    learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes.filter((outcome) => typeof outcome === 'string') : [],
    modules: sanitizeModulesForLearner(modules),
    classSchedule: isPlainObject(deserializeJson(enrollment.classSchedule)) ? deserializeJson(enrollment.classSchedule) : null,
    lessonProgress,
    quizAttempts,
    weakAreas: getWeakAreas(modules, quizAttempts, practiceAnswers),
    completedLessonIds,
    started: Object.keys(lessonProgress).length > 0,
    timeSpentSeconds: Number(enrollment.timeSpentSeconds) || 0,
    attendance: deserializeJson(enrollment.attendance) ?? {},
    progressPercentage,
    studyPlanOrder: deserializeJson(enrollment.studyPlanOrder) ?? null,
  }
}

const gamificationLevelThresholds = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3400]
const getGamificationLevelInfo = (xp) => {
  let levelIndex = 0
  gamificationLevelThresholds.forEach((threshold, index) => {
    if (xp >= threshold) levelIndex = index
  })
  const currentThreshold = gamificationLevelThresholds[levelIndex]
  const nextThreshold = gamificationLevelThresholds[levelIndex + 1] ?? currentThreshold + (levelIndex + 2) * 600
  return {
    level: levelIndex + 1,
    nextLevelXp: nextThreshold,
    progress: Math.min(100, ((xp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)) * 100),
  }
}

const getDateKey = (value) => new Date(value).toISOString().slice(0, 10)
const getGamificationStreak = (activityDates) => {
  const activeDays = new Set(activityDates.filter(Boolean).map(getDateKey))
  const today = new Date()
  const todayKey = getDateKey(today)
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = getDateKey(yesterday)
  let current = 0
  if (activeDays.has(todayKey) || activeDays.has(yesterdayKey)) {
    const cursor = new Date(activeDays.has(todayKey) ? today : yesterday)
    while (activeDays.has(getDateKey(cursor))) {
      current += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }
  }

  const sortedDays = [...activeDays].sort()
  let longest = 0
  let run = 0
  sortedDays.forEach((day, index) => {
    const previous = sortedDays[index - 1]
    const difference = previous
      ? (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86400000
      : null
    run = difference === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  })
  return { current, longest }
}

const syncGamificationActivity = async () => {
  await sql`
    DELETE FROM gamification_activity_rewards rewards
    USING class_attendance attendance
    WHERE rewards.source_type = 'live'
      AND rewards.user_id = (SELECT user_id FROM enrollments WHERE id = attendance.enrollment_id)
      AND rewards.source_id = attendance.enrollment_id::TEXT || ':' || attendance.lesson_id::TEXT
      AND attendance.status <> 'Present'
  `
  await sql`
    INSERT INTO gamification_activity_rewards (user_id, source_type, source_id, xp, points, awarded_at)
    SELECT enrollments.user_id,
           'lesson',
           enrollments.id::TEXT || ':' || progress.lesson_id::TEXT,
           25,
           10,
           progress.completed_at
    FROM enrollments
    INNER JOIN student_lesson_progress progress ON progress.enrollment_id = enrollments.id
    WHERE progress.completed_at IS NOT NULL
    ON CONFLICT (user_id, source_type, source_id) DO NOTHING
  `
  await sql`
    INSERT INTO gamification_activity_rewards (user_id, source_type, source_id, xp, points, awarded_at)
    SELECT passed_attempts.user_id,
           'quiz',
           passed_attempts.enrollment_id::TEXT || ':' || passed_attempts.lesson_id::TEXT,
           50,
           20,
           passed_attempts.submitted_at
    FROM (
      SELECT DISTINCT ON (enrollments.user_id, quiz_attempts.enrollment_id, quiz_attempts.lesson_id)
             enrollments.user_id,
             quiz_attempts.enrollment_id,
             quiz_attempts.lesson_id,
             quiz_attempts.submitted_at
      FROM quiz_attempts
      INNER JOIN enrollments ON enrollments.id = quiz_attempts.enrollment_id
      WHERE quiz_attempts.passed = true
        AND quiz_attempts.submitted_at IS NOT NULL
      ORDER BY enrollments.user_id, quiz_attempts.enrollment_id, quiz_attempts.lesson_id, quiz_attempts.submitted_at
    ) AS passed_attempts
    ON CONFLICT (user_id, source_type, source_id) DO NOTHING
  `
  await sql`
    INSERT INTO gamification_activity_rewards (user_id, source_type, source_id, xp, points, awarded_at)
    SELECT enrollments.user_id,
           'live',
           attendance.enrollment_id::TEXT || ':' || attendance.lesson_id::TEXT,
           40,
           15,
           attendance.marked_at
    FROM class_attendance attendance
    INNER JOIN enrollments ON enrollments.id = attendance.enrollment_id
    WHERE attendance.status = 'Present'
    ON CONFLICT (user_id, source_type, source_id) DO NOTHING
  `
}

const isGamificationChallengeComplete = async (userId, criteria) => {
  if (criteria === 'lesson_today') {
    const [result] = await sql`SELECT EXISTS (SELECT 1 FROM student_lesson_progress progress INNER JOIN enrollments ON enrollments.id = progress.enrollment_id WHERE enrollments.user_id = ${userId} AND progress.completed_at >= CURRENT_DATE) AS fulfilled`
    return result.fulfilled
  }
  if (criteria === 'quiz_today') {
    const [result] = await sql`SELECT EXISTS (SELECT 1 FROM quiz_attempts attempts INNER JOIN enrollments ON enrollments.id = attempts.enrollment_id WHERE enrollments.user_id = ${userId} AND attempts.passed = true AND attempts.submitted_at >= CURRENT_DATE) AS fulfilled`
    return result.fulfilled
  }
  if (criteria === 'live_today') {
    const [result] = await sql`SELECT EXISTS (SELECT 1 FROM class_attendance attendance INNER JOIN enrollments ON enrollments.id = attendance.enrollment_id WHERE enrollments.user_id = ${userId} AND attendance.status = 'Present' AND attendance.marked_at >= CURRENT_DATE) AS fulfilled`
    return result.fulfilled
  }
  if (criteria === 'live_week') {
    const [result] = await sql`SELECT COUNT(*) >= 2 AS fulfilled FROM class_attendance attendance INNER JOIN enrollments ON enrollments.id = attendance.enrollment_id WHERE enrollments.user_id = ${userId} AND attendance.status = 'Present' AND attendance.marked_at >= date_trunc('week', CURRENT_DATE)`
    return result.fulfilled
  }
  const [result] = await sql`SELECT COUNT(*) >= 3 AS fulfilled FROM student_lesson_progress progress INNER JOIN enrollments ON enrollments.id = progress.enrollment_id WHERE enrollments.user_id = ${userId} AND progress.completed_at >= date_trunc('week', CURRENT_DATE)`
  return result.fulfilled
}

const syncGamificationForUser = async (userId) => {
  const challenges = await sql`
    SELECT id, title, type, criteria, xp_reward AS "xpReward", points_reward AS "pointsReward"
    FROM gamification_challenges
    WHERE active = true
    ORDER BY type, sort_order
  `
  const dailyChallenges = challenges.filter((challenge) => challenge.type === 'daily')
  const weeklyChallenges = challenges.filter((challenge) => challenge.type === 'weekly')
  const dayIndex = Math.floor(Date.now() / 86400000)
  const selectedChallenges = [
    dailyChallenges[dayIndex % dailyChallenges.length],
    dailyChallenges[(dayIndex + 1) % dailyChallenges.length],
    weeklyChallenges[Math.floor(dayIndex / 7) % weeklyChallenges.length],
  ].filter(Boolean)
  const [periods] = await sql`SELECT CURRENT_DATE::TEXT AS today, date_trunc('week', CURRENT_DATE)::DATE::TEXT AS week`
  const challengeResults = []
  for (const challenge of selectedChallenges) {
    const periodKey = challenge.type === 'daily' ? periods.today : periods.week
    const fulfilled = await isGamificationChallengeComplete(userId, challenge.criteria)
    if (fulfilled) {
      await sql`
        INSERT INTO gamification_challenge_completions (user_id, challenge_id, period_key)
        VALUES (${userId}, ${challenge.id}, ${periodKey})
        ON CONFLICT (user_id, challenge_id, period_key) DO NOTHING
      `
    }
    const [completion] = await sql`
      SELECT completed_at AS "completedAt"
      FROM gamification_challenge_completions
      WHERE user_id = ${userId} AND challenge_id = ${challenge.id} AND period_key = ${periodKey}
    `
    challengeResults.push({ ...challenge, completed: Boolean(completion), completedAt: completion?.completedAt ?? null })
  }

  const [statsTotals] = await sql`
    SELECT COALESCE(SUM(rewards.xp), 0)::INTEGER AS xp,
           COALESCE(SUM(rewards.points), 0)::INTEGER AS points
    FROM (
      SELECT xp, points FROM gamification_activity_rewards WHERE user_id = ${userId}
      UNION ALL
      SELECT challenges.xp_reward AS xp, challenges.points_reward AS points
      FROM gamification_challenge_completions completions
      INNER JOIN gamification_challenges challenges ON challenges.id = completions.challenge_id
      WHERE completions.user_id = ${userId}
    ) AS rewards
  `
  const activityDates = await sql`
    SELECT progress.completed_at AS "activityDate"
    FROM student_lesson_progress progress
    INNER JOIN enrollments ON enrollments.id = progress.enrollment_id
    WHERE enrollments.user_id = ${userId} AND progress.completed_at IS NOT NULL
    UNION ALL
    SELECT attempts.submitted_at AS "activityDate"
    FROM quiz_attempts attempts
    INNER JOIN enrollments ON enrollments.id = attempts.enrollment_id
    WHERE enrollments.user_id = ${userId} AND attempts.passed = true AND attempts.submitted_at IS NOT NULL
    UNION ALL
    SELECT attendance.marked_at AS "activityDate"
    FROM class_attendance attendance
    INNER JOIN enrollments ON enrollments.id = attendance.enrollment_id
    WHERE enrollments.user_id = ${userId} AND attendance.status = 'Present'
  `
  const streak = getGamificationStreak(activityDates.map((activity) => activity.activityDate))
  const level = getGamificationLevelInfo(Number(statsTotals.xp))
  await sql`
    INSERT INTO gamification_student_stats (user_id, xp, level, points, current_streak, longest_streak)
    VALUES (${userId}, ${statsTotals.xp}, ${level.level}, ${statsTotals.points}, ${streak.current}, ${streak.longest})
    ON CONFLICT (user_id) DO UPDATE SET xp = EXCLUDED.xp, level = EXCLUDED.level, points = EXCLUDED.points, current_streak = EXCLUDED.current_streak, longest_streak = EXCLUDED.longest_streak, updated_at = NOW()
  `

  const [courseMilestone] = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM enrollments
      LEFT JOIN courses ON courses.id = enrollments.course_id
      LEFT JOIN classes ON classes.id = enrollments.class_id
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(CASE WHEN enrollments.class_id IS NULL THEN courses.modules ELSE classes.modules END) = 'array'
          THEN CASE WHEN enrollments.class_id IS NULL THEN courses.modules ELSE classes.modules END
          ELSE '[]'::jsonb END
      ) AS modules
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(modules.value->'lessons') = 'array' THEN modules.value->'lessons' ELSE '[]'::jsonb END
      ) AS lessons
      LEFT JOIN student_lesson_progress progress ON progress.enrollment_id = enrollments.id AND progress.lesson_id = (lessons.value->>'id')::BIGINT
      WHERE enrollments.user_id = ${userId}
      GROUP BY enrollments.id
      HAVING COUNT(*) > 0 AND COUNT(*) FILTER (WHERE progress.completed_at IS NOT NULL) = COUNT(*)
    ) AS completed
  `
  const [attendanceMilestone] = await sql`
    SELECT COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE attendance.status = 'Present')::INTEGER AS present
    FROM enrollments
    INNER JOIN classes ON classes.id = enrollments.class_id
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(classes.modules) = 'array' THEN classes.modules ELSE '[]'::jsonb END
    ) AS modules
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(modules.value->'lessons') = 'array' THEN modules.value->'lessons' ELSE '[]'::jsonb END
    ) AS lessons
    LEFT JOIN class_attendance attendance ON attendance.enrollment_id = enrollments.id AND attendance.lesson_id = (lessons.value->>'id')::BIGINT
    WHERE enrollments.user_id = ${userId} AND enrollments.class_status = 'enrolled' AND lessons.value->>'type' = 'live'
  `
  const [lessonMilestone] = await sql`SELECT COUNT(*)::INTEGER AS total FROM gamification_activity_rewards WHERE user_id = ${userId} AND source_type = 'lesson'`
  const [quizMilestone] = await sql`SELECT COUNT(*)::INTEGER AS total FROM gamification_activity_rewards WHERE user_id = ${userId} AND source_type = 'quiz'`
  const [activityCounts] = await sql`
    SELECT COUNT(*) FILTER (WHERE source_type = 'lesson')::INTEGER AS "lessonCount",
           COUNT(*) FILTER (WHERE source_type = 'quiz')::INTEGER AS "quizCount",
           COUNT(*) FILTER (WHERE source_type = 'live')::INTEGER AS "liveCount"
    FROM gamification_activity_rewards
    WHERE user_id = ${userId}
  `
  const badgeUnlocks = [
    ['first-quiz-passed', Number(quizMilestone.total) > 0],
    ['seven-day-streak', streak.longest >= 7],
    ['perfect-attendance', Number(attendanceMilestone.total) > 0 && Number(attendanceMilestone.total) === Number(attendanceMilestone.present)],
    ['course-completed', courseMilestone.completed],
    ['lesson-momentum', Number(lessonMilestone.total) >= 10],
  ]
  for (const [badgeId, unlocked] of badgeUnlocks) {
    if (unlocked) {
      await sql`
        INSERT INTO gamification_achievements (user_id, badge_id)
        VALUES (${userId}, ${badgeId})
        ON CONFLICT (user_id, badge_id) DO NOTHING
      `
    }
  }

  return { stats: { student_id: Number(userId), xp: Number(statsTotals.xp), level: level.level, points: Number(statsTotals.points), current_streak: streak.current, longest_streak: streak.longest, next_level_xp: level.nextLevelXp, level_progress: level.progress, lesson_count: Number(activityCounts.lessonCount), quiz_count: Number(activityCounts.quizCount), live_count: Number(activityCounts.liveCount) }, challengeResults }
}

const readCourse = async (id, publishedOnly = false) => {
  const [course] = await sql`
    SELECT ${courseColumns}
    FROM courses
    WHERE id = ${id} ${publishedOnly ? sql`AND status = 'Published'` : sql``}
  `
  return deserializeCourse(course)
}

const parseEnrollmentStudents = (value) => {
  if (!Array.isArray(value) || !value.length || value.length > 10) return null
  const students = value.map((student) => {
    if (!student || typeof student !== 'object' || Array.isArray(student)) return null
    const fullName = typeof student.fullName === 'string' ? student.fullName.trim() : ''
    const ageOrGrade = typeof student.ageOrGrade === 'string' ? student.ageOrGrade.trim() : ''
    const relationship = student.relationship
    const preferredLanguage = typeof student.preferredLanguage === 'string' ? student.preferredLanguage.trim() : ''
    const emergencyPhone = typeof student.emergencyPhone === 'string' ? student.emergencyPhone.trim() : ''
    const notes = typeof student.notes === 'string' ? student.notes.trim() : ''
    if (!fullName || fullName.length > 120 || !ageOrGrade || ageOrGrade.length > 80 || !['Parent', 'Guardian', 'Self'].includes(relationship) || !preferredLanguage || preferredLanguage.length > 80 || emergencyPhone.length > 50 || notes.length > 1000) return null
    return { fullName, ageOrGrade, relationship, preferredLanguage, emergencyPhone, notes }
  })
  return students.every(Boolean) ? students : null
}

const getChapaStatus = (verification) => {
  const status = String(verification?.data?.status ?? verification?.status ?? '').toLowerCase()
  if (['success', 'paid', 'completed'].includes(status)) return 'paid'
  if (['failed', 'cancelled', 'canceled', 'expired'].includes(status)) return 'failed'
  return 'pending'
}

const verifyChapaTransaction = async (reference) => {
  const secretKey = process.env.CHAPA_SECRET_KEY
  if (!secretKey) throw new Error('Chapa checkout has not been configured.')
  const response = await fetch(`https://api.chapa.global/v2/payments/${encodeURIComponent(reference)}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error('Chapa could not verify this payment.')
  const verification = await response.json()
  return { status: getChapaStatus(verification), data: verification?.data ?? {} }
}

const sponsorEndedCondition = () => sql`enrollments.sponsor_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM sponsors WHERE sponsors.id = enrollments.sponsor_id AND sponsors.end_date IS NOT NULL AND sponsors.end_date <= (NOW() AT TIME ZONE 'UTC')::date
)`

const enrollmentAccessCondition = () => sql`
  enrollments.access_status = 'active'
  AND (enrollments.expires_at IS NULL OR enrollments.expires_at > NOW())
  AND NOT (${sponsorEndedCondition()})
  AND (enrollments.source <> 'paid' OR EXISTS (SELECT 1 FROM payments WHERE payments.id = enrollments.payment_id AND payments.status = 'paid'))
  AND (enrollments.sponsor_id IS NULL OR EXISTS (
    SELECT 1 FROM sponsor_payments
    WHERE sponsor_payments.sponsor_id = enrollments.sponsor_id
      AND sponsor_payments.status = 'paid'
      AND (
        (enrollments.class_id IS NOT NULL AND sponsor_payments.class_id = enrollments.class_id)
        OR (enrollments.class_id IS NULL AND sponsor_payments.course_id = enrollments.course_id)
      )
  ))
`

const targetAccessCondition = (courseId, classId) => courseId !== null
  ? sql`enrollments.course_id = ${courseId} AND enrollments.class_id IS NULL`
  : sql`enrollments.class_id = ${classId}`

const paymentTargetCondition = (courseId, classId) => courseId !== null
  ? sql`sponsor_payments.course_id = ${courseId}`
  : sql`sponsor_payments.class_id = ${classId}`

const getEnrollmentTargetIssues = async (transaction, courseId, classId) => {
  if (courseId !== null) {
    const [course] = await transaction`SELECT status FROM courses WHERE id = ${courseId} FOR UPDATE`
    if (!course) return ['missing']
    return course.status === 'Published' ? [] : ['unpublished']
  }
  const [classRecord] = await transaction`SELECT published, status, schedule FROM classes WHERE id = ${classId} FOR UPDATE`
  if (!classRecord) return ['missing']
  const issues = []
  if (!classRecord.published || classRecord.status === 'closed') issues.push('unpublished')
  if (isClassEnrollmentClosed(deserializeJson(classRecord.schedule))) issues.push('started')
  return issues
}

const createEnrollments = async (transaction, { userId, students, courseId, classId, paymentId, source, sponsorId = null, grantedBy = null, grantReason = null, grantNote = null, expiresAt = null }) => {
  const created = []
  for (const student of students) {
    const [savedStudent] = await transaction`
      INSERT INTO students ${transaction({
        user_id: userId,
        full_name: student.fullName,
        age_or_grade: student.ageOrGrade,
        relationship: student.relationship,
        preferred_language: student.preferredLanguage,
        emergency_phone: student.emergencyPhone,
        notes: student.notes,
      })}
      RETURNING id
    `
    const classRecord = classId === null ? null : (await transaction`
      SELECT classes.id,
             classes.capacity,
             classes.status,
             COALESCE(enrollment_counts.enrolled_count, 0)::INTEGER AS enrolled_count
      FROM classes
      LEFT JOIN (
        SELECT class_id, COUNT(*) FILTER (WHERE class_status = 'enrolled' AND ${enrollmentAccessCondition()}) AS enrolled_count
        FROM enrollments
        WHERE class_id = ${classId}
        GROUP BY class_id
      ) AS enrollment_counts ON enrollment_counts.class_id = classes.id
      WHERE classes.id = ${classId}
      FOR UPDATE OF classes
    `)[0] ?? null
    const classStatus = classRecord ? (classRecord.status === 'full' || classRecord.enrolled_count >= classRecord.capacity ? 'waitlisted' : 'enrolled') : null
    const [enrollment] = await transaction`
      INSERT INTO enrollments ${transaction({ user_id: userId, student_id: savedStudent.id, course_id: courseId, payment_id: paymentId, class_id: classRecord?.id ?? null, class_status: classStatus, source, sponsor_id: sponsorId, granted_by: grantedBy, grant_reason: grantReason, grant_note: grantNote, expires_at: expiresAt })}
      RETURNING id::INTEGER AS id
    `
    if (classRecord && classStatus === 'enrolled' && classRecord.enrolled_count + 1 >= classRecord.capacity) {
      await transaction`UPDATE classes SET status = 'full', updated_at = NOW() WHERE id = ${classRecord.id}`
    }
    if (courseId !== null) await transaction`UPDATE courses SET students = students + 1 WHERE id = ${courseId}`
    created.push({ id: enrollment.id, classStatus })
  }
  return created
}

class EnrollmentRefusal extends Error {
  constructor(status, body) {
    super(body.message ?? 'Access was refused.')
    this.status = status
    this.body = body
  }
}

const grantEnrollmentAccess = async (transaction, { userId, student, courseId, classId, reason, note, expiresAt, sponsorId, grantedBy, override }) => {
  const targetCondition = targetAccessCondition(courseId, classId)
  await transaction`UPDATE enrollments SET access_status = 'expired' WHERE user_id = ${userId} AND ${targetCondition} AND access_status = 'active' AND (expires_at <= NOW() OR ${sponsorEndedCondition()})`
  const [existing] = await transaction`SELECT 1 FROM enrollments WHERE user_id = ${userId} AND ${targetCondition} AND ${enrollmentAccessCondition()} LIMIT 1`
  if (existing) return { status: 'skipped' }

  const issues = await getEnrollmentTargetIssues(transaction, courseId, classId)
  if (issues.includes('missing')) throw new EnrollmentRefusal(404, { message: 'The selected course or class was not found.' })
  if (issues.length > 0 && !override) throw new EnrollmentRefusal(409, { message: 'Confirm the warnings to grant access anyway.', warnings: issues })

  let enrollmentExpiresAt = expiresAt
  if (sponsorId !== null) {
    const [sponsor] = await transaction`
      SELECT (sponsors.end_date::timestamp AT TIME ZONE 'UTC') AS "endsAt", (end_date IS NOT NULL AND end_date <= (NOW() AT TIME ZONE 'UTC')::date) AS ended,
             (SELECT COUNT(*)::INTEGER FROM sponsor_payments WHERE sponsor_payments.sponsor_id = sponsors.id AND sponsor_payments.status = 'paid' AND ${paymentTargetCondition(courseId, classId)}) AS "paidCount"
      FROM sponsors
      WHERE id = ${sponsorId}
      FOR UPDATE
    `
    if (!sponsor) throw new EnrollmentRefusal(404, { message: 'Sponsor not found.' })
    if (sponsor.ended) throw new EnrollmentRefusal(409, { message: 'This sponsor agreement has ended.' })
    if (sponsor.paidCount === 0) throw new EnrollmentRefusal(409, { message: 'Record a paid payment with an invoice for this course or class before granting sponsored access.' })
    if (classId !== null) {
      const [classSeats] = await transaction`
        SELECT capacity, (SELECT COUNT(*)::INTEGER FROM enrollments WHERE enrollments.class_id = classes.id AND enrollments.class_status = 'enrolled' AND ${enrollmentAccessCondition()}) AS "enrolledCount"
        FROM classes WHERE id = ${classId}
      `
      if (classSeats && classSeats.enrolledCount >= classSeats.capacity) throw new EnrollmentRefusal(409, { message: 'This class has no seats left.' })
    }
    if (sponsor.endsAt) {
      if (enrollmentExpiresAt !== null && enrollmentExpiresAt > sponsor.endsAt) throw new EnrollmentRefusal(400, { message: 'Access cannot end after the sponsorship ends.' })
      if (enrollmentExpiresAt === null || enrollmentExpiresAt.getTime() === sponsor.endsAt.getTime()) enrollmentExpiresAt = null
    }
  }

  await transaction`
    UPDATE payments
    SET status = 'failed', paid_at = NULL, verification_status = 'declined', review_note = 'Superseded by admin-granted access.', reviewed_by = ${grantedBy}, reviewed_at = NOW()
    WHERE user_id = ${userId} AND payment_method = 'manual' AND verification_status = 'pending' AND status = 'pending'
      AND ${courseId !== null ? sql`course_id = ${courseId}` : sql`class_id = ${classId}`}
  `
  const [created] = await createEnrollments(transaction, {
    userId,
    students: [student],
    courseId,
    classId,
    paymentId: null,
    source: sponsorId === null ? 'free_grant' : 'sponsored',
    sponsorId,
    grantedBy,
    grantReason: reason,
    grantNote: note,
    expiresAt: enrollmentExpiresAt,
  })
  return { status: 'granted', enrollmentId: created.id, classStatus: created.classStatus }
}

const updatePaymentStatus = async (reference, status, verification = {}) => sql.begin(async (transaction) => {
  const [payment] = await transaction`
    SELECT id, user_id AS "userId", course_id AS "courseId", class_id AS "classId", practice_exam_id AS "practiceExamId", bookstore_item_id AS "bookstoreItemId", student_data AS "studentData", payment_method AS "paymentMethod", verification_status AS "verificationStatus", amount::FLOAT AS amount, currency, status
    FROM payments
    WHERE reference = ${reference}
    FOR UPDATE
  `
  if (!payment || payment.status === status || payment.status === 'paid') return payment?.status ?? null
  if (payment.paymentMethod === 'manual' && (status !== 'paid' || !verification.manualApproval || payment.verificationStatus !== 'pending')) return payment.status
  if (status === 'paid' && payment.paymentMethod !== 'manual' && !isTestChapa && (Number(verification.amount) !== payment.amount || String(verification.currency).toUpperCase() !== payment.currency.toUpperCase() || verification.merchant_reference !== payment.reference)) return payment.status
  if (status === 'paid' && payment.practiceExamId === null && payment.bookstoreItemId === null) {
    const issues = await getEnrollmentTargetIssues(transaction, payment.courseId, payment.classId)
    if (issues.length > 0) {
      const unavailableReason = payment.courseId !== null ? 'The selected course is no longer available for enrollment.' : 'This class is no longer available for enrollment.'
      await transaction`
        UPDATE payments
        SET status = 'failed', paid_at = NULL,
            verification_status = CASE WHEN payment_method = 'manual' THEN 'declined' ELSE verification_status END,
            review_note = CASE WHEN payment_method = 'manual' THEN ${unavailableReason} ELSE review_note END,
            reviewed_by = CASE WHEN payment_method = 'manual' THEN ${verification.adminUserId ?? null} ELSE reviewed_by END,
            reviewed_at = CASE WHEN payment_method = 'manual' THEN NOW() ELSE reviewed_at END
        WHERE id = ${payment.id}
      `
      return 'failed'
    }
  }

  if (status === 'paid' && payment.practiceExamId === null && payment.bookstoreItemId === null) {
    const [activeAccess] = await transaction`SELECT 1 FROM enrollments WHERE user_id = ${payment.userId} AND ${targetAccessCondition(payment.courseId, payment.classId)} AND ${enrollmentAccessCondition()} LIMIT 1`
    if (activeAccess) {
      await transaction`
        UPDATE payments
        SET status = 'failed', paid_at = NULL,
            verification_status = CASE WHEN payment_method = 'manual' THEN 'declined' ELSE verification_status END,
            review_note = CASE WHEN payment_method = 'manual' THEN 'You already have active access to this item.' ELSE review_note END,
            reviewed_by = CASE WHEN payment_method = 'manual' THEN ${verification.adminUserId ?? null} ELSE reviewed_by END,
            reviewed_at = CASE WHEN payment_method = 'manual' THEN NOW() ELSE reviewed_at END
        WHERE id = ${payment.id}
      `
      return 'failed'
    }
  }

  await transaction`
    UPDATE payments
    SET status = ${status},
        paid_at = ${status === 'paid' ? new Date() : null},
        chapa_reference = COALESCE(chapa_reference, ${verification.chapa_reference ?? null}),
        verification_status = CASE WHEN payment_method = 'manual' AND ${status} = 'paid' THEN 'approved' ELSE verification_status END,
        reviewed_by = CASE WHEN payment_method = 'manual' AND ${status} = 'paid' THEN ${verification.adminUserId ?? null} ELSE reviewed_by END,
        reviewed_at = CASE WHEN payment_method = 'manual' AND ${status} = 'paid' THEN NOW() ELSE reviewed_at END
    WHERE id = ${payment.id}
  `
  if (status !== 'paid') return status
  if (payment.practiceExamId !== null) {
    await transaction`
      INSERT INTO practice_purchases ${transaction({ user_id: payment.userId, exam_id: payment.practiceExamId, payment_id: payment.id })}
      ON CONFLICT (user_id, exam_id) DO NOTHING
    `
    return 'paid'
  }
  if (payment.bookstoreItemId !== null) {
    await transaction`
      INSERT INTO bookstore_purchases ${transaction({ user_id: payment.userId, bookstore_item_id: payment.bookstoreItemId, payment_id: payment.id })}
      ON CONFLICT (user_id, bookstore_item_id) DO NOTHING
    `
    return 'paid'
  }

  const students = typeof payment.studentData === 'string' ? JSON.parse(payment.studentData) : payment.studentData
  await createEnrollments(transaction, { userId: payment.userId, students, courseId: payment.courseId, classId: payment.classId, paymentId: payment.id, source: 'paid' })
  return 'paid'
})

app.use(express.json({ limit: '30mb' }))

const toCspReportText = (value) => String(value ?? '').slice(0, 500)

const parseCspReports = (body) => (Array.isArray(body) ? body : [body]).flatMap((entry) => {
  const report = entry?.['csp-report'] ?? entry?.body
  if (!report || typeof report !== 'object') return []
  return [{
    document_url: toCspReportText(report['document-uri'] ?? report.documentURL),
    violated_directive: toCspReportText(report['violated-directive'] ?? report.effectiveDirective),
    blocked_url: toCspReportText(report['blocked-uri'] ?? report.blockedURL),
    source_file: toCspReportText(report['source-file'] ?? report.sourceFile),
  }]
}).slice(0, 20)

app.post('/api/csp-report', express.json({ type: ['application/csp-report', 'application/reports+json'] }), async (request, response) => {
  const reports = parseCspReports(request.body)
  console.warn('CSP violation report', JSON.stringify(reports))
  for (const report of reports) {
    await sql`
      INSERT INTO csp_violation_reports (document_url, violated_directive, blocked_url, source_file)
      VALUES (${report.document_url}, ${report.violated_directive}, ${report.blocked_url}, ${report.source_file})
    `
  }
  response.status(204).end()
})

app.get('/api/health', async (_request, response) => {
  await sql`SELECT 1`
  response.json({ status: 'ok' })
})

app.get('/api/reviews', requireAuthenticated, async (request, response) => {
  const targetType = request.query.type
  const targetId = parseCourseId(String(request.query.id ?? ''))
  if (!['course', 'class'].includes(targetType) || targetId === null) return response.status(400).json({ message: 'A valid review target is required.' })

  if (targetType === 'course') {
    const reviews = await sql`
      SELECT reviews.id::INTEGER AS id,
             reviews.rating::INTEGER AS rating,
             reviews.comment,
             COALESCE(NULLIF(users.name, ''), 'Learner') AS "studentName",
             reviews.created_at AS "createdAt"
      FROM course_reviews reviews
      INNER JOIN users ON users.id = reviews.user_id
      WHERE reviews.course_id = ${targetId} AND reviews.is_hidden = false
      ORDER BY reviews.created_at DESC, reviews.id DESC
    `
    const [ownReview] = await sql`SELECT id::INTEGER AS id, rating::INTEGER AS rating, comment, is_hidden AS "isHidden" FROM course_reviews WHERE course_id = ${targetId} AND user_id = ${request.userId}`
    const [eligibility] = await sql`
      SELECT EXISTS (
        SELECT 1 FROM enrollments
        INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
        LEFT JOIN course_progress ON course_progress.user_id = enrollments.user_id AND course_progress.course_id = enrollments.course_id
        WHERE enrollments.user_id = ${request.userId} AND enrollments.course_id = ${targetId} AND enrollments.class_id IS NULL
          AND (course_progress.started = true OR EXISTS (SELECT 1 FROM student_lesson_progress WHERE student_lesson_progress.enrollment_id = enrollments.id))
      ) AS eligible
    `
    return response.json({ reviews, ownReview: ownReview ?? null, canReview: Boolean(eligibility?.eligible) })
  }

  const reviews = await sql`
    SELECT reviews.id::INTEGER AS id,
           reviews.rating::INTEGER AS rating,
           reviews.comment,
           COALESCE(NULLIF(users.name, ''), 'Learner') AS "studentName",
           reviews.created_at AS "createdAt"
    FROM class_reviews reviews
    INNER JOIN users ON users.id = reviews.user_id
    WHERE reviews.class_id = ${targetId} AND reviews.is_hidden = false
    ORDER BY reviews.created_at DESC, reviews.id DESC
  `
  const [ownReview] = await sql`SELECT id::INTEGER AS id, rating::INTEGER AS rating, comment, is_hidden AS "isHidden" FROM class_reviews WHERE class_id = ${targetId} AND user_id = ${request.userId}`
  const [eligibility] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM enrollments
      INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
      WHERE enrollments.user_id = ${request.userId} AND enrollments.class_id = ${targetId} AND enrollments.class_status = 'enrolled'
        AND (EXISTS (SELECT 1 FROM student_lesson_progress WHERE student_lesson_progress.enrollment_id = enrollments.id)
          OR EXISTS (SELECT 1 FROM class_attendance WHERE class_attendance.enrollment_id = enrollments.id AND class_attendance.status = 'Present'))
    ) AS eligible
  `
  return response.json({ reviews, ownReview: ownReview ?? null, canReview: Boolean(eligibility?.eligible) })
})

app.post('/api/reviews', requireAuthenticated, async (request, response) => {
  const { type: targetType, id: rawTargetId, rating, comment = '' } = request.body ?? {}
  const targetId = parseCourseId(String(rawTargetId ?? ''))
  if (!['course', 'class'].includes(targetType) || targetId === null) return response.status(400).json({ message: 'A valid review target is required.' })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return response.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' })
  if (typeof comment !== 'string' || comment.trim().length > 1000) return response.status(400).json({ message: 'Reviews must be 1000 characters or fewer.' })

  const eligibility = targetType === 'course'
    ? await sql`
      SELECT EXISTS (
        SELECT 1 FROM enrollments
        INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
        LEFT JOIN course_progress ON course_progress.user_id = enrollments.user_id AND course_progress.course_id = enrollments.course_id
        WHERE enrollments.user_id = ${request.userId} AND enrollments.course_id = ${targetId} AND enrollments.class_id IS NULL
          AND (course_progress.started = true OR EXISTS (SELECT 1 FROM student_lesson_progress WHERE student_lesson_progress.enrollment_id = enrollments.id))
      ) AS eligible
    `
    : await sql`
      SELECT EXISTS (
        SELECT 1 FROM enrollments
        INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
        WHERE enrollments.user_id = ${request.userId} AND enrollments.class_id = ${targetId} AND enrollments.class_status = 'enrolled'
          AND (EXISTS (SELECT 1 FROM student_lesson_progress WHERE student_lesson_progress.enrollment_id = enrollments.id)
            OR EXISTS (SELECT 1 FROM class_attendance WHERE class_attendance.enrollment_id = enrollments.id AND class_attendance.status = 'Present'))
      ) AS eligible
    `
  if (!eligibility[0]?.eligible) return response.status(403).json({ message: 'Start a lesson in your enrolled course or class before leaving a review.' })

  const [review] = targetType === 'course'
    ? await sql`
      INSERT INTO course_reviews (course_id, user_id, rating, comment)
      VALUES (${targetId}, ${request.userId}, ${rating}, ${comment.trim()})
      ON CONFLICT (course_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
      RETURNING id::INTEGER AS id, rating::INTEGER AS rating, comment, is_hidden AS "isHidden"
    `
    : await sql`
      INSERT INTO class_reviews (class_id, user_id, rating, comment)
      VALUES (${targetId}, ${request.userId}, ${rating}, ${comment.trim()})
      ON CONFLICT (class_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
      RETURNING id::INTEGER AS id, rating::INTEGER AS rating, comment, is_hidden AS "isHidden"
    `
  return response.json(review)
})

app.get('/api/admin/reviews', requireAdmin, async (_request, response) => {
  const reviews = await sql`
    SELECT course_reviews.id::INTEGER AS id, 'course' AS "targetType", course_reviews.course_id::INTEGER AS "targetId", courses.title AS "targetTitle", users.name AS "studentName", users.email AS "studentEmail", course_reviews.rating::INTEGER AS rating, course_reviews.comment, course_reviews.is_hidden AS "isHidden", course_reviews.created_at AS "createdAt"
    FROM course_reviews INNER JOIN courses ON courses.id = course_reviews.course_id INNER JOIN users ON users.id = course_reviews.user_id
    UNION ALL
    SELECT class_reviews.id::INTEGER AS id, 'class' AS "targetType", class_reviews.class_id::INTEGER AS "targetId", classes.title AS "targetTitle", users.name AS "studentName", users.email AS "studentEmail", class_reviews.rating::INTEGER AS rating, class_reviews.comment, class_reviews.is_hidden AS "isHidden", class_reviews.created_at AS "createdAt"
    FROM class_reviews INNER JOIN classes ON classes.id = class_reviews.class_id INNER JOIN users ON users.id = class_reviews.user_id
    ORDER BY "createdAt" DESC, 1 DESC
  `
  return response.json(reviews)
})

app.patch('/api/admin/reviews/:type/:id', requireAdmin, async (request, response) => {
  const targetId = parseCourseId(request.params.id)
  const targetType = request.params.type
  const { isHidden } = request.body ?? {}
  if (targetId === null || !['course', 'class'].includes(targetType) || typeof isHidden !== 'boolean') return response.status(400).json({ message: 'A review and visibility status are required.' })
  const rows = targetType === 'course'
    ? await sql`UPDATE course_reviews SET is_hidden = ${isHidden}, updated_at = NOW() WHERE id = ${targetId} RETURNING id::INTEGER AS id`
    : await sql`UPDATE class_reviews SET is_hidden = ${isHidden}, updated_at = NOW() WHERE id = ${targetId} RETURNING id::INTEGER AS id`
  if (!rows.length) return response.status(404).json({ message: 'Review not found.' })
  return response.json({ success: true })
})

app.get('/api/courses', async (_request, response) => {
  const courses = await sql`
    SELECT ${courseSummaryColumns}
    FROM courses
    WHERE status = 'Published'
    ORDER BY id
  `
  response.json(courses)
})

app.get('/api/courses/:id/reviews', async (request, response) => {
  const courseId = parseCourseId(request.params.id)
  if (courseId === null) return response.status(400).json({ message: 'Invalid course id.' })
  const [course] = await sql`SELECT id FROM courses WHERE id = ${courseId} AND status = 'Published'`
  if (!course) return response.status(404).json({ message: 'Course not found.' })
  const reviews = await sql`
    SELECT reviews.id::INTEGER AS id,
           reviews.rating::INTEGER AS rating,
           reviews.comment,
           COALESCE(NULLIF(users.name, ''), 'Learner') AS "studentName",
           reviews.created_at AS "createdAt"
    FROM course_reviews reviews
    INNER JOIN users ON users.id = reviews.user_id
    WHERE reviews.course_id = ${courseId} AND reviews.is_hidden = false
    ORDER BY reviews.created_at DESC, reviews.id DESC
  `
  return response.json(reviews)
})

app.get('/api/bookstore-items', async (_request, response) => {
  const items = await sql`
    SELECT ${bookstoreItemColumns}
    FROM bookstore_items
    WHERE published = true
    ORDER BY created_at DESC, id DESC
  `
  return response.json(items)
})

app.get('/api/bookstore-items/:id/download', requireAuthenticated, async (request, response) => {
  const itemId = parseCourseId(request.params.id)
  if (itemId === null) return response.status(400).json({ message: 'Invalid bookstore item id.' })
  const [item] = await sql`
    SELECT bookstore_items.download_file AS "downloadFile",
           bookstore_items.download_file_name AS "fileName",
           bookstore_items.download_mime_type AS "mimeType"
    FROM bookstore_purchases
    INNER JOIN payments ON payments.id = bookstore_purchases.payment_id AND payments.status = 'paid'
    INNER JOIN bookstore_items ON bookstore_items.id = bookstore_purchases.bookstore_item_id
    WHERE bookstore_purchases.user_id = ${request.userId}
      AND bookstore_purchases.bookstore_item_id = ${itemId}
  `
  if (!item) return response.status(404).json({ message: 'Purchased file not found.' })
  await sql`INSERT INTO bookstore_downloads ${sql({ bookstore_item_id: itemId, user_id: request.userId })}`
  response.set({
    'Content-Type': item.mimeType,
    'Content-Length': String(item.downloadFile.length),
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(item.fileName)}`,
    'Cache-Control': 'private, no-store',
  })
  return response.send(item.downloadFile)
})

app.get('/api/practice-exams', async (_request, response) => {
  const exams = await sql`
    SELECT id::INTEGER AS id, title, subject, grade, price::FLOAT AS price, published
    FROM practice_exams
    WHERE published = true
    ORDER BY created_at DESC, id DESC
  `
  return response.json(exams)
})

app.get('/api/practice-exams/:id', requireAuthenticated, async (request, response) => {
  const examId = parseCourseId(request.params.id)
  if (examId === null) return response.status(400).json({ message: 'Invalid practice exam id.' })
  const [exam] = await sql`
    SELECT practice_exams.id::INTEGER AS id, practice_exams.title, practice_exams.subject, practice_exams.grade, practice_exams.price::FLOAT AS price, practice_exams.published
    FROM practice_exams
    WHERE practice_exams.id = ${examId} AND practice_exams.published = true
  `
  if (!exam) return response.status(404).json({ message: 'Practice exam not found.' })
  const [purchase] = await sql`
    SELECT practice_purchases.id
    FROM practice_purchases
    INNER JOIN payments ON payments.id = practice_purchases.payment_id AND payments.status = 'paid'
    WHERE practice_purchases.user_id = ${request.userId} AND practice_purchases.exam_id = ${examId}
  `
  if (!purchase) return response.status(403).json({ message: 'Purchase this practice exam to access its questions.' })
  const questions = await sql`
    SELECT id::INTEGER AS id, exam_id::INTEGER AS exam_id, question_text, topic, options, correct_answer, explanation
    FROM practice_questions
    WHERE exam_id = ${examId}
    ORDER BY id
  `
  return response.json({ ...exam, questions: questions.map((question) => ({ ...question, options: deserializeJson(question.options) })) })
})

app.post('/api/practice-exams/:examId/questions/:questionId/answers', requireAuthenticated, async (request, response) => {
  const examId = parseCourseId(request.params.examId)
  const questionId = parseEnrollmentId(request.params.questionId)
  const answer = typeof request.body?.answer === 'string' ? request.body.answer.trim() : ''
  if (examId === null || questionId === null || !answer) return response.status(400).json({ message: 'Choose a valid practice answer.' })
  const [question] = await sql`
    SELECT id, topic, correct_answer AS "correctAnswer"
    FROM practice_questions
    INNER JOIN practice_exams ON practice_exams.id = practice_questions.exam_id
    WHERE practice_questions.id = ${questionId} AND practice_questions.exam_id = ${examId} AND practice_exams.published = true
  `
  if (!question) return response.status(404).json({ message: 'Practice question not found.' })
  const [purchase] = await sql`
    SELECT practice_purchases.id
    FROM practice_purchases
    INNER JOIN payments ON payments.id = practice_purchases.payment_id AND payments.status = 'paid'
    WHERE practice_purchases.user_id = ${request.userId} AND practice_purchases.exam_id = ${examId}
  `
  if (!purchase) return response.status(403).json({ message: 'Purchase this practice exam to answer its questions.' })
  const correct = answer === question.correctAnswer
  await sql`INSERT INTO practice_answers ${sql({ user_id: request.userId, exam_id: examId, question_id: questionId, topic: question.topic, correct })}`
  return response.status(201).json({ correct })
})

app.get('/api/courses/:id', async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid course id.' })

  const course = await readCourse(id, true)
  if (!course) return response.status(404).json({ message: 'Course not found.' })
  return response.json(sanitizeCourseForLearner(course))
})

app.get('/api/students', requireAuthenticated, async (request, response) => {
  const students = await sql`
    SELECT id::INTEGER AS id,
           full_name AS "fullName",
           age_or_grade AS "ageOrGrade",
           relationship,
           preferred_language AS "preferredLanguage",
           emergency_phone AS "emergencyPhone",
           notes
    FROM students
    WHERE user_id = ${request.userId}
    ORDER BY created_at DESC
  `
  response.json(students)
})

app.get('/api/gamification', requireAuthenticated, async (request, response) => {
  await syncGamificationActivity()
  const { stats, challengeResults } = await syncGamificationForUser(request.userId)
  const badges = await sql`
    SELECT id, name, icon, description, criteria
    FROM gamification_badges
    ORDER BY id
  `
  const achievements = await sql`
    SELECT id::TEXT AS id, user_id AS student_id, badge_id, unlocked_at
    FROM gamification_achievements
    WHERE user_id = ${request.userId}
    ORDER BY unlocked_at DESC
  `
  const [classContext] = await sql`
    SELECT enrollments.class_id AS "classId", classes.title AS "classTitle"
    FROM enrollments
    INNER JOIN classes ON classes.id = enrollments.class_id
    WHERE enrollments.user_id = ${request.userId}
      AND enrollments.class_id IS NOT NULL
      AND enrollments.class_status = 'enrolled'
      AND ${enrollmentAccessCondition()}
      AND classes.published = true
    ORDER BY enrollments.created_at DESC
    LIMIT 1
  `
  const classRanks = await sql`
    WITH class_users AS (
      SELECT DISTINCT enrollments.class_id,
             enrollments.user_id,
             COALESCE(NULLIF(users.name, ''), users.email) AS name
      FROM enrollments
      INNER JOIN users ON users.id = enrollments.user_id
      INNER JOIN classes ON classes.id = enrollments.class_id AND classes.published = true
      WHERE enrollments.class_id IS NOT NULL
        AND enrollments.class_status = 'enrolled'
        AND ${enrollmentAccessCondition()}
    ), class_scores AS (
      SELECT class_users.class_id,
             class_users.user_id,
             class_users.name,
             (COALESCE(activity_totals.xp, 0) + COALESCE(challenge_totals.xp, 0))::INTEGER AS xp
      FROM class_users
      LEFT JOIN (
        SELECT user_id, SUM(xp)::INTEGER AS xp
        FROM gamification_activity_rewards
        GROUP BY user_id
      ) activity_totals ON activity_totals.user_id = class_users.user_id
      LEFT JOIN (
        SELECT completions.user_id, SUM(challenges.xp_reward)::INTEGER AS xp
        FROM gamification_challenge_completions completions
        INNER JOIN gamification_challenges challenges ON challenges.id = completions.challenge_id
        GROUP BY completions.user_id
      ) challenge_totals ON challenge_totals.user_id = class_users.user_id
    )
    SELECT class_id AS "classId",
           ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY xp DESC, name)::INTEGER AS rank
    FROM class_scores
    WHERE user_id = ${request.userId}
  `
  const leaderboard = await sql`
    WITH cohort_users AS (
      SELECT DISTINCT enrollments.user_id
      FROM enrollments
      INNER JOIN classes ON classes.id = enrollments.class_id AND classes.published = true
      WHERE enrollments.class_id = ${classContext?.classId ?? null}
        AND enrollments.class_status = 'enrolled'
    ), cohort_scores AS (
      SELECT users.id::INTEGER AS id,
             COALESCE(NULLIF(users.name, ''), users.email) AS name,
             LEFT(COALESCE(NULLIF(users.name, ''), users.email), 1) AS avatar,
             (COALESCE(activity_totals.xp, 0) + COALESCE(challenge_totals.xp, 0))::INTEGER AS xp,
             users.id = ${request.userId} AS "isCurrentStudent"
      FROM cohort_users
      INNER JOIN users ON users.id = cohort_users.user_id
      LEFT JOIN (
        SELECT user_id, SUM(xp)::INTEGER AS xp
        FROM gamification_activity_rewards
        GROUP BY user_id
      ) activity_totals ON activity_totals.user_id = users.id
      LEFT JOIN (
        SELECT completions.user_id, SUM(challenges.xp_reward)::INTEGER AS xp
        FROM gamification_challenge_completions completions
        INNER JOIN gamification_challenges challenges ON challenges.id = completions.challenge_id
        GROUP BY completions.user_id
      ) challenge_totals ON challenge_totals.user_id = users.id
    )
    SELECT *, ROW_NUMBER() OVER (ORDER BY xp DESC, name)::INTEGER AS rank
    FROM cohort_scores
    ORDER BY rank
  `
  return response.json({
    stats,
    badges,
    achievements,
    challenges: challengeResults.map(({ criteria: _criteria, ...challenge }) => ({
      id: challenge.id,
      title: challenge.title,
      type: challenge.type,
      xp_reward: Number(challenge.xpReward),
      points_reward: Number(challenge.pointsReward),
      completed: challenge.completed,
      completed_at: challenge.completedAt,
    })),
    leaderboard,
    classRanks,
    classId: classContext?.classId ?? null,
    classTitle: classContext?.classTitle ?? null,
  })
})

app.get('/api/enrollments', requireAuthenticated, async (request, response) => {
  await sql`UPDATE classes SET status = 'closed', updated_at = NOW() WHERE (schedule->>'endDate') IS NOT NULL AND (schedule->>'endDate') < CURRENT_DATE::TEXT AND status <> 'closed'`
  const enrollments = await sql`
    SELECT enrollments.id::INTEGER AS id,
           enrollments.course_id::INTEGER AS "courseId",
           courses.title AS "courseTitle",
           courses.cover AS "courseCover",
           classes.cover AS "classCover",
           courses.description AS "courseDescription",
           courses.long_description AS "courseLongDescription",
           courses.learning_outcomes AS "learningOutcomes",
           courses.rating::FLOAT AS "courseRating",
           courses.rating_count AS "courseRatingCount",
           courses.category,
           courses.level,
           courses.tutor,
           courses.certificate,
           CASE WHEN classes.id IS NULL THEN courses.modules ELSE classes.modules END AS modules,
           classes.id::INTEGER AS "classId",
           classes.title AS "classTitle",
           tutors.name AS "classTutor",
           classes.schedule AS "classSchedule",
           CASE WHEN enrollments.class_status = 'enrolled' THEN classes.meeting_link END AS "meetingLink",
           classes.status AS "classStatus",
           classes.program_id AS "classProgramId",
           to_char(classes.exam_date, 'YYYY-MM-DD') AS "classExamDate",
           lesson_summary."lessonProgress",
           lesson_summary."timeSpentSeconds",
           lesson_summary."lastActivityAt",
           quiz_summary."quizAttempts",
           practice_summary."practiceAnswers",
           attendance_summary.attendance,
           session_join_summary."sessionJoinClicks",
           study_plan_summary."studyPlanOrder",
           study_plan_summary."studyPlanGeneratedAt"
    FROM enrollments
    LEFT JOIN courses ON courses.id = enrollments.course_id
    INNER JOIN students ON students.id = enrollments.student_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    LEFT JOIN tutors ON tutors.id = classes.tutor_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(
               lesson_id::TEXT,
               jsonb_build_object(
                 'startedAt', started_at,
                 'completedAt', completed_at,
                 'activeSeconds', active_seconds,
                 'videoPositionSeconds', video_position_seconds,
                 'lastAccessedAt', last_accessed_at
               )
             ), '{}'::jsonb) AS "lessonProgress",
             COALESCE(SUM(active_seconds), 0)::INTEGER AS "timeSpentSeconds",
             MAX(last_accessed_at) AS "lastActivityAt"
      FROM student_lesson_progress
      WHERE enrollment_id = enrollments.id
    ) AS lesson_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(
               jsonb_build_object(
                 'id', id,
                 'lessonId', lesson_id,
                 'startedAt', started_at,
                 'activeSeconds', active_seconds,
                 'answers', COALESCE(answers, '{}'::jsonb),
                 'violations', COALESCE(violations, '[]'::jsonb),
                 'score', score,
                 'passed', passed,
                 'disqualified', disqualified,
                 'retakeApproved', retake_approved,
                 'submittedAt', submitted_at
               )
               ORDER BY started_at DESC
             ), '[]'::jsonb) AS "quizAttempts"
      FROM quiz_attempts
      WHERE enrollment_id = enrollments.id
    ) AS quiz_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('topic', topic, 'correct', correct)), '[]'::jsonb) AS "practiceAnswers"
      FROM practice_answers
      WHERE enrollment_id = enrollments.id OR (enrollment_id IS NULL AND user_id = enrollments.user_id)
    ) AS practice_summary ON true

    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, status), '{}'::jsonb) AS attendance
      FROM class_attendance
      WHERE enrollment_id = enrollments.id
    ) AS attendance_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, clicked_at), '{}'::jsonb) AS "sessionJoinClicks"
      FROM class_session_join_logs
      WHERE enrollment_id = enrollments.id
    ) AS session_join_summary ON true
    LEFT JOIN LATERAL (
      SELECT lesson_order AS "studyPlanOrder", generated_at AS "studyPlanGeneratedAt"
      FROM study_plans
      WHERE enrollment_id = enrollments.id
    ) AS study_plan_summary ON true
    WHERE enrollments.user_id = ${request.userId}
      AND ((enrollments.class_status IS NULL AND enrollments.course_id IS NOT NULL AND courses.status = 'Published') OR classes.published = true)
      AND ${enrollmentAccessCondition()}
    ORDER BY lesson_summary."lastActivityAt" DESC NULLS LAST, enrollments.created_at DESC
  `
  response.json(enrollments.map(serializeEnrollment))
})

const getOwnedEnrollment = async (transaction, userId, enrollmentId) => {
  const [enrollment] = await transaction`
    SELECT enrollments.id,
           enrollments.course_id AS "courseId",
           enrollments.class_id AS "classId",
           enrollments.class_status AS "classStatus",
           CASE WHEN enrollments.class_id IS NULL THEN courses.modules ELSE classes.modules END AS modules
    FROM enrollments
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    WHERE enrollments.id = ${enrollmentId}
      AND enrollments.user_id = ${userId}
      AND (enrollments.class_id IS NOT NULL OR courses.status = 'Published')
      AND ${enrollmentAccessCondition()}
    FOR UPDATE OF enrollments
  `
  return enrollment ?? null
}

const findCourseLesson = (modules, lessonId) => getCourseLessons(deserializeJson(modules)).find((lesson) => lesson?.id === lessonId) ?? null

const getArticleCheckpoints = (lesson) => {
  const body = String(lesson?.articleBody ?? '')
  return (Array.isArray(lesson?.articleCheckpoints) ? lesson.articleCheckpoints : [])
    .map((checkpoint) => ({ checkpoint, position: body.indexOf(`data-checkpoint-id="${checkpoint.id}"`) }))
    .filter(({ position }) => position !== -1)
    .sort((first, second) => first.position - second.position)
    .map(({ checkpoint }) => checkpoint)
}

const toCheckpointResponse = (row, checkpoint) => ({
  checkpointId: Number(row.checkpointId),
  status: row.skipped ? 'skipped' : row.isCorrect ? 'correct' : 'incorrect',
  selectedOption: row.selectedOption ?? null,
  correctOption: row.skipped ? null : checkpoint.correctOption,
  explanation: row.skipped ? '' : checkpoint.explanation ?? '',
  answeredAt: row.answeredAt,
})

const decodeHtmlText = (value) => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')

const getArticleSectionTitles = (articleBody) => {
  const titles = [...String(articleBody ?? '').matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map(([, inner]) => decodeHtmlText(inner.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim() || 'Untitled section')
  return titles
}

const quizAnswerStatuses = new Set(['unanswered', 'answered', 'expired'])
const isValidQuizAnswerValue = (value) => value === null || typeof value === 'string' || Number.isInteger(value) || (Array.isArray(value) && value.every((item) => typeof item === 'string'))
const parseQuizAnswerRecord = (value) => {
  if (!isPlainObject(value) || !quizAnswerStatuses.has(value.status) || !isValidQuizAnswerValue(value.value)) return null
  return { status: value.status, value: value.value }
}
const parseQuizAnswers = (answers, questions) => {
  if (!isPlainObject(answers)) return null
  const expected = new Set(questions.map((question) => String(question?.id)))
  const entries = Object.entries(answers)
  if (entries.length !== questions.length || entries.some(([id, value]) => !expected.has(id) || !parseQuizAnswerRecord(value))) return null
  return Object.fromEntries(entries.map(([id, value]) => [id, parseQuizAnswerRecord(value)]))
}
const selectedOptionFromRecord = (record, question) => {
  const value = Number.isInteger(record) ? record : ['answered', 'expired'].includes(record?.status) ? record.value : null
  return Number.isInteger(value) && value >= 0 && value < (question?.options?.length ?? 0) ? value : null
}

const getOwnedSolverLesson = async (transaction, userId, enrollmentId, lessonId) => {
  const enrollment = await getOwnedEnrollment(transaction, userId, enrollmentId)
  if (!enrollment) return { missingEnrollment: true }
  const lesson = findCourseLesson(enrollment.modules, lessonId)
  if (!lesson || lesson.type !== 'stepByStepSolver' || !isValidStepByStepSolverConfig(lesson.stepByStepSolver)) return { error: 'Step-by-Step Solver lesson not found.' }
  return { enrollment, lesson, config: lesson.stepByStepSolver }
}

const getCompletedSolverProblemIds = async (transaction, enrollmentId, lessonId) => {
  const rows = await transaction`SELECT DISTINCT problem_id FROM step_by_step_solver_sessions WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND completed_at IS NOT NULL`
  return rows.map((row) => Number(row.problem_id))
}

const getOwnedSolverSession = async (transaction, userId, enrollmentId, lessonId, sessionId, lock = false) => {
  const owned = await getOwnedSolverLesson(transaction, userId, enrollmentId, lessonId)
  if (owned.missingEnrollment || owned.error) return owned
  const [session] = lock
    ? await transaction`SELECT * FROM step_by_step_solver_sessions WHERE id = ${sessionId} AND enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} FOR UPDATE`
    : await transaction`SELECT * FROM step_by_step_solver_sessions WHERE id = ${sessionId} AND enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId}`
  const problem = owned.config.problems.find((item) => item.id === Number(session?.problem_id))
  return session && problem ? { ...owned, session, problem } : { error: 'Solver session not found.' }
}

app.get('/api/enrollments/:enrollmentId/lessons/:lessonId/step-by-step-solver', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  if (enrollmentId === null || lessonId === null) return response.status(400).json({ message: 'Invalid solver lesson.' })
  const result = await sql.begin(async (transaction) => {
    const owned = await getOwnedSolverLesson(transaction, request.userId, enrollmentId, lessonId)
    if (owned.missingEnrollment) return null
    if (owned.error) return { error: owned.error }
    const [record] = await transaction`SELECT * FROM step_by_step_solver_sessions WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND (is_active = TRUE OR completed_at IS NOT NULL) ORDER BY created_at DESC LIMIT 1`
    const problem = owned.config.problems.find((item) => item.id === Number(record?.problem_id))
    const completedProblemIds = await getCompletedSolverProblemIds(transaction, enrollmentId, lessonId)
    return { problems: owned.config.problems.map(({ id, prompt }) => ({ id, prompt })), completedProblemIds, session: getStepByStepSolverSessionView(record, problem) }
  })
  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.json(result)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/step-by-step-solver/sessions', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const problemId = parseEnrollmentId(String(request.body?.problemId ?? ''))
  if (enrollmentId === null || lessonId === null || problemId === null) return response.status(400).json({ message: 'Choose a valid worked problem.' })
  const result = await sql.begin(async (transaction) => {
    const owned = await getOwnedSolverLesson(transaction, request.userId, enrollmentId, lessonId)
    if (owned.missingEnrollment) return null
    if (owned.error) return { error: owned.error }
    const problem = owned.config.problems.find((item) => item.id === problemId)
    if (!problem) return { error: 'Worked problem not found.' }
    const completedProblemIds = await getCompletedSolverProblemIds(transaction, enrollmentId, lessonId)
    if (completedProblemIds.includes(problemId)) return { error: 'This worked problem is already complete.' }
    await transaction`UPDATE step_by_step_solver_sessions SET is_active = FALSE, updated_at = NOW() WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND is_active = TRUE`
    const [record] = await transaction`
      INSERT INTO step_by_step_solver_sessions (enrollment_id, lesson_id, problem_id)
      VALUES (${enrollmentId}, ${lessonId}, ${problemId})
      RETURNING *
    `
    await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id)
      VALUES (${enrollmentId}, ${lessonId})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET last_accessed_at = NOW()
    `
    return getStepByStepSolverSessionView(record, problem)
  })
  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.status(201).json(result)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/step-by-step-solver/sessions/:sessionId/answer', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sessionId = parseEnrollmentId(request.params.sessionId)
  const answer = request.body?.answer
  if (enrollmentId === null || lessonId === null || sessionId === null || typeof answer !== 'string' || !answer.trim() || answer.length > 5000) return response.status(400).json({ message: 'Enter an answer up to 5000 characters.' })
  const result = await sql.begin(async (transaction) => {
    const owned = await getOwnedSolverSession(transaction, request.userId, enrollmentId, lessonId, sessionId, true)
    if (owned.missingEnrollment) return null
    if (owned.error) return { error: owned.error }
    const { session, problem } = owned
    const stepIndex = Number(session.current_step)
    const step = problem.steps[stepIndex]
    if (!session.is_active || session.completed_at || !step) return { error: 'There is no active solution step.' }
    const correct = normalizeSolverAnswer(answer) === normalizeSolverAnswer(step.correctAnswer)
    await transaction`INSERT INTO step_by_step_solver_attempts (session_id, attempt_kind, item_id, answer, is_correct) VALUES (${sessionId}, 'step', ${step.id}, ${answer.trim()}, ${correct})`
    if (!correct) return { session: getStepByStepSolverSessionView(session, problem), correct: false, feedback: step.correctiveFeedback }
    const revealedSteps = [...(deserializeJson(session.revealed_steps) ?? []), { index: stepIndex, instruction: step.instruction, correctAnswer: step.correctAnswer, explanation: step.explanation }]
    const [updated] = await transaction`UPDATE step_by_step_solver_sessions SET current_step = ${stepIndex + 1}, revealed_steps = ${JSON.stringify(revealedSteps)}::jsonb, updated_at = NOW() WHERE id = ${sessionId} RETURNING *`
    return { session: getStepByStepSolverSessionView(updated, problem), correct: true, feedback: 'Correct. The next step is ready.' }
  })
  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(409).json({ message: result.error })
  return response.json(result)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/step-by-step-solver/sessions/:sessionId/reveal', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sessionId = parseEnrollmentId(request.params.sessionId)
  if (enrollmentId === null || lessonId === null || sessionId === null) return response.status(400).json({ message: 'Invalid solver session.' })
  const result = await sql.begin(async (transaction) => {
    const owned = await getOwnedSolverSession(transaction, request.userId, enrollmentId, lessonId, sessionId, true)
    if (owned.missingEnrollment) return null
    if (owned.error) return { error: owned.error }
    const { session, problem } = owned
    const stepIndex = Number(session.current_step)
    const step = problem.steps[stepIndex]
    if (!session.is_active || session.completed_at || !step) return { error: 'There is no active solution step to reveal.' }
    const revealedSteps = [...(deserializeJson(session.revealed_steps) ?? []), { index: stepIndex, instruction: step.instruction, correctAnswer: step.correctAnswer, explanation: step.explanation }]
    const [updated] = await transaction`UPDATE step_by_step_solver_sessions SET current_step = ${stepIndex + 1}, revealed_steps = ${JSON.stringify(revealedSteps)}::jsonb, updated_at = NOW() WHERE id = ${sessionId} RETURNING *`
    await transaction`INSERT INTO step_by_step_solver_attempts (session_id, attempt_kind, item_id) VALUES (${sessionId}, 'reveal', ${step.id})`
    return getStepByStepSolverSessionView(updated, problem)
  })
  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(409).json({ message: result.error })
  return response.json(result)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/step-by-step-solver/sessions/:sessionId/hint', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sessionId = parseEnrollmentId(request.params.sessionId)
  if (enrollmentId === null || lessonId === null || sessionId === null) return response.status(400).json({ message: 'Invalid solver session.' })
  const owned = await sql.begin((transaction) => getOwnedSolverSession(transaction, request.userId, enrollmentId, lessonId, sessionId))
  if (!owned || owned.missingEnrollment) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (owned.error) return response.status(404).json({ message: owned.error })
  const step = owned.problem.steps[Number(owned.session.current_step)]
  if (!owned.session.is_active || owned.session.completed_at || !step) return response.status(409).json({ message: 'There is no active step for a hint.' })
  return response.json({ hint: step.hint })
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/step-by-step-solver/sessions/:sessionId/follow-up', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sessionId = parseEnrollmentId(request.params.sessionId)
  const questionId = parseEnrollmentId(String(request.body?.questionId ?? ''))
  const answer = request.body?.answer
  if (enrollmentId === null || lessonId === null || sessionId === null || questionId === null || typeof answer !== 'string' || !answer.trim() || answer.length > 5000) return response.status(400).json({ message: 'Enter a valid answer for the follow-up problem.' })
  const result = await sql.begin(async (transaction) => {
    const owned = await getOwnedSolverSession(transaction, request.userId, enrollmentId, lessonId, sessionId, true)
    if (owned.missingEnrollment) return null
    if (owned.error) return { error: owned.error }
    const { session, problem, config } = owned
    if (!session.is_active || session.completed_at || Number(session.current_step) < problem.steps.length) return { error: 'Finish the worked steps before attempting practice problems.' }
    const question = problem.followUpQuestions.find((item) => item.id === questionId)
    if (!question) return { error: 'Follow-up problem not found.' }
    const previousResult = deserializeJson(session.follow_up_results)?.[String(questionId)]
    if (previousResult?.correct) return { session: getStepByStepSolverSessionView(session, problem), correct: true, feedback: previousResult.feedback }
    const correct = normalizeSolverAnswer(answer) === normalizeSolverAnswer(question.correctAnswer)
    const feedback = correct ? question.explanation : question.correctiveFeedback
    await transaction`INSERT INTO step_by_step_solver_attempts (session_id, attempt_kind, item_id, answer, is_correct) VALUES (${sessionId}, 'follow-up', ${questionId}, ${answer.trim()}, ${correct})`
    const followUpResults = { ...(deserializeJson(session.follow_up_results) ?? {}), [String(questionId)]: { correct, feedback } }
    const completed = areSolverFollowUpsComplete(problem, followUpResults)
    const [updated] = await transaction`UPDATE step_by_step_solver_sessions SET follow_up_results = ${JSON.stringify(followUpResults)}::jsonb, completed_at = ${completed ? sql`NOW()` : sql`NULL`}, is_active = ${!completed}, updated_at = NOW() WHERE id = ${sessionId} RETURNING *`
    if (completed && areSolverProblemsComplete(config.problems, await getCompletedSolverProblemIds(transaction, enrollmentId, lessonId))) await transaction`UPDATE student_lesson_progress SET completed_at = COALESCE(completed_at, NOW()), last_accessed_at = NOW() WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId}`
    return { session: getStepByStepSolverSessionView(updated, problem), correct, feedback }
  })
  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(409).json({ message: result.error })
  return response.json(result)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/engagement', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const activeSeconds = request.body?.activeSeconds
  const videoPositionSeconds = request.body?.videoPositionSeconds
  const quizAttemptId = request.body?.quizAttemptId

  if (enrollmentId === null || lessonId === null || !Number.isInteger(activeSeconds) || activeSeconds < 0 || activeSeconds > maxEngagementSeconds || (videoPositionSeconds !== undefined && (!Number.isFinite(videoPositionSeconds) || videoPositionSeconds < 0)) || (quizAttemptId !== undefined && (!Number.isInteger(quizAttemptId) || quizAttemptId <= 0))) {
    return response.status(400).json({ message: 'Invalid lesson engagement.' })
  }

  const progress = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    if (!findCourseLesson(enrollment.modules, lessonId)) return { error: 'Lesson not found.' }

    const [lessonProgress] = await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id, active_seconds, video_position_seconds)
      VALUES (${enrollmentId}, ${lessonId}, ${activeSeconds}, ${videoPositionSeconds ?? 0})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE
      SET active_seconds = student_lesson_progress.active_seconds + ${activeSeconds},
          video_position_seconds = CASE
            WHEN ${videoPositionSeconds ?? null}::NUMERIC IS NULL THEN student_lesson_progress.video_position_seconds
            ELSE ${videoPositionSeconds ?? 0}
          END,
          last_accessed_at = NOW()
      RETURNING started_at AS "startedAt",
                completed_at AS "completedAt",
                active_seconds AS "activeSeconds",
                video_position_seconds::FLOAT AS "videoPositionSeconds",
                last_accessed_at AS "lastAccessedAt"
    `

    if (quizAttemptId !== undefined) {
      const [quizAttempt] = await transaction`
        UPDATE quiz_attempts
        SET active_seconds = active_seconds + ${activeSeconds}, updated_at = NOW()
        WHERE id = ${quizAttemptId}
          AND enrollment_id = ${enrollmentId}
          AND lesson_id = ${lessonId}
          AND submitted_at IS NULL
        RETURNING id
      `
      if (!quizAttempt) return { error: 'Quiz attempt is no longer active.' }
    }

    return { lessonProgress }
  })

  if (!progress) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (progress.error) return response.status(404).json({ message: progress.error })
  return response.json(progress.lessonProgress)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/complete', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  if (enrollmentId === null || lessonId === null) return response.status(400).json({ message: 'Invalid lesson.' })

  const completion = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson) return { error: 'Lesson not found.' }

    if (lesson.type === 'stepByStepSolver') {
      const completedProblemIds = await getCompletedSolverProblemIds(transaction, enrollmentId, lessonId)
      if (!areSolverProblemsComplete(lesson.stepByStepSolver.problems, completedProblemIds)) return { error: 'Finish every solver problem and its practice questions before completing this lesson.' }
    }
    if (lesson.type === 'quiz') {
      const [completedAttempt] = await transaction`
        SELECT id
        FROM quiz_attempts
        WHERE enrollment_id = ${enrollmentId}
          AND lesson_id = ${lessonId}
          AND submitted_at IS NOT NULL
        LIMIT 1
      `
      if (!completedAttempt) return { error: 'Submit the quiz before completing this lesson.' }
    }

    const [lessonProgress] = await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id, completed_at)
      VALUES (${enrollmentId}, ${lessonId}, NOW())
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE
      SET completed_at = COALESCE(student_lesson_progress.completed_at, NOW()),
          last_accessed_at = NOW()
      RETURNING started_at AS "startedAt",
                completed_at AS "completedAt",
                active_seconds AS "activeSeconds",
                video_position_seconds::FLOAT AS "videoPositionSeconds",
                last_accessed_at AS "lastAccessedAt"
    `
    return { lessonProgress }
  })

  if (!completion) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (completion.error) return response.status(400).json({ message: completion.error })
  return response.json(completion.lessonProgress)
})

app.get('/api/enrollments/:enrollmentId/lessons/:lessonId/article-interactions', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  if (enrollmentId === null || lessonId === null) return response.status(400).json({ message: 'Invalid article lesson.' })
  const state = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson || lesson.type !== 'article') return { error: 'Article lesson not found.' }
    const helpRequests = await transaction`
      SELECT section_index AS "sectionIndex", question, flagged_at AS "flaggedAt", question_at AS "questionAt", teacher_reply AS "teacherReply", teacher_reply_at AS "teacherReplyAt"
      FROM article_help_requests
      WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId}
      ORDER BY section_index
    `
    const checkpointRows = await transaction`
      SELECT checkpoint_id AS "checkpointId", selected_option AS "selectedOption", skipped, is_correct AS "isCorrect", answered_at AS "answeredAt"
      FROM article_checkpoint_responses
      WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId}
      ORDER BY checkpoint_id
    `
    const checkpoints = getArticleCheckpoints(lesson)
    const checkpointResponses = checkpointRows.flatMap((row) => {
      const checkpoint = checkpoints.find((item) => item.id === Number(row.checkpointId))
      return checkpoint ? [toCheckpointResponse(row, checkpoint)] : []
    })
    return { helpRequests, checkpointResponses }
  })
  if (!state) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (state.error) return response.status(404).json({ message: state.error })
  return response.json(state)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/article-checkpoints/:checkpointId/answer', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const checkpointId = parseEnrollmentId(request.params.checkpointId)
  const skipped = request.body?.skipped === true
  const selectedOption = request.body?.selectedOption
  if (enrollmentId === null || lessonId === null || checkpointId === null || (!skipped && !Number.isInteger(selectedOption))) return response.status(400).json({ message: 'Invalid checkpoint answer.' })

  const result = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson || lesson.type !== 'article') return { error: 'Article lesson not found.' }
    const checkpoint = getArticleCheckpoints(lesson).find((item) => item.id === checkpointId)
    if (!checkpoint) return { error: 'Check not found.' }
    if (!skipped && (selectedOption < 0 || selectedOption >= checkpoint.options.length)) return { error: 'Choose one of the answer options.' }

    const isCorrect = skipped ? null : selectedOption === checkpoint.correctOption
    const [inserted] = await transaction`
      INSERT INTO article_checkpoint_responses (enrollment_id, lesson_id, checkpoint_id, selected_option, skipped, is_correct)
      VALUES (${enrollmentId}, ${lessonId}, ${checkpointId}, ${skipped ? null : selectedOption}, ${skipped}, ${isCorrect})
      ON CONFLICT (enrollment_id, lesson_id, checkpoint_id) DO NOTHING
      RETURNING checkpoint_id AS "checkpointId", selected_option AS "selectedOption", skipped, is_correct AS "isCorrect", answered_at AS "answeredAt"
    `
    const [row] = inserted ? [inserted] : await transaction`
      SELECT checkpoint_id AS "checkpointId", selected_option AS "selectedOption", skipped, is_correct AS "isCorrect", answered_at AS "answeredAt"
      FROM article_checkpoint_responses
      WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND checkpoint_id = ${checkpointId}
    `
    await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id)
      VALUES (${enrollmentId}, ${lessonId})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET last_accessed_at = NOW()
    `
    return toCheckpointResponse(row, checkpoint)
  })

  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.json(result)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/article-help', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sectionIndex = request.body?.sectionIndex
  const question = typeof request.body?.question === 'string' ? request.body.question.trim() : ''
  if (enrollmentId === null || lessonId === null || !Number.isInteger(sectionIndex) || sectionIndex < 0 || question.length > 1000) return response.status(400).json({ message: 'Invalid help request.' })

  const result = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson || lesson.type !== 'article') return { error: 'Article lesson not found.' }
    if (sectionIndex >= getArticleSectionTitles(lesson.articleBody).length) return { error: 'Section not found.' }
    if ((lesson.articleHelpDisabledSections ?? []).includes(sectionIndex)) return { error: 'Help requests are not enabled for this section.' }

    const [helpRequest] = await transaction`
      INSERT INTO article_help_requests (enrollment_id, lesson_id, section_index, question, question_at)
      VALUES (${enrollmentId}, ${lessonId}, ${sectionIndex}, ${question || null}, ${question ? sql`NOW()` : sql`NULL`})
      ON CONFLICT (enrollment_id, lesson_id, section_index) DO UPDATE
      SET question = COALESCE(EXCLUDED.question, article_help_requests.question),
          question_at = COALESCE(EXCLUDED.question_at, article_help_requests.question_at)
      RETURNING section_index AS "sectionIndex", question, flagged_at AS "flaggedAt", question_at AS "questionAt", teacher_reply AS "teacherReply", teacher_reply_at AS "teacherReplyAt"
    `
    await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id)
      VALUES (${enrollmentId}, ${lessonId})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET last_accessed_at = NOW()
    `
    return helpRequest
  })

  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.status(201).json(result)
})

app.put('/api/enrollments/:enrollmentId/study-plan', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonIds = request.body?.lessonIds
  if (enrollmentId === null || !Array.isArray(lessonIds) || lessonIds.length > 1000 || !lessonIds.every((id) => Number.isSafeInteger(id) && id > 0) || new Set(lessonIds).size !== lessonIds.length) {
    return response.status(400).json({ message: 'Invalid study plan.' })
  }

  const result = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment || enrollment.classId === null) return { status: 404, message: 'Class enrollment not found.' }
    const planLessonIds = new Set(getCourseLessons(deserializeJson(enrollment.modules)).filter((lesson) => lesson?.type !== 'practice').map((lesson) => lesson.id))
    if (!lessonIds.every((id) => planLessonIds.has(id))) return { status: 400, message: 'Study plan includes lessons outside this class.' }

    const [plan] = await transaction`
      INSERT INTO study_plans (enrollment_id, lesson_order, generated_at)
      VALUES (${enrollmentId}, ${JSON.stringify(lessonIds)}::jsonb, NOW())
      ON CONFLICT (enrollment_id) DO UPDATE
      SET lesson_order = EXCLUDED.lesson_order,
          generated_at = EXCLUDED.generated_at
      RETURNING lesson_order AS "lessonOrder", generated_at AS "generatedAt"
    `
    return { status: 200, plan }
  })

  if (result.status !== 200) return response.status(result.status).json({ message: result.message })
  return response.json({ lessonOrder: deserializeJson(result.plan.lessonOrder), generatedAt: result.plan.generatedAt })
})

app.post('/api/enrollments/:enrollmentId/live-sessions/:lessonId/join', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  if (enrollmentId === null || lessonId === null) return response.status(400).json({ message: 'Invalid live session.' })

  const joinLog = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    if (enrollment.classId === null) return { error: 'Live session not found.' }
    if (enrollment.classStatus !== 'enrolled') return { error: 'Live sessions are available once your class seat is confirmed.', status: 403 }
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson || lesson.type !== 'live') return { error: 'Live session not found.' }
    const startsAt = new Date(lesson.scheduledAt).getTime()
    const endsAt = lesson.endsAt ? new Date(lesson.endsAt).getTime() : startsAt + (Number(lesson.estimatedDuration) || 60 * 60) * 1000
    const now = Date.now()
    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || now < startsAt || now >= startsAt + 15 * 60 * 1000 || now >= endsAt) {
      return { error: 'The live-session join window is closed.', status: 409 }
    }
    const [saved] = await transaction`
      INSERT INTO class_session_join_logs (enrollment_id, lesson_id)
      VALUES (${enrollmentId}, ${lessonId})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET clicked_at = NOW()
      RETURNING clicked_at AS "clickedAt"
    `
    return { clickedAt: saved.clickedAt }
  })

  if (!joinLog) return response.status(404).json({ message: 'Class enrollment not found.' })
  if (joinLog.error) return response.status(joinLog.status ?? 404).json({ message: joinLog.error })
  return response.status(201).json(joinLog)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/quiz-attempts', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  if (enrollmentId === null || lessonId === null) return response.status(400).json({ message: 'Invalid quiz lesson.' })

  const quizAttempt = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson || lesson.type !== 'quiz') return { error: 'Quiz lesson not found.' }
    const timeLimitSeconds = getQuizTimeLimitSeconds(lesson.quizQuestions)
    let scheduledDeadline = null
    if (enrollment.classId !== null) {
      const scheduledAt = typeof lesson.scheduledAt === 'string' ? Date.parse(lesson.scheduledAt) : NaN
      if (!Number.isFinite(scheduledAt)) return { error: 'This class quiz has no valid start date and time.', status: 409 }
      if (Date.now() < scheduledAt) return { error: 'This quiz is not available yet.', status: 409 }
      scheduledDeadline = getQuizDeadline(lesson.scheduledAt, timeLimitSeconds)
      if (Date.now() >= Date.parse(scheduledDeadline)) return { error: 'This quiz is closed.', status: 409 }
    }

    const completedAttempts = await transaction`
      SELECT id, answers, violations, disqualified, passed, retake_approved AS "retakeApproved"
      FROM quiz_attempts
      WHERE enrollment_id = ${enrollmentId}
        AND lesson_id = ${lessonId}
        AND submitted_at IS NOT NULL
      ORDER BY submitted_at DESC
    `
    if (completedAttempts.length > 0) {
      const latestAttempt = completedAttempts[0]
      const hasApprovedRetake = completedAttempts.some((attempt) => attempt.retakeApproved)
      const violations = deserializeJson(latestAttempt.violations)
      const requiresApproval = latestAttempt.disqualified || (Array.isArray(violations) && violations.length > 0)
      if (completedAttempts.length >= 2) return { error: 'Only one quiz retake is allowed.' }
      if (latestAttempt.passed) return { error: 'Passed quizzes cannot be retaken.' }
      if (requiresApproval && !hasApprovedRetake) return { error: 'An administrator must approve a retake after a quiz violation.' }
    }

    const [attempt] = await transaction`
      INSERT INTO quiz_attempts (enrollment_id, lesson_id, time_limit_seconds, deadline_at)
      VALUES (${enrollmentId}, ${lessonId}, ${timeLimitSeconds}, COALESCE(${scheduledDeadline}::timestamptz, NOW() + ${timeLimitSeconds} * INTERVAL '1 second'))
      ON CONFLICT (enrollment_id, lesson_id) WHERE submitted_at IS NULL
      DO UPDATE SET time_limit_seconds = CASE WHEN quiz_attempts.time_limit_seconds > 0 THEN quiz_attempts.time_limit_seconds ELSE EXCLUDED.time_limit_seconds END,
                    deadline_at = COALESCE(quiz_attempts.deadline_at, EXCLUDED.deadline_at),
                    updated_at = NOW()
      RETURNING id::INTEGER AS id,
                lesson_id::DOUBLE PRECISION AS "lessonId",
                started_at AS "startedAt",
                active_seconds AS "activeSeconds",
                time_limit_seconds AS "timeLimitSeconds",
                deadline_at AS "deadlineAt",
                COALESCE(answers, '{}'::jsonb) AS answers,
                COALESCE(violations, '[]'::jsonb) AS violations,
                score,
                passed,
                disqualified,
                submitted_at AS "submittedAt"
    `
    return { attempt }
  })

  if (!quizAttempt) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (quizAttempt.error) return response.status(quizAttempt.status ?? 404).json({ message: quizAttempt.error })
  return response.status(201).json(quizAttempt.attempt)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/quiz-attempts/:attemptId/violations', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const attemptId = parseEnrollmentId(request.params.attemptId)
  const violation = request.body?.violation
  if (enrollmentId === null || lessonId === null || attemptId === null || !isPlainObject(violation) || !['visibility', 'fullscreen'].includes(violation.type) || typeof violation.occurredAt !== 'string' || Number.isNaN(Date.parse(violation.occurredAt))) return response.status(400).json({ message: 'Invalid quiz violation.' })

  const saved = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    if (!lesson || lesson.type !== 'quiz') return { error: 'Quiz lesson not found.' }
    const [attempt] = await transaction`
      UPDATE quiz_attempts
      SET violations = COALESCE(violations, '[]'::jsonb) || ${JSON.stringify([{ type: violation.type, occurredAt: violation.occurredAt }])}::jsonb,
          updated_at = NOW()
      WHERE id = ${attemptId} AND enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND submitted_at IS NULL AND NOW() < deadline_at
      RETURNING id::INTEGER AS id, lesson_id::DOUBLE PRECISION AS "lessonId", started_at AS "startedAt", active_seconds AS "activeSeconds", time_limit_seconds AS "timeLimitSeconds", COALESCE(answers, '{}'::jsonb) AS answers, COALESCE(violations, '[]'::jsonb) AS violations, score, passed, submitted_at AS "submittedAt"
    `
    return attempt ? { attempt } : { error: 'Quiz attempt is no longer active.' }
  })
  if (!saved) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (saved.error) return response.status(400).json({ message: saved.error })
  return response.json(saved.attempt)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/quiz-attempts/:attemptId/answers', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const attemptId = parseEnrollmentId(request.params.attemptId)
  const questionId = parseEnrollmentId(String(request.body?.questionId ?? ''))
  const answer = parseQuizAnswerRecord(request.body?.answer)
  if (enrollmentId === null || lessonId === null || attemptId === null || questionId === null || !answer) return response.status(400).json({ message: 'Invalid quiz answer.' })

  const saved = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    const question = (lesson?.quizQuestions ?? []).find((item) => Number(item?.id) === questionId)
    if (!lesson || lesson.type !== 'quiz' || !question) return { error: 'Quiz question not found.' }
    const [attempt] = await transaction`
      UPDATE quiz_attempts
      SET answers = CASE
            WHEN COALESCE(answers->${String(questionId)}->>'status', '') = 'expired' THEN COALESCE(answers, '{}'::jsonb)
            ELSE COALESCE(answers, '{}'::jsonb) || ${JSON.stringify({ [questionId]: answer })}::JSONB
          END,
          updated_at = NOW()
      WHERE id = ${attemptId} AND enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND submitted_at IS NULL AND NOW() < deadline_at
      RETURNING id::INTEGER AS id, lesson_id::DOUBLE PRECISION AS "lessonId", started_at AS "startedAt", active_seconds AS "activeSeconds", time_limit_seconds AS "timeLimitSeconds", COALESCE(answers, '{}'::jsonb) AS answers, score, passed, submitted_at AS "submittedAt"
    `
    return attempt ? { attempt } : { error: 'Quiz attempt is no longer active.' }
  })
  if (!saved) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (saved.error) return response.status(400).json({ message: saved.error })
  return response.json(saved.attempt)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/quiz-attempts/:attemptId/submit', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const attemptId = parseEnrollmentId(request.params.attemptId)
  const answers = request.body?.answers
  const disqualified = request.body?.disqualified === true
  if (enrollmentId === null || lessonId === null || attemptId === null || !isPlainObject(answers) || (request.body?.disqualified !== undefined && typeof request.body.disqualified !== 'boolean')) return response.status(400).json({ message: 'Invalid quiz submission.' })

  const result = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    const questions = Array.isArray(lesson?.quizQuestions) ? lesson.quizQuestions : []
    if (!lesson || lesson.type !== 'quiz' || !questions.length) return { error: 'Quiz questions are unavailable.' }

    const parsedAnswers = parseQuizAnswers(answers, questions)
    if (!parsedAnswers) return { error: 'Invalid quiz answer records.' }
    const [openAttempt] = await transaction`
      SELECT id, started_at AS "startedAt", time_limit_seconds AS "timeLimitSeconds", deadline_at AS "deadlineAt", COALESCE(answers, '{}'::jsonb) AS answers, disqualified
      FROM quiz_attempts
      WHERE id = ${attemptId} AND enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND submitted_at IS NULL
      FOR UPDATE
    `
    if (!openAttempt) return { error: 'Quiz attempt is no longer active.' }
    const expired = isQuizExpired(openAttempt.deadlineAt)
    const finalAnswers = expired ? expireQuizAnswers(deserializeJson(openAttempt.answers) ?? {}, questions) : parsedAnswers
    const finalDisqualified = disqualified || openAttempt.disqualified
    const correctAnswers = questions.filter((question) => selectedOptionFromRecord(finalAnswers[String(question.id)], question) === question.correctOption).length
    const score = Math.round((correctAnswers / questions.length) * 100)
    const passThreshold = Number.isInteger(lesson.passThreshold) ? lesson.passThreshold : 70
    const passed = !finalDisqualified && score >= passThreshold
    const [attempt] = await transaction`
      UPDATE quiz_attempts
      SET answers = ${JSON.stringify(finalAnswers)}::JSONB,
          score = ${score},
          passed = ${passed},
          disqualified = ${finalDisqualified},
          submitted_at = CASE WHEN ${expired} THEN deadline_at ELSE NOW() END,
          updated_at = NOW()
      WHERE id = ${attemptId}
        AND enrollment_id = ${enrollmentId}
        AND lesson_id = ${lessonId}
        AND submitted_at IS NULL
      RETURNING id::INTEGER AS id,
                lesson_id::DOUBLE PRECISION AS "lessonId",
                started_at AS "startedAt",
                active_seconds AS "activeSeconds",
                time_limit_seconds AS "timeLimitSeconds",
                deadline_at AS "deadlineAt",
                answers,
                violations,
                score,
                passed,
                disqualified,
                submitted_at AS "submittedAt"
    `
    if (!attempt) return { error: 'Quiz attempt is no longer active.' }
    return { attempt: { ...attempt, questionResults: getQuestionResults(deserializeJson(enrollment.modules), attempt) } }
  })

  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(400).json({ message: result.error })
  return response.json(result.attempt)
})

app.post('/api/enrollments/:enrollmentId/lessons/:lessonId/practice-answers', requireAuthenticated, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const questionId = parseEnrollmentId(String(request.body?.questionId ?? ''))
  const answer = typeof request.body?.answer === 'string' ? request.body.answer.trim() : ''
  if (enrollmentId === null || lessonId === null || questionId === null || !answer) return response.status(400).json({ message: 'Choose a valid practice answer.' })
  const result = await sql.begin(async (transaction) => {
    const enrollment = await getOwnedEnrollment(transaction, request.userId, enrollmentId)
    if (!enrollment) return null
    const lesson = findCourseLesson(enrollment.modules, lessonId)
    const question = (lesson?.practiceQuestions ?? []).find((item) => Number(item?.id) === questionId)
    if (!lesson || lesson.type !== 'practice' || !question) return { error: 'Practice question not found.' }
    const correct = answer === question.correctAnswer
    await transaction`INSERT INTO practice_answers ${sql({ user_id: request.userId, enrollment_id: enrollmentId, lesson_id: lessonId, question_id: questionId, topic: question.topic, correct })}`
    return { correct }
  })
  if (!result) return response.status(404).json({ message: 'Course enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.status(201).json(result)
})

app.post('/api/admin/quiz-attempts/:attemptId/retake-approval', requireAdmin, async (request, response) => {
  const attemptId = parseEnrollmentId(request.params.attemptId)
  if (attemptId === null) return response.status(400).json({ message: 'Invalid quiz attempt.' })
  const [attempt] = await sql`
    UPDATE quiz_attempts
    SET retake_approved = true, updated_at = NOW()
    WHERE id = ${attemptId} AND submitted_at IS NOT NULL
    RETURNING id::INTEGER AS id, retake_approved AS "retakeApproved"
  `
  if (!attempt) return response.status(404).json({ message: 'Quiz attempt not found.' })
  return response.json(attempt)
})

const paymentProofMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const manualPaymentMethods = [
  { provider: 'Telebirr', accountNumber: '+251919747309' },
  { provider: 'CBE', accountNumber: '1000444421227' },
  { provider: 'Abyssinia Bank', accountNumber: '9445827' },
]

const parsePaymentProof = (fileData, fileName) => {
  if (typeof fileData !== 'string' || typeof fileName !== 'string') return null
  const match = fileData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i)
  const safeFileName = fileName.trim().replace(/[\r\n"]/g, '')
  if (!match || !paymentProofMimeTypes.has(match[1].toLowerCase()) || !safeFileName || safeFileName.length > 255 || /[\\/]/.test(safeFileName)) return null
  const content = Buffer.from(match[2], 'base64')
  if (!content.length || content.length > 6 * 1024 * 1024) return null
  const mimeType = match[1].toLowerCase()
  const isJpeg = mimeType === 'image/jpeg' && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
  const isPng = mimeType === 'image/png' && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isWebp = mimeType === 'image/webp' && content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP'
  if (!isJpeg && !isPng && !isWebp) return null
  return { content, fileName: safeFileName, mimeType }
}

app.get('/api/enrollment/payment-info', async (request, response) => {
  const courseId = parseCourseId(String(request.query.courseId ?? ''))
  const classId = parseCourseId(String(request.query.classId ?? ''))
  if ((courseId === null) === (classId === null)) return response.status(400).json({ message: 'Choose a course or class.' })

  const [item] = classId === null ? await sql`
    SELECT id::INTEGER AS id, title, price::FLOAT AS amount
    FROM courses
    WHERE id = ${courseId} AND status = 'Published'
  ` : await sql`
    SELECT id::INTEGER AS id, title, price::FLOAT AS amount, schedule
    FROM classes
    WHERE id = ${classId} AND published = true AND status IN ('open', 'full')
  `
  if (!item) return response.status(404).json({ message: 'This enrollment is not available.' })
  if (classId !== null && isClassEnrollmentClosed(deserializeJson(item.schedule))) return response.status(409).json({ message: 'This batch has already started. Enrollment is closed.' })

  const paymentItem = { id: item.id, title: item.title, amount: item.amount }
  return response.json({
    ...paymentItem,
    currency: process.env.MANUAL_PAYMENT_CURRENCY ?? process.env.CHAPA_CURRENCY ?? 'ETB',
    paymentMethods: manualPaymentMethods,
    instructions: process.env.MANUAL_PAYMENT_INSTRUCTIONS?.trim() ?? '',
    configured: true,
  })
})

const isCrossSiteRequest = (request) => {
  if (request.get('sec-fetch-site') === 'cross-site') return true
  const origin = request.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host !== request.get('host')
  } catch {
    return true
  }
}

const enrollmentTargetKey = (courseId, classId) => classId === null ? `course:${courseId}` : `class:${classId}`

class EmailDeliveryFailure extends Error {}

app.post('/api/enrollment/verification-code', async (request, response) => {
  if (isCrossSiteRequest(request)) return response.status(403).json({ message: 'Request origin is not allowed.' })
  await loadAuthenticatedUser(request, response)

  const courseId = parseCourseId(String(request.body?.courseId ?? ''))
  const classId = parseCourseId(String(request.body?.classId ?? ''))
  if ((courseId === null) === (classId === null)) return response.status(400).json({ message: 'Choose a course or class.' })
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  if (!isValidEmailAddress(email)) return response.status(400).json({ message: 'Enter a valid email address.' })

  const ipAddress = request.ip ?? request.socket.remoteAddress ?? 'unknown'
  const ipLimited = await sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(hashtext(${`enrollment-code-ip:${ipAddress}`}))`
    await transaction`DELETE FROM enrollment_code_send_requests WHERE requested_at <= NOW() - ${verificationIpWindowMinutes} * INTERVAL '1 minute'`
    const [{ count }] = await transaction`SELECT COUNT(*)::INTEGER AS count FROM enrollment_code_send_requests WHERE ip = ${ipAddress}`
    if (count >= verificationIpMaxRequests) return true
    await transaction`INSERT INTO enrollment_code_send_requests (ip) VALUES (${ipAddress})`
    return false
  })
  if (ipLimited) return response.status(429).json({ message: `Too many verification code requests from this network. Try again in ${verificationIpWindowMinutes} minutes.` })

  const [takenEmail] = await sql`SELECT id FROM users WHERE email = ${email} AND id IS DISTINCT FROM ${request.userId ?? null}`
  if (takenEmail) return response.status(409).json({ message: 'An account with this email already exists. Sign in to continue.' })

  const targetKey = enrollmentTargetKey(courseId, classId)
  const code = generateVerificationCode()
  const codeHash = hashVerificationCode(email, targetKey, code)
  try {
    const cooldown = await sql.begin(async (transaction) => {
      const [claimed] = await transaction`
        INSERT INTO enrollment_email_verifications (email, target_key, code_hash, code_expires_at, attempts, last_sent_at, verified_until)
        VALUES (${email}, ${targetKey}, ${codeHash}, NOW() + ${verificationCodeLifetimeMinutes} * INTERVAL '1 minute', 0, NOW(), NULL)
        ON CONFLICT (email, target_key) DO UPDATE SET
          code_hash = EXCLUDED.code_hash,
          code_expires_at = EXCLUDED.code_expires_at,
          attempts = 0,
          last_sent_at = EXCLUDED.last_sent_at,
          verified_until = NULL
        WHERE enrollment_email_verifications.last_sent_at <= NOW() - ${verificationResendCooldownSeconds} * INTERVAL '1 second'
        RETURNING id
      `
      if (!claimed) {
        const [record] = await transaction`
          SELECT CEIL(EXTRACT(EPOCH FROM (last_sent_at + ${verificationResendCooldownSeconds} * INTERVAL '1 second' - NOW())))::INTEGER AS "retryAfterSeconds"
          FROM enrollment_email_verifications
          WHERE email = ${email} AND target_key = ${targetKey}
        `
        return { retryAfterSeconds: Math.max(1, record?.retryAfterSeconds ?? 1) }
      }
      try {
        await sendEnrollmentVerificationEmail({ to: email, code })
      } catch (error) {
        console.error('Enrollment verification email failed', error?.code ?? error?.message ?? 'unknown')
        throw new EmailDeliveryFailure()
      }
      return null
    })
    if (cooldown) return response.status(429).json({ message: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting another code.`, retryAfterSeconds: cooldown.retryAfterSeconds })
    return response.json({ resendAfterSeconds: verificationResendCooldownSeconds })
  } catch (error) {
    if (error instanceof EmailDeliveryFailure) return response.status(503).json({ message: 'We could not send the verification code. Please try again shortly.' })
    throw error
  }
})

app.post('/api/enrollment/verify-code', async (request, response) => {
  if (isCrossSiteRequest(request)) return response.status(403).json({ message: 'Request origin is not allowed.' })

  const courseId = parseCourseId(String(request.body?.courseId ?? ''))
  const classId = parseCourseId(String(request.body?.classId ?? ''))
  if ((courseId === null) === (classId === null)) return response.status(400).json({ message: 'Choose a course or class.' })
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  if (!isValidEmailAddress(email)) return response.status(400).json({ message: 'Enter a valid email address.' })
  const code = typeof request.body?.code === 'string' ? request.body.code.trim() : ''
  if (!/^\d{6}$/.test(code)) return response.status(400).json({ message: 'Enter the 6-digit code from your email.' })

  const targetKey = enrollmentTargetKey(courseId, classId)
  const outcome = await sql.begin(async (transaction) => {
    const [record] = await transaction`
      SELECT id, code_hash AS "codeHash", attempts, code_expires_at <= NOW() AS expired
      FROM enrollment_email_verifications
      WHERE email = ${email} AND target_key = ${targetKey}
      FOR UPDATE
    `
    const tooManyAttempts = { status: 429, message: 'Too many incorrect codes. Request a new code to continue.' }
    if (!record?.codeHash) return { status: 400, message: 'Request a new verification code to continue.' }
    if (record.expired) return { status: 400, message: 'This code has expired. Request a new code to continue.' }
    if (record.attempts >= verificationMaxIncorrectAttempts) return tooManyAttempts
    if (record.codeHash !== hashVerificationCode(email, targetKey, code)) {
      const [updated] = await transaction`
        UPDATE enrollment_email_verifications SET attempts = attempts + 1 WHERE id = ${record.id} RETURNING attempts
      `
      if (updated.attempts >= verificationMaxIncorrectAttempts) return tooManyAttempts
      return { status: 400, message: 'That code is incorrect. Check your email and try again.' }
    }
    await transaction`
      UPDATE enrollment_email_verifications
      SET code_hash = NULL, verified_until = NOW() + ${verifiedEnrollmentWindowMinutes} * INTERVAL '1 minute'
      WHERE id = ${record.id}
    `
    return { status: 200 }
  })
  if (outcome.status !== 200) return response.status(outcome.status).json({ message: outcome.message })
  return response.json({ verified: true })
})

app.post('/api/enrollment/manual-payment', async (request, response) => {
  if (isCrossSiteRequest(request)) return response.status(403).json({ message: 'Request origin is not allowed.' })

  const authenticated = await loadAuthenticatedUser(request, response)
  if (authenticated && request.mustResetPassword) return response.status(403).json({ message: 'A password change is required before using this account.' })

  const courseId = parseCourseId(String(request.body?.courseId ?? ''))
  const classId = parseCourseId(String(request.body?.classId ?? ''))
  if ((courseId === null) === (classId === null)) return response.status(400).json({ message: 'Choose a course or class.' })
  const proof = parsePaymentProof(request.body?.proofData, request.body?.proofFileName)
  if (!proof) return response.status(400).json({ message: 'Upload a JPG, PNG, or WebP payment screenshot up to 6 MB.' })
  const profile = isValidUserProfile(request.body)
  if (!profile || !profile.phone) return response.status(400).json({ message: 'Enter your name, valid email, and phone number.' })
  if (!authenticated && !isValidCredentials(profile.email, request.body?.password)) return response.status(400).json({ message: 'Enter a valid email and a password between 8 and 128 characters.' })

  const passwordHash = authenticated ? null : await hashPassword(request.body.password)
  const targetKey = enrollmentTargetKey(courseId, classId)

  let result
  try {
    result = await sql.begin(async (transaction) => {
      const [item] = classId === null ? await transaction`
        SELECT id, title, price::FLOAT AS amount
        FROM courses
        WHERE id = ${courseId} AND status = 'Published'
        FOR SHARE
      ` : await transaction`
        SELECT id, title, price::FLOAT AS amount, schedule
        FROM classes
        WHERE id = ${classId} AND published = true AND status IN ('open', 'full')
        FOR SHARE
      `
      if (!item) return { error: 'This enrollment is not available.', status: 404 }
      if (classId !== null && isClassEnrollmentClosed(deserializeJson(item.schedule))) return { error: 'This batch has already started. Enrollment is closed.', status: 409 }

      const [verification] = await transaction`
        SELECT id FROM enrollment_email_verifications
        WHERE email = ${profile.email} AND target_key = ${targetKey} AND verified_until > NOW()
        FOR UPDATE
      `
      if (!verification) return { error: 'Verify your email before submitting your payment.', status: 403 }

      if (authenticated) {
        const [activeEnrollment] = await transaction`
          SELECT enrollments.id
          FROM enrollments
          INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
          WHERE enrollments.user_id = ${request.userId}
            AND (payments.course_id = ${courseId} OR payments.class_id = ${classId})
          LIMIT 1
        `
        if (activeEnrollment) return { error: 'You already have active access to this item.', status: 409 }

        const [pendingPayment] = await transaction`
          SELECT id FROM payments
          WHERE user_id = ${request.userId} AND payment_method = 'manual' AND verification_status = 'pending'
            AND (course_id = ${courseId} OR class_id = ${classId})
          LIMIT 1
        `
        if (pendingPayment) return { error: 'A payment for this item is already awaiting verification.', status: 409 }
      }

      const [user] = authenticated ? await transaction`
        UPDATE users
        SET name = ${profile.name}, email = ${profile.email}, phone = ${profile.phone}
        WHERE id = ${request.userId} AND status = 'Active'
        RETURNING id, name, email, phone, role, to_char(created_at, 'FMMonth DD, YYYY') AS "createdAt"
      ` : await transaction`
        INSERT INTO users ${transaction({ name: profile.name, email: profile.email, phone: profile.phone, password_hash: passwordHash })}
        RETURNING id, name, email, phone, role, to_char(created_at, 'FMMonth DD, YYYY') AS "createdAt"
      `
      if (!user) return { error: 'Student account not found.', status: 404 }

      const reference = `manual-${classId === null ? 'course' : 'class'}-${item.id}-${randomBytes(12).toString('hex')}`
      const students = [{ fullName: user.name, ageOrGrade: 'Not provided', relationship: 'Self', preferredLanguage: 'Not provided', emergencyPhone: user.phone, notes: '' }]
      const [payment] = await transaction`
        INSERT INTO payments ${transaction({
          reference,
          user_id: user.id,
          course_id: classId === null ? item.id : null,
          class_id: classId,
          student_data: JSON.stringify(students),
          contact_data: JSON.stringify({ name: user.name, email: user.email, phone: user.phone }),
          amount: item.amount,
          currency: process.env.MANUAL_PAYMENT_CURRENCY ?? process.env.CHAPA_CURRENCY ?? 'ETB',
          payment_method: 'manual',
          verification_status: 'pending',
          proof_image: proof.content,
          proof_mime_type: proof.mimeType,
          proof_file_name: proof.fileName,
        })}
        RETURNING id::INTEGER AS id
      `
      await transaction`DELETE FROM enrollment_email_verifications WHERE id = ${verification.id}`
      return { id: payment.id, item: item.title, user }
    })
  } catch (error) {
    if (error.code === '23505') {
      const message = String(error.constraint ?? '').includes('payments_manual_pending')
        ? 'A payment for this item is already awaiting verification.'
        : 'An account with this email already exists.'
      return response.status(409).json({ message })
    }
    throw error
  }

  if (result.error) return response.status(result.status).json({ message: result.error })
  return response.status(201).json({ id: result.id, item: result.item, user: result.user, status: 'pending_verification' })
})

app.post('/api/payments/chapa', async (request, response) => {
  await loadAuthenticatedUser(request)
  const courseId = parseCourseId(String(request.body?.courseId ?? ''))
  const practiceExamId = parseCourseId(String(request.body?.practiceExamId ?? ''))
  const bookstoreItemId = parseCourseId(String(request.body?.bookstoreItemId ?? ''))
  if (courseId !== null) return response.status(410).json({ message: 'Course enrollment now uses manual payment verification.' })
  const itemCount = [courseId, practiceExamId, bookstoreItemId].filter((id) => id !== null).length
  if (itemCount === 0) return response.status(400).json({ message: 'Choose a valid item.' })
  if (itemCount > 1) return response.status(400).json({ message: 'Choose only one item.' })
  if (!request.userId && (courseId !== null || practiceExamId !== null)) return response.status(401).json({ message: 'Authentication is required.' })
  if (!isTestChapa && !process.env.CHAPA_SECRET_KEY) return response.status(503).json({ message: 'Chapa checkout has not been configured yet.' })

  const [course] = courseId === null ? [null] : await sql`
    SELECT courses.id, courses.title, courses.price::FLOAT AS price, users.name, users.email, users.phone
    FROM courses
    INNER JOIN users ON users.id = ${request.userId}
    WHERE courses.id = ${courseId}
      AND courses.status = 'Published'
  `
  const [practiceExam] = practiceExamId === null ? [null] : await sql`
    SELECT practice_exams.id, practice_exams.title, practice_exams.price::FLOAT AS price, users.name, users.email, users.phone
    FROM practice_exams
    INNER JOIN users ON users.id = ${request.userId}
    WHERE practice_exams.id = ${practiceExamId}
      AND practice_exams.published = true
  `
  let bookstoreItem = null
  if (bookstoreItemId !== null) {
    if (request.userId) {
      [bookstoreItem] = await sql`
        SELECT bookstore_items.id, bookstore_items.title, bookstore_items.price::FLOAT AS price, users.name, users.email, users.phone
        FROM bookstore_items
        INNER JOIN users ON users.id = ${request.userId}
        WHERE bookstore_items.id = ${bookstoreItemId}
          AND bookstore_items.published = true
      `
    } else {
      const suppliedGuestEmail = typeof request.body?.guestEmail === 'string' ? request.body.guestEmail.trim() : ''
      const guestEmail = isValidEmail(suppliedGuestEmail) ? suppliedGuestEmail : `guest-${randomBytes(18).toString('hex')}@guest.invalid`
      const guestName = typeof request.body?.guestName === 'string' ? request.body.guestName.trim() : ''
      const guestPhone = typeof request.body?.guestPhone === 'string' ? request.body.guestPhone.trim() : ''
      if (guestName.length > 200 || guestPhone.length > 50) return response.status(400).json({ message: 'Guest details are too long.' })
      const guestItems = await sql`
        SELECT bookstore_items.id, bookstore_items.title, bookstore_items.price::FLOAT AS price,
               ${guestName || 'Student'} AS name, ${guestEmail} AS email, ${guestPhone} AS phone
        FROM bookstore_items
        WHERE bookstore_items.id = ${bookstoreItemId}
          AND bookstore_items.published = true
      `
      bookstoreItem = guestItems[0] ?? null
    }
  }
  const item = course ?? practiceExam ?? bookstoreItem
  if (!item) return response.status(404).json({ message: 'This item is not available for purchase.' })

  const students = [{
    fullName: item.name.trim() || 'Student',
    ageOrGrade: 'Not provided',
    relationship: 'Self',
    preferredLanguage: 'Not provided',
    emergencyPhone: '',
    notes: '',
  }]
  const referencePrefix = isTestChapa
    ? (bookstoreItem ? 'test-book' : practiceExam ? 'test-practice' : 'test-course')
    : (bookstoreItem ? 'book' : practiceExam ? 'practice' : 'course')
  const reference = `${referencePrefix}-${item.id}-${randomBytes(12).toString('hex')}`
  const currency = process.env.CHAPA_CURRENCY ?? 'ETB'
  const amount = item.price * students.length
  let resolvedUserId = request.userId
  if (!resolvedUserId) {
    const guestEmail = `guest-${randomBytes(18).toString('hex')}@guest.invalid`
    const guestPasswordHash = await hashPassword(randomBytes(32).toString('base64url'))
    const [guestUser] = await sql`
      INSERT INTO users ${sql({ name: item.name.trim() || 'Student', phone: item.phone || '', email: guestEmail, password_hash: guestPasswordHash, role: 'student', status: 'Active' })}
      RETURNING id
    `
    resolvedUserId = Number(guestUser.id)
  }
  const [payment] = await sql`
    INSERT INTO payments ${sql({ reference, user_id: resolvedUserId, course_id: course?.id ?? null, practice_exam_id: practiceExam?.id ?? null, bookstore_item_id: bookstoreItem?.id ?? null, student_data: JSON.stringify(students), amount, currency })}
    RETURNING id
  `

  if (isTestChapa) return response.status(201).json({ checkoutUrl: '', paymentReference: reference, mode: 'test' })

  const baseUrl = process.env.APP_URL ?? `${request.protocol}://${request.get('host')}`
  const nameParts = item.name.trim().split(/\s+/)
  try {
    const chapaResponse = await fetch('https://api.chapa.global/v2/payments/hosted', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        merchant_reference: reference,
        customer: {
          first_name: nameParts[0] || 'Student',
          last_name: nameParts.slice(1).join(' '),
          email: item.email,
          phone_number: item.phone || undefined,
        },
        meta: bookstoreItem ? { order_id: reference, bookstore_item_id: bookstoreItem.id } : practiceExam ? { order_id: reference, practice_exam_id: practiceExam.id } : { order_id: reference, course_id: course.id },
        return_url: bookstoreItem ? `${baseUrl}/bookstore?payment=${reference}` : practiceExam ? `${baseUrl}/practice-exams/${practiceExam.id}?payment=${reference}` : `${baseUrl}/courses/${course.id}?payment=${reference}`,
        callback_url: `${baseUrl}/api/payments/chapa/webhook`,
      }),
    })
    const chapaPayment = await chapaResponse.json().catch(() => null)
    const checkoutUrl = chapaPayment?.data?.checkout_url
    const chapaReference = chapaPayment?.data?.chapa_reference
    if (!chapaResponse.ok || typeof checkoutUrl !== 'string') throw new Error('Chapa did not return a checkout link.')
    if (typeof chapaReference === 'string' && chapaReference) await sql`UPDATE payments SET chapa_reference = ${chapaReference} WHERE id = ${payment.id}`
    return response.status(201).json({ checkoutUrl, paymentReference: typeof chapaReference === 'string' && chapaReference ? chapaReference : reference, mode: 'live' })
  } catch (error) {
    await sql`UPDATE payments SET status = 'failed' WHERE id = ${payment.id}`
    throw error
  }
})

app.post('/api/payments/chapa/class', requireAuthenticated, (_request, response) => response.status(410).json({ message: 'Class enrollment now uses manual payment verification.' }))

app.get('/api/payments/chapa/:reference/bookstore-download', async (request, response) => {
  const requestedReference = request.params.reference
  if (typeof requestedReference !== 'string' || requestedReference.length > 200 || !/^(?:test-)?book-\d+-[a-f0-9]{24}$/.test(requestedReference)) {
    return response.status(404).json({ message: 'Purchased file not found.' })
  }
  const [payment] = await sql`
    SELECT payments.reference,
           payments.user_id AS "userId",
           payments.chapa_reference AS "chapaReference",
           payments.status,
           bookstore_items.id::INTEGER AS "itemId",
           bookstore_items.download_file AS "downloadFile",
           bookstore_items.download_file_name AS "fileName",
           bookstore_items.download_mime_type AS "mimeType"
    FROM payments
    INNER JOIN bookstore_items ON bookstore_items.id = payments.bookstore_item_id
    WHERE (payments.reference = ${requestedReference} OR payments.chapa_reference = ${requestedReference})
      AND payments.bookstore_item_id IS NOT NULL
  `
  if (!payment) return response.status(404).json({ message: 'Purchased file not found.' })
  if (payment.status === 'pending' && payment.chapaReference) {
    const verification = await verifyChapaTransaction(payment.chapaReference)
    if (verification.status !== 'pending') payment.status = await updatePaymentStatus(payment.reference, verification.status, verification.data)
  }
  if (payment.status !== 'paid') return response.status(409).json({ message: 'Payment is not complete.' })
  if (!payment.downloadFile || !payment.fileName || !payment.mimeType) return response.status(404).json({ message: 'Purchased file not found.' })
  await sql`INSERT INTO bookstore_downloads ${sql({ bookstore_item_id: payment.itemId, user_id: payment.userId })}`
  response.set({
    'Content-Type': payment.mimeType,
    'Content-Length': String(payment.downloadFile.length),
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(payment.fileName)}`,
    'Cache-Control': 'private, no-store',
  })
  return response.send(payment.downloadFile)
})

app.get('/api/payments/chapa/:reference', requireAuthenticated, async (request, response) => {
  const requestedReference = request.params.reference
  const [payment] = await sql`
    SELECT reference, chapa_reference AS "chapaReference", status
    FROM payments
    WHERE (reference = ${requestedReference} OR chapa_reference = ${requestedReference})
      AND user_id = ${request.userId}
  `
  if (!payment) return response.status(404).json({ message: 'Payment not found.' })
  if (payment.status === 'pending') {
    const providerReference = payment.chapaReference ?? (requestedReference === payment.reference ? null : requestedReference)
    if (!providerReference) return response.json({ status: 'pending' })
    const verification = await verifyChapaTransaction(providerReference)
    if (verification.status !== 'pending') await updatePaymentStatus(payment.reference, verification.status, verification.data)
    return response.json({ status: verification.status })
  }
  return response.json({ status: payment.status })
})

app.post('/api/payments/chapa/:reference/test-complete', async (request, response) => {
  if (!isTestChapa) return response.status(404).json({ message: 'Test checkout is not enabled.' })

  const isAuthenticated = await loadAuthenticatedUser(request)
  const reference = request.params.reference
  const status = request.body?.status
  if (!/^test-(?:book|course|class|practice)-\d+-[a-f0-9]{24}$/.test(reference) || !['paid', 'failed'].includes(status)) return response.status(400).json({ message: 'Invalid test payment.' })
  if (!isAuthenticated && !reference.startsWith('test-book-')) return response.status(401).json({ message: 'Authentication is required.' })

  const [payment] = await sql`
    SELECT reference, amount::FLOAT AS amount, currency, status
    FROM payments
    WHERE reference = ${reference}
      ${isAuthenticated ? sql`AND user_id = ${request.userId}` : sql``}
      AND status = 'pending'
  `
  if (!payment) return response.status(404).json({ message: 'Test payment not found.' })

  const updatedStatus = await updatePaymentStatus(reference, status, {
    amount: payment.amount,
    currency: payment.currency,
    merchant_reference: payment.reference,
    chapa_reference: payment.reference,
  })
  return response.json({ status: updatedStatus })
})

app.post('/api/payments/chapa/webhook', async (request, response, next) => {
  const payload = request.body ?? {}
  const merchantReference = payload.merchant_reference ?? payload.data?.merchant_reference ?? payload.meta?.order_id
  const chapaReference = payload.chapa_reference ?? payload.data?.chapa_reference
  if ((typeof merchantReference !== 'string' || merchantReference.length > 200) && (typeof chapaReference !== 'string' || chapaReference.length > 200)) return response.status(400).json({ message: 'Invalid payment reference.' })
  try {
    const [payment] = await sql`
      SELECT reference, chapa_reference AS "chapaReference"
      FROM payments
      WHERE (${typeof merchantReference === 'string' ? sql`reference = ${merchantReference}` : sql`FALSE`}
        OR ${typeof chapaReference === 'string' ? sql`chapa_reference = ${chapaReference}` : sql`FALSE`})
    `
    if (!payment) return response.status(404).json({ message: 'Payment not found.' })
    const providerReference = typeof chapaReference === 'string' ? chapaReference : payment.chapaReference
    if (!providerReference) return response.status(400).json({ message: 'Missing Chapa payment reference.' })
    const verification = await verifyChapaTransaction(providerReference)
    if (verification.status !== 'pending') await updatePaymentStatus(payment.reference, verification.status, verification.data)
    return response.status(204).end()
  } catch (error) {
    return next(error)
  }
})

app.get('/api/practice-purchases', requireAuthenticated, async (request, response) => {
  const purchases = await sql`
    SELECT practice_purchases.id::INTEGER AS id,
           practice_purchases.user_id::INTEGER AS user_id,
           practice_purchases.exam_id::INTEGER AS exam_id,
           practice_purchases.purchased_at
    FROM practice_purchases
    INNER JOIN practice_exams ON practice_exams.id = practice_purchases.exam_id
    WHERE practice_purchases.user_id = ${request.userId}
    ORDER BY practice_purchases.purchased_at DESC, practice_purchases.id DESC
  `
  return response.json(purchases)
})

app.get('/api/bookstore-purchases', requireAuthenticated, async (request, response) => {
  const purchases = await sql`
    SELECT bookstore_purchases.id::INTEGER AS id,
           bookstore_items.id::INTEGER AS "itemId",
           bookstore_items.title,
           bookstore_items.category,
           bookstore_items.price::FLOAT AS price,
           bookstore_items.currency,
           bookstore_items.cover_data AS "coverData",
           bookstore_items.download_file_name AS "fileName",
           bookstore_items.download_size_bytes::INTEGER AS "fileSizeBytes",
           to_char(bookstore_purchases.purchased_at, 'Mon DD, YYYY') AS "purchasedAt"
    FROM bookstore_purchases
    INNER JOIN payments ON payments.id = bookstore_purchases.payment_id AND payments.status = 'paid'
    INNER JOIN bookstore_items ON bookstore_items.id = bookstore_purchases.bookstore_item_id
    WHERE bookstore_purchases.user_id = ${request.userId}
    ORDER BY bookstore_purchases.purchased_at DESC, bookstore_purchases.id DESC
  `
  return response.json(purchases)
})

app.get('/api/payments', requireAuthenticated, async (request, response) => {
  const payments = await sql`
    SELECT payments.id::INTEGER AS id,
           COALESCE(bookstore_items.title, practice_exams.title, CASE WHEN classes.published = true THEN classes.title END, courses.title, 'Purchase') AS "itemName",
           CASE
             WHEN payments.bookstore_item_id IS NOT NULL THEN 'book'
             WHEN payments.practice_exam_id IS NOT NULL THEN 'practice_exam'
             WHEN payments.class_id IS NOT NULL THEN 'class'
             ELSE 'course'
           END AS type,
           payments.amount::FLOAT AS amount,
           payments.currency,
           CASE
             WHEN payments.verification_status = 'pending' THEN 'Pending Verification'
             WHEN payments.verification_status = 'declined' THEN 'Declined'
             WHEN payments.status = 'paid' THEN 'Paid'
             WHEN payments.status = 'failed' THEN 'Failed'
             ELSE 'Pending'
           END AS status,
           payments.review_note AS "reviewNote",
           to_char(payments.created_at, 'Mon DD, YYYY') AS date,
           payments.reference AS "txRef",
           payments.course_id::INTEGER AS "courseId",
           payments.class_id::INTEGER AS "classId"
    FROM payments
    LEFT JOIN courses ON courses.id = payments.course_id
    LEFT JOIN classes ON classes.id = payments.class_id
    LEFT JOIN practice_exams ON practice_exams.id = payments.practice_exam_id
    LEFT JOIN bookstore_items ON bookstore_items.id = payments.bookstore_item_id
    WHERE payments.user_id = ${request.userId}
    ORDER BY payments.created_at DESC, payments.id DESC
  `
  return response.json(payments)
})

app.get('/api/classes', async (_request, response) => {
  const classes = await sql`
    SELECT classes.id::INTEGER AS id,
           classes.title,
           classes.program_id AS "programId",
           classes.schedule,
           classes.price::FLOAT AS price,
           classes.status,
           classes.course_id::INTEGER AS "courseId",
           courses.title AS "courseTitle",
           classes.cover,
           COALESCE(tutors.name, 'Tutor to be confirmed') AS "tutorName",
           classes.capacity,
           COALESCE(enrollment_counts.enrolled_count, 0)::INTEGER AS "enrolledCount",
           COALESCE(class_reviews.average_rating, 0)::FLOAT AS rating,
           COALESCE(class_reviews.rating_count, 0)::INTEGER AS "ratingCount",
           classes.published,
           classes.grade_level AS "gradeLevel",
           jsonb_array_length(CASE WHEN jsonb_typeof(classes.modules) = 'array' THEN classes.modules ELSE '[]'::jsonb END)::INTEGER AS "moduleCount",
           (SELECT COUNT(*)::INTEGER FROM jsonb_array_elements(CASE WHEN jsonb_typeof(classes.modules) = 'array' THEN classes.modules ELSE '[]'::jsonb END) AS module CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(module->'lessons') = 'array' THEN module->'lessons' ELSE '[]'::jsonb END) AS lesson) AS "lessonCount"
    FROM classes
    LEFT JOIN courses ON courses.id = classes.course_id
    LEFT JOIN tutors ON tutors.id = classes.tutor_id
    LEFT JOIN (
      SELECT class_id, COUNT(*) FILTER (WHERE class_status = 'enrolled') AS enrolled_count
      FROM enrollments
      WHERE class_id IS NOT NULL
      GROUP BY class_id
    ) AS enrollment_counts ON enrollment_counts.class_id = classes.id
    LEFT JOIN (
      SELECT class_id, AVG(rating)::FLOAT AS average_rating, COUNT(*)::INTEGER AS rating_count
      FROM class_reviews
      WHERE is_hidden = false
      GROUP BY class_id
    ) AS class_reviews ON class_reviews.class_id = classes.id
    WHERE classes.published = true
      AND classes.status IN ('open', 'full')
    ORDER BY classes.created_at DESC, classes.id DESC
  `
  return response.json(classes.map((classRecord) => {
    const schedule = deserializeJson(classRecord.schedule)
    return { ...classRecord, schedule, enrollmentClosed: isClassEnrollmentClosed(schedule) }
  }).filter((classRecord) => !classRecord.enrollmentClosed))
})

app.get('/api/tutor/overview', requireTutor, async (request, response) => {
  const [overview] = await sql`
    SELECT
      (SELECT COUNT(*) FROM courses WHERE tutor_id = ${request.tutorId})::INTEGER AS "totalCourses",
      (SELECT COUNT(*) FROM classes WHERE tutor_id = ${request.tutorId} AND published = true)::INTEGER AS "totalClasses",
      (SELECT COUNT(DISTINCT enrollments.student_id)
       FROM enrollments
       LEFT JOIN courses ON courses.id = enrollments.course_id
       LEFT JOIN classes ON classes.id = enrollments.class_id
       WHERE enrollments.class_status IS DISTINCT FROM 'waitlisted'
         AND ((classes.id IS NULL AND enrollments.course_id IS NOT NULL) OR classes.published = true)
         AND (courses.tutor_id = ${request.tutorId} OR classes.tutor_id = ${request.tutorId}))::INTEGER AS "totalStudents",
      (SELECT COALESCE(SUM(payments.amount), 0)
       FROM payments
       LEFT JOIN courses ON courses.id = payments.course_id
       LEFT JOIN classes ON classes.id = payments.class_id
       WHERE payments.status = 'paid'
         AND ((classes.id IS NULL AND payments.course_id IS NOT NULL) OR classes.published = true)
         AND (courses.tutor_id = ${request.tutorId} OR classes.tutor_id = ${request.tutorId}))::FLOAT AS "totalRevenue"
  `
  const [upcoming] = await sql`
    SELECT COUNT(*)::INTEGER AS count
    FROM classes
    WHERE tutor_id = ${request.tutorId}
      AND published = true
      AND status <> 'closed'
      AND COALESCE(schedule->>'endDate', '9999-12-31') >= CURRENT_DATE::TEXT
  `
  return response.json({
    tutor: request.tutor,
    ...overview,
    upcomingClasses: upcoming.count,
  })
})

app.get('/api/tutor/courses', requireTutor, async (request, response) => {
  const courses = await sql`
    SELECT ${courseColumns}
    FROM courses
    WHERE tutor_id = ${request.tutorId}
    ORDER BY id
  `
  return response.json(courses.map(deserializeCourse))
})

app.get('/api/tutor/edit-options', requireTutor, async (_request, response) => {
  const tutors = await sql`SELECT id::INTEGER AS id, name FROM tutors WHERE status = 'Active' ORDER BY name`
  return response.json({ tutors })
})

app.get('/api/tutor/classes', requireTutor, async (request, response) => {
  const classes = await sql`
    SELECT classes.id::INTEGER AS id,
           classes.title,
           classes.program_id AS "programId",
           classes.cover,
           classes.tutor_id::INTEGER AS "tutorId",
           tutors.name AS "tutorName",
           classes.grade_level AS "gradeLevel",
           to_char(classes.exam_date, 'YYYY-MM-DD') AS "examDate",
           classes.schedule,
           classes.meeting_link AS "meetingLink",
           classes.price::FLOAT AS price,
           classes.status,
           classes.course_id::INTEGER AS "courseId",
           courses.title AS "courseTitle",
           classes.capacity,
           COALESCE(enrollment_counts.enrolled_count, 0)::INTEGER AS "enrolledCount",
           classes.published,
           classes.modules
    FROM classes
    LEFT JOIN courses ON courses.id = classes.course_id
    LEFT JOIN tutors ON tutors.id = classes.tutor_id
    LEFT JOIN (
      SELECT class_id, COUNT(*) FILTER (WHERE class_status = 'enrolled') AS enrolled_count
      FROM enrollments
      WHERE class_id IS NOT NULL
      GROUP BY class_id
    ) AS enrollment_counts ON enrollment_counts.class_id = classes.id
    WHERE classes.tutor_id = ${request.tutorId}
    ORDER BY classes.created_at DESC, classes.id DESC
  `
  return response.json(classes.map((classRecord) => ({
    ...classRecord,
    schedule: deserializeJson(classRecord.schedule),
    modules: deserializeJson(classRecord.modules) ?? [],
  })))
})

app.put('/api/tutor/courses/:id', requireTutor, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid course id.' })
  const course = parseCoursePayload(request.body)
  if (!course) return response.status(400).json({ message: 'Enter all required course details.' })
  try {
    const tutorId = await findTutorIdByName(course.tutor)
    if (!tutorId) return response.status(400).json({ message: 'Select an active tutor before saving the course.' })
    const courseWithTutor = { ...course, tutor_id: tutorId }
    const updated = await sql.begin(async (transaction) => {
      const [current] = await transaction`SELECT modules FROM courses WHERE id = ${id} AND tutor_id = ${request.tutorId} FOR UPDATE`
      if (!current) return null
      const previousModules = deserializeJson(current.modules)
      const nextModules = deserializeJson(courseWithTutor.modules)
      const addedIds = getChangedCourseLessonIds(previousModules, nextModules)
      const staleProgress = addedIds.length ? await transaction`
        SELECT DISTINCT progress.lesson_id::TEXT AS "lessonId"
        FROM student_lesson_progress progress
        INNER JOIN enrollments ON enrollments.id = progress.enrollment_id
        WHERE enrollments.course_id = ${id}
          AND enrollments.class_id IS NULL
          AND progress.lesson_id::TEXT = ANY(${addedIds})
      ` : []
      const modules = remapReusedCourseLessonIds(previousModules, nextModules, staleProgress.map(({ lessonId }) => lessonId))
      const [saved] = await transaction`
        UPDATE courses
        SET ${transaction({ ...courseWithTutor, modules: JSON.stringify(modules) })}, updated_at = NOW()
        WHERE id = ${id} AND tutor_id = ${request.tutorId}
        RETURNING id
      `
      return saved ?? null
    })
    if (!updated) return response.status(404).json({ message: 'Course not found.' })
    return response.json(await readCourse(id))
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'A course with this title already exists.' })
    throw error
  }
})

app.put('/api/tutor/classes/:id', requireTutor, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Enter valid class details.' })
  const [existing] = await sql`SELECT schedule, modules FROM classes WHERE id = ${id} AND tutor_id = ${request.tutorId}`
  if (!existing) return response.status(404).json({ message: 'Class not found.' })
  const classPayload = parseClassPayload(request.body, existing.schedule?.startDate, deserializeJson(existing.modules) ?? [])
  if (!classPayload) return response.status(400).json({ message: 'Enter valid class details.' })
  const [updated] = await sql`UPDATE classes SET ${sql(classPayload)}, updated_at = NOW() WHERE id = ${id} AND tutor_id = ${request.tutorId} RETURNING id`
  if (!updated) return response.status(404).json({ message: 'Class not found.' })
  return response.json(await refreshClassStatus(id))
})

app.put('/api/tutor/courses/:id/curriculum', requireTutor, async (request, response) => {
  const courseId = parseCourseId(request.params.id)
  const modules = request.body?.modules
  const lessons = getCourseLessons(modules)
  if (courseId === null || !Array.isArray(modules) || lessons.some((lesson) => !['video', 'article', 'interactive', 'quiz', 'stepByStepSolver'].includes(lesson?.type) || (lesson?.type === 'stepByStepSolver' && !isValidStepByStepSolverConfig(lesson.stepByStepSolver)))) {
    return response.status(400).json({ message: 'Enter valid course curriculum lessons.' })
  }
  const [updated] = await sql`
    UPDATE courses
    SET modules = ${JSON.stringify(modules)}::jsonb, updated_at = NOW()
    WHERE id = ${courseId} AND tutor_id = ${request.tutorId}
    RETURNING modules
  `
  if (!updated) return response.status(404).json({ message: 'Course not found.' })
  return response.json({ modules: deserializeJson(updated.modules) ?? [] })
})

app.put('/api/tutor/classes/:id/curriculum', requireTutor, async (request, response) => {
  const classId = parseCourseId(request.params.id)
  const modules = request.body?.modules
  const lessons = getCourseLessons(modules)
  if (classId === null || !Array.isArray(modules) || lessons.some((lesson) => !['video', 'article', 'interactive', 'quiz', 'live', 'stepByStepSolver'].includes(lesson?.type) || (lesson?.type === 'stepByStepSolver' && !isValidStepByStepSolverConfig(lesson.stepByStepSolver))) || !hasScheduledClassQuizzes(modules)) {
    return response.status(400).json({ message: 'Enter valid class curriculum lessons.' })
  }
  const [updated] = await sql`
    UPDATE classes
    SET modules = ${JSON.stringify(modules)}::jsonb, updated_at = NOW()
    WHERE id = ${classId} AND tutor_id = ${request.tutorId}
    RETURNING modules
  `
  if (!updated) return response.status(404).json({ message: 'Class not found.' })
  return response.json({ modules: deserializeJson(updated.modules) ?? [] })
})

const evaluateAtRiskEnrollment = (record) => {
  const modules = deserializeJson(record.modules) ?? []
  const lessons = getCourseLessons(modules)
  const now = Date.now()
  const liveLessons = lessons.filter((lesson) => lesson.type === 'live' && lesson.scheduledAt && new Date(lesson.scheduledAt).getTime() <= now).sort((first, second) => new Date(first.scheduledAt).getTime() - new Date(second.scheduledAt).getTime())
  const attendance = deserializeJson(record.attendance) ?? {}
  let missedConsecutive = 0
  for (const lesson of liveLessons.slice().reverse()) {
    if (attendance[lesson.id]?.status === 'Present' || attendance[lesson.id] === 'Present') break
    missedConsecutive += 1
  }
  const attendedCount = liveLessons.filter((lesson) => attendance[lesson.id]?.status === 'Present' || attendance[lesson.id] === 'Present').length
  const attendanceRate = liveLessons.length ? attendedCount / liveLessons.length : 1
  const quizAttempts = (deserializeJson(record.quizAttempts) ?? []).filter((attempt) => attempt.submittedAt && attempt.score !== null && attempt.passed !== null).sort((first, second) => new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime())
  let failedConsecutive = 0
  for (const attempt of quizAttempts) {
    if (attempt.passed) break
    failedConsecutive += 1
  }
  const averageQuizScore = quizAttempts.length ? quizAttempts.reduce((total, attempt) => total + Number(attempt.score), 0) / quizAttempts.length : null
  const lessonProgress = deserializeJson(record.lessonProgress) ?? {}
  const activityDates = [
    ...Object.values(lessonProgress).flatMap((progress) => [progress.startedAt, progress.lastAccessedAt, progress.completedAt]),
    ...quizAttempts.flatMap((attempt) => [attempt.startedAt, attempt.submittedAt]),
    ...Object.values(attendance).flatMap((value) => typeof value === 'object' ? [value.markedAt] : []),
    record.enrolledDate,
  ].filter(Boolean).map((value) => new Date(value).getTime()).filter(Number.isFinite)
  const lastActivityAt = activityDates.length ? new Date(Math.max(...activityDates)).toISOString() : null
  const inactiveDays = lastActivityAt ? (now - new Date(lastActivityAt).getTime()) / 86400000 : Infinity
  const progressPercentage = getEnrollmentProgress(modules, lessonProgress).progressPercentage
  const completedDates = Object.values(lessonProgress).map((progress) => progress.completedAt).filter(Boolean).map((value) => new Date(value).getTime()).filter(Number.isFinite)
  const lastProgressAt = completedDates.length ? Math.max(...completedDates) : new Date(record.enrolledDate).getTime()
  const stagnantDays = (now - lastProgressAt) / 86400000
  const reasons = []
  if (missedConsecutive >= 2) reasons.push(`Missed ${missedConsecutive} live sessions in a row`)
  if (liveLessons.length > 0 && attendanceRate < 0.7) reasons.push(`Attendance ${Math.round(attendanceRate * 100)}%`)
  if (failedConsecutive >= 2) reasons.push(`Failed ${failedConsecutive} quizzes in a row`)
  if (averageQuizScore !== null && averageQuizScore < 50) reasons.push(`Quiz average ${Math.round(averageQuizScore)}%`)
  if (inactiveDays >= 7) reasons.push(`No activity for ${Math.floor(inactiveDays)} days`)
  if (progressPercentage < 100 && stagnantDays >= 7) reasons.push(`Progress unchanged for ${Math.floor(stagnantDays)} days`)
  return reasons.length ? {
    id: Number(record.id),
    studentId: Number(record.studentId),
    classId: record.classId === null ? null : Number(record.classId),
    studentName: record.studentName,
    studentEmail: record.studentEmail,
    courseTitle: record.courseTitle,
    classTitle: record.classTitle,
    progressPercentage,
    lastActivityAt,
    reasons,
  } : null
}

const getAtRiskStudents = async ({ tutorId = null, classId = null, classOnly = false } = {}) => {
  const tutorCondition = tutorId === null ? sql`` : sql`AND (courses.tutor_id = ${tutorId} OR classes.tutor_id = ${tutorId})`
  const classCondition = classId !== null ? sql`AND enrollments.class_id = ${classId}` : classOnly ? sql`AND enrollments.class_id IS NOT NULL` : sql``
  const records = await sql`
    SELECT enrollments.id::INTEGER AS id,
           students.id::INTEGER AS "studentId",
           enrollments.class_id::INTEGER AS "classId",
           COALESCE(NULLIF(users.name, ''), students.full_name) AS "studentName",
           users.email AS "studentEmail",
           courses.title AS "courseTitle",
           classes.title AS "classTitle",
           enrollments.created_at AS "enrolledDate",
           CASE WHEN classes.id IS NULL THEN courses.modules ELSE classes.modules END AS modules,
           lesson_summary."lessonProgress",
           quiz_summary."quizAttempts",
           attendance_summary.attendance
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, jsonb_build_object('startedAt', started_at, 'completedAt', completed_at, 'lastAccessedAt', last_accessed_at)), '{}'::jsonb) AS "lessonProgress"
      FROM student_lesson_progress
      WHERE enrollment_id = enrollments.id
    ) lesson_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('startedAt', started_at, 'score', score, 'passed', passed, 'submittedAt', submitted_at) ORDER BY started_at DESC), '[]'::jsonb) AS "quizAttempts"
      FROM quiz_attempts
      WHERE enrollment_id = enrollments.id
    ) quiz_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, jsonb_build_object('status', status, 'markedAt', marked_at)), '{}'::jsonb) AS attendance
      FROM class_attendance
      WHERE enrollment_id = enrollments.id
    ) attendance_summary ON true
    WHERE ((enrollments.class_id IS NULL AND enrollments.course_id IS NOT NULL) OR classes.published = true)
      AND (enrollments.class_id IS NULL OR enrollments.class_status = 'enrolled')
      ${classCondition}
      ${tutorCondition}
    ORDER BY COALESCE(NULLIF(users.name, ''), students.full_name), enrollments.created_at DESC
  `
  return records.map(evaluateAtRiskEnrollment).filter(Boolean)
}

app.get('/api/admin/at-risk-students', requireAdmin, async (request, response) => {
  const classId = request.query.classId === undefined ? null : parseCourseId(String(request.query.classId))
  if (request.query.classId !== undefined && classId === null) return response.status(400).json({ message: 'Invalid class id.' })
  return response.json(await getAtRiskStudents({ classId, classOnly: request.query.classOnly === 'true' }))
})
app.get('/api/tutor/at-risk-students', requireTutor, async (request, response) => response.json(await getAtRiskStudents({ tutorId: request.tutorId, classOnly: true })))

const getTutorStudentProgress = async (contentType, contentId) => {
  const contentCondition = contentType === 'class'
    ? sql`enrollments.class_id = ${contentId} AND enrollments.class_status = 'enrolled' AND classes.published = true`
    : sql`enrollments.course_id = ${contentId} AND enrollments.class_id IS NULL`
  const students = await sql`
    SELECT enrollments.id::INTEGER AS id,
           students.id::INTEGER AS "studentId",
           COALESCE(NULLIF(users.name, ''), students.full_name) AS "studentName",
           students.age_or_grade AS "ageOrGrade",
           users.email AS "studentEmail",
           enrollments.class_status AS status,
           to_char(enrollments.created_at, 'FMMonth DD, YYYY') AS "enrolledDate",
           CASE WHEN classes.id IS NULL THEN courses.modules ELSE classes.modules END AS modules,
           lesson_summary."lessonProgress",
           lesson_summary."timeSpentSeconds",
           quiz_summary."quizAttempts",
           attendance_summary.attendance,
           session_join_summary."sessionJoinClicks"
    FROM enrollments
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, jsonb_build_object('completedAt', completed_at)), '{}'::jsonb) AS "lessonProgress",
             COALESCE(SUM(active_seconds), 0)::INTEGER AS "timeSpentSeconds"
      FROM student_lesson_progress
      WHERE enrollment_id = enrollments.id
    ) AS lesson_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'lessonId', lesson_id, 'startedAt', started_at, 'activeSeconds', active_seconds, 'score', score, 'passed', passed, 'disqualified', disqualified, 'retakeApproved', retake_approved, 'submittedAt', submitted_at) ORDER BY started_at DESC), '[]'::jsonb) AS "quizAttempts"
      FROM quiz_attempts
      WHERE enrollment_id = enrollments.id
    ) AS quiz_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, status), '{}'::jsonb) AS attendance
      FROM class_attendance
      WHERE enrollment_id = enrollments.id
    ) AS attendance_summary ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, clicked_at), '{}'::jsonb) AS "sessionJoinClicks"
      FROM class_session_join_logs
      WHERE enrollment_id = enrollments.id
    ) AS session_join_summary ON true
    WHERE ${contentCondition}
    ORDER BY enrollments.created_at DESC, enrollments.id DESC
  `
  return students.map((student) => {
    const lessonProgress = deserializeJson(student.lessonProgress) ?? {}
    const modules = deserializeJson(student.modules) ?? []
    return {
      ...student,
      attendance: deserializeJson(student.attendance) ?? {},
      completedLessonIds: Object.entries(lessonProgress).filter(([, progress]) => progress.completedAt).map(([lessonId]) => Number(lessonId)),
      sessionJoinClicks: deserializeJson(student.sessionJoinClicks) ?? {},
      quizAttempts: deserializeJson(student.quizAttempts) ?? [],
      timeSpentSeconds: Number(student.timeSpentSeconds) || 0,
      progressPercentage: getEnrollmentProgress(modules, lessonProgress).progressPercentage,
    }
  })
}

app.get('/api/tutor/courses/:id/students', requireTutor, async (request, response) => {
  const courseId = parseCourseId(request.params.id)
  if (courseId === null) return response.status(400).json({ message: 'Invalid course id.' })
  const [course] = await sql`SELECT id FROM courses WHERE id = ${courseId} AND tutor_id = ${request.tutorId}`
  if (!course) return response.status(404).json({ message: 'Course not found.' })
  return response.json(await getTutorStudentProgress('course', courseId))
})

app.get('/api/tutor/classes/:id/students', requireTutor, async (request, response) => {
  const classId = parseCourseId(request.params.id)
  if (classId === null) return response.status(400).json({ message: 'Invalid class id.' })
  const [classRecord] = await sql`SELECT id FROM classes WHERE id = ${classId} AND tutor_id = ${request.tutorId} AND published = true`
  if (!classRecord) return response.status(404).json({ message: 'Class not found.' })
  return response.json(await getTutorStudentProgress('class', classId))
})

const getTutorArticleInteractionReport = async (contentType, contentId) => {
  const contentCondition = contentType === 'class'
    ? sql`enrollments.class_id = ${contentId} AND enrollments.class_status = 'enrolled' AND classes.published = true`
    : sql`enrollments.course_id = ${contentId} AND enrollments.class_id IS NULL`
  const [content] = contentType === 'class'
    ? await sql`SELECT modules FROM classes WHERE id = ${contentId}`
    : await sql`SELECT modules FROM courses WHERE id = ${contentId}`
  const students = await sql`
    SELECT enrollments.id::INTEGER AS id,
           COALESCE(NULLIF(users.name, ''), students.full_name) AS "studentName",
           users.email AS "studentEmail"
    FROM enrollments
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    WHERE ${contentCondition}
    ORDER BY enrollments.created_at DESC, enrollments.id DESC
  `
  const enrollmentIds = students.map((student) => student.id)
  const helpRequests = enrollmentIds.length ? await sql`
    SELECT enrollment_id::INTEGER AS "enrollmentId", lesson_id AS "lessonId", section_index AS "sectionIndex", question, flagged_at AS "flaggedAt", question_at AS "questionAt", status, teacher_reply AS "teacherReply", teacher_reply_at AS "teacherReplyAt"
    FROM article_help_requests
    WHERE enrollment_id = ANY(${enrollmentIds})
    ORDER BY flagged_at DESC
  ` : []

  const checkpointRows = enrollmentIds.length ? await sql`
    SELECT enrollment_id AS "enrollmentId", lesson_id AS "lessonId", checkpoint_id AS "checkpointId", selected_option AS "selectedOption", skipped, is_correct AS "isCorrect", answered_at AS "answeredAt"
    FROM article_checkpoint_responses
    WHERE enrollment_id = ANY(${enrollmentIds})
  ` : []

  return getCourseLessons(deserializeJson(content?.modules) ?? []).filter((lesson) => lesson?.type === 'article').map((lesson) => {
    const sectionTitles = getArticleSectionTitles(lesson.articleBody)
    const checkpoints = getArticleCheckpoints(lesson)
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      sectionTitles,
      checkpoints: checkpoints.map(({ id, question, options, correctOption }) => ({ id, question, options, correctOption })),
      students: students.map((student) => ({
        enrollmentId: student.id,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        helpRequests: helpRequests.filter((request) => request.enrollmentId === student.id && Number(request.lessonId) === lesson.id).map(({ sectionIndex, question, flaggedAt, questionAt, status, teacherReply, teacherReplyAt }) => ({ sectionIndex, sectionTitle: sectionTitles[sectionIndex] ?? 'Section', question, flaggedAt, questionAt, status, teacherReply, teacherReplyAt })),
        checkpointResponses: checkpointRows
          .filter((row) => Number(row.enrollmentId) === student.id && Number(row.lessonId) === lesson.id && checkpoints.some((item) => item.id === Number(row.checkpointId)))
          .map((row) => ({ checkpointId: Number(row.checkpointId), status: row.skipped ? 'skipped' : row.isCorrect ? 'correct' : 'incorrect', selectedOption: row.selectedOption ?? null, answeredAt: row.answeredAt })),
      })),
    }
  })
}

app.get('/api/tutor/classes/:id/article-interactions', requireTutor, async (request, response) => {
  const classId = parseCourseId(request.params.id)
  if (classId === null) return response.status(400).json({ message: 'Invalid class id.' })
  const [classRecord] = await sql`SELECT id FROM classes WHERE id = ${classId} AND tutor_id = ${request.tutorId} AND published = true`
  if (!classRecord) return response.status(404).json({ message: 'Class not found.' })
  return response.json({ articles: await getTutorArticleInteractionReport('class', classId) })
})

app.get('/api/tutor/courses/:id/article-interactions', requireTutor, async (request, response) => {
  const courseId = parseCourseId(request.params.id)
  if (courseId === null) return response.status(400).json({ message: 'Invalid course id.' })
  const [course] = await sql`SELECT id FROM courses WHERE id = ${courseId} AND tutor_id = ${request.tutorId}`
  if (!course) return response.status(404).json({ message: 'Course not found.' })
  return response.json({ articles: await getTutorArticleInteractionReport('course', courseId) })
})

const tutorOwnsArticleHelpEnrollment = (tutorId) => sql`EXISTS (
  SELECT 1
  FROM enrollments
  LEFT JOIN courses ON courses.id = enrollments.course_id
  LEFT JOIN classes ON classes.id = enrollments.class_id
  WHERE enrollments.id = article_help_requests.enrollment_id
    AND (CASE WHEN enrollments.class_id IS NULL THEN courses.tutor_id ELSE classes.tutor_id END) = ${tutorId}
)`

const parseArticleHelpSectionIndex = (value) => {
  const sectionIndex = parseEnrollmentId(value)
  return sectionIndex !== null && sectionIndex <= 2147483647 ? sectionIndex : null
}

app.put('/api/tutor/enrollments/:enrollmentId/lessons/:lessonId/article-help/:sectionIndex/reply', requireTutor, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sectionIndex = parseArticleHelpSectionIndex(request.params.sectionIndex)
  const reply = typeof request.body?.reply === 'string' ? request.body.reply.trim() : ''
  if (enrollmentId === null || lessonId === null || sectionIndex === null || !reply || reply.length > 2000) {
    return response.status(400).json({ message: 'Enter a reply between 1 and 2000 characters.' })
  }

  const [updated] = await sql`
    UPDATE article_help_requests
    SET teacher_reply = ${reply}, teacher_reply_at = NOW()
    WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND section_index = ${sectionIndex}
      AND ${tutorOwnsArticleHelpEnrollment(request.tutorId)}
    RETURNING section_index AS "sectionIndex", status, teacher_reply AS "teacherReply", teacher_reply_at AS "teacherReplyAt"
  `
  if (!updated) return response.status(404).json({ message: 'Help request not found.' })
  return response.json(updated)
})

app.post('/api/tutor/enrollments/:enrollmentId/lessons/:lessonId/article-help/:sectionIndex/resolve', requireTutor, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  const lessonId = parseEnrollmentId(request.params.lessonId)
  const sectionIndex = parseArticleHelpSectionIndex(request.params.sectionIndex)
  if (enrollmentId === null || lessonId === null || sectionIndex === null) return response.status(400).json({ message: 'Invalid help request.' })

  const [updated] = await sql`
    UPDATE article_help_requests
    SET status = 'resolved', resolved_at = COALESCE(resolved_at, NOW())
    WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId} AND section_index = ${sectionIndex}
      AND ${tutorOwnsArticleHelpEnrollment(request.tutorId)}
    RETURNING section_index AS "sectionIndex", status, teacher_reply AS "teacherReply", teacher_reply_at AS "teacherReplyAt"
  `
  if (!updated) return response.status(404).json({ message: 'Help request not found.' })
  return response.json(updated)
})

app.patch('/api/tutor/classes/enrollments/:id/attendance', requireTutor, async (request, response) => {
  const enrollmentId = parseCourseId(request.params.id)
  const lessonId = parseEnrollmentId(String(request.body?.lessonId ?? ''))
  const status = request.body?.status
  if (enrollmentId === null || lessonId === null || !['Present', 'Absent'].includes(status)) {
    return response.status(400).json({ message: 'Enter a valid live lesson attendance status.' })
  }
  const result = await sql.begin(async (transaction) => {
    const [enrollment] = await transaction`
      SELECT enrollments.id, classes.modules
      FROM enrollments
      INNER JOIN classes ON classes.id = enrollments.class_id
      WHERE enrollments.id = ${enrollmentId}
        AND enrollments.class_status = 'enrolled'
        AND classes.tutor_id = ${request.tutorId}
      FOR UPDATE OF enrollments
    `
    if (!enrollment) return null
    const lesson = getCourseLessons(deserializeJson(enrollment.modules)).find((item) => item?.id === lessonId)
    if (!lesson || lesson.type !== 'live') return { error: 'Live lesson not found.' }
    await transaction`
      INSERT INTO class_attendance (enrollment_id, lesson_id, status)
      VALUES (${enrollmentId}, ${lessonId}, ${status})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET status = EXCLUDED.status, marked_at = NOW()
    `
    await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id, completed_at)
      VALUES (${enrollmentId}, ${lessonId}, ${status === 'Present' ? sql`NOW()` : sql`NULL`})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET completed_at = ${status === 'Present' ? sql`COALESCE(student_lesson_progress.completed_at, NOW())` : sql`NULL`}, last_accessed_at = NOW()
    `
    return { status }
  })
  if (!result) return response.status(404).json({ message: 'Class enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.status(204).end()
})

app.get('/api/tutor/grading/submissions', requireTutor, async (request, response) => {
  const rows = await sql`
    SELECT attempts.id::INTEGER AS id,
           attempts.lesson_id AS "lessonId",
           attempts.answers,
           attempts.score,
           attempts.passed,
           attempts.submitted_at AS "submittedAt",
           students.id::INTEGER AS "studentId",
           COALESCE(NULLIF(users.name, ''), students.full_name) AS "studentName",
           users.email AS "studentEmail",
           CASE WHEN classes.id IS NULL THEN 'course' ELSE 'class' END AS "contentType",
           COALESCE(classes.id, courses.id)::INTEGER AS "contentId",
           COALESCE(classes.title, courses.title) AS "contentTitle",
           CASE WHEN classes.id IS NULL THEN courses.modules ELSE classes.modules END AS modules
    FROM quiz_attempts attempts
    INNER JOIN enrollments ON enrollments.id = attempts.enrollment_id
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    WHERE attempts.submitted_at IS NOT NULL
      AND ((classes.id IS NULL AND courses.tutor_id = ${request.tutorId}) OR (classes.id IS NOT NULL AND classes.tutor_id = ${request.tutorId} AND classes.published = true))
    ORDER BY attempts.submitted_at DESC, attempts.id DESC
  `
  return response.json(rows.flatMap((row) => {
    const modules = deserializeJson(row.modules) ?? []
    const lesson = getCourseLessons(modules).find((item) => item?.id === Number(row.lessonId))
    if (lesson?.type !== 'quiz') return []
    const questions = Array.isArray(lesson.quizQuestions) ? lesson.quizQuestions : []
    const answers = normalizeQuizAnswers(row.answers, questions)
    return [{
      id: row.id,
      contentType: row.contentType,
      contentId: row.contentId,
      contentTitle: row.contentTitle,
      lessonId: Number(row.lessonId),
      lessonTitle: lesson?.title ?? 'Quiz',
      studentId: row.studentId,
      studentName: row.studentName,
      studentEmail: row.studentEmail,
      submittedAt: row.submittedAt,
      score: row.score,
      passed: row.passed,
      questions: questions.map((question) => {
        const selectedOption = selectedOptionFromRecord(answers[String(question.id)], question)
        return {
          id: question.id,
          question: question.question,
          options: question.options,
          correctOption: question.correctOption,
          selectedOption,
          isCorrect: selectedOption === question.correctOption,
        }
      }),
    }]
  }))
})

app.patch('/api/tutor/profile', requireTutor, async (request, response) => {
  const profile = isValidTutorProfile(request.body)
  if (!profile) return response.status(400).json({ message: 'Enter valid tutor profile details.' })
  try {
    const updated = await sql.begin(async (transaction) => {
      const [tutor] = await transaction`
        UPDATE tutors
        SET ${transaction(profile)}
        WHERE id = ${request.tutorId}
        RETURNING id
      `
      if (!tutor) return null
      await transaction`
        UPDATE users
        SET name = COALESCE(${profile.name ?? null}, name),
            phone = COALESCE(${profile.phone ?? null}, phone)
        WHERE id = ${request.userId}
      `
      return tutor
    })
    if (!updated) return response.status(404).json({ message: 'Tutor profile not found.' })
    return response.json(await readTutor(request.tutorId))
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'A tutor with this email already exists.' })
    throw error
  }
})

app.get('/api/admin/bookstore-items', requireAdmin, async (_request, response) => {
  const items = await sql`
    SELECT ${bookstoreItemColumns}
    FROM bookstore_items
    ORDER BY created_at DESC, id DESC
  `
  return response.json(items)
})

app.post('/api/admin/bookstore-items', requireAdmin, async (request, response) => {
  const item = parseBookstorePayload(request.body, true)
  if (!item || !item.file) return response.status(400).json({ message: 'Enter the item details, cover image, and a supported download file.' })
  const [created] = await sql`
    INSERT INTO bookstore_items ${sql({
      title: item.title,
      description: item.description,
      category: item.category,
      price: item.price,
      cover_data: item.cover_data,
      published: item.published,
      download_file: item.file.content,
      download_file_name: item.file.fileName,
      download_mime_type: item.file.mimeType,
      download_size_bytes: item.file.content.length,
    })}
    RETURNING id
  `
  return response.status(201).json(await readBookstoreItem(Number(created.id)))
})

app.put('/api/admin/bookstore-items/:id', requireAdmin, async (request, response) => {
  const itemId = parseCourseId(request.params.id)
  const item = parseBookstorePayload(request.body, false)
  if (itemId === null || !item) return response.status(400).json({ message: 'Enter valid bookstore item details.' })
  const update = {
    title: item.title,
    description: item.description,
    category: item.category,
    price: item.price,
    cover_data: item.cover_data,
    published: item.published,
    ...(item.file ? {
      download_file: item.file.content,
      download_file_name: item.file.fileName,
      download_mime_type: item.file.mimeType,
      download_size_bytes: item.file.content.length,
    } : {}),
  }
  const [updated] = await sql`
    UPDATE bookstore_items
    SET ${sql(update)}, updated_at = NOW()
    WHERE id = ${itemId}
    RETURNING id
  `
  if (!updated) return response.status(404).json({ message: 'Bookstore item not found.' })
  return response.json(await readBookstoreItem(itemId))
})

app.delete('/api/admin/bookstore-items/:id', requireAdmin, async (request, response) => {
  const itemId = parseCourseId(request.params.id)
  if (itemId === null) return response.status(400).json({ message: 'Invalid bookstore item id.' })
  const [purchase] = await sql`SELECT id FROM bookstore_purchases WHERE bookstore_item_id = ${itemId} LIMIT 1`
  if (purchase) return response.status(409).json({ message: 'Items with purchase records cannot be deleted. Unpublish the item instead.' })
  const [deleted] = await sql`DELETE FROM bookstore_items WHERE id = ${itemId} RETURNING id`
  if (!deleted) return response.status(404).json({ message: 'Bookstore item not found.' })
  return response.status(204).send()
})

app.get('/api/admin/practice-exams', requireAdmin, async (_request, response) => {
  const exams = await sql`
    SELECT id::INTEGER AS id, title, subject, grade, price::FLOAT AS price, published
    FROM practice_exams
    ORDER BY created_at DESC, id DESC
  `
  return response.json(exams)
})

app.post('/api/admin/practice-exams', requireAdmin, async (request, response) => {
  const body = request.body ?? {}
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const grade = typeof body.grade === 'string' ? body.grade.trim() : ''
  const price = Number(body.price)
  const published = body.published === true
  if (!title || !subject || !grade || !Number.isFinite(price) || price < 0) return response.status(400).json({ message: 'Title, subject, grade, and a valid price are required.' })
  const [exam] = await sql`
    INSERT INTO practice_exams ${sql({ title, subject, grade, price, published })}
    RETURNING id::INTEGER AS id, title, subject, grade, price::FLOAT AS price, published
  `
  return response.status(201).json(exam)
})

app.patch('/api/admin/practice-exams/:id', requireAdmin, async (request, response) => {
  const examId = parseCourseId(request.params.id)
  const body = request.body ?? {}
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const grade = typeof body.grade === 'string' ? body.grade.trim() : ''
  const price = Number(body.price)
  const published = body.published === true
  if (examId === null || !title || !subject || !grade || !Number.isFinite(price) || price < 0) return response.status(400).json({ message: 'Title, subject, grade, and a valid price are required.' })
  const [exam] = await sql`
    UPDATE practice_exams
    SET title = ${title}, subject = ${subject}, grade = ${grade}, price = ${price}, published = ${published}
    WHERE id = ${examId}
    RETURNING id::INTEGER AS id, title, subject, grade, price::FLOAT AS price, published
  `
  if (!exam) return response.status(404).json({ message: 'Practice exam not found.' })
  return response.json(exam)
})

app.get('/api/admin/practice-exams/:id/questions', requireAdmin, async (request, response) => {
  const examId = parseCourseId(request.params.id)
  if (examId === null) return response.status(400).json({ message: 'Invalid practice exam id.' })
  const questions = await sql`
    SELECT id::INTEGER AS id, exam_id::INTEGER AS exam_id, question_text, topic, options, correct_answer, explanation
    FROM practice_questions
    WHERE exam_id = ${examId}
    ORDER BY id
  `
  return response.json(questions.map((question) => ({ ...question, options: deserializeJson(question.options) })))
})

app.post('/api/admin/practice-exams/:id/questions', requireAdmin, async (request, response) => {
  const examId = parseCourseId(request.params.id)
  const body = request.body ?? {}
  const questionText = typeof body.questionText === 'string' ? body.questionText.trim() : ''
  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  const options = Array.isArray(body.options) ? body.options.filter((option) => typeof option === 'string').map((option) => option.trim()).filter(Boolean) : []
  const correctAnswer = typeof body.correctAnswer === 'string' ? body.correctAnswer.trim() : ''
  const explanation = typeof body.explanation === 'string' ? body.explanation.trim() : ''
  if (examId === null || !questionText || !topic || options.length < 2 || !options.includes(correctAnswer) || !explanation) return response.status(400).json({ message: 'Question text, topic, at least two options, a matching correct answer, and an explanation are required.' })
  const [exam] = await sql`SELECT id FROM practice_exams WHERE id = ${examId}`
  if (!exam) return response.status(404).json({ message: 'Practice exam not found.' })
  const [question] = await sql`
    INSERT INTO practice_questions ${sql({ exam_id: examId, question_text: questionText, topic, options: JSON.stringify(options), correct_answer: correctAnswer, explanation })}
    RETURNING id::INTEGER AS id, exam_id::INTEGER AS exam_id, question_text, topic, options, correct_answer, explanation
  `
  return response.status(201).json({ ...question, options: deserializeJson(question.options) })
})

app.patch('/api/admin/practice-exams/:examId/questions/:questionId', requireAdmin, async (request, response) => {
  const examId = parseCourseId(request.params.examId)
  const questionId = parseEnrollmentId(request.params.questionId)
  const body = request.body ?? {}
  const questionText = typeof body.questionText === 'string' ? body.questionText.trim() : ''
  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  const options = Array.isArray(body.options) ? body.options.filter((option) => typeof option === 'string').map((option) => option.trim()).filter(Boolean) : []
  const correctAnswer = typeof body.correctAnswer === 'string' ? body.correctAnswer.trim() : ''
  const explanation = typeof body.explanation === 'string' ? body.explanation.trim() : ''
  if (examId === null || questionId === null || !questionText || !topic || options.length < 2 || !options.includes(correctAnswer) || !explanation) return response.status(400).json({ message: 'Question text, topic, at least two options, a matching correct answer, and an explanation are required.' })
  const [question] = await sql`
    UPDATE practice_questions
    SET question_text = ${questionText}, topic = ${topic}, options = ${JSON.stringify(options)}::jsonb, correct_answer = ${correctAnswer}, explanation = ${explanation}
    WHERE id = ${questionId} AND exam_id = ${examId}
    RETURNING id::INTEGER AS id, exam_id::INTEGER AS exam_id, question_text, topic, options, correct_answer, explanation
  `
  if (!question) return response.status(404).json({ message: 'Practice question not found.' })
  return response.json({ ...question, options: deserializeJson(question.options) })
})

app.get('/api/admin/registrations', requireAdmin, async (_request, response) => {
  const registrations = await sql`
    SELECT payments.id::INTEGER AS id,
           COALESCE(NULLIF(users.name, ''), students.full_name, NULLIF(payments.student_data->0->>'fullName', ''), 'Unknown student') AS student,
           users.email AS email,
           COALESCE(classes.title, courses.title, 'Course registration') AS course,
           to_char(COALESCE(enrollments.created_at, payments.created_at), 'Mon DD, YYYY') AS date,
           CASE
             WHEN enrollments.class_status = 'waitlisted' THEN 'Waitlisted'
             WHEN payments.verification_status = 'pending' THEN 'Pending Verification'
             WHEN payments.verification_status = 'declined' THEN 'Declined'
             WHEN payments.status = 'paid' THEN 'Approved'
             WHEN payments.status = 'failed' THEN 'Rejected'
             ELSE 'Pending'
           END AS status
    FROM payments
    INNER JOIN users ON users.id = payments.user_id
    LEFT JOIN enrollments ON enrollments.payment_id = payments.id
    LEFT JOIN students ON students.id = enrollments.student_id
    LEFT JOIN courses ON courses.id = payments.course_id
    LEFT JOIN classes ON classes.id = payments.class_id
    WHERE payments.course_id IS NOT NULL OR payments.class_id IS NOT NULL
    ORDER BY COALESCE(enrollments.created_at, payments.created_at) DESC, payments.id DESC
  `
  return response.json(registrations)
})

app.get('/api/admin/pending-payments', requireAdmin, async (_request, response) => {
  const payments = await sql`
    SELECT payments.id::INTEGER AS id,
           COALESCE(NULLIF(users.name, ''), 'Unknown student') AS student,
           users.email AS email,
           users.phone AS phone,
           COALESCE(classes.title, courses.title, 'Course enrollment') AS course,
           payments.amount::FLOAT AS amount,
           payments.currency AS currency,
           payments.created_at AS "submittedAt",
           payments.proof_file_name AS "proofFileName"
    FROM payments
    INNER JOIN users ON users.id = payments.user_id
    LEFT JOIN courses ON courses.id = payments.course_id
    LEFT JOIN classes ON classes.id = payments.class_id
    WHERE payments.payment_method = 'manual' AND payments.verification_status = 'pending' AND payments.status = 'pending'
    ORDER BY payments.created_at ASC, payments.id ASC
  `
  return response.json(payments)
})

app.get('/api/admin/pending-payments/:paymentId/proof', requireAdmin, async (request, response) => {
  const paymentId = parseEnrollmentId(request.params.paymentId)
  if (paymentId === null) return response.status(404).end()
  const [payment] = await sql`
    SELECT proof_image AS image, proof_mime_type AS "mimeType"
    FROM payments
    WHERE id = ${paymentId} AND payment_method = 'manual'
  `
  if (!payment?.image || !payment.mimeType) return response.status(404).end()
  response.set({ 'Content-Type': payment.mimeType, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' })
  return response.send(payment.image)
})

app.post('/api/admin/pending-payments/:paymentId/approve', requireAdmin, async (request, response) => {
  const paymentId = parseEnrollmentId(request.params.paymentId)
  if (paymentId === null) return response.status(400).json({ message: 'Invalid payment.' })
  const [payment] = await sql`SELECT reference FROM payments WHERE id = ${paymentId} AND payment_method = 'manual' AND verification_status = 'pending' AND status = 'pending'`
  if (!payment) return response.status(409).json({ message: 'This payment is no longer pending verification.' })
  const status = await updatePaymentStatus(payment.reference, 'paid', { manualApproval: true, adminUserId: request.userId })
  if (status !== 'paid') return response.status(409).json({ message: 'This payment could not be approved.' })
  return response.json({ id: paymentId, status: 'approved' })
})

app.post('/api/admin/pending-payments/:paymentId/decline', requireAdmin, async (request, response) => {
  const paymentId = parseEnrollmentId(request.params.paymentId)
  const reason = typeof request.body?.reason === 'string' ? request.body.reason.trim() : ''
  if (paymentId === null || reason.length > 500) return response.status(400).json({ message: 'Enter a valid payment and decline reason.' })
  const [payment] = await sql`
    UPDATE payments
    SET status = 'failed', verification_status = 'declined', review_note = ${reason || null}, reviewed_by = ${request.userId}, reviewed_at = NOW()
    WHERE id = ${paymentId} AND payment_method = 'manual' AND verification_status = 'pending' AND status = 'pending'
    RETURNING id::INTEGER AS id
  `
  if (!payment) return response.status(409).json({ message: 'This payment is no longer pending verification.' })
  return response.json({ id: paymentId, status: 'declined' })
})

const grantReasons = ['Scholarship', 'Staff', 'Promotion', 'Sponsored', 'Other']
const maxBulkCsvBytes = 1024 * 1024

const parseGrantTarget = (body) => {
  const hasCourse = body?.courseId !== undefined && body?.courseId !== null
  const hasClass = body?.classId !== undefined && body?.classId !== null
  if (hasCourse === hasClass) return null
  const id = parseEnrollmentId(String(hasCourse ? body.courseId : body.classId))
  if (id === null) return null
  return hasCourse ? { courseId: id, classId: null } : { courseId: null, classId: id }
}

const parseOptionalText = (value, maxLength) => {
  if (value === undefined || value === null || value === '') return { value: null }
  if (typeof value !== 'string' || value.trim().length > maxLength) return null
  return { value: value.trim() || null }
}

const parseOptionalExpiry = (value) => {
  if (value === undefined || value === null || value === '') return { value: null }
  const date = new Date(String(value))
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now() ? { value: date } : null
}

const parseOptionalSponsorId = (value) => {
  if (value === undefined || value === null || value === '') return { value: null }
  const id = parseEnrollmentId(String(value))
  return id === null ? null : { value: id }
}

const parseGrantOptions = (body) => {
  const target = parseGrantTarget(body)
  const reason = grantReasons.includes(body?.reason) ? body.reason : null
  const note = parseOptionalText(body?.note, 500)
  const expiry = parseOptionalExpiry(body?.expiresAt)
  const sponsor = parseOptionalSponsorId(body?.sponsorId)
  if (!target || !reason || !note || !expiry || !sponsor || (reason === 'Sponsored') !== (sponsor.value !== null)) return null
  return { ...target, reason, note: note.value, expiresAt: expiry.value, sponsorId: sponsor.value }
}

const buildStudentProfile = ({ fullName, grade = '', phone = '', relationship = 'Self', notes = '' }) => ({
  fullName,
  ageOrGrade: grade || 'Not provided',
  relationship,
  preferredLanguage: 'Not provided',
  emergencyPhone: phone,
  notes,
})

const issueSetPasswordLink = async (transaction, userId) => {
  const rawToken = randomBytes(32).toString('base64url')
  await transaction`INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (${hashToken(rawToken)}, ${userId}, NOW() + INTERVAL '72 hours')`
  return `/set-password?token=${rawToken}`
}

const oneTimePasswordLifetimeMs = 7 * 24 * 60 * 60 * 1000
const adminResetPasswordLifetimeMs = 24 * 60 * 60 * 1000
const oneTimePasswordAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
const generateOneTimePassword = () => Array.from({ length: 12 }, () => oneTimePasswordAlphabet[randomInt(oneTimePasswordAlphabet.length)]).join('')

const createUsernameAccount = async (transaction, name, phone) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'student'
  const expiresAt = new Date(Date.now() + oneTimePasswordLifetimeMs)
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = `${base}${randomBytes(3).toString('hex')}`
    const temporaryPassword = generateOneTimePassword()
    const [created] = await transaction`
      INSERT INTO users ${transaction({ name, phone, email: `${username}@no-email.invalid`, username, password_hash: await hashPassword(temporaryPassword), role: 'student', must_reset_password: true, one_time_password_expires_at: expiresAt })}
      ON CONFLICT DO NOTHING
      RETURNING id::INTEGER AS id
    `
    if (created) return { userId: created.id, username, temporaryPassword, oneTimePasswordExpiresAt: expiresAt.toISOString() }
  }
  throw new Error('Unable to create a unique username.')
}

const resolveGrantAccount = async (transaction, { userId, email, name, phone }) => {
  const [user] = userId !== null
    ? await transaction`SELECT id::INTEGER AS id, name, role FROM users WHERE id = ${userId}`
    : email !== null
      ? await transaction`SELECT id::INTEGER AS id, name, role FROM users WHERE email = ${email}`
      : []
  if (user) {
    if (user.role !== 'student') throw new EnrollmentRefusal(400, { message: 'Access can only be granted to student accounts.' })
    return { userId: user.id, name: user.name }
  }
  if (userId !== null) throw new EnrollmentRefusal(404, { message: 'Student account not found.' })
  if (email !== null) {
    const [created] = await transaction`
      INSERT INTO users ${transaction({ name, phone, email, password_hash: await hashPassword(randomBytes(24).toString('base64url')), role: 'student', must_reset_password: true })}
      RETURNING id::INTEGER AS id
    `
    return { userId: created.id, name, created: { setPasswordPath: await issueSetPasswordLink(transaction, created.id) } }
  }
  const account = await createUsernameAccount(transaction, name, phone)
  return { userId: account.userId, name, created: { username: account.username, temporaryPassword: account.temporaryPassword, oneTimePasswordExpiresAt: account.oneTimePasswordExpiresAt } }
}

const parseCsvText = (text) => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''))
}

const normalizeCsvHeader = (header) => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

const parseImportRows = (csv) => {
  const [headerRow = [], ...dataRows] = parseCsvText(csv)
  const headers = headerRow.map(normalizeCsvHeader)
  if (!headers.includes('name') || (!headers.includes('email') && !headers.includes('guardian_email'))) {
    return { error: 'The CSV needs a name column and an email or guardian_email column.' }
  }
  const column = (cells, key) => {
    const index = headers.indexOf(key)
    return index === -1 ? '' : String(cells[index] ?? '').trim()
  }
  return {
    rows: dataRows.map((cells, index) => ({
      row: index + 1,
      name: column(cells, 'name'),
      email: column(cells, 'email').toLowerCase(),
      guardianEmail: column(cells, 'guardian_email').toLowerCase(),
      phone: column(cells, 'phone'),
      grade: column(cells, 'grade'),
    })),
  }
}

const getImportRowProblem = (row) => {
  if (!row.name || row.name.length > 200) return 'Name is required.'
  if (row.email && !isValidEmail(row.email)) return 'Email address is not valid.'
  if (!row.email && row.guardianEmail && !isValidEmail(row.guardianEmail)) return 'Guardian email is not valid.'
  if (row.phone.length > 30) return 'Phone number is too long.'
  if (row.grade.length > 50) return 'Grade is too long.'
  return null
}

const getClassSeatsRemaining = async (classId) => {
  const [classSeats] = await sql`
    SELECT capacity, (SELECT COUNT(*)::INTEGER FROM enrollments WHERE enrollments.class_id = classes.id AND enrollments.class_status = 'enrolled' AND ${enrollmentAccessCondition()}) AS "enrolledCount"
    FROM classes WHERE id = ${classId}
  `
  if (!classSeats) return 0
  return Math.max(0, classSeats.capacity - classSeats.enrolledCount)
}

const classifyImportRows = async (rows, options) => {
  const emails = [...new Set(rows.map((row) => row.email || row.guardianEmail).filter(Boolean))]
  const existingUsers = emails.length === 0 ? [] : await sql`SELECT id::INTEGER AS id, email, role FROM users WHERE email IN ${sql(emails)}`
  const usersByEmail = new Map(existingUsers.map((user) => [user.email, user]))
  const accessibleUserIds = new Set(existingUsers.length === 0 ? [] : (await sql`
    SELECT DISTINCT enrollments.user_id::INTEGER AS "userId"
    FROM enrollments
    WHERE enrollments.user_id IN ${sql(existingUsers.map((user) => user.id))}
      AND ${targetAccessCondition(options.courseId, options.classId)}
      AND ${enrollmentAccessCondition()}
  `).map((row) => row.userId))
  let seatsLeft = options.sponsorId === null || options.classId === null ? null : await getClassSeatsRemaining(options.classId)
  const seenEmails = new Set()

  return rows.map((row) => {
    const accountEmail = row.email || row.guardianEmail
    const problem = getImportRowProblem(row)
    const existing = accountEmail ? usersByEmail.get(accountEmail) : null
    let status = 'new'
    let message = ''
    if (problem) {
      status = 'invalid'
      message = problem
    } else if (accountEmail && seenEmails.has(accountEmail)) {
      status = 'duplicate'
      message = 'This account appears earlier in the file.'
    } else if (existing && existing.role !== 'student') {
      status = 'invalid'
      message = 'This email belongs to a staff account.'
    } else if (existing) {
      status = 'existing'
      message = accessibleUserIds.has(existing.id) ? 'Already has access; will be skipped.' : 'Existing account.'
    }
    if (accountEmail && status !== 'invalid') seenEmails.add(accountEmail)
    const alreadyHasAccess = status === 'existing' && accessibleUserIds.has(existing.id)
    if ((status === 'new' || status === 'existing') && !alreadyHasAccess && seatsLeft !== null) {
      if (seatsLeft <= 0) {
        status = 'overflow'
        message = 'No sponsor seats left for this row.'
      } else {
        seatsLeft -= 1
      }
    }
    return { ...row, status, message }
  })
}

const getSponsorReport = async (sponsorId) => {
  const [sponsor] = await listSponsors(sponsorId)
  if (!sponsor) return null
  const students = await sql`
    SELECT enrollments.id::INTEGER AS "enrollmentId",
           COALESCE(NULLIF(users.name, ''), students.full_name) AS name,
           users.email,
           COALESCE(classes.title, courses.title) AS item,
           enrollments.class_status AS "classStatus",
           enrollments.access_status AS "accessStatus",
           to_char(LEAST(enrollments.expires_at, (SELECT sponsors.end_date::timestamp AT TIME ZONE 'UTC' FROM sponsors WHERE sponsors.id = enrollments.sponsor_id)) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "expiresAt",
           to_char(enrollments.created_at, 'YYYY-MM-DD') AS "grantedAt",
           CASE WHEN enrollments.class_id IS NULL THEN courses.modules ELSE classes.modules END AS modules,
           (SELECT COALESCE(jsonb_object_agg(lesson_id::TEXT, jsonb_build_object('completedAt', completed_at)), '{}'::jsonb)
            FROM student_lesson_progress WHERE student_lesson_progress.enrollment_id = enrollments.id) AS "lessonProgress",
           (SELECT COUNT(*) FILTER (WHERE status = 'Present')::INTEGER FROM class_attendance WHERE class_attendance.enrollment_id = enrollments.id) AS "attendancePresent"
    FROM enrollments
    INNER JOIN users ON users.id = enrollments.user_id
    INNER JOIN students ON students.id = enrollments.student_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    WHERE enrollments.sponsor_id = ${sponsorId}
    ORDER BY name, enrollments.id
  `
  const rows = students.map((student) => {
    const modules = deserializeJson(student.modules)
    const { completedLessonIds, progressPercentage } = getEnrollmentProgress(modules, deserializeJson(student.lessonProgress) ?? {})
    return {
      enrollmentId: student.enrollmentId,
      name: student.name,
      email: student.email,
      item: student.item,
      seat: student.classStatus ?? 'Course',
      accessStatus: student.accessStatus,
      expiresAt: student.expiresAt ?? '',
      grantedAt: student.grantedAt,
      progressPercentage,
      lessonsCompleted: completedLessonIds.length,
      liveSessionsAttended: student.attendancePresent,
      liveSessionsTotal: getCourseLessons(modules).filter((lesson) => lesson?.type === 'live').length,
    }
  })
  return { sponsor, rows }
}

const listSponsors = (sponsorId = null) => sql`
  SELECT sponsors.id::INTEGER AS id,
         sponsors.name,
         sponsors.contact,
         sponsors.notes,
         to_char(sponsors.end_date, 'YYYY-MM-DD') AS "endDate",
         (SELECT COUNT(*)::INTEGER FROM enrollments WHERE enrollments.sponsor_id = sponsors.id AND ${enrollmentAccessCondition()}) AS "seatsUsed"
  FROM sponsors
  WHERE ${sponsorId === null ? sql`TRUE` : sql`sponsors.id = ${sponsorId}`}
  ORDER BY sponsors.name, sponsors.id
`


const parseSponsorInput = (body) => {
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const contact = typeof body?.contact === 'string' ? body.contact.trim() : ''
  const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''
  const endDate = typeof body?.endDate === 'string' && body.endDate.trim() ? body.endDate.trim() : null
  if (!name || name.length > 200 || contact.length > 300 || notes.length > 2000) return null
  if (endDate !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || !Number.isFinite(Date.parse(endDate)))) return null
  return { name, contact, notes, endDate }
}

const csvCell = (value) => {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

app.post('/api/admin/access-grants', requireAdmin, async (request, response) => {
  const body = request.body ?? {}
  const options = parseGrantOptions(body)
  const userId = body.userId === undefined || body.userId === null ? null : parseEnrollmentId(String(body.userId))
  const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 30) : ''
  const grade = typeof body.grade === 'string' ? body.grade.trim().slice(0, 50) : ''
  if (!options) return response.status(400).json({ message: 'Choose a course or class, a reason, and a future expiry if you set one.' })
  if (body.userId !== undefined && body.userId !== null && userId === null) return response.status(400).json({ message: 'Choose a valid student.' })
  if (userId === null && ((email !== null && !isValidEmail(email)) || !name || name.length > 200)) {
    return response.status(400).json({ message: 'Enter the student name and a valid email, or name only for a username account.' })
  }
  try {
    const result = await sql.begin(async (transaction) => {
      const account = await resolveGrantAccount(transaction, { userId, email, name, phone })
      const grant = await grantEnrollmentAccess(transaction, {
        userId: account.userId,
        student: buildStudentProfile({ fullName: account.name, grade, phone }),
        courseId: options.courseId,
        classId: options.classId,
        reason: options.reason,
        note: options.note,
        expiresAt: options.expiresAt,
        sponsorId: options.sponsorId,
        grantedBy: request.userId,
        override: body.override === true,
      })
      return { account, grant }
    })
    if (result.grant.status === 'skipped') return response.status(200).json({ status: 'skipped', message: 'This student already has access.' })
    await writeAdminAudit(request, 'access_granted', result.account.userId, null, { enrollmentId: result.grant.enrollmentId, classStatus: result.grant.classStatus, courseId: options.courseId, classId: options.classId, reason: options.reason, sponsorId: options.sponsorId, expiresAt: options.expiresAt, override: body.override === true })
    return response.status(201).json({ status: 'granted', enrollmentId: result.grant.enrollmentId, classStatus: result.grant.classStatus, ...(result.account.created ?? {}) })
  } catch (error) {
    if (error instanceof EnrollmentRefusal) return response.status(error.status).json(error.body)
    throw error
  }
})

app.get('/api/admin/access-grants', requireAdmin, async (_request, response) => {
  const grants = await sql`
    SELECT enrollments.id::INTEGER AS id,
           users.id::INTEGER AS "userId",
           COALESCE(NULLIF(users.name, ''), users.email) AS "studentName",
           users.email,
           COALESCE(classes.title, courses.title) AS item,
           enrollments.source,
           enrollments.access_status AS "accessStatus",
           enrollments.class_status AS "classStatus",
           enrollments.grant_reason AS "grantReason",
           sponsors.name AS "sponsorName",
           to_char(LEAST(enrollments.expires_at, (SELECT sponsors.end_date::timestamp AT TIME ZONE 'UTC' FROM sponsors WHERE sponsors.id = enrollments.sponsor_id)) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS "expiresAt",
           enrollments.created_at AS "grantedAt",
           enrollments.revoked_at AS "revokedAt",
           users.username IS NOT NULL AS "usernameAccount"
    FROM enrollments
    INNER JOIN users ON users.id = enrollments.user_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    LEFT JOIN sponsors ON sponsors.id = enrollments.sponsor_id
    WHERE enrollments.source <> 'paid'
    ORDER BY enrollments.created_at DESC, enrollments.id DESC
    LIMIT 500
  `
  return response.json(grants)
})

app.post('/api/admin/access-grants/:enrollmentId/revoke', requireAdmin, async (request, response) => {
  const enrollmentId = parseEnrollmentId(request.params.enrollmentId)
  if (enrollmentId === null) return response.status(400).json({ message: 'Invalid enrollment.' })
  const result = await sql.begin(async (transaction) => {
    const [enrollment] = await transaction`
      SELECT id, user_id::INTEGER AS "userId", source, access_status AS "accessStatus", class_id::INTEGER AS "classId"
      FROM enrollments
      WHERE id = ${enrollmentId}
      FOR UPDATE
    `
    if (!enrollment || enrollment.source === 'paid') return { status: 404, message: 'Granted access not found.' }
    if (enrollment.accessStatus === 'revoked') return { status: 409, message: 'This access has already been revoked.' }
    await transaction`UPDATE enrollments SET access_status = 'revoked', revoked_at = NOW(), revoked_by = ${request.userId} WHERE id = ${enrollmentId}`
    if (enrollment.classId !== null) {
      await transaction`
        UPDATE classes
        SET status = 'open', updated_at = NOW()
        WHERE id = ${enrollment.classId}
          AND status = 'full'
          AND (SELECT COUNT(*) FROM enrollments WHERE enrollments.class_id = classes.id AND enrollments.class_status = 'enrolled' AND ${enrollmentAccessCondition()}) < classes.capacity
      `
    }
    return { status: 200, enrollment }
  })
  if (result.status !== 200) return response.status(result.status).json({ message: result.message })
  await writeAdminAudit(request, 'access_revoked', result.enrollment.userId, { accessStatus: result.enrollment.accessStatus, enrollmentId }, { accessStatus: 'revoked', enrollmentId })
  return response.json({ id: enrollmentId, accessStatus: 'revoked' })
})

app.post('/api/admin/access-students/:userId/one-time-password', requireAdmin, async (request, response) => {
  const userId = parseEnrollmentId(request.params.userId)
  if (userId === null) return response.status(400).json({ message: 'Invalid student.' })
  const [user] = await sql`SELECT id::INTEGER AS id, username, role FROM users WHERE id = ${userId}`
  if (!user) return response.status(404).json({ message: 'Student account not found.' })
  if (user.role !== 'student' || !user.username) return response.status(400).json({ message: 'Only username accounts use one-time passwords.' })
  const temporaryPassword = generateOneTimePassword()
  const expiresAt = new Date(Date.now() + oneTimePasswordLifetimeMs)
  const passwordHash = await hashPassword(temporaryPassword)
  await sql.begin(async (transaction) => {
    await transaction`UPDATE users SET password_hash = ${passwordHash}, must_reset_password = true, one_time_password_expires_at = ${expiresAt} WHERE id = ${userId}`
    await transaction`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'admin_one_time_password_reset' WHERE user_id = ${userId} AND ended_at IS NULL`
  })
  await writeAdminAudit(request, 'one_time_password_reset', userId, null, { expiresAt: expiresAt.toISOString() })
  await createSecurityAlert(userId, 'password_reset_required', 'An administrator issued you a new one-time password. Sign in and set a new password.')
  response.set('Cache-Control', 'no-store')
  return response.json({ username: user.username, temporaryPassword, oneTimePasswordExpiresAt: expiresAt.toISOString() })
})

app.get('/api/admin/sponsors', requireAdmin, async (_request, response) => {
  const sponsors = await listSponsors()
  return response.json(sponsors)
})

app.post('/api/admin/sponsors', requireAdmin, async (request, response) => {
  const sponsor = parseSponsorInput(request.body)
  if (!sponsor) return response.status(400).json({ message: 'Enter a sponsor name and valid seat limit or end date.' })
  const [created] = await sql`
    INSERT INTO sponsors ${sql({ name: sponsor.name, contact: sponsor.contact, notes: sponsor.notes, end_date: sponsor.endDate })}
    RETURNING id::INTEGER AS id
  `
  return response.status(201).json({ id: created.id })
})

app.put('/api/admin/sponsors/:id', requireAdmin, async (request, response) => {
  const sponsorId = parseEnrollmentId(request.params.id)
  const sponsor = parseSponsorInput(request.body)
  if (sponsorId === null || !sponsor) return response.status(400).json({ message: 'Enter a sponsor name and valid seat limit or end date.' })
  const [updated] = await sql`
    UPDATE sponsors
    SET name = ${sponsor.name}, contact = ${sponsor.contact}, notes = ${sponsor.notes}, end_date = ${sponsor.endDate}, updated_at = NOW()
    WHERE id = ${sponsorId}
    RETURNING id::INTEGER AS id
  `
  if (!updated) return response.status(404).json({ message: 'Sponsor not found.' })
  return response.json({ id: updated.id })
})

app.delete('/api/admin/sponsors/:id', requireAdmin, async (request, response) => {
  const sponsorId = parseEnrollmentId(request.params.id)
  if (sponsorId === null) return response.status(400).json({ message: 'Invalid sponsor.' })
  const [usage] = await sql`SELECT COUNT(*)::INTEGER AS count FROM enrollments WHERE sponsor_id = ${sponsorId}`
  if (usage.count > 0) return response.status(409).json({ message: 'Sponsors with granted seats cannot be deleted.' })
  const [paymentUsage] = await sql`SELECT COUNT(*)::INTEGER AS count FROM sponsor_payments WHERE sponsor_id = ${sponsorId}`
  if (paymentUsage.count > 0) return response.status(409).json({ message: 'Sponsors with payment records cannot be deleted.' })
  const deleted = await sql`DELETE FROM sponsors WHERE id = ${sponsorId} RETURNING id`
  if (deleted.length === 0) return response.status(404).json({ message: 'Sponsor not found.' })
  return response.status(204).end()
})

const maxInvoiceBytes = 5 * 1024 * 1024
const invoiceSignatures = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff]
}

const parseSponsorPaymentInput = (body) => {
  const amountCents = Number(body?.amountCents)
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : ''
  const target = parseGrantTarget(body)
  if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > 100_000_000 || reference.length > 200 || !target) return null
  return { amountCents, reference, ...target }
}

const sanitizeInvoiceName = (value) => {
  const name = typeof value === 'string' ? value.trim().replace(/[^A-Za-z0-9._ -]/g, '_').slice(0, 120) : ''
  return name || 'invoice'
}

const isValidInvoice = (type, data) => {
  const signature = invoiceSignatures[type]
  return Boolean(signature) && signature.every((byte, index) => data[index] === byte)
}

app.get('/api/admin/sponsors/:id/payments', requireAdmin, async (request, response) => {
  const sponsorId = parseEnrollmentId(request.params.id)
  if (sponsorId === null) return response.status(400).json({ message: 'Invalid sponsor.' })
  const payments = await sql`
    SELECT sponsor_payments.id::INTEGER AS id,
           sponsor_payments.amount_cents::INTEGER AS "amountCents",
           sponsor_payments.reference,
           sponsor_payments.status,
           sponsor_payments.paid_at AS "paidAt",
           sponsor_payments.created_at AS "createdAt",
           sponsor_payments.course_id::INTEGER AS "courseId",
           sponsor_payments.class_id::INTEGER AS "classId",
           COALESCE(courses.title, classes.title) AS item,
           sponsor_payments.invoice_name AS "invoiceName",
           sponsor_payments.invoice_data IS NOT NULL AS "hasInvoice"
    FROM sponsor_payments
    LEFT JOIN courses ON courses.id = sponsor_payments.course_id
    LEFT JOIN classes ON classes.id = sponsor_payments.class_id
    WHERE sponsor_payments.sponsor_id = ${sponsorId}
    ORDER BY sponsor_payments.created_at DESC, sponsor_payments.id DESC
  `
  return response.json(payments)
})

app.post('/api/admin/sponsors/:id/payments', requireAdmin, async (request, response) => {
  const sponsorId = parseEnrollmentId(request.params.id)
  const payment = parseSponsorPaymentInput(request.body)
  if (sponsorId === null || !payment) return response.status(400).json({ message: 'Enter a positive amount and choose one course or class.' })
  const targetIssues = await getEnrollmentTargetIssues(sql, payment.courseId, payment.classId)
  if (targetIssues.includes('missing')) return response.status(404).json({ message: 'The selected course or class was not found.' })
  const [item] = payment.courseId !== null
    ? await sql`SELECT price::FLOAT AS price FROM courses WHERE id = ${payment.courseId}`
    : await sql`SELECT price::FLOAT AS price FROM classes WHERE id = ${payment.classId}`
  if (Math.round(item.price * 100) !== payment.amountCents) return response.status(400).json({ message: `The amount must equal the selected course or class price ($${item.price.toFixed(2)}).` })
  const [created] = await sql`
    INSERT INTO sponsor_payments (sponsor_id, amount_cents, reference, status, course_id, class_id)
    SELECT id, ${payment.amountCents}, ${payment.reference}, 'pending', ${payment.courseId}, ${payment.classId}
    FROM sponsors
    WHERE id = ${sponsorId}
    RETURNING id::INTEGER AS id
  `
  if (!created) return response.status(404).json({ message: 'Sponsor not found.' })
  await writeAdminAudit(request, 'sponsor_payment_recorded', null, null, { sponsorId, paymentId: created.id, amountCents: payment.amountCents, courseId: payment.courseId, classId: payment.classId })
  return response.status(201).json({ id: created.id })
})

app.post('/api/admin/sponsor-payments/:id/invoice', requireAdmin, express.raw({ type: Object.keys(invoiceSignatures), limit: maxInvoiceBytes }), async (request, response) => {
  const paymentId = parseEnrollmentId(request.params.id)
  const data = request.body
  const type = request.get('content-type')?.split(';')[0].trim()
  if (paymentId === null || !Buffer.isBuffer(data) || !isValidInvoice(type, data)) return response.status(400).json({ message: 'Upload a PDF, PNG, or JPEG invoice of 5 MB or smaller.' })
  const name = sanitizeInvoiceName(request.query.name)
  const [updated] = await sql`
    UPDATE sponsor_payments
    SET invoice_name = ${name}, invoice_type = ${type}, invoice_data = ${data}
    WHERE id = ${paymentId} AND status = 'pending'
    RETURNING id::INTEGER AS id
  `
  if (!updated) return response.status(404).json({ message: 'Pending payment not found.' })
  await writeAdminAudit(request, 'sponsor_payment_invoice_attached', null, null, { paymentId, invoiceName: name, invoiceBytes: data.length })
  return response.json({ id: updated.id })
})

app.get('/api/admin/sponsor-payments/:id/invoice', requireAdmin, async (request, response) => {
  const paymentId = parseEnrollmentId(request.params.id)
  const [invoice] = paymentId === null ? [] : await sql`
    SELECT invoice_name AS "invoiceName", invoice_type AS "invoiceType", invoice_data AS "invoiceData"
    FROM sponsor_payments
    WHERE id = ${paymentId} AND invoice_data IS NOT NULL
  `
  if (!invoice) return response.status(404).json({ message: 'Invoice not found.' })
  response.set({
    'Content-Type': invoice.invoiceType,
    'Content-Disposition': `attachment; filename="${invoice.invoiceName}"`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-store'
  })
  return response.send(invoice.invoiceData)
})

app.post('/api/admin/sponsor-payments/:id/mark-paid', requireAdmin, async (request, response) => {
  const paymentId = parseEnrollmentId(request.params.id)
  if (paymentId === null) return response.status(400).json({ message: 'Invalid payment.' })
  const [updated] = await sql`
    UPDATE sponsor_payments
    SET status = 'paid', paid_at = NOW()
    WHERE id = ${paymentId} AND status = 'pending' AND invoice_data IS NOT NULL
    RETURNING id::INTEGER AS id, sponsor_id::INTEGER AS "sponsorId"
  `
  if (!updated) return response.status(409).json({ message: 'Attach the paid invoice to this pending payment before marking it paid.' })
  await writeAdminAudit(request, 'sponsor_payment_marked_paid', null, { status: 'pending' }, { status: 'paid', paymentId, sponsorId: updated.sponsorId })
  return response.json({ id: updated.id })
})

app.get('/api/admin/sponsors/:id/report', requireAdmin, async (request, response) => {
  const sponsorId = parseEnrollmentId(request.params.id)
  const report = sponsorId === null ? null : await getSponsorReport(sponsorId)
  if (!report) return response.status(404).json({ message: 'Sponsor not found.' })
  return response.json({ sponsor: report.sponsor, students: report.rows })
})

app.get('/api/admin/sponsors/:id/report.csv', requireAdmin, async (request, response) => {
  const sponsorId = parseEnrollmentId(request.params.id)
  const report = sponsorId === null ? null : await getSponsorReport(sponsorId)
  if (!report) return response.status(404).end()
  const header = ['Student', 'Email', 'Item', 'Seat', 'Access', 'Expires', 'Granted', 'Progress %', 'Lessons completed', 'Live sessions attended', 'Live sessions total']
  const lines = [header, ...report.rows.map((row) => [row.name, row.email, row.item, row.seat, row.accessStatus, row.expiresAt, row.grantedAt, row.progressPercentage, row.lessonsCompleted, row.liveSessionsAttended, row.liveSessionsTotal])]
  response.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="sponsor-${sponsorId}-report.csv"`, 'Cache-Control': 'private, no-store' })
  return response.send(lines.map((cells) => cells.map(csvCell).join(',')).join('\r\n'))
})

app.post('/api/admin/access-imports', requireAdmin, async (request, response) => {
  const body = request.body ?? {}
  const csv = typeof body.csv === 'string' ? body.csv : ''
  if (!csv.trim()) return response.status(400).json({ message: 'Upload a CSV file.' })
  if (Buffer.byteLength(csv, 'utf8') > maxBulkCsvBytes) return response.status(413).json({ message: 'The CSV file must be 1 MB or smaller.' })
  const options = parseGrantOptions(body)
  if (!options) return response.status(400).json({ message: 'Choose a course or class, a reason, and a future expiry if you set one.' })
  const parsed = parseImportRows(csv)
  if (parsed.error) return response.status(400).json({ message: parsed.error })
  if (parsed.rows.length === 0) return response.status(400).json({ message: 'The CSV has no student rows.' })
  const targetIssues = await getEnrollmentTargetIssues(sql, options.courseId, options.classId)
  if (targetIssues.includes('missing')) return response.status(404).json({ message: 'The selected course or class was not found.' })
  const rows = await classifyImportRows(parsed.rows, options)
  const [batch] = await sql`
    INSERT INTO access_import_batches ${sql({ admin_user_id: request.userId, grant_options: sql.json(options), rows: sql.json(rows) })}
    RETURNING id::INTEGER AS id
  `
  const summary = { new: 0, existing: 0, duplicate: 0, invalid: 0, overflow: 0 }
  for (const row of rows) summary[row.status] += 1
  return response.status(201).json({
    batchId: batch.id,
    summary,
    targetIssues,
    rows: rows.map(({ row, name, email, guardianEmail, status, message }) => ({ row, name, email: email || guardianEmail, status, message })),
  })
})

app.post('/api/admin/access-imports/:batchId/confirm', requireAdmin, async (request, response) => {
  const batchId = parseEnrollmentId(request.params.batchId)
  if (batchId === null) return response.status(400).json({ message: 'Invalid import.' })
  const [batch] = await sql`SELECT grant_options AS "grantOptions", rows FROM access_import_batches WHERE id = ${batchId} AND admin_user_id = ${request.userId}`
  if (!batch) return response.status(404).json({ message: 'This import has expired or was already applied.' })
  const options = deserializeJson(batch.grantOptions)
  const rows = deserializeJson(batch.rows)
  const override = request.body?.override === true
  const issues = await getEnrollmentTargetIssues(sql, options.courseId, options.classId)
  if (issues.includes('missing')) return response.status(404).json({ message: 'The selected course or class was not found.' })
  if (issues.length > 0 && !override) return response.status(409).json({ message: 'Confirm the warnings to grant access anyway.', warnings: issues })
  const [claimed] = await sql`DELETE FROM access_import_batches WHERE id = ${batchId} RETURNING id`
  if (!claimed) return response.status(409).json({ message: 'This import was already applied.' })

  const results = []
  for (const row of rows) {
    if (row.status !== 'new' && row.status !== 'existing') {
      results.push({ row: row.row, name: row.name, outcome: row.status, message: row.message })
      continue
    }
    try {
      const outcome = await sql.begin(async (transaction) => {
        const account = await resolveGrantAccount(transaction, { userId: null, email: row.email || row.guardianEmail || null, name: row.name, phone: row.phone })
        const grant = await grantEnrollmentAccess(transaction, {
          userId: account.userId,
          student: buildStudentProfile({ fullName: row.name, grade: row.grade, phone: row.phone, relationship: row.email ? 'Self' : 'Guardian', notes: row.guardianEmail && row.email ? `Guardian email: ${row.guardianEmail}` : '' }),
          courseId: options.courseId,
          classId: options.classId,
          reason: options.reason,
          note: options.note,
          expiresAt: options.expiresAt,
          sponsorId: options.sponsorId,
          grantedBy: request.userId,
          override,
        })
        return { account, grant }
      })
      if (outcome.grant.status === 'skipped') {
        results.push({ row: row.row, name: row.name, outcome: 'skipped', message: 'Already has access.' })
        continue
      }
      await writeAdminAudit(request, 'access_import_granted', outcome.account.userId, null, { enrollmentId: outcome.grant.enrollmentId, classStatus: outcome.grant.classStatus, courseId: options.courseId, classId: options.classId, reason: options.reason, sponsorId: options.sponsorId, expiresAt: options.expiresAt })
      results.push({ row: row.row, name: row.name, outcome: 'granted', classStatus: outcome.grant.classStatus, ...(outcome.account.created ?? {}) })
    } catch (error) {
      if (error instanceof EnrollmentRefusal) {
        results.push({ row: row.row, name: row.name, outcome: 'refused', message: error.body.message })
      } else {
        console.error('Access import row failed', error?.code ?? error?.name ?? 'unknown')
        results.push({ row: row.row, name: row.name, outcome: 'failed', message: 'This row could not be added.' })
      }
    }
  }
  await writeAdminAudit(request, 'access_import_confirmed', null, null, { batchId, rows: rows.length, granted: results.filter((result) => result.outcome === 'granted').length })
  const summary = {}
  for (const result of results) summary[result.outcome] = (summary[result.outcome] ?? 0) + 1
  return response.json({ summary, results })
})

app.delete('/api/admin/access-imports/:batchId', requireAdmin, async (request, response) => {
  const batchId = parseEnrollmentId(request.params.batchId)
  if (batchId === null) return response.status(400).json({ message: 'Invalid import.' })
  await sql`DELETE FROM access_import_batches WHERE id = ${batchId} AND admin_user_id = ${request.userId}`
  return response.status(204).end()
})

app.get('/api/admin/payments', requireAdmin, async (_request, response) => {
  const payments = await sql`
    SELECT payments.id::INTEGER AS id,
           COALESCE(NULLIF(users.name, ''), NULLIF(payments.student_data->0->>'fullName', ''), 'Unknown student') AS student,
           COALESCE(bookstore_items.title, practice_exams.title, classes.title, courses.title, 'Purchase') AS course,
           CASE
             WHEN payments.bookstore_item_id IS NOT NULL OR payments.reference LIKE 'book-%' OR payments.reference LIKE 'test-book-%' THEN 'Book'
             WHEN payments.practice_exam_id IS NOT NULL THEN 'Practice exam'
             WHEN payments.class_id IS NOT NULL THEN 'Class'
             ELSE 'Course'
           END AS type,
           payments.amount::FLOAT AS amount,
           payments.currency,
           to_char(payments.created_at, 'Mon DD, YYYY') AS date,
           CASE
             WHEN payments.verification_status = 'pending' THEN 'Pending Verification'
             WHEN payments.verification_status = 'declined' THEN 'Declined'
             WHEN payments.status = 'paid' THEN 'Paid'
             WHEN payments.status = 'failed' THEN 'Failed'
             ELSE 'Pending'
           END AS status,
           payments.review_note AS "reviewNote"
    FROM payments
    INNER JOIN users ON users.id = payments.user_id
    LEFT JOIN courses ON courses.id = payments.course_id
    LEFT JOIN classes ON classes.id = payments.class_id
    LEFT JOIN practice_exams ON practice_exams.id = payments.practice_exam_id
    LEFT JOIN bookstore_items ON bookstore_items.id = payments.bookstore_item_id
    ORDER BY payments.created_at DESC, payments.id DESC
  `
  return response.json(payments)
})

app.get('/api/admin/sponsor-payments', requireAdmin, async (_request, response) => {
  const currency = process.env.MANUAL_PAYMENT_CURRENCY ?? process.env.CHAPA_CURRENCY ?? 'ETB'
  const payments = await sql`
    SELECT sponsor_payments.id::INTEGER AS id,
           sponsors.name AS sponsor,
           COALESCE(courses.title, classes.title, 'Sponsor payment') AS course,
           (sponsor_payments.amount_cents / 100.0)::FLOAT AS amount,
           ${currency}::TEXT AS currency,
           to_char(sponsor_payments.created_at, 'Mon DD, YYYY') AS date,
           CASE WHEN sponsor_payments.status = 'paid' THEN 'Paid' ELSE 'Pending' END AS status
    FROM sponsor_payments
    INNER JOIN sponsors ON sponsors.id = sponsor_payments.sponsor_id
    LEFT JOIN courses ON courses.id = sponsor_payments.course_id
    LEFT JOIN classes ON classes.id = sponsor_payments.class_id
    ORDER BY sponsor_payments.created_at DESC, sponsor_payments.id DESC
  `
  return response.json(payments)
})

app.get('/api/admin/csp-reports', requireAdmin, async (_request, response) => {
  const reports = await sql`
    SELECT id::INTEGER AS id,
           document_url AS "documentUrl",
           violated_directive AS "violatedDirective",
           blocked_url AS "blockedUrl",
           source_file AS "sourceFile",
           created_at AS "createdAt"
    FROM csp_violation_reports
    ORDER BY created_at DESC, id DESC
    LIMIT 200
  `
  return response.json(reports)
})

app.get('/api/admin/quiz-violations', requireAdmin, async (_request, response) => {
  const violations = await sql`
    SELECT quiz_attempts.id::INTEGER AS id,
           COALESCE(NULLIF(users.name, ''), students.full_name) AS "studentName",
           users.email AS "studentEmail",
           COALESCE(classes.title, courses.title, 'Class enrollment') AS "courseTitle",
           CASE WHEN enrollments.class_id IS NULL THEN courses.modules ELSE classes.modules END AS modules,
           quiz_attempts.lesson_id::DOUBLE PRECISION AS "lessonId",
           quiz_attempts.violations,
           quiz_attempts.disqualified,
           quiz_attempts.score,
           quiz_attempts.passed,
           quiz_attempts.retake_approved AS "retakeApproved",
           quiz_attempts.submitted_at AS "submittedAt",
           CASE WHEN retake.id IS NULL THEN 'not_retaken' WHEN retake.passed = true THEN 'passed' ELSE 'failed' END AS "retakeStatus",
           retake.score AS "retakeScore",
           retake.submitted_at AS "retakeSubmittedAt"
    FROM quiz_attempts
    LEFT JOIN LATERAL (
      SELECT follow_up.id, follow_up.passed, follow_up.score, follow_up.submitted_at
      FROM quiz_attempts AS follow_up
      WHERE follow_up.enrollment_id = quiz_attempts.enrollment_id
        AND follow_up.lesson_id = quiz_attempts.lesson_id
        AND follow_up.submitted_at IS NOT NULL
        AND follow_up.submitted_at > quiz_attempts.submitted_at
      ORDER BY follow_up.submitted_at ASC, follow_up.id ASC
      LIMIT 1
    ) AS retake ON true
    INNER JOIN enrollments ON enrollments.id = quiz_attempts.enrollment_id
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    LEFT JOIN courses ON courses.id = enrollments.course_id
    LEFT JOIN classes ON classes.id = enrollments.class_id
    WHERE quiz_attempts.disqualified = true OR COALESCE(jsonb_array_length(quiz_attempts.violations), 0) > 0
    ORDER BY quiz_attempts.submitted_at DESC NULLS LAST
  `
  return response.json(violations.map((violation) => {
    const { modules, ...serializedViolation } = violation
    return {
    ...serializedViolation,
    lessonTitle: findCourseLesson(modules, violation.lessonId)?.title ?? 'Quiz lesson',
    violations: (deserializeJson(violation.violations) ?? []).flatMap((item) => {
      const parsed = deserializeJson(item)
      return isPlainObject(parsed) ? [parsed] : []
    }),
    }
  }))
})

app.get('/api/admin/overview', requireAdmin, async (request, response) => {
  const classId = request.query.classId === undefined ? null : parseCourseId(String(request.query.classId))
  if (request.query.classId !== undefined && classId === null) return response.status(400).json({ message: 'Invalid class id.' })
  const [totals] = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'Published' THEN price * students ELSE 0 END), 0)::FLOAT AS "totalRevenue",
      COALESCE(SUM(CASE WHEN status = 'Published' THEN students ELSE 0 END), 0)::INTEGER AS "activeStudents",
      COUNT(*) FILTER (WHERE status = 'Published')::INTEGER AS "publishedCourses",
      COUNT(*) FILTER (WHERE status = 'Draft')::INTEGER AS "draftCourses",
      (SELECT COUNT(*) FROM tutors WHERE status = 'Active')::INTEGER AS "activeTutors",
      (SELECT COUNT(*) FROM tutors WHERE status = 'Inactive')::INTEGER AS "inactiveTutors"
    FROM courses
  `
  const revenueByMonth = await sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '6 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      )::DATE AS month
    ), revenue AS (
      SELECT date_trunc('month', updated_at)::DATE AS month, SUM(price * students)::FLOAT AS value
      FROM courses
      WHERE status = 'Published'
        AND updated_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
      GROUP BY 1
    )
    SELECT to_char(months.month, 'Mon') AS label, COALESCE(revenue.value, 0)::FLOAT AS value
    FROM months
    LEFT JOIN revenue ON revenue.month = months.month
    ORDER BY months.month
  `
  const enrollmentsByCategory = await sql`
    SELECT category AS label, SUM(students)::INTEGER AS value
    FROM courses
    WHERE status = 'Published'
      AND students > 0
    GROUP BY category
    ORDER BY value DESC, label
    LIMIT 5
  `
  const revenueByCategory = await sql`
    SELECT category AS label, SUM(price * students)::FLOAT AS value
    FROM courses
    WHERE status = 'Published'
      AND students > 0
    GROUP BY category
    ORDER BY value DESC, label
    LIMIT 5
  `
  const topCourses = await sql`
    SELECT title AS label, students::INTEGER AS value
    FROM courses
    WHERE status = 'Published'
      AND students > 0
    ORDER BY students DESC, title
    LIMIT 5
  `

  const paidRevenue = await sql`
    SELECT EXTRACT(YEAR FROM payments.paid_at)::INTEGER AS year,
           EXTRACT(MONTH FROM payments.paid_at)::INTEGER AS month,
           payments.currency,
           SUM(payments.amount)::FLOAT AS value
    FROM payments
    WHERE payments.status = 'paid'
      AND payments.paid_at IS NOT NULL
      AND (
        ${classId}::BIGINT IS NULL
        OR payments.class_id = ${classId}
        OR EXISTS (
          SELECT 1
          FROM enrollments
          WHERE enrollments.payment_id = payments.id
            AND enrollments.class_id = ${classId}
        )
      )
    GROUP BY 1, 2, 3
    ORDER BY 1, 2, 3
  `
  const currentYear = new Date().getFullYear()
  const paidRevenueYears = [...new Set([currentYear, ...paidRevenue.map((row) => Number(row.year))])].sort((a, b) => b - a)
  const paidRevenueCurrencies = [...new Set(paidRevenue.map((row) => row.currency))]
  const paidRevenueByKey = new Map(paidRevenue.map((row) => [`${row.year}-${row.month}-${row.currency}`, Number(row.value)]))
  const paidRevenueByMonth = paidRevenueYears.flatMap((year) => paidRevenueCurrencies.flatMap((currency) =>
    Array.from({ length: 12 }, (_, index) => {
      const month = index + 1
      const monthKey = `${year}-${String(month).padStart(2, '0')}`
      const label = new Date(Date.UTC(year, index, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
      return { year, monthKey, label, currency, value: paidRevenueByKey.get(`${year}-${month}-${currency}`) ?? 0 }
    })
  ))
  const paidRevenueComparison = paidRevenueCurrencies.map((currency) => ({
    currency,
    currentTotal: paidRevenue.filter((row) => Number(row.year) === currentYear && row.currency === currency).reduce((total, row) => total + Number(row.value), 0),
    previousTotal: paidRevenue.filter((row) => Number(row.year) === currentYear - 1 && row.currency === currency).reduce((total, row) => total + Number(row.value), 0),
  }))

  const lessonCompletionsByMonth = await sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '12 months',
        date_trunc('month', CURRENT_DATE) - INTERVAL '1 month',
        INTERVAL '1 month'
      )::DATE AS month
    ), completions AS (
      SELECT date_trunc('month', progress.completed_at)::DATE AS month, COUNT(*)::INTEGER AS value
      FROM student_lesson_progress AS progress
      INNER JOIN enrollments ON enrollments.id = progress.enrollment_id
      INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
      WHERE progress.completed_at IS NOT NULL
        AND (enrollments.class_id IS NULL OR enrollments.class_status = 'enrolled')
        AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
        AND progress.completed_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months'
        AND progress.completed_at < date_trunc('month', CURRENT_DATE)
      GROUP BY 1
    )
    SELECT to_char(months.month, 'YYYY-MM') AS "monthKey",
           to_char(months.month, 'Mon YYYY') AS label,
           COALESCE(completions.value, 0)::INTEGER AS value
    FROM months
    LEFT JOIN completions ON completions.month = months.month
    ORDER BY months.month
  `
  const quizPerformanceByMonth = await sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '12 months',
        date_trunc('month', CURRENT_DATE) - INTERVAL '1 month',
        INTERVAL '1 month'
      )::DATE AS month
    ), quiz_stats AS (
      SELECT date_trunc('month', quiz_attempts.submitted_at)::DATE AS month,
             AVG(quiz_attempts.score)::FLOAT AS "averageScore",
             COUNT(*)::INTEGER AS attempts
      FROM quiz_attempts
      INNER JOIN enrollments ON enrollments.id = quiz_attempts.enrollment_id
      INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
      WHERE quiz_attempts.submitted_at IS NOT NULL
        AND quiz_attempts.disqualified = false
        AND (enrollments.class_id IS NULL OR enrollments.class_status = 'enrolled')
        AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
        AND quiz_attempts.submitted_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months'
        AND quiz_attempts.submitted_at < date_trunc('month', CURRENT_DATE)
      GROUP BY 1
    )
    SELECT to_char(months.month, 'YYYY-MM') AS "monthKey",
           to_char(months.month, 'Mon YYYY') AS label,
           quiz_stats."averageScore",
           COALESCE(quiz_stats.attempts, 0)::INTEGER AS attempts
    FROM months
    LEFT JOIN quiz_stats ON quiz_stats.month = months.month
    ORDER BY months.month
  `
  const courseEnrollments = classId === null ? await sql`
    SELECT courses.title AS label,
           COUNT(DISTINCT enrollments.student_id)::INTEGER AS learners,
           COUNT(*)::INTEGER AS "enrollmentRecords"
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    INNER JOIN courses ON courses.id = enrollments.course_id
    WHERE enrollments.class_id IS NULL
      AND enrollments.course_id IS NOT NULL
    GROUP BY courses.id, courses.title
    ORDER BY learners DESC, courses.title
    LIMIT 8
  ` : []
  const classEnrollments = await sql`
    SELECT classes.title AS label,
           COUNT(DISTINCT enrollments.student_id)::INTEGER AS learners,
           COUNT(*)::INTEGER AS "enrollmentRecords"
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    INNER JOIN classes ON classes.id = enrollments.class_id
    WHERE enrollments.class_id IS NOT NULL
      AND enrollments.class_status = 'enrolled'
      AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
    GROUP BY classes.id, classes.title
    ORDER BY learners DESC, classes.title
    LIMIT 8
  `
  const [courseSummary] = classId === null ? await sql`
    SELECT COUNT(DISTINCT enrollments.student_id)::INTEGER AS learners,
           COUNT(*)::INTEGER AS "enrollmentRecords"
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    WHERE enrollments.class_id IS NULL
      AND enrollments.course_id IS NOT NULL
  ` : [{ learners: 0, enrollmentRecords: 0 }]
  const [classSummary] = await sql`
    SELECT COUNT(DISTINCT enrollments.student_id)::INTEGER AS learners,
           COUNT(*)::INTEGER AS "enrollmentRecords"
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    WHERE enrollments.class_id IS NOT NULL
      AND enrollments.class_status = 'enrolled'
      AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
  `
  const enrollmentSummary = { courses: courseSummary, classes: classSummary }

  const [lessonCompletion] = await sql`
    WITH eligible_enrollments AS (
      SELECT enrollments.id,
             enrollments.class_id,
             courses.modules AS course_modules,
             classes.modules AS class_modules
      FROM enrollments
      INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
      LEFT JOIN courses ON courses.id = enrollments.course_id
      LEFT JOIN classes ON classes.id = enrollments.class_id
      WHERE (enrollments.class_id IS NULL OR enrollments.class_status = 'enrolled')
        AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
    ), lesson_rows AS (
      SELECT DISTINCT eligible_enrollments.id AS enrollment_id, lesson.value->>'id' AS lesson_id
      FROM eligible_enrollments
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN eligible_enrollments.class_id IS NOT NULL AND jsonb_typeof(eligible_enrollments.class_modules) = 'array' THEN eligible_enrollments.class_modules
          WHEN eligible_enrollments.class_id IS NULL AND jsonb_typeof(eligible_enrollments.course_modules) = 'array' THEN eligible_enrollments.course_modules
          ELSE '[]'::jsonb
        END
      ) AS module(value)
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(module.value->'lessons') = 'array' THEN module.value->'lessons' ELSE '[]'::jsonb END
      ) AS lesson(value)
    )
    SELECT COUNT(*)::INTEGER AS total,
           COUNT(*) FILTER (WHERE progress.completed_at IS NOT NULL)::INTEGER AS completed
    FROM lesson_rows
    LEFT JOIN student_lesson_progress AS progress
      ON progress.enrollment_id = lesson_rows.enrollment_id
     AND progress.lesson_id = lesson_rows.lesson_id::BIGINT
  `
  const [classAttendance] = await sql`
    SELECT COUNT(*) FILTER (WHERE attendance.status = 'Present')::INTEGER AS present,
           COUNT(*)::INTEGER AS total
    FROM class_attendance AS attendance
    INNER JOIN enrollments ON enrollments.id = attendance.enrollment_id
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    WHERE enrollments.class_id IS NOT NULL
      AND enrollments.class_status = 'enrolled'
      AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
  `
  const [quizSummary] = await sql`
    SELECT AVG(quiz_attempts.score)::FLOAT AS average_score,
           COUNT(*)::INTEGER AS attempts
    FROM quiz_attempts
    INNER JOIN enrollments ON enrollments.id = quiz_attempts.enrollment_id
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    WHERE quiz_attempts.submitted_at IS NOT NULL
      AND quiz_attempts.disqualified = false
      AND (enrollments.class_id IS NULL OR enrollments.class_status = 'enrolled')
      AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
  `
  const learningMetrics = {
    lessonCompletion: {
      completed: lessonCompletion.completed,
      total: lessonCompletion.total,
      percentage: Number(lessonCompletion.total) > 0 ? Number(lessonCompletion.completed) / Number(lessonCompletion.total) * 100 : null,
    },
    classAttendance: {
      present: classAttendance.present,
      total: classAttendance.total,
      percentage: Number(classAttendance.total) > 0 ? Number(classAttendance.present) / Number(classAttendance.total) * 100 : null,
    },
    quizPerformance: {
      attempts: quizSummary.attempts,
      percentage: quizSummary.average_score,
    },
  }
  const enrollmentDistribution = await sql`
    SELECT 'courses' AS type, COUNT(*)::INTEGER AS count
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    WHERE enrollments.class_id IS NULL AND enrollments.course_id IS NOT NULL
      AND ${classId}::BIGINT IS NULL
    UNION ALL
    SELECT 'classes' AS type, COUNT(*)::INTEGER AS count
    FROM enrollments
    INNER JOIN payments ON payments.id = enrollments.payment_id AND payments.status = 'paid'
    WHERE enrollments.class_id IS NOT NULL AND enrollments.class_status = 'enrolled'
      AND (${classId}::BIGINT IS NULL OR enrollments.class_id = ${classId})
    UNION ALL
    SELECT 'exams' AS type, COUNT(*)::INTEGER AS count
    FROM practice_purchases
    INNER JOIN payments ON payments.id = practice_purchases.payment_id AND payments.status = 'paid'
    WHERE ${classId}::BIGINT IS NULL
  `

  const weakAreas = await getAdminWeakAreas(classId)

  response.json({
    ...totals,
    revenueByMonth,
    enrollmentsByCategory,
    revenueByCategory,
    topCourses,
    paidRevenueYears,
    paidRevenueByMonth,
    paidRevenueComparison,
    lessonCompletionsByMonth,
    quizPerformanceByMonth,
    courseEnrollments,
    classEnrollments,
    enrollmentSummary,
    learningMetrics,
    enrollmentDistribution,
    weakAreas,
  })
})

app.get('/api/admin/courses', requireAdmin, async (_request, response) => {
  const courses = await sql`
    SELECT ${courseColumns}
    FROM courses
    ORDER BY id
  `
  response.json(courses.map(deserializeCourse))
})

app.get('/api/admin/courses/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid course id.' })

  const course = await readCourse(id)
  if (!course) return response.status(404).json({ message: 'Course not found.' })
  return response.json(course)
})

app.get('/api/admin/tutors', requireAdmin, async (_request, response) => {
  const tutors = await sql`
    SELECT ${tutorColumns}
    FROM tutors
    ORDER BY id
  `
  return response.json(await addAssignedCoursesToTutors(tutors))
})

app.get('/api/admin/course-options', requireAdmin, async (_request, response) => {
  const courses = await sql`
    SELECT id::INTEGER AS id, title, price::FLOAT AS price
    FROM courses
    ORDER BY id
  `
  return response.json(courses)
})

app.get('/api/admin/tutors/:id', requireAdmin, async (request, response) => {
  const id = parseTutorId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid tutor id.' })

  const tutor = await readTutor(id)
  if (!tutor) return response.status(404).json({ message: 'Tutor not found.' })
  return response.json(tutor)
})

app.post('/api/admin/tutors', requireAdmin, async (request, response) => {
  const parsedTutor = parseTutorPayload(request.body)
  if (!parsedTutor) return response.status(400).json({ message: 'Enter valid tutor details.' })
  const { assignedCourseIds, ...tutor } = parsedTutor

  try {
    const [created] = await sql`
      INSERT INTO tutors ${sql(tutor)}
      RETURNING id
    `
    await updateTutorAssignments(Number(created.id), tutor.name, assignedCourseIds)
    const createdTutor = await readTutor(Number(created.id))
    return response.status(201).json({ ...createdTutor, inviteLink: `/admin/tutors/${created.id}` })
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'A tutor with this email already exists.' })
    throw error
  }
})

app.put('/api/admin/tutors/:id', requireAdmin, async (request, response) => {
  const id = parseTutorId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid tutor id.' })

  const parsedTutor = parseTutorPayload(request.body)
  if (!parsedTutor) return response.status(400).json({ message: 'Enter valid tutor details.' })
  const { assignedCourseIds, ...tutor } = parsedTutor

  try {
    const [existingTutor] = await sql`SELECT name FROM tutors WHERE id = ${id}`
    if (!existingTutor) return response.status(404).json({ message: 'Tutor not found.' })
    const [updated] = await sql`
      UPDATE tutors
      SET ${sql(tutor)}
      WHERE id = ${id}
      RETURNING id
    `
    if (!updated) return response.status(404).json({ message: 'Tutor not found.' })
    await updateTutorAssignments(id, tutor.name, assignedCourseIds, existingTutor.name)
    return response.json(await readTutor(id))
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'A tutor with this email already exists.' })
    throw error
  }
})

app.patch('/api/admin/tutors/:id/status', requireAdmin, async (request, response) => {
  const id = parseTutorId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid tutor id.' })

  const status = parseTutorStatus(request.body)
  if (!status) return response.status(400).json({ message: 'Tutor status must be Active or Inactive.' })

  const [updated] = await sql`
    UPDATE tutors
    SET status = ${status}
    WHERE id = ${id}
    RETURNING id
  `
  if (!updated) return response.status(404).json({ message: 'Tutor not found.' })
  return response.json(await readTutor(id))
})

app.delete('/api/admin/tutors/:id', requireAdmin, async (request, response) => {
  const id = parseTutorId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid tutor id.' })

  const [deleted] = await sql`DELETE FROM tutors WHERE id = ${id} RETURNING id`
  if (!deleted) return response.status(404).json({ message: 'Tutor not found.' })
  return response.status(204).end()
})

const readAdminAccounts = async () => {
  const users = await sql`
    SELECT id::INTEGER AS "accountId",
           id::INTEGER AS id,
           COALESCE(NULLIF(name, ''), split_part(email, '@', 1)) AS name,
           email,
           CASE role WHEN 'admin' THEN 'Admin' WHEN 'tutor' THEN 'Tutor' ELSE 'Student' END AS role,
           to_char(created_at, 'FMMonth DD, YYYY') AS joined,
           status,
           'user' AS "accountType"
    FROM users
  `
  const tutors = await sql`
    SELECT id::INTEGER AS "accountId",
           (1000000000 + id)::INTEGER AS id,
           name,
           email,
           'Tutor' AS role,
           to_char(created_at, 'FMMonth DD, YYYY') AS joined,
           CASE status WHEN 'Active' THEN 'Active' ELSE 'Suspended' END AS status,
           'tutor' AS "accountType"
    FROM tutors
  `
  const accountsByEmail = new Map([...users, ...tutors].map((account) => [account.email, account]))
  return [...accountsByEmail.values()].sort((first, second) => first.name.localeCompare(second.name))
}

app.get('/api/admin/users', requireAdmin, async (_request, response) => response.json(await readAdminAccounts()))

app.patch('/api/admin/users/:accountType/:id/status', requireAdmin, async (request, response) => {
  const id = parseTutorId(request.params.id)
  const accountType = request.params.accountType
  const status = request.body?.status
  if (id === null || !['user', 'tutor'].includes(accountType)) return response.status(400).json({ message: 'Invalid account.' })
  if (status !== 'Active' && status !== 'Suspended') return response.status(400).json({ message: 'Account status must be Active or Suspended.' })

  const updated = accountType === 'user'
    ? await sql`UPDATE users SET status = ${status} WHERE id = ${id} RETURNING id`
    : await sql`UPDATE tutors SET status = ${status === 'Active' ? 'Active' : 'Inactive'} WHERE id = ${id} RETURNING id, email`
  if (!updated.length) return response.status(404).json({ message: 'Account not found.' })
  if (accountType === 'tutor') await sql`UPDATE users SET status = ${status} WHERE email = ${updated[0].email}`
  const account = (await readAdminAccounts()).find((currentAccount) => currentAccount.accountType === accountType && currentAccount.accountId === id)
  return response.json(account)
})

app.post('/api/admin/users/:accountType/:id/reset-password', requireAdmin, async (request, response) => {
  const id = parseTutorId(request.params.id)
  const accountType = request.params.accountType
  if (id === null || !['user', 'tutor'].includes(accountType)) return response.status(400).json({ message: 'Invalid account.' })
  const temporaryPassword = generateOneTimePassword()
  const passwordHash = await hashPassword(temporaryPassword)
  const expiresAt = new Date(Date.now() + adminResetPasswordLifetimeMs)
  let userId
  let email
  if (accountType === 'user') {
    const [user] = await sql`UPDATE users SET password_hash = ${passwordHash}, must_reset_password = true, one_time_password_expires_at = ${expiresAt} WHERE id = ${id} RETURNING id, email`
    if (!user) return response.status(404).json({ message: 'Account not found.' })
    userId = Number(user.id)
    email = user.email
  } else {
    const [tutor] = await sql`SELECT name, email, status FROM tutors WHERE id = ${id}`
    if (!tutor) return response.status(404).json({ message: 'Account not found.' })
    const [user] = await sql`
      INSERT INTO users ${sql({ name: tutor.name, email: tutor.email, password_hash: passwordHash, role: 'tutor', status: tutor.status === 'Active' ? 'Active' : 'Suspended', must_reset_password: true, one_time_password_expires_at: expiresAt })}
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, must_reset_password = true, one_time_password_expires_at = EXCLUDED.one_time_password_expires_at
      RETURNING id, email
    `
    userId = Number(user.id)
    email = user.email
  }
  const [activeSessions] = await sql`SELECT COUNT(*)::INTEGER AS count FROM auth_sessions WHERE user_id = ${userId} AND ended_at IS NULL`
  await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'admin_password_reset_required' WHERE user_id = ${userId} AND ended_at IS NULL`
  await writeAdminAudit(request, 'password_reset_required', userId, { activeSessions: activeSessions.count }, { mustResetPassword: true, activeSessions: 0, oneTimePasswordExpiresAt: expiresAt.toISOString() })
  await createSecurityAlert(userId, 'password_reset_required', 'An administrator issued you a temporary password. Sign in and set a new password before it expires.')
  response.set('Cache-Control', 'no-store')
  return response.json({ email, temporaryPassword, oneTimePasswordExpiresAt: expiresAt.toISOString() })
})

app.post('/api/admin/courses', requireAdmin, async (request, response) => {
  const course = parseCoursePayload(request.body)
  if (!course) return response.status(400).json({ message: 'Enter all required course details.' })

  try {
    const courseWithTutor = { ...course, tutor_id: await findTutorIdByName(course.tutor) }
    const [created] = await sql`
      INSERT INTO courses ${sql(courseWithTutor)}
      RETURNING id
    `
    return response.status(201).json(await readCourse(Number(created.id)))
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'A course with this title already exists.' })
    throw error
  }
})

app.put('/api/admin/courses/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid course id.' })

  const course = parseCoursePayload(request.body)
  if (!course) return response.status(400).json({ message: 'Enter all required course details.' })

  try {
    const courseWithTutor = { ...course, tutor_id: await findTutorIdByName(course.tutor) }
    const updated = await sql.begin(async (transaction) => {
      const [current] = await transaction`SELECT modules FROM courses WHERE id = ${id} FOR UPDATE`
      if (!current) return null
      const previousModules = deserializeJson(current.modules)
      const nextModules = deserializeJson(courseWithTutor.modules)
      const addedIds = getChangedCourseLessonIds(previousModules, nextModules)
      const staleProgress = addedIds.length ? await transaction`
        SELECT DISTINCT progress.lesson_id::TEXT AS "lessonId"
        FROM student_lesson_progress progress
        INNER JOIN enrollments ON enrollments.id = progress.enrollment_id
        WHERE enrollments.course_id = ${id}
          AND enrollments.class_id IS NULL
          AND progress.lesson_id::TEXT = ANY(${addedIds})
      ` : []
      const modules = remapReusedCourseLessonIds(previousModules, nextModules, staleProgress.map(({ lessonId }) => lessonId))
      const [saved] = await transaction`
        UPDATE courses
        SET ${transaction({ ...courseWithTutor, modules: JSON.stringify(modules) })}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      `
      return saved ?? null
    })
    if (!updated) return response.status(404).json({ message: 'Course not found.' })
    return response.json(await readCourse(id))
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'A course with this title already exists.' })
    throw error
  }
})

app.delete('/api/admin/courses/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid course id.' })

  const [deleted] = await sql`DELETE FROM courses WHERE id = ${id} RETURNING id`
  if (!deleted) return response.status(404).json({ message: 'Course not found.' })
  return response.status(204).end()
})

const syllabusGrades = [6, 8, 12]

const parseSyllabusGrade = (value) => {
  const grade = Number(value)
  return syllabusGrades.includes(grade) ? grade : null
}

const parseSyllabusTopicPayload = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!title || title.length > 200 || description.length > 1000) return null
  return { title, description }
}

const syllabusTopicColumns = sql.unsafe(`
  id::INTEGER AS id,
  grade::INTEGER AS grade,
  title,
  description,
  position::INTEGER AS position
`)

app.get('/api/syllabus-topics', requireAdminOrTutor, async (request, response) => {
  const grade = request.query.grade === undefined ? null : parseSyllabusGrade(request.query.grade)
  if (request.query.grade !== undefined && grade === null) return response.status(400).json({ message: 'Invalid grade.' })
  const topics = grade === null
    ? await sql`SELECT ${syllabusTopicColumns} FROM syllabus_topics ORDER BY grade, position`
    : await sql`SELECT ${syllabusTopicColumns} FROM syllabus_topics WHERE grade = ${grade} ORDER BY position`
  return response.json(topics)
})

app.post('/api/admin/syllabus-topics', requireAdmin, async (request, response) => {
  const grade = parseSyllabusGrade(request.body?.grade)
  const payload = parseSyllabusTopicPayload(request.body)
  if (grade === null || !payload) return response.status(400).json({ message: 'Enter a valid grade, title, and description.' })

  try {
    const [created] = await sql`
      INSERT INTO syllabus_topics (grade, title, description, position)
      VALUES (${grade}, ${payload.title}, ${payload.description}, (SELECT COALESCE(MAX(position), 0) + 1 FROM syllabus_topics WHERE grade = ${grade}))
      RETURNING ${syllabusTopicColumns}
    `
    return response.status(201).json(created)
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'This grade already has a topic with this title.' })
    throw error
  }
})

app.put('/api/admin/syllabus-topics/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  const payload = parseSyllabusTopicPayload(request.body)
  if (id === null || !payload) return response.status(400).json({ message: 'Enter a valid title and description.' })

  try {
    const [updated] = await sql`
      UPDATE syllabus_topics
      SET title = ${payload.title}, description = ${payload.description}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING ${syllabusTopicColumns}
    `
    if (!updated) return response.status(404).json({ message: 'Topic not found.' })
    return response.json(updated)
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'This grade already has a topic with this title.' })
    throw error
  }
})

app.delete('/api/admin/syllabus-topics/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid topic id.' })

  const [deleted] = await sql`DELETE FROM syllabus_topics WHERE id = ${id} RETURNING id`
  if (!deleted) return response.status(404).json({ message: 'Topic not found.' })
  return response.status(204).end()
})

app.put('/api/admin/syllabus-topics/grades/:grade/order', requireAdmin, async (request, response) => {
  const grade = parseSyllabusGrade(request.params.grade)
  const topicIds = Array.isArray(request.body?.topicIds) ? request.body.topicIds : null
  if (grade === null || !topicIds || !topicIds.every(Number.isInteger)) return response.status(400).json({ message: 'Invalid topic order.' })

  const reordered = await sql.begin(async (transaction) => {
    const current = await transaction`SELECT id::INTEGER AS id FROM syllabus_topics WHERE grade = ${grade} FOR UPDATE`
    const currentIds = current.map((topic) => topic.id).sort((first, second) => first - second)
    const requestedIds = [...topicIds].sort((first, second) => first - second)
    if (currentIds.length !== requestedIds.length || currentIds.some((id, index) => id !== requestedIds[index])) return false
    for (const [index, id] of topicIds.entries()) {
      await transaction`UPDATE syllabus_topics SET position = ${index + 1}, updated_at = NOW() WHERE id = ${id}`
    }
    return true
  })
  if (!reordered) return response.status(400).json({ message: 'The topic order does not match this grade.' })

  return response.json(await sql`SELECT ${syllabusTopicColumns} FROM syllabus_topics WHERE grade = ${grade} ORDER BY position`)
})

const classPrograms = ['international-online-interactive', 'summer-camp', 'ministry-exam-prep']
const classStatuses = ['pending_schedule', 'open', 'full', 'closed']

const isValidClassDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const parseClassPayload = (body, fixedStartDate, previousModules = []) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const cover = typeof body.cover === 'string' ? body.cover.trim() : ''
  const programId = body.program_id
  const tutorId = Number(body.tutor_id)
  const capacity = Number(body.capacity)
  const schedule = body.schedule
  const meetingLink = typeof body.meeting_link === 'string' ? body.meeting_link.trim() : ''
  const modules = Array.isArray(body.modules) ? body.modules : []
  const hasInvalidSolverLesson = getCourseLessons(modules).some((lesson) => lesson?.type === 'stepByStepSolver' && !isValidStepByStepSolverConfig(lesson.stepByStepSolver))
  const price = Number(body.price)
  const published = body.published
  const gradeLevel = body.grade_level ?? null
  const examDate = programId === 'ministry-exam-prep' ? body.exam_date ?? null : null
  const today = new Date().toISOString().slice(0, 10)
  const validSchedule = schedule && typeof schedule === 'object' && !Array.isArray(schedule) && isValidClassDate(schedule.startDate) && isValidClassDate(schedule.endDate) && (schedule.startDate >= today || schedule.startDate === fixedStartDate) && schedule.endDate >= today && schedule.endDate > schedule.startDate
  if (hasInvalidSolverLesson || !title || title.length > 200 || (cover && !isValidCourseCover(cover)) || !classPrograms.includes(programId) || !Number.isInteger(tutorId) || tutorId < 1 || !Number.isInteger(capacity) || capacity < 1 || !validSchedule || !hasScheduledClassQuizzes(modules, previousModules) || meetingLink.length > 2000 || !Number.isFinite(price) || price < 0 || typeof published !== 'boolean' || (gradeLevel !== null && (!Number.isInteger(gradeLevel) || gradeLevel < 1 || gradeLevel > 12)) || (examDate !== null && !isValidClassDate(examDate))) return null
  return { program_id: programId, title, cover, tutor_id: tutorId, capacity, schedule, meeting_link: meetingLink, modules, price, published, grade_level: gradeLevel, exam_date: examDate }
}

const classColumns = sql.unsafe(`
  classes.id::INTEGER AS id,
  classes.program_id,
  classes.title,
  classes.cover,
  classes.tutor_id::INTEGER AS tutor_id,
  classes.capacity,
  classes.schedule,
  classes.meeting_link,
  classes.modules,
  classes.grade_level,
  to_char(classes.exam_date, 'YYYY-MM-DD') AS exam_date,
  classes.price::FLOAT AS price,
  classes.status,
  classes.published
`)

const readAdminClass = async (id) => {
  const [classRecord] = await sql`SELECT ${classColumns} FROM classes WHERE classes.id = ${id}`
  return classRecord ? { ...classRecord, modules: deserializeJson(classRecord.modules) ?? [] } : null
}

const refreshClassStatus = async (id) => {
  const [classRecord] = await sql`SELECT capacity, published, status, schedule FROM classes WHERE id = ${id} FOR UPDATE`
  if (!classRecord) return null
  if (classRecord.schedule?.endDate && classRecord.schedule.endDate < new Date().toISOString().slice(0, 10)) {
    await sql`UPDATE classes SET status = 'closed', updated_at = NOW() WHERE id = ${id}`
    return readAdminClass(id)
  }
  const [counts] = await sql`SELECT COUNT(*) FILTER (WHERE class_status = 'enrolled')::INTEGER AS enrolled FROM enrollments WHERE class_id = ${id}`
  const status = !classRecord.published ? 'closed' : classRecord.status === 'closed' ? 'closed' : counts.enrolled >= classRecord.capacity ? 'full' : 'open'
  await sql`UPDATE classes SET status = ${status}, updated_at = NOW() WHERE id = ${id}`
  return readAdminClass(id)
}

app.get('/api/admin/classes/:id/statistics', requireAdmin, async (request, response) => {
  const classId = parseCourseId(request.params.id)
  if (classId === null) return response.status(400).json({ message: 'Invalid class id.' })
  const [tutor] = request.userRole === 'tutor'
    ? await sql`
      SELECT tutors.id
      FROM tutors
      INNER JOIN users ON LOWER(TRIM(users.email)) = LOWER(TRIM(tutors.email))
      WHERE users.id = ${request.userId}
    `
    : [null]
  if (request.userRole === 'tutor' && !tutor) return response.status(403).json({ message: 'Tutor profile not found.' })
  const tutorCondition = tutor ? sql`AND classes.tutor_id = ${tutor.id}` : sql``
  const [classRecord] = await sql`SELECT id FROM classes WHERE id = ${classId} AND published = true ${tutorCondition}`
  if (!classRecord) return response.status(404).json({ message: 'Class not found.' })

  const [lessonTotals] = await sql`
    SELECT COUNT(*)::INTEGER AS "lessonCount",
           COUNT(*) FILTER (WHERE lesson.value->>'type' = 'live')::INTEGER AS "liveLessonCount"
    FROM classes
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(classes.modules, '[]'::jsonb)) module(value)
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(module.value->'lessons', '[]'::jsonb)) lesson(value)
    WHERE classes.id = ${classId}
  `
  const students = await sql`
    WITH class_lessons AS (
      SELECT (lesson.value->>'id')::BIGINT AS lesson_id,
             COALESCE(lesson.value->>'title', 'Lesson') AS title,
             COALESCE(lesson.value->>'type', 'lesson') AS type
      FROM classes
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(classes.modules, '[]'::jsonb)) module(value)
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(module.value->'lessons', '[]'::jsonb)) lesson(value)
      WHERE classes.id = ${classId}
    )
    SELECT enrollments.id::INTEGER AS "enrollmentId",
           students.id::INTEGER AS "studentId",
           COALESCE(NULLIF(users.name, ''), students.full_name) AS "studentName",
           (SELECT COUNT(*)::INTEGER FROM class_lessons lesson INNER JOIN student_lesson_progress progress ON progress.enrollment_id = enrollments.id AND progress.lesson_id = lesson.lesson_id WHERE progress.completed_at IS NOT NULL) AS "lessonsCompleted",
           (SELECT COUNT(*)::INTEGER FROM quiz_attempts attempts WHERE attempts.enrollment_id = enrollments.id AND attempts.submitted_at IS NOT NULL) AS "quizCount",
           (SELECT AVG(attempts.score)::FLOAT FROM quiz_attempts attempts WHERE attempts.enrollment_id = enrollments.id AND attempts.submitted_at IS NOT NULL) AS "averageQuizScore",
           (SELECT COALESCE(SUM(progress.active_seconds), 0)::INTEGER FROM student_lesson_progress progress WHERE progress.enrollment_id = enrollments.id) AS "activeSeconds",
           (SELECT COUNT(*) FILTER (WHERE attendance.status = 'Present')::INTEGER FROM class_attendance attendance WHERE attendance.enrollment_id = enrollments.id) AS "presentCount",
           (SELECT COUNT(*)::INTEGER FROM class_attendance attendance WHERE attendance.enrollment_id = enrollments.id) AS "attendanceCount",
           CASE WHEN (SELECT COUNT(*) FROM class_attendance attendance WHERE attendance.enrollment_id = enrollments.id) = 0 THEN NULL
                ELSE ROUND((SELECT COUNT(*) FILTER (WHERE attendance.status = 'Present')::NUMERIC FROM class_attendance attendance WHERE attendance.enrollment_id = enrollments.id) * 100 / (SELECT COUNT(*)::NUMERIC FROM class_attendance attendance WHERE attendance.enrollment_id = enrollments.id))::INTEGER END AS "attendanceRate",
           CASE WHEN (SELECT COUNT(*) FROM class_lessons) = 0 THEN 0
                ELSE ROUND((SELECT COUNT(*)::NUMERIC FROM class_lessons lesson INNER JOIN student_lesson_progress progress ON progress.enrollment_id = enrollments.id AND progress.lesson_id = lesson.lesson_id WHERE progress.completed_at IS NOT NULL) * 100 / (SELECT COUNT(*)::NUMERIC FROM class_lessons))::INTEGER END AS "progressPercentage",
           COALESCE((
             SELECT jsonb_agg(jsonb_build_object(
               'lessonId', lesson.lesson_id,
               'title', lesson.title,
               'type', lesson.type,
               'completed', progress.completed_at IS NOT NULL,
               'quizCount', COALESCE(quiz_totals.count, 0),
               'averageScore', quiz_totals.average_score
             ) ORDER BY lesson.lesson_id)
             FROM class_lessons lesson
             LEFT JOIN student_lesson_progress progress ON progress.enrollment_id = enrollments.id AND progress.lesson_id = lesson.lesson_id
             LEFT JOIN LATERAL (
               SELECT COUNT(*)::INTEGER AS count, AVG(attempts.score)::FLOAT AS average_score
               FROM quiz_attempts attempts
               WHERE attempts.enrollment_id = enrollments.id AND attempts.lesson_id = lesson.lesson_id AND attempts.submitted_at IS NOT NULL
             ) quiz_totals ON true
           ), '[]'::jsonb) AS lessons
    FROM enrollments
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    WHERE enrollments.class_id = ${classId} AND enrollments.class_status = 'enrolled'
    ORDER BY "studentName"
  `
  return response.json({ ...lessonTotals, students })
})

app.get('/api/admin/classes/:id/leaderboard', requireAdminOrTutor, async (request, response) => {
  const classId = parseCourseId(request.params.id)
  if (classId === null) return response.status(400).json({ message: 'Invalid class id.' })
  const [tutor] = request.userRole === 'tutor'
    ? await sql`
      SELECT tutors.id
      FROM tutors
      INNER JOIN users ON LOWER(TRIM(users.email)) = LOWER(TRIM(tutors.email))
      WHERE users.id = ${request.userId}
    `
    : [null]
  if (request.userRole === 'tutor' && !tutor) return response.status(403).json({ message: 'Tutor profile not found.' })
  const tutorCondition = tutor ? sql`AND classes.tutor_id = ${tutor.id}` : sql``
  const [classRecord] = await sql`SELECT id FROM classes WHERE id = ${classId} AND published = true ${tutorCondition}`
  if (!classRecord) return response.status(404).json({ message: 'Class not found.' })
  const leaderboard = await sql`
    SELECT ROW_NUMBER() OVER (ORDER BY (COALESCE(lesson_totals.completed, 0) * 25 + COALESCE(quiz_totals.passed, 0) * 50 + COALESCE(attendance_totals.present, 0) * 40) DESC, COALESCE(NULLIF(users.name, ''), students.full_name), students.id)::INTEGER AS rank,
           students.id::INTEGER AS "studentId",
           split_part(COALESCE(NULLIF(users.name, ''), students.full_name), ' ', 1) AS "firstName",
           LEFT(COALESCE(NULLIF(users.name, ''), students.full_name, users.email), 1) AS avatar,
           (COALESCE(lesson_totals.completed, 0) * 25 + COALESCE(quiz_totals.passed, 0) * 50 + COALESCE(attendance_totals.present, 0) * 40)::INTEGER AS xp
    FROM enrollments
    INNER JOIN students ON students.id = enrollments.student_id
    INNER JOIN users ON users.id = students.user_id
    INNER JOIN classes ON classes.id = enrollments.class_id
    LEFT JOIN LATERAL (
      SELECT COUNT(*) FILTER (WHERE progress.completed_at IS NOT NULL)::INTEGER AS completed
      FROM student_lesson_progress progress
      WHERE progress.enrollment_id = enrollments.id
    ) lesson_totals ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) FILTER (WHERE attempts.passed = true)::INTEGER AS passed
      FROM quiz_attempts attempts
      WHERE attempts.enrollment_id = enrollments.id AND attempts.submitted_at IS NOT NULL
    ) quiz_totals ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) FILTER (WHERE attendance.status = 'Present')::INTEGER AS present
      FROM class_attendance attendance
      WHERE attendance.enrollment_id = enrollments.id
    ) attendance_totals ON true
    WHERE enrollments.class_id = ${classId} AND enrollments.class_status = 'enrolled'
    ORDER BY xp DESC, COALESCE(NULLIF(users.name, ''), students.full_name), students.id
  `
  return response.json(leaderboard)
})

app.get('/api/admin/classes', requireAdmin, async (_request, response) => {
  await sql`UPDATE classes SET status = 'closed', updated_at = NOW() WHERE (schedule->>'endDate') IS NOT NULL AND (schedule->>'endDate') < CURRENT_DATE::TEXT AND status <> 'closed'`
  const [classes, enrollments, pendingStudents, tutors, courses] = await Promise.all([
    sql`SELECT ${classColumns} FROM classes WHERE published = true ORDER BY created_at DESC, id DESC`,
    sql`SELECT enrollments.id::INTEGER AS id, enrollments.class_id::INTEGER AS class_id, students.id::INTEGER AS student_id, COALESCE(NULLIF(users.name, ''), students.full_name) AS student_name, to_char(enrollments.created_at, 'FMMonth DD, YYYY') AS enrolled_date, enrollments.class_status AS status, COALESCE(attendance.attendance, '{}'::jsonb) AS attendance FROM enrollments INNER JOIN students ON students.id = enrollments.student_id INNER JOIN users ON users.id = students.user_id LEFT JOIN LATERAL (SELECT jsonb_object_agg(lesson_id::TEXT, status) AS attendance FROM class_attendance WHERE enrollment_id = enrollments.id) attendance ON true WHERE enrollments.class_id IS NOT NULL ORDER BY enrollments.created_at DESC`,
    sql`SELECT enrollments.id::INTEGER AS id, COALESCE(NULLIF(users.name, ''), students.full_name) AS student_name, to_char(enrollments.created_at, 'FMMonth DD, YYYY') AS enrolled_date, NULLIF(regexp_replace(students.age_or_grade, '\\D', '', 'g'), '')::INTEGER AS age FROM enrollments INNER JOIN students ON students.id = enrollments.student_id INNER JOIN users ON users.id = students.user_id INNER JOIN payments ON payments.id = enrollments.payment_id INNER JOIN courses ON courses.id = enrollments.course_id WHERE payments.status = 'paid' AND enrollments.class_id IS NULL AND LOWER(courses.category) = 'international online interactive' ORDER BY enrollments.created_at DESC`,
    sql`SELECT id::INTEGER AS id, name FROM tutors WHERE status = 'Active' ORDER BY name`,
  ])
  response.json({ classes: classes.map((classRecord) => ({ ...classRecord, modules: deserializeJson(classRecord.modules) ?? [] })), enrollments, pendingStudents, tutors })
})

app.post('/api/admin/classes', requireAdmin, async (request, response) => {
  const classPayload = parseClassPayload(request.body)
  if (!classPayload || classPayload.grade_level === null) return response.status(400).json({ message: 'Enter valid class details.' })
  if (classPayload.program_id === 'ministry-exam-prep' && classPayload.exam_date === null) return response.status(400).json({ message: 'Enter an exam date for this Ministry Exam Prep class.' })
  try {
    const [created] = await sql`
      INSERT INTO classes (program_id, title, cover, tutor_id, capacity, schedule, meeting_link, modules, price, published, status, grade_level, exam_date)
      VALUES (${classPayload.program_id}, ${classPayload.title}, ${classPayload.cover}, ${classPayload.tutor_id}, ${classPayload.capacity}, ${JSON.stringify(classPayload.schedule)}::jsonb, ${classPayload.meeting_link}, ${JSON.stringify(classPayload.modules)}::jsonb, ${classPayload.price}, ${classPayload.published}, ${classPayload.published ? 'open' : 'closed'}, ${classPayload.grade_level}, ${classPayload.exam_date})
      RETURNING id
    `
    return response.status(201).json(await readAdminClass(Number(created.id)))
  } catch (error) {
    if (error.code === '23503') return response.status(400).json({ message: 'Select an existing tutor before creating the class.' })
    throw error
  }
})

app.put('/api/admin/classes/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Enter valid class details.' })
  const saveResult = await sql.begin(async (transaction) => {
    const [existing] = await transaction`SELECT schedule, modules FROM classes WHERE id = ${id} FOR UPDATE`
    if (!existing) return 'not-found'
    const classPayload = parseClassPayload(request.body, existing.schedule.startDate, deserializeJson(existing.modules) ?? [])
    if (!classPayload) return 'invalid'
    if (classPayload.schedule.startDate !== existing.schedule.startDate) return 'start-date-fixed'
    if (classPayload.schedule.endDate < existing.schedule.endDate) return 'end-date-cannot-shrink'
    const [updated] = await transaction`UPDATE classes SET ${transaction(classPayload)}, updated_at = NOW() WHERE id = ${id} RETURNING id`
    return updated ? 'saved' : 'not-found'
  })
  if (saveResult === 'not-found') return response.status(404).json({ message: 'Class not found.' })
  if (saveResult === 'invalid') return response.status(400).json({ message: 'Enter valid class details.' })
  if (saveResult === 'start-date-fixed') return response.status(400).json({ message: 'The class start date cannot be changed.' })
  if (saveResult === 'end-date-cannot-shrink') return response.status(400).json({ message: 'The class end date can only be extended.' })
  return response.json(await refreshClassStatus(id))
})

app.delete('/api/admin/classes/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid class id.' })
  const [deleted] = await sql`DELETE FROM classes WHERE id = ${id} RETURNING id`
  if (!deleted) return response.status(404).json({ message: 'Class not found.' })
  return response.status(204).end()
})

app.post('/api/admin/classes/assign', requireAdmin, async (request, response) => {
  const enrollmentId = parseCourseId(String(request.body?.enrollmentId ?? ''))
  const classPayload = parseClassPayload({ ...request.body, program_id: 'international-online-interactive', title: request.body?.title, price: request.body?.price ?? 0, published: true })
  if (enrollmentId === null || !classPayload) return response.status(400).json({ message: 'Enter valid class assignment details.' })
  const created = await sql.begin(async (transaction) => {
    const [enrollment] = await transaction`SELECT id FROM enrollments WHERE id = ${enrollmentId} AND class_id IS NULL FOR UPDATE`
    if (!enrollment) return null
    const [newClass] = await transaction`INSERT INTO classes ${transaction({ ...classPayload, status: 'open' })} RETURNING id`
    await transaction`UPDATE enrollments SET class_id = ${newClass.id}, class_status = 'enrolled' WHERE id = ${enrollmentId}`
    await transaction`UPDATE classes SET status = CASE WHEN capacity <= 1 THEN 'full' ELSE 'open' END WHERE id = ${newClass.id}`
    return newClass
  })
  if (!created) return response.status(404).json({ message: 'Pending enrollment not found.' })
  return response.status(201).json(await readAdminClass(Number(created.id)))
})

app.patch('/api/admin/classes/enrollments/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  const status = request.body?.status
  if (id === null || !['enrolled', 'waitlisted'].includes(status)) return response.status(400).json({ message: 'Enter a valid enrollment status.' })
  const [enrollment] = await sql`UPDATE enrollments SET class_status = ${status} WHERE id = ${id} AND class_id IS NOT NULL RETURNING class_id`
  if (!enrollment) return response.status(404).json({ message: 'Class enrollment not found.' })
  await refreshClassStatus(Number(enrollment.class_id))
  return response.status(204).end()
})

app.delete('/api/admin/classes/enrollments/:id', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  if (id === null) return response.status(400).json({ message: 'Invalid enrollment id.' })
  const [enrollment] = await sql`UPDATE enrollments SET class_id = NULL, class_status = NULL WHERE id = ${id} AND class_id IS NOT NULL RETURNING class_id`
  if (!enrollment) return response.status(404).json({ message: 'Class enrollment not found.' })
  await refreshClassStatus(Number(enrollment.class_id))
  return response.status(204).end()
})

app.patch('/api/admin/classes/enrollments/:id/attendance', requireAdmin, async (request, response) => {
  const id = parseCourseId(request.params.id)
  const lessonId = parseEnrollmentId(String(request.body?.lessonId ?? ''))
  const status = request.body?.status
  if (id === null || lessonId === null || !['Present', 'Absent'].includes(status)) return response.status(400).json({ message: 'Enter a valid live lesson attendance status.' })
  const result = await sql.begin(async (transaction) => {
    const [enrollment] = await transaction`
      SELECT enrollments.id, classes.modules
      FROM enrollments
      INNER JOIN classes ON classes.id = enrollments.class_id
      WHERE enrollments.id = ${id} AND enrollments.class_status = 'enrolled'
      FOR UPDATE OF enrollments
    `
    if (!enrollment) return null
    const lesson = getCourseLessons(deserializeJson(enrollment.modules)).find((item) => item?.id === lessonId)
    if (!lesson || lesson.type !== 'live') return { error: 'Live lesson not found.' }
    await transaction`
      INSERT INTO class_attendance (enrollment_id, lesson_id, status)
      VALUES (${id}, ${lessonId}, ${status})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET status = EXCLUDED.status, marked_at = NOW()
    `
    await transaction`
      INSERT INTO student_lesson_progress (enrollment_id, lesson_id, completed_at)
      VALUES (${id}, ${lessonId}, ${status === 'Present' ? sql`NOW()` : sql`NULL`})
      ON CONFLICT (enrollment_id, lesson_id) DO UPDATE SET completed_at = ${status === 'Present' ? sql`COALESCE(student_lesson_progress.completed_at, NOW())` : sql`NULL`}, last_accessed_at = NOW()
    `
    return { status }
  })
  if (!result) return response.status(404).json({ message: 'Class enrollment not found.' })
  if (result.error) return response.status(404).json({ message: result.error })
  return response.status(204).end()
})

app.get('/api/auth/security/sessions', requireAuthenticated, async (request, response) => {
  const sessions = await sql`
    SELECT token AS id, token AS "sessionId", created_at AS "createdAt", last_active_at AS "lastActiveAt", client_ip AS "clientIp", country, city, browser, browser_version AS "browserVersion", os, os_version AS "osVersion", device_type AS "deviceType", device_vendor AS "deviceVendor", device_model AS "deviceModel", nickname, ended_at AS "endedAt", ended_reason AS "endedReason"
    FROM auth_sessions
    WHERE user_id = ${request.userId} AND ended_at IS NULL AND idle_expires_at > NOW() AND absolute_expires_at > NOW()
    ORDER BY last_active_at DESC
  `
  return response.json(sessions.map((session) => ({ ...session, clientIp: displayClientIp(session.clientIp, maskIpAddress), isCurrent: session.sessionId === request.sessionId })))
})

app.delete('/api/auth/security/sessions/:sessionId', requireAuthenticated, async (request, response) => {
  const sessionId = request.params.sessionId
  if (!/^[a-f0-9]{64}$/.test(sessionId)) return response.status(400).json({ message: 'Invalid session id.' })
  const [revoked] = await sql`
    UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'user_revoked'
    WHERE token = ${sessionId} AND user_id = ${request.userId} AND ended_at IS NULL
    RETURNING token
  `
  if (!revoked) return response.status(404).json({ message: 'Active session not found.' })
  if (sessionId === request.sessionId) clearSecurityCookies(response)
  return response.status(204).end()
})

app.patch('/api/auth/security/sessions/:sessionId/nickname', requireAuthenticated, async (request, response) => {
  const sessionId = request.params.sessionId
  if (!/^[a-f0-9]{64}$/.test(sessionId)) return response.status(400).json({ message: 'Invalid session id.' })
  const nickname = parseNickname(request.body?.nickname)
  if (!nickname.ok) return response.status(400).json({ message: 'Use up to 40 letters, numbers, spaces, or basic punctuation.' })
  const [updated] = await sql`
    UPDATE auth_sessions SET nickname = ${nickname.value}
    WHERE token = ${sessionId} AND user_id = ${request.userId} AND ended_at IS NULL
    RETURNING token
  `
  if (!updated) return response.status(404).json({ message: 'Active session not found.' })
  return response.status(204).end()
})

app.post('/api/auth/security/sign-out-everywhere', requireAuthenticated, async (request, response) => {
  await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'signed_out_everywhere' WHERE user_id = ${request.userId} AND ended_at IS NULL`
  clearSecurityCookies(response)
  return response.status(204).end()
})

app.get('/api/auth/security/login-history', requireAuthenticated, async (request, response) => {
  const events = await sql`
    SELECT id, succeeded, reason, client_ip AS "clientIp", country, city, browser, os, device_type AS "deviceType", created_at AS "createdAt"
    FROM login_events WHERE user_id = ${request.userId}
    ORDER BY created_at DESC LIMIT 100
  `
  return response.json(events.map((event) => ({ ...event, clientIp: maskIpAddress(event.clientIp) })))
})

app.get('/api/auth/security/alerts', requireAuthenticated, async (request, response) => {
  const alerts = await sql`
    SELECT id, alert_type AS type, message, metadata, reviewed_at AS "reviewedAt", created_at AS "createdAt"
    FROM security_alerts WHERE user_id = ${request.userId}
    ORDER BY created_at DESC LIMIT 50
  `
  return response.json(alerts)
})

app.get('/api/auth/security/two-factor', requireAuthenticated, async (request, response) => {
  const [record] = await sql`SELECT enabled_at AS "enabledAt" FROM two_factor_secrets WHERE user_id = ${request.userId}`
  return response.json({ enabled: Boolean(record?.enabledAt) })
})

app.post('/api/auth/security/two-factor/setup', requireAuthenticated, async (request, response) => {
  const [existing] = await sql`SELECT enabled_at AS "enabledAt" FROM two_factor_secrets WHERE user_id = ${request.userId}`
  if (existing?.enabledAt) return response.status(409).json({ message: 'Disable two-factor authentication before starting a new setup.' })
  try {
    const secret = encodeBase32(randomBytes(20))
    const encryptedSecret = encryptTotpSecret(secret)
    await sql`
      INSERT INTO two_factor_secrets ${sql({ user_id: request.userId, encrypted_secret: encryptedSecret, backup_code_hashes: JSON.stringify([]), enabled_at: null, updated_at: new Date() })}
      ON CONFLICT (user_id) DO UPDATE SET encrypted_secret = EXCLUDED.encrypted_secret, backup_code_hashes = '[]'::jsonb, enabled_at = NULL, updated_at = NOW()
    `
    const [user] = await sql`SELECT email FROM users WHERE id = ${request.userId}`
    const issuer = 'Coursesharp'
    const provisioningUri = `otpauth://totp/${encodeURIComponent(`${issuer}:${user.email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
    return response.json({ secret, provisioningUri })
  } catch {
    return response.status(503).json({ message: 'Two-factor setup is unavailable until the security encryption key is configured.' })
  }
})

app.post('/api/auth/security/two-factor/enable', requireAuthenticated, async (request, response) => {
  const code = request.body?.code
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return response.status(400).json({ message: 'Enter the six-digit code from your authenticator.' })
  const [record] = await sql`SELECT encrypted_secret FROM two_factor_secrets WHERE user_id = ${request.userId} AND enabled_at IS NULL`
  if (!record) return response.status(409).json({ message: 'Start two-factor setup before confirming it.' })
  let valid = false
  try { valid = verifyTotp(decryptTotpSecret(record.encrypted_secret), code) } catch { return response.status(503).json({ message: 'Two-factor setup is unavailable until the security encryption key is configured.' }) }
  if (!valid) return response.status(401).json({ message: 'The authenticator code is incorrect.' })
  const backupCodes = Array.from({ length: 10 }, () => randomBytes(5).toString('hex').toUpperCase())
  await sql`
    UPDATE two_factor_secrets SET backup_code_hashes = ${JSON.stringify(backupCodes.map(hashBackupCode))}::jsonb, enabled_at = NOW(), updated_at = NOW()
    WHERE user_id = ${request.userId}
  `
  await rotateAuthenticatedSession(request, response, 'two_factor_enabled')
  return response.json({ backupCodes })
})

app.post('/api/auth/security/two-factor/disable', requireAuthenticated, async (request, response) => {
  const { currentPassword, code } = request.body ?? {}
  if (typeof currentPassword !== 'string' || typeof code !== 'string') return response.status(400).json({ message: 'Enter your password and authenticator code.' })
  const [user] = await sql`SELECT password_hash FROM users WHERE id = ${request.userId}`
  if (!user || !(await verifyPassword(currentPassword, user.password_hash)) || !await verifySecondFactor(request.userId, code)) return response.status(401).json({ message: 'The password or authenticator code is incorrect.' })
  await sql`DELETE FROM two_factor_secrets WHERE user_id = ${request.userId}`
  await rotateAuthenticatedSession(request, response, 'two_factor_disabled')
  return response.status(204).end()
})

app.get('/api/admin/security/alerts', requireAdmin, async (_request, response) => {
  const alerts = await sql`
    SELECT alerts.id, alerts.user_id AS "userId", users.name AS "userName", users.email,
           alerts.alert_type AS type, alerts.message, alerts.metadata, alerts.created_at AS "createdAt"
    FROM security_alerts alerts
    INNER JOIN users ON users.id = alerts.user_id
    WHERE alerts.reviewed_at IS NULL
    ORDER BY alerts.created_at DESC
    LIMIT 10
  `
  return response.json(alerts)
})

app.get('/api/admin/security', requireAdmin, async (_request, response) => {
  const [loginEvents, sessions, alerts, users, auditLog] = await Promise.all([
    sql`SELECT events.id, events.user_id AS "userId", COALESCE(users.name, events.email) AS "userName", events.email, events.succeeded, events.reason, events.client_ip AS "clientIp", events.country, events.city, events.browser, events.os, events.device_type AS "deviceType", events.created_at AS "createdAt" FROM login_events events LEFT JOIN users ON users.id = events.user_id ORDER BY events.created_at DESC LIMIT 500`,
    sql`SELECT sessions.token AS id, sessions.token AS "sessionId", users.id AS "userId", COALESCE(NULLIF(users.name, ''), users.email) AS "userName", users.email, users.role, sessions.client_ip AS "clientIp", sessions.country, sessions.city, sessions.browser, sessions.browser_version AS "browserVersion", sessions.os, sessions.os_version AS "osVersion", sessions.device_type AS "deviceType", sessions.device_vendor AS "deviceVendor", sessions.device_model AS "deviceModel", sessions.nickname, sessions.created_at AS "createdAt", sessions.last_active_at AS "lastActiveAt" FROM auth_sessions sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.ended_at IS NULL AND sessions.idle_expires_at > NOW() AND sessions.absolute_expires_at > NOW() AND sessions.last_active_at > NOW() - INTERVAL '30 minutes' ORDER BY sessions.last_active_at DESC LIMIT 500`,
    sql`SELECT alerts.id, alerts.user_id AS "userId", users.name AS "userName", users.email, alerts.alert_type AS type, alerts.message, alerts.metadata, alerts.created_at AS "createdAt" FROM security_alerts alerts INNER JOIN users ON users.id = alerts.user_id ORDER BY alerts.created_at DESC LIMIT 200`,
    sql`SELECT id::INTEGER AS id, name, email, role, status, account_locked AS "accountLocked", must_reset_password AS "mustResetPassword" FROM users ORDER BY name`,
    sql`SELECT audit.id, actor.name AS "actorName", target.name AS "targetName", audit.action, audit.before_state AS "beforeState", audit.after_state AS "afterState", audit.client_ip AS "clientIp", audit.created_at AS "createdAt" FROM admin_audit_log audit LEFT JOIN users actor ON actor.id = audit.actor_user_id LEFT JOIN users target ON target.id = audit.target_user_id ORDER BY audit.created_at DESC LIMIT 500`,
  ])
  return response.json({ loginEvents, sessions, alerts, users, auditLog })
})

app.post('/api/admin/security/sessions/:sessionId/revoke', requireAdmin, async (request, response) => {
  const sessionId = request.params.sessionId
  if (!/^[a-f0-9]{64}$/.test(sessionId)) return response.status(400).json({ message: 'Invalid session id.' })
  const [session] = await sql`SELECT token, user_id AS "userId", ended_at AS "endedAt" FROM auth_sessions WHERE token = ${sessionId}`
  if (!session || session.endedAt) return response.status(404).json({ message: 'Active session not found.' })
  await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'admin_revoked' WHERE token = ${sessionId}`
  await writeAdminAudit(request, 'session_revoked', session.userId, { active: true }, { active: false })
  await createSecurityAlert(session.userId, 'admin_session_revoked', 'An administrator signed out one of your sessions.')
  return response.status(204).end()
})

app.post('/api/admin/security/users/:userId/force-logout', requireAdmin, async (request, response) => {
  const userId = parseTutorId(request.params.userId)
  if (userId === null) return response.status(400).json({ message: 'Invalid user id.' })
  const [user] = await sql`SELECT id FROM users WHERE id = ${userId}`
  if (!user) return response.status(404).json({ message: 'User not found.' })
  const [count] = await sql`SELECT COUNT(*)::INTEGER AS count FROM auth_sessions WHERE user_id = ${userId} AND ended_at IS NULL`
  await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'admin_force_logout' WHERE user_id = ${userId} AND ended_at IS NULL`
  await writeAdminAudit(request, 'user_force_logout', userId, { activeSessions: count.count }, { activeSessions: 0 })
  await createSecurityAlert(userId, 'admin_force_logout', 'An administrator signed out all sessions for your account.')
  return response.status(204).end()
})

app.patch('/api/admin/security/users/:userId/lock', requireAdmin, async (request, response) => {
  const userId = parseTutorId(request.params.userId)
  const locked = request.body?.locked
  if (userId === null || typeof locked !== 'boolean') return response.status(400).json({ message: 'Enter a valid account lock action.' })
  const [user] = await sql`SELECT id, status, account_locked AS "accountLocked", locked_until AS "lockedUntil" FROM users WHERE id = ${userId}`
  if (!user) return response.status(404).json({ message: 'User not found.' })
  const before = { status: user.status, lockedUntil: user.lockedUntil, accountLocked: user.accountLocked }
  if (locked) {
    await sql`UPDATE users SET account_locked = true WHERE id = ${userId}`
    await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'admin_account_locked' WHERE user_id = ${userId} AND ended_at IS NULL`
  } else {
    await sql`UPDATE users SET account_locked = false, locked_until = NULL WHERE id = ${userId}`
  }
  const after = { status: user.status, accountLocked: locked, lockedUntil: locked ? user.lockedUntil : null }
  await writeAdminAudit(request, locked ? 'account_locked' : 'account_unlocked', userId, before, after)
  await createSecurityAlert(userId, locked ? 'admin_account_locked' : 'admin_account_unlocked', locked ? 'An administrator locked your account.' : 'An administrator unlocked your account.')
  return response.json(after)
})

app.post('/api/admin/security/users/:userId/force-password-reset', requireAdmin, async (request, response) => {
  const userId = parseTutorId(request.params.userId)
  if (userId === null) return response.status(400).json({ message: 'Invalid user id.' })
  const [user] = await sql`SELECT id, must_reset_password AS "mustResetPassword" FROM users WHERE id = ${userId}`
  if (!user) return response.status(404).json({ message: 'User not found.' })
  const [activeSessions] = await sql`SELECT COUNT(*)::INTEGER AS count FROM auth_sessions WHERE user_id = ${userId} AND ended_at IS NULL`
  await sql`UPDATE users SET must_reset_password = true WHERE id = ${userId}`
  await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'admin_password_reset_required' WHERE user_id = ${userId} AND ended_at IS NULL`
  await writeAdminAudit(request, 'password_reset_required', userId, { mustResetPassword: user.mustResetPassword, activeSessions: activeSessions.count }, { mustResetPassword: true, activeSessions: 0 })
  await createSecurityAlert(userId, 'password_reset_required', 'An administrator requires a password change before you can access your account.')
  return response.status(204).end()
})

app.patch('/api/auth/profile', requireAuthenticated, async (request, response) => {
  const profile = isValidUserProfile(request.body)
  if (!profile) return response.status(400).json({ message: 'Enter a valid name, email, and phone number.' })
  try {
    const [updated] = await sql`
      UPDATE users
      SET name = ${profile.name}, email = ${profile.email}, phone = ${profile.phone}
      WHERE id = ${request.userId}
      RETURNING id, name, email, phone, role, to_char(created_at, 'FMMonth DD, YYYY') AS "createdAt"
    `
    if (!updated) return response.status(404).json({ message: 'User profile not found.' })
    return response.json(updated)
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ message: 'An account with this email already exists.' })
    throw error
  }
})

app.post('/api/auth/sign-up', async (request, response) => {
  const { email, password, name } = request.body ?? {}
  const phone = typeof request.body?.phone === 'string' ? request.body.phone.trim() : ''
  if (!isValidCredentials(email, password) || typeof name !== 'string' || !name.trim() || name.trim().length > 120 || phone.length > 40) {
    return response.status(400).json({ message: 'Enter your full name, valid email, phone number, and a password between 8 and 128 characters.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const passwordHash = await hashPassword(password)

  try {
    const [user] = await sql`
      INSERT INTO users ${sql({ name: name.trim(), phone, email: normalizedEmail, password_hash: passwordHash })}
      RETURNING id, name, email, phone, role, created_at AS "createdAt"
    `
    request.securityDeviceId = getDeviceId(request)
    await recordAuthenticationAttempt({ user, email: normalizedEmail, succeeded: true, reason: 'sign_up', request })
    const session = await createAuthSession(user.id, user.role, request, sanitizeClientHints(request.body?.clientHints))
    setSecurityCookies(response, session.rawToken, session.deviceId, user.role)
    return response.status(201).json({ user })
  } catch (error) {
    if (error.code === '23505') {
      return response.status(409).json({ message: 'An account with this email already exists.' })
    }
    throw error
  }
})

const signInFailureMessage = 'Invalid email, username, or password.'

app.post('/api/auth/sign-in', async (request, response) => {
  const { email, password, captchaToken } = request.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 128) {
    return response.status(400).json({ message: signInFailureMessage })
  }

  const normalizedEmail = email.trim().toLowerCase()
  request.securityDeviceId = getDeviceId(request)
  const metadata = getClientMetadata(request)
  const [ipFailures] = await sql`
    SELECT COUNT(*)::INTEGER AS count FROM login_events
    WHERE client_ip = ${metadata.ip} AND succeeded = false AND created_at > NOW() - INTERVAL '15 minutes'
  `
  if (ipFailures.count >= 30) {
    await recordAuthenticationAttempt({ user: null, email: normalizedEmail, succeeded: false, reason: 'ip_rate_limited', request })
    return response.status(429).json({ message: signInFailureMessage, captchaRequired: true })
  }
  const [user] = await sql`
    SELECT id, name, email, phone, password_hash, role, status, locked_until, account_locked AS "accountLocked", must_reset_password AS "mustResetPassword", one_time_password_expires_at AS "oneTimePasswordExpiresAt", created_at AS "createdAt"
    FROM users
    WHERE email = ${normalizedEmail} OR username = ${normalizedEmail}
  `
  const [accountFailures] = await sql`
    SELECT COUNT(*)::INTEGER AS count FROM login_events
    WHERE email = ${normalizedEmail} AND succeeded = false AND created_at > NOW() - INTERVAL '15 minutes'
  `
  if (accountFailures.count >= 3 && getTurnstileSecret() && (!captchaToken || !await verifyTurnstile(captchaToken, metadata.ip))) {
    await recordAuthenticationAttempt({ user, email: normalizedEmail, succeeded: false, reason: 'captcha_failed', request })
    return response.status(401).json({ message: signInFailureMessage, captchaRequired: true })
  }
  const isLocked = user?.accountLocked || user?.locked_until && new Date(user.locked_until).getTime() > Date.now()
  const oneTimePasswordExpired = Boolean(user?.mustResetPassword && user.oneTimePasswordExpiresAt && new Date(user.oneTimePasswordExpiresAt).getTime() <= Date.now())
  const passwordMatches = user && !oneTimePasswordExpired && await verifyPassword(password, user.password_hash)
  if (!user || user.status !== 'Active' || isLocked || !passwordMatches) {
    const reason = isLocked ? 'account_locked' : !user ? 'unknown_account' : user.status !== 'Active' ? 'inactive_account' : oneTimePasswordExpired ? 'one_time_password_expired' : 'incorrect_password'
    const failedAttempt = await recordAuthenticationAttempt({ user, email: normalizedEmail, succeeded: false, reason, request })
    const captchaRequired = failedAttempt.accountFailureCount >= 3
    return response.status(failedAttempt.ipLimited ? 429 : 401).json({ message: signInFailureMessage, ...(captchaRequired ? { captchaRequired: true } : {}) })
  }

  const [twoFactor] = await sql`SELECT user_id FROM two_factor_secrets WHERE user_id = ${user.id} AND enabled_at IS NOT NULL`
  if (twoFactor && (typeof request.body?.twoFactorCode !== 'string' || !await verifySecondFactor(user.id, request.body.twoFactorCode))) {
    await recordAuthenticationAttempt({ user, email: normalizedEmail, succeeded: false, reason: 'second_factor_failed', request })
    return response.status(401).json({ message: signInFailureMessage, twoFactorRequired: true })
  }

  const [access] = await sql`
    SELECT
      EXISTS (SELECT 1 FROM enrollments WHERE enrollments.user_id = ${user.id} AND ${enrollmentAccessCondition()}) AS "hasAccess",
      EXISTS (
        SELECT 1 FROM enrollments
        WHERE enrollments.user_id = ${user.id}
          AND enrollments.sponsor_id IS NOT NULL
          AND enrollments.access_status = 'active'
          AND (enrollments.expires_at IS NULL OR enrollments.expires_at > NOW())
          AND NOT (${sponsorEndedCondition()})
      ) AS "hasSponsoredGrant"
  `
  if (access.hasSponsoredGrant && !access.hasAccess) {
    return response.status(403).json({ message: 'Your access is waiting for your sponsor\'s payment. Contact your administrator.' })
  }

  await sql`UPDATE users SET locked_until = NULL WHERE id = ${user.id}`
  const { password_hash: _passwordHash, locked_until: _lockedUntil, accountLocked: _accountLocked, oneTimePasswordExpiresAt: _oneTimePasswordExpiresAt, ...account } = user
  await recordAuthenticationAttempt({ user, email: normalizedEmail, succeeded: true, reason: 'success', request })
  const session = await createAuthSession(user.id, user.role, request, sanitizeClientHints(request.body?.clientHints))
  setSecurityCookies(response, session.rawToken, session.deviceId, user.role)
  return response.json({ user: account })
})

app.post('/api/auth/change-password', requireAuthenticated, async (request, response) => {
  const { currentPassword, newPassword } = request.body ?? {}
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
    return response.status(400).json({ message: 'Your new password must be between 8 and 128 characters.' })
  }

  const [user] = await sql`
    SELECT password_hash, one_time_password_expires_at AS "oneTimePasswordExpiresAt"
    FROM users
    WHERE id = ${request.userId}
  `
  const oneTimePasswordExpired = Boolean(user?.oneTimePasswordExpiresAt && new Date(user.oneTimePasswordExpiresAt).getTime() <= Date.now())
  if (!user || oneTimePasswordExpired || !(await verifyPassword(currentPassword, user.password_hash))) {
    return response.status(401).json({ message: 'Your current password is incorrect.' })
  }

  const passwordHash = await hashPassword(newPassword)
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, must_reset_password = false, one_time_password_expires_at = NULL
    WHERE id = ${request.userId}
  `
  await sql`
    UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'password_changed'
    WHERE user_id = ${request.userId} AND ended_at IS NULL
  `
  request.securityDeviceId = getDeviceId(request)
  const session = await createAuthSession(request.userId, request.userRole, request)
  setSecurityCookies(response, session.rawToken, session.deviceId, request.userRole)
  return response.status(204).end()
})

app.post('/api/auth/set-password', async (request, response) => {
  const { token, password } = request.body ?? {}
  if (typeof token !== 'string' || token.length > 200 || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return response.status(400).json({ message: 'Enter a password between 8 and 128 characters.' })
  }
  const passwordHash = await hashPassword(password)
  const userId = await sql.begin(async (transaction) => {
    const [record] = await transaction`
      SELECT user_id::INTEGER AS "userId"
      FROM password_reset_tokens
      WHERE token_hash = ${hashToken(token)} AND used_at IS NULL AND expires_at > NOW()
      FOR UPDATE
    `
    if (!record) return null
    await transaction`UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ${record.userId} AND used_at IS NULL`
    await transaction`UPDATE users SET password_hash = ${passwordHash}, must_reset_password = false, one_time_password_expires_at = NULL WHERE id = ${record.userId}`
    await transaction`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'password_set' WHERE user_id = ${record.userId} AND ended_at IS NULL`
    return record.userId
  })
  if (!userId) return response.status(400).json({ message: 'This link is invalid or has expired.' })
  return response.status(204).end()
})

app.post('/api/auth/sign-out', async (request, response) => {
  const sessionToken = getSessionToken(request)
  if (sessionToken) await sql`UPDATE auth_sessions SET ended_at = NOW(), ended_reason = 'signed_out' WHERE token = ${hashToken(sessionToken)} AND ended_at IS NULL`
  clearSecurityCookies(response)
  return response.status(204).end()
})

app.use(express.static(distDirectory))
app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => response.sendFile(path.join(distDirectory, 'index.html')))

app.use((error, _request, response, _next) => {
  console.error('API request failed', error?.code ?? error?.name ?? 'unknown')
  response.status(500).json({ message: 'Unable to complete your request.' })
})

const cleanSecurityRecords = async () => {
  await Promise.all([
    sql`DELETE FROM login_events WHERE created_at < NOW() - INTERVAL '90 days'`,
    sql`DELETE FROM auth_sessions WHERE (ended_at IS NOT NULL AND ended_at < NOW() - INTERVAL '30 days') OR (ended_at IS NULL AND LEAST(idle_expires_at, absolute_expires_at) < NOW() - INTERVAL '30 days')`,
    sql`DELETE FROM admin_audit_log WHERE created_at < NOW() - INTERVAL '1 year'`,
    sql`DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '30 days' OR used_at < NOW() - INTERVAL '30 days'`,
    sql`DELETE FROM access_import_batches WHERE created_at < NOW() - INTERVAL '1 day'`,
  ])
}

initializeDatabase()
  .then(async () => {
    void cleanSecurityRecords().catch(() => console.error('Security retention cleanup failed.'))
    const retentionTimer = setInterval(() => void cleanSecurityRecords().catch(() => console.error('Security retention cleanup failed.')), 6 * 60 * 60 * 1000)
    retentionTimer.unref()
    app.listen(port, '0.0.0.0', () => {
      console.log(`API listening on port ${port}`)
    })
  })
  .catch(async (error) => {
    console.error('Unable to initialize the database.', error)
    await sql.end({ timeout: 5 })
    process.exit(1)
  })
