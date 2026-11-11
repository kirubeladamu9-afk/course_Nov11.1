import { type AdminCourse, type AdminModule, type AdminTutor, type AdminUser } from '@/components/admin/admin-data'
import { type Course } from '@/interfaces/course'
import { type ArticleContentBlock, type ArticleVocabularyEntry, type SimulationConfig, type StepByStepSolverLearnerConfig, type StepByStepSolverSession, type StepByStepSolverState } from '@/components/admin/admin-data'
import { type PracticeExam, type PracticeExamWithQuestions, type PracticePurchase, type PracticeQuestion } from '@/components/practice/practice-data'
import { type LearnerArticleCheckpoint } from '@/lib/article-checkpoints'
import { navigateTo } from '@/lib/navigation'
import { readClientHints } from '@/lib/client-hints'

export interface AuthUser {
  id: number | string
  name?: string
  email: string
  phone?: string
  role: string
  createdAt: string
  mustResetPassword?: boolean
}

export interface SecuritySession {
  id: string
  sessionId: string
  createdAt: string
  lastActiveAt: string
  clientIp: string
  country: string | null
  city: string | null
  browser: string
  browserVersion: string | null
  os: string
  osVersion: string | null
  deviceType: string
  deviceVendor: string | null
  deviceModel: string | null
  nickname: string | null
  isCurrent: boolean
}

export interface LoginEvent {
  id: number
  succeeded: boolean
  reason: string
  clientIp: string
  country: string | null
  city: string | null
  browser: string
  os: string
  deviceType: string
  createdAt: string
  email?: string
  userName?: string
  userId?: number
}

export interface SecurityAlert {
  id: number
  type: string
  message: string
  metadata: Record<string, unknown>
  reviewedAt?: string | null
  createdAt: string
  userName?: string
  email?: string
  userId?: number
}

export interface AdminSecurityData {
  loginEvents: LoginEvent[]
  sessions: Array<SecuritySession & { userId: number; userName: string; email: string; role: string }>
  alerts: SecurityAlert[]
  users: Array<{ id: number; name: string; email: string; role: string; status: string; accountLocked: boolean; mustResetPassword: boolean }>
  auditLog: Array<{ id: number; actorName: string | null; targetName: string | null; action: string; beforeState: unknown; afterState: unknown; clientIp: string; createdAt: string }>
}

interface AuthResponse {
  user: AuthUser
}

export class AuthFlowError extends Error {
  captchaRequired: boolean
  twoFactorRequired: boolean

  constructor(message: string, options: { captchaRequired?: boolean; twoFactorRequired?: boolean } = {}) {
    super(message)
    this.captchaRequired = options.captchaRequired ?? false
    this.twoFactorRequired = options.twoFactorRequired ?? false
  }
}

interface AccountDetails {
  name: string
  phone?: string
}

export interface EnrollmentStudent {
  fullName: string
  ageOrGrade: string
  relationship: 'Parent' | 'Guardian' | 'Self'
  preferredLanguage: string
  emergencyPhone?: string
  notes?: string
}

export interface SavedStudent extends EnrollmentStudent {
  id: number
}

interface PaymentStatus {
  status: 'pending' | 'paid' | 'failed'
}

export interface PracticeLessonQuestion {
  id: number
  question: string
  topic: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface WeakArea {
  topic: string
  correct: number
  total: number
  accuracy: number
  practiceLessons: Array<{ lessonId: number; lessonTitle: string }>
}

interface EnrollmentLesson {
  id: number
  title: string
  type: 'video' | 'article' | 'interactive' | 'simulation' | 'quiz' | 'practice' | 'live' | 'stepByStepSolver'
  duration: number | null
  videoUrl?: string
  thumbnailUrl?: string
  estimatedDuration?: number
  articleBody?: string
  articleBlocks?: ArticleContentBlock[]
  articleVocabulary?: ArticleVocabularyEntry[]
  articleHeaderImageUrl?: string
  articleCheckpoints?: LearnerArticleCheckpoint[]
  articleHelpDisabledSections?: number[]
  baseImageUrl?: string
  interactiveHotspots?: Array<{ id: number; left: string; top: string; label: string; explanation: string }>
  simulation?: SimulationConfig
  stepByStepSolver?: StepByStepSolverLearnerConfig
  platformEngineId?: string
  curriculumTopic?: string
  resources?: Array<{ id: number; name: string; url?: string }>
  quizQuestions?: Array<{ id: number; question: string; options: string[]; questionImage?: string; optionImages?: Array<string | undefined>; explanation?: string; explanationImage?: string }>
  practiceQuestions?: PracticeLessonQuestion[]
  passThreshold?: number
  meetingUrl?: string
  scheduledAt?: string
  endsAt?: string
}

interface EnrollmentModule {
  id: number
  title: string
  lessons: EnrollmentLesson[]
}

export interface LessonProgress {
  startedAt: string
  completedAt: string | null
  activeSeconds: number
  videoPositionSeconds: number
  lastAccessedAt: string
}

export type QuizAnswerStatus = 'unanswered' | 'answered' | 'expired'
export type QuizViolationType = 'visibility' | 'fullscreen'
export interface QuizViolation {
  type: QuizViolationType
  occurredAt: string
}
export interface QuizQuestionResult {
  questionId: number
  question: string
  studentAnswer: string | null
  correctAnswer: string | null
  status: QuizAnswerStatus
}
export interface QuizAnswerRecord {
  status: QuizAnswerStatus
  value: string | number | string[] | null
}

export interface QuizAttempt {
  id: number
  lessonId: number
  startedAt: string
  activeSeconds: number
  timeLimitSeconds?: number
  deadlineAt?: string
  answers?: Record<number, QuizAnswerRecord>
  violations?: QuizViolation[]
  questionResults?: QuizQuestionResult[]
  score: number | null
  passed: boolean | null
  disqualified?: boolean
  retakeApproved?: boolean
  submittedAt: string | null
}

export interface MyEnrollment {
  id: number
  courseId: number | null
  courseTitle: string | null
  courseCover: string | null
  classCover: string | null
  courseDescription: string | null
  courseLongDescription: string | null
  learningOutcomes: string[]
  courseRating: number | null
  courseRatingCount: number | null
  category: string | null
  level: string | null
  tutor: string | null
  certificate: boolean | null
  modules: EnrollmentModule[]
  classId: number | null
  classTitle: string | null
  classTutor: string | null
  classSchedule: { days: string[]; time: string; duration: number; flexible: boolean; startDate: string; endDate?: string } | null
  meetingLink: string | null
  classStatus: 'pending_schedule' | 'open' | 'full' | 'closed' | null
  classProgramId: string | null
  classExamDate: string | null
  attendance: Record<number, 'Present' | 'Absent'>
  sessionJoinClicks: Record<number, string>
  lessonProgress: Record<number, LessonProgress>
  quizAttempts: QuizAttempt[]
  weakAreas: WeakArea[]
  completedLessonIds: number[]
  started: boolean
  timeSpentSeconds: number
  progressPercentage: number
  lastActivityAt: string | null
  studyPlanOrder: number[] | null
  studyPlanGeneratedAt: string | null
}

export interface GamificationStats {
  student_id: number
  xp: number
  level: number
  points: number
  current_streak: number
  longest_streak: number
  next_level_xp: number
  level_progress: number
  lesson_count: number
  quiz_count: number
  live_count: number
}

export interface GamificationBadge {
  id: string
  name: string
  icon: string
  description: string
  criteria: string
}

export interface GamificationAchievement {
  id: string
  student_id: number
  badge_id: string
  unlocked_at: string
}

export interface GamificationChallenge {
  id: string
  title: string
  type: 'daily' | 'weekly'
  xp_reward: number
  points_reward: number
  completed: boolean
  completed_at: string | null
}

export interface GamificationLeaderboardEntry {
  id: number
  name: string
  avatar: string
  xp: number
  rank: number
  isCurrentStudent: boolean
}

export interface GamificationClassRank {
  classId: number
  rank: number
}

export interface GamificationData {
  stats: GamificationStats
  badges: GamificationBadge[]
  achievements: GamificationAchievement[]
  challenges: GamificationChallenge[]
  leaderboard: GamificationLeaderboardEntry[]
  classRanks: GamificationClassRank[]
  classId: number | null
  classTitle: string | null
}

export interface CourseReview {
  id: number
  rating: number
  comment: string
  studentName: string
  createdAt: string
}

export interface StudentReviewData {
  reviews: CourseReview[]
  ownReview: { id: number; rating: number; comment: string; isHidden: boolean } | null
  canReview: boolean
}

export interface AdminReview extends CourseReview {
  targetType: 'course' | 'class'
  targetId: number
  targetTitle: string
  studentEmail: string
  isHidden: boolean
}

export interface PublicClass {
  id: number
  title: string
  programId: string
  cover: string | null
  schedule: { days: string[]; time: string; duration: number; flexible: boolean; startDate: string; endDate: string }
  price: number
  status: 'pending_schedule' | 'open' | 'full' | 'closed'
  courseId: number | null
  courseTitle: string | null
  tutorName: string
  capacity: number
  enrolledCount: number
  published: boolean
  enrollmentClosed: boolean
  gradeLevel: number | null
  moduleCount: number | null
  lessonCount: number | null
  rating: number
  ratingCount: number
}

export interface TutorOverview {
  tutor: AdminTutor
  totalCourses: number
  totalClasses: number
  totalStudents: number
  totalRevenue: number
  upcomingClasses: number
}

export interface TutorClass {
  id: number
  title: string
  programId: string
  cover: string | null
  tutorId: number
  tutorName: string
  gradeLevel: number | null
  examDate: string | null
  schedule: { days: string[]; time: string; duration: number; flexible: boolean; startDate: string; endDate: string }
  meetingLink: string
  price: number
  status: AdminClassStatus
  courseId: number | null
  courseTitle: string | null
  capacity: number
  enrolledCount: number
  published: boolean
  modules: AdminModule[]
}

export interface AtRiskStudent {
  id: number
  studentId: number
  classId: number | null
  studentName: string
  studentEmail: string
  courseTitle: string | null
  classTitle: string | null
  progressPercentage: number
  lastActivityAt: string | null
  reasons: string[]
}

export interface TutorClassStudent {
  id: number
  studentId: number
  studentName: string
  ageOrGrade: string
  studentEmail: string
  status: 'enrolled' | 'waitlisted'
  enrolledDate: string
  attendance: Record<number, 'Present' | 'Absent'>
  sessionJoinClicks: Record<number, string>
  progressPercentage: number
  timeSpentSeconds: number
  completedLessonIds: number[]
  quizAttempts: QuizAttempt[]
  weakAreas: WeakArea[]
}

const authStorageKey = 'coursespace-auth-user'
const legacyAuthSessionTokenKey = 'coursespace-auth-session-token'

const getErrorMessage = async (response: Response) => {
  const body = await response.json().catch(() => null)
  return body?.message ?? 'Unable to complete your request.'
}

const fetchApi = async (url: string, init?: RequestInit) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetch(url, { ...init, credentials: 'same-origin' })
    } catch (error) {
      if (init?.signal?.aborted) throw error
      if (!(error instanceof TypeError)) throw error
      if (attempt >= 30) throw new Error('Unable to connect to the CourseSpace API. Please try again when the server is available.')
      await new Promise((resolve) => window.setTimeout(resolve, Math.min(500 * 2 ** attempt, 2000)))
    }
  }
}

export const getCourses = async (): Promise<Array<Course>> => {
  const response = await fetchApi('/api/courses')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getPracticeExams = async (): Promise<PracticeExam[]> => {
  const response = await fetchApi('/api/practice-exams')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getPracticeExam = async (examId: number): Promise<PracticeExamWithQuestions> => {
  const response = await requestApi(`/api/practice-exams/${examId}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getPracticePurchases = async (): Promise<PracticePurchase[]> => {
  const response = await requestApi('/api/practice-purchases')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export interface SyllabusTopic {
  id: number
  grade: number
  title: string
  description: string
  position: number
}

export interface SyllabusTopicPayload {
  title: string
  description: string
}

export const getSyllabusTopics = async (grade?: number): Promise<SyllabusTopic[]> => {
  const query = grade === undefined ? '' : `?grade=${grade}`
  const response = await requestApi(`/api/syllabus-topics${query}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const createAdminSyllabusTopic = async (grade: number, payload: SyllabusTopicPayload): Promise<SyllabusTopic> => {
  const response = await requestApi('/api/admin/syllabus-topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grade, ...payload }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateAdminSyllabusTopic = async (topicId: number, payload: SyllabusTopicPayload): Promise<SyllabusTopic> => {
  const response = await requestApi(`/api/admin/syllabus-topics/${topicId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const deleteAdminSyllabusTopic = async (topicId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/syllabus-topics/${topicId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const reorderAdminSyllabusTopics = async (grade: number, topicIds: number[]): Promise<SyllabusTopic[]> => {
  const response = await requestApi(`/api/admin/syllabus-topics/grades/${grade}/order`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicIds }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminPracticeExams = async (): Promise<PracticeExam[]> => {
  const response = await requestApi('/api/admin/practice-exams')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateAdminPracticeExam = async (examId: number, payload: Omit<PracticeExam, 'id'>): Promise<PracticeExam> => {
  const response = await requestApi(`/api/admin/practice-exams/${examId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const createAdminPracticeExam = async (payload: Omit<PracticeExam, 'id'>): Promise<PracticeExam> => {
  const response = await requestApi('/api/admin/practice-exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminPracticeQuestions = async (examId: number): Promise<PracticeQuestion[]> => {
  const response = await requestApi(`/api/admin/practice-exams/${examId}/questions`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const createAdminPracticeQuestion = async (examId: number, payload: Omit<PracticeQuestion, 'id' | 'exam_id'>): Promise<PracticeQuestion> => {
  const response = await requestApi(`/api/admin/practice-exams/${examId}/questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionText: payload.question_text, topic: payload.topic, options: payload.options, correctAnswer: payload.correct_answer, explanation: payload.explanation }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateAdminPracticeQuestion = async (examId: number, questionId: number, payload: Omit<PracticeQuestion, 'id' | 'exam_id'>): Promise<PracticeQuestion> => {
  const response = await requestApi(`/api/admin/practice-exams/${examId}/questions/${questionId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionText: payload.question_text, topic: payload.topic, options: payload.options, correctAnswer: payload.correct_answer, explanation: payload.explanation }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

const requestApi = async (url: string, init?: RequestInit) => {
  const response = await fetchApi(url, init)
  if (response.status === 401) {
    const error = await response.clone().json().catch(() => null)
    if (error?.message === 'Authentication is required.') {
      clearAuthenticatedUser()
      if (window.location.pathname !== '/sign-in') navigateTo('/sign-in', true)
    }
  }
  return response
}

const requestCourse = async (url: string, init?: RequestInit): Promise<AdminCourse> => {
  const response = await requestApi(url, init)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

const requestTutor = async (url: string, init?: RequestInit): Promise<AdminTutor> => {
  const response = await requestApi(url, init)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export type AdminTutorPayload = Pick<AdminTutor, 'name' | 'email' | 'phone' | 'bio'> & Partial<Pick<AdminTutor, 'status'>> & { assignedCourseIds?: number[] }

export interface AdminWeakArea {
  topic: string
  correct: number
  total: number
  accuracy: number
  affectedStudents: number
}

export interface AdminDashboardOverview {
  totalRevenue: number
  activeStudents: number
  publishedCourses: number
  draftCourses: number
  activeTutors: number
  inactiveTutors: number
  revenueByMonth: Array<{ label: string; value: number }>
  enrollmentsByCategory: Array<{ label: string; value: number }>
  revenueByCategory: Array<{ label: string; value: number }>
  topCourses: Array<{ label: string; value: number }>
  paidRevenueYears: number[]
  paidRevenueByMonth: Array<{ year: number; monthKey: string; label: string; currency: string; value: number }>
  paidRevenueComparison: Array<{ currency: string; currentTotal: number; previousTotal: number }>
  lessonCompletionsByMonth: Array<{ monthKey: string; label: string; value: number }>
  quizPerformanceByMonth: Array<{ monthKey: string; label: string; averageScore: number | null; attempts: number }>
  courseEnrollments: Array<{ label: string; learners: number; enrollmentRecords: number }>
  classEnrollments: Array<{ label: string; learners: number; enrollmentRecords: number }>
  enrollmentSummary: {
    courses: { learners: number; enrollmentRecords: number }
    classes: { learners: number; enrollmentRecords: number }
  }
  learningMetrics: {
    lessonCompletion: { completed: number; total: number; percentage: number | null }
    classAttendance: { present: number; total: number; percentage: number | null }
    quizPerformance: { attempts: number; percentage: number | null }
  }
  enrollmentDistribution: Array<{ type: 'courses' | 'classes' | 'exams'; count: number }>
  weakAreas: AdminWeakArea[]
}

export interface AdminQuizViolation {
  id: number
  studentName: string
  studentEmail: string
  courseTitle: string
  lessonTitle: string
  lessonId: number
  violations: Array<{ type: 'visibility' | 'fullscreen'; occurredAt: string }>
  disqualified: boolean
  score: number | null
  passed: boolean | null
  retakeApproved: boolean
  retakeStatus: 'not_retaken' | 'passed' | 'failed'
  retakeScore: number | null
  retakeSubmittedAt: string | null
  submittedAt: string | null
}

export interface AdminPayment {
  id: number
  student: string
  course: string
  type: 'Course' | 'Class' | 'Book' | 'Practice exam' | 'Sponsor'
  amount: number
  currency: string
  date: string
  status: 'Paid' | 'Pending' | 'Pending Verification' | 'Declined' | 'Failed'
  reviewNote?: string | null
}

export interface AdminSponsorPayment {
  id: number
  sponsor: string
  course: string
  amount: number
  currency: string
  date: string
  status: 'Paid' | 'Pending'
}

export interface ManualPaymentInfo {
  id: number
  title: string
  amount: number
  currency: string
  paymentMethods: Array<{ provider: string; accountNumber: string }>
  instructions: string
  configured: boolean
}

export interface PendingManualPayment {
  id: number
  student: string
  email: string
  phone: string
  course: string
  amount: number
  currency: string
  submittedAt: string
  proofFileName: string
}

export interface AdminRegistration {
  id: number
  student: string
  email: string
  course: string
  date: string
  status: 'Pending' | 'Pending Verification' | 'Approved' | 'Waitlisted' | 'Rejected' | 'Declined'
}

export interface MyPayment {
  id: number
  itemName: string
  type: 'course' | 'class' | 'book' | 'practice_exam'
  amount: number
  currency: string
  status: 'Paid' | 'Pending' | 'Pending Verification' | 'Declined' | 'Failed'
  reviewNote?: string | null
  date: string
  txRef: string
  courseId: number | null
  classId: number | null
}

export interface BookstoreItem {
  id: number
  title: string
  description: string
  category: string
  price: number
  currency: string
  coverData: string
  published: boolean
  fileName: string
  fileSizeBytes: number
  downloadCount: number
  updatedAt: string
}

export interface BookstorePurchase {
  id: number
  itemId: number
  title: string
  category: string
  price: number
  currency: string
  coverData: string
  fileName: string
  fileSizeBytes: number
  purchasedAt: string
}

export type BookstoreItemPayload = Omit<BookstoreItem, 'id' | 'currency' | 'fileName' | 'fileSizeBytes' | 'downloadCount' | 'updatedAt'> & { fileData?: string; fileName?: string }

const requestBookstore = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await requestApi(url, init)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<T>
}

export const getBookstoreItems = (init?: RequestInit) => requestBookstore<BookstoreItem[]>('/api/bookstore-items', init)
export const getAdminBookstoreItems = () => requestBookstore<BookstoreItem[]>('/api/admin/bookstore-items')
export const getBookstorePurchases = (init?: RequestInit) => requestBookstore<BookstorePurchase[]>('/api/bookstore-purchases', init)
export const createAdminBookstoreItem = (item: BookstoreItemPayload) => requestBookstore<BookstoreItem>('/api/admin/bookstore-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
export const updateAdminBookstoreItem = (id: number, item: BookstoreItemPayload) => requestBookstore<BookstoreItem>(`/api/admin/bookstore-items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
export const deleteAdminBookstoreItem = async (id: number) => {
  const response = await requestApi(`/api/admin/bookstore-items/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getPublicClasses = async (): Promise<PublicClass[]> => {
  const response = await fetchApi('/api/classes')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const records = await response.json() as Array<Omit<PublicClass, 'schedule'> & { schedule?: Partial<PublicClass['schedule']> | null }>
  return records.map((record) => ({
    ...record,
    schedule: {
      days: record.schedule?.days ?? [],
      time: record.schedule?.time ?? '',
      duration: record.schedule?.duration ?? 0,
      flexible: record.schedule?.flexible ?? false,
      startDate: record.schedule?.startDate ?? '',
      endDate: record.schedule?.endDate ?? '',
    },
  }))
}

export const getTutorOverview = async (): Promise<TutorOverview> => {
  const response = await requestApi('/api/tutor/overview')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTutorCourses = async (): Promise<AdminCourse[]> => {
  const response = await requestApi('/api/tutor/courses')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTutorClasses = async (): Promise<TutorClass[]> => {
  const response = await requestApi('/api/tutor/classes')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTutorEditOptions = async (): Promise<Array<{ id: number; name: string }>> => {
  const response = await requestApi('/api/tutor/edit-options')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const result = await response.json() as { tutors: Array<{ id: number; name: string }> }
  return result.tutors
}

export const updateTutorCourse = (course: AdminCourse): Promise<AdminCourse> => requestCourse(`/api/tutor/courses/${course.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(course),
})

export interface TutorClassUpdate {
  id: number
  title: string
  cover: string
  program_id: string
  tutor_id: number
  capacity: number
  schedule: { startDate: string; endDate: string; days: string[]; time: string; duration: number }
  meeting_link: string
  modules: AdminModule[]
  price: number
  published: boolean
  grade_level: number | null
  exam_date: string | null
}

export const updateTutorClass = async (classRecord: TutorClassUpdate): Promise<void> => {
  const response = await requestApi(`/api/tutor/classes/${classRecord.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(classRecord) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

const updateTutorCurriculum = async (url: string, modules: AdminModule[]): Promise<AdminModule[]> => {
  const response = await requestApi(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modules }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const result = await response.json() as { modules: AdminModule[] }
  return result.modules
}

export const updateTutorCourseCurriculum = (courseId: number, modules: AdminModule[]) => updateTutorCurriculum(`/api/tutor/courses/${courseId}/curriculum`, modules)

export const updateTutorClassCurriculum = (classId: number, modules: AdminModule[]) => updateTutorCurriculum(`/api/tutor/classes/${classId}/curriculum`, modules)

export const getTutorCourseStudents = async (courseId: number): Promise<TutorClassStudent[]> => {
  const response = await requestApi(`/api/tutor/courses/${courseId}/students`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTutorClassStudents = async (classId: number): Promise<TutorClassStudent[]> => {
  const response = await requestApi(`/api/tutor/classes/${classId}/students`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const logLiveSessionJoin = async (enrollmentId: number, lessonId: number): Promise<{ clickedAt: string }> => {
  const response = await requestApi(`/api/enrollments/${enrollmentId}/live-sessions/${lessonId}/join`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateTutorClassAttendance = async (enrollmentId: number, lessonId: number, status: 'Present' | 'Absent'): Promise<void> => {
  const response = await requestApi(`/api/tutor/classes/enrollments/${enrollmentId}/attendance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, status }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export interface TutorQuizSubmissionQuestion {
  id: number
  question: string
  options: string[]
  correctOption: number
  selectedOption: number | null
  isCorrect: boolean
}

export interface TutorQuizSubmission {
  id: number
  contentType: 'course' | 'class'
  contentId: number
  contentTitle: string
  lessonId: number
  lessonTitle: string
  studentId: number
  studentName: string
  studentEmail: string
  submittedAt: string
  score: number
  passed: boolean
  questions: TutorQuizSubmissionQuestion[]
}

export const getTutorQuizSubmissions = async (): Promise<TutorQuizSubmission[]> => {
  const response = await requestApi('/api/tutor/grading/submissions')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateTutorProfile = async (profile: Partial<Pick<AdminTutor, 'name' | 'phone' | 'bio'>>): Promise<AdminTutor> => {
  const response = await requestApi('/api/tutor/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminAtRiskStudents = async (options: { classId?: number; classOnly?: boolean } = {}): Promise<AtRiskStudent[]> => {
  const query = new URLSearchParams()
  if (options.classId !== undefined) query.set('classId', String(options.classId))
  if (options.classOnly) query.set('classOnly', 'true')
  const queryString = query.toString()
  const search = queryString ? `?${queryString}` : ''
  const response = await requestApi(`/api/admin/at-risk-students${search}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTutorAtRiskStudents = async (): Promise<AtRiskStudent[]> => {
  const response = await requestApi('/api/tutor/at-risk-students')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export interface AdminCspReport {
  id: number
  documentUrl: string
  violatedDirective: string
  blockedUrl: string
  sourceFile: string
  createdAt: string
}

export const getAdminCspReports = async (): Promise<AdminCspReport[]> => {
  const response = await requestApi('/api/admin/csp-reports')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminQuizViolations = async (): Promise<AdminQuizViolation[]> => {
  const response = await requestApi('/api/admin/quiz-violations')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const approveAdminQuizRetake = async (attemptId: number) => {
  const response = await requestApi(`/api/admin/quiz-attempts/${attemptId}/retake-approval`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<{ id: number; retakeApproved: boolean }>
}

export const getAdminPayments = async (): Promise<AdminPayment[]> => {
  const response = await requestApi('/api/admin/payments')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminSponsorPayments = async (): Promise<AdminSponsorPayment[]> => {
  const response = await requestApi('/api/admin/sponsor-payments')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getPendingManualPayments = async (): Promise<PendingManualPayment[]> => {
  const response = await requestApi('/api/admin/pending-payments')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const reviewManualPayment = async (paymentId: number, decision: 'approve' | 'decline', reason = '') => {
  const response = await requestApi(`/api/admin/pending-payments/${paymentId}/${decision}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export type AccessGrantReason = 'Scholarship' | 'Staff' | 'Promotion' | 'Sponsored' | 'Other'

export type AccessTarget = { courseId: number; classId?: never } | { classId: number; courseId?: never }

export type AccessGrantOptions = AccessTarget & {
  reason: AccessGrantReason
  note: string
  expiresAt?: string
  sponsorId?: number | null
  override?: boolean
}

export interface AccessGrantResult {
  status: 'granted' | 'skipped'
  message?: string
  enrollmentId?: number
  classStatus?: 'enrolled' | 'waitlisted'
  username?: string
  temporaryPassword?: string
  oneTimePasswordExpiresAt?: string
  setPasswordPath?: string
}

export interface OneTimePasswordReset {
  username: string
  temporaryPassword: string
  oneTimePasswordExpiresAt: string
}

export interface AccessGrantRecord {
  id: number
  userId: number
  studentName: string
  email: string
  item: string
  source: 'free_grant' | 'sponsored'
  accessStatus: 'active' | 'revoked' | 'expired'
  classStatus: 'enrolled' | 'waitlisted' | null
  grantReason: string
  sponsorName: string | null
  expiresAt: string | null
  grantedAt: string
  revokedAt: string | null
  usernameAccount: boolean
}

export interface Sponsor {
  id: number
  name: string
  contact: string
  notes: string
  endDate: string | null
  seatsUsed: number
}

export interface SponsorPayment {
  id: number
  amountCents: number
  reference: string
  status: 'pending' | 'paid'
  paidAt: string | null
  createdAt: string
  courseId: number | null
  classId: number | null
  item: string | null
  invoiceName: string | null
  hasInvoice: boolean
}

export interface SponsorPaymentInput {
  amountCents: number
  reference: string
  courseId: number | null
  classId: number | null
}

export interface SponsorInput {
  name: string
  contact: string
  notes: string
  endDate: string | null
}

export interface SponsorReportRow {
  enrollmentId: number
  name: string
  email: string
  item: string
  seat: string
  accessStatus: string
  expiresAt: string
  progressPercentage: number
  lessonsCompleted: number
  liveSessionsAttended: number
  liveSessionsTotal: number
}

export interface SponsorReport {
  sponsor: Sponsor
  students: SponsorReportRow[]
}

export type ImportRowStatus = 'new' | 'existing' | 'duplicate' | 'invalid' | 'overflow'

export interface AccessImportPreview {
  batchId: number
  summary: Record<ImportRowStatus, number>
  targetIssues: string[]
  rows: Array<{ row: number; name: string; email: string; status: ImportRowStatus; message: string }>
}

export interface AccessImportResult {
  row: number
  name: string
  outcome: 'granted' | 'skipped' | 'refused' | 'failed' | ImportRowStatus
  message?: string
  username?: string
  temporaryPassword?: string
  oneTimePasswordExpiresAt?: string
  setPasswordPath?: string
}

const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
})

export class AccessWarningError extends Error {
  warnings: string[]
  constructor(message: string, warnings: string[]) {
    super(message)
    this.warnings = warnings
  }
}

export const grantAccess = async (payload: AccessGrantOptions & { userId?: number; email?: string; name?: string; phone?: string; grade?: string }): Promise<AccessGrantResult> => {
  const response = await requestApi('/api/admin/access-grants', jsonRequest('POST', payload))
  const body = await response.json().catch(() => null)
  if (response.status === 409 && Array.isArray(body?.warnings)) throw new AccessWarningError(body.message, body.warnings)
  if (!response.ok) throw new Error(body?.message ?? 'Unable to complete your request.')
  return body
}

export const getAccessGrants = async (): Promise<AccessGrantRecord[]> => {
  const response = await requestApi('/api/admin/access-grants')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const revokeAccessGrant = async (enrollmentId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/access-grants/${enrollmentId}/revoke`, jsonRequest('POST'))
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const resetStudentOneTimePassword = async (userId: number): Promise<OneTimePasswordReset> => {
  const response = await requestApi(`/api/admin/access-students/${userId}/one-time-password`, jsonRequest('POST'))
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getSponsors = async (): Promise<Sponsor[]> => {
  const response = await requestApi('/api/admin/sponsors')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const saveSponsor = async (sponsorId: number | null, input: SponsorInput): Promise<void> => {
  const response = await requestApi(sponsorId === null ? '/api/admin/sponsors' : `/api/admin/sponsors/${sponsorId}`, jsonRequest(sponsorId === null ? 'POST' : 'PUT', input))
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const deleteSponsor = async (sponsorId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/sponsors/${sponsorId}`, jsonRequest('DELETE'))
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getSponsorPayments = async (sponsorId: number): Promise<SponsorPayment[]> => {
  const response = await requestApi(`/api/admin/sponsors/${sponsorId}/payments`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const recordSponsorPayment = async (sponsorId: number, input: SponsorPaymentInput): Promise<number> => {
  const response = await requestApi(`/api/admin/sponsors/${sponsorId}/payments`, jsonRequest('POST', input))
  if (!response.ok) throw new Error(await getErrorMessage(response))
  const created: { id: number } = await response.json()
  return created.id
}

export const uploadSponsorPaymentInvoice = async (paymentId: number, file: File): Promise<void> => {
  const response = await requestApi(`/api/admin/sponsor-payments/${paymentId}/invoice?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const markSponsorPaymentPaid = async (paymentId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/sponsor-payments/${paymentId}/mark-paid`, jsonRequest('POST'))
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getSponsorReport = async (sponsorId: number): Promise<SponsorReport> => {
  const response = await requestApi(`/api/admin/sponsors/${sponsorId}/report`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const previewAccessImport = async (csv: string, options: AccessGrantOptions): Promise<AccessImportPreview> => {
  const response = await requestApi('/api/admin/access-imports', jsonRequest('POST', { ...options, csv }))
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const confirmAccessImport = async (batchId: number, override: boolean): Promise<{ results: AccessImportResult[] }> => {
  const response = await requestApi(`/api/admin/access-imports/${batchId}/confirm`, jsonRequest('POST', { override }))
  const body = await response.json().catch(() => null)
  if (response.status === 409 && Array.isArray(body?.warnings)) throw new AccessWarningError(body.message, body.warnings)
  if (!response.ok) throw new Error(body?.message ?? 'Unable to complete your request.')
  return body
}

export const cancelAccessImport = async (batchId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/access-imports/${batchId}`, jsonRequest('DELETE'))
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const setPasswordWithToken = async (token: string, password: string): Promise<void> => {
  const response = await requestApi('/api/auth/set-password', jsonRequest('POST', { token, password }))
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getAdminRegistrations = async (): Promise<AdminRegistration[]> => {
  const response = await requestApi('/api/admin/registrations')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminDashboardOverview = async (classId?: number): Promise<AdminDashboardOverview> => {
  const query = classId === undefined ? '' : `?classId=${classId}`
  const response = await requestApi(`/api/admin/overview${query}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminCourses = async (): Promise<Array<AdminCourse>> => {
  const response = await requestApi('/api/admin/courses')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminCourseOptions = async (): Promise<Array<Pick<AdminCourse, 'id' | 'title' | 'price'>>> => {
  const response = await requestApi('/api/admin/course-options')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminCourse = async (id: AdminCourse['id']): Promise<AdminCourse> => requestCourse(`/api/admin/courses/${id}`)

export const createAdminCourse = (course: AdminCourse) => requestCourse('/api/admin/courses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(course),
})

export const updateAdminCourse = (course: AdminCourse) => requestCourse(`/api/admin/courses/${course.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(course),
})

export const deleteAdminCourse = async (id: AdminCourse['id']) => {
  const response = await requestApi(`/api/admin/courses/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getAdminTutors = async (): Promise<Array<AdminTutor>> => {
  const response = await requestApi('/api/admin/tutors')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminTutor = async (id: AdminTutor['id']): Promise<AdminTutor> => requestTutor(`/api/admin/tutors/${id}`)

export const createAdminTutor = async (tutor: AdminTutorPayload): Promise<AdminTutor & { inviteLink: string }> => {
  const response = await requestApi('/api/admin/tutors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tutor),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateAdminTutor = (tutor: AdminTutor) => requestTutor(`/api/admin/tutors/${tutor.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(tutor),
})

export const updateAdminTutorStatus = (id: AdminTutor['id'], status: AdminTutor['status']) => requestTutor(`/api/admin/tutors/${id}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status }),
})

export const deleteAdminTutor = async (id: AdminTutor['id']) => {
  const response = await requestApi(`/api/admin/tutors/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export type AdminClassProgram = 'international-online-interactive' | 'summer-camp' | 'ministry-exam-prep'
export type AdminClassStatus = 'pending_schedule' | 'open' | 'full' | 'closed'

export interface AdminClassSchedule {
  startDate: string
  endDate: string
}

export interface AdminClass {
  id: number
  program_id: AdminClassProgram
  title: string
  cover: string
  tutor_id: number
  capacity: number
  schedule: AdminClassSchedule
  meeting_link: string
  modules: AdminModule[]
  price: number
  status: AdminClassStatus
  published: boolean
  grade_level: number | null
  exam_date: string | null
}

export interface ClassLeaderboardEntry {
  rank: number
  studentId: number
  firstName: string
  avatar: string
  xp: number
}

export interface ClassStudentLessonStat {
  lessonId: number
  title: string
  type: string
  completed: boolean
  quizCount: number
  averageScore: number | null
}

export interface ClassStudentStat {
  studentId: number
  studentName: string
  enrollmentId: number
  lessonsCompleted: number
  quizCount: number
  averageQuizScore: number | null
  activeSeconds: number
  presentCount: number
  attendanceCount: number
  attendanceRate: number | null
  progressPercentage: number
  lessons: ClassStudentLessonStat[]
}

export interface ClassStatistics {
  lessonCount: number
  liveLessonCount: number
  students: ClassStudentStat[]
}

export interface AdminClassEnrollment {
  id: number
  class_id: number
  student_id: number
  student_name: string
  enrolled_date: string
  status: 'enrolled' | 'waitlisted'
  attendance: Record<number, 'Present' | 'Absent'>
}

export interface PendingClassStudent {
  id: number
  student_name: string
  enrolled_date: string
  age: number | null
}

export interface AdminClassesWorkspace {
  classes: AdminClass[]
  enrollments: AdminClassEnrollment[]
  pendingStudents: PendingClassStudent[]
  tutors: Array<{ id: number; name: string }>
}

const requestClasses = async (url: string, init?: RequestInit): Promise<AdminClass> => {
  const response = await requestApi(url, init)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getClassLeaderboard = async (classId: number): Promise<ClassLeaderboardEntry[]> => {
  const response = await requestApi(`/api/admin/classes/${classId}/leaderboard`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getClassStatistics = async (classId: number): Promise<ClassStatistics> => {
  const response = await requestApi(`/api/admin/classes/${classId}/statistics`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminClassesWorkspace = async (): Promise<AdminClassesWorkspace> => {
  const response = await requestApi('/api/admin/classes')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const createAdminClass = (classRecord: Omit<AdminClass, 'id' | 'status'>) => requestClasses('/api/admin/classes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(classRecord),
})

export const updateAdminClass = (classRecord: Omit<AdminClass, 'status'>) => requestClasses(`/api/admin/classes/${classRecord.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(classRecord),
})

export const deleteAdminClass = async (classRecord: AdminClass) => {
  const response = await requestApi(`/api/admin/classes/${classRecord.id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const assignAdminClass = (enrollmentId: number, values: Omit<AdminClass, 'id' | 'status' | 'program_id' | 'modules' | 'published' | 'grade_level' | 'exam_date' | 'cover'>) => requestClasses('/api/admin/classes/assign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enrollmentId, ...values }),
})

export const updateAdminClassEnrollment = async (id: number, status: AdminClassEnrollment['status']) => {
  const response = await requestApi(`/api/admin/classes/enrollments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const updateAdminClassAttendance = async (enrollmentId: number, lessonId: number, status: 'Present' | 'Absent') => {
  const response = await requestApi(`/api/admin/classes/enrollments/${enrollmentId}/attendance`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId, status }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const removeAdminClassEnrollment = async (id: number) => {
  const response = await requestApi(`/api/admin/classes/enrollments/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getAdminUsers = async (): Promise<Array<AdminUser>> => {
  const response = await requestApi('/api/admin/users')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateAdminUserStatus = async (accountType: AdminUser['accountType'], accountId: number, status: 'Active' | 'Suspended'): Promise<AdminUser> => {
  const response = await requestApi(`/api/admin/users/${accountType}/${accountId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const resetAdminUserPassword = async (accountType: AdminUser['accountType'], accountId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/users/${accountType}/${accountId}/reset-password`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const updateAuthenticatedProfile = async (profile: { name: string; email: string; phone: string }): Promise<AuthUser> => {
  const response = await requestApi('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const response = await requestApi('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getCourse = async (id: Course['id']): Promise<AdminCourse> => requestCourse(`/api/courses/${id}`)

export const submitCredentials = async (mode: 'sign-in' | 'sign-up', email: string, password: string, accountDetails?: AccountDetails, challenges: { captchaToken?: string; twoFactorCode?: string } = {}): Promise<AuthResponse> => {
  const response = await fetch(`/api/auth/${mode}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...accountDetails, ...challenges, clientHints: await readClientHints() }),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new AuthFlowError(body?.message ?? 'Unable to complete your request.', body ?? {})
  return body as AuthResponse
}

export const saveAuthenticatedUser = (user: AuthUser) => {
  sessionStorage.setItem(authStorageKey, JSON.stringify(user))
}

export const getAuthenticatedUser = (): AuthUser | null => {
  try {
    const storedUser: unknown = JSON.parse(sessionStorage.getItem(authStorageKey) ?? 'null')
    if (storedUser && typeof storedUser === 'object' && 'role' in storedUser) return storedUser as AuthUser
  } catch {
    return null
  }

  return null
}

export const clearAuthenticatedUser = () => {
  sessionStorage.removeItem(authStorageKey)
  sessionStorage.removeItem(legacyAuthSessionTokenKey)
}

export const getSavedStudents = async (): Promise<SavedStudent[]> => {
  const response = await requestApi('/api/students')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

interface ChapaCheckout {
  checkoutUrl: string
  paymentReference: string
  mode: 'test' | 'live'
}

export const getManualPaymentInfo = async (courseId: number, classId?: number | null): Promise<ManualPaymentInfo> => {
  const query = classId === undefined || classId === null ? `courseId=${courseId}` : `classId=${classId}`
  const response = await requestApi(`/api/enrollment/payment-info?${query}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const sendEnrollmentVerificationCode = async (email: string, courseId: number, classId: number | null): Promise<{ resendAfterSeconds: number }> => {
  const response = await requestApi('/api/enrollment/verification-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...(classId === null ? { courseId } : { classId }) }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const verifyEnrollmentEmail = async (email: string, courseId: number, classId: number | null, code: string): Promise<void> => {
  const response = await requestApi('/api/enrollment/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, ...(classId === null ? { courseId } : { classId }) }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const submitManualPayment = async (courseId: number, classId: number | null, proofData: string, proofFileName: string, contact: { name: string; email: string; phone: string }, password: string) => {
  const response = await requestApi('/api/enrollment/manual-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...(classId === null ? { courseId } : { classId }), proofData, proofFileName, ...contact, password }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<{ id: number; item: string; status: 'pending_verification'; user: AuthUser }>
}

export const createChapaCheckout = async (courseId: AdminCourse['id'], practiceExamId?: number): Promise<ChapaCheckout> => {
  const response = await requestApi('/api/payments/chapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(practiceExamId === undefined ? { courseId } : { practiceExamId }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const createBookstoreChapaCheckout = async (bookstoreItemId: number, customer?: { email: string; name?: string }): Promise<ChapaCheckout> => {
  const response = await requestApi('/api/payments/chapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookstoreItemId, ...(customer ? { guestEmail: customer.email, guestName: customer.name } : {}) }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const createClassChapaCheckout = async (classId: number): Promise<ChapaCheckout> => {
  const response = await requestApi('/api/payments/chapa/class', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const completeTestPayment = async (reference: string, status: 'paid' | 'failed'): Promise<PaymentStatus> => {
  const response = await requestApi(`/api/payments/chapa/${encodeURIComponent(reference)}/test-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const verifyChapaPayment = async (reference: string): Promise<PaymentStatus> => {
  const response = await requestApi(`/api/payments/chapa/${encodeURIComponent(reference)}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getMyPayments = async (): Promise<MyPayment[]> => {
  const response = await requestApi('/api/payments')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getMyEnrollments = async (): Promise<MyEnrollment[]> => {
  const response = await requestApi('/api/enrollments')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const saveStudyPlan = (enrollmentId: number, lessonIds: number[]) => requestApi(`/api/enrollments/${enrollmentId}/study-plan`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lessonIds }),
}).then(async (response) => {
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<{ lessonOrder: number[]; generatedAt: string }>
})

export const getGamification = async (): Promise<GamificationData> => {
  const response = await requestApi('/api/gamification')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getSecuritySessions = async (): Promise<SecuritySession[]> => {
  const response = await requestApi('/api/auth/security/sessions')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const updateSecuritySessionNickname = async (sessionId: string, nickname: string): Promise<void> => {
  const response = await requestApi(`/api/auth/security/sessions/${sessionId}/nickname`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const revokeSecuritySession = async (sessionId: string): Promise<void> => {
  const response = await requestApi(`/api/auth/security/sessions/${sessionId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const signOutEverywhere = async (): Promise<void> => {
  const response = await requestApi('/api/auth/security/sign-out-everywhere', { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  clearAuthenticatedUser()
}

export const getSecurityLoginHistory = async (): Promise<LoginEvent[]> => {
  const response = await requestApi('/api/auth/security/login-history')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getSecurityAlerts = async (): Promise<SecurityAlert[]> => {
  const response = await requestApi('/api/auth/security/alerts')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTwoFactorStatus = async (): Promise<{ enabled: boolean }> => {
  const response = await requestApi('/api/auth/security/two-factor')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const setupTwoFactor = async (): Promise<{ secret: string; provisioningUri: string }> => {
  const response = await requestApi('/api/auth/security/two-factor/setup', { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const enableTwoFactor = async (code: string): Promise<{ backupCodes: string[] }> => {
  const response = await requestApi('/api/auth/security/two-factor/enable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const disableTwoFactor = async (currentPassword: string, code: string): Promise<void> => {
  const response = await requestApi('/api/auth/security/two-factor/disable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, code }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getAdminSecurityAlerts = async (): Promise<SecurityAlert[]> => {
  const response = await requestApi('/api/admin/security/alerts')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getAdminSecurity = async (): Promise<AdminSecurityData> => {
  const response = await requestApi('/api/admin/security')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const revokeAdminSession = async (sessionId: string): Promise<void> => {
  const response = await requestApi(`/api/admin/security/sessions/${sessionId}/revoke`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const forceLogoutUser = async (userId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/security/users/${userId}/force-logout`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const setAdminAccountLock = async (userId: number, locked: boolean): Promise<void> => {
  const response = await requestApi(`/api/admin/security/users/${userId}/lock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locked }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const forcePasswordReset = async (userId: number): Promise<void> => {
  const response = await requestApi(`/api/admin/security/users/${userId}/force-password-reset`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getPublicCourseReviews = async (id: number): Promise<CourseReview[]> => {
  const response = await fetchApi(`/api/courses/${id}/reviews`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getStudentReviews = async (type: 'course' | 'class', id: number): Promise<StudentReviewData> => {
  const response = await requestApi(`/api/reviews?type=${type}&id=${id}`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const submitStudentReview = async (type: 'course' | 'class', id: number, rating: number, comment: string): Promise<void> => {
  const response = await requestApi('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, rating, comment }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

export const getAdminReviews = async (): Promise<AdminReview[]> => {
  const response = await requestApi('/api/admin/reviews')
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const setAdminReviewHidden = async (type: 'course' | 'class', id: number, isHidden: boolean): Promise<void> => {
  const response = await requestApi(`/api/admin/reviews/${type}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isHidden }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
}

const requestLearningProgress = async <T>(url: string, init: RequestInit): Promise<T> => {
  const response = await requestApi(url, init)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const saveLessonEngagement = (enrollmentId: number, lessonId: number, values: { activeSeconds: number; videoPositionSeconds?: number; quizAttemptId?: number; keepalive?: boolean }) => requestLearningProgress<LessonProgress>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/engagement`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ activeSeconds: values.activeSeconds, videoPositionSeconds: values.videoPositionSeconds, quizAttemptId: values.quizAttemptId }),
  keepalive: values.keepalive,
})

export const completeLesson = (enrollmentId: number, lessonId: number) => requestLearningProgress<LessonProgress>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/complete`, {
  method: 'POST',
})

export const getStepByStepSolverState = (enrollmentId: number, lessonId: number) => requestLearningProgress<StepByStepSolverState>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/step-by-step-solver`, {})

export const startStepByStepSolver = (enrollmentId: number, lessonId: number, problemId: number) => requestLearningProgress<StepByStepSolverSession>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/step-by-step-solver/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId }) })

export const checkStepByStepSolverAnswer = (enrollmentId: number, lessonId: number, sessionId: number, answer: string) => requestLearningProgress<{ session: StepByStepSolverSession; correct: boolean; feedback: string }>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/step-by-step-solver/sessions/${sessionId}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer }) })

export const revealStepByStepSolverStep = (enrollmentId: number, lessonId: number, sessionId: number) => requestLearningProgress<StepByStepSolverSession>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/step-by-step-solver/sessions/${sessionId}/reveal`, { method: 'POST' })

export const requestStepByStepSolverHint = (enrollmentId: number, lessonId: number, sessionId: number) => requestLearningProgress<{ hint: string }>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/step-by-step-solver/sessions/${sessionId}/hint`, { method: 'POST' })

export const answerStepByStepSolverFollowUp = (enrollmentId: number, lessonId: number, sessionId: number, questionId: number, answer: string) => requestLearningProgress<{ session: StepByStepSolverSession; correct: boolean; feedback: string }>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/step-by-step-solver/sessions/${sessionId}/follow-up`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId, answer }) })

export const beginQuizAttempt = (enrollmentId: number, lessonId: number) => requestLearningProgress<QuizAttempt>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/quiz-attempts`, {
  method: 'POST',
})

export interface ArticleHelpRequest {
  sectionIndex: number
  question: string | null
  flaggedAt: string
  questionAt: string | null
  teacherReply: string | null
  teacherReplyAt: string | null
}

export interface ArticleCheckpointResponse {
  checkpointId: number
  status: 'correct' | 'incorrect' | 'skipped'
  selectedOption: number | null
  correctOption: number | null
  explanation: string
  answeredAt: string
}

export interface ArticleInteractionState {
  helpRequests: ArticleHelpRequest[]
  checkpointResponses: ArticleCheckpointResponse[]
}

export const getArticleInteractions = (enrollmentId: number, lessonId: number) => requestLearningProgress<ArticleInteractionState>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/article-interactions`, {})

export const recordArticleCheckpointAnswer = (enrollmentId: number, lessonId: number, checkpointId: number, answer: { selectedOption: number } | { skipped: true }) => requestLearningProgress<ArticleCheckpointResponse>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/article-checkpoints/${checkpointId}/answer`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(answer),
})

export const requestArticleSectionHelp = (enrollmentId: number, lessonId: number, sectionIndex: number, question: string) => requestLearningProgress<ArticleHelpRequest>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/article-help`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sectionIndex, question }),
})

export interface TutorArticleHelpRequest {
  sectionIndex: number
  sectionTitle: string
  question: string | null
  flaggedAt: string
  questionAt: string | null
  status: 'pending' | 'resolved'
  teacherReply: string | null
  teacherReplyAt: string | null
}

export interface TutorArticleHelpRequestUpdate {
  sectionIndex: number
  status: 'pending' | 'resolved'
  teacherReply: string | null
  teacherReplyAt: string | null
}

export interface TutorArticleInteractionReport {
  articles: Array<{
    lessonId: number
    lessonTitle: string
    sectionTitles: string[]
    checkpoints: Array<{ id: number; question: string; options: string[]; correctOption: number }>
    students: Array<{
      enrollmentId: number
      studentName: string
      studentEmail: string
      helpRequests: TutorArticleHelpRequest[]
      checkpointResponses: Array<{ checkpointId: number; status: 'correct' | 'incorrect' | 'skipped'; selectedOption: number | null; answeredAt: string }>
    }>
  }>
}

export const getTutorClassArticleInteractions = async (classId: number): Promise<TutorArticleInteractionReport> => {
  const response = await requestApi(`/api/tutor/classes/${classId}/article-interactions`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const getTutorCourseArticleInteractions = async (courseId: number): Promise<TutorArticleInteractionReport> => {
  const response = await requestApi(`/api/tutor/courses/${courseId}/article-interactions`)
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const saveTutorArticleHelpReply = async (enrollmentId: number, lessonId: number, sectionIndex: number, reply: string): Promise<TutorArticleHelpRequestUpdate> => {
  const response = await requestApi(`/api/tutor/enrollments/${enrollmentId}/lessons/${lessonId}/article-help/${sectionIndex}/reply`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const resolveTutorArticleHelpRequest = async (enrollmentId: number, lessonId: number, sectionIndex: number): Promise<TutorArticleHelpRequestUpdate> => {
  const response = await requestApi(`/api/tutor/enrollments/${enrollmentId}/lessons/${lessonId}/article-help/${sectionIndex}/resolve`, { method: 'POST' })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json()
}

export const saveQuizAnswer = (enrollmentId: number, lessonId: number, attemptId: number, questionId: number, answer: QuizAnswerRecord) => requestLearningProgress<QuizAttempt>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/quiz-attempts/${attemptId}/answers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ questionId, answer }),
})

export const saveQuizViolation = (enrollmentId: number, lessonId: number, attemptId: number, violation: QuizViolation) => requestLearningProgress<QuizAttempt>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/quiz-attempts/${attemptId}/violations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ violation }),
})

export const submitQuizAttempt = (enrollmentId: number, lessonId: number, attemptId: number, answers: Record<number, QuizAnswerRecord>, disqualified = false) => requestLearningProgress<QuizAttempt>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/quiz-attempts/${attemptId}/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers, disqualified }),
})

export const recordPracticeLessonAnswer = (enrollmentId: number, lessonId: number, questionId: number, answer: string) => requestLearningProgress<{ correct: boolean }>(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/practice-answers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ questionId, answer }),
})

export const recordPracticeExamAnswer = async (examId: number, questionId: number, answer: string) => {
  const response = await requestApi(`/api/practice-exams/${examId}/questions/${questionId}/answers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer }) })
  if (!response.ok) throw new Error(await getErrorMessage(response))
  return response.json() as Promise<{ correct: boolean }>
}

export const signOut = async () => {
  try {
    await requestApi('/api/auth/sign-out', { method: 'POST' })
  } catch {
    // Clear the local session even when the API is unavailable.
  } finally {
    clearAuthenticatedUser()
  }
}
