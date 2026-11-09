import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import Pagination from '@mui/material/Pagination'
import Popper from '@mui/material/Popper'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, type Theme, useTheme } from '@mui/material/styles'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined'
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import MenuIcon from '@mui/icons-material/Menu'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SearchIcon from '@mui/icons-material/Search'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import SortOutlinedIcon from '@mui/icons-material/SortOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { buildStudyPlan, getDaysBetween, prioritizePlannerTopics, toDateKey, type PlannerTopic } from '@/components/course/study-planner'
import { countMasteryLevels, getLessonMastery, MASTERY_LABELS, type MasteryAttempt, type MasteryLevel } from '@/components/course/study-mastery'
import { getExamReadiness, READINESS_TIER_LABELS, type ExamReadiness, type ReadinessTier } from '@/components/course/exam-readiness'
import { type FC, type FocusEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Course } from '@/interfaces/course'
import ScheduleCalendar, { type ScheduleSession } from '@/components/schedule-calendar'
import GamificationWidgets from './gamification-widgets'
import StudentDashboardOverview from './student-dashboard-overview'
import CourseCardItem from './course-card-item'
import StudentReviews from './student-reviews'
import InteractiveDiagramViewer from './interactive-diagram-viewer'
import SimulationLesson from './simulation-lesson'
import StepByStepSolverLesson from './step-by-step-solver-lesson'
import VoiceDictationButton from './voice-dictation-button'
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import AccountSecurity, { SecurityNotifications } from './account-security'
import { type AdminCourse, type ArticleContentBlock, type ArticleVocabularyEntry, type SimulationConfig, type StepByStepSolverLearnerConfig } from '@/components/admin/admin-data'
import { sanitizeArticleHtml } from '@/lib/article-content'
import { getArticleSectionTitles } from '@/lib/article-sections'
import { ArticleCheckpointCard, ArticleSectionHelp } from './article-interactions'
import { type LearnerArticleCheckpoint, splitArticleFragments } from '@/lib/article-checkpoints'
import { getWordAtPoint, normalizeWord, useReadAloud } from '@/components/course/article-reading-tools'
import { getCurriculumTopicKey, getMathTopic, getMathTopicForLesson, STEM_CURRICULUM, type MathTopic } from '@/components/admin/stem-curriculum'
import { getPlatformEngine, type PlatformEngineId } from '@/components/stem-lab/platform-engine-library'
import { PlatformEnginePreview } from '@/components/stem-lab/platform-engine-previews'
import { Logo } from '@/components/logo'
import EnrollmentModal from './enrollment-modal'
import AdminDataTable, { type DataColumn } from '@/components/admin/admin-data-table'
import { toast } from '@/components/toast'
import { beginQuizAttempt, completeLesson as completeLessonApi, getArticleInteractions, getAuthenticatedUser, recordArticleCheckpointAnswer, requestArticleSectionHelp, type ArticleInteractionState, type LessonProgress, getBookstorePurchases, getCourse, getCourses, getGamification, getMyEnrollments, getMyPayments, getPracticeExam, getPracticePurchases, getPublicClasses, logLiveSessionJoin, recordPracticeLessonAnswer, saveAuthenticatedUser, saveLessonEngagement, saveQuizAnswer, saveQuizViolation, saveStudyPlan, submitQuizAttempt, signOut, updateAuthenticatedProfile, type BookstorePurchase, type GamificationData, type MyEnrollment, type MyPayment, type PublicClass, type QuizAnswerRecord, type QuizAnswerStatus, type QuizAttempt, type QuizQuestionResult, type QuizViolation, type QuizViolationType, type WeakArea } from '@/services/api'
import { navigateTo } from '@/lib/navigation'
import { type LessonProgress } from '@/services/api'
import { SITE_NAME } from '@/lib/site'
import { calculateOverallGrade } from '@/lib/overall-grade'

 type DashboardView = 'overview' | 'calendar' | 'courses' | 'classes' | 'explore-courses' | 'explore-classes' | 'study-planner' | 'quizzes' | 'purchases' | 'profile' | 'security' | 'payments' | 'course-view' | 'course-detail' | 'class-detail'
 const dashboardViewPaths: Record<Exclude<DashboardView, 'course-view' | 'course-detail' | 'class-detail'>, string> = {
  overview: '/dashboard',
  calendar: '/calendar',
  courses: '/enrollments',
  classes: '/classes',
  'explore-courses': '/explore-courses',
  'explore-classes': '/explore-classes',
  'study-planner': '/study-planner',
  quizzes: '/quizzes',
  purchases: '/purchases',
  profile: '/profile',
  security: '/security',
  payments: '/payments',
 }
 const dashboardViewFromPath = (pathname: string): DashboardView => {
  const route = pathname.replace(/\/+$/, '') || '/dashboard'
  if (/^\/account\/courses\/\d+$/.test(route)) return 'course-detail'
  if (/^\/account\/classes\/\d+$/.test(route)) return 'class-detail'
  return (Object.entries(dashboardViewPaths).find(([, path]) => path === route)?.[0] as DashboardView | undefined) ?? 'overview'
 }
 const catalogCourseIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/account\/courses\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
 }
 const catalogClassIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/account\/classes\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
 }
 type EnrollmentType = 'course' | 'class'
 type EnrollmentStatus = 'active' | 'pending_schedule' | 'completed'
 type ClassStatus = 'pending_schedule' | 'open' | 'full' | 'closed'

 interface DashboardQuizResult {
  score: number
  passed: boolean
  disqualified?: boolean
  retakeApproved?: boolean
  answerStatuses?: Record<number, QuizAnswerStatus>
  violationCount?: number
  questionResults?: QuizQuestionResult[]
}

 interface DashboardEnrollment {
  id: number
  user_id: number
  type: EnrollmentType
  item_id: number
  status: EnrollmentStatus
  progress: number
  timeSpentSeconds: number
  lessonProgress: Record<number, LessonProgress>
  lastActivityAt: string | null
  quizResults: Record<number, DashboardQuizResult>
  quizAttempts: MasteryAttempt[]
  weakAreas: WeakArea[]
  attendance: Record<number, 'Present' | 'Absent'>
  sessionJoinClicks: Record<number, string>
  activityDates: string[]
  studyPlanOrder: number[] | null
  course?: DashboardCourse
  classRecord?: DashboardClass
 }

type QuizQuestion = { id: number; question: string; topic?: string; options: string[]; type?: string; category?: string; questionImage?: string; optionImages?: Array<string | undefined>; explanation?: string; explanationImage?: string }
const getQuestionSeconds = (question: QuizQuestion) => {
  const kind = `${question.type ?? ''} ${question.category ?? ''}`.toLowerCase()
  if (/true|false|boolean/.test(kind)) return 30
  if (/multiple|choice/.test(kind)) return 90
  if (/matching|ordering|order/.test(kind)) return 90
  if (/fill|short|text/.test(kind)) return 180
  if (/calculation|data|numeric|math/.test(kind)) return 240
  if (/essay|file|upload/.test(kind)) return 900
  return 90
}
const getQuizTimeLimitSeconds = (questions: QuizQuestion[]) => questions.reduce((total, question) => total + getQuestionSeconds(question), 0)
const formatQuizCountdown = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

 interface DashboardLesson {
  id: number
  title: string
  type: 'video' | 'article' | 'interactive' | 'simulation' | 'quiz' | 'practice' | 'live' | 'stepByStepSolver'
  duration: string
  description: string
  articleBlocks?: ArticleContentBlock[]
  articleHeaderImageUrl?: string
  articleVocabulary?: ArticleVocabularyEntry[]
  articleCheckpoints?: LearnerArticleCheckpoint[]
  articleHelpDisabledSections?: number[]
  videoUrl?: string
  thumbnailUrl?: string
  captionsVtt?: string
  captionLanguage?: string
  transcript?: string
  baseImageUrl?: string
  interactiveHotspots?: Array<{ id: number; left: string; top: string; label: string; explanation: string }>
  simulation?: SimulationConfig
  stepByStepSolver?: StepByStepSolverLearnerConfig
  platformEngineId?: string
  curriculumTopic?: string
  topicTitle?: string
  mathTopic?: MathTopic
  resources: Array<{ id: number; name: string; url?: string }>
  quizQuestions?: QuizQuestion[]
  practiceQuestions?: Array<{ id: number; question: string; topic: string; options: string[]; correctAnswer: string; explanation: string }>
  passThreshold?: number
  meetingUrl?: string
  scheduledAt?: string
  endsAt?: string
  estimatedDuration?: number
}

 interface DashboardModule {
  id: number
  title: string
  lessons: DashboardLesson[]
 }

 interface DashboardCourse {
  id: number
  title: string
  cover?: string | null
  category: string
  level: string
  tutor: string
  description?: string
  learningOutcomes?: string[]
  durationSeconds?: number
  certificate: boolean
  modules: DashboardModule[]
  meetingLink?: string
}

 interface DashboardClassSchedule {
  days: string[]
  time: string
  duration: number
  flexible: boolean
  startDate: string
  endDate: string
  date: string
  startsAt: string
 }

 interface DashboardClass {
  id: number
  title: string
  tutorName: string
  schedule: DashboardClassSchedule
  meeting_link: string
  status: ClassStatus
  course_id: number | null
  programId: string | null
  examDate: string | null
  course?: DashboardCourse
 }

 interface DashboardPurchase {
  id: number
  item_name: string
  type: 'Book' | 'Exam'
  download_url: string
  exam_id?: number
}

const drawerWidth = 272
const collapsedDrawerWidth = 80
const sessionJoinWindowMs = 15 * 60 * 1000
const formatDuration = (seconds: number) => {
  const totalMinutes = Math.max(1, Math.round(seconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h${minutes ? ` ${minutes}m` : ''}` : `${minutes}m`
}
const formatTimeSpent = (seconds: number) => seconds < 60 ? `${seconds}s` : formatDuration(seconds)
const getQuizGrade = (score: number) => score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
const formatClassTime = (time: string) => {
  if (!time) return 'Time to be confirmed'
  const [hour, minute] = time.split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 'Time to be confirmed'
  const suffix = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`
}
const classScheduleLabel = (schedule: DashboardClassSchedule) => {
  if (schedule.flexible) return 'Flexible schedule'
  const days = schedule.days.length ? schedule.days.join(', ') : 'Days to be confirmed'
  return `${days} · ${formatClassTime(schedule.time)}`
}
const classStartDate = (schedule: DashboardClassSchedule) => {
  if (!schedule.startDate) return null
  const date = new Date(`${schedule.startDate}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}
const formatClassStartDate = (schedule: DashboardClassSchedule) => {
  const date = classStartDate(schedule)
  return date ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date) : 'Start date not set'
}
const classStartDateTime = (schedule: DashboardClassSchedule) => {
  const date = classStartDate(schedule)
  if (!date) return null
  if (!schedule.flexible && schedule.days.length) {
    const dayIndexes = new Set(schedule.days.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)))
    while (!dayIndexes.has(date.getDay())) date.setDate(date.getDate() + 1)
  }
  const [hours, minutes] = schedule.time.split(':').map(Number)
  if (Number.isFinite(hours) && Number.isFinite(minutes)) date.setHours(hours, minutes, 0, 0)
  return date
}
const classHasStarted = (schedule: DashboardClassSchedule, now: Date) => {
  const date = classStartDateTime(schedule)
  return date !== null && now.getTime() >= date.getTime()
}
const classHasEnded = (schedule: DashboardClassSchedule, now: Date) => {
  if (!schedule.endDate) return false
  const endDate = new Date(`${schedule.endDate}T00:00:00`)
  endDate.setDate(endDate.getDate() + 1)
  return now.getTime() >= endDate.getTime()
}
const getClassSessionState = (classRecord: DashboardClass, now: Date) => {
  const sessions = classRecord.course?.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.type === 'live' && lesson.scheduledAt).sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!)) ?? []
  const activeLesson = sessions.find((lesson) => {
    const start = new Date(lesson.scheduledAt!).getTime()
    const end = lesson.endsAt ? new Date(lesson.endsAt).getTime() : start + 60 * 60 * 1000
    return now.getTime() >= start && now.getTime() < end
  })
  const latestStarted = [...sessions].reverse().find((lesson) => new Date(lesson.scheduledAt!).getTime() <= now.getTime())
  return { activeLesson, isActive: Boolean(activeLesson), hasEnded: Boolean(latestStarted && !activeLesson) }
}
const getLessons = (course: DashboardCourse) => course.modules.flatMap((module) => module.lessons)
const getCompletionLessons = (course: DashboardCourse) => getLessons(course).filter((lesson) => lesson.type !== 'practice')
const getEnrollmentContentId = (enrollment: MyEnrollment) => enrollment.classId ?? enrollment.courseId ?? enrollment.id
const getPhysicsActivityTopic = (curriculumTopic: string | undefined, title: string) => STEM_CURRICULUM.Physics.includes(title) ? title : STEM_CURRICULUM.Physics.find((topic) => getCurriculumTopicKey('Physics', topic) === curriculumTopic) ?? title
const mapEnrollmentCourse = (enrollment: MyEnrollment): DashboardCourse => ({
  id: getEnrollmentContentId(enrollment),
  title: enrollment.classTitle || enrollment.courseTitle || 'Enrolled class',
  cover: enrollment.classCover || enrollment.courseCover,
  category: enrollment.classId === null ? enrollment.category || 'Course' : 'Class',
  level: enrollment.level || 'Not specified',
  tutor: enrollment.tutor || enrollment.classTutor || 'Tutor to be confirmed',
  description: enrollment.courseDescription || enrollment.courseLongDescription || undefined,
  learningOutcomes: Array.isArray(enrollment.learningOutcomes) ? enrollment.learningOutcomes.filter((outcome): outcome is string => typeof outcome === 'string') : [],
  durationSeconds: enrollment.modules.flatMap((module) => module.lessons).reduce((total, lesson) => total + (lesson.duration ?? 0), 0),
  certificate: enrollment.certificate ?? false,
  modules: enrollment.modules.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration ? formatDuration(lesson.duration) : lesson.type === 'article' ? 'Article' : lesson.type === 'interactive' ? 'Interactive' : lesson.type === 'simulation' ? 'Simulation' : lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'practice' ? 'Practice' : lesson.type === 'stepByStepSolver' ? 'Step-by-Step Solver' : 'Video',
      description: lesson.articleBody || (module.title === 'Biology' && lesson.title === 'Photosynthesis' ? 'See how plants make their own food using sunlight.' : module.title === 'Biology' && lesson.title === 'Cells' ? 'Discover that living things are made of tiny building blocks called cells.' : module.title === 'Chemistry' && lesson.title === 'Chemical Formulae' ? 'Assemble the correct chemical formula from elements.' : module.title === 'Chemistry' && lesson.title === 'Materials Around Us' ? 'Explore the everyday materials that make up our world.' : module.title === 'Chemistry' && lesson.title === 'Solids/Liquids/Gases' ? 'Explore the three states of matter.' : module.title === 'Chemistry' && (lesson.title === 'Properties of Materials' || lesson.title === 'Mixing Materials') ? "Compare materials by their physical properties, and explore what happens when they're mixed." : getMathTopicForLesson(module.title, lesson.curriculumTopic, lesson.title)?.description) || 'Work through this lesson at your own pace.',
      videoUrl: lesson.videoUrl,
      thumbnailUrl: lesson.thumbnailUrl,
      captionsVtt: lesson.captionsVtt,
      captionLanguage: lesson.captionLanguage,
      transcript: lesson.transcript,
      articleBlocks: lesson.articleBlocks,
      articleVocabulary: lesson.articleVocabulary,
      articleHeaderImageUrl: lesson.articleHeaderImageUrl,
      articleCheckpoints: lesson.articleCheckpoints,
      articleHelpDisabledSections: lesson.articleHelpDisabledSections,
      baseImageUrl: lesson.baseImageUrl,
      interactiveHotspots: lesson.interactiveHotspots,
      simulation: lesson.simulation,
      stepByStepSolver: lesson.stepByStepSolver,
      platformEngineId: lesson.platformEngineId,
      curriculumTopic: lesson.curriculumTopic,
      topicTitle: module.title === 'Physics' ? getPhysicsActivityTopic(lesson.curriculumTopic, lesson.title) : lesson.title,
      mathTopic: getMathTopicForLesson(module.title, lesson.curriculumTopic, lesson.title),
      resources: lesson.resources ?? [],
      quizQuestions: lesson.quizQuestions,
      practiceQuestions: lesson.practiceQuestions,
      passThreshold: lesson.passThreshold,
      meetingUrl: lesson.meetingUrl,
      scheduledAt: lesson.scheduledAt,
      endsAt: lesson.endsAt,
      estimatedDuration: lesson.estimatedDuration,
    })),
  })),
  meetingLink: enrollment.classId === null ? undefined : enrollment.meetingLink ?? undefined,
})
const mapEnrollmentClass = (enrollment: MyEnrollment, course: DashboardCourse): DashboardClass | null => enrollment.classId === null ? null : {
  id: enrollment.classId,
  title: enrollment.classTitle || 'Class enrollment',
  tutorName: enrollment.classTutor || 'Tutor to be confirmed',
  schedule: {
    days: enrollment.classSchedule?.days ?? [],
    time: enrollment.classSchedule?.time ?? '',
    duration: enrollment.classSchedule?.duration ?? 60,
    flexible: enrollment.classSchedule?.flexible ?? false,
    startDate: enrollment.classSchedule?.startDate ?? '',
    endDate: enrollment.classSchedule?.endDate ?? '',
    date: '',
    startsAt: '',
  },
  meeting_link: enrollment.meetingLink || '',
  status: enrollment.classStatus || 'pending_schedule',
  course_id: enrollment.courseId,
  programId: enrollment.classProgramId,
  examDate: enrollment.classExamDate,
  course,
}
const getLatestQuizResults = (attempts: MyEnrollment['quizAttempts']): Record<number, DashboardQuizResult> => attempts
  .filter((attempt) => attempt.score !== null && attempt.passed !== null)
  .sort((first, second) => new Date(second.submittedAt ?? second.startedAt).getTime() - new Date(first.submittedAt ?? first.startedAt).getTime())
  .reduce<Record<number, DashboardQuizResult>>((results, attempt) => {
    if (results[attempt.lessonId] !== undefined) return results
    const completedAttempts = attempts.filter((candidate) => candidate.lessonId === attempt.lessonId && candidate.score !== null && candidate.passed !== null)
    const retakeAvailable = completedAttempts.length === 1 && Boolean(completedAttempts[0].retakeApproved)
    results[attempt.lessonId] = { score: attempt.score!, passed: attempt.passed!, disqualified: attempt.disqualified, retakeApproved: retakeAvailable, answerStatuses: Object.fromEntries((attempt.questionResults ?? Object.entries(attempt.answers ?? {}).map(([id, answer]) => ({ questionId: Number(id), status: typeof answer === 'object' && answer !== null && 'status' in answer ? answer.status : typeof answer === 'number' ? 'answered' : 'unanswered' }))).map((item) => [item.questionId, item.status])), violationCount: attempt.violations?.length ?? 0, questionResults: attempt.questionResults }
    return results
  }, {})
const mapMyEnrollments = (records: MyEnrollment[], userId: number): DashboardEnrollment[] => records.flatMap((record) => {
  const course = mapEnrollmentCourse(record)
  const classRecord = mapEnrollmentClass(record, course)
  const quizResults = getLatestQuizResults(record.quizAttempts)
  const quizAttempts = record.quizAttempts
  const lessonById = new Map(record.modules.flatMap((module) => module.lessons).map((lesson) => [lesson.id, lesson]))
  const activityDates = [
    ...Object.values(record.lessonProgress ?? {}).map((progress) => progress.completedAt),
    ...record.quizAttempts.filter((attempt) => attempt.passed === true).map((attempt) => attempt.submittedAt ?? attempt.startedAt),
    ...Object.entries(record.attendance ?? {}).filter(([, status]) => status === 'Present').map(([lessonId]) => lessonById.get(Number(lessonId))?.scheduledAt),
  ].filter((date): date is string => Boolean(date))
  const courseEnrollment: DashboardEnrollment = { id: record.id, user_id: userId, type: 'course', item_id: getEnrollmentContentId(record), status: 'active', progress: record.progressPercentage, timeSpentSeconds: record.timeSpentSeconds, lessonProgress: record.lessonProgress ?? {}, lastActivityAt: record.lastActivityAt, quizResults, quizAttempts, weakAreas: record.weakAreas ?? [], attendance: record.attendance ?? {}, sessionJoinClicks: record.sessionJoinClicks ?? {}, activityDates, studyPlanOrder: null, course }
  if (!classRecord) return [courseEnrollment]
  return [{ id: record.id, user_id: userId, type: 'class', item_id: classRecord.id, status: classRecord.status === 'pending_schedule' ? 'pending_schedule' : 'active', progress: record.progressPercentage, timeSpentSeconds: record.timeSpentSeconds, lessonProgress: record.lessonProgress ?? {}, lastActivityAt: record.lastActivityAt, quizResults, quizAttempts, weakAreas: record.weakAreas ?? [], attendance: record.attendance ?? {}, sessionJoinClicks: record.sessionJoinClicks ?? {}, activityDates, studyPlanOrder: record.studyPlanOrder ?? null, classRecord }]
})
const getCourseProgress = (course: DashboardCourse, completedLessonIds: number[]) => Math.round((completedLessonIds.filter((lessonId) => getCompletionLessons(course).some((lesson) => lesson.id === lessonId)).length / Math.max(1, getCompletionLessons(course).length)) * 100)
const getEnrollmentCourse = (enrollment: DashboardEnrollment) => enrollment.course ?? enrollment.classRecord?.course
const findCourseEnrollment = (records: DashboardEnrollment[], courseId: number) => records.find((enrollment) => enrollment.type === 'class' && getEnrollmentCourse(enrollment)?.id === courseId) ?? records.find((enrollment) => getEnrollmentCourse(enrollment)?.id === courseId)
const getEnrollmentOverallGrade = (enrollment: DashboardEnrollment, completionPercentage = enrollment.progress, now = new Date()) => {
  const course = getEnrollmentCourse(enrollment)
  const lessons = course ? getLessons(course) : []
  return calculateOverallGrade({
    quizLessonIds: lessons.filter((lesson) => lesson.type === 'quiz').map((lesson) => lesson.id),
    quizScores: Object.fromEntries(Object.entries(enrollment.quizResults).map(([lessonId, result]) => [Number(lessonId), result.score])),
    attendance: enrollment.attendance,
    liveLessons: lessons.filter((lesson) => lesson.type === 'live'),
    completionPercentage,
    isClass: enrollment.type === 'class',
    now,
  })
}
const OverallGradeValue: FC<{ grade: ReturnType<typeof getEnrollmentOverallGrade> }> = ({ grade }) => <Stack direction="row" spacing={1.25} alignItems="center"><Typography variant="body2" color="text.secondary">Overall grade</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{grade.percentage}%</Typography><Chip label={grade.letter} size="small" color={grade.letter === 'F' ? 'error' : grade.letter === 'D' ? 'warning' : 'success'} /></Stack>
const ClassRankValue: FC<{ rank?: number }> = ({ rank }) => rank === undefined ? null : <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>Class rank: {rank}</Typography>
const getClassRank = (data: GamificationData | null, classId?: number) => {
  if (!data || classId === undefined) return undefined
  const rank = data.classRanks?.find((entry) => Number(entry.classId) === classId)?.rank
  return rank ?? (Number(data.classId) === classId ? data.leaderboard.find((entry) => entry.isCurrentStudent)?.rank : undefined)
}
const iconForLesson = (type: DashboardLesson['type']) => {
  if (type === 'article' || type === 'interactive') return <ArticleOutlinedIcon fontSize="small" />
  if (type === 'quiz') return <QuizOutlinedIcon fontSize="small" />
  if (type === 'practice') return <QuizOutlinedIcon fontSize="small" />
  if (type === 'stepByStepSolver') return <FormatListNumberedOutlinedIcon fontSize="small" />
  return <PlayCircleOutlineIcon fontSize="small" />
}

const ViewHeading: FC<{ eyebrow?: string; title: string; description: string; action?: ReactNode; compact?: boolean }> = ({ eyebrow, title, description, action, compact = false }) => (
  <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: compact ? 2.5 : 4, flexDirection: { xs: 'column', sm: 'row' } }}>
    <Box>
      {eyebrow && <Typography color="primary.main" variant="overline" sx={{ fontWeight: 700, letterSpacing: 1 }}>{eyebrow}</Typography>}
      <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Box>
    {action}
  </Box>
)

const SummaryCard: FC<{ label: string; value: string; detail: string; icon: ReactNode; onClick?: () => void }> = ({ label, value, detail, icon, onClick }) => (
  <Card elevation={0} onClick={onClick} sx={{ flex: 1, minWidth: { xs: '100%', sm: 210 }, border: 1, borderColor: 'divider', cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { borderColor: 'primary.main' } : undefined }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography component="h2" color="text.secondary" variant="body2">{label}</Typography>
        <Box sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box>
      </Box>
      <Typography variant="h5" sx={{ mb: 0.75 }}>{value}</Typography>
      <Typography color="text.secondary" variant="body2">{detail}</Typography>
    </CardContent>
  </Card>
)

const DashboardHeader: FC<{ title: string; darkMode: boolean; language: string; onLanguageChange: () => void; onToggleDarkMode: () => void; onOpenMenu: () => void }> = ({ title, darkMode, language, onLanguageChange, onToggleDarkMode, onOpenMenu }) => {
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const user = getAuthenticatedUser()
  const displayName = user?.name || 'Alex Morgan'

  return <Box component="header" sx={{ minHeight: 82, px: { xs: 2, md: 3.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.82), backdropFilter: 'blur(16px)', borderBottom: 1, borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <IconButton onClick={onOpenMenu} sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label="Open dashboard navigation"><MenuIcon /></IconButton>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}><Typography variant="h6" sx={{ fontWeight: 800 }}>Course<span style={{ color: 'inherit' }}>space</span></Typography></Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: .8, lineHeight: 1 }}>Student portal</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.35 }}>{title}</Typography>
      </Box>
    </Box>
    <Stack direction="row" alignItems="center" spacing={.75}>
      <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', width: 220, px: 1.5, py: .55, borderRadius: 5, backgroundColor: 'action.hover', color: 'text.secondary' }}><SearchIcon fontSize="small" /><Typography variant="caption" sx={{ ml: .8 }}>Search here...</Typography></Box>
      <Tooltip title={`Language: ${language}`}><IconButton onClick={onLanguageChange} aria-label={`Change language, currently ${language}`}><TranslateOutlinedIcon fontSize="small" /></IconButton></Tooltip>
      <SecurityNotifications />
      <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}><IconButton onClick={onToggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}</IconButton></Tooltip>
      <Tooltip title="Open profile menu"><IconButton onClick={(event) => setProfileAnchor(event.currentTarget)} aria-label="Open profile menu" aria-controls={profileAnchor ? 'student-profile-menu' : undefined} aria-haspopup="true" sx={{ p: .25 }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{displayName.charAt(0)}</Avatar></IconButton></Tooltip>
      <Menu id="student-profile-menu" anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} PaperProps={{ sx: { minWidth: 190, borderRadius: 2, p: 0.75 } }}>
        <MenuItem onClick={() => { setProfileAnchor(null); window.dispatchEvent(new CustomEvent('student-profile-open')) }}><PersonOutlineIcon fontSize="small" sx={{ mr: 1 }} />{displayName}</MenuItem>
        <MenuItem onClick={() => { setProfileAnchor(null); void signOut().then(() => { toast.add({ title: 'Signed out', description: 'You have been successfully logged out.', type: 'success' }); navigateTo('/', true) }) }}>Sign out</MenuItem>
      </Menu>
    </Stack>
  </Box>
}

interface SidebarProps {
  activeView: DashboardView
  onSelectView: (view: DashboardView) => void
  collapsed: boolean
}

const DashboardSidebar: FC<SidebarProps> = ({ activeView, onSelectView, collapsed }) => {
  const enrollmentActive = activeView === 'courses' || activeView === 'classes' || activeView === 'study-planner' || activeView === 'course-view'
  const [isEnrollmentExpanded, setIsEnrollmentExpanded] = useState(enrollmentActive)

  useEffect(() => {
    setIsEnrollmentExpanded(enrollmentActive)
  }, [enrollmentActive])

  const toggleEnrollment = () => {
    if (collapsed) {
      onSelectView('courses')
      return
    }
    setIsEnrollmentExpanded((current) => !current)
    if (!enrollmentActive) onSelectView('courses')
  }
  const user = getAuthenticatedUser()
  const displayName = user?.name || 'Alex Morgan'
  const navItem = (view: DashboardView, label: string, icon: ReactNode, active: boolean, endIcon?: ReactNode, onClick?: () => void, ariaExpanded?: boolean) => {
    const button = <Box component="button" type="button" aria-label={collapsed ? label : undefined} aria-expanded={collapsed ? undefined : ariaExpanded} onClick={onClick ?? (() => onSelectView(view))} sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 1.25, border: 0, borderRadius: 2.5, px: collapsed ? 0 : 1.5, py: 1.05, mb: .45, backgroundColor: active ? 'primary.main' : 'transparent', color: active ? 'primary.contrastText' : 'text.secondary', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .18s ease', boxShadow: active ? (theme) => `0 7px 16px ${alpha(theme.palette.primary.main, 0.22)}` : 'none', '&:hover': { backgroundColor: active ? 'primary.dark' : 'action.hover', color: active ? 'primary.contrastText' : 'primary.main', transform: active ? 'none' : 'translateX(2px)' } }}><Box sx={{ display: 'flex', opacity: active ? 1 : .82 }}>{icon}</Box>{!collapsed && <><Typography variant="body2" sx={{ flex: 1, fontWeight: active ? 700 : 500 }}>{label}</Typography>{endIcon}</>}</Box>
    return collapsed ? <Tooltip title={label} placement="right">{button}</Tooltip> : button
  }

  return <Box sx={{ width: collapsed ? collapsedDrawerWidth : drawerWidth, height: '100%', overflowY: 'auto', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider', transition: 'width .2s ease' }}>
    <Box sx={{ px: collapsed ? 1 : 3, pt: 2.5, pb: 2.25, borderBottom: 1, borderColor: 'divider' }}>{collapsed ? <Box sx={{ display: 'flex', justifyContent: 'center' }}><Logo compact /></Box> : <><Box sx={{ transform: 'scale(.82)', transformOrigin: 'left center', width: '122%' }}><Logo /></Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .2 }}>Your personal learning space</Typography></>}</Box>
    <Box component="nav" aria-label="Student dashboard navigation" sx={{ px: collapsed ? 1 : 1.75, py: 2, flex: 1 }}>
      {!collapsed && <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Overview</Typography>}
      {navItem('overview', 'Dashboard', <DashboardOutlinedIcon fontSize="small" />, activeView === 'overview')}
      {navItem('calendar', 'Calendar', <CalendarTodayOutlinedIcon fontSize="small" />, activeView === 'calendar')}
      <Box>
        {navItem('courses', 'My Enrollments', <MenuBookOutlinedIcon fontSize="small" />, enrollmentActive, <ExpandMoreIcon fontSize="small" sx={{ transform: isEnrollmentExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />, toggleEnrollment, isEnrollmentExpanded)}
        {isEnrollmentExpanded && !collapsed && <Box sx={{ ml: 2, mb: 1 }}>
          <Box component="button" type="button" onClick={() => onSelectView('courses')} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, border: 0, borderLeft: 2, borderColor: activeView === 'courses' || activeView === 'course-view' ? 'primary.main' : 'divider', py: 0.75, pl: 1.5, pr: 1, backgroundColor: 'transparent', color: activeView === 'courses' || activeView === 'course-view' ? 'primary.main' : 'text.secondary', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: activeView === 'courses' || activeView === 'course-view' ? 600 : 400, textAlign: 'left' }}><MenuBookOutlinedIcon fontSize="small" />My Courses</Box>
          <Box component="button" type="button" onClick={() => onSelectView('classes')} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, border: 0, borderLeft: 2, borderColor: activeView === 'classes' ? 'primary.main' : 'divider', py: 0.75, pl: 1.5, pr: 1, backgroundColor: 'transparent', color: activeView === 'classes' ? 'primary.main' : 'text.secondary', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: activeView === 'classes' ? 600 : 400, textAlign: 'left' }}><ClassOutlinedIcon fontSize="small" />My Classes</Box>
          <Box component="button" type="button" onClick={() => onSelectView('study-planner')} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, border: 0, borderLeft: 2, borderColor: activeView === 'study-planner' ? 'primary.main' : 'divider', py: 0.75, pl: 1.5, pr: 1, backgroundColor: 'transparent', color: activeView === 'study-planner' ? 'primary.main' : 'text.secondary', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: activeView === 'study-planner' ? 600 : 400, textAlign: 'left' }}><CalendarTodayOutlinedIcon fontSize="small" />Study Planner</Box>
        </Box>}
      </Box>
      {collapsed ? <Divider sx={{ my: 1.5 }} /> : <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mt: 2.25, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Learning</Typography>}
      {navItem('quizzes', 'Quizzes & Results', <QuizOutlinedIcon fontSize="small" />, activeView === 'quizzes')}
      {navItem('purchases', 'My Purchases', <PaymentsOutlinedIcon fontSize="small" />, activeView === 'purchases')}
      {collapsed ? <Divider sx={{ my: 1.5 }} /> : <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mt: 2.25, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Account</Typography>}
      {navItem('profile', 'Profile', <PersonOutlineIcon fontSize="small" />, activeView === 'profile')}
      {navItem('security', 'Security', <ShieldOutlinedIcon fontSize="small" />, activeView === 'security')}
      {navItem('payments', 'Payment History', <PaymentsOutlinedIcon fontSize="small" />, activeView === 'payments')}
    </Box>
    <Box sx={{ p: collapsed ? 1 : 1.75, pt: 1, borderTop: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.25, mb: 1.25, borderRadius: 3, background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.10)}, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.10 : 0.04)})` }}><Box sx={{ position: 'relative' }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{displayName.charAt(0)}</Avatar><Box sx={{ position: 'absolute', right: -1, bottom: 0, width: 9, height: 9, borderRadius: '50%', bgcolor: 'success.main', border: (theme) => `2px solid ${theme.palette.background.paper}` }} /></Box>{!collapsed && <Box sx={{ minWidth: 0 }}><Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>{displayName}</Typography><Typography variant="caption" color="text.secondary">Student account</Typography></Box>}</Box>
      {!collapsed && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: .7 }}><SchoolOutlinedIcon sx={{ color: 'primary.main' }} fontSize="small" /><Typography variant="caption" color="text.secondary">Keep learning at your own pace.</Typography></Box>}
    </Box>
  </Box>
}

const StudentCalendarView: FC<{ enrollments: DashboardEnrollment[]; now: Date; onJoin: (session: ScheduleSession) => void }> = ({ enrollments, now, onJoin }) => {
  const sessions = enrollments.flatMap((enrollment) => {
    const classRecord = enrollment.classRecord
    if (enrollment.type !== 'class' || !classRecord?.course) return []
    const course = classRecord.course
    return getLessons(course)
      .filter((lesson) => lesson.type === 'live' && lesson.scheduledAt)
      .map((lesson) => ({
        id: `${enrollment.id}-${lesson.id}`,
        classTitle: classRecord.title,
        lessonTitle: lesson.title,
        scheduledAt: lesson.scheduledAt!,
        endsAt: lesson.endsAt,
        meetingUrl: lesson.meetingUrl || classRecord.meeting_link,
        classSchedule: classScheduleLabel(classRecord.schedule),
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        joinedAt: enrollment.sessionJoinClicks[lesson.id],
        attendanceStatus: enrollment.attendance[lesson.id],
      }))
  })

  return <ScheduleCalendar
    title="Class calendar"
    description="See every upcoming live session from your enrolled classes in one place."
    sessions={sessions}
    now={now}
    emptyTitle="No upcoming live sessions"
    emptyDescription="Your scheduled live lessons will appear here once they are added to an enrolled class."
    onJoin={onJoin}
  />
}

const WeakAreasPanel: FC<{ enrollments: Array<Pick<DashboardEnrollment, 'id' | 'item_id' | 'weakAreas'> & Partial<Pick<DashboardEnrollment, 'course' | 'classRecord' | 'quizResults'>>>; onOpenCourse: (courseId: number, lessonId?: number) => void }> = ({ enrollments, onOpenCourse }) => {
  const areas = enrollments.flatMap((enrollment) => enrollment.weakAreas.map((area) => ({ enrollment, area })))
  const failedQuizzes = enrollments.flatMap((enrollment) => {
    const course = enrollment.course ?? enrollment.classRecord?.course
    if (!course || !enrollment.quizResults) return []
    return getLessons(course).flatMap((lesson) => {
      const result = enrollment.quizResults?.[lesson.id]
      return lesson.type === 'quiz' && result && !result.passed ? [{ enrollment, course, lesson, result }] : []
    })
  })
  const trackedTopicCount = enrollments.reduce((count, enrollment) => {
    const course = enrollment.course ?? enrollment.classRecord?.course
    const topics = new Set(course?.modules.flatMap((module) => module.lessons.flatMap((lesson) => [
      ...(lesson.quizQuestions ?? []).map((question) => question.topic),
      ...(lesson.practiceQuestions ?? []).map((question) => question.topic),
    ])).filter((topic): topic is string => Boolean(topic?.trim())).map((topic) => topic.trim().toLocaleLowerCase()) ?? [])
    return count + topics.size
  }, 0)
  const weakShare = areas.length ? Math.round((areas.length / Math.max(trackedTopicCount, areas.length)) * 100) : 0
  const needsImprovement = areas.length > 0 || failedQuizzes.length > 0
  const practiceTarget = areas.find(({ area }) => area.practiceLessons[0]) ?? areas[0]
  const practiceNow = () => {
    if (practiceTarget) {
      onOpenCourse(practiceTarget.enrollment.item_id, practiceTarget.area.practiceLessons[0]?.lessonId)
      return
    }
    const failedQuiz = failedQuizzes[0]
    if (failedQuiz) onOpenCourse(failedQuiz.enrollment.item_id, failedQuiz.lesson.id)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.75 }, mb: 3, border: 1, borderColor: 'divider', borderRadius: 3.5, backgroundColor: 'background.paper' }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, flexShrink: 0, borderRadius: '50%', color: 'error.main', backgroundColor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.08) }}><GpsFixedOutlinedIcon /></Box>
        <Box><Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>Weak Topics</Typography><Typography variant="body2" color="text.secondary">Focus more on these areas to improve your score.</Typography></Box>
      </Stack>
      <Chip size="small" icon={<WarningAmberOutlinedIcon />} label={needsImprovement ? 'Needs Improvement' : 'Looking Good'} color={needsImprovement ? 'error' : 'success'} variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700 }} />
    </Stack>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '190px minmax(0, 1fr)' }, gap: { xs: 2.5, md: 3 }, alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: { md: 1 } }}>
        <Box role="img" aria-label={`${areas.length} weak topics`} sx={{ width: 156, height: 156, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', background: (theme) => `conic-gradient(${theme.palette.error.main} ${weakShare}%, ${theme.palette.action.disabledBackground} ${weakShare}% 100%)` }}>
          <Box sx={{ width: 132, height: 132, display: 'grid', placeContent: 'center', justifyItems: 'center', borderRadius: '50%', backgroundColor: 'background.paper' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>{areas.length}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Weak Areas</Typography>
            <Typography variant="caption" color="text.secondary">Below 60% accuracy</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 58px 78px', gap: 1, px: 1, pb: 1, color: 'text.secondary' }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>SUBJECT</Typography>
          <Typography variant="caption" sx={{ textAlign: 'right', fontWeight: 700 }}>SCORE</Typography>
          <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 700 }}>STATUS</Typography>
        </Box>
        <Box sx={{ maxHeight: 300, overflowY: 'auto', overscrollBehavior: 'contain', borderTop: 1, borderColor: 'divider' }}>
          {areas.map(({ enrollment, area }) => <Box key={`${enrollment.id}-${area.topic}`} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 58px 78px', gap: 1, alignItems: 'center', px: 1, py: 1.2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontWeight: 700 }}>{area.topic}</Typography><Typography noWrap variant="caption" color="text.secondary">{area.correct} of {area.total} correct · {enrollment.classRecord?.title ?? enrollment.course?.title ?? 'Enrolled course'}</Typography></Box>
            <Typography sx={{ textAlign: 'right', fontWeight: 800, color: area.accuracy < 30 ? 'error.main' : 'warning.dark' }}>{area.accuracy}%</Typography>
            <Chip size="small" label="Weak" color="warning" sx={{ justifySelf: 'center', height: 25 }} />
          </Box>)}
          {failedQuizzes.map(({ enrollment, course, lesson, result }) => <Box key={`failed-${enrollment.id}-${lesson.id}`} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 58px 78px', gap: 1, alignItems: 'center', px: 1, py: 1.2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontWeight: 700 }}>{lesson.topicTitle ?? lesson.title}</Typography><Typography noWrap variant="caption" color="text.secondary">Quiz to review · {course.title}</Typography></Box>
            <Typography sx={{ textAlign: 'right', fontWeight: 800, color: 'error.main' }}>{result.score}%</Typography>
            <Chip size="small" label="Review" color="error" sx={{ justifySelf: 'center', height: 25 }} />
          </Box>)}
          {!areas.length && !failedQuizzes.length && <Typography color="text.secondary" variant="body2" sx={{ p: 2 }}>No weak areas detected yet. Complete quizzes and practice exercises to see topic-level results here.</Typography>}
        </Box>
      </Box>
    </Box>

    {(practiceTarget || failedQuizzes.length > 0) && <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mt: 2.5, p: 1.5, borderRadius: 2.5, backgroundColor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.12 : 0.05) }}>
      <LightbulbOutlinedIcon color="error" />
      <Typography sx={{ fontWeight: 700, color: 'error.main', whiteSpace: 'nowrap' }}>Study Tip</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>Improve your score by practicing more questions in these topics.</Typography>
      <Button size="small" variant="contained" color="error" onClick={practiceNow} endIcon={<ArrowForwardRoundedIcon />} sx={{ flexShrink: 0 }}>Practice Now</Button>
    </Stack>}
  </Paper>
}

const legacyStudyPlanStorageKey = (classId: number) => `study-plan:${classId}`

const readLegacyStudyPlanOrder = (classId: number): number[] | null => {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(legacyStudyPlanStorageKey(classId)) ?? 'null')
    return Array.isArray(saved) && saved.every((value) => Number.isInteger(value)) ? saved : null
  } catch {
    return null
  }
}

const normalizeTopicName = (value: string) => value.trim().toLowerCase()

const getLinkedQuizLessonIds = (lessons: DashboardLesson[], lesson: DashboardLesson): number[] => {
  if (lesson.type === 'quiz') return [lesson.id]
  const names = [lesson.topicTitle, lesson.title].filter((name): name is string => Boolean(name)).map(normalizeTopicName)
  return lessons
    .filter((candidate) => candidate.type === 'quiz' && (candidate.quizQuestions ?? []).some((question) => question.topic !== undefined && names.includes(normalizeTopicName(question.topic))))
    .map((candidate) => candidate.id)
}

const getPlannerTopics = (course: DashboardCourse, weakAreas: WeakArea[], quizResults: Record<number, DashboardQuizResult>, quizAttempts: MasteryAttempt[], completedLessonIds: number[]): PlannerTopic[] => {
  const completed = new Set(completedLessonIds)
  const lessons = getLessons(course)
  return course.modules.flatMap((module) => module.lessons
    .filter((lesson) => lesson.type !== 'practice')
    .map((lesson) => {
      const names = [lesson.topicTitle, lesson.title].filter((name): name is string => Boolean(name)).map(normalizeTopicName)
      const topicScores = weakAreas.filter((area) => names.includes(normalizeTopicName(area.topic))).map((area) => area.accuracy)
      const quizResult = quizResults[lesson.id]
      const scores = quizResult && !quizResult.passed ? [...topicScores, quizResult.score] : topicScores
      const linkedQuizIds = new Set(getLinkedQuizLessonIds(lessons, lesson))
      const mastery = getLessonMastery({ completed: completed.has(lesson.id), quizAttempts: quizAttempts.filter((attempt) => linkedQuizIds.has(attempt.lessonId)) })
      return { lessonId: lesson.id, title: lesson.title, moduleTitle: module.title, weakScore: scores.length > 0 ? Math.min(...scores) : null, mastery }
    }))
}

const masteryLevels: MasteryLevel[] = ['strong', 'shaky', 'unverified', 'not_started']
const masteryChipColors: Record<MasteryLevel, 'success' | 'warning' | 'info' | 'error'> = { strong: 'success', shaky: 'warning', unverified: 'info', not_started: 'error' }
const masteryDescriptions: Record<MasteryLevel, string> = {
  strong: 'you scored well on the quiz for this topic.',
  shaky: 'you passed, but your score was low or it took a few tries.',
  unverified: 'marked complete, but there’s no quiz for this topic yet, so we can’t confirm how well you know it.',
  not_started: 'you haven’t begun this topic.',
}

const applySavedStudyPlanOrder = (topics: PlannerTopic[], order: number[]) => {
  const topicById = new Map(topics.map((topic) => [topic.lessonId, topic]))
  const orderedIds = new Set(order)
  return [...order.flatMap((lessonId) => topicById.get(lessonId) ?? []), ...topics.filter((topic) => !orderedIds.has(topic.lessonId))]
}

const formatPlanDate = (dateKey: string, today?: string) => dateKey === today ? 'Today' : new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })

const PlannerMessage: FC<{ title: string; description: string }> = ({ title, description }) => <Stack alignItems="center" textAlign="center" spacing={0.5} sx={{ py: 3, px: 2 }}><Typography sx={{ fontWeight: 700 }}>{title}</Typography><Typography variant="body2" color="text.secondary">{description}</Typography></Stack>

const StudyPlannerPanel: FC<{ classRecord: DashboardClass; enrollment: DashboardEnrollment; completedLessonIds: number[]; now: Date; onOpenCourse: (courseId: number, lessonId?: number) => void; onStudyPlanSaved: (enrollmentId: number, lessonOrder: number[]) => void }> = ({ classRecord, enrollment, completedLessonIds, now, onOpenCourse, onStudyPlanSaved }) => {
  const savedOrder = enrollment.studyPlanOrder
  const [isMasteryHelpOpen, setIsMasteryHelpOpen] = useState(false)
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [planSaveError, setPlanSaveError] = useState<string | null>(null)
  const legacyMigrationStarted = useRef(false)
  const today = toDateKey(now)
  const examDate = classRecord.examDate
  const daysUntilExam = examDate ? getDaysBetween(today, examDate) : 0
  const allTopics = classRecord.course ? getPlannerTopics(classRecord.course, enrollment.weakAreas, enrollment.quizResults, enrollment.quizAttempts, completedLessonIds) : []
  const remainingTopics = prioritizePlannerTopics(allTopics)
  const masteredTopics = allTopics.filter((topic) => topic.mastery === 'strong')
  const masteryCounts = countMasteryLevels(allTopics.map((topic) => topic.mastery))
  const canPlan = Boolean(examDate) && daysUntilExam >= 0 && remainingTopics.length > 0

  useEffect(() => {
    const legacyOrder = savedOrder === null && !legacyMigrationStarted.current ? readLegacyStudyPlanOrder(classRecord.id) : null
    if (!legacyOrder) return
    legacyMigrationStarted.current = true
    saveStudyPlan(enrollment.id, legacyOrder)
      .then(({ lessonOrder }) => {
        window.localStorage.removeItem(legacyStudyPlanStorageKey(classRecord.id))
        onStudyPlanSaved(enrollment.id, lessonOrder)
      })
      .catch(() => undefined)
  }, [classRecord.id, enrollment.id, savedOrder, onStudyPlanSaved])

  const createPlan = async () => {
    setIsSavingPlan(true)
    setPlanSaveError(null)
    try {
      const { lessonOrder } = await saveStudyPlan(enrollment.id, remainingTopics.map((topic) => topic.lessonId))
      onStudyPlanSaved(enrollment.id, lessonOrder)
    } catch (error) {
      setPlanSaveError(error instanceof Error ? error.message : 'Unable to save your study plan.')
    } finally {
      setIsSavingPlan(false)
    }
  }

  let content: ReactNode
  if (!examDate) content = <PlannerMessage title="Your tutor hasn't set an exam date yet" description="Your study plan will appear here once an exam date is added to this class." />
  else if (daysUntilExam < 0) content = <PlannerMessage title="Your exam date has passed" description="Check with your tutor if you need a revised schedule." />
  else if (remainingTopics.length === 0) content = <PlannerMessage title="You're all caught up — nothing left to schedule!" description="Every lesson in this class is Mastered." />
  else if (savedOrder === null) content = <PlannerMessage title="Ready when you are" description={`Generate a plan to schedule ${remainingTopics.length} ${remainingTopics.length === 1 ? 'lesson' : 'lessons'} to learn or review before your exam.`} />
  else {
    const plan = buildStudyPlan(applySavedStudyPlanOrder(remainingTopics, savedOrder), today, examDate)
    content = <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}>
      {plan.periods.map((period) => <Box key={period.index} sx={{ p: 1.5, minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{plan.granularity === 'day' ? formatPlanDate(period.startDate, today) : `Week ${period.index + 1} · ${formatPlanDate(period.startDate)} – ${formatPlanDate(period.endDate)}`}</Typography>
        <Stack spacing={0.75} sx={{ mt: 1 }}>{period.topics.map((topic) => <Button key={topic.lessonId} onClick={() => onOpenCourse(classRecord.id, topic.lessonId)} sx={{ justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: 1, px: 1.25, py: 1, borderRadius: 2, textAlign: 'left', border: 1, borderColor: 'divider', borderLeft: 4, borderLeftColor: `${masteryChipColors[topic.mastery]}.main`, backgroundColor: (theme) => alpha(theme.palette[masteryChipColors[topic.mastery]].main, 0.06), color: 'text.primary' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
              <Chip size="small" label={MASTERY_LABELS[topic.mastery].toUpperCase()} color={masteryChipColors[topic.mastery]} sx={{ height: 20, fontSize: 11, fontWeight: 800, flexShrink: 0 }} />
              <Typography noWrap sx={{ fontWeight: 600, minWidth: 0 }}>{topic.mastery === 'not_started' ? 'Learn' : 'Review'}: {topic.title}</Typography>
            </Stack>
            <Typography noWrap variant="caption" color="text.secondary">{topic.moduleTitle}</Typography>
          </Box>
          {topic.weakScore !== null && <Chip size="small" label="Weak" color="warning" />}
        </Button>)}</Stack>
      </Box>)}
    </Box>
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, border: 1, borderColor: 'divider', borderRadius: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, flexShrink: 0, borderRadius: 2.5, color: 'primary.main', backgroundColor: 'action.hover' }}><CalendarTodayOutlinedIcon /></Box>
        <Box><Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>Study Planner</Typography><Typography variant="body2" color="text.secondary">{classRecord.title}</Typography></Box>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        {examDate && daysUntilExam >= 0 && <Chip label={daysUntilExam === 0 ? 'Your exam is today' : `${daysUntilExam} ${daysUntilExam === 1 ? 'day' : 'days'} until your exam`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />}
        {canPlan && <Button variant={savedOrder === null ? 'contained' : 'outlined'} size="small" disabled={isSavingPlan} startIcon={savedOrder === null ? undefined : <RefreshRoundedIcon />} onClick={createPlan} sx={{ borderRadius: 2, fontWeight: 700 }}>{savedOrder === null ? 'Generate Plan' : 'Regenerate Plan'}</Button>}
      </Stack>
    </Stack>
    {allTopics.length > 0 && <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {masteryLevels.map((level) => <Chip key={level} size="small" variant="outlined" color={masteryChipColors[level]} label={`${MASTERY_LABELS[level]}: ${masteryCounts[level]} ${masteryCounts[level] === 1 ? 'topic' : 'topics'}`} sx={{ fontWeight: 700 }} />)}
      <Tooltip arrow placement="top" open={isMasteryHelpOpen} onOpen={() => setIsMasteryHelpOpen(true)} onClose={() => setIsMasteryHelpOpen(false)} title={<Stack spacing={0.75} sx={{ p: 0.5 }}>{masteryLevels.map((level) => <Typography key={level} variant="body2"><b>{MASTERY_LABELS[level]}:</b> {masteryDescriptions[level]}</Typography>)}</Stack>}>
        <IconButton size="small" aria-label="What do the mastery labels mean?" onClick={() => setIsMasteryHelpOpen((open) => !open)} sx={{ color: 'text.secondary' }}><InfoOutlinedIcon fontSize="small" /></IconButton>
      </Tooltip>
    </Stack>}
    {planSaveError && <Alert severity="error" sx={{ mb: 2 }}>{planSaveError}</Alert>}
    {content}
    {masteredTopics.length > 0 && <Box sx={{ mt: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Mastered</Typography>
      <Stack spacing={0.75}>{masteredTopics.map((topic) => <Button key={topic.lessonId} onClick={() => onOpenCourse(classRecord.id, topic.lessonId)} sx={{ justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: 1, px: 1.25, py: 1, borderRadius: 2, textAlign: 'left', border: 1, borderColor: 'divider', borderLeft: 4, borderLeftColor: 'success.main', backgroundColor: (theme) => alpha(theme.palette.success.main, 0.06), color: 'text.primary' }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            <Chip size="small" label={MASTERY_LABELS.strong.toUpperCase()} color="success" sx={{ height: 20, fontSize: 11, fontWeight: 800, flexShrink: 0 }} />
            <Typography noWrap sx={{ fontWeight: 600, minWidth: 0 }}>{topic.title}</Typography>
          </Stack>
          <Typography noWrap variant="caption" color="text.secondary">{topic.moduleTitle}</Typography>
        </Box>
      </Button>)}</Stack>
    </Box>}
  </Paper>
}

const readinessTierColors: Record<ReadinessTier, 'success' | 'warning' | 'error'> = { on_track: 'success', needs_work: 'warning', at_risk: 'error' }

const ExamReadinessCard: FC<{ classRecord: DashboardClass; readiness: ExamReadiness; daysUntilExam: number; onViewStudyPlan: () => void }> = ({ classRecord, readiness, daysUntilExam, onViewStudyPlan }) => {
  const color = readinessTierColors[readiness.tier]
  const breakdown = masteryLevels.map((level) => `${readiness.counts[level]} ${MASTERY_LABELS[level]}`).join(' · ')
  return <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: `${color}.main`, borderLeft: 4, borderRadius: 3.5 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.2, lineHeight: 1.5 }}>Exam readiness · {classRecord.title}</Typography>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexWrap: 'wrap', mt: 0.5 }}>
          <Chip label={READINESS_TIER_LABELS[readiness.tier]} color={color} sx={{ fontWeight: 800 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.03em' }}>Estimated readiness: {readiness.percentage}%</Typography>
        </Stack>
      </Box>
      <Stack spacing={0.5} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} sx={{ flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary">{daysUntilExam === 0 ? 'Your exam is today' : `${daysUntilExam} ${daysUntilExam === 1 ? 'day' : 'days'} until your exam`}</Typography>
        <Button variant="outlined" endIcon={<ArrowForwardRoundedIcon />} onClick={onViewStudyPlan} sx={{ borderRadius: 2.5 }}>View Study Plan</Button>
      </Stack>
    </Stack>
    <Typography variant="body2" sx={{ mt: 1.75, fontWeight: 600 }}>{breakdown}</Typography>
    <Typography variant="caption" color="text.secondary">Estimated based on your quiz scores and topics covered so far</Typography>
  </Paper>
}

const StudyPlannerView: FC<{ enrollments: DashboardEnrollment[]; completedLessons: Record<number, number[]>; now: Date; onOpenCourse: (courseId: number, lessonId?: number) => void; onStudyPlanSaved: (enrollmentId: number, lessonOrder: number[]) => void }> = ({ enrollments, completedLessons, now, onOpenCourse, onStudyPlanSaved }) => {
  const studyPlanners = enrollments.flatMap((enrollment) => {
    const classRecord = enrollment.classRecord
    return enrollment.type === 'class' && classRecord?.programId === 'ministry-exam-prep' ? [{ enrollment, classRecord }] : []
  })
  if (studyPlanners.length === 0) return <PlannerMessage title="No study planner yet" description="Study planners appear here for your enrolled Ministry Exam Prep classes." />
  return <Stack spacing={2.5}>
    {studyPlanners.map(({ enrollment, classRecord }) => <StudyPlannerPanel key={classRecord.id} classRecord={classRecord} enrollment={enrollment} completedLessonIds={completedLessons[enrollment.item_id] ?? []} now={now} onOpenCourse={onOpenCourse} onStudyPlanSaved={onStudyPlanSaved} />)}
  </Stack>
}

const OverviewView: FC<{ enrollments: DashboardEnrollment[]; completedLessons: Record<number, number[]>; now: Date; onSelectView: (view: DashboardView) => void; onOpenCourse: (courseId: number, lessonId?: number) => void; gamificationData: GamificationData }> = ({ enrollments, completedLessons, now, onSelectView, onOpenCourse, gamificationData }) => {
  const courseEnrollments = enrollments.filter((enrollment) => enrollment.type === 'course' && enrollment.status !== 'completed')
  const classEnrollments = enrollments.filter((enrollment) => enrollment.type === 'class' && enrollment.status !== 'completed' && enrollment.classRecord?.course)
  const courses = courseEnrollments.flatMap((enrollment) => enrollment.course ? [{
    id: enrollment.course.id,
    title: enrollment.course.title,
    category: enrollment.course.category,
    level: enrollment.course.level,
    tutor: enrollment.course.tutor,
    progress: enrollment.progress,
  }] : [])
  const classes = classEnrollments.flatMap((enrollment) => enrollment.classRecord ? [{
    id: enrollment.classRecord.id,
    title: enrollment.classRecord.title,
    category: enrollment.classRecord.course!.category,
    level: enrollment.classRecord.course!.level,
    tutor: enrollment.classRecord.tutorName,
    progress: enrollment.progress,
  }] : [])
  const latestQuizResults = courseEnrollments.flatMap((enrollment) => {
    if (!enrollment.course) return []
    return getLessons(enrollment.course).flatMap((lesson) => {
      const result = enrollment.quizResults[lesson.id]
      return lesson.type === 'quiz' && result ? [{ ...result, passThreshold: Number.isInteger(lesson.passThreshold) ? lesson.passThreshold! : 70 }] : []
    })
  })
  const latestQuizScores = latestQuizResults.map((result) => result.score)
  const quizCount = latestQuizScores.length
  const averageQuizScore = quizCount ? Math.round(latestQuizScores.reduce((total, score) => total + score, 0) / quizCount) : null
  const averagePassThreshold = quizCount ? latestQuizResults.reduce((total, result) => total + result.passThreshold, 0) / quizCount : null
  const quizAverageNeedsAttention = latestQuizResults.some((result) => !result.passed) || (averageQuizScore !== null && averagePassThreshold !== null && averageQuizScore < averagePassThreshold)
  const pendingCount = enrollments.filter((enrollment) => enrollment.type === 'class' && enrollment.status === 'pending_schedule').length
  const nextSession = enrollments
    .filter((enrollment) => enrollment.type === 'class' && enrollment.status === 'active' && enrollment.classRecord?.status === 'open')
    .flatMap((enrollment) => {
      const classRecord = enrollment.classRecord
      if (!classRecord?.course) return []
      return getLessons(classRecord.course)
        .filter((lesson) => lesson.type === 'live' && lesson.scheduledAt && new Date(lesson.scheduledAt).getTime() > now.getTime())
        .map((lesson) => ({ lesson, classRecord }))
    })
    .sort((first, second) => new Date(first.lesson.scheduledAt!).getTime() - new Date(second.lesson.scheduledAt!).getTime())[0]
  const today = toDateKey(now)
  const readinessCards = enrollments.flatMap((enrollment) => {
    const classRecord = enrollment.classRecord
    if (enrollment.type !== 'class' || classRecord?.programId !== 'ministry-exam-prep' || !classRecord.examDate || !classRecord.course) return []
    const daysUntilExam = getDaysBetween(today, classRecord.examDate)
    if (daysUntilExam < 0) return []
    const topics = getPlannerTopics(classRecord.course, enrollment.weakAreas, enrollment.quizResults, enrollment.quizAttempts, completedLessons[enrollment.item_id] ?? [])
    const readiness = getExamReadiness(topics.map((topic) => topic.mastery), daysUntilExam)
    return readiness ? [{ classRecord, readiness, daysUntilExam }] : []
  })
  const displayName = getAuthenticatedUser()?.name?.split(' ')[0] || 'Learner'
  return <StudentDashboardOverview
    displayName={displayName}
    courses={courses}
    classes={classes}
    lessonCount={gamificationData.stats.lesson_count}
    averageQuizScore={averageQuizScore}
    quizCount={quizCount}
    quizAverageNeedsAttention={quizAverageNeedsAttention}
    learningStreak={gamificationData.stats.current_streak}
    enrollmentCount={enrollments.filter((enrollment) => enrollment.type === 'course' || enrollment.type === 'class').length}
    session={nextSession ? { title: nextSession.lesson.title, courseTitle: nextSession.classRecord.course?.title ?? nextSession.classRecord.title, startsAt: nextSession.lesson.scheduledAt! } : undefined}
    readiness={readinessCards.length > 0 ? <Stack spacing={2.25} sx={{ mb: 2.25 }}>
      {readinessCards.map(({ classRecord, readiness, daysUntilExam }) => <ExamReadinessCard key={classRecord.id} classRecord={classRecord} readiness={readiness} daysUntilExam={daysUntilExam} onViewStudyPlan={() => onSelectView('study-planner')} />)}
    </Stack> : undefined}
    onOpenCourse={(courseId) => onOpenCourse(courseId)}
    onOpenClass={(classId) => onOpenCourse(classId)}
    onSelectView={onSelectView}
  >
    <WeakAreasPanel enrollments={enrollments} onOpenCourse={onOpenCourse} />
    <GamificationWidgets data={gamificationData} />
    {pendingCount > 0 && <Alert severity="info" icon={<CalendarTodayOutlinedIcon />} action={<Button color="inherit" size="small" onClick={() => onSelectView('classes')}>View classes</Button>} sx={{ mt: 2.25, borderRadius: 3 }}>You have {pendingCount} class {pendingCount === 1 ? 'enrollment' : 'enrollments'} awaiting scheduling.</Alert>}
  </StudentDashboardOverview>
}

const CourseMiniRow: FC<{ course: DashboardCourse; enrollment: DashboardEnrollment; onOpenCourse: (courseId: number) => void }> = ({ course, enrollment, onOpenCourse }) => <Box component="button" type="button" onClick={() => onOpenCourse(course.id)} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper', cursor: 'pointer', textAlign: 'left', font: 'inherit', '&:hover': { borderColor: 'primary.main' } }}><Box sx={{ display: 'flex', p: 1, borderRadius: 2, color: 'primary.main', backgroundColor: 'action.hover' }}><PlayCircleOutlineIcon /></Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ fontWeight: 600 }}>{course.title}</Typography><LinearProgress variant="determinate" value={enrollment.progress} sx={{ mt: 1, height: 6, borderRadius: 4 }} /></Box><Typography color="primary.main" variant="body2" sx={{ fontWeight: 700 }}>{enrollment.progress}%</Typography></Box>

const EnrolledCourseCard: FC<{ enrollment: DashboardEnrollment; course: DashboardCourse; progress: number; grade: ReturnType<typeof getEnrollmentOverallGrade>; onContinue: () => void }> = ({ enrollment, course, progress, grade, onContinue }) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const completionStatus = progress === 100 ? 'Completed' : progress > 0 ? 'In progress' : 'Not started'
  const objectives = (course.learningOutcomes ?? []).filter((objective) => objective.trim()).slice(0, 4)
  const durationSeconds = course.durationSeconds ?? 0
  const lastActivity = enrollment.lastActivityAt ? new Date(enrollment.lastActivityAt) : null
  const showLastActivity = lastActivity !== null && Number.isFinite(lastActivity.getTime())
  const openDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    setDetailsOpen(true)
  }
  const delayCloseDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setDetailsOpen(false), 180)
  }
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null
    if (nextTarget && (cardRef.current?.contains(nextTarget) || panelRef.current?.contains(nextTarget))) return
    setDetailsOpen(false)
  }

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  return <>
    <Card
      ref={cardRef}
      component="article"
      onMouseEnter={openDetails}
      onMouseLeave={delayCloseDetails}
      onFocus={openDetails}
      onBlur={handleBlur}
      onClick={(event) => { if (!(event.target as HTMLElement).closest('button, a')) setDetailsOpen((current) => !current) }}
      aria-describedby={detailsOpen ? `course-details-${course.id}` : undefined}
      sx={{ position: 'relative', overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper', boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.06)}`, transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease', '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.light', boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}` }, '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)}, ${alpha(theme.palette.info.main, 0.14)})` }}>
        {course.cover ? <Box component="img" src={course.cover} alt={`${course.title} thumbnail`} sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} /> : <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'primary.main' }}><MenuBookOutlinedIcon sx={{ fontSize: 46, opacity: 0.8 }} /></Box>}
      </Box>
      <CardContent sx={{ p: 1.75, display: 'flex', flex: 1, flexDirection: 'column', '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.9 }}>
          <Chip label={course.category} size="small" sx={{ height: 23, borderRadius: 1.5, fontSize: 11, fontWeight: 800, color: 'primary.dark', backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.09) }} />
          <Chip size="small" label={grade.letter} color={grade.letter === 'F' ? 'error' : grade.letter === 'D' ? 'warning' : 'success'} sx={{ height: 23, fontWeight: 800 }} />
        </Stack>
        <Typography variant="subtitle1" sx={{ minHeight: 48, mb: 0.5, fontWeight: 800, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.2 }}>Instructor: {course.tutor}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.55 }}><Typography variant="caption" sx={{ fontWeight: 700 }}>Progress</Typography><Typography variant="caption" sx={{ fontWeight: 800, color: 'success.dark' }}>{progress}%</Typography></Stack>
        <LinearProgress variant="determinate" value={progress} color="success" aria-label={`${course.title} progress ${progress}%`} sx={{ height: 6, borderRadius: 4, mb: 1.5, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
        <IconButton onClick={() => setDetailsOpen((current) => !current)} aria-label={`${detailsOpen ? 'Hide' : 'Show'} details for ${course.title}`} aria-expanded={detailsOpen} size="small" sx={{ position: 'absolute', left: 8, top: 8, color: 'common.white', backgroundColor: (theme) => alpha(theme.palette.common.black, 0.48), '&:hover': { backgroundColor: (theme) => alpha(theme.palette.common.black, 0.65) } }}><InfoOutlinedIcon fontSize="small" /></IconButton>
      </CardContent>
    </Card>
    <Popper
      id={`course-details-${course.id}`}
      open={detailsOpen}
      anchorEl={cardRef.current}
      placement={isMobile ? 'bottom-start' : 'right-start'}
      modifiers={[{ name: 'offset', options: { offset: [0, 12] } }, { name: 'flip', options: { fallbackPlacements: ['left-start', 'top-start', 'bottom-start'] } }, { name: 'preventOverflow', options: { boundary: 'viewport', padding: 12 } }]}
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
    >
      <Paper ref={panelRef} onMouseEnter={openDetails} onMouseLeave={delayCloseDetails} onFocus={openDetails} onBlur={handleBlur} elevation={8} sx={{ width: 340, maxWidth: 'min(340px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto', p: 2.25, border: 1, borderColor: 'divider', borderRadius: 3, color: 'text.primary', backgroundColor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 800, lineHeight: 1.25 }}>{course.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>Instructor: {course.tutor}</Typography>
        {(course.level && course.level !== 'Not specified' || durationSeconds > 0 || showLastActivity) && <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 1.5 }}>
          {course.level && course.level !== 'Not specified' && <Chip size="small" label={course.level} variant="outlined" />}
          {durationSeconds > 0 && <Chip size="small" label={formatDuration(durationSeconds)} variant="outlined" />}
          {showLastActivity && <Chip size="small" label={`Last active ${lastActivity!.toLocaleDateString()}`} variant="outlined" />}
        </Stack>}
        <Chip size="small" label={completionStatus} color={progress === 100 ? 'success' : 'primary'} sx={{ mb: 1.5 }} />
        {course.description?.trim() && <Typography variant="body2" color="text.secondary" sx={{ mb: objectives.length ? 1.5 : 2, whiteSpace: 'pre-line' }}>{course.description}</Typography>}
        {objectives.length > 0 && <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 800 }}>What you&apos;ll learn</Typography>
          <Stack spacing={0.75}>{objectives.map((objective) => <Stack key={objective} direction="row" spacing={0.75} alignItems="flex-start"><CheckCircleOutlineIcon sx={{ mt: '2px', flexShrink: 0, fontSize: 17, color: 'success.main' }} /><Typography variant="body2" color="text.secondary">{objective}</Typography></Stack>)}</Stack>
        </Box>}
        <Button fullWidth variant="contained" onClick={onContinue} sx={{ minHeight: 42, borderRadius: 2, fontWeight: 800, backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}>Continue Course</Button>
      </Paper>
    </Popper>
  </>
}

const CoursesView: FC<{ enrollments: DashboardEnrollment[]; completedLessons: Record<number, number[]>; onOpenCourse: (courseId: number) => void }> = ({ enrollments, completedLessons, onOpenCourse }) => {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const courseEnrollments = enrollments.filter((enrollment) => enrollment.type === 'course' && enrollment.course)
  const categories = Array.from(new Set(courseEnrollments.map((enrollment) => enrollment.course!.category)))
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredCourseEnrollments = courseEnrollments.filter(({ course }) => {
    const matchesSearch = !normalizedQuery || [course!.title, course!.category, course!.tutor].some((value) => value.toLowerCase().includes(normalizedQuery))
    return matchesSearch && (categoryFilter === 'all' || course!.category === categoryFilter)
  })
  const pageCount = Math.ceil(filteredCourseEnrollments.length / catalogPageSize)
  const visibleCourseEnrollments = filteredCourseEnrollments.slice((page - 1) * catalogPageSize, page * catalogPageSize)

  useEffect(() => setPage(1), [courseEnrollments.length, normalizedQuery, categoryFilter])

  return <>
    <ViewHeading title="My Courses" description="Build momentum with the self-paced courses in your learning plan." compact action={<Button variant="outlined" startIcon={<MenuBookOutlinedIcon />} onClick={() => navigateTo('/explore-courses')}>Explore courses</Button>} />
    {courseEnrollments.length === 0 ? <EmptyState title="No courses yet" description="Your paid course enrollments will appear here." /> : <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2.5 }}>
        <TextField size="small" placeholder="Search my courses..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} inputProps={{ 'aria-label': 'Search my courses' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ flex: 1, minWidth: 0, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        <TextField select size="small" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} inputProps={{ 'aria-label': 'Filter my courses by category' }} InputProps={{ startAdornment: <InputAdornment position="start"><LayersOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ minWidth: { md: 180 }, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
          <MenuItem value="all">All categories</MenuItem>
          {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: { md: 'auto' } }}>{filteredCourseEnrollments.length} {filteredCourseEnrollments.length === 1 ? 'course' : 'courses'} found</Typography>
      </Stack>
      {filteredCourseEnrollments.length === 0 ? <EmptyState title="No matching courses" description="Try a different search term or category." /> : <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 2 }, alignItems: 'stretch', bgcolor: 'transparent', p: 0, boxShadow: 'none' }}>
      {visibleCourseEnrollments.map((enrollment) => {
        const course = enrollment.course!
        const completed = completedLessons[course.id]
        const progress = completed === undefined ? enrollment.progress : getCourseProgress(course, completed)
        const grade = getEnrollmentOverallGrade(enrollment, progress)
        return <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} course={course} progress={progress} grade={grade} onContinue={() => onOpenCourse(course.id)} />
      })}
      </Box>
      {pageCount > 1 && <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={pageCount} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" aria-label="My courses pages" /></Stack>}
      </>}
    </>}
  </>
}

const EnrolledClassCard: FC<{ enrollment: DashboardEnrollment; classRecord: DashboardClass; course: DashboardCourse; now: Date; progress: number; grade: ReturnType<typeof getEnrollmentOverallGrade>; rank?: number; nextLiveLesson?: DashboardLesson; canOpenClass: boolean; onContinue: () => void }> = ({ enrollment, classRecord, course, now, progress, grade, rank, nextLiveLesson, canOpenClass, onContinue }) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const detailsId = `class-details-${enrollment.id}`
  const objectives = Array.isArray(course.learningOutcomes) ? course.learningOutcomes.filter((outcome) => typeof outcome === 'string' && outcome.trim()).slice(0, 4) : []
  const liveSessionAt = nextLiveLesson?.scheduledAt ? new Date(nextLiveLesson.scheduledAt) : null
  const openDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    setDetailsOpen(true)
  }
  const delayCloseDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setDetailsOpen(false), 180)
  }
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null
    if (nextTarget && (cardRef.current?.contains(nextTarget) || panelRef.current?.contains(nextTarget))) return
    setDetailsOpen(false)
  }

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  return <>
    <Card
      ref={cardRef}
      component="article"
      onMouseEnter={openDetails}
      onMouseLeave={delayCloseDetails}
      onFocus={openDetails}
      onBlur={handleBlur}
      onClick={(event) => { if (!(event.target as HTMLElement).closest('button, a')) setDetailsOpen((current) => !current) }}
      aria-describedby={detailsOpen ? detailsId : undefined}
      sx={{ position: 'relative', overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper', boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.06)}`, transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease', '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.light', boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}` }, '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)}, ${alpha(theme.palette.info.main, 0.14)})` }}>
        {course.cover ? <Box component="img" src={course.cover} alt={`${classRecord.title} thumbnail`} sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} /> : <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'primary.main' }}><ClassOutlinedIcon sx={{ fontSize: 46, opacity: 0.8 }} /></Box>}
        <Chip label={classRecord.status === 'pending_schedule' ? 'Pending schedule' : classHasEnded(classRecord.schedule, now) || classRecord.status === 'closed' ? 'Closed' : 'Active class'} size="small" color={canOpenClass ? 'success' : 'warning'} sx={{ position: 'absolute', left: 9, top: 9, height: 24, fontWeight: 700 }} />
      </Box>
      <CardContent sx={{ p: 1.75, display: 'flex', flex: 1, flexDirection: 'column', '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.9 }}>
          <Chip label={course.category || 'Live class'} size="small" sx={{ height: 23, borderRadius: 1.5, fontSize: 11, fontWeight: 800, color: 'primary.dark', backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.09) }} />
          <ClassRankValue rank={rank} />
        </Stack>
        <Typography variant="subtitle1" sx={{ minHeight: 48, mb: 0.5, fontWeight: 800, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{classRecord.title}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>Tutor: {classRecord.tutorName}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.55 }}><Typography variant="caption" sx={{ fontWeight: 700 }}>Progress</Typography><Typography variant="caption" sx={{ fontWeight: 800, color: 'success.dark' }}>{progress}%</Typography></Stack>
        <LinearProgress variant="determinate" value={progress} color="success" aria-label={`${classRecord.title} progress ${progress}%`} sx={{ height: 6, borderRadius: 4, mb: 1.5, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
        <IconButton onClick={() => setDetailsOpen((current) => !current)} aria-label={`${detailsOpen ? 'Hide' : 'Show'} details for ${classRecord.title}`} aria-expanded={detailsOpen} size="small" sx={{ position: 'absolute', left: 8, top: 8, color: 'common.white', backgroundColor: (theme) => alpha(theme.palette.common.black, 0.48), '&:hover': { backgroundColor: (theme) => alpha(theme.palette.common.black, 0.65) } }}><InfoOutlinedIcon fontSize="small" /></IconButton>
      </CardContent>
    </Card>
    <Popper id={detailsId} open={detailsOpen} anchorEl={cardRef.current} placement={isMobile ? 'bottom-start' : 'right-start'} modifiers={[{ name: 'offset', options: { offset: [0, 12] } }, { name: 'flip', options: { fallbackPlacements: ['left-start', 'top-start', 'bottom-start'] } }, { name: 'preventOverflow', options: { boundary: 'viewport', padding: 12 } }]} sx={{ zIndex: (theme) => theme.zIndex.modal }}>
      <Paper ref={panelRef} onMouseEnter={openDetails} onMouseLeave={delayCloseDetails} onFocus={openDetails} onBlur={handleBlur} elevation={8} sx={{ width: 340, maxWidth: 'min(340px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto', p: 2.25, border: 1, borderColor: 'divider', borderRadius: 3, color: 'text.primary', backgroundColor: 'background.paper' }}>
        <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 800, lineHeight: 1.25 }}>{classRecord.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>Tutor: {classRecord.tutorName}</Typography>
        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 1.5 }}>
          <Chip size="small" label={classScheduleLabel(classRecord.schedule)} variant="outlined" />
          <Chip size="small" label={classRecord.status === 'pending_schedule' ? 'Pending schedule' : classHasEnded(classRecord.schedule, now) || classRecord.status === 'closed' ? 'Closed' : 'Active'} variant="outlined" />
          {classRecord.schedule.duration > 0 && <Chip size="small" label={formatDuration(classRecord.schedule.duration * 60)} variant="outlined" />}
          {liveSessionAt && Number.isFinite(liveSessionAt.getTime()) && <Chip size="small" label={`Next session ${liveSessionAt.toLocaleDateString()}`} variant="outlined" />}
        </Stack>
        <OverallGradeValue grade={grade} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, mb: objectives.length ? 1.5 : 2, whiteSpace: 'pre-line' }}>{course.description?.trim() || `${course.modules.length} modules · ${getLessons(course).length} lessons in the class curriculum.`}</Typography>
        {objectives.length > 0 && <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 800 }}>What you&apos;ll learn</Typography>
          <Stack spacing={0.75}>{objectives.map((objective) => <Stack key={objective} direction="row" spacing={0.75} alignItems="flex-start"><CheckCircleOutlineIcon sx={{ mt: '2px', flexShrink: 0, fontSize: 17, color: 'success.main' }} /><Typography variant="body2" color="text.secondary">{objective}</Typography></Stack>)}</Stack>
        </Box>}
        <Button fullWidth variant="contained" disabled={!canOpenClass} onClick={onContinue} sx={{ minHeight: 42, borderRadius: 2, fontWeight: 800 }}>Continue class</Button>
      </Paper>
    </Popper>
  </>
}

const ClassesView: FC<{ enrollments: DashboardEnrollment[]; completedLessons: Record<number, number[]>; now: Date; onOpenCourse: (courseId: number) => void; gamificationData: GamificationData | null }> = ({ enrollments, completedLessons, now, onOpenCourse, gamificationData }) => {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const classEnrollments = enrollments.filter((enrollment, index) => enrollment.type === 'class' && enrollment.classRecord && enrollments.findIndex((other) => other.type === 'class' && other.classRecord?.id === enrollment.classRecord?.id) === index)
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredClassEnrollments = classEnrollments.filter((enrollment) => {
    const classRecord = enrollment.classRecord!
    const matchesSearch = !normalizedQuery || [classRecord.title, classRecord.tutorName].some((value) => value.toLowerCase().includes(normalizedQuery))
    const classEnded = classHasEnded(classRecord.schedule, now)
    const status = classRecord.status === 'pending_schedule' ? 'pending' : classEnded || classRecord.status === 'closed' ? 'closed' : 'active'
    return matchesSearch && (statusFilter === 'all' || statusFilter === status)
  })
  const pageCount = Math.ceil(filteredClassEnrollments.length / catalogPageSize)
  const visibleClassEnrollments = filteredClassEnrollments.slice((page - 1) * catalogPageSize, page * catalogPageSize)

  useEffect(() => setPage(1), [classEnrollments.length, normalizedQuery, statusFilter])

  return <>
    <ViewHeading title="My Classes" description="Continue your class curriculum and keep up with live learning sessions." action={<Button variant="outlined" startIcon={<ClassOutlinedIcon />} onClick={() => navigateTo('/explore-classes')}>Explore classes</Button>} />
    {classEnrollments.length === 0 ? <EmptyState title="No classes yet" description="Paid class enrollments will appear here once they are assigned." /> : <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2.5 }}>
        <TextField size="small" placeholder="Search my classes..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} inputProps={{ 'aria-label': 'Search my classes' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ flex: 1, minWidth: 0, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        <TextField select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} inputProps={{ 'aria-label': 'Filter my classes by status' }} sx={{ minWidth: { md: 180 }, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
          <MenuItem value="all">All statuses</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="pending">Pending schedule</MenuItem><MenuItem value="closed">Closed</MenuItem>
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: { md: 'auto' } }}>{filteredClassEnrollments.length} {filteredClassEnrollments.length === 1 ? 'class' : 'classes'} found</Typography>
      </Stack>
      {filteredClassEnrollments.length === 0 ? <EmptyState title="No matching classes" description="Try a different search term or status." /> : <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.5, md: 2 }, alignItems: 'stretch' }}>{visibleClassEnrollments.map((enrollment) => {
      const classRecord = enrollment.classRecord!
      const course = classRecord.course!
      const classEnded = classHasEnded(classRecord.schedule, now)
      const canOpenClass = classRecord.status !== 'closed' && classRecord.status !== 'pending_schedule' && !classEnded
      const completed = completedLessons[course.id]
      const progress = completed === undefined ? enrollment.progress : getCourseProgress(course, completed)
      const classRank = getClassRank(gamificationData, classRecord.id)
      const nextLiveLesson = getLessons(course).find((lesson) => lesson.type === 'live' && lesson.scheduledAt && new Date(lesson.scheduledAt).getTime() >= now.getTime())
      return <EnrolledClassCard key={enrollment.id} enrollment={enrollment} classRecord={classRecord} course={course} now={now} progress={progress} grade={getEnrollmentOverallGrade(enrollment, progress, now)} rank={classRank} nextLiveLesson={nextLiveLesson} canOpenClass={canOpenClass} onContinue={() => { if (canOpenClass) onOpenCourse(course.id) }} />
    })}</Box>
      {pageCount > 1 && <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={pageCount} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" aria-label="My classes pages" /></Stack>}
      </>}
    </>}
  </>
}

const ClassCard: FC<{ classRecord: DashboardClass; now: Date; onOpenCourse: (courseId: number) => void }> = ({ classRecord, now, onOpenCourse }) => {
  const hasStarted = classHasStarted(classRecord.schedule, now)
  const classEnded = classHasEnded(classRecord.schedule, now)
  const sessionState = getClassSessionState(classRecord, now)
  const hasLiveLessons = classRecord.course?.modules.some((module) => module.lessons.some((lesson) => lesson.type === 'live')) === true
  const isJoinable = classRecord.status === 'open' && !classEnded && Boolean(sessionState.activeLesson?.meetingUrl)
  const statusLabel = classRecord.status === 'pending_schedule' ? 'Pending schedule' : classEnded || classRecord.status === 'closed' ? 'Closed' : classRecord.status === 'open' ? hasStarted ? 'Scheduled' : classRecord.schedule.startDate ? `Starts ${formatClassStartDate(classRecord.schedule)}` : 'Start date not set' : classRecord.status === 'full' ? 'Full' : 'Closed'
  const statusColor = classRecord.status === 'pending_schedule' || classRecord.status === 'full' || (classRecord.status === 'open' && !hasStarted) ? 'warning' : classRecord.status === 'open' ? 'success' : 'error'
  const linkedCourse = classRecord.course
  return <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
    <CardContent>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}><Box sx={{ display: 'flex', alignSelf: 'flex-start', p: 1.25, borderRadius: 2, color: 'primary.main', backgroundColor: 'action.hover' }}><ClassOutlinedIcon /></Box><Box><Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap"><Typography variant="h6">{classRecord.title}</Typography><Chip label={statusLabel} size="small" color={statusColor} /></Stack>{classRecord.status === 'pending_schedule' ? <Typography color="text.secondary" sx={{ mt: 0.75 }}>Pending — we&apos;ll contact you to schedule your class.</Typography> : <><Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>{classScheduleLabel(classRecord.schedule)}</Typography><Typography color="text.secondary" variant="body2">Tutor: {classRecord.tutorName}</Typography><Typography color="text.secondary" variant="body2">Session duration: {formatDuration(classRecord.schedule.duration * 60)}</Typography>{classRecord.status === 'open' && <Typography color="text.secondary" variant="body2">{classRecord.schedule.startDate ? `Starts ${formatClassStartDate(classRecord.schedule)}` : 'Start date not set'}</Typography>}</>}</Box></Box>
        {classRecord.status === 'open' && !classEnded && <Button variant="contained" component="a" target="_blank" rel="noopener noreferrer" href={isJoinable ? sessionState.activeLesson?.meetingUrl : undefined} disabled={!isJoinable} aria-disabled={!isJoinable} onClick={(event) => { if (!isJoinable) event.preventDefault() }} startIcon={<VideoCallOutlinedIcon />} sx={{ flexShrink: 0 }}>{isJoinable ? 'Join live session' : sessionState.hasEnded ? 'Session Ended' : 'Available at scheduled time'}</Button>}
      </Stack>
      {linkedCourse && <><Divider sx={{ my: 2 }} /><Button variant="text" size="small" startIcon={<MenuBookOutlinedIcon />} onClick={() => onOpenCourse(linkedCourse.id)}>View {linkedCourse.title} curriculum summary</Button></>}
    </CardContent>
  </Card>
}

const QuizzesView: FC<{ enrollments: DashboardEnrollment[]; completedLessons: Record<number, number[]>; quizResults: Record<number, Record<number, DashboardQuizResult>>; now: Date; onOpenCourse: (courseId: number, lessonId?: number, readOnly?: boolean) => void }> = ({ enrollments, completedLessons, quizResults, now, onOpenCourse }) => {
  const enrolledQuizzes = enrollments.flatMap((enrollment) => {
    const course = enrollment.type === 'course' ? enrollment.course : enrollment.classRecord?.course
    if (!course) return []
    const source = enrollment.type === 'class' ? `Class: ${enrollment.classRecord?.title ?? course.title}` : `Course: ${course.title}`
    const lessons = getLessons(course)
    const isQuizAvailable = (lesson: DashboardLesson) => {
      if (enrollment.type === 'class') return true
      const lessonIndex = lessons.findIndex((item) => item.id === lesson.id)
      return lessonIndex === 0 || completedLessons[course.id]?.includes(lessons[lessonIndex - 1].id) === true
    }
    return course.modules.flatMap((module) => module.lessons.filter((lesson) => lesson.type === 'quiz').map((lesson) => { const result = quizResults[course.id]?.[lesson.id]; const scheduledStart = lesson.scheduledAt ? Date.parse(lesson.scheduledAt) : NaN; const scheduledDeadline = Number.isFinite(scheduledStart) ? scheduledStart + getQuizTimeLimitSeconds(lesson.quizQuestions ?? []) * 1000 : NaN; const scheduleExpired = enrollment.type === 'class' && Number.isFinite(scheduledDeadline) && now.getTime() >= scheduledDeadline; const scheduleOpen = enrollment.type !== 'class' || (Number.isFinite(scheduledStart) && now.getTime() >= scheduledStart && !scheduleExpired); const available = isQuizAvailable(lesson) && scheduleOpen; return { enrollmentId: enrollment.id, enrollmentType: enrollment.type, course, lesson, moduleTitle: module.title, source, available, scheduleOpen, scheduleExpired, scheduledStart, scheduledDeadline, completed: (completedLessons[course.id] ?? []).includes(lesson.id), result, finished: (completedLessons[course.id] ?? []).includes(lesson.id) || Boolean(result), retakeAllowed: Boolean(result && !result.passed && (result.retakeApproved || (!result.disqualified && !result.violationCount))) } }))
  })

  const quizPageSize = 6
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const courseOptions = Array.from(new Set(enrolledQuizzes.map(({ source }) => source))).sort()
  const filteredQuizzes = enrolledQuizzes.filter(({ lesson, source, moduleTitle, result, available, finished }) => {
    const matchesSearch = !normalizedQuery || [lesson.title, source, moduleTitle].some((value) => value.toLowerCase().includes(normalizedQuery))
    const matchesCourse = courseFilter === 'all' || source === courseFilter
    const matchesStatus = statusFilter === 'all'
      || statusFilter === 'passed' && result?.passed === true
      || statusFilter === 'failed' && result?.passed === false
      || statusFilter === 'unscored' && finished && !result
      || statusFilter === 'ready' && available && !finished
      || statusFilter === 'locked' && !available && !finished
    return matchesSearch && matchesCourse && matchesStatus
  })
  const pageCount = Math.ceil(filteredQuizzes.length / quizPageSize)
  const visibleQuizzes = filteredQuizzes.slice((page - 1) * quizPageSize, page * quizPageSize)

  useEffect(() => setPage(1), [enrolledQuizzes.length, normalizedQuery, courseFilter, statusFilter])

  return <>
    <ViewHeading title="Quizzes & Results" description="Complete the lesson before each quiz to unlock it, then review your quiz results." />
    {enrolledQuizzes.length === 0 ? <EmptyState title="No quizzes available" description="Quizzes from your enrolled courses and classes will appear here." /> : <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2.5 }}>
        <TextField size="small" placeholder="Search quizzes..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} inputProps={{ 'aria-label': 'Search quizzes and results' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ flex: 1, minWidth: 0, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
        <TextField select size="small" label="Course or class" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} inputProps={{ 'aria-label': 'Filter quizzes by course or class' }} sx={{ minWidth: { md: 220 }, backgroundColor: 'background.paper' }}>
          <MenuItem value="all">All courses & classes</MenuItem>{courseOptions.map((source) => <MenuItem key={source} value={source}>{source}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Result status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} inputProps={{ 'aria-label': 'Filter quizzes by result status' }} sx={{ minWidth: { md: 180 }, backgroundColor: 'background.paper' }}>
          <MenuItem value="all">All statuses</MenuItem><MenuItem value="passed">Passed</MenuItem><MenuItem value="failed">Failed</MenuItem><MenuItem value="unscored">Score unavailable</MenuItem><MenuItem value="ready">Ready to take</MenuItem><MenuItem value="locked">Locked or scheduled</MenuItem>
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}</Typography>
      </Stack>
      {filteredQuizzes.length === 0 ? <EmptyState title="No matching quizzes" description="Try a different search term or filter." /> : <><Stack spacing={2}>{visibleQuizzes.map(({ enrollmentId, enrollmentType, course, lesson, moduleTitle, source, available, scheduleOpen, scheduleExpired, scheduledStart, scheduledDeadline, completed, result, finished, retakeAllowed }) => <Card key={`${enrollmentType}-${enrollmentId}-${course.id}-${lesson.id}`} elevation={0} sx={{ border: 1, borderColor: 'divider' }}><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}><Box sx={{ display: 'flex', gap: 1.5 }}><Box sx={{ display: 'flex', alignSelf: 'flex-start', p: 1.25, borderRadius: 2, color: 'primary.main', backgroundColor: 'action.hover' }}><QuizOutlinedIcon /></Box><Box><Typography variant="h6">{lesson.title}</Typography><Typography color="text.secondary" variant="body2">{source} · {moduleTitle}</Typography>{enrollmentType === 'class' && <Typography color="text.secondary" variant="caption">{Number.isFinite(scheduledStart) ? scheduleExpired ? `Closed ${new Date(scheduledDeadline).toLocaleString()}` : scheduleOpen ? `Closes ${new Date(scheduledDeadline).toLocaleString()}` : `Opens ${new Date(scheduledStart).toLocaleString()}` : 'Start date and time not set'}</Typography>}{result ? <Typography color={result.passed ? 'success.main' : 'warning.main'} variant="body2" sx={{ mt: 0.75, fontWeight: 600 }}>{result.passed ? 'Passed' : 'Failed attempt'} · Score {result.score}% · Grade {getQuizGrade(result.score)} · {Object.values(result.answerStatuses ?? {}).filter((status) => status === 'answered').length} answered / {Object.values(result.answerStatuses ?? {}).filter((status) => status === 'expired').length} expired{result.violationCount ? ` · Flagged: ${result.violationCount} violation${result.violationCount === 1 ? '' : 's'}` : ''}</Typography> : completed && <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>Completed · Score not recorded</Typography>}</Box></Box><Stack direction="row" spacing={1} alignItems="center"><Chip icon={result?.passed ? <CheckCircleOutlineIcon /> : undefined} label={result ? result.passed ? 'Completed' : 'Failed' : completed ? 'Score unavailable' : available ? 'Ready to take' : enrollmentType === 'class' && !scheduleOpen ? scheduleExpired ? 'Closed' : Number.isFinite(scheduledStart) ? 'Scheduled' : 'Schedule required' : 'Complete previous lesson'} color={result ? result.passed ? 'success' : 'warning' : completed ? 'warning' : available ? 'primary' : 'default'} size="small" variant={finished ? 'filled' : 'outlined'} /><Button variant={finished ? 'outlined' : 'contained'} size="small" onClick={() => onOpenCourse(course.id, lesson.id, retakeAllowed ? false : finished)} disabled={retakeAllowed ? !available : !available && !finished}>{retakeAllowed ? 'Retake quiz' : finished ? 'View result' : 'Open quiz'}</Button></Stack></Stack></CardContent></Card>)}</Stack>
      {pageCount > 1 && <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={pageCount} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" aria-label="Quiz results pages" /></Stack>}
      </>}
    </>}
  </>
}

const PurchasesView: FC = () => {
  const [practicePurchases, setPracticePurchases] = useState<Array<{ id: number; exam_id: number }>>([])
  const [practiceExams, setPracticeExams] = useState<Record<number, Awaited<ReturnType<typeof getPracticeExam>>>>({})
  const [bookstorePurchases, setBookstorePurchases] = useState<BookstorePurchase[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      getPracticePurchases().then(async (records) => ({ records, exams: await Promise.all(records.map(async (record) => [record.exam_id, await getPracticeExam(record.exam_id)] as const)) })),
      getBookstorePurchases(),
    ]).then(([practice, bookstore]) => {
      if (!active) return
      setPracticePurchases(practice.records)
      setPracticeExams(Object.fromEntries(practice.exams))
      setBookstorePurchases(bookstore)
    }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load purchases.') })
    return () => { active = false }
  }, [])

  return <>
    <ViewHeading title="My Purchases" description="Access your bookstore items and purchased practice exams." />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      {bookstorePurchases.map((purchase) => <Card key={`bookstore-${purchase.id}`} elevation={0} sx={{ border: 1, borderColor: 'divider' }}><CardContent><Stack direction="row" spacing={1.5} alignItems="flex-start"><Box sx={{ display: 'flex', p: 1.25, borderRadius: 2, color: 'primary.main', backgroundColor: 'action.hover' }}><MenuBookOutlinedIcon /></Box><Box sx={{ flex: 1 }}><Chip label={purchase.category} size="small" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h6" sx={{ mb: .5 }}>{purchase.title}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Purchased {purchase.purchasedAt}</Typography><Button variant="outlined" size="small" component="a" href={`/api/bookstore-items/${purchase.itemId}/download`} startIcon={<DownloadOutlinedIcon />}>Download {purchase.fileName}</Button></Box></Stack></CardContent></Card>)}
      {practicePurchases.map((purchase) => { const exam = practiceExams[purchase.exam_id]; return <Card key={`practice-${purchase.id}`} elevation={0} sx={{ border: 1, borderColor: 'divider' }}><CardContent><Stack direction="row" spacing={1.5} alignItems="flex-start"><Box sx={{ display: 'flex', p: 1.25, borderRadius: 2, color: 'primary.main', backgroundColor: 'action.hover' }}><SchoolOutlinedIcon /></Box><Box sx={{ flex: 1 }}><Chip label="Practice exam" size="small" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h6" sx={{ mb: 2 }}>{exam?.title ?? 'Practice exam'}</Typography><Button variant="outlined" size="small" disabled={!exam} onClick={() => navigateTo(`/practice-exams/${purchase.exam_id}`)}>Practice exam</Button></Box></Stack></CardContent></Card> })}
    </Box>
  </>
}

const catalogPageSize = 6
const OtherCoursesView: FC<{ courses: Course[]; unavailableCourseIds: Set<string>; isLoading: boolean; error: string | null; onOpenCourse: (courseId: number) => void }> = ({ courses, unavailableCourseIds, isLoading, error, onOpenCourse }) => {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const availableCourses = courses.filter((course) => !unavailableCourseIds.has(String(course.id)))
  const categoryOptions = Array.from(new Set(availableCourses.map((course) => course.category)))

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch = !normalizedQuery || [course.title, course.category].some((value) => value.toLowerCase().includes(normalizedQuery))
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const matchesRating = ratingFilter === 'all' || course.rating >= Number(ratingFilter)
    const matchesPrice = priceFilter === 'all' || priceFilter === 'free' && course.price === 0 || priceFilter === 'under-25' && course.price > 0 && course.price < 25 || priceFilter === '25-50' && course.price >= 25 && course.price <= 50 || priceFilter === 'over-50' && course.price > 50
    return matchesSearch && matchesCategory && matchesRating && matchesPrice
  })
  const sortedCourses = [...filteredCourses].sort((left, right) => sortBy === 'price' ? left.price - right.price : sortBy === 'title' ? left.title.localeCompare(right.title) : right.rating - left.rating)
  const pageCount = Math.ceil(sortedCourses.length / catalogPageSize)
  const visibleCourses = sortedCourses.slice((page - 1) * catalogPageSize, page * catalogPageSize)

  useEffect(() => setPage(1), [courses.length, unavailableCourseIds.size, normalizedQuery, categoryFilter, ratingFilter, priceFilter, sortBy])

  const filterPanel = <Paper elevation={0} sx={{ p: 2.25, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper' }}>
    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>Filter courses</Typography>
    <Divider sx={{ mb: 1.5 }} />
    <FormControl>
      <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Category</FormLabel>
      <RadioGroup value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setFiltersOpen(false) }}>
        <FormControlLabel value="all" control={<Radio size="small" />} label="All categories" />
        {categoryOptions.map((category) => <FormControlLabel key={category} value={category} control={<Radio size="small" />} label={category} />)}
      </RadioGroup>
    </FormControl>
    <Divider sx={{ my: 1.5 }} />
    <FormControl>
      <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Rating</FormLabel>
      <RadioGroup value={ratingFilter} onChange={(event) => { setRatingFilter(event.target.value); setFiltersOpen(false) }}>
        <FormControlLabel value="all" control={<Radio size="small" />} label="Any rating" />
        <FormControlLabel value="4.8" control={<Radio size="small" />} label="4.8 & up" />
        <FormControlLabel value="4.5" control={<Radio size="small" />} label="4.5 & up" />
        <FormControlLabel value="4" control={<Radio size="small" />} label="4.0 & up" />
        <FormControlLabel value="3.5" control={<Radio size="small" />} label="3.5 & up" />
        <FormControlLabel value="3" control={<Radio size="small" />} label="3.0 & up" />
      </RadioGroup>
    </FormControl>
    <Divider sx={{ my: 1.5 }} />
    <FormControl>
      <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Price</FormLabel>
      <RadioGroup value={priceFilter} onChange={(event) => { setPriceFilter(event.target.value); setFiltersOpen(false) }}>
        <FormControlLabel value="all" control={<Radio size="small" />} label="Any price" />
        <FormControlLabel value="free" control={<Radio size="small" />} label="Free" />
        <FormControlLabel value="under-25" control={<Radio size="small" />} label="Under $25" />
        <FormControlLabel value="25-50" control={<Radio size="small" />} label="$25–$50" />
        <FormControlLabel value="over-50" control={<Radio size="small" />} label="$50 and up" />
      </RadioGroup>
    </FormControl>
  </Paper>

  return <>
    <ViewHeading title="Explore courses" description="Discover available courses beyond your current learning plan." compact />
    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading course catalog" /></Box> : error ? <EmptyState title="Courses unavailable" description={error} /> : availableCourses.length === 0 ? <EmptyState title="No more courses to explore" description="You are enrolled in every published course." /> : <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
        <Box component="aside" sx={{ display: { xs: 'none', md: 'block' }, width: 250, flexShrink: 0, position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>{filterPanel}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2.5 }}>
            <Button variant="outlined" startIcon={<FilterListOutlinedIcon />} onClick={() => setFiltersOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' }, alignSelf: { xs: 'flex-start', sm: 'auto' } }}>Filter</Button>
            <TextField size="small" placeholder="Search courses..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} inputProps={{ 'aria-label': 'Search courses' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ flex: 1, minWidth: 0, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            <TextField select size="small" value={sortBy} onChange={(event) => setSortBy(event.target.value)} inputProps={{ 'aria-label': 'Sort courses' }} InputProps={{ startAdornment: <InputAdornment position="start"><SortOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ minWidth: { sm: 180 }, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
              <MenuItem value="popular">Most popular</MenuItem><MenuItem value="price">Price: low to high</MenuItem><MenuItem value="title">Name: A to Z</MenuItem>
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}</Typography>
            <ToggleButtonGroup exclusive size="small" value={layout} onChange={(_, value: 'grid' | 'list' | null) => { if (value) setLayout(value) }} aria-label="Course catalog layout"><ToggleButton value="grid" aria-label="Show courses as a grid"><GridViewOutlinedIcon fontSize="small" /></ToggleButton><ToggleButton value="list" aria-label="Show courses as a list"><ViewListOutlinedIcon fontSize="small" /></ToggleButton></ToggleButtonGroup>
          </Stack>
          {filteredCourses.length === 0 ? <EmptyState title="No matching courses" description="Try a different search term or category." /> : <>
            <Box sx={layout === 'grid' ? { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 } : { display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>{visibleCourses.map((course) => layout === 'grid' ? <CourseCardItem key={String(course.id)} item={course} onOpen={(item) => onOpenCourse(Number(item.id))} /> : <Card key={String(course.id)} elevation={0} sx={{ border: 1, borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, overflow: 'hidden' }}><Box component="img" src={course.cover} alt={course.title} sx={{ width: { xs: '100%', sm: 240 }, aspectRatio: '16 / 9', objectFit: 'cover', flexShrink: 0 }} /><CardContent sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}><Chip label={course.category} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start', mb: 1.5 }} /><Typography variant="h6" sx={{ mb: 0.5 }}>{course.title}</Typography><Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>★ {course.rating} ({course.ratingCount})</Typography><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>${course.price}</Typography><Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 'auto', pt: 2 }}><Button variant="outlined" size="small" onClick={() => onOpenCourse(Number(course.id))}>View course</Button></Stack></CardContent></Card>)}</Box>
            {pageCount > 1 && <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={pageCount} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" aria-label="Other courses pages" /></Stack>}
          </>}
        </Box>
      </Stack>
      <Drawer anchor="left" open={filtersOpen} onClose={() => setFiltersOpen(false)} PaperProps={{ sx: { width: 300, p: 2 } }}>{filterPanel}</Drawer>
    </>}
  </>
}

const OtherClassCard: FC<{ classRecord: PublicClass; cover?: string; category?: string; description: string; onViewDetails: () => void; onEnroll: () => void; layout: 'grid' | 'list' }> = ({ classRecord, cover, category, description, onViewDetails, onEnroll, layout }) => {
  const schedule = { ...classRecord.schedule, date: '', startsAt: '' }
  const statusLabel = classRecord.enrollmentClosed ? 'Enrollment closed' : classRecord.status === 'pending_schedule' ? 'Pending schedule' : classRecord.status === 'open' ? 'Available' : classRecord.status === 'full' ? 'Full' : 'Closed'
  const statusColor = classRecord.enrollmentClosed || classRecord.status === 'closed' ? 'error' : classRecord.status === 'open' ? 'success' : 'warning'
  const canEnroll = !classRecord.enrollmentClosed && (classRecord.status === 'open' || classRecord.status === 'full')
  const contentPadding = { xs: 2, md: 2.5, lg: 3 }

  return <Card className="class-card" elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3.5, backgroundColor: 'background.paper', boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.25 : 0.05)}`, '&:hover .class-card-description, &:focus-within .class-card-description': { opacity: 1 } }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: layout === 'grid' ? '1fr' : { xs: '1fr', md: '220px minmax(0, 1fr) 210px', lg: '300px minmax(0, 1fr) 240px' }, gap: { xs: 2, md: 2.5, lg: 3 }, p: layout === 'grid' ? 2 : contentPadding }}>
      <Box sx={{ position: 'relative', aspectRatio: layout === 'grid' ? '16 / 9' : { xs: '16 / 10', md: '300 / 216' }, overflow: 'hidden', borderRadius: 2.5, backgroundColor: 'action.hover' }}>
        {cover ? <Box component="img" src={cover} alt={`${classRecord.title} thumbnail`} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'primary.main' }}><ClassOutlinedIcon sx={{ fontSize: 48 }} /></Box>}
        <Box className="class-card-description" sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', p: 2, opacity: 0, transition: 'opacity 180ms ease', background: 'linear-gradient(transparent 5%, rgba(0,0,0,.82))' }}><Typography variant="body2" sx={{ color: 'common.white', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</Typography></Box>
        <Chip icon={<VideoCallOutlinedIcon />} label="Live Class" size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700, color: 'common.white', backgroundColor: 'primary.main', '& .MuiChip-icon': { color: 'inherit' } }} />
        <Box sx={{ position: 'absolute', left: 12, bottom: 12, display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 2, color: 'primary.main', backgroundColor: 'background.paper', boxShadow: 1 }}><MenuBookOutlinedIcon fontSize="small" /></Box>
      </Box>

      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Chip label={category ?? 'Live class'} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start', mb: 1.25 }} />
        <Typography variant="h6" component="h2" sx={{ mb: 1.5, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{classRecord.title}</Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}><PersonOutlineIcon sx={{ color: 'text.disabled', fontSize: 18 }} /><Typography variant="body2" color="text.secondary" noWrap>Tutor: {classRecord.tutorName}</Typography></Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}><CalendarTodayOutlinedIcon sx={{ color: 'text.disabled', fontSize: 18 }} /><Typography variant="body2" color="text.secondary" noWrap>{classScheduleLabel(schedule)}</Typography></Stack>
          <Stack direction="row" spacing={0.75} alignItems="center"><Rating value={classRecord.rating} precision={0.1} readOnly size="small" /><Typography variant="caption" color="text.secondary">{classRecord.ratingCount ? `${classRecord.rating.toFixed(1)} (${classRecord.ratingCount})` : 'No reviews yet'}</Typography></Stack>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ minWidth: 0, justifyContent: 'space-between', borderColor: 'divider', borderTop: layout === 'grid' ? 1 : { xs: 1, md: 0 }, borderLeft: layout === 'grid' ? 0 : { md: 1 }, pt: layout === 'grid' ? 2 : { xs: 2, md: 0 }, pl: layout === 'grid' ? 0 : { md: 2.5 } }}>
        <Box>
          <Chip label={statusLabel} size="small" color={statusColor} sx={{ fontWeight: 600, mb: 1.5 }} />
          <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, color: 'primary.main' }}>${classRecord.price}</Typography>
        </Box>
        <Stack spacing={1}>
          <Button fullWidth variant="contained" disabled={!canEnroll} onClick={onEnroll} sx={{ minHeight: 40, borderRadius: 2, fontWeight: 700, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>{classRecord.status === 'full' ? 'Join waitlist' : 'Enroll'}</Button>
          <Button fullWidth variant="outlined" onClick={onViewDetails} startIcon={<VisibilityOutlinedIcon fontSize="small" />} endIcon={<ArrowForwardRoundedIcon fontSize="small" />} sx={{ minHeight: 40, borderRadius: 2, fontWeight: 700 }}>View details</Button>
        </Stack>
      </Stack>
    </Box>

  </Card>
}

const OtherClassesView: FC<{ classes: PublicClass[]; courses: Course[]; unavailableClassIds: Set<number>; isLoading: boolean; error: string | null; onEnroll: (classRecord: PublicClass) => void; onOpenClass: (classId: number) => void }> = ({ classes, courses, unavailableClassIds, isLoading, error, onEnroll, onOpenClass }) => {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [scheduleFilter, setScheduleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const courseById = new Map(courses.map((course) => [String(course.id), course]))
  const getClassCourse = (classRecord: PublicClass) => classRecord.courseId === null ? undefined : courseById.get(String(classRecord.courseId))
  const availableClasses = classes.filter((classRecord) => !unavailableClassIds.has(classRecord.id))
  const dayOptions = Array.from(new Set(availableClasses.flatMap((classRecord) => classRecord.schedule.days)))
  const hasFlexibleClasses = availableClasses.some((classRecord) => classRecord.schedule.flexible)
  const categoryOptions = Array.from(new Set(availableClasses.map((classRecord) => getClassCourse(classRecord)?.category).filter((category): category is string => Boolean(category))))
  const gradeOptions = Array.from(new Set(availableClasses.map((classRecord) => classRecord.gradeLevel).filter((grade): grade is number => grade !== null))).sort((left, right) => left - right)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredClasses = availableClasses.filter((classRecord) => {
    const matchesSearch = !normalizedQuery || [classRecord.title, classRecord.tutorName, classRecord.courseTitle ?? ''].some((value) => value.toLowerCase().includes(normalizedQuery))
    const matchesSchedule = scheduleFilter === 'all' || (scheduleFilter === 'flexible' ? classRecord.schedule.flexible : classRecord.schedule.days.includes(scheduleFilter))
    const matchesCategory = categoryFilter === 'all' || getClassCourse(classRecord)?.category === categoryFilter
    const matchesGrade = gradeFilter === 'all' || classRecord.gradeLevel === Number(gradeFilter)
    const matchesRating = ratingFilter === 'all' || classRecord.rating >= Number(ratingFilter)
    return matchesSearch && matchesSchedule && matchesCategory && matchesGrade && matchesRating
  })
  const sortedClasses = [...filteredClasses].sort((left, right) => sortBy === 'price' ? left.price - right.price : sortBy === 'title' ? left.title.localeCompare(right.title) : right.enrolledCount - left.enrolledCount)
  const pageCount = Math.ceil(sortedClasses.length / catalogPageSize)
  const visibleClasses = sortedClasses.slice((page - 1) * catalogPageSize, page * catalogPageSize)

  useEffect(() => setPage(1), [classes.length, unavailableClassIds.size, normalizedQuery, scheduleFilter, categoryFilter, gradeFilter, ratingFilter, sortBy])

  const filterPanel = <Paper elevation={0} sx={{ p: 2.25, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper' }}>
    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>Filter classes</Typography>
    <Divider sx={{ mb: 1.5 }} />
    <Stack spacing={2}>
      <FormControl>
        <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Schedule</FormLabel>
        <RadioGroup value={scheduleFilter} onChange={(event) => { setScheduleFilter(event.target.value); setFiltersOpen(false) }}>
          <FormControlLabel value="all" control={<Radio size="small" />} label="Any schedule" />
          {hasFlexibleClasses && <FormControlLabel value="flexible" control={<Radio size="small" />} label="Flexible" />}
          {dayOptions.map((day) => <FormControlLabel key={day} value={day} control={<Radio size="small" />} label={day} />)}
        </RadioGroup>
      </FormControl>
      <Divider />
      <FormControl>
        <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Category</FormLabel>
        <RadioGroup value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setFiltersOpen(false) }}>
          <FormControlLabel value="all" control={<Radio size="small" />} label="All categories" />
          {categoryOptions.map((category) => <FormControlLabel key={category} value={category} control={<Radio size="small" />} label={category} />)}
        </RadioGroup>
      </FormControl>
      {gradeOptions.length > 0 && <>
        <Divider />
        <FormControl>
          <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Grade level</FormLabel>
          <RadioGroup value={gradeFilter} onChange={(event) => { setGradeFilter(event.target.value); setFiltersOpen(false) }}>
            <FormControlLabel value="all" control={<Radio size="small" />} label="All levels" />
            {gradeOptions.map((grade) => <FormControlLabel key={grade} value={String(grade)} control={<Radio size="small" />} label={`Grade ${grade}`} />)}
          </RadioGroup>
        </FormControl>
      </>}
      <Divider />
      <FormControl>
        <FormLabel sx={{ mb: 0.75, color: 'text.primary', fontWeight: 700 }}>Rating</FormLabel>
        <RadioGroup value={ratingFilter} onChange={(event) => { setRatingFilter(event.target.value); setFiltersOpen(false) }}>
          <FormControlLabel value="all" control={<Radio size="small" />} label="Any rating" />
          <FormControlLabel value="4.5" control={<Radio size="small" />} label="4.5 & up" />
          <FormControlLabel value="4" control={<Radio size="small" />} label="4.0 & up" />
          <FormControlLabel value="3" control={<Radio size="small" />} label="3.0 & up" />
        </RadioGroup>
      </FormControl>
    </Stack>
  </Paper>

  return <>
    <ViewHeading title="Explore classes" description="Find live classes and schedules that fit your learning plan." compact />
    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading class catalog" /></Box> : error ? <EmptyState title="Classes unavailable" description={error} /> : availableClasses.length === 0 ? <EmptyState title="No more classes to explore" description="There are no additional published classes available right now." /> : <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
        <Box component="aside" sx={{ display: { xs: 'none', md: 'block' }, width: 250, flexShrink: 0 }}>{filterPanel}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2.5 }}>
            <Button variant="outlined" startIcon={<FilterListOutlinedIcon />} onClick={() => setFiltersOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' }, alignSelf: { xs: 'flex-start', sm: 'auto' } }}>Filter</Button>
            <TextField size="small" placeholder="Search classes..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} inputProps={{ 'aria-label': 'Search classes' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ flex: 1, minWidth: 0, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
            <TextField select size="small" value={sortBy} onChange={(event) => setSortBy(event.target.value)} inputProps={{ 'aria-label': 'Sort classes' }} InputProps={{ startAdornment: <InputAdornment position="start"><SortOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ minWidth: { sm: 180 }, backgroundColor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
              <MenuItem value="popular">Most popular</MenuItem><MenuItem value="price">Price: low to high</MenuItem><MenuItem value="title">Name: A to Z</MenuItem>
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}</Typography>
            <ToggleButtonGroup exclusive size="small" value={layout} onChange={(_, value: 'grid' | 'list' | null) => { if (value) setLayout(value) }} aria-label="Class catalog layout"><ToggleButton value="grid" aria-label="Show classes as a grid"><GridViewOutlinedIcon fontSize="small" /></ToggleButton><ToggleButton value="list" aria-label="Show classes as a list"><ViewListOutlinedIcon fontSize="small" /></ToggleButton></ToggleButtonGroup>
          </Stack>
          {filteredClasses.length === 0 ? <EmptyState title="No matching classes" description="Try a different search term or filter." /> : <>
            <Box sx={layout === 'grid' ? { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2, alignItems: 'start' } : { display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {visibleClasses.map((classRecord) => { const course = getClassCourse(classRecord); const scheduleDescription = classRecord.schedule.flexible ? 'Flexible schedule.' : `Meets ${classRecord.schedule.days.join(', ')} at ${classRecord.schedule.time}.`; const description = course?.description?.trim() || `${classRecord.courseTitle ? `${classRecord.courseTitle} · ` : ''}Live class with ${classRecord.tutorName}. ${scheduleDescription}`; return <OtherClassCard key={classRecord.id} classRecord={classRecord} cover={classRecord.cover || course?.cover} category={course?.category} description={description} onViewDetails={() => onOpenClass(classRecord.id)} onEnroll={() => onEnroll(classRecord)} layout={layout} /> })}
            </Box>
            {pageCount > 1 && <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={pageCount} page={page} onChange={(_, nextPage) => setPage(nextPage)} color="primary" aria-label="Other classes pages" /></Stack>}
          </>}
        </Box>
      </Stack>
      <Drawer anchor="left" open={filtersOpen} onClose={() => setFiltersOpen(false)} PaperProps={{ sx: { width: 300, p: 2 } }}>{filterPanel}</Drawer>
    </>}
  </>
}

const CatalogCourseDetailView: FC<{ courseId: number | null; isPaymentPending: boolean; onBack: () => void; onEnroll: (course: AdminCourse) => void }> = ({ courseId, isPaymentPending, onBack, onEnroll }) => {
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (courseId === null) {
      setCourse(null)
      setIsLoading(false)
      return
    }
    let isCurrent = true
    setCourse(null)
    setIsLoading(true)
    getCourse(courseId).then((record) => { if (isCurrent) setCourse(record) }).catch(() => { if (isCurrent) setCourse(null) }).finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [courseId])

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }} aria-live="polite"><CircularProgress aria-label="Loading course details" /></Box>
  if (!course) return <EmptyState title="Course unavailable" description="This course could not be loaded." actionLabel="Back to Explore Courses" onAction={onBack} />

  const lessons = course.modules.flatMap((module) => module.lessons)
  return <>
    <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>Back to Explore Courses</Button>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' }, gap: 3, alignItems: 'start' }}>
      <Stack spacing={2.5}>
        <Box>
          <Chip label={course.category} color="primary" size="small" sx={{ mb: 1.5 }} />
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>{course.title}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><Rating value={course.rating ?? 0} precision={0.1} readOnly /><Typography variant="body2" color="text.secondary">{course.ratingCount ? `${course.rating?.toFixed(1)} (${course.ratingCount} reviews)` : 'No reviews yet'}</Typography></Stack>
          <Typography color="text.secondary">{course.description}</Typography>
        </Box>
        <Box component="img" src={course.cover} alt={course.title} sx={{ width: '100%', maxHeight: 420, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 3 }} />
        <Box><Typography variant="h5" sx={{ mb: 1 }}>About this course</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>{course.longDescription || course.description}</Typography></Box>
        {course.learningOutcomes.length > 0 && <Box><Typography variant="h5" sx={{ mb: 1 }}>What you&apos;ll learn</Typography><Stack spacing={1}>{course.learningOutcomes.map((outcome) => <Typography key={outcome} color="text.secondary">• {outcome}</Typography>)}</Stack></Box>}
        <Box><Typography variant="h5" sx={{ mb: 1 }}>Course content</Typography><Stack spacing={1.25}>{course.modules.map((module) => <Paper key={module.id} elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}><Typography sx={{ fontWeight: 700, mb: 1 }}>{module.title}</Typography><Stack spacing={0.75}>{module.lessons.map((lesson) => <Typography key={lesson.id} variant="body2" color="text.secondary">{lesson.title}</Typography>)}</Stack></Paper>)}</Stack><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{course.modules.length} sections · {lessons.length} lessons</Typography></Box>
      </Stack>
      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', position: { lg: 'sticky' }, top: { lg: 20 } }}>
        <Typography variant="h4" sx={{ mb: 2 }}>${course.price}</Typography>
        <Button fullWidth variant="contained" size="large" disabled={isPaymentPending} onClick={() => onEnroll(course)}>{isPaymentPending ? 'Payment pending verification' : 'Enroll in course'}</Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{isPaymentPending ? 'Your payment is under review. You can enroll again only if it is declined.' : `${course.level} · ${course.tutor}`}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2">{course.certificate ? 'Certificate of completion included' : 'Self-paced learning access'}</Typography>
      </Paper>
    </Box>
    <Box sx={{ mt: 4 }}><StudentReviews targetType="course" targetId={course.id} instructorName={course.tutor} /></Box>
  </>
}

const CatalogClassDetailView: FC<{ classRecord?: PublicClass; course?: Course; isLoading: boolean; isPaymentPending: boolean; onBack: () => void; onEnroll: (classRecord: PublicClass) => void }> = ({ classRecord, course, isLoading, isPaymentPending, onBack, onEnroll }) => {
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }} aria-live="polite"><CircularProgress aria-label="Loading class details" /></Box>
  if (!classRecord) return <EmptyState title="Class unavailable" description="This class could not be loaded." actionLabel="Back to Explore Classes" onAction={onBack} />

  const schedule = { ...classRecord.schedule, date: '', startsAt: '' }
  const isAvailable = !classRecord.enrollmentClosed && (classRecord.status === 'open' || classRecord.status === 'full')
  return <>
    <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>Back to Explore Classes</Button>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' }, gap: 3, alignItems: 'start' }}>
      <Stack spacing={2.5}>
        <Box>
          <Chip label={course?.category ?? 'Live class'} color="primary" size="small" sx={{ mb: 1.5 }} />
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>{classRecord.title}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><Rating value={classRecord.rating} precision={0.1} readOnly /><Typography variant="body2" color="text.secondary">{classRecord.ratingCount ? `${classRecord.rating.toFixed(1)} (${classRecord.ratingCount} reviews)` : 'No reviews yet'}</Typography></Stack>
          <Typography color="text.secondary">{course?.description || `Live class with ${classRecord.tutorName}.`}</Typography>
        </Box>
        {(classRecord.cover || course?.cover) && <Box component="img" src={classRecord.cover || course?.cover || ''} alt={classRecord.title} sx={{ width: '100%', maxHeight: 420, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 3 }} />}
        <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Class details</Typography>
          <Stack spacing={1}><Typography>Instructor: {classRecord.tutorName}</Typography><Typography>Schedule: {classScheduleLabel(schedule)}</Typography><Typography>Duration: {formatDuration(classRecord.schedule.duration * 60)}</Typography><Typography>Starts: {classRecord.schedule.startDate ? formatClassStartDate(schedule) : 'Date to be confirmed'}</Typography><Typography>Enrollment: {classRecord.enrolledCount}/{classRecord.capacity} seats</Typography><Typography>Curriculum: {classRecord.moduleCount ?? 0} modules · {classRecord.lessonCount ?? 0} lessons</Typography>{classRecord.courseTitle && <Typography>Course: {classRecord.courseTitle}</Typography>}</Stack>
        </Paper>
      </Stack>
      <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', position: { lg: 'sticky' }, top: { lg: 20 } }}>
        <Typography variant="h4" sx={{ mb: 2 }}>${classRecord.price}</Typography>
        <Button fullWidth variant="contained" size="large" disabled={!isAvailable || isPaymentPending} onClick={() => onEnroll(classRecord)}>{isPaymentPending ? 'Payment pending verification' : classRecord.status === 'full' ? 'Join waitlist' : 'Enroll in class'}</Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{isPaymentPending ? 'Your payment is under review. You can enroll again only if it is declined.' : classRecord.status === 'pending_schedule' ? 'Schedule pending' : classRecord.enrollmentClosed ? 'Enrollment closed' : classScheduleLabel(schedule)}</Typography>
      </Paper>
    </Box>
    <Box sx={{ mt: 4 }}><StudentReviews targetType="class" targetId={classRecord.id} instructorName={classRecord.tutorName} /></Box>
  </>
}

const profileCardSx = {
  p: { xs: 2.5, md: 3 },
  border: 1,
  borderColor: 'divider',
  borderRadius: 3,
  backgroundColor: 'background.paper',
  boxShadow: (theme: Theme) => `0 5px 18px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.055)}`,
}

const ProfileIconTile: FC<{ icon: ReactNode }> = ({ icon }) => <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 2, color: 'primary.main', backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.09) }}>{icon}</Box>

const ProfileFact: FC<{ icon: ReactNode; label: string; value: string; active?: boolean }> = ({ icon, label, value, active }) => <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 1.5, py: 1.25, minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 2.5, backgroundColor: 'background.default' }}>
  <Box sx={{ display: 'grid', placeItems: 'center', width: 32, height: 32, flexShrink: 0, borderRadius: 1.5, color: 'primary.main', backgroundColor: 'background.paper', border: 1, borderColor: 'divider' }}>{icon}</Box>
  <Box sx={{ minWidth: 0, flex: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, letterSpacing: .6, textTransform: 'uppercase', lineHeight: 1.4 }}>{label}</Typography>
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
      {active && <Box sx={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', backgroundColor: 'success.main' }} />}
      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  </Box>
</Stack>

const ProfileView: FC<{ onUpdateProfile: (profile: { name: string; email: string; phone: string }) => Promise<void> }> = ({ onUpdateProfile }) => {
  const user = getAuthenticatedUser()
  const [profile, setProfile] = useState({ name: user?.name || 'Alex Morgan', email: user?.email || 'alex@example.com', phone: user?.phone || '' })
  const [isSaving, setIsSaving] = useState(false)
  const initials = profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <>
    <ViewHeading title="Profile" description="Keep your learner details current and up to date." />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 340px) minmax(0, 1fr)' }, gap: { xs: 2.5, md: 3 }, alignItems: 'start' }}>
      <Paper elevation={0} sx={profileCardSx}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
          <Avatar sx={{ width: 56, height: 56, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 20, fontWeight: 700 }}>{initials || 'AL'}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, lineHeight: 1.3 }}>{profile.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{profile.email}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2.5 }} />
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <ProfileIconTile icon={<MenuBookOutlinedIcon fontSize="small" />} />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>Learner overview</Typography>
            <Typography color="text.secondary" variant="caption">Your personal details and learning activity at a glance.</Typography>
          </Box>
        </Stack>
        <Stack spacing={1.25}>
          <ProfileFact icon={<MenuBookOutlinedIcon fontSize="small" />} label="Active courses" value="2 courses in progress" />
          <ProfileFact icon={<CalendarTodayOutlinedIcon fontSize="small" />} label="Next class" value="Live React Workshop" />
          <ProfileFact icon={<CheckCircleOutlineIcon fontSize="small" />} label="Account status" value="Active" active />
        </Stack>
      </Paper>
      <Paper elevation={0} sx={profileCardSx}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ProfileIconTile icon={<PersonOutlineIcon fontSize="small" />} />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>Personal information</Typography>
            <Typography color="text.secondary" variant="body2">Update the information used for your learning records and class communications.</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2.5 }} />
        <Box component="form" onSubmit={async (event) => { event.preventDefault(); setIsSaving(true); try { await onUpdateProfile(profile) } finally { setIsSaving(false) } }} sx={{ display: 'grid', gap: 2.25 }}>
          <TextField required fullWidth label="Full name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} />
          <TextField required fullWidth label="Email address" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} />
          <TextField fullWidth label="Phone number" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
            <Button type="submit" variant="contained" disabled={isSaving} startIcon={<SaveOutlinedIcon />} sx={{ minHeight: 42, px: 2.5, borderRadius: 2, fontWeight: 700, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>{isSaving ? 'Saving profile...' : 'Save profile'}</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  </>
}

const PaymentHistoryView: FC<{ payments: MyPayment[]; isLoading: boolean; error: string | null }> = ({ payments, isLoading, error }) => <>
  <ViewHeading title="Payment History" description="Review course transactions linked to your account." />
  {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading payments" /></Box> : error ? <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error">{error}</Typography></Paper> : <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
    <AdminDataTable rows={payments} columns={paymentColumns} searchPlaceholder="Search payments" searchKeys={['itemName', 'type', 'txRef']} />
  </Paper>}
</>

const paymentColumns: DataColumn<MyPayment>[] = [
  { key: 'itemName', label: 'Item' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount', render: (value, row) => `${row.currency} ${Number(value).toFixed(2)}` },
  { key: 'status', label: 'Status', render: (value) => <Chip label={String(value)} color={value === 'Paid' ? 'success' : ['Failed', 'Declined'].includes(String(value)) ? 'error' : 'warning'} size="small" /> },
  { key: 'reviewNote', label: 'Review note' },
  { key: 'date', label: 'Date' },
  { key: 'txRef', label: 'Transaction Reference' },
]

const formatVideoTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

const LessonVideoPlayer: FC<{ src?: string; poster?: string; captionsVtt?: string; captionLanguage?: string; transcript?: string; fallbackDuration: string; initialPosition: number; onPositionChange: (seconds: number) => void }> = ({ src, poster, captionsVtt, captionLanguage = 'en', transcript, fallbackDuration, initialPosition, onPositionChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [captionSrc, setCaptionSrc] = useState('')
  const lastSavedAt = useRef(0)
  useEffect(() => {
    if (!captionsVtt) { setCaptionSrc(''); return }
    const captionUrl = URL.createObjectURL(new Blob([captionsVtt], { type: 'text/vtt' }))
    setCaptionSrc(captionUrl)
    return () => URL.revokeObjectURL(captionUrl)
  }, [captionsVtt])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }
  return <Box sx={{ position: 'relative', width: '100%', minHeight: { xs: 220, md: 340 }, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #102a32, #1a4d53)', overflow: 'hidden' }}>
    {src ? <Box component="video" ref={videoRef} src={src} poster={poster} preload="metadata" controls onLoadedMetadata={(event) => { const video = event.currentTarget; setDuration(video.duration); video.currentTime = Math.min(initialPosition, video.duration); setCurrentTime(video.currentTime) }} onTimeUpdate={(event) => { const video = event.currentTarget; setCurrentTime(video.currentTime); if (Date.now() - lastSavedAt.current >= 15000) { lastSavedAt.current = Date.now(); onPositionChange(video.currentTime) } }} onPause={(event) => onPositionChange(event.currentTarget.currentTime)} onEnded={(event) => onPositionChange(event.currentTarget.currentTime)} sx={{ width: '100%', height: '100%', maxHeight: { xs: 340, md: 520 }, objectFit: 'contain' }}>{captionSrc && <track kind="captions" src={captionSrc} srcLang={captionLanguage} label={captionLanguage} default />}Your browser does not support video playback.</Box> : <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>Video preview unavailable</Typography>}
    {src && <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1, backgroundColor: 'background.paper' }}><Typography variant="caption" color="text.secondary">{duration ? `${formatVideoTime(currentTime)} / ${formatVideoTime(duration)}` : fallbackDuration}</Typography>{captionsVtt && <Typography variant="caption" color="text.secondary">Captions available in video controls</Typography>}</Stack>}
    {transcript?.trim() && <Box component="details" sx={{ p: 2, backgroundColor: 'background.paper' }}><Box component="summary" sx={{ cursor: 'pointer', fontWeight: 600 }}>Read video transcript</Box><Typography component="div" variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{transcript}</Typography></Box>}
  </Box>
}

const QuizResultReview: FC<{ lesson: DashboardLesson; result: DashboardQuizResult | null; passingScore: number }> = ({ lesson, result, passingScore }) => {
  const statuses = Object.values(result?.answerStatuses ?? {})
  const answered = statuses.filter((status) => status === 'answered').length
  const expired = statuses.filter((status) => status === 'expired').length
  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Typography variant="h4">{lesson.title}</Typography><Typography color="text.secondary">Read-only result review. This completed attempt cannot be retaken from here.</Typography>{result ? <><Alert severity={result.passed ? 'success' : 'warning'}>Score: {result.score}% · {result.disqualified ? 'Disqualified' : result.passed ? 'Passed' : `Need ${passingScore}% to pass`}</Alert><Typography variant="body2">{answered} answered · {expired} expired{result.violationCount ? ` · ${result.violationCount} violation${result.violationCount === 1 ? '' : 's'}` : ''}</Typography><Stack spacing={1.5}>{(result.questionResults ?? []).map((item, index) => <Paper key={item.questionId} variant="outlined" sx={{ p: 2 }}><Typography sx={{ fontWeight: 700 }}>{index + 1}. {item.question}</Typography><Typography variant="body2" sx={{ mt: 1 }}>My answer: {item.studentAnswer ?? 'Unanswered'}</Typography><Typography variant="body2" color="success.main">Correct answer: {item.correctAnswer ?? 'Unavailable'}</Typography>{lesson.quizQuestions?.find((question) => question.id === item.questionId)?.explanation && <Typography variant="body2">{lesson.quizQuestions.find((question) => question.id === item.questionId)?.explanation}</Typography>}{lesson.quizQuestions?.find((question) => question.id === item.questionId)?.explanationImage && <Box component="img" src={lesson.quizQuestions.find((question) => question.id === item.questionId)?.explanationImage} alt="Answer explanation" sx={{ display: 'block', maxWidth: '100%', maxHeight: 360, objectFit: 'contain', mt: 1, borderRadius: 1.5 }} />}<Typography variant="caption" color="text.secondary">Status: {item.status}</Typography></Paper>)}</Stack></> : <Alert severity="info">No recorded score is available for this completed quiz.</Alert>}</Stack></Paper>
}

const LessonResources: FC<{ resources: DashboardLesson['resources'] }> = ({ resources }) => {
  if (!resources.length) return null
  return <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
    <Typography variant="h6" sx={{ mb: 1 }}>Downloadable resources</Typography>
    <Stack spacing={1}>
      {resources.map((resource) => resource.url ? <Button key={resource.id} component="a" href={resource.url} download={resource.name} variant="outlined" size="small" startIcon={<DownloadOutlinedIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>{resource.name}</Button> : <Typography key={resource.id} color="text.secondary" variant="body2">{resource.name} is unavailable.</Typography>)}
    </Stack>
  </Paper>
}

const QuizLessonView: FC<{ lesson: DashboardLesson; attempt: QuizAttempt | null; now: Date; requiresSchedule: boolean; onBegin: () => Promise<QuizAttempt | null>; onSave: (questionId: number, answer: QuizAnswerRecord) => Promise<void>; onSubmit: (answers: Record<number, QuizAnswerRecord>, disqualified?: boolean) => Promise<DashboardQuizResult | null>; onViolation: (violation: QuizViolation) => Promise<void>; onActiveChange: (active: boolean) => void; result: DashboardQuizResult | null; passingScore: number; strikeThreshold: number }> = ({ lesson, attempt, now, requiresSchedule, onBegin, onSave, onSubmit, onViolation, onActiveChange, result, passingScore, strikeThreshold }) => {
  const questions = lesson.quizQuestions ?? []
  const quizTimeLimitSeconds = getQuizTimeLimitSeconds(questions)
  const scheduledStart = lesson.scheduledAt ? Date.parse(lesson.scheduledAt) : NaN
  const scheduleValid = !requiresSchedule || Number.isFinite(scheduledStart)
  const scheduledDeadline = scheduleValid && requiresSchedule ? scheduledStart + quizTimeLimitSeconds * 1000 : NaN
  const scheduleExpired = requiresSchedule && scheduleValid && now.getTime() >= scheduledDeadline
  const scheduleOpen = !requiresSchedule || (scheduleValid && now.getTime() >= scheduledStart && !scheduleExpired)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, QuizAnswerRecord>>({})
  const answersRef = useRef<Record<number, QuizAnswerRecord>>({})
  const restoredAttemptIdRef = useRef<number | null>(null)
  const [deadline, setDeadline] = useState<number | null>(null)
  const answerSaveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const [secondsLeft, setSecondsLeft] = useState(quizTimeLimitSeconds)
  const [locked, setLocked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [violationCount, setViolationCount] = useState(attempt?.violations?.length ?? 0)
  const [warning, setWarning] = useState(false)

  useEffect(() => {
    setViolationCount(attempt?.violations?.length ?? 0)
  }, [attempt])

  useEffect(() => {
    if (!attempt || restoredAttemptIdRef.current === attempt.id) return
    restoredAttemptIdRef.current = attempt.id
    const saved = attempt.answers ?? {}
    const restoredAnswers = Object.fromEntries(questions.map((question) => [question.id, saved[question.id] ?? { status: 'unanswered', value: null }]))
    answersRef.current = restoredAnswers
    setAnswers(restoredAnswers)
    const attemptDeadline = attempt.deadlineAt ? Date.parse(attempt.deadlineAt) : requiresSchedule ? scheduledDeadline : Date.parse(attempt.startedAt) + (attempt.timeLimitSeconds ?? quizTimeLimitSeconds) * 1000
    setDeadline(attemptDeadline)
    setSecondsLeft(Math.max(0, Math.ceil((attemptDeadline - Date.now()) / 1000)))
    setLocked(false)
  }, [attempt, questions, quizTimeLimitSeconds, requiresSchedule, scheduledDeadline])

  const updateAnswer = useCallback((questionId: number, answer: QuizAnswerRecord) => {
    const nextAnswers = { ...answersRef.current, [questionId]: answer }
    answersRef.current = nextAnswers
    setAnswers(nextAnswers)
    return nextAnswers
  }, [])

  const persistAnswer = useCallback((questionId: number, answer: QuizAnswerRecord) => {
    const nextSave = answerSaveQueueRef.current.then(() => onSave(questionId, answer))
    answerSaveQueueRef.current = nextSave.catch(() => undefined)
    return answerSaveQueueRef.current
  }, [onSave])

  useEffect(() => {
    if (!attempt || locked || deadline === null) return
    const updateCountdown = () => setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [attempt?.id, deadline, locked])
  useEffect(() => {
    if (secondsLeft !== 0 || locked || !attempt) return
    setLocked(true)
    submittingRef.current = true
    setSubmitting(true)
    const expiredAnswers: Record<number, QuizAnswerRecord> = {}
    questions.forEach((question) => {
      const answer = answersRef.current[question.id] ?? { status: 'unanswered', value: null }
      expiredAnswers[question.id] = answer.status === 'answered' ? answer : { ...answer, status: 'expired' }
    })
    answersRef.current = expiredAnswers
    setAnswers(expiredAnswers)
    void answerSaveQueueRef.current.then(() => onSubmit(expiredAnswers)).finally(() => {
      submittingRef.current = false
      setSubmitting(false)
    })
  }, [secondsLeft, locked, attempt, onSubmit, questions])

  useEffect(() => {
    if (!attempt) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') void registerViolation('visibility') }
    const onFullscreenChange = () => { if (!document.fullscreenElement) void disqualifyForFullscreenExit() }
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [attempt, locked, violationCount])

  const disqualifyForFullscreenExit = async () => {
    if (!attempt || submitting || submittingRef.current) return
    const violation = { type: 'fullscreen', occurredAt: new Date().toISOString() } satisfies QuizViolation
    submittingRef.current = true
    setSubmitting(true)
    await onViolation(violation)
    await onSubmit(Object.fromEntries(questions.map((item) => [item.id, answersRef.current[item.id] ?? { status: 'unanswered', value: null }])), true)
    setSubmitting(false)
  }

  const registerViolation = async (type: QuizViolationType) => {
    if (!attempt || submitting || submittingRef.current) return
    const violation = { type, occurredAt: new Date().toISOString() } satisfies QuizViolation
    const nextCount = violationCount + 1
    setViolationCount(nextCount)
    setWarning(true)
    await onViolation(violation)
    if (nextCount >= strikeThreshold) {
      const savedAnswers = Object.fromEntries(questions.map((item) => [item.id, answersRef.current[item.id] ?? { status: 'unanswered', value: null }]))
      submittingRef.current = true
      setSubmitting(true)
      await onSubmit(savedAnswers, true)
      setSubmitting(false)
    }
  }

  const startQuiz = async () => {
    if (!document.documentElement.requestFullscreen) return
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      return
    }
    const next = await onBegin()
    if (!next) {
      await document.exitFullscreen?.().catch(() => undefined)
      return
    }
    onActiveChange(true)
  }

  const selectAnswer = (value: string | number | string[] | null) => {
    const question = questions[current]
    if (!question || locked) return
    const answer = { status: 'answered', value } satisfies QuizAnswerRecord
    updateAnswer(question.id, answer)
    void persistAnswer(question.id, answer)
  }
  const navigateQuestion = (nextIndex: number) => {
    if (locked || nextIndex < 0 || nextIndex >= questions.length) return
    const question = questions[current]
    const answer = question ? answersRef.current[question.id] : undefined
    if (question && answer) void persistAnswer(question.id, answer)
    setCurrent(nextIndex)
  }
  const canSubmit = questions.every((item) => (answers[item.id]?.status ?? 'unanswered') !== 'unanswered')
  const submit = async () => {
    if (!attempt || submitting || submittingRef.current || !canSubmit) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      const question = questions[current]
      const currentAnswer = question ? answersRef.current[question.id] : undefined
      if (question && currentAnswer) updateAnswer(question.id, { ...currentAnswer, status: 'answered' })
      const submittedAnswers = { ...answersRef.current }
      if (question && currentAnswer) void persistAnswer(question.id, { ...currentAnswer, status: 'answered' })
      await onSubmit(submittedAnswers)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }
  if (!questions.length) return <EmptyState title="Quiz unavailable" description="This quiz does not have any questions." />
  if (!attempt) return <Paper elevation={0} sx={{ width: '100%', maxWidth: 920, boxSizing: 'border-box', p: { xs: 2.5, sm: 3.5, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', boxShadow: (theme) => `0 12px 36px ${alpha(theme.palette.primary.dark, 0.08)}` }}><Stack spacing={{ xs: 2.5, md: 3 }}><Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2}><Stack direction="row" alignItems="center" spacing={1.75}><Box sx={{ width: 54, height: 54, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 2, color: 'primary.main', backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}><QuizOutlinedIcon sx={{ fontSize: 28 }} /></Box><Box><Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.1 }}>QUIZ</Typography><Typography component="h1" variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.15 }}>{lesson.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Review the instructions before you begin.</Typography></Box></Stack><Paper elevation={0} role="timer" aria-label={`Quiz time limit ${formatQuizCountdown(quizTimeLimitSeconds)}`} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, p: 1.5, minWidth: 150, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.default' }}><Stack direction="row" alignItems="center" spacing={1.25}><AccessTimeOutlinedIcon sx={{ color: 'primary.main' }} /><Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>TIME LIMIT</Typography><Typography variant="subtitle1" sx={{ color: 'primary.dark', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{formatQuizCountdown(quizTimeLimitSeconds)}</Typography></Box></Stack></Paper></Stack><Box><Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}><NotificationsNoneOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} /><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Notices</Typography></Stack><Stack spacing={1.25}>{requiresSchedule && <Alert severity={!scheduleValid || scheduleExpired ? 'warning' : 'info'} sx={{ alignItems: 'center', border: 1, borderColor: (theme) => alpha(!scheduleValid || scheduleExpired ? theme.palette.warning.main : theme.palette.info.main, 0.3), borderRadius: 2, backgroundColor: (theme) => alpha(!scheduleValid || scheduleExpired ? theme.palette.warning.main : theme.palette.info.main, 0.07), color: 'text.primary' }}>{!scheduleValid ? 'This class quiz does not have a start date and time yet.' : scheduleExpired ? `Quiz closed at ${new Date(scheduledDeadline).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. Its ${formatQuizCountdown(quizTimeLimitSeconds)} time limit has expired.` : scheduleOpen ? `Quiz open until ${new Date(scheduledDeadline).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.` : `Quiz opens ${new Date(scheduledStart).toLocaleString()} and closes at ${new Date(scheduledDeadline).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`}</Alert>}<Alert severity="info" sx={{ alignItems: 'flex-start', border: 1, borderColor: (theme) => alpha(theme.palette.info.main, 0.3), borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.info.main, 0.06), color: 'text.primary' }}><Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 800 }}>Before you start</Typography><Box component="ul" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.5, '& li::marker': { color: 'primary.main' } }}><li><Typography variant="body2" color="text.secondary">The {formatQuizCountdown(quizTimeLimitSeconds)} timer begins when you start.</Typography></li><li><Typography variant="body2" color="text.secondary">Your answers save automatically, and the quiz submits when time runs out.</Typography></li><li><Typography variant="body2" color="text.secondary">Keep the quiz open in full screen; leaving may affect your result.</Typography></li></Box></Alert></Stack></Box><Button variant="contained" disabled={!scheduleOpen} onClick={() => void startQuiz()} sx={{ alignSelf: 'flex-start', minWidth: 150, px: 2.5, py: 1.15, borderRadius: 2, boxShadow: 'none', fontWeight: 700, textTransform: 'none' }}>{scheduleExpired ? 'Quiz Closed' : 'Start Quiz'}</Button></Stack></Paper>
  const question = questions[current]
  const answer = answers[question.id]
  const isText = question.options.length === 0 || /fill|short|essay|file|calculation|data/i.test(`${question.type ?? ''} ${question.category ?? ''}`)
  return <Paper elevation={0} sx={{ width: '100%', maxWidth: 920, boxSizing: 'border-box', p: { xs: 2.5, sm: 3.5, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', boxShadow: (theme) => `0 12px 36px ${alpha(theme.palette.primary.dark, 0.08)}` }}><Stack spacing={{ xs: 2, md: 2.75 }}>{warning && <Alert severity="warning" onClose={() => setWarning(false)} sx={{ border: 1, borderColor: (theme) => alpha(theme.palette.warning.main, 0.35), borderRadius: 2, backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.08) }}>Leaving the quiz may result in disqualification. Violation {violationCount} of {strikeThreshold}.</Alert>}<Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2}><Stack direction="row" alignItems="center" spacing={1.75}><Box sx={{ width: 52, height: 52, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 2, color: 'primary.main', backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}><QuizOutlinedIcon sx={{ fontSize: 27 }} /></Box><Box><Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.1 }}>QUIZ IN PROGRESS</Typography><Typography component="h1" variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>{lesson.title}</Typography></Box></Stack><Paper elevation={0} role="timer" aria-label={locked ? 'Quiz time expired' : `${formatQuizCountdown(secondsLeft)} remaining`} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, p: 1.25, minWidth: 142, border: 1, borderColor: secondsLeft <= 10 ? 'error.light' : 'divider', borderRadius: 2, backgroundColor: secondsLeft <= 10 ? (theme) => alpha(theme.palette.error.main, 0.06) : 'background.default' }}><Stack direction="row" alignItems="center" spacing={1}><AccessTimeOutlinedIcon sx={{ color: secondsLeft <= 10 ? 'error.main' : 'primary.main' }} /><Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>TIME REMAINING</Typography><Typography variant="subtitle1" sx={{ color: secondsLeft <= 10 ? 'error.main' : 'primary.dark', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{locked ? 'Expired' : formatQuizCountdown(secondsLeft)}</Typography></Box></Stack></Paper></Stack><Stack component="ol" direction="row" justifyContent="center" spacing={1} aria-label="Quiz progress" sx={{ m: 0, p: 0, listStyle: 'none' }}>{questions.map((item, index) => <Box component="li" key={item.id} aria-current={index === current ? 'step' : undefined} aria-label={`Question ${index + 1}${index === current ? ', current' : ''}`} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 1, borderColor: index === current ? 'primary.main' : 'divider', bgcolor: index === current ? 'primary.main' : 'action.hover', color: index === current ? 'primary.contrastText' : 'text.secondary', fontSize: '0.875rem', fontWeight: 700 }}>{index + 1}</Box>)}</Stack><Stack spacing={0.75}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800 }}>Question {current + 1} of {questions.length}</Typography><Typography variant="caption" color="text.secondary">{Math.round(((current + 1) / questions.length) * 100)}% complete</Typography></Stack><LinearProgress variant="determinate" value={((current + 1) / questions.length) * 100} sx={{ height: 6, borderRadius: 3, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: 'primary.main' } }} /></Stack><Typography variant="h5" sx={{ fontWeight: 750, lineHeight: 1.35 }}>{question.question}</Typography>{question.questionImage && <Box component="img" src={question.questionImage} alt="Question illustration" sx={{ display: 'block', maxWidth: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 1.5 }} />}{isText ? <Stack spacing={1}><TextField fullWidth multiline minRows={3} disabled={locked} value={typeof answer?.value === 'string' ? answer.value : ''} placeholder="Type your answer" onChange={(event) => selectAnswer(event.target.value)} /><VoiceDictationButton disabled={locked} onTranscript={(transcript) => selectAnswer(`${typeof answer?.value === 'string' && answer.value ? `${answer.value} ` : ''}${transcript}`)} /></Stack> : <FormControl disabled={locked}><FormLabel>Choose an answer</FormLabel><RadioGroup value={typeof answer?.value === 'number' ? String(answer.value) : ''} onChange={(event) => selectAnswer(Number(event.target.value))}>{question.options.map((option, index) => <FormControlLabel key={option + index} value={String(index)} control={<Radio />} label={<Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2">{option}</Typography>{question.optionImages?.[index] && <Box component="img" src={question.optionImages[index]} alt={`Option ${index + 1} illustration`} sx={{ maxWidth: 120, maxHeight: 72, objectFit: 'contain', borderRadius: 1 }} />}</Stack>} />)}</RadioGroup></FormControl>}<Typography variant="caption" color="text.secondary">Question time limit: {formatQuizCountdown(getQuestionSeconds(question))} · Status: {answer?.status ?? 'unanswered'}</Typography><Stack direction="row" justifyContent="space-between"><Button disabled={current === 0 || locked} onClick={() => navigateQuestion(current - 1)}>Previous</Button>{current < questions.length - 1 ? <Button variant="outlined" disabled={locked} onClick={() => navigateQuestion(current + 1)}>Next question</Button> : <Button variant="contained" disabled={!canSubmit || submitting} onClick={() => void submit()}>{submitting ? 'Submitting...' : 'Submit quiz'}</Button>}</Stack>{result && <Alert severity={result.passed ? 'success' : 'warning'}>Latest result: {result.score}% ({result.passed ? 'passed' : `need ${passingScore}% to pass`}).</Alert>}</Stack></Paper>
}

const ArticleIllustration: FC<{ title: string; description: string; imageUrl?: string }> = ({ title, description, imageUrl }) => {
  const topic = `${title} ${description}`
  const isSpace = /solar system|planet|astronomy|space|universe/i.test(topic)
  const isLifeScience = /biology|cell|photosynthesis|ecosystem|organism/i.test(topic)
  const isChemistry = /chemistry|molecule|chemical|element|material/i.test(topic)
  const image = imageUrl || (isSpace ? '/images/article-solar-system.jpg' : undefined)
  const subject = isSpace ? 'SPACE & ASTRONOMY' : isLifeScience ? 'LIFE SCIENCE' : isChemistry ? 'CHEMISTRY' : 'LESSON FIELD GUIDE'
  const background = isSpace ? 'linear-gradient(115deg, #101a35, #263e66)' : isLifeScience ? 'linear-gradient(115deg, #173b35, #6b9476)' : isChemistry ? 'linear-gradient(115deg, #35234b, #7d5d9c)' : 'linear-gradient(115deg, #174b50, #5b9b8b)'
  return <Box role="img" aria-label={`${subject.toLowerCase()} illustration for ${title}`} sx={{ height: { xs: 160, sm: 200, md: 230 }, mb: 4, position: 'relative', overflow: 'hidden', borderRadius: 2, background }}>
    {image ? <Box component="img" src={image} alt={isSpace ? 'Illustration of the Sun and planets in our solar system' : `${title} lesson illustration`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><Box sx={{ position: 'absolute', width: 180, height: 180, right: '14%', top: -35, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.26)', boxShadow: '0 0 0 28px rgba(255,255,255,0.06), 0 0 0 58px rgba(255,255,255,0.04)' }} /><Box sx={{ position: 'absolute', width: 82, height: 82, right: '22%', top: 28, borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,.88), rgba(255,255,255,.08) 70%)' }} /><ArticleOutlinedIcon sx={{ position: 'absolute', right: { xs: 24, sm: 48 }, bottom: 22, fontSize: 62, color: 'rgba(255,255,255,0.72)' }} /></>}
    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(9,20,30,.72), rgba(9,20,30,.04) 85%)' }} />
    <Typography variant="overline" sx={{ position: 'absolute', left: { xs: 20, sm: 28 }, bottom: { xs: 18, sm: 24 }, color: 'white', fontWeight: 800, letterSpacing: 2 }}>{subject}</Typography>
  </Box>
}

const ArticleLessonContent: FC<{ description: string; blocks?: ArticleContentBlock[]; vocabulary?: ArticleVocabularyEntry[]; checkpoints?: LearnerArticleCheckpoint[]; helpDisabledSections?: number[]; enrollmentId: number; lessonId: number; interactive: boolean; onFinalPageChange: (isFinal: boolean) => void }> = ({ description, blocks, vocabulary, checkpoints, helpDisabledSections, enrollmentId, lessonId, interactive, onFinalPageChange }) => {
  const pages = useMemo(() => {
    if (!blocks?.length) {
      const sections = description.split(/(?=<h[1-6][^>]*>)|\n(?=(?:#{1,6}\s+|\d+[.)]\s+))/i).filter((section) => section.trim())
      return sections.map((section) => [{ type: 'text' as const, text: section }])
    }
    const nextPages: ArticleContentBlock[][] = [[]]
    blocks.forEach((block) => {
      if (block.type === 'heading' && nextPages[nextPages.length - 1].length) nextPages.push([])
      nextPages[nextPages.length - 1].push(block)
    })
    return nextPages.filter((pageBlocks) => pageBlocks.length)
  }, [blocks, description])
  const [page, setPage] = useState(0)
  const readingPaneRef = useRef<HTMLDivElement>(null)
  const readAloud = useReadAloud(readingPaneRef)
  const { stop: stopReadAloud } = readAloud
  const [wordLookup, setWordLookup] = useState<{ term: string; entry?: ArticleVocabularyEntry } | null>(null)
  const vocabularyByWord = useMemo(() => new Map((vocabulary ?? []).filter((entry) => normalizeWord(entry.word) && entry.definition.trim()).map((entry) => [normalizeWord(entry.word), entry] as const)), [vocabulary])
  useEffect(() => { stopReadAloud(); setWordLookup(null) }, [pages, page, stopReadAloud])
  const openWordMeaning = (point?: { x: number; y: number }) => {
    if (!vocabularyByWord.size) return
    const selectedText = window.getSelection()?.toString().trim() ?? ''
    const term = selectedText || (point ? getWordAtPoint(point.x, point.y) ?? '' : '')
    if (!term || term.length > 60) return
    setWordLookup({ term, entry: vocabularyByWord.get(normalizeWord(term)) })
  }
  const readAloudStatusLabel = readAloud.status === 'playing' ? 'Reading aloud' : readAloud.status === 'paused' ? 'Reading paused' : ''
  const isLegacyRichText = !blocks?.length && /<[^>]+>/.test(description)
  const interactionsEnabled = interactive && isLegacyRichText
  const totalPages = Math.max(pages.length, 1)
  const pageBlocks = pages[page] ?? [{ type: 'text' as const, text: description }]
  const pageSections = useMemo(() => {
    let section = -1
    return pages.map((pageBlockList) => {
      const first = pageBlockList[0]
      if (first && first.type !== 'image' && /<h2\b/i.test(first.text)) section += 1
      return Math.max(section, 0)
    })
  }, [pages])
  const sectionTitles = useMemo(() => getArticleSectionTitles(description), [description])
  const currentSection = pageSections[page] ?? 0
  const [interactionState, setInteractionState] = useState<ArticleInteractionState | null>(null)
  const [savingInteraction, setSavingInteraction] = useState(false)
  const [passedCheckpointIds, setPassedCheckpointIds] = useState<Set<number>>(() => new Set())
  const [savingCheckpointId, setSavingCheckpointId] = useState<number | null>(null)
  const checkpointById = useMemo(() => new Map((checkpoints ?? []).map((checkpoint) => [checkpoint.id, checkpoint] as const)), [checkpoints])
  const responseById = useMemo(() => new Map((interactionState?.checkpointResponses ?? []).map((response) => [response.checkpointId, response] as const)), [interactionState])
  const pageFragments = useMemo(() => isLegacyRichText ? splitArticleFragments(pageBlocks.filter((block) => block.type !== 'image').map((block) => block.text).join('\n')) : [], [isLegacyRichText, pageBlocks])
  const pageCheckpointIds = pageFragments.flatMap((fragment) => fragment.type === 'checkpoint' && checkpointById.has(fragment.id) ? [fragment.id] : [])
  const checkpointsBlocked = interactionsEnabled && pageCheckpointIds.length > 0 && (!interactionState || pageCheckpointIds.some((id) => !passedCheckpointIds.has(id)))
  useEffect(() => {
    setInteractionState(null)
    setPassedCheckpointIds(new Set())
    if (!interactionsEnabled) return
    let active = true
    getArticleInteractions(enrollmentId, lessonId)
      .then((state) => {
        if (!active) return
        setInteractionState(state)
        setPassedCheckpointIds(new Set(state.checkpointResponses.map((response) => response.checkpointId)))
      })
      .catch(() => { if (active) toast.add({ title: 'Check-ins unavailable', description: 'Refresh the page to load this article’s check-ins.', type: 'error' }) })
    return () => { active = false }
  }, [enrollmentId, lessonId, interactionsEnabled])
  useEffect(() => {
    onFinalPageChange(page >= totalPages - 1 && !checkpointsBlocked)
  }, [checkpointsBlocked, onFinalPageChange, page, totalPages])
  useEffect(() => {
    if (readingPaneRef.current) readingPaneRef.current.scrollTop = 0
  }, [page, pages.length])
  const saveSectionHelp = async (sectionIndex: number, question = '') => {
    setSavingInteraction(true)
    try {
      const helpRequest = await requestArticleSectionHelp(enrollmentId, lessonId, sectionIndex, question)
      setInteractionState((current) => current && { ...current, helpRequests: [...current.helpRequests.filter((item) => item.sectionIndex !== sectionIndex), helpRequest] })
    } catch (error) {
      toast.add({ title: 'Unable to send your request', description: error instanceof Error ? error.message : 'Try again.', type: 'error' })
    } finally {
      setSavingInteraction(false)
    }
  }
  const submitCheckpoint = async (checkpointId: number, answer: { selectedOption: number } | { skipped: true }) => {
    setSavingCheckpointId(checkpointId)
    try {
      const checkpointResponse = await recordArticleCheckpointAnswer(enrollmentId, lessonId, checkpointId, answer)
      setInteractionState((current) => current && { ...current, checkpointResponses: [...current.checkpointResponses.filter((item) => item.checkpointId !== checkpointId), checkpointResponse] })
    } catch (error) {
      toast.add({ title: 'Unable to save your answer', description: error instanceof Error ? error.message : 'Try again.', type: 'error' })
    } finally {
      setSavingCheckpointId(null)
    }
  }
  const renderLegacyFragments = () => {
    const nodes: ReactNode[] = []
    for (const [index, fragment] of pageFragments.entries()) {
      if (fragment.type === 'html') {
        nodes.push(<Box key={`html-${index}`} dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(fragment.html) }} />)
        continue
      }
      const checkpoint = checkpointById.get(fragment.id)
      if (!checkpoint || !interactionsEnabled) continue
      if (!interactionState) {
        nodes.push(<Typography key={`checkpoint-loading-${fragment.id}`} color="text.secondary">Loading check…</Typography>)
        break
      }
      const blocking = !passedCheckpointIds.has(checkpoint.id)
      nodes.push(<ArticleCheckpointCard key={checkpoint.id} checkpoint={checkpoint} response={responseById.get(checkpoint.id)} blocking={blocking} saving={savingCheckpointId === checkpoint.id} onAnswer={(selectedOption) => void submitCheckpoint(checkpoint.id, { selectedOption })} onSkip={() => void submitCheckpoint(checkpoint.id, { skipped: true })} onContinue={() => setPassedCheckpointIds((current) => new Set(current).add(checkpoint.id))} />)
      if (blocking) break
    }
    return nodes
  }
  const renderParagraph = (block: string, key: string) => {
    const heading = block.match(/^(?:#{1,6}\s+|\d+[.)]\s+)(.+)$/)
    const keyFact = block.match(/^(?:key fact|did you know)\s*:?\s*(.+)$/i) ?? block.match(/Jupiter is the largest planet[^.!?]*Great Red Spot[^.!?]*[.!?]?/i)
    if (heading) return <Typography key={key} variant="h5" component="h2" sx={{ mt: key === '0' || key.endsWith('-0') ? 0 : 3.5, mb: 1.5, color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>{heading[1]}</Typography>
    if (keyFact) {
      const fact = keyFact[1] ?? keyFact[0]
      const remainder = block.replace(keyFact[0], '').trim()
      return <Box key={key}>{remainder && <Typography variant="body1" sx={{ mb: 2.5, lineHeight: 2, fontSize: { xs: '1rem', md: '1.08rem' } }}>{remainder}</Typography>}<Paper elevation={0} sx={{ display: 'flex', gap: 1.5, p: { xs: 2, sm: 2.5 }, my: 2.5, borderLeft: 4, borderColor: 'warning.main', borderRadius: 1.5, backgroundColor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.1) }}><CelebrationOutlinedIcon color="warning" sx={{ mt: 0.2 }} /><Box><Typography variant="overline" color="warning.dark" sx={{ display: 'block', fontWeight: 800, letterSpacing: 1 }}>Key fact</Typography><Typography sx={{ lineHeight: 1.8, fontWeight: 600 }}>{fact}</Typography></Box></Paper></Box>
    }
    return <Typography key={key} variant="body1" sx={{ mb: 2.5, lineHeight: 2, fontSize: { xs: '1rem', md: '1.08rem' }, color: 'text.primary' }}>{block}</Typography>
  }
  return <Box>
    <Box sx={{ mb: 3 }}><Typography variant="body1" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>Page {page + 1} of {totalPages}</Typography><LinearProgress variant="determinate" value={((page + 1) / totalPages) * 100} aria-label={`Article progress: page ${page + 1} of ${totalPages}`} sx={{ height: 12, borderRadius: 6, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 6 } }} /></Box>
    {(readAloud.supported || vocabularyByWord.size > 0) && <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
      {readAloud.supported && <Stack role="group" aria-label="Read aloud controls" direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        {readAloud.status === 'idle' && <Button variant="contained" startIcon={<VolumeUpOutlinedIcon />} onClick={readAloud.play}>Read aloud</Button>}
        {readAloud.status === 'playing' && <Button variant="outlined" startIcon={<PauseIcon />} onClick={readAloud.pause}>Pause</Button>}
        {readAloud.status === 'paused' && <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={readAloud.resume}>Resume</Button>}
        {readAloud.status !== 'idle' && <Button variant="outlined" color="inherit" startIcon={<StopRoundedIcon />} onClick={readAloud.stop}>Stop</Button>}
        <TextField select size="small" label="Reading speed" value={readAloud.rate} onChange={(event) => readAloud.setRate(Number(event.target.value))} sx={{ minWidth: 140 }}>
          {[0.75, 1, 1.25, 1.5].map((speed) => <MenuItem key={speed} value={speed}>{speed}x</MenuItem>)}
        </TextField>
        <Typography variant="body2" color="text.secondary" aria-live="polite">{readAloudStatusLabel}</Typography>
      </Stack>}
      {vocabularyByWord.size > 0 && <Typography variant="body2" color="text.secondary">Select or click a word to see its meaning.</Typography>}
    </Stack>}
    {wordLookup && <Paper elevation={0} role="status" aria-live="polite" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: { xs: 2, sm: 2.5 }, mb: 2.5, border: 1, borderColor: 'primary.main', borderRadius: 1.5, backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.06) }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="overline" color="primary.main" sx={{ display: 'block', fontWeight: 800, letterSpacing: 1 }}>Word meaning</Typography>
        {wordLookup.entry ? <>
          <Typography variant="h6" sx={{ fontWeight: 800, wordBreak: 'break-word' }}>{wordLookup.entry.word}</Typography>
          <Typography sx={{ lineHeight: 1.7 }}>{wordLookup.entry.definition}</Typography>
          {wordLookup.entry.example && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', lineHeight: 1.7 }}>Example: {wordLookup.entry.example}</Typography>}
        </> : <Typography>No meaning has been added for &ldquo;{wordLookup.term}&rdquo; yet.</Typography>}
      </Box>
      <IconButton size="small" aria-label="Close word meaning" onClick={() => setWordLookup(null)}><CloseIcon fontSize="small" /></IconButton>
    </Paper>}
    {interactionsEnabled && interactionState && sectionTitles[currentSection] && !helpDisabledSections?.includes(currentSection) && <ArticleSectionHelp key={currentSection} sectionTitle={sectionTitles[currentSection] ?? 'this section'} helpRequest={interactionState.helpRequests.find((item) => item.sectionIndex === currentSection)} saving={savingInteraction} onFlag={() => saveSectionHelp(currentSection)} onAskQuestion={(question) => saveSectionHelp(currentSection, question)} />}
    <Box ref={readingPaneRef} role="region" aria-label="Article text" tabIndex={0} onMouseUp={(event) => openWordMeaning({ x: event.clientX, y: event.clientY })} onKeyUp={(event) => { if (event.key === 'Shift' || event.key === 'Enter') openWordMeaning() }} sx={{ maxHeight: { xs: 440, md: 'min(68vh, 700px)' }, minHeight: 220, overflowY: 'auto', overflowX: 'hidden', pr: 1, scrollBehavior: 'smooth' }}>
      {isLegacyRichText ? <Box sx={{ lineHeight: 2, '& p': { mb: 2.5, fontSize: { xs: '1rem', md: '1.08rem' } }, '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 3.5, mb: 1.5, fontWeight: 800, letterSpacing: '-0.02em' }, '& blockquote': { m: '24px 0', p: { xs: 2, sm: 2.5 }, borderLeft: 4, borderColor: 'warning.main', borderRadius: 1.5, backgroundColor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.1), fontWeight: 600 }, '& ul, & ol': { pl: 3, mb: 2.5 } }} >{renderLegacyFragments()}</Box> : pageBlocks.map((block, index) => {
        if (block.type === 'heading') return <Typography key={`heading-${index}`} variant="h5" component="h2" sx={{ mt: index === 0 ? 0 : 3.5, mb: 1.5, fontWeight: 800, letterSpacing: '-0.02em' }}>{block.text}</Typography>
        if (block.type === 'image') return block.imageUrl ? <Box component="figure" key={`image-${index}`} sx={{ width: '100%', m: '28px 0 32px' }}><Box component="img" src={block.imageUrl} alt={block.caption || block.marker || 'Article supporting image'} sx={{ display: 'block', width: '100%', maxHeight: 580, objectFit: 'contain', borderRadius: 1.5 }} />{block.caption && <Typography component="figcaption" variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>{block.caption}</Typography>}</Box> : null
        return block.text.split(/\n+/).map((paragraph, paragraphIndex) => renderParagraph(paragraph, `${index}-${paragraphIndex}`))
      })}
    </Box>
    <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mt: 5 }}><Button size="large" variant="outlined" onClick={() => setPage((current) => current - 1)} disabled={page === 0} sx={{ minWidth: 140, py: 1.25 }}>Previous page</Button><Button size="large" variant="contained" onClick={() => setPage((current) => current + 1)} disabled={page === totalPages - 1 || checkpointsBlocked} sx={{ minWidth: 160, py: 1.25 }}>Next page</Button></Stack>
  </Box>
}

const PracticeLessonView: FC<{ questions: NonNullable<DashboardLesson['practiceQuestions']>; onAnswer: (questionId: number, answer: string) => void }> = ({ questions, onAnswer }) => {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  useEffect(() => { setQuestionIndex(0); setSelectedAnswer(null) }, [questions])
  if (!questions.length) return <EmptyState title="Practice unavailable" description="This practice lesson does not have any questions yet." />
  const question = questions[questionIndex]
  const answered = selectedAnswer !== null
  const isCorrect = selectedAnswer === question.correctAnswer
  const isLast = questionIndex === questions.length - 1
  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Stack direction="row" justifyContent="space-between"><Typography variant="overline" color="primary.main">Practice question {questionIndex + 1} of {questions.length}</Typography><Chip size="small" label="Unlimited practice" /></Stack><Typography variant="h5">{question.question}</Typography><Stack spacing={1} role="radiogroup" aria-label="Practice answer options">{question.options.filter(Boolean).map((option) => <Button key={option} variant={selectedAnswer === option ? 'contained' : 'outlined'} color={answered ? option === question.correctAnswer ? 'success' : selectedAnswer === option ? 'error' : 'inherit' : 'inherit'} disabled={answered} onClick={() => { setSelectedAnswer(option); onAnswer(question.id, option) }} sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>{option}</Button>)}</Stack>{answered && <Paper elevation={0} sx={{ p: 2, backgroundColor: isCorrect ? 'success.light' : 'error.light' }}><Typography sx={{ fontWeight: 700, mb: 0.5 }}>{isCorrect ? 'Correct' : `Not quite. The correct answer is ${question.correctAnswer}.`}</Typography><Typography variant="body2">{question.explanation}</Typography></Paper>}{answered && <Button variant="contained" onClick={() => { setQuestionIndex((index) => isLast ? 0 : index + 1); setSelectedAnswer(null) }}>{isLast ? 'Practice again' : 'Next question'}</Button>}</Stack></Paper>
}

const CourseViewer: FC<{ course: DashboardCourse; enrollmentId: number; lessonProgress: Record<number, LessonProgress>; progress: number; completedLessonIds: number[]; started: boolean; timeSpentSeconds: number; quizResults: Record<number, DashboardQuizResult>; weakAreas: WeakArea[]; attendance: Record<number, 'Present' | 'Absent'>; isClass: boolean; now: Date; initialLessonId?: number; onBack: () => void; reviewTargetId: number; reviewInstructorName: string; onStart: () => void; onCompleteLesson: (lessonId: number) => void | Promise<void>; onQuizStart: (lessonId: number) => Promise<QuizAttempt | null>; onQuizAnswer: (lessonId: number, attemptId: number, questionId: number, answer: QuizAnswerRecord) => Promise<void>; onQuizSubmit: (lessonId: number, attemptId: number, answers: Record<number, QuizAnswerRecord>, disqualified?: boolean) => Promise<DashboardQuizResult | null>; onQuizViolation: (lessonId: number, attemptId: number, violation: QuizViolation) => Promise<void>; onQuizActiveChange: (active: boolean) => void; onPracticeAnswer: (lessonId: number, questionId: number, answer: string) => void; sessionJoinClicks: Record<number, string>; closedLiveSessionIds: number[]; onJoinLiveSession: (lessonId: number, meetingUrl: string) => Promise<void>; readOnly?: boolean }> = ({ course, enrollmentId, lessonProgress, progress, completedLessonIds, started, timeSpentSeconds, quizResults, weakAreas, attendance = {}, isClass, now, initialLessonId, onBack, reviewTargetId, reviewInstructorName, onStart, onCompleteLesson, onQuizStart, onQuizAnswer, onQuizSubmit, onQuizViolation, onQuizActiveChange, onPracticeAnswer, sessionJoinClicks, closedLiveSessionIds, onJoinLiveSession, readOnly = false }) => {
  const lessons = getLessons(course)
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId ?? lessons[0]?.id)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [articleFinalPage, setArticleFinalPage] = useState(false)
  const [interactiveViewed, setInteractiveViewed] = useState(false)
  const [simulationValidated, setSimulationValidated] = useState(false)
  const submitQuiz = () => undefined
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0]
  const selectedEnrollmentProgress = selectedLesson ? lessonProgress[selectedLesson.id] : undefined
  const persistVideoPosition = (lessonId: number, seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return
    void saveLessonEngagement(enrollmentId, lessonId, { activeSeconds: 0, videoPositionSeconds: seconds }).catch(() => undefined)
  }

  useEffect(() => { setSelectedLessonId(initialLessonId ?? lessons[0]?.id) }, [course.id, initialLessonId])
  useEffect(() => { setQuizAttempt(null); setArticleFinalPage(false); setInteractiveViewed(false); setSimulationValidated(false); onQuizActiveChange(false) }, [selectedLessonId])

  if (!selectedLesson) return <EmptyState title="Course content unavailable" description="This course does not have any lessons yet." actionLabel="Back to courses" onAction={onBack} />

  const isCompleted = completedLessonIds.includes(selectedLesson.id)
  const completionLessons = getCompletionLessons(course)
  const isCourseComplete = completionLessons.length > 0 && progress === 100
  const failedQuizLessons = lessons.filter((lesson) => lesson.type === 'quiz' && quizResults[lesson.id] && !quizResults[lesson.id].passed)
  const allQuizzesPassed = lessons.filter((lesson) => lesson.type === 'quiz').every((lesson) => quizResults[lesson.id]?.passed === true)
  const liveLessons = lessons.filter((lesson) => lesson.type === 'live')
  const attendedSessionCount = liveLessons.filter((lesson) => attendance[lesson.id] === 'Present').length
  const allLiveLessonsPresent = !isClass || liveLessons.every((lesson) => attendance[lesson.id] === 'Present')
  const certificateEligible = isCourseComplete && (!course.certificate || (allQuizzesPassed && allLiveLessonsPresent))
  const quizResult = selectedLessonId === undefined ? null : quizResults[selectedLessonId] ?? null
  const quizQuestions = selectedLesson.quizQuestions ?? []
  const passingScore = selectedLesson.passThreshold ?? 70
  const hasAnsweredQuiz = quizQuestions.length > 0 && quizQuestions.every((question) => quizAnswers[question.id] !== undefined)
  const canRetakeQuiz = Boolean(quizResult && !readOnly && !quizResult.passed && (quizResult.retakeApproved || (!quizResult.disqualified && !quizResult.violationCount)))
  const isQuizFinished = selectedLesson.type === 'quiz' && (isCompleted || Boolean(quizResult)) && !canRetakeQuiz
  const canCompleteLesson = (selectedLesson.type !== 'quiz' || isQuizFinished) && (selectedLesson.type !== 'live' || attendance[selectedLesson.id] === 'Present') && (selectedLesson.type !== 'simulation' || simulationValidated)&& (selectedLesson.type !== 'article' || articleFinalPage)
  const liveSessionStart = selectedLesson.scheduledAt ? new Date(selectedLesson.scheduledAt).getTime() : NaN
  const liveSessionEnd = selectedLesson.endsAt ? new Date(selectedLesson.endsAt).getTime() : liveSessionStart + (selectedLesson.estimatedDuration ?? 60 * 60) * 1000
  const liveJoinWindowEnd = liveSessionStart + sessionJoinWindowMs
  const liveMeetingUrl = selectedLesson.meetingUrl || course.meetingLink
  const liveAttendanceStatus = attendance[selectedLesson.id]
  const hasJoinedLiveSession = Boolean(sessionJoinClicks[selectedLesson.id])
  const serverClosedLiveSession = closedLiveSessionIds.includes(selectedLesson.id)
  const canJoinLiveSession = selectedLesson.type === 'live' && Boolean(liveMeetingUrl) && Number.isFinite(liveSessionStart) && Number.isFinite(liveSessionEnd) && now.getTime() >= liveSessionStart && now.getTime() < liveJoinWindowEnd && now.getTime() < liveSessionEnd && !hasJoinedLiveSession && !serverClosedLiveSession
  const isLessonLocked = (lessonId: number) => {
    if (isClass) return false
    const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId)
    return lessonIndex > 0 && lessons.slice(0, lessonIndex).filter((lesson) => lesson.type !== 'practice').some((lesson) => !completedLessonIds.includes(lesson.id))
  }

  if (!started) return <>
    <Box component="button" type="button" onClick={onBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0, mb: 3, border: 0, background: 'none', color: 'primary.main', cursor: 'pointer', font: 'inherit' }}><ArrowBackIcon fontSize="small" /> Back to My Courses</Box>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1} sx={{ mb: 3 }}><Box><Typography variant="h4" sx={{ mb: 0.5 }}>{course.title}</Typography><Typography color="text.secondary">{course.category} · {course.level} · Tutor: {course.tutor}</Typography></Box><Chip label="Not started" color="default" /></Stack>
    <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Typography variant="h5" sx={{ mb: 0.5 }}>Course content</Typography><Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>Review the lessons below, then start the course when you&apos;re ready to learn.</Typography><Stack spacing={2} sx={{ mb: 3 }}>{course.modules.map((module) => <Box key={module.id}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>{module.title}</Typography><Stack spacing={0.5}>{module.lessons.map((lesson) => <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1.5, backgroundColor: 'background.default' }}><Box sx={{ display: 'flex', color: 'text.secondary' }}>{iconForLesson(lesson.type)}</Box><Typography variant="body2" sx={{ flex: 1 }}>{lesson.title}</Typography><Typography variant="caption" color="text.secondary">{lesson.duration}</Typography></Box>)}</Stack></Box>)}</Stack><Button variant="contained" size="large" onClick={onStart} startIcon={<PlayCircleOutlineIcon />}>Start course</Button></Paper>
  </>

  if (selectedLesson.type === 'practice') return <>
    <Box component="button" type="button" onClick={onBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0, mb: 3, border: 0, background: 'none', color: 'primary.main', cursor: 'pointer', font: 'inherit' }}><ArrowBackIcon fontSize="small" /> Back to Course</Box>
    <PracticeLessonView questions={selectedLesson.practiceQuestions ?? []} onAnswer={(questionId, answer) => onPracticeAnswer(selectedLesson.id, questionId, answer)} />
  </>

  if ((selectedLesson.type as string) === 'quiz') return <>
    {!quizAttempt && <Box component="button" type="button" onClick={onBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0, mb: 3, border: 0, background: 'none', color: 'primary.main', cursor: 'pointer', font: 'inherit' }}><ArrowBackIcon fontSize="small" /> Back to Course</Box>}
    {readOnly || isQuizFinished ? <QuizResultReview lesson={selectedLesson} result={quizResult} passingScore={passingScore} /> : <QuizLessonView lesson={selectedLesson} attempt={quizAttempt} onBegin={async () => { const next = await onQuizStart(selectedLesson.id); setQuizAttempt(next); return next }} onSave={(questionId, answer) => quizAttempt ? onQuizAnswer(selectedLesson.id, quizAttempt.id, questionId, answer) : Promise.resolve()} onSubmit={async (answers, disqualified) => { if (!quizAttempt) return null; const submitted = await onQuizSubmit(selectedLesson.id, quizAttempt.id, answers, disqualified); if (submitted) { setQuizAttempt(null); onQuizActiveChange(false); if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen().catch(() => undefined) }; return submitted }} onViolation={(violation) => quizAttempt ? onQuizViolation(selectedLesson.id, quizAttempt.id, violation) : Promise.resolve()} onActiveChange={onQuizActiveChange} now={now} requiresSchedule={isClass} result={quizResult} passingScore={passingScore} strikeThreshold={3} />}
  </>

  if (selectedLesson.type === 'stepByStepSolver') return <>
    <Box component="button" type="button" onClick={onBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0, mb: 3, border: 0, background: 'none', color: 'primary.main', cursor: 'pointer', font: 'inherit' }}><ArrowBackIcon fontSize="small" /> Back to My Courses</Box>
    <Box sx={{ mb: 3 }}><Typography variant="h4" sx={{ mb: 1 }}>{course.title}</Typography><Typography color="text.secondary">{selectedLesson.title} · {selectedLesson.description}</Typography></Box>
    <StepByStepSolverLesson key={selectedLesson.id} config={selectedLesson.stepByStepSolver ?? { problems: [] }} enrollmentId={enrollmentId} lessonId={selectedLesson.id} onCompleted={() => { void onCompleteLesson(selectedLesson.id) }} />
  </>

  return <>
    <Box component="button" type="button" onClick={onBack} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0, mb: 3, border: 0, background: 'none', color: 'primary.main', cursor: 'pointer', font: 'inherit' }}><ArrowBackIcon fontSize="small" /> Back to My Courses</Box>
    {isCourseComplete && <Paper elevation={0} role="status" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, mb: 3, border: 1, borderColor: allQuizzesPassed ? 'primary.main' : 'warning.main', backgroundColor: allQuizzesPassed ? 'primary.main' : (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.08), color: allQuizzesPassed ? 'primary.contrastText' : 'text.primary' }}>{allQuizzesPassed ? <CelebrationOutlinedIcon /> : <QuizOutlinedIcon color="warning" />}<Box><Typography sx={{ fontWeight: 700 }}>{allQuizzesPassed ? 'Congratulations!' : 'Course completed'}</Typography><Typography variant="body2" sx={{ color: 'inherit', opacity: 0.9 }}>{allQuizzesPassed ? 'You completed every lesson in this course.' : 'You completed every lesson, but some quizzes were not passed.'}</Typography>{failedQuizLessons.length > 0 && <Stack spacing={0.25} sx={{ mt: 1 }}>{failedQuizLessons.map((lesson) => <Button key={lesson.id} variant="text" size="small" onClick={() => setSelectedLessonId(lesson.id)} sx={{ justifyContent: 'flex-start', p: 0, minWidth: 0, color: 'inherit', textTransform: 'none' }}>{failedQuizLessons.length} quiz{failedQuizLessons.length === 1 ? '' : 'zes'} not passed · View {lesson.title}</Button>)}</Stack>}{course.certificate && <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>{certificateEligible ? 'Certificate unlocked.' : 'Certificate unlocks after all quizzes are passed and every live session is marked Present.'}</Typography>}</Box></Paper>}
    <Box sx={{ mb: 3 }}><Typography variant="h4" sx={{ mb: 1 }}>{course.title}</Typography><Typography component="div" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Avatar sx={{ width: 24, height: 24, fontSize: 11, fontWeight: 700, backgroundColor: 'primary.main' }}>{course.tutor.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Avatar><Box component="span">{course.category} · {course.level} · Tutor: {course.tutor}</Box></Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>Time spent learning: {formatTimeSpent(timeSpentSeconds)}</Typography><Box sx={{ mt: 2, maxWidth: 560 }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}><Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Course progress</Typography><Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>{progress}%</Typography></Stack><LinearProgress variant="determinate" value={progress} aria-label={`Course progress: ${progress}%`} sx={{ height: 9, borderRadius: 5, backgroundColor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 5 } }} /></Box></Box>
    {isClass && liveLessons.length > 0 && <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 1.5 }}><Box><Typography variant="h6">Session attendance</Typography><Typography variant="body2" color="text.secondary">{attendedSessionCount} of {liveLessons.length} sessions attended</Typography></Box><Chip color={attendedSessionCount === liveLessons.length ? 'success' : 'default'} label={`${attendedSessionCount}/${liveLessons.length} Present`} /></Stack><Stack spacing={0.75}>{liveLessons.map((lesson) => { const status = attendance[lesson.id]; return <Stack key={lesson.id} direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'background.default' }}><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{lesson.title}</Typography><Typography variant="caption" color="text.secondary">{lesson.scheduledAt ? new Date(lesson.scheduledAt).toLocaleString() : 'Schedule pending'}</Typography></Box><Chip size="small" color={status === 'Present' ? 'success' : status === 'Absent' ? 'error' : 'default'} label={status ?? 'Awaiting tutor mark'} /></Stack> })}</Stack></Paper>}
    <WeakAreasPanel enrollments={[{ id: 0, item_id: course.id, weakAreas, course }]} onOpenCourse={(_, lessonId) => { if (lessonId !== undefined) setSelectedLessonId(lessonId) }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' }, gap: 3 }}>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', alignSelf: 'start', position: { xs: 'static', lg: 'sticky' }, top: { lg: 16 }, maxHeight: { lg: 'calc(100vh - 32px)' }, overflowY: { lg: 'auto' } }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Course content</Typography><Stack spacing={1}>{course.modules.map((module) => <Box key={module.id}><Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1, mb: 0.5, fontWeight: 700, textTransform: 'uppercase' }}>{module.title}</Typography><Stack spacing={0.5}>{module.lessons.map((lesson) => { const locked = isLessonLocked(lesson.id); const completed = completedLessonIds.includes(lesson.id); const selected = selectedLesson.id === lesson.id; const quizFailed = lesson.type === 'quiz' && quizResults[lesson.id] && !quizResults[lesson.id].passed; return <Box key={lesson.id} component="button" type="button" disabled={locked} aria-disabled={locked} onClick={() => setSelectedLessonId(lesson.id)} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, p: 1, border: 0, borderLeft: 3, borderRadius: 1.5, borderColor: selected ? 'primary.main' : quizFailed ? 'warning.main' : completed ? 'success.light' : locked ? 'divider' : 'transparent', backgroundColor: selected ? (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12) : locked ? 'action.disabledBackground' : quizFailed ? (theme) => alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.08) : completed ? 'background.default' : 'transparent', color: 'text.primary', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : completed && !selected ? 0.7 : 1, fontFamily: 'inherit', textAlign: 'left', '&:hover': { backgroundColor: locked ? 'action.disabledBackground' : selected ? 'rgba(16, 125, 111, 0.16)' : 'action.hover' } }}><Box sx={{ display: 'flex', color: quizFailed ? 'warning.main' : completed ? 'success.main' : locked ? 'text.disabled' : 'text.secondary' }}>{quizFailed ? <CloseIcon fontSize="small" /> : completed ? <CheckCircleOutlineIcon fontSize="small" /> : iconForLesson(lesson.type)}</Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" noWrap sx={{ fontWeight: selectedLesson.id === lesson.id ? 600 : 400 }}>{lesson.title}</Typography><Typography variant="caption" color="text.secondary">{lesson.duration}</Typography></Box></Box> })}</Stack></Box>)}</Stack></Paper>
      <Stack spacing={2}>
        {selectedLesson.type !== 'article' && (selectedLesson.type !== 'interactive' || interactiveViewed) && (selectedLesson.type !== 'simulation' || simulationValidated || isCompleted)&& <Button
          variant="contained"
          color={isCompleted ? 'success' : 'primary'}
          disabled={!isCompleted && !canCompleteLesson}
          onClick={() => onCompleteLesson(selectedLesson.id)}
          startIcon={<CheckCircleOutlineIcon />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isCompleted ? 'Completed' : 'Mark lesson complete'}
        </Button>}
        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}><Box sx={{ minHeight: { xs: 220, md: 340 }, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(16, 125, 111, 0.18), rgba(16, 125, 111, 0.04))' }}>{selectedLesson.type === 'live' ? <Box sx={{ minHeight: { xs: 220, md: 340 }, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}><VideoCallOutlinedIcon color="primary" sx={{ fontSize: 72 }} /><Typography color="text.secondary">Live lesson · {selectedLesson.scheduledAt ? new Date(selectedLesson.scheduledAt).toLocaleString() : 'Schedule pending'}</Typography><Button variant="contained" disabled={!canJoinLiveSession} aria-disabled={!canJoinLiveSession} onClick={() => { if (liveMeetingUrl) void onJoinLiveSession(selectedLesson.id, liveMeetingUrl) }} startIcon={<VideoCallOutlinedIcon />}>{liveAttendanceStatus === 'Present' ? 'Attendance confirmed' : liveAttendanceStatus === 'Absent' ? 'Marked absent' : hasJoinedLiveSession ? 'Joined — attendance pending' : serverClosedLiveSession || now.getTime() >= liveJoinWindowEnd || now.getTime() >= liveSessionEnd ? 'Join window closed' : now.getTime() < liveSessionStart ? 'Available at scheduled time' : liveMeetingUrl ? 'Join Class' : 'Meeting link unavailable'}</Button>{hasJoinedLiveSession && <Typography variant="caption" color="text.secondary">Join recorded {new Date(sessionJoinClicks[selectedLesson.id]).toLocaleString()}. Attendance is confirmed by your tutor.</Typography>}</Box> : selectedLesson.type === 'video' ? <LessonVideoPlayer key={selectedLesson.id} src={selectedLesson.videoUrl} poster={selectedLesson.thumbnailUrl} captionsVtt={selectedLesson.captionsVtt} captionLanguage={selectedLesson.captionLanguage} transcript={selectedLesson.transcript} fallbackDuration={selectedLesson.duration} initialPosition={selectedEnrollmentProgress?.videoPositionSeconds ?? 0} onPositionChange={(seconds) => persistVideoPosition(selectedLesson.id, seconds)} /> : selectedLesson.type === 'simulation' ? (selectedLesson.simulation ? <SimulationLesson config={selectedLesson.simulation} onValidated={() => setSimulationValidated(true)} /> : selectedLesson.platformEngineId && getPlatformEngine(selectedLesson.platformEngineId as PlatformEngineId) ? <PlatformEnginePreview engineId={selectedLesson.platformEngineId as PlatformEngineId} mathTopic={selectedLesson.mathTopic} topicTitle={selectedLesson.topicTitle} onComplete={() => setSimulationValidated(true)} /> : <EmptyState title="Simulation unavailable" description="This simulation has not been configured yet." />) : selectedLesson.type === 'interactive' ? <InteractiveDiagramViewer key={selectedLesson.id} imageUrl={selectedLesson.baseImageUrl} hotspots={selectedLesson.interactiveHotspots ?? []} onViewed={() => setInteractiveViewed(true)} /> : selectedLesson.type === 'article' ? <Box sx={{ minHeight: { xs: 220, md: 340 }, width: '100%', p: { xs: 2, sm: 3, md: 4 }, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: 'linear-gradient(145deg, rgba(242, 247, 243, 0.9), rgba(231, 242, 237, 0.72))' }}><Box sx={{ width: '100%', p: { xs: 3, sm: 4, md: 6 }, backgroundColor: 'background.paper', border: 1, borderColor: 'rgba(16, 125, 111, 0.16)', borderRadius: 2, boxShadow: '0 12px 30px rgba(15, 55, 48, 0.08)' }}><ArticleIllustration title={selectedLesson.title} description={selectedLesson.description} imageUrl={selectedLesson.articleHeaderImageUrl || selectedLesson.thumbnailUrl} /><Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1.4 }}>Article lesson</Typography><Typography variant="h4" sx={{ mt: 0.5, mb: 1 }}>{selectedLesson.title}</Typography><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4, color: 'text.secondary' }}><Typography variant="body2">A guided lesson from {course.tutor}</Typography><Typography variant="body2" aria-hidden="true">·</Typography><AccessTimeOutlinedIcon sx={{ fontSize: 17 }} /><Typography variant="body2">{Math.max(1, Math.ceil(selectedLesson.description.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length / 200))} min read</Typography></Stack><ArticleLessonContent key={selectedLesson.id} description={selectedLesson.description} blocks={selectedLesson.articleBlocks} vocabulary={selectedLesson.articleVocabulary} checkpoints={selectedLesson.articleCheckpoints} helpDisabledSections={selectedLesson.articleHelpDisabledSections} enrollmentId={enrollmentId} lessonId={selectedLesson.id} interactive={!readOnly} onFinalPageChange={setArticleFinalPage} /></Box></Box> : <Box sx={{ minHeight: { xs: 220, md: 340 }, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(16, 125, 111, 0.18), rgba(16, 125, 111, 0.04))' }}><QuizOutlinedIcon color="primary" sx={{ fontSize: 72 }} /></Box>}</Box><Box sx={{ p: { xs: 2.5, md: 3 } }}><Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>{selectedLesson.type !== 'article' && <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>{selectedLesson.type}</Typography>}{selectedLesson.duration !== 'Article' && <Typography variant="body2" color="text.secondary">{selectedLesson.duration}</Typography>}</Stack>{selectedLesson.type !== 'article' && <><Typography variant="h5" sx={{ mb: 1 }}>{selectedLesson.title}</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{selectedLesson.description}</Typography></>}{selectedLesson.type === 'article' && <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 1.5, borderLeft: 3, borderColor: articleFinalPage ? 'success.main' : 'primary.light', backgroundColor: articleFinalPage ? (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.16 : 0.08) : 'action.hover' }}><Typography sx={{ lineHeight: 1.8, color: articleFinalPage ? 'success.dark' : 'text.secondary', fontWeight: articleFinalPage ? 600 : 400 }}>{articleFinalPage ? 'You made it to the final page—take a moment to enjoy how far you’ve come, then celebrate by marking this lesson complete.' : 'Enjoy the journey—each page brings a fresh perspective.'}</Typography></Paper>}{selectedLesson.type === 'quiz' && <Box sx={{ mt: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Knowledge check</Typography><Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>Answer every question, then submit the quiz. You need at least {passingScore}% to pass.</Typography>{quizQuestions.length === 0 ? <Alert severity="info">No questions have been added to this quiz yet. You can still mark this lesson complete.</Alert> : <Stack spacing={2.5}>{quizQuestions.map((question, questionIndex) => <FormControl key={question.id} component="fieldset"><FormLabel component="legend">{questionIndex + 1}. {question.question}</FormLabel><RadioGroup value={quizAnswers[question.id] === undefined ? '' : String(quizAnswers[question.id])} onChange={(event) => { setQuizAnswers((current) => ({ ...current, [question.id]: Number(event.target.value) })) }} sx={{ mt: 0.5 }}>{question.options.map((option, optionIndex) => <FormControlLabel key={question.id + '-' + optionIndex} value={optionIndex} control={<Radio />} label={option} disabled={isQuizFinished} />)}</RadioGroup></FormControl>)}</Stack>}{quizQuestions.length > 0 && <Button variant="contained" onClick={submitQuiz} disabled={isQuizFinished || !hasAnsweredQuiz} startIcon={<QuizOutlinedIcon />} sx={{ mt: 2 }}>Submit quiz</Button>}{quizResult ? <Alert severity={quizResult.passed ? 'success' : 'error'} sx={{ mt: 2 }}>Score: {quizResult.score}% · Grade: {getQuizGrade(quizResult.score)} — {quizResult.passed ? 'Passed' : 'Not passed. You need at least ' + passingScore + '% to pass.'}</Alert> : isCompleted && <Alert severity="info" sx={{ mt: 2 }}>Quiz completed. Score not available for this completion.</Alert>}</Box>}{selectedLesson.type !== 'quiz' && selectedLesson.type !== 'article' && <Typography sx={{ mt: 3, lineHeight: 1.8 }}>Mark this lesson complete when you are ready to continue.</Typography>}<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}><Button variant="contained" color={isCompleted ? 'success' : 'primary'} onClick={() => onCompleteLesson(selectedLesson.id)} disabled={isCompleted || !canCompleteLesson} startIcon={<CheckCircleOutlineIcon />}>{isCompleted ? 'Lesson completed' : 'Mark lesson complete'}</Button></Box></Box></Paper><LessonResources resources={selectedLesson.resources} /></Stack>
    </Box>
    {started && <Box sx={{ mt: 4 }}><StudentReviews targetType={isClass ? 'class' : 'course'} targetId={reviewTargetId} instructorName={reviewInstructorName} /></Box>}
  </>
}

const EmptyState: FC<{ title: string; description: string; actionLabel?: string; onAction?: () => void }> = ({ title, description, actionLabel, onAction }) => <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: 1, borderColor: 'divider', textAlign: 'center' }}><Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography><Typography color="text.secondary" sx={{ mb: actionLabel ? 2.5 : 0 }}>{description}</Typography>{actionLabel && <Button variant="contained" onClick={onAction}>{actionLabel}</Button>}</Paper>

const victoryConfetti = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * 90}ms`,
  color: ['#107d6f', '#f6b73c', '#e94f64', '#4f8cff'][index % 4],
}))

const QuizVictoryCelebration: FC = () => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 4200)
    return () => window.clearTimeout(timeout)
  }, [])

  if (!visible) return null

  return <Box sx={{ position: 'fixed', inset: 0, zIndex: 'tooltip', pointerEvents: 'none', overflow: 'hidden' }}>
    {victoryConfetti.map((piece, index) => <Box key={index} sx={{ position: 'absolute', top: -24, left: piece.left, width: 8, height: 16, borderRadius: 1, backgroundColor: piece.color, animation: 'quizConfettiFall 3.2s ease-out forwards', animationDelay: piece.delay, '@keyframes quizConfettiFall': { '0%': { opacity: 0, transform: 'translateY(0) rotate(0deg)' }, '10%': { opacity: 1 }, '100%': { opacity: 0, transform: 'translateY(110vh) rotate(540deg)' } } }} />)}
    <Paper role="status" aria-live="polite" elevation={6} sx={{ position: 'absolute', top: { xs: 24, md: 40 }, left: '50%', transform: 'translateX(-50%)', px: { xs: 2.5, md: 4 }, py: 2, borderRadius: 3, border: 1, borderColor: 'success.main', backgroundColor: 'background.paper', textAlign: 'center' }}>
      <CelebrationOutlinedIcon color="success" sx={{ fontSize: 34, mb: 0.5 }} />
      <Typography sx={{ fontWeight: 800 }}>Perfect score!</Typography>
      <Typography variant="body2" color="text.secondary">100% — excellent work.</Typography>
    </Paper>
  </Box>
}

interface StudentDashboardProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

const StudentDashboard: FC<StudentDashboardProps> = ({ darkMode, onToggleDarkMode }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const currentUser = getAuthenticatedUser()
  const currentUserId = Number(currentUser?.id)
  const [activeView, setActiveView] = useState<DashboardView>(() => dashboardViewFromPath(window.location.pathname))
  const [selectedCatalogCourseId, setSelectedCatalogCourseId] = useState<number | null>(() => catalogCourseIdFromPath(window.location.pathname))
  const [selectedCatalogClassId, setSelectedCatalogClassId] = useState<number | null>(() => catalogClassIdFromPath(window.location.pathname))
  const [quizActive, setQuizActive] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [language, setLanguage] = useState('EN')
  const [now, setNow] = useState(() => new Date())
  const [enrollments, setEnrollments] = useState<DashboardEnrollment[]>([])
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true)
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null)
  const [gamificationError, setGamificationError] = useState<string | null>(null)
  const [payments, setPayments] = useState<MyPayment[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [otherCourses, setOtherCourses] = useState<Course[]>([])
  const [isLoadingOtherCourses, setIsLoadingOtherCourses] = useState(true)
  const [otherCoursesError, setOtherCoursesError] = useState<string | null>(null)
  const [otherClasses, setOtherClasses] = useState<PublicClass[]>([])
  const [classToEnroll, setClassToEnroll] = useState<PublicClass | null>(null)
  const [courseToEnroll, setCourseToEnroll] = useState<Pick<AdminCourse, 'id' | 'title' | 'price'> | null>(null)
  const [isLoadingOtherClasses, setIsLoadingOtherClasses] = useState(true)
  const [otherClassesError, setOtherClassesError] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(undefined)
  const [readOnlyQuizResult, setReadOnlyQuizResult] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Record<number, number[]>>({})
  const [startedCourses, setStartedCourses] = useState<Record<number, boolean>>({})
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({})
  const [quizResults, setQuizResults] = useState<Record<number, Record<number, DashboardQuizResult>>>({})
  const [victoryCelebrationId, setVictoryCelebrationId] = useState(0)
  const [progressError, setProgressError] = useState<string | null>(null)
  const [closedLiveSessionIds, setClosedLiveSessionIds] = useState<number[]>([])
  const [profileMessage, setProfileMessage] = useState('')
  const progressSnapshot = useRef({ completedLessons, startedCourses, timeSpent, quizResults })
  progressSnapshot.current = { completedLessons, startedCourses, timeSpent, quizResults }

  const persistEngagement = (courseId: number, lessonId: number, activeSeconds: number) => {
    const enrollment = findCourseEnrollment(enrollments, courseId)
    if (!enrollment) return
    void saveLessonEngagement(enrollment.id, lessonId, { activeSeconds }).catch(() => undefined)
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activeView, selectedCourseId])

  useEffect(() => {
    const handleProfileOpen = () => navigateTo(dashboardViewPaths.profile)
    window.addEventListener('student-profile-open', handleProfileOpen)
    return () => window.removeEventListener('student-profile-open', handleProfileOpen)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      setActiveView(dashboardViewFromPath(pathname))
      setSelectedCatalogCourseId(catalogCourseIdFromPath(pathname))
      setSelectedCatalogClassId(catalogClassIdFromPath(pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (activeView !== 'course-view' || quizActive || selectedCourseId === null || !startedCourses[selectedCourseId]) return
    let lastTrackedAt = Date.now()
    const flushTime = () => {
      const elapsedSeconds = Math.floor((Date.now() - lastTrackedAt) / 1000)
      if (elapsedSeconds <= 0) return
      const trackedSeconds = Math.min(elapsedSeconds, 60)
      const currentSeconds = progressSnapshot.current.timeSpent[selectedCourseId] ?? 0
      const nextSeconds = currentSeconds + trackedSeconds
      lastTrackedAt = Date.now()
      progressSnapshot.current = { ...progressSnapshot.current, timeSpent: { ...progressSnapshot.current.timeSpent, [selectedCourseId]: nextSeconds } }
      setTimeSpent((current) => ({ ...current, [selectedCourseId]: nextSeconds }))
      const enrollment = findCourseEnrollment(enrollments, selectedCourseId)
      const course = enrollment ? getEnrollmentCourse(enrollment) : undefined
      const lessonId = selectedLessonId ?? (course ? getLessons(course)[0]?.id : undefined)
      if (lessonId !== undefined) persistEngagement(selectedCourseId, lessonId, trackedSeconds)
    }
    const timer = window.setInterval(flushTime, 30000)
    return () => {
      window.clearInterval(timer)
      flushTime()
    }
  }, [activeView, quizActive, enrollments, selectedCourseId, selectedLessonId, startedCourses])

  useEffect(() => {
    let isCurrent = true
    const loadEnrollments = async () => {
      try {
        const records = await getMyEnrollments()
        if (!isCurrent) return
        const completedByCourse = Object.fromEntries(records.filter((record) => record.completedLessonIds.length > 0).map((record) => [getEnrollmentContentId(record), record.completedLessonIds]))
        const startedByCourse = Object.fromEntries(records.filter((record) => record.started).map((record) => [getEnrollmentContentId(record), true]))
        const timeByCourse = Object.fromEntries(records.filter((record) => record.timeSpentSeconds > 0).map((record) => [getEnrollmentContentId(record), record.timeSpentSeconds]))
        const resultsByCourse = Object.fromEntries(records.map((record) => [getEnrollmentContentId(record), getLatestQuizResults(record.quizAttempts)]).filter(([, results]) => Object.keys(results).length > 0))
        setCompletedLessons(completedByCourse)
        setStartedCourses(startedByCourse)
        setTimeSpent(timeByCourse)
        setQuizResults(resultsByCourse)
        setEnrollments(mapMyEnrollments(records, currentUserId))
        setEnrollmentError(null)
      } catch (error) {
        if (!isCurrent) return
        setEnrollmentError(error instanceof Error ? error.message : 'Unable to load your enrollments.')
      } finally {
        if (isCurrent) setIsLoadingEnrollments(false)
      }
    }
    void loadEnrollments()
    const timer = window.setInterval(() => { void loadEnrollments() }, 30000)
    window.addEventListener('focus', loadEnrollments)
    return () => {
      isCurrent = false
      window.clearInterval(timer)
      window.removeEventListener('focus', loadEnrollments)
    }
  }, [currentUserId])

  useEffect(() => {
    let isCurrent = true
    getCourses()
      .then((records) => {
        if (!isCurrent) return
        setOtherCourses(records)
        setOtherCoursesError(null)
      })
      .catch((error) => {
        if (!isCurrent) return
        setOtherCoursesError(error instanceof Error ? error.message : 'Unable to load other courses.')
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOtherCourses(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    let isCurrent = true
    getPublicClasses()
      .then((records) => {
        if (!isCurrent) return
        setOtherClasses(records)
        setOtherClassesError(null)
      })
      .catch((error) => {
        if (!isCurrent) return
        setOtherClassesError(error instanceof Error ? error.message : 'Unable to load other classes.')
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOtherClasses(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    if ((activeView !== 'overview' && activeView !== 'classes') || isLoadingEnrollments || enrollmentError) return
    getGamification()
      .then((data) => {
        setGamificationData(data)
        setGamificationError(null)
      })
      .catch((error) => {
        setGamificationError(error instanceof Error ? error.message : 'Unable to load your gamification data.')
      })
  }, [activeView, completedLessons, enrollmentError, enrollments, isLoadingEnrollments, quizResults])

  useEffect(() => {
    let isCurrent = true
    getMyPayments()
      .then((records) => {
        if (!isCurrent) return
        setPayments(records)
        setPaymentError(null)
      })
      .catch((error) => {
        if (!isCurrent) return
        setPaymentError(error instanceof Error ? error.message : 'Unable to load your payments.')
      })
      .finally(() => {
        if (isCurrent) setIsLoadingPayments(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const selectedCourseEnrollment = selectedCourseId === null ? undefined : findCourseEnrollment(enrollments, selectedCourseId)
  const selectedCourse = selectedCourseEnrollment ? getEnrollmentCourse(selectedCourseEnrollment) : undefined
  const selectedCourseProgress = selectedCourse ? getCourseProgress(selectedCourse, completedLessons[selectedCourse.id] ?? []) : 0
  const unavailableCourseIds = new Set([
    ...enrollments.filter((enrollment) => enrollment.type === 'course').map((enrollment) => String(enrollment.item_id)),
    ...payments.flatMap((payment) => payment.status === 'Pending Verification' && payment.courseId !== null ? [String(payment.courseId)] : []),
  ])
  const unavailableClassIds = new Set([
    ...enrollments.filter((enrollment) => enrollment.type === 'class').map((enrollment) => enrollment.item_id),
    ...payments.flatMap((payment) => payment.status === 'Pending Verification' && payment.classId !== null ? [payment.classId] : []),
  ])
  const selectedCatalogClass = selectedCatalogClassId === null ? undefined : otherClasses.find((classRecord) => classRecord.id === selectedCatalogClassId)
  const selectedCatalogCourse = selectedCatalogCourseId === null ? undefined : otherCourses.find((course) => Number(course.id) === selectedCatalogCourseId)
  const pageTitle = activeView === 'course-view' ? selectedCourse?.title ?? 'Course view' : activeView === 'course-detail' ? selectedCatalogCourse?.title ?? 'Course details' : activeView === 'class-detail' ? selectedCatalogClass?.title ?? 'Class details' : activeView === 'overview' ? 'Dashboard' : activeView === 'calendar' ? 'Calendar' : activeView === 'courses' ? 'My Courses' : activeView === 'classes' ? 'My Classes' : activeView === 'explore-courses' ? 'Explore Courses' : activeView === 'explore-classes' ? 'Explore Classes' : activeView === 'study-planner' ? 'Study Planner' : activeView === 'quizzes' ? 'Quizzes & Results' : activeView === 'purchases' ? 'My Purchases' : activeView === 'profile' ? 'Profile' : 'Payment History'

  useEffect(() => {
    const title = quizActive ? (readOnlyQuizResult ? 'Quiz Results' : 'Quiz') : pageTitle
    document.title = `${SITE_NAME} | ${title}`
  }, [pageTitle, quizActive, readOnlyQuizResult])

  const selectView = (view: DashboardView) => {
    if (view !== 'course-view' && view !== 'course-detail' && view !== 'class-detail') navigateTo(dashboardViewPaths[view])
    setActiveView(view)
    setProgressError(null)
    setMobileOpen(false)
  }
  const openCatalogCourse = (courseId: number) => {
    setSelectedCatalogCourseId(courseId)
    setSelectedCatalogClassId(null)
    navigateTo(`/account/courses/${courseId}`)
    setActiveView('course-detail')
    setMobileOpen(false)
  }
  const openCatalogClass = (classId: number) => {
    setSelectedCatalogClassId(classId)
    setSelectedCatalogCourseId(null)
    navigateTo(`/account/classes/${classId}`)
    setActiveView('class-detail')
    setMobileOpen(false)
  }
  const openCourse = (courseId: number, lessonId?: number, readOnly = false) => {
    setProgressError(null)
    setSelectedCourseId(courseId)
    setSelectedLessonId(lessonId)
    setReadOnlyQuizResult(readOnly)
    setActiveView('course-view')
    setMobileOpen(false)
  }
  const startCourse = async (courseId: number) => {
    const enrollment = findCourseEnrollment(enrollments, courseId)
    const course = enrollment ? getEnrollmentCourse(enrollment) : undefined
    const lessonId = course ? getLessons(course)[0]?.id : undefined
    if (!enrollment || lessonId === undefined) return
    try {
      await saveLessonEngagement(enrollment.id, lessonId, { activeSeconds: 0 })
      setStartedCourses((current) => ({ ...current, [courseId]: true }))
      setProgressError(null)
      toast.add({ title: 'Course started', description: 'You are ready to begin learning.', type: 'info' })
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Unable to start course.')
    }
  }
  const joinLiveSession = async (lessonId: number, meetingUrl: string, enrollmentId = selectedCourseEnrollment?.id) => {
    if (!enrollmentId) return
    let meetingWindow: Window | null = null
    try {
      const meeting = new URL(meetingUrl, window.location.href)
      if (!['http:', 'https:'].includes(meeting.protocol)) throw new Error('This meeting link is invalid.')
      meetingWindow = window.open('about:blank', '_blank')
      if (!meetingWindow) throw new Error('Allow pop-ups to join the live session.')
      meetingWindow.opener = null
      const joinLog = await logLiveSessionJoin(enrollmentId, lessonId)
      setEnrollments((current) => current.map((enrollment) => enrollment.id === enrollmentId ? { ...enrollment, sessionJoinClicks: { ...enrollment.sessionJoinClicks, [lessonId]: joinLog.clickedAt } } : enrollment))
      setProgressError(null)
      meetingWindow.location.replace(meeting.href)
    } catch (error) {
      meetingWindow?.close()
      const message = error instanceof Error ? error.message : 'Unable to log your class join.'
      if (message.includes('join window is closed')) setClosedLiveSessionIds((current) => current.includes(lessonId) ? current : [...current, lessonId])
      toast.add({ title: 'Unable to join class', description: message, type: 'error', priority: 'high', duration: 8000 })
    }
  }
  const completeLesson = async (lessonId: number) => {
    if (selectedCourseId === null || !selectedCourse || !selectedCourseEnrollment) return
    const completed = completedLessons[selectedCourseId] ?? []
    if (completed.includes(lessonId)) return
    try {
      await completeLessonApi(selectedCourseEnrollment.id, lessonId)
      const nextCompleted = [...completed, lessonId]
      const nextProgress = getCourseProgress(selectedCourse, nextCompleted)
      setCompletedLessons((current) => ({ ...current, [selectedCourseId]: nextCompleted }))
      setStartedCourses((current) => ({ ...current, [selectedCourseId]: true }))
      setEnrollments((current) => current.map((enrollment) => getEnrollmentCourse(enrollment)?.id === selectedCourseId ? { ...enrollment, progress: nextProgress } : enrollment))
      setProgressError(null)
      if (nextProgress === 100) toast.add({ title: 'Course completed!', description: `Excellent work finishing ${selectedCourse.title}.`, type: 'success', priority: 'high', duration: 6000 })
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Unable to complete lesson.')
    }
  }
  const startQuizAttempt = async (lessonId: number): Promise<QuizAttempt | null> => {
    if (selectedCourseId === null || !selectedCourseEnrollment) return null
    try { return await beginQuizAttempt(selectedCourseEnrollment.id, lessonId) } catch (error) { setProgressError(error instanceof Error ? error.message : 'Unable to start quiz.'); return null }
  }
  const saveQuizAnswerForAttempt = async (lessonId: number, attemptId: number, questionId: number, answer: QuizAnswerRecord) => {
    if (selectedCourseId === null || !selectedCourseEnrollment) return
    await saveQuizAnswer(selectedCourseEnrollment.id, lessonId, attemptId, questionId, answer)
  }
  const saveQuizViolationForAttempt = async (lessonId: number, attemptId: number, violation: QuizViolation) => {
    if (selectedCourseId === null || !selectedCourseEnrollment) return
    try { await saveQuizViolation(selectedCourseEnrollment.id, lessonId, attemptId, violation) } catch (error) { setProgressError(error instanceof Error ? error.message : 'Unable to save quiz violation.') }
  }
  const submitQuiz = async (lessonId: number, attemptId: number, answers: Record<number, QuizAnswerRecord>, disqualified = false): Promise<DashboardQuizResult | null> => {
    if (selectedCourseId === null || !selectedCourseEnrollment) return null
    try {
      const submittedAttempt = await submitQuizAttempt(selectedCourseEnrollment.id, lessonId, attemptId, answers, disqualified)
      if (submittedAttempt.score === null || submittedAttempt.passed === null) throw new Error('Quiz result was unavailable.')
      const result = {
        score: submittedAttempt.score,
        passed: submittedAttempt.passed,
        disqualified: submittedAttempt.disqualified || disqualified,
        answerStatuses: Object.fromEntries(Object.entries(submittedAttempt.answers ?? {}).map(([id, answer]) => [Number(id), answer.status])),
        violationCount: submittedAttempt.violations?.length ?? 0,
        questionResults: submittedAttempt.questionResults,
      }
      setQuizResults((current) => ({ ...current, [selectedCourseId]: { ...(current[selectedCourseId] ?? {}), [lessonId]: result } }))
      setEnrollments((current) => current.map((enrollment) => getEnrollmentCourse(enrollment)?.id === selectedCourseId ? { ...enrollment, quizResults: { ...enrollment.quizResults, [lessonId]: result } } : enrollment))
      setStartedCourses((current) => ({ ...current, [selectedCourseId]: true }))
      await completeLessonApi(selectedCourseEnrollment.id, lessonId)
      void getMyEnrollments().then((records) => setEnrollments(mapMyEnrollments(records, currentUserId))).catch(() => undefined)
      const completed = completedLessons[selectedCourseId] ?? []
      if (!completed.includes(lessonId)) {
        const nextCompleted = [...completed, lessonId]
        setCompletedLessons((current) => ({ ...current, [selectedCourseId]: nextCompleted }))
        setEnrollments((current) => current.map((enrollment) => getEnrollmentCourse(enrollment)?.id === selectedCourseId ? { ...enrollment, progress: getCourseProgress(selectedCourse!, nextCompleted) } : enrollment))
      }
      setProgressError(null)
      if (result.score === 100 && !result.disqualified) setVictoryCelebrationId((current) => current + 1)
      selectView('quizzes')
      return result
    } catch (error) { setProgressError(error instanceof Error ? error.message : 'Unable to submit quiz.'); return null }
  }
  const recordPracticeAnswer = (lessonId: number, questionId: number, answer: string) => {
    if (!selectedCourseEnrollment) return
    void recordPracticeLessonAnswer(selectedCourseEnrollment.id, lessonId, questionId, answer)
      .then(() => getMyEnrollments())
      .then((records) => setEnrollments(mapMyEnrollments(records, currentUserId)))
      .catch((error) => setProgressError(error instanceof Error ? error.message : 'Unable to save practice answer.'))
  }
  const updateProfile = async (profile: { name: string; email: string; phone: string }) => {
    try {
      const updatedUser = await updateAuthenticatedProfile(profile)
      saveAuthenticatedUser(updatedUser)
      setProgressError(null)
      setProfileMessage(`Profile saved for ${updatedUser.name}.`)
    } catch (error) {
      setProfileMessage('')
      setProgressError(error instanceof Error ? error.message : 'Unable to update your profile.')
    }
  }
  const classCheckoutCourse = classToEnroll ? { id: classToEnroll.courseId ?? classToEnroll.id, title: classToEnroll.title, price: classToEnroll.price } : null

  const sidebar = <DashboardSidebar activeView={activeView} onSelectView={selectView} collapsed={!isMobile && sidebarCollapsed} />
  const isLessonPlayer = activeView === 'course-view'
  const isQuizPlayer = isLessonPlayer && quizActive

  return <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
    {!isLessonPlayer && !isQuizPlayer && (isMobile ? <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>{sidebar}<IconButton onClick={() => setMobileOpen(false)} aria-label="Close dashboard navigation" sx={{ position: 'absolute', top: 10, right: 10 }}><CloseIcon /></IconButton></Drawer> : <Box sx={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth, zIndex: 'drawer', transition: 'width .2s ease' }}>{sidebar}<IconButton onClick={() => setSidebarCollapsed((current) => !current)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed} sx={{ position: 'absolute', top: 28, right: -14, zIndex: 1, width: 28, height: 28, bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 1, '&:hover': { bgcolor: 'action.hover' } }}>{sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}</IconButton></Box>)}
    <Box sx={{ flex: 1, minWidth: 0, ml: isLessonPlayer ? 0 : { xs: 0, md: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` }, transition: 'margin-left .2s ease' }}>
      {!isLessonPlayer && !isQuizPlayer && <DashboardHeader title={pageTitle} darkMode={darkMode} language={language} onLanguageChange={() => setLanguage((current) => current === 'EN' ? 'AM' : 'EN')} onToggleDarkMode={onToggleDarkMode} onOpenMenu={() => setMobileOpen(true)} />}
      <Box component="main" sx={{ display: isQuizPlayer ? 'flex' : undefined, alignItems: isQuizPlayer ? 'center' : undefined, justifyContent: isQuizPlayer ? 'center' : undefined, width: isQuizPlayer ? '100%' : undefined, boxSizing: isQuizPlayer ? 'border-box' : undefined, mx: isQuizPlayer ? 'auto' : undefined, p: { xs: 2, md: 3.5 }, maxWidth: isLessonPlayer ? 1600 : 1540, minHeight: isLessonPlayer ? '100vh' : 'calc(100vh - 82px)', background: (theme) => activeView === 'courses' ? theme.palette.mode === 'dark' ? theme.palette.background.default : '#fff' : theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, #142420 100%)` : 'linear-gradient(135deg, #f9fcfd 0%, #f4f8ff 100%)' }}>
        {profileMessage && <Alert severity="success" onClose={() => setProfileMessage('')} sx={{ mb: 3 }}>{profileMessage}</Alert>}
        {progressError && <Alert severity="error" onClose={() => setProgressError(null)} sx={{ mb: 3 }}>{progressError}</Alert>}
        {isLoadingEnrollments ? <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }} aria-live="polite"><CircularProgress aria-label="Loading enrollments" /><Typography color="text.secondary">Loading your enrollments...</Typography></Box> : enrollmentError ? <Alert severity="error">{enrollmentError}</Alert> : <>
          {activeView === 'overview' && (gamificationData ? <OverviewView enrollments={enrollments} completedLessons={completedLessons} now={now} onSelectView={selectView} onOpenCourse={openCourse} gamificationData={gamificationData} /> : gamificationError ? <Alert severity="error">{gamificationError}</Alert> : <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }} aria-live="polite"><CircularProgress aria-label="Loading gamification" /></Box>)}
          {activeView === 'calendar' && <StudentCalendarView enrollments={enrollments} now={now} onJoin={(session) => { if (session.lessonId && session.meetingUrl) void joinLiveSession(session.lessonId, session.meetingUrl, session.enrollmentId) }} />}
          {activeView === 'courses' && <Box sx={{ mx: { xs: -2, md: -3.5 }, mt: { xs: -2, md: -3.5 }, px: { xs: 2, md: 3.5 }, pt: { xs: 2, md: 3.5 }, minHeight: 'calc(100vh - 82px)', bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : '#fff', backgroundImage: 'none' }}><CoursesView enrollments={enrollments} completedLessons={completedLessons} onOpenCourse={openCourse} /></Box>}
          {activeView === 'classes' && <ClassesView enrollments={enrollments} completedLessons={completedLessons} now={now} onOpenCourse={openCourse} gamificationData={gamificationData} />}
          {activeView === 'explore-courses' && <OtherCoursesView courses={otherCourses} unavailableCourseIds={unavailableCourseIds} isLoading={isLoadingOtherCourses} error={otherCoursesError} onOpenCourse={openCatalogCourse} />}
          {activeView === 'explore-classes' && <OtherClassesView classes={otherClasses} courses={otherCourses} unavailableClassIds={unavailableClassIds} isLoading={isLoadingOtherClasses} error={otherClassesError} onEnroll={setClassToEnroll} onOpenClass={openCatalogClass} />}
          {activeView === 'course-detail' && <CatalogCourseDetailView courseId={selectedCatalogCourseId} isPaymentPending={payments.some((payment) => payment.status === 'Pending Verification' && payment.courseId !== null && payment.courseId === selectedCatalogCourseId)} onBack={() => selectView('explore-courses')} onEnroll={(course) => setCourseToEnroll({ id: course.id, title: course.title, price: course.price })} />}
          {activeView === 'class-detail' && <CatalogClassDetailView classRecord={selectedCatalogClass} course={selectedCatalogClass?.courseId === null || selectedCatalogClass?.courseId === undefined ? undefined : otherCourses.find((course) => String(course.id) === String(selectedCatalogClass.courseId))} isLoading={isLoadingOtherClasses} isPaymentPending={payments.some((payment) => payment.status === 'Pending Verification' && payment.classId !== null && payment.classId === selectedCatalogClass?.id)} onBack={() => selectView('explore-classes')} onEnroll={setClassToEnroll} />}
          {activeView === 'study-planner' && <StudyPlannerView enrollments={enrollments} completedLessons={completedLessons} now={now} onOpenCourse={openCourse} onStudyPlanSaved={(enrollmentId, lessonOrder) => setEnrollments((current) => current.map((enrollment) => enrollment.id === enrollmentId ? { ...enrollment, studyPlanOrder: lessonOrder } : enrollment))} />}
          {activeView === 'quizzes' && <QuizzesView enrollments={enrollments} completedLessons={completedLessons} quizResults={quizResults} now={now} onOpenCourse={openCourse} />}
          {activeView === 'purchases' && <PurchasesView />}
          {activeView === 'profile' && <ProfileView onUpdateProfile={updateProfile} />}
          {activeView === 'security' && <AccountSecurity />}
          {activeView === 'payments' && <PaymentHistoryView payments={payments} isLoading={isLoadingPayments} error={paymentError} />}
          {activeView === 'course-view' && selectedCourse && selectedCourseEnrollment && <CourseViewer course={selectedCourse} enrollmentId={selectedCourseEnrollment.id} lessonProgress={selectedCourseEnrollment.lessonProgress} reviewTargetId={selectedCourseEnrollment.item_id} reviewInstructorName={selectedCourseEnrollment.classRecord?.tutorName ?? selectedCourse.tutor} progress={selectedCourseProgress} completedLessonIds={completedLessons[selectedCourse.id] ?? []} started={Boolean(startedCourses[selectedCourse.id] || completedLessons[selectedCourse.id]?.length)} timeSpentSeconds={timeSpent[selectedCourse.id] ?? 0} quizResults={quizResults[selectedCourse.id] ?? {}} now={now} initialLessonId={selectedLessonId} onBack={() => selectView(selectedCourseEnrollment.type === 'class' ? 'classes' : 'courses')} onStart={() => startCourse(selectedCourse.id)} onCompleteLesson={completeLesson} onQuizStart={startQuizAttempt} onQuizAnswer={saveQuizAnswerForAttempt} onQuizSubmit={submitQuiz} onQuizViolation={saveQuizViolationForAttempt} onQuizActiveChange={setQuizActive} onPracticeAnswer={recordPracticeAnswer} attendance={selectedCourseEnrollment.attendance} sessionJoinClicks={selectedCourseEnrollment.sessionJoinClicks} onJoinLiveSession={joinLiveSession} closedLiveSessionIds={closedLiveSessionIds} isClass={selectedCourseEnrollment.type === 'class'} weakAreas={selectedCourseEnrollment.weakAreas} readOnly={readOnlyQuizResult} />}
        </>}
      </Box>
    </Box>
    {classCheckoutCourse && classToEnroll && <EnrollmentModal course={classCheckoutCourse} classId={classToEnroll.id} open={true} onClose={() => setClassToEnroll(null)} onSubmitted={() => { void getMyPayments().then(setPayments).catch(() => undefined) }} />}
    {courseToEnroll && <EnrollmentModal course={courseToEnroll} open={true} onClose={() => setCourseToEnroll(null)} onSubmitted={() => { void getMyPayments().then(setPayments).catch(() => undefined) }} />}
    {victoryCelebrationId > 0 && <QuizVictoryCelebration key={victoryCelebrationId} />}
  </Box>
}

export default StudentDashboard
