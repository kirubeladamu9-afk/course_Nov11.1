import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { CourseEditor, getAllowedCourseLessonTypes } from '@/components/admin/admin-dashboard'
import { ClassEditorDialog, type AdminClass as AdminClassEditorRecord, type ClassFormValue, type ProgramId, type TutorOption } from '@/components/admin/classes-workspace'
import ScheduleCalendar, { type ScheduleSession } from '@/components/schedule-calendar'
import { getAuthenticatedUser, getClassLeaderboard, getTutorAtRiskStudents, getTutorClasses, getTutorClassStudents, getTutorCourses, getTutorCourseStudents, getTutorEditOptions, getTutorOverview, saveAuthenticatedUser, updateTutorClass, updateTutorClassAttendance, updateTutorCourse, updateTutorProfile, type AtRiskStudent, type TutorClass, type TutorClassStudent, type TutorOverview } from '@/services/api'
import AtRiskStudentsPanel from '@/components/at-risk-students-panel'
import { TutorGradingView } from '@/components/tutor/tutor-grading-view'
import SyllabusCoveragePanel from '@/components/tutor/syllabus-coverage-panel'
import ArticleInteractionReport from '@/components/tutor/article-interaction-report'
import { type AdminCourse, type AdminModule } from '@/components/admin/admin-data'
import { navigateTo } from '@/lib/navigation'
import { SITE_NAME } from '@/lib/site'
import { calculateOverallGrade } from '@/lib/overall-grade'
import { toast } from '@/components/toast'
import { signOut } from '@/services/api'
import { Logo } from '@/components/logo'

type View = 'overview' | 'schedule' | 'courses' | 'classes' | 'students' | 'grading' | 'profile'
type ProgressTarget = { type: 'course' | 'class'; id: number; title: string; modules: AdminModule[]; syllabusGrade?: number | null }

const tutorViewPaths: Record<View, string> = {
  overview: '/tutor',
  schedule: '/tutor/schedule',
  courses: '/tutor/courses',
  classes: '/tutor/classes',
  students: '/tutor/students',
  grading: '/tutor/grading',
  profile: '/tutor/profile',
}

const getTutorEditTargetFromPath = (pathname: string): { type: 'course' | 'class'; id: number } | null => {
  const [, , section, rawId, action] = pathname.split('/')
  const id = Number(rawId)
  return (section === 'courses' || section === 'classes') && action === 'edit' && Number.isInteger(id) && id > 0
    ? { type: section === 'courses' ? 'course' : 'class', id }
    : null
}

const getTutorViewFromPath = (pathname: string): View => {
  const editTarget = getTutorEditTargetFromPath(pathname)
  if (editTarget) return editTarget.type === 'course' ? 'courses' : 'classes'
  return (Object.entries(tutorViewPaths).find(([, path]) => pathname === path || pathname === `${path}/`)?.[0] as View | undefined) ?? 'overview'
}

const statItems = (overview: TutorOverview) => [
  { label: 'Assigned courses', value: overview.totalCourses, icon: <SchoolOutlinedIcon color="primary" /> },
  { label: 'Assigned classes', value: overview.totalClasses, icon: <ClassOutlinedIcon color="primary" /> },
  { label: 'Active students', value: overview.totalStudents, icon: <GroupsOutlinedIcon color="primary" /> },
  { label: 'Upcoming classes', value: overview.upcomingClasses, icon: <DashboardOutlinedIcon color="primary" /> },
]

const TutorListControls: FC<{ search: string; onSearch: (value: string) => void; searchPlaceholder: string; filter: string; onFilter: (value: string) => void; filterLabel: string; filters: Array<{ value: string; label: string }> }> = ({ search, onSearch, searchPlaceholder, filter, onFilter, filterLabel, filters }) => <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3.5 }}>
  <TextField fullWidth value={search} onChange={(event) => onSearch(event.target.value)} placeholder={searchPlaceholder} inputProps={{ 'aria-label': searchPlaceholder }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon color="action" /></InputAdornment> }} sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
  <FormControl sx={{ minWidth: { xs: '100%', sm: 190 } }}><Select value={filter} onChange={(event) => onFilter(event.target.value)} startAdornment={<InputAdornment position="start"><FilterListOutlinedIcon color="action" /></InputAdornment>} IconComponent={KeyboardArrowDownRoundedIcon} inputProps={{ 'aria-label': filterLabel }} sx={{ borderRadius: 2.5, height: 56 }}>{filters.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select></FormControl>
</Stack>

interface StudentsAttendanceViewProps {
  selectedClass: TutorClass
  students: TutorClassStudent[]
  liveLessons: AdminModule['lessons']
  onMarkAttendance: (student: TutorClassStudent, lessonId: number, status: 'Present' | 'Absent') => Promise<void>
  studentsLoading: boolean
  onBack: () => void
}

const StudentsAttendanceView = ({ selectedClass, students, liveLessons, onMarkAttendance, studentsLoading, onBack }: StudentsAttendanceViewProps) => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const selectedSession = liveLessons.find((lesson) => lesson.id === selectedSessionId)
  const now = Date.now()
  const isPast = (lesson: AdminModule['lessons'][number]) => Boolean(lesson.scheduledAt && new Date(lesson.scheduledAt).getTime() < now)
  const attended = (student: TutorClassStudent) => liveLessons.filter((lesson) => student.attendance[lesson.id] === 'Present').length

  if (selectedSession) return <>
    <Button onClick={() => setSelectedSessionId(null)} sx={{ mb: 2 }}>Back to sessions</Button>
    <Typography variant="h4" sx={{ mb: 0.5 }}>{selectedSession.title}</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>{selectedSession.scheduledAt ? new Date(selectedSession.scheduledAt).toLocaleString() : 'Schedule pending'} · Attendance marking</Typography>
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Stack direction="row" sx={{ p: 2, backgroundColor: 'background.default' }}><Typography sx={{ flex: 1, fontWeight: 700 }}>Enrolled student</Typography><Typography sx={{ width: 220, fontWeight: 700 }}>Join-click reference</Typography><Typography sx={{ width: 180, fontWeight: 700 }}>Attendance</Typography></Stack>
      {students.map((student) => <Stack key={student.id} direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 600 }}>{student.studentName}</Typography><Typography variant="body2" color="text.secondary">{student.studentEmail}</Typography></Box><Typography variant="body2" color="text.secondary" sx={{ width: { md: 220 } }}>{student.sessionJoinClicks[selectedSession.id] ? new Date(student.sessionJoinClicks[selectedSession.id]).toLocaleString() : 'No join click recorded'}</Typography><Select size="small" value={student.attendance[selectedSession.id] ?? ''} displayEmpty onChange={(event) => void onMarkAttendance(student, selectedSession.id, event.target.value as 'Present' | 'Absent')} sx={{ width: { xs: '100%', md: 180 } }}><MenuItem value=""><em>Not marked</em></MenuItem><MenuItem value="Present">Present</MenuItem><MenuItem value="Absent">Absent</MenuItem></Select></Stack>)}
    </Paper>
  </>

  return <>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}><Box><Button onClick={onBack} sx={{ mb: 1 }}>Back to My Classes</Button><Typography variant="h4">{selectedClass.title}</Typography><Typography color="text.secondary">Students & attendance</Typography></Box></Stack>
    <Typography variant="h5" sx={{ mb: 2 }}>Roster</Typography>
    {studentsLoading && <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}><CircularProgress size={20} aria-label="Loading roster" /><Typography color="text.secondary">Loading enrolled students...</Typography></Stack>}
    {!studentsLoading && students.length === 0 && <Typography color="text.secondary" sx={{ mb: 2 }}>No enrolled students yet.</Typography>}
    <Paper elevation={0} sx={{ mb: 4, border: 1, borderColor: 'divider', overflow: 'hidden' }}><Stack direction="row" sx={{ p: 2, backgroundColor: 'background.default' }}><Typography sx={{ flex: 1, fontWeight: 700 }}>Student</Typography><Typography sx={{ width: 190, fontWeight: 700 }}>Enrolled</Typography><Typography sx={{ width: 190, fontWeight: 700 }}>Attendance</Typography></Stack>{students.map((student) => <Stack key={student.id} direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 600 }}>{student.studentName}</Typography><Typography variant="body2" color="text.secondary">{student.studentEmail}</Typography></Box><Typography variant="body2" color="text.secondary" sx={{ width: { md: 190 } }}>{student.enrolledDate}</Typography><Typography variant="body2" sx={{ width: { md: 190 }, fontWeight: 600 }}>{attended(student)}/{liveLessons.length} sessions attended</Typography></Stack>)}</Paper>
    <Typography variant="h5" sx={{ mb: 2 }}>Sessions</Typography>
    <Stack spacing={1.5}>{liveLessons.length === 0 && <Typography color="text.secondary">No live sessions have been added to this class.</Typography>}{liveLessons.map((lesson) => <Paper key={lesson.id} component={isPast(lesson) ? 'button' : 'div'} type={isPast(lesson) ? 'button' : undefined} onClick={isPast(lesson) ? () => setSelectedSessionId(lesson.id) : undefined} elevation={0} sx={{ width: '100%', p: 2, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', textAlign: 'left', backgroundColor: 'background.paper', cursor: isPast(lesson) ? 'pointer' : 'default', '&:hover': isPast(lesson) ? { borderColor: 'primary.main' } : undefined }}><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 600 }}>{lesson.title}</Typography><Typography variant="body2" color="text.secondary">{lesson.scheduledAt ? new Date(lesson.scheduledAt).toLocaleString() : 'Schedule pending'}</Typography></Box><Chip label={isPast(lesson) ? 'Mark attendance' : 'Not yet occurred'} color={isPast(lesson) ? 'primary' : 'default'} variant="outlined" /></Paper>)}</Stack>
  </>
}

const formatLearningTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

const StudentProgressView = ({ target, students, studentsLoading, classRanks, onBack }: { target: ProgressTarget; students: TutorClassStudent[]; studentsLoading: boolean; classRanks: Map<number, number>; onBack: () => void }) => {
  const lessons = target.modules.flatMap((module) => module.lessons)
  const quizzes = lessons.filter((lesson) => lesson.type === 'quiz')
  const liveLessons = lessons.filter((lesson) => lesson.type === 'live')
  const latestAttempt = (student: TutorClassStudent, lessonId: number) => student.quizAttempts
    .filter((attempt) => attempt.lessonId === lessonId && attempt.score !== null && attempt.passed !== null)
    .sort((first, second) => new Date(second.submittedAt ?? second.startedAt).getTime() - new Date(first.submittedAt ?? first.startedAt).getTime())[0]
  const getOverallGrade = (student: TutorClassStudent) => calculateOverallGrade({
    quizLessonIds: quizzes.map((quiz) => quiz.id),
    quizScores: Object.fromEntries(quizzes.map((quiz) => [quiz.id, latestAttempt(student, quiz.id)?.score ?? undefined])),
    attendance: student.attendance,
    liveLessons,
    completionPercentage: student.progressPercentage,
    isClass: target.type === 'class',
  })

  return <>
    <Button onClick={onBack} sx={{ mb: 2 }}>Back to My {target.type === 'course' ? 'Courses' : 'Classes'}</Button>
    <Typography variant="h4" sx={{ mb: 0.5 }}>{target.title}</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Student progress</Typography>
    <ArticleInteractionReport target={target} />
    {target.type === 'class' && typeof target.syllabusGrade === 'number' && !studentsLoading && <SyllabusCoveragePanel grade={target.syllabusGrade} modules={target.modules} students={students} />}
    <Stack spacing={2}>
      {studentsLoading && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={20} aria-label="Loading enrolled students" /><Typography color="text.secondary">Loading enrolled students...</Typography></Stack>}
      {!studentsLoading && students.length === 0 && <Typography color="text.secondary">No enrolled students yet.</Typography>}
      {!studentsLoading && students.map((student) => <Paper key={student.id} elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: quizzes.length || target.type === 'class' ? 2 : 0 }}>
          <Box><Typography variant="h6">{student.studentName}</Typography><Typography variant="body2" color="text.secondary">{student.studentEmail}</Typography></Box>
          <Stack direction="row" spacing={3} flexWrap="wrap"><Box><Typography variant="body2" color="text.secondary">Completion</Typography><Typography sx={{ fontWeight: 700 }}>{student.progressPercentage}%</Typography></Box><Box><Typography variant="body2" color="text.secondary">Overall grade</Typography><Stack direction="row" spacing={0.75} alignItems="center"><Typography sx={{ fontWeight: 700 }}>{getOverallGrade(student).percentage}%</Typography><Chip label={getOverallGrade(student).letter} size="small" color={getOverallGrade(student).letter === 'F' ? 'error' : getOverallGrade(student).letter === 'D' ? 'warning' : 'success'} /></Stack></Box>{target.type === 'class' && <Box><Typography variant="body2" color="text.secondary">Class rank</Typography><Typography sx={{ fontWeight: 700 }}>{classRanks.has(student.studentId) ? `#${classRanks.get(student.studentId)}` : '—'}</Typography></Box>}<Box><Typography variant="body2" color="text.secondary">Time learning</Typography><Typography sx={{ fontWeight: 700 }}>{formatLearningTime(student.timeSpentSeconds)}</Typography></Box></Stack>
        </Stack>
        {target.type === 'class' && <Typography variant="body2" sx={{ mb: quizzes.length ? 2 : 0, fontWeight: 600 }}>{liveLessons.filter((lesson) => student.attendance[lesson.id] === 'Present').length}/{liveLessons.length} sessions attended</Typography>}
        {quizzes.length > 0 && <><Divider sx={{ mb: 1.5 }} /><Typography variant="subtitle2" sx={{ mb: 1 }}>Quiz results</Typography><Stack spacing={1}>{quizzes.map((quiz) => {
          const attempts = student.quizAttempts.filter((attempt) => attempt.lessonId === quiz.id)
          const result = latestAttempt(student, quiz.id)
          return <Stack key={quiz.id} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}><Typography variant="body2">{quiz.title}</Typography><Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" color="text.secondary">{result ? `${result.score}%` : 'Not attempted'} · {attempts.length} attempt{attempts.length === 1 ? '' : 's'}</Typography>{result && <Chip size="small" label={result.passed ? 'Passed' : 'Failed'} color={result.passed ? 'success' : 'error'} />}</Stack></Stack>
        })}</Stack></>}
      </Paper>)}
    </Stack>
  </>
}

const TutorScheduleView: FC<{ classes: TutorClass[]; now: Date }> = ({ classes, now }) => {
  const sessions = classes.flatMap((classRecord) => classRecord.modules
    .flatMap((module) => module.lessons)
    .filter((lesson) => lesson.type === 'live' && lesson.scheduledAt)
    .map((lesson) => ({
      id: `${classRecord.id}-${lesson.id}`,
      classTitle: classRecord.title,
      lessonTitle: lesson.title,
      scheduledAt: lesson.scheduledAt!,
      endsAt: lesson.endsAt,
      meetingUrl: lesson.meetingUrl || classRecord.meetingLink,
      classSchedule: `${classRecord.schedule.startDate || 'Start date pending'} – ${classRecord.schedule.endDate || 'End date pending'}`,
      lessonId: lesson.id,
    } satisfies ScheduleSession)))

  return <ScheduleCalendar
    title="Live class schedule"
    description="See the upcoming live sessions for every class you teach in one weekly view."
    sessions={sessions}
    now={now}
    emptyTitle="No upcoming live sessions"
    emptyDescription="Live lessons scheduled in your classes will appear here."
  />
}

const drawerWidth = 272

const TutorDashboard = ({ darkMode, onToggleDarkMode }: { darkMode: boolean; onToggleDarkMode: () => void }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [view, setView] = useState<View>(() => getTutorViewFromPath(window.location.pathname))
  const [courseSearch, setCourseSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [classSearch, setClassSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [overview, setOverview] = useState<TutorOverview | null>(null)
  const [courses, setCourses] = useState<Awaited<ReturnType<typeof getTutorCourses>>>([])
  const [classes, setClasses] = useState<TutorClass[]>([])
  const [students, setStudents] = useState<TutorClassStudent[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('')
  const [progressTarget, setProgressTarget] = useState<ProgressTarget | null>(null)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [classRanks, setClassRanks] = useState<Map<number, number>>(new Map())
  const [profile, setProfile] = useState({ name: '', phone: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([])
  const [atRiskLoading, setAtRiskLoading] = useState(true)
  const [atRiskError, setAtRiskError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const hasLoaded = useRef(false)
  const [now, setNow] = useState(() => new Date())
  const [courseDraft, setCourseDraft] = useState<AdminCourse | null>(null)
  const [classDraft, setClassDraft] = useState<AdminClassEditorRecord | null>(null)
  const [tutorOptions, setTutorOptions] = useState<TutorOption[]>([])
  const user = getAuthenticatedUser()

  const refreshAtRisk = async (background = false) => {
    if (!background) setAtRiskLoading(true)
    try {
      setAtRiskStudents(await getTutorAtRiskStudents())
      setAtRiskError(null)
    } catch (loadError) {
      setAtRiskError(loadError instanceof Error ? loadError.message : 'Unable to load at-risk students.')
    } finally {
      if (!background) setAtRiskLoading(false)
    }
  }

  const load = async ({ background = false }: { background?: boolean } = {}) => {
    if (background && getTutorEditTargetFromPath(window.location.pathname)) return
    if (!background) {
      setLoading(true)
      setError('')
    }
    void refreshAtRisk(background)
    try {
      const [nextOverview, nextCourses, nextClasses, nextTutorOptions] = await Promise.all([getTutorOverview(), getTutorCourses(), getTutorClasses(), getTutorEditOptions()])
      setOverview(nextOverview)
      setCourses(nextCourses)
      setClasses(nextClasses)
      setTutorOptions(nextTutorOptions)
      setSelectedClassId((current) => nextClasses.some((classRecord) => classRecord.id === current) ? current : nextClasses[0]?.id ?? '')
      setProgressTarget((current) => current?.type === 'class' && !nextClasses.some((classRecord) => classRecord.id === current.id) ? null : current)
      if (!background) setProfile({ name: nextOverview.tutor.name, phone: nextOverview.tutor.phone, bio: nextOverview.tutor.bio })
    } catch (loadError) {
      if (background) return
      const message = loadError instanceof Error ? loadError.message : 'Unable to load tutor portal.'
      setError(message)
      toast.add({ type: 'error', title: 'Tutor portal unavailable', description: message })
    } finally {
      if (!background) setLoading(false)
    }
  }

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    void load()
  }, [])
  useEffect(() => {
    const refresh = () => { void load({ background: true }) }
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  useEffect(() => {
    const syncView = () => {
      setCurrentPath(window.location.pathname)
      setView(getTutorViewFromPath(window.location.pathname))
      setProgressTarget(null)
      setError('')
    }
    window.addEventListener('popstate', syncView)
    return () => window.removeEventListener('popstate', syncView)
  }, [])
  useEffect(() => {
    const target = getTutorEditTargetFromPath(currentPath)
    if (!target) {
      setCourseDraft(null)
      setClassDraft(null)
      return
    }
    if (target.type === 'course') {
      setCourseDraft(courses.find((course) => course.id === target.id) ?? null)
      setClassDraft(null)
      return
    }
    const classRecord = classes.find((record) => record.id === target.id)
    setCourseDraft(null)
    setClassDraft(classRecord ? { id: classRecord.id, program_id: classRecord.programId as ProgramId, title: classRecord.title, cover: classRecord.cover ?? '', tutor_id: classRecord.tutorId, tutor_name: classRecord.tutorName, capacity: classRecord.capacity, schedule: { startDate: classRecord.schedule.startDate, endDate: classRecord.schedule.endDate, days: classRecord.schedule.days, time: classRecord.schedule.time, duration: classRecord.schedule.duration }, meeting_link: classRecord.meetingLink, modules: classRecord.modules, price: classRecord.price, status: classRecord.status, published: classRecord.published, grade_level: classRecord.gradeLevel, exam_date: classRecord.examDate } : null)
  }, [currentPath, courses, classes])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [view, selectedClassId, progressTarget?.type, progressTarget?.id, courseDraft?.id, classDraft?.id])
  useEffect(() => {
    const classId = progressTarget?.type === 'class' ? progressTarget.id : null
    if (classId === null) {
      setClassRanks(new Map())
      return
    }
    void getClassLeaderboard(classId)
      .then((entries) => setClassRanks(new Map(entries.map((entry) => [entry.studentId, entry.rank]))))
      .catch((loadError) => {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load class rankings.'
        setError(message)
        toast.add({ type: 'error', title: 'Unable to load class rankings', description: message })
      })
  }, [progressTarget])

  useEffect(() => {
    let isCurrent = true
    const loadStudents = async (background = false) => {
      const request = view === 'students' && selectedClassId !== ''
        ? getTutorClassStudents(selectedClassId)
        : progressTarget
          ? progressTarget.type === 'course' ? getTutorCourseStudents(progressTarget.id) : getTutorClassStudents(progressTarget.id)
          : null
      if (!request) {
        setStudents([])
        return
      }
      if (!background) setStudentsLoading(true)
      try {
        const nextStudents = await request
        if (isCurrent) setStudents(nextStudents)
      } catch (loadError) {
        if (background || !isCurrent) return
        setStudents([])
        const message = loadError instanceof Error ? loadError.message : 'Unable to load students.'
        setError(message)
        toast.add({ type: 'error', title: 'Unable to load students', description: message })
      } finally {
        if (isCurrent && !background) setStudentsLoading(false)
      }
    }
    void loadStudents()
    const refresh = () => { void loadStudents(true) }
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('focus', refresh)
    return () => {
      isCurrent = false
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [view, selectedClassId, progressTarget])

  const selectedClass = classes.find((classRecord) => classRecord.id === selectedClassId)
  const activeProgressTarget = useMemo<ProgressTarget | null>(() => {
    if (!progressTarget) return null
    if (progressTarget.type === 'course') {
      const course = courses.find((item) => item.id === progressTarget.id)
      return course ? { ...progressTarget, title: course.title, modules: course.modules } : progressTarget
    }
    const classRecord = classes.find((item) => item.id === progressTarget.id)
    return classRecord ? { ...progressTarget, title: classRecord.title, modules: classRecord.modules, syllabusGrade: classRecord.programId === 'ministry-exam-prep' ? classRecord.gradeLevel : null } : progressTarget
  }, [progressTarget, courses, classes])
  const visibleCourses = courses.filter((course) => `${course.title} ${course.category}`.toLowerCase().includes(courseSearch.trim().toLowerCase()) && (courseFilter === 'all' || course.status.toLowerCase() === courseFilter))
  const visibleClasses = classes.filter((classRecord) => `${classRecord.title} ${classRecord.programId} ${classRecord.courseTitle ?? ''}`.toLowerCase().includes(classSearch.trim().toLowerCase()) && (classFilter === 'all' || (classFilter === 'published' ? classRecord.published : !classRecord.published)))
  const liveLessons = useMemo(() => selectedClass?.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.type === 'live') ?? [], [selectedClass])
  const editTarget = getTutorEditTargetFromPath(currentPath)
  const pageTitle = editTarget?.type === 'course' ? 'Edit Course' : editTarget?.type === 'class' ? 'Edit Class' : progressTarget ? 'Student Progress' : view === 'overview' ? 'Overview' : view === 'schedule' ? 'Schedule' : view === 'courses' ? 'My Courses' : view === 'classes' ? 'My Classes' : view === 'students' ? 'Students & Attendance' : view === 'grading' ? 'Grading' : 'Profile'

  useEffect(() => {
    document.title = `${SITE_NAME} | ${pageTitle}`
  }, [pageTitle])

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setProfileError('')
    setProfileSaved(false)
    try {
      const updated = await updateTutorProfile(profile)
      if (user) saveAuthenticatedUser({ ...user, name: updated.name, email: updated.email, phone: updated.phone })
      setOverview((current) => current ? { ...current, tutor: updated } : current)
      setProfile({ name: updated.name, phone: updated.phone, bio: updated.bio })
      setProfileSaved(true)
      toast.add({ type: 'success', title: 'Profile saved', description: 'Your tutor profile was updated.' })
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save profile.'
      setProfileError(message)
      toast.add({ type: 'error', title: 'Profile update failed', description: message })
    } finally { setSaving(false) }
  }

  const manageCourse = (course: AdminCourse) => navigateTo(`/tutor/courses/${course.id}/edit`)

  const saveCourseDraft = async () => {
    if (!courseDraft) return
    setSaving(true)
    try {
      const savedCourse = await updateTutorCourse(courseDraft)
      setCourses(await getTutorCourses())
      navigateTo(tutorViewPaths.courses)
      toast.add({ type: 'success', title: 'Course saved', description: `${savedCourse.title} was updated.` })
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save course.'
      setError(message)
      toast.add({ type: 'error', title: 'Course update failed', description: message })
    } finally { setSaving(false) }
  }

  const manageClass = (classRecord: TutorClass) => navigateTo(`/tutor/classes/${classRecord.id}/edit`)

  const saveClassDraft = async (values: ClassFormValue) => {
    if (!classDraft) return
    setSaving(true)
    try {
      await updateTutorClass({ id: classDraft.id, ...values })
      setClasses(await getTutorClasses())
      navigateTo(tutorViewPaths.classes)
      toast.add({ type: 'success', title: 'Class saved', description: `${values.title} was updated.` })
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save class.'
      setError(message)
      toast.add({ type: 'error', title: 'Class update failed', description: message })
    } finally { setSaving(false) }
  }

  const markAttendance = async (student: TutorClassStudent, lessonId: number, status: 'Present' | 'Absent') => {
    try {
      await updateTutorClassAttendance(student.id, lessonId, status)
      setStudents((current) => current.map((item) => item.id === student.id ? { ...item, attendance: { ...item.attendance, [lessonId]: status } } : item))
      void refreshAtRisk()
      toast.add({ type: 'success', title: 'Attendance saved', description: `${student.studentName} marked ${status}.` })
    } catch (attendanceError) {
      const message = attendanceError instanceof Error ? attendanceError.message : 'Unable to save attendance.'
      setError(message)
      toast.add({ type: 'error', title: 'Attendance update failed', description: message })
    }
  }

  const handleSignOut = () => {
    void toast.promise(signOut().then(() => navigateTo('/', true)), {
      loading: 'Signing out...',
      success: { title: 'Signed out', description: 'You have been successfully logged out.' },
      error: (signOutError) => signOutError instanceof Error ? signOutError.message : 'Unable to sign out.',
    })
  }

  const selectView = (nextView: View) => {
    setView(nextView)
    setProgressTarget(null)
    setError('')
    if (nextView !== 'profile') setProfileError('')
    setMobileOpen(false)
    if (window.location.pathname !== tutorViewPaths[nextView]) navigateTo(tutorViewPaths[nextView])
  }

  const navButton = (nextView: View, label: string, icon: React.ReactNode) => <Box
    key={nextView}
    component="button"
    type="button"
    aria-current={view === nextView ? 'page' : undefined}
    onClick={() => selectView(nextView)}
    sx={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, border: 0, borderRadius: 2.5, px: 1.5, py: 1.05, mb: .45,
      backgroundColor: view === nextView ? 'primary.main' : 'transparent', color: view === nextView ? 'primary.contrastText' : 'text.secondary',
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .18s ease',
      boxShadow: view === nextView ? (currentTheme) => `0 7px 16px ${alpha(currentTheme.palette.primary.main, 0.22)}` : 'none',
      '&:hover': { backgroundColor: view === nextView ? 'primary.dark' : 'action.hover', color: view === nextView ? 'primary.contrastText' : 'primary.main', transform: view === nextView ? 'none' : 'translateX(2px)' },
    }}
  ><Box sx={{ display: 'flex', opacity: view === nextView ? 1 : .82 }}>{icon}</Box><Typography variant="body2" sx={{ flex: 1, fontWeight: view === nextView ? 700 : 500 }}>{label}</Typography></Box>

  const sidebar = <Box sx={{ width: drawerWidth, height: '100%', overflowY: 'auto', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
    <Box sx={{ px: 3, pt: 2.5, pb: 2.25, borderBottom: 1, borderColor: 'divider' }}><Box sx={{ transform: 'scale(.82)', transformOrigin: 'left center', width: '122%' }}><Logo /></Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .2 }}>Your teaching workspace</Typography></Box>
    <Box component="nav" aria-label="Tutor dashboard navigation" sx={{ px: 1.75, py: 2, flex: 1 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Workspace</Typography>
      {navButton('overview', 'Dashboard', <DashboardOutlinedIcon fontSize="small" />)}
      {navButton('schedule', 'Schedule', <CalendarTodayOutlinedIcon fontSize="small" />)}
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mt: 2.25, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Teaching</Typography>
      {navButton('courses', 'My Courses', <SchoolOutlinedIcon fontSize="small" />)}
      {navButton('classes', 'My Classes', <ClassOutlinedIcon fontSize="small" />)}
      {navButton('students', 'Students & Attendance', <GroupsOutlinedIcon fontSize="small" />)}
      {navButton('grading', 'Grading', <AssignmentTurnedInOutlinedIcon fontSize="small" />)}
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mt: 2.25, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Account</Typography>
      {navButton('profile', 'Profile', <PersonOutlineIcon fontSize="small" />)}
    </Box>
    <Box sx={{ p: 1.75, pt: 1, borderTop: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.25, mb: 1.25, borderRadius: 3, background: (currentTheme) => `linear-gradient(135deg, ${alpha(currentTheme.palette.primary.main, currentTheme.palette.mode === 'dark' ? 0.22 : 0.10)}, ${alpha(currentTheme.palette.primary.main, currentTheme.palette.mode === 'dark' ? 0.10 : 0.04)})` }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{(user?.name || overview?.tutor.name || 'Tutor').charAt(0)}</Avatar><Box sx={{ minWidth: 0 }}><Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>{user?.name || overview?.tutor.name || 'Tutor'}</Typography><Typography variant="caption" color="text.secondary">Tutor account</Typography></Box></Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: .7 }}><SchoolOutlinedIcon sx={{ color: 'primary.main' }} fontSize="small" /><Typography variant="caption" color="text.secondary">Support every learner&apos;s progress.</Typography></Box>
    </Box>
  </Box>

  if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress aria-label="Loading tutor portal" /></Box>

  return <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
    {isMobile ? <Drawer variant="temporary" anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: drawerWidth, maxWidth: 'calc(100vw - 48px)' } }}>{sidebar}</Drawer> : <Box sx={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: drawerWidth, zIndex: 'drawer' }}>{sidebar}</Box>}
    <Box sx={{ flex: 1, minWidth: 0, ml: { xs: 0, md: `${drawerWidth}px` }, display: 'flex', flexDirection: 'column' }}>
      <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 'appBar', minHeight: 82, px: { xs: 2, md: 3.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, backgroundColor: (currentTheme) => alpha(currentTheme.palette.background.paper, currentTheme.palette.mode === 'dark' ? 0.96 : 0.82), backdropFilter: 'blur(16px)', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {isMobile && <IconButton onClick={() => setMobileOpen(true)} aria-label="Open tutor navigation"><MenuIcon /></IconButton>}
          <Box sx={{ minWidth: 0 }}><Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: .8, lineHeight: 1 }}>Tutor workspace</Typography><Typography variant="h6" noWrap sx={{ fontWeight: 800, lineHeight: 1.35 }}>{pageTitle}</Typography></Box>
        </Box>
        <Stack direction="row" alignItems="center" spacing={.75}>
          <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}><IconButton onClick={onToggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}</IconButton></Tooltip>
          <Tooltip title="Open profile menu"><IconButton id="tutor-profile-button" onClick={(event) => setProfileAnchor(event.currentTarget)} aria-label="Open tutor profile menu" aria-controls={profileAnchor ? 'tutor-profile-menu' : undefined} aria-haspopup="true" aria-expanded={profileAnchor ? 'true' : undefined} sx={{ p: .25 }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{(user?.name || overview?.tutor.name || 'Tutor').charAt(0)}</Avatar></IconButton></Tooltip>
          <Menu id="tutor-profile-menu" anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} MenuListProps={{ 'aria-labelledby': 'tutor-profile-button' }} PaperProps={{ sx: { minWidth: 190, borderRadius: 2, p: .75 } }}>
            <MenuItem onClick={() => { setProfileAnchor(null); selectView('profile') }}><PersonOutlineIcon fontSize="small" sx={{ mr: 1 }} />{user?.name || overview?.tutor.name || 'Tutor profile'}</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); handleSignOut() }}>Sign out</MenuItem>
          </Menu>
        </Stack>
      </Box>
      <Box component="main" sx={{ flex: 1, maxWidth: 1440, mx: 'auto', width: '100%', p: { xs: 2, sm: 2.5, md: 4 } }}>
      {editTarget?.type === 'course' && courseDraft && <><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}><Box><Button onClick={() => navigateTo(tutorViewPaths.courses)} sx={{ mb: 1 }}>Back to My Courses</Button><Typography variant="h4">Edit course</Typography><Typography color="text.secondary">Update course details, publishing, requirements, and curriculum.</Typography></Box><Button variant="contained" onClick={() => void saveCourseDraft()} disabled={saving}>Save changes</Button></Stack><CourseEditor course={courseDraft} onChange={setCourseDraft} allowedLessonTypes={getAllowedCourseLessonTypes()} tutorOptions={Array.from(new Set([...tutorOptions.map((tutor) => tutor.name), courseDraft.tutor]))} /></>}
      {editTarget?.type === 'course' && !courseDraft && !loading && <Paper sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 1 }}>Course not found</Typography><Button onClick={() => navigateTo(tutorViewPaths.courses)}>Back to My Courses</Button></Paper>}
      {editTarget?.type === 'class' && classDraft && <ClassEditorDialog key={classDraft.id} classRecord={classDraft} open onClose={() => navigateTo(tutorViewPaths.classes)} onSave={(values) => void saveClassDraft(values)} fullPage tutorOptions={tutorOptions.some((tutor) => tutor.id === classDraft.tutor_id) ? tutorOptions : [...tutorOptions, { id: classDraft.tutor_id, name: classDraft.tutor_name ?? overview?.tutor.name ?? 'Current tutor' }]} />}
      {editTarget?.type === 'class' && !classDraft && !loading && <Paper sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 1 }}>Class not found</Typography><Button onClick={() => navigateTo(tutorViewPaths.classes)}>Back to My Classes</Button></Paper>}
      {error && view !== 'profile' && <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'error.main' }}><Typography color="error">{error}</Typography></Paper>}
      {profileError && view === 'profile' && <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'error.main' }}><Typography color="error">{profileError}</Typography></Paper>}
      {view === 'overview' && overview && <>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-end' }} spacing={2.5} sx={{ mb: 3 }}>
          <Box><Stack direction="row" alignItems="center" spacing={.75} sx={{ mb: .75, color: 'primary.main' }}><SchoolOutlinedIcon sx={{ fontSize: 17 }} /><Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.5 }}>YOUR TEACHING SPACE</Typography></Stack><Typography component="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, fontWeight: 800, letterSpacing: '-.055em', lineHeight: 1.1 }}>Welcome back, {(user?.name || overview.tutor.name || 'Tutor').split(/\s+/)[0]}</Typography><Typography color="text.secondary" sx={{ mt: .8 }}>Here&apos;s what&apos;s happening across your teaching workspace.</Typography></Box>
          <Button variant="outlined" startIcon={<CalendarTodayOutlinedIcon />} onClick={() => selectView('schedule')} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, borderRadius: 2.5, px: 2 }}>View schedule</Button>
        </Stack>
        <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', mb: 2.25, borderRadius: { xs: 3.5, md: 4.5 }, color: '#fff', background: (currentTheme) => currentTheme.palette.mode === 'dark' ? 'linear-gradient(120deg, #103b39 0%, #145d53 58%, #147b68 100%)' : 'linear-gradient(120deg, #123e3a 0%, #17675c 58%, #168773 100%)' }}>
          <Box aria-hidden="true" sx={{ position: 'absolute', width: 420, height: 420, right: { xs: -250, md: 70 }, top: -280, borderRadius: '50%', border: '1px solid rgba(255,255,255,.11)', boxShadow: '0 0 0 42px rgba(255,255,255,.035), 0 0 0 84px rgba(255,255,255,.025)' }} />
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={3} sx={{ position: 'relative', p: { xs: 2.5, sm: 3.5, md: 4 } }}>
            <Box sx={{ maxWidth: 650 }}><Chip size="small" icon={<GroupsOutlinedIcon />} label="YOUR IMPACT, AT A GLANCE" sx={{ mb: 2, color: '#e6fff8', bgcolor: 'rgba(255,255,255,.13)', '& .MuiChip-icon': { color: 'inherit' }, fontWeight: 700, letterSpacing: '.04em' }} /><Typography variant="h4" sx={{ fontSize: { xs: '1.55rem', sm: '2rem' }, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.2 }}>Inspiring learning starts with you</Typography><Typography sx={{ mt: 1, color: 'rgba(255,255,255,.76)', maxWidth: 540 }}>Review your courses, guide students through their progress, and keep every class moving forward.</Typography><Stack direction="row" spacing={1.25} sx={{ mt: 2.5 }}><Button variant="contained" onClick={() => selectView('courses')} sx={{ borderRadius: 2.5, px: 2.25, color: '#12463e', bgcolor: '#fff', fontWeight: 800, boxShadow: 'none', '&:hover': { bgcolor: '#e8f8f2', boxShadow: 'none' } }}>Manage courses</Button><Button variant="outlined" onClick={() => selectView('students')} sx={{ borderRadius: 2.5, color: '#fff', borderColor: 'rgba(255,255,255,.45)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.08)' } }}>View students</Button></Stack></Box>
            <Box sx={{ minWidth: { md: 190 }, p: { xs: 2, md: 2.5 }, borderRadius: 3, bgcolor: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)' }}><Typography variant="overline" sx={{ color: 'rgba(255,255,255,.72)', fontWeight: 700, letterSpacing: '.08em' }}>UPCOMING CLASSES</Typography><Typography variant="h3" sx={{ mt: .5, fontWeight: 800, lineHeight: 1 }}>{overview.upcomingClasses}</Typography><Typography variant="body2" sx={{ mt: .75, color: 'rgba(255,255,255,.76)' }}>Sessions on your schedule</Typography></Box>
          </Stack>
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.25, sm: 1.75 }, mb: 2.25 }}>{statItems(overview).map((item, index) => <Card key={item.label} elevation={0} sx={{ minHeight: 138, border: 1, borderColor: 'divider', borderRadius: 3.5, backgroundColor: 'background.paper' }}><CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, '&:last-child': { pb: { xs: 1.75, sm: 2.25 } } }}><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}><Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography><Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 2.25, color: ['#0b8877', '#4279c5', '#855dc3', '#bd791b'][index], bgcolor: ['rgba(11,136,119,.1)', 'rgba(66,121,197,.1)', 'rgba(133,93,195,.11)', 'rgba(189,121,27,.12)'][index] }}>{item.icon}</Box></Stack><Typography variant="h4" sx={{ mt: 1.25, fontWeight: 800, letterSpacing: '-.04em' }}>{item.value}</Typography><Typography variant="caption" color="text.secondary">{['Ready to teach', 'Courses in your workspace', 'Learners you support', 'On your schedule'][index]}</Typography></CardContent></Card>)}</Box>
        <AtRiskStudentsPanel students={atRiskStudents} loading={atRiskLoading} error={atRiskError} />
        <Paper elevation={0} sx={{ mt: 2.25, p: { xs: 2.25, sm: 3 }, borderRadius: 3.5, border: 1, borderColor: 'divider' }}><Typography variant="h6" sx={{ mb: 1, fontWeight: 800 }}>Your teaching assignments</Typography><Typography color="text.secondary">Manage class rosters, attendance, and your profile from the sections above.</Typography><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}><Chip icon={<SchoolOutlinedIcon />} label={`${overview.totalCourses} courses`} variant="outlined" /><Chip icon={<ClassOutlinedIcon />} label={`${overview.totalClasses} classes`} variant="outlined" /><Chip icon={<GroupsOutlinedIcon />} label={`${overview.totalStudents} students`} variant="outlined" /></Stack></Paper>
      </>}
      {view === 'schedule' && <TutorScheduleView classes={classes} now={now} />}
      {view === 'grading' && <TutorGradingView />}
      {view === 'courses' && !progressTarget && !editTarget && <><Box sx={{ mb: 2.5 }}><Typography variant="h4" sx={{ mb: 0.75 }}>My courses</Typography><Typography color="text.secondary">Curriculum and student progress for your assigned courses</Typography></Box><TutorListControls search={courseSearch} onSearch={setCourseSearch} searchPlaceholder="Search courses..." filter={courseFilter} onFilter={setCourseFilter} filterLabel="Course filter" filters={[{ value: 'all', label: 'All Courses' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} /><Stack spacing={2.5}>{visibleCourses.length ? visibleCourses.map((course) => <Card key={course.id} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, transition: 'border-color .18s, box-shadow .18s', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}><CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2.25}><Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}><Box component="img" src={course.cover} alt={`${course.title} thumbnail`} sx={{ width: 96, height: 76, flexShrink: 0, objectFit: 'cover', borderRadius: 2 }} /><Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.3, mb: 0.75 }}>{course.title}</Typography><Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ color: 'text.secondary' }}><Stack direction="row" alignItems="center" spacing={0.5}><SchoolOutlinedIcon fontSize="small" /><Typography variant="body2">{course.category}</Typography></Stack><Typography variant="body2">·</Typography><Stack direction="row" alignItems="center" spacing={0.5}><GroupsOutlinedIcon fontSize="small" /><Typography variant="body2">{course.students} students</Typography></Stack></Stack></Box></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0, '& .MuiButton-root': { px: 1.75, py: 1 } }}><Button size="small" variant="outlined" startIcon={<AssessmentOutlinedIcon />} onClick={() => setProgressTarget({ type: 'course', id: course.id, title: course.title, modules: course.modules })}>Student Progress</Button><Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => manageCourse(course)}>Edit curriculum</Button></Stack></Stack></CardContent></Card>) : <Typography color="text.secondary">No courses assigned yet.</Typography>}</Stack></>}
      {view === 'classes' && !progressTarget && !editTarget && <><Box sx={{ mb: 2.5 }}><Typography variant="h4" sx={{ mb: 0.75 }}>My classes</Typography><Typography color="text.secondary">Rosters, attendance, curriculum, and student progress for your assigned classes</Typography></Box><TutorListControls search={classSearch} onSearch={setClassSearch} searchPlaceholder="Search classes..." filter={classFilter} onFilter={setClassFilter} filterLabel="Class filter" filters={[{ value: 'all', label: 'All Classes' }, { value: 'published', label: 'Published' }, { value: 'unpublished', label: 'Unpublished' }]} /><Stack spacing={2.5}>{visibleClasses.length ? visibleClasses.map((classRecord) => <Card key={classRecord.id} elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, transition: 'border-color .18s, box-shadow .18s', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}><CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}><Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2.25}><Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.3, mb: 0.75 }}>{classRecord.title}</Typography><Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ color: 'text.secondary' }}><Stack direction="row" alignItems="center" spacing={0.5}><GroupsOutlinedIcon fontSize="small" /><Typography variant="body2">{classRecord.enrolledCount} enrolled students</Typography></Stack><Typography variant="body2">·</Typography><Typography variant="body2">{classRecord.status}</Typography><Typography variant="body2">·</Typography><Stack direction="row" alignItems="center" spacing={0.5}><CalendarMonthOutlinedIcon fontSize="small" /><Typography variant="body2">{classRecord.schedule.startDate || 'Start date pending'} – {classRecord.schedule.endDate || 'End date pending'}</Typography></Stack></Stack></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0, '& .MuiButton-root': { px: 1.5, py: 1 } }}><Button size="small" variant="outlined" startIcon={<AssessmentOutlinedIcon />} onClick={() => { setProgressTarget({ type: 'class', id: classRecord.id, title: classRecord.title, modules: classRecord.modules }); setView('classes') }}>Student Progress</Button><Button size="small" variant="outlined" startIcon={<GroupsOutlinedIcon />} onClick={() => { setSelectedClassId(classRecord.id); setProgressTarget(null); setView('students') }}>Students & attendance</Button><Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => manageClass(classRecord)}>Edit curriculum</Button></Stack></Stack></CardContent></Card>) : <Typography color="text.secondary">No classes assigned yet.</Typography>}</Stack></>}
      {activeProgressTarget && <StudentProgressView target={activeProgressTarget} students={students} studentsLoading={studentsLoading} classRanks={classRanks} onBack={() => setProgressTarget(null)} />}
      {view === 'students' && selectedClass && !progressTarget && <StudentsAttendanceView selectedClass={selectedClass} students={students} liveLessons={liveLessons} onMarkAttendance={markAttendance} studentsLoading={studentsLoading} onBack={() => selectView('classes')} />}
      {view === 'students' && !selectedClass && <><Typography variant="h4" sx={{ mb: 3 }}>Students & attendance</Typography><FormControl sx={{ minWidth: { xs: '100%', sm: 360 }, mb: 2 }}><InputLabel>Class</InputLabel><Select label="Class" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value as number)}>{classes.map((classRecord) => <MenuItem key={classRecord.id} value={classRecord.id}>{classRecord.title}</MenuItem>)}</Select></FormControl>{selectedClass && <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2">Join-click reference</Typography><Typography variant="caption" color="text.secondary">A Join Class click is a reference only; select Present or Absent to record attendance.</Typography><Stack spacing={0.5} sx={{ mt: 1 }}>{students.flatMap((student) => liveLessons.filter((lesson) => student.sessionJoinClicks[lesson.id]).map((lesson) => <Typography key={`${student.id}-${lesson.id}`} variant="caption">{student.studentName} · {lesson.title}: {new Date(student.sessionJoinClicks[lesson.id]).toLocaleString()}</Typography>))}</Stack></Paper>}{selectedClass && <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', overflow: 'auto' }}><Box sx={{ minWidth: 700 }}><Stack direction="row" sx={{ p: 2, backgroundColor: 'background.default', fontWeight: 700 }}><Typography sx={{ flex: 1 }}>Student</Typography>{liveLessons.map((lesson) => <Typography key={lesson.id} sx={{ width: 150 }}>{lesson.title}</Typography>)}</Stack><Divider />{students.length ? students.map((student) => <Stack key={student.id} direction="row" alignItems="center" sx={{ p: 2 }}><Box sx={{ flex: 1 }}><Typography>{student.studentName}</Typography><Typography variant="caption" color="text.secondary">{student.studentEmail}</Typography></Box>{liveLessons.map((lesson) => <FormControl key={lesson.id} size="small" sx={{ width: 140 }}><Select value={student.attendance[lesson.id] ?? ''} displayEmpty inputProps={{ 'aria-label': `${student.studentName} attendance for ${lesson.title}` }} onChange={(event) => void markAttendance(student, lesson.id, event.target.value as 'Present' | 'Absent')}><MenuItem value="">Not marked</MenuItem><MenuItem value="Present">Present</MenuItem><MenuItem value="Absent">Absent</MenuItem></Select></FormControl>)}</Stack>) : <Typography color="text.secondary" sx={{ p: 3 }}>No students enrolled in this class.</Typography>}</Box></Paper>}</>}
      {view === 'profile' && <><Typography variant="h4" sx={{ mb: 0.5 }}>Tutor profile</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Keep your contact details and teaching bio up to date for students and administrators.</Typography><Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch"><Paper elevation={0} sx={{ p: 3, width: { xs: '100%', md: 240 }, border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}><Avatar sx={{ width: 88, height: 88, mb: 2, fontSize: 30, fontWeight: 700, backgroundColor: 'primary.main' }}>{profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'}</Avatar><Typography variant="h6">{profile.name || 'Tutor'}</Typography><Typography variant="body2" color="text.secondary">Tutor account</Typography></Paper><Paper component="form" onSubmit={saveProfile} elevation={0} sx={{ p: { xs: 2, md: 3 }, flex: 1, border: 1, borderColor: 'divider' }}><Stack spacing={2}><TextField label="Full name" value={profile.name} onChange={(event) => { setProfile({ ...profile, name: event.target.value }); setProfileSaved(false) }} required fullWidth /><TextField label="Phone number" placeholder="Add a phone number" value={profile.phone} onChange={(event) => { setProfile({ ...profile, phone: event.target.value }); setProfileSaved(false) }} fullWidth /><TextField label="Teaching bio" placeholder="Tell students about your teaching experience" value={profile.bio} onChange={(event) => { setProfile({ ...profile, bio: event.target.value }); setProfileSaved(false) }} multiline minRows={5} fullWidth /><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}><Typography variant="caption" color="text.secondary">Your profile is visible in the tutor portal.</Typography><Button type="submit" variant="contained" disabled={saving} startIcon={<PersonOutlineIcon />}>{saving ? 'Saving...' : 'Save profile'}</Button></Stack>{profileSaved && <Typography color="success.main" role="status">Profile updated successfully.</Typography>}</Stack></Paper></Stack></>}
      </Box>
    </Box>
  </Box>
}

export default TutorDashboard
