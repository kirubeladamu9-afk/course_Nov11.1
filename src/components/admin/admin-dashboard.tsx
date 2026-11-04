import { useMemo, type FC, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Avatar from '@mui/material/Avatar'
import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Radio from '@mui/material/Radio'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import BookOutlinedIcon from '@mui/icons-material/BookOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockResetIcon from '@mui/icons-material/LockReset'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import SecurityPage from './security-page'
import { SecurityNotifications } from '@/components/course/account-security'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { type FormEvent, type ReactElement, useEffect, useState } from 'react'
import ReviewsPage from './reviews-page'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import { toast } from '@/components/toast'
import { getArticleWordCount } from '@/lib/article-content'
import { Logo } from '@/components/logo'
import { StyledButton } from '@/components/styled-button'
import { navigateTo } from '@/lib/navigation'
import { approveAdminQuizRetake, changePassword, getAdminRegistrations, getAuthenticatedUser, resetAdminUserPassword, saveAuthenticatedUser, signOut, updateAdminCourse, updateAdminTutor, updateAdminTutorStatus, updateAdminUserStatus, updateAuthenticatedProfile, type AdminDashboardOverview, type AdminRegistration, type AdminWeakArea, createAdminCourse, createAdminTutor, deleteAdminCourse, deleteAdminTutor, getAdminAtRiskStudents, getAdminClassesWorkspace, getAdminCourse, getAdminCourseOptions, getAdminCourses, getAdminDashboardOverview, getAdminQuizViolations, getAdminTutor, getAdminTutors, getAdminUsers, getClassStatistics, type AdminClassesWorkspace, type AdminQuizViolation, type AtRiskStudent, type AuthUser, type ClassStatistics, type ClassStudentStat } from '@/services/api'
import AtRiskStudentsPanel from '@/components/at-risk-students-panel'
import AdminDataTable, { type DataColumn } from './admin-data-table'
import ClassesWorkspace from './classes-workspace'
import PaymentsPage from './payments-page'
import AccessPage from './access-page'
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined'
import ReportsPage from './reports-page'
import PracticeExamManagement from './practice-exam-management'
import SyllabusTopicsPage from './syllabus-topics-page'
import { BookstoreAdminPage } from '@/components/bookstore/bookstore-page'
import PlatformEngineLessonPicker from './platform-engine-lesson-picker'
import StepByStepSolverEditor from './step-by-step-solver-editor'
import SyllabusTopicPicker from './syllabus-topic-picker'
import { getNextLessonId, type AdminCourse, type AdminLesson, type AdminTutor, type AdminUser, type LessonType } from './admin-data'
import type { ImportableLessonType, ImportedQuestion, LessonImportPreview } from './lesson-docx'
import InteractiveHotspotEditor from './interactive-hotspot-editor'
import ArticleBlockEditor from './article-block-editor'
import ArticleVocabularyEditor from './article-vocabulary-editor'
import ArticleImportPreview from './article-import-preview'
import { STEM_TOOL_LIBRARY, STEM_TOOL_PICKER_COMING_SOON, type StemToolDefinition } from '@/components/stem-lab/stem-tool-library'

const drawerWidth = 272

type Section = 'overview' | 'courses' | 'registrations' | 'classes' | 'tutors' | 'blog' | 'practice-exams' | 'syllabus' | 'payments' | 'access' | 'reports' | 'violations' | 'reviews' | 'users' | 'security'

type AdminNavigationItem = {
  key: Section
  label: string
  icon: ReactNode
  subviews?: Array<{ label: string; path: string }>
}

const navigation: AdminNavigationItem[] = [
  { key: 'overview', label: 'Overview', icon: <DashboardOutlinedIcon /> },
  { key: 'courses', label: 'Programs & Courses', icon: <SchoolOutlinedIcon />, subviews: [{ label: 'Registrations', path: '/admin/registrations' }] },
  { key: 'classes', label: 'Classes', icon: <ClassOutlinedIcon />, subviews: [{ label: 'Pending Scheduling', path: '/admin/classes/pending' }, { label: 'Active Classes', path: '/admin/classes/active' }] },
  { key: 'tutors', label: 'Tutors', icon: <PersonOutlineIcon /> },
  { key: 'blog', label: 'Bookstore', icon: <BookOutlinedIcon /> },
  { key: 'practice-exams', label: 'Practice Exams', icon: <QuizOutlinedIcon /> },
  { key: 'syllabus', label: 'Syllabus Topics', icon: <FactCheckOutlinedIcon /> },
  { key: 'payments', label: 'Payments', icon: <PaymentsOutlinedIcon /> },
  { key: 'access', label: 'Access & Sponsors', icon: <CardGiftcardOutlinedIcon /> },
  { key: 'reports', label: 'Reports', icon: <AssessmentOutlinedIcon /> },
  { key: 'violations', label: 'Violations', icon: <BlockIcon /> },
  { key: 'reviews', label: 'Learner Reviews', icon: <RateReviewOutlinedIcon /> },
  { key: 'users', label: 'Users', icon: <GroupOutlinedIcon /> },
  { key: 'security', label: 'Security', icon: <SecurityOutlinedIcon /> },
]

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  if (['Published', 'Approved', 'Active', 'Paid'].includes(status)) return 'success'
  if (['Pending', 'Draft', 'Waitlisted'].includes(status)) return 'warning'
  if (['Rejected', 'Suspended', 'Refunded'].includes(status)) return 'error'
  return 'default'
}

const StatusChip: FC<{ status: string }> = ({ status }) => <Chip label={status} color={statusColor(status)} size="small" />

const PageHeading: FC<{ title: string; description: string; action?: ReactNode }> = ({ title, description, action }) => (
  <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
    <Box>
      <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.1 }}>Admin workspace</Typography>
      <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 800, letterSpacing: '-.035em' }}>{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Box>
    {action}
  </Box>
)

const CourseEditorSection: FC<{ title: string; description?: string; expanded: boolean; onToggle: () => void; withTopMargin?: boolean; children: ReactNode }> = ({ title, description, expanded, onToggle, withTopMargin = false, children }) => (
  <Accordion expanded={expanded} onChange={onToggle} disableGutters elevation={0} sx={{ mt: withTopMargin ? 1 : 0, border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Box><Typography variant="h6">{title}</Typography>{description && <Typography color="text.secondary" variant="body2">{description}</Typography>}</Box></AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
)

const statTones = {
  teal: { color: '#0b8877', background: 'rgba(11, 136, 119, .1)' },
  blue: { color: '#4279c5', background: 'rgba(66, 121, 197, .1)' },
  amber: { color: '#bd791b', background: 'rgba(189, 121, 27, .12)' },
  violet: { color: '#855dc3', background: 'rgba(133, 93, 195, .11)' },
}

const StatCard: FC<{ label: string; value: string; detail: string; icon: ReactNode; tone: keyof typeof statTones }> = ({ label, value, detail, icon, tone }) => (
  <Paper elevation={0} sx={{ p: { xs: 1.75, sm: 2.25 }, borderRadius: 3.5, border: 1, borderColor: 'divider', backgroundColor: 'background.paper', minWidth: 0 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 2.25, color: statTones[tone].color, bgcolor: statTones[tone].background }}>{icon}</Box>
    </Stack>
    <Typography variant="h4" sx={{ mt: 1.25, fontSize: { xs: '1.65rem', sm: '2rem' }, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{value}</Typography>
    <Typography color="text.secondary" variant="caption">{detail}</Typography>
  </Paper>
)

const RepeatableBulletList: FC<{ title: string; values: string[]; onChange: (values: string[]) => void }> = ({ title, values, onChange }) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const updateValue = (index: number, value: string) => onChange(values.map((currentValue, currentIndex) => currentIndex === index ? value : currentValue))
  const addValue = () => {
    const nextIndex = values.length
    onChange([...values, ''])
    setFocusedIndex(nextIndex)
  }

  return <Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
    <Stack spacing={1}>
      {values.map((value, index) => <Box key={`${title}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography color="primary.main">•</Typography><TextField fullWidth size="small" placeholder={`Add ${title.toLowerCase()} point`} value={value} autoFocus={focusedIndex === index} onFocus={() => setFocusedIndex(null)} onChange={(event) => updateValue(index, event.target.value)} /><IconButton size="small" onClick={() => onChange(values.filter((_, currentIndex) => currentIndex !== index))} aria-label={`Remove ${title} point ${index + 1}`}><CloseIcon fontSize="small" /></IconButton></Box>)}
      <Box component="button" type="button" onClick={addValue} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'flex-start', p: 0.5, color: 'primary.main', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}><AddIcon fontSize="small" /> Add point</Box>
    </Stack>
  </Box>
}

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return '0m'
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h${minutes ? ` ${minutes}m` : ''}` : `${minutes}m`
}

const getModuleDuration = (module: AdminCourse['modules'][number]) => module.lessons.reduce((total, lesson) => total + (lesson.duration ?? lesson.estimatedDuration ?? 0), 0)
const articleImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const readArticleImage = (file: File) => new Promise<string>((resolve, reject) => {
  if (!articleImageTypes.includes(file.type)) return reject(new Error('Choose a JPG, PNG, or WebP image.'))
  if (file.size > 5 * 1024 * 1024) return reject(new Error('Choose an image smaller than 5 MB.'))
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') return reject(new Error('This image could not be read.'))
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, 1600 / image.naturalWidth, 1200 / image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d')
      if (!context) return reject(new Error('This image could not be processed.'))
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/webp', 0.82))
    }
    image.onerror = () => reject(new Error('This image file is not a valid image.'))
    image.src = reader.result
  }
  reader.onerror = () => reject(new Error('This image could not be read.'))
  reader.readAsDataURL(file)
})
const getLessonLabel = (lesson: AdminLesson) => lesson.type === 'video' ? (lesson.duration ? formatDuration(lesson.duration) : 'Processing') : lesson.type === 'article' ? 'Article' : lesson.type === 'interactive' ? 'Interactive' : lesson.type === 'simulation' ? 'Simulation' : lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'practice' ? 'Practice' : lesson.type === 'stepByStepSolver' ? 'Step-by-Step Solver' : 'Live'
const isInvalidSolverConfiguration = (config?: AdminLesson['stepByStepSolver']) => !config?.problems.length || config.problems.some((problem) => !problem.prompt.trim() || !problem.steps.length || problem.steps.some((step) => !step.instruction.trim() || !step.explanation.trim() || !step.hint.trim() || !step.correctiveFeedback.trim() || !step.correctAnswer.trim()) || !problem.followUpQuestions.length || problem.followUpQuestions.some((question) => !question.prompt.trim() || !question.correctAnswer.trim() || !question.explanation.trim() || !question.correctiveFeedback.trim()))

const LessonTypeIcon: FC<{ type: LessonType; fontSize?: 'small' | 'medium' }> = ({ type, fontSize = 'small' }) => {
  if (type === 'article') return <ArticleOutlinedIcon fontSize={fontSize} />
  if (type === 'simulation') return <AssessmentOutlinedIcon fontSize={fontSize} />
  if (type === 'quiz') return <QuizOutlinedIcon fontSize={fontSize} />
  if (type === 'live') return <InsertLinkOutlinedIcon fontSize={fontSize} />
  if (type === 'stepByStepSolver') return <FormatListNumberedOutlinedIcon fontSize={fontSize} />
  return <PlayCircleOutlineIcon fontSize={fontSize} />
}

const createLesson = (id: number, type: LessonType): AdminLesson => ({
  id, title: `New ${type} lesson`, type, duration: null, resources: [],
  ...(type === 'article' ? { articleBody: '' } : {}),
  ...(type === 'interactive' ? { baseImageUrl: '', interactiveHotspots: [] } : {}),
  ...(type === 'simulation' ? { simulationToolId: '' } : {}),
  ...(type === 'quiz' ? { passThreshold: 70, quizQuestions: [] } : {}),
  ...(type === 'practice' ? { practiceQuestions: [] } : {}),
  ...(type === 'stepByStepSolver' ? { stepByStepSolver: { problems: [{ id: 1, prompt: '', steps: [{ id: 1, instruction: '', explanation: '', hint: '', correctiveFeedback: '', correctAnswer: '' }], followUpQuestions: [{ id: 1, prompt: '', correctAnswer: '', explanation: '', correctiveFeedback: '' }] }] } } : {}),
  ...(type === 'live' ? { meetingUrl: '', recurringDays: [], sessionTime: '', sessionDuration: 60, scheduledAt: '', endsAt: '', estimatedDuration: 3600 } : {}),
})

const dateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const toLocalDateTime = (date: Date) => `${dateValue(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

const getAvailableClassSessionDates = (schedule: ClassLessonSchedule) => {
  const dayIndexes = new Set(schedule.days.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].findIndex((name) => name.toLowerCase() === day.slice(0, 3).toLowerCase())).filter((day) => day >= 0))
  const cursor = new Date(`${schedule.startDate}T00:00:00`)
  const rangeEnd = new Date(`${schedule.endDate}T00:00:00`)
  const dates: string[] = []
  while (cursor <= rangeEnd) {
    if (dayIndexes.has(cursor.getDay())) dates.push(dateValue(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

const getLiveLessonDate = (scheduledAt?: string) => scheduledAt && Number.isFinite(Date.parse(scheduledAt)) ? dateValue(new Date(scheduledAt)) : ''

const getLiveLessonTiming = (sessionDate: string, sessionTime: string, sessionDuration: number) => {
  const start = sessionDate ? new Date(`${sessionDate}T${sessionTime || '00:00'}:00`) : null
  const end = start ? new Date(start.getTime() + sessionDuration * 60000) : null
  return { scheduledAt: start ? start.toISOString() : '', endsAt: end ? end.toISOString() : '', estimatedDuration: sessionDuration * 60 }
}

const coursesWithoutLiveLessons = [211, 7]

const lessonTypeOptions: Array<{ type: LessonType; label: string; detail: string }> = [
  { type: 'video', label: 'Video', detail: 'Upload a video or add a link' },
  { type: 'article', label: 'Article', detail: 'Write a lesson with text and media' },
  { type: 'interactive', label: 'Interactive', detail: 'Build an image-based hotspot activity' },
  { type: 'simulation', label: 'STEM Lab Activity', detail: 'Choose a ready-made lab activity' },
  { type: 'quiz', label: 'Quiz', detail: 'Check understanding with questions' },
  { type: 'practice', label: 'Practice', detail: 'Build skills with instant feedback' },
  { type: 'stepByStepSolver', label: 'Step-by-Step Solver', detail: 'Learn to solve problems one step at a time.' },
  { type: 'live', label: 'Live', detail: 'Schedule a session' },
]

export const getAllowedCourseLessonTypes = (courseId: number): LessonType[] | undefined => coursesWithoutLiveLessons.includes(courseId) ? lessonTypeOptions.filter((option) => option.type !== 'live').map((option) => option.type) : undefined

type ClassLessonSchedule = { startDate: string; endDate: string; days: string[]; time: string; duration: number }
type LessonPanelState = { moduleId: number; lesson: AdminLesson; isNew: boolean; liveLessonIndex: number }

export const CourseEditor: FC<{ course: AdminCourse; onChange: (course: AdminCourse) => void; isClassLinked?: boolean; curriculumOnly?: boolean; allowedLessonTypes?: LessonType[]; classSchedule?: ClassLessonSchedule; tutorOptions?: string[]; syllabusGrade?: number | null }> = ({ course, onChange, isClassLinked = false, curriculumOnly = false, allowedLessonTypes, classSchedule, syllabusGrade = null, tutorOptions = ['Maya Chen', 'Leon Kennedy', 'Jhon Dwirian', 'Rizki Known'] }) => {
  const [draggedModule, setDraggedModule] = useState<number | null>(null)
  const [draggedLesson, setDraggedLesson] = useState<{ moduleId: number; index: number } | null>(null)
  const [expandedModuleIds, setExpandedModuleIds] = useState<number[]>([])
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null)
  const [editingModuleTitle, setEditingModuleTitle] = useState('')
  const [addingLessonModuleId, setAddingLessonModuleId] = useState<number | null>(null)
  const [lessonPanel, setLessonPanel] = useState<LessonPanelState | null>(null)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState<string[]>(['details', 'curriculum'])
  const [lessonImportPreview, setLessonImportPreview] = useState<{ moduleId: number; type: ImportableLessonType; result: LessonImportPreview } | null>(null)
  const [isImportingLesson, setIsImportingLesson] = useState(false)

  useEffect(() => {
    setExpandedModuleIds([])
    setIsAddingModule(false)
    setNewModuleTitle('')
    setEditingModuleId(null)
    setAddingLessonModuleId(null)
    setLessonPanel(null)
    setLessonImportPreview(null)
    setVideoUploadProgress(0)
    setExpandedSections(['details', 'curriculum'])
  }, [course.id])

  const toggleSection = (section: string) => {
    setExpandedSections((sections) => sections.includes(section) ? sections.filter((currentSection) => currentSection !== section) : [...sections, section])
  }

  const moveModule = (targetId: number) => {
    if (draggedModule === null || draggedModule === targetId) return
    const from = course.modules.findIndex((module) => module.id === draggedModule)
    const to = course.modules.findIndex((module) => module.id === targetId)
    const next = [...course.modules]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange({ ...course, modules: next })
    setDraggedModule(null)
  }

  const moveLesson = (moduleId: number, targetIndex: number) => {
    if (!draggedLesson || draggedLesson.moduleId !== moduleId || draggedLesson.index === targetIndex) return
    const nextModules = course.modules.map((module) => {
      if (module.id !== moduleId) return module
      const lessons = [...module.lessons]
      const [moved] = lessons.splice(draggedLesson.index, 1)
      lessons.splice(targetIndex, 0, moved)
      return { ...module, lessons }
    })
    onChange({ ...course, modules: nextModules })
    setDraggedLesson(null)
  }

  const moveLessonToModule = (sourceModuleId: number, lessonIndex: number, targetModuleId: number) => {
    if (sourceModuleId === targetModuleId) return
    const sourceModule = course.modules.find((module) => module.id === sourceModuleId)
    const lesson = sourceModule?.lessons[lessonIndex]
    if (!sourceModule || !lesson) return
    onChange({ ...course, modules: course.modules.map((module) => module.id === sourceModuleId ? { ...module, lessons: module.lessons.filter((_, index) => index !== lessonIndex) } : module.id === targetModuleId ? { ...module, lessons: [...module.lessons, lesson] } : module) })
    setExpandedModuleIds((ids) => ids.includes(targetModuleId) ? ids : [...ids, targetModuleId])
  }

  const addModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = newModuleTitle.trim()
    if (!title) return
    const nextModuleId = Math.max(0, ...course.modules.map((module) => module.id)) + 1
    onChange({ ...course, modules: [...course.modules, { id: nextModuleId, title, lessons: [] }] })
    setExpandedModuleIds((ids) => [...ids, nextModuleId])
    setNewModuleTitle('')
    setIsAddingModule(false)
  }

  const saveModuleTitle = (moduleId: number) => {
    const title = editingModuleTitle.trim()
    if (title) onChange({ ...course, modules: course.modules.map((module) => module.id === moduleId ? { ...module, title } : module) })
    setEditingModuleId(null)
  }

  const deleteModule = (module: AdminCourse['modules'][number]) => {
    const warning = module.lessons.length ? `Delete ${module.title} and its ${module.lessons.length} ${module.lessons.length === 1 ? 'lesson' : 'lessons'}? This cannot be undone.` : `Delete ${module.title}?`
    if (!window.confirm(warning)) return
    onChange({ ...course, modules: course.modules.filter((currentModule) => currentModule.id !== module.id) })
    if (lessonPanel?.moduleId === module.id) setLessonPanel(null)
  }

  const openLessonPanel = (moduleId: number, lesson: AdminLesson, isNew: boolean) => {
    if (!isNew) setAddingLessonModuleId(null)
    setVideoUploadProgress(0)
    const lessonCopy = { ...lesson, resources: [...lesson.resources], interactiveHotspots: lesson.interactiveHotspots?.map((hotspot) => ({ ...hotspot })), simulation: lesson.simulation ? { ...lesson.simulation, variables: lesson.simulation.variables.map((variable) => ({ ...variable })), acceptedObservations: [...lesson.simulation.acceptedObservations] } : undefined, quizQuestions: lesson.quizQuestions?.map((question) => ({ ...question, options: [...question.options], optionImages: question.optionImages ? [...question.optionImages] : undefined })), practiceQuestions: lesson.practiceQuestions?.map((question) => ({ ...question, options: [...question.options] })) }
    setLessonPanel({ moduleId, lesson: lessonCopy, isNew, liveLessonIndex: 0 })
  }

  const updateLessonDraft = (nextLesson: AdminLesson) => setLessonPanel((panel) => panel ? { ...panel, lesson: nextLesson } : panel)

  const importLessonFile = async (moduleId: number, type: ImportableLessonType, file: File) => {
    setIsImportingLesson(true)
    setLessonImportPreview({ moduleId, type, result: { title: '', articleBody: '', articleBlocks: [], questions: [], issues: [], fatalError: null } })
    try {
      const result = file.size > 10 * 1024 * 1024
        ? { title: '', articleBody: '', articleBlocks: [], questions: [], issues: [], fatalError: 'DOCX files must be 10 MB or smaller.' }
        : !file.name.toLowerCase().endsWith('.docx')
          ? { title: '', articleBody: '', articleBlocks: [], questions: [], issues: [], fatalError: 'Choose a .docx file downloaded from the matching lesson template.' }
          : await (await import('./lesson-docx')).parseLessonDocx(type, await file.arrayBuffer())
      setLessonImportPreview({ moduleId, type, result })
    } catch {
      setLessonImportPreview({ moduleId, type, result: { title: '', articleBody: '', articleBlocks: [], questions: [], issues: [], fatalError: 'This file could not be read. Download a fresh template and try again.' } })
    } finally {
      setIsImportingLesson(false)
    }
  }

  const uploadArticlePreviewImage = async (blockIndex: number, file: File) => {
    try {
      const imageUrl = await readArticleImage(file)
      setLessonImportPreview((current) => current ? { ...current, result: { ...current.result, articleBlocks: current.result.articleBlocks.map((block, index) => index === blockIndex && block.type === 'image' ? { ...block, imageUrl } : block) } } : current)
    } catch (error) {
      toast.add({ title: 'Unable to add image', description: error instanceof Error ? error.message : 'This image could not be read.', type: 'error' })
    }
  }

  const uploadQuizPreviewImage = async (questionNumber: number, field: QuizImportImageSlot['field'], file: File, optionIndex?: number) => {
    try {
      const imageUrl = await readArticleImage(file)
      setLessonImportPreview((current) => current ? { ...current, result: { ...current.result, questions: current.result.questions.map((question) => question.number !== questionNumber ? question : field === 'optionImage' ? { ...question, optionImages: question.options.map((_, index) => index === optionIndex ? imageUrl : question.optionImages?.[index]) } : { ...question, [field]: imageUrl }) } } : current)
    } catch (error) {
      toast.add({ title: 'Unable to add image', description: error instanceof Error ? error.message : 'This image could not be read.', type: 'error' })
    }
  }

  const removeQuizPreviewImage = (questionNumber: number, field: QuizImportImageSlot['field'], optionIndex?: number) => setLessonImportPreview((current) => current ? { ...current, result: { ...current.result, questions: current.result.questions.map((question) => question.number !== questionNumber ? question : field === 'optionImage' ? { ...question, optionImages: question.options.map((_, index) => index === optionIndex ? undefined : question.optionImages?.[index]) } : { ...question, [field]: undefined }) } } : current)

  const applyLessonImport = () => {
    if (!lessonImportPreview || lessonImportPreview.result.fatalError) return
    const articleImages = lessonImportPreview.result.articleBlocks.flatMap((block) => block.type === 'image' && !block.imageUrl ? [block.marker || 'Unspecified image'] : [])
    const quizImages = lessonImportPreview.type === 'quiz' ? lessonImportPreview.result.questions.flatMap((question) => [
      question.questionImageMarker && !question.questionImage ? `Question ${question.number}: ${question.questionImageMarker}` : '',
      ...question.optionImageMarkers.map((marker, optionIndex) => marker && !question.optionImages?.[optionIndex] ? `Question ${question.number}, option ${String.fromCharCode(65 + optionIndex)}: ${marker}` : ''),
      question.explanationImageMarker && !question.explanationImage ? `Question ${question.number}: ${question.explanationImageMarker}` : '',
    ].filter(Boolean)) : []
    const missingImages = [...articleImages, ...quizImages]
    if (missingImages.length && !window.confirm(`No image has been uploaded for ${missingImages.map((marker) => `“${marker}”`).join(', ')}. Continue with these image slots left empty?`)) return
    const { moduleId, type, result } = lessonImportPreview
    const id = getNextLessonId(course.modules)
    const importedLesson: AdminLesson = {
      id,
      title: result.title.trim(),
      type,
      duration: null,
      resources: [],
      ...(type === 'article' ? { articleBody: result.articleBody, articleBlocks: result.articleBlocks } : {}),
      ...(type === 'quiz' ? { passThreshold: 70, quizQuestions: result.questions.map((question, index) => ({ id: index + 1, question: question.question, topic: question.topic, options: question.options, correctOption: question.correctOption, questionImage: question.questionImage, optionImages: question.optionImages, explanation: question.explanation, explanationImage: question.explanationImage })) } : {}),
      ...(type === 'practice' ? { practiceQuestions: result.questions.map((question, index) => ({ id: index + 1, question: question.question, topic: question.topic, options: question.options, correctAnswer: question.options[question.correctOption], explanation: question.explanation })) } : {}),
      ...(type === 'stepByStepSolver' && result.stepByStepSolver ? { stepByStepSolver: result.stepByStepSolver } : {}),
    }
    onChange({ ...course, modules: course.modules.map((module) => module.id === moduleId ? { ...module, lessons: [...module.lessons, importedLesson] } : module) })
    setExpandedModuleIds((ids) => ids.includes(moduleId) ? ids : [...ids, moduleId])
    setAddingLessonModuleId(null)
    setLessonImportPreview(null)
    toast.add({ title: 'Lessons imported', description: `${result.title} was added to the course draft. Save changes to persist it.`, type: 'success' })
  }

  const downloadTemplate = async (type: ImportableLessonType) => {
    try {
      await (await import('./lesson-docx')).downloadLessonTemplate(type)
    } catch {
      toast.add({ title: 'Unable to download template', description: 'Please try again.', type: 'error' })
    }
  }

  const deleteLesson = (moduleId: number, lessonId: number) => {
    onChange({ ...course, modules: course.modules.map((module) => module.id === moduleId ? { ...module, lessons: module.lessons.filter((lesson) => lesson.id !== lessonId) } : module) })
    if (lessonPanel?.lesson.id === lessonId) setLessonPanel(null)
  }

  const saveLesson = (draftLesson?: AdminLesson) => {
    if (!lessonPanel) return
    const currentLesson = draftLesson ?? lessonPanel.lesson
    const sessionDate = getLiveLessonDate(currentLesson.scheduledAt)
    if (currentLesson.type === 'live' && classSchedule) {
      const availableDates = getAvailableClassSessionDates(classSchedule)
      if (!availableDates.includes(sessionDate)) {
        toast.add({ title: 'Choose a valid session date', description: 'Select a date within the class schedule on a recurring session day.', type: 'error' })
        return
      }
      if (!currentLesson.sessionTime || !currentLesson.meetingUrl?.trim()) {
        toast.add({ title: 'Add session time and meeting link', description: 'Live lessons need their own session time and meeting link.', type: 'error' })
        return
      }
    }
    const lesson = { ...currentLesson, title: currentLesson.title.trim(), ...(currentLesson.type === 'live' && classSchedule ? { recurringDays: classSchedule.days, ...getLiveLessonTiming(sessionDate, currentLesson.sessionTime ?? '', currentLesson.sessionDuration ?? 60) } : {}) }
    if (!lesson.title) return
    onChange({ ...course, modules: course.modules.map((module) => module.id === lessonPanel.moduleId ? { ...module, lessons: lessonPanel.isNew ? [...module.lessons, lesson] : module.lessons.map((currentLesson) => currentLesson.id === lesson.id ? lesson : currentLesson) } : module) })
    setLessonPanel(null)
  }

  const handleVideoFile = (file: File) => {
    if (!lessonPanel) return
    if (file.size > 6 * 1024 * 1024) {
      toast.add({ title: 'Video is too large', description: 'Choose a video smaller than 6 MB.', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !lessonPanel) return
      const videoUrl = reader.result
      updateLessonDraft({ ...lessonPanel.lesson, videoUrl, duration: null })
      setVideoUploadProgress(12)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        setLessonPanel((panel) => panel ? { ...panel, lesson: { ...panel.lesson, duration: Math.max(1, Math.round(video.duration)) } } : panel)
      }
      video.src = videoUrl
      window.setTimeout(() => setVideoUploadProgress(100), 700)
    }
    reader.readAsDataURL(file)
  }

  const addResources = (files: FileList | null) => {
    if (!lessonPanel || !files?.length) return
    const highestResourceId = Math.max(0, ...lessonPanel.lesson.resources.map((resource) => resource.id))
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== 'string') return
        const resource = { id: highestResourceId + index + 1, name: file.name, url: reader.result }
        setLessonPanel((panel) => panel ? { ...panel, lesson: { ...panel.lesson, resources: [...panel.lesson.resources, resource] } } : panel)
      }
      reader.readAsDataURL(file)
    })
  }

  const isVideoProcessing = lessonPanel?.lesson.type === 'video' && videoUploadProgress > 0 && videoUploadProgress < 100
  const liveLessonSessionDates = lessonPanel?.lesson.type === 'live' && classSchedule ? getAvailableClassSessionDates(classSchedule) : []
  const cannotSaveLesson = Boolean(!lessonPanel?.lesson.title.trim() || isVideoProcessing || (lessonPanel?.isNew && lessonPanel.lesson.type === 'video' && !lessonPanel.lesson.videoUrl) || (lessonPanel?.lesson.type === 'interactive' && (!lessonPanel.lesson.baseImageUrl || !(lessonPanel.lesson.interactiveHotspots?.length))) || (lessonPanel?.lesson.type === 'stepByStepSolver' && isInvalidSolverConfiguration(lessonPanel.lesson.stepByStepSolver)) || (lessonPanel?.lesson.type === 'simulation' && !lessonPanel.lesson.simulationToolId) || (lessonPanel?.lesson.type === 'live' && classSchedule && !lessonPanel.lesson.scheduledAt) || (lessonPanel?.lesson.type === 'quiz' && classSchedule && (!lessonPanel.lesson.scheduledAt || !Number.isFinite(Date.parse(lessonPanel.lesson.scheduledAt)))))
  const handleThumbnailFile = (file: File) => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
    if (!supportedTypes.includes(file.type)) {
      toast.add({ title: 'Unsupported thumbnail', description: 'Choose a JPG, PNG, GIF, WebP, or AVIF image.', type: 'error' })
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.add({ title: 'Thumbnail is too large', description: 'Choose an image smaller than 6 MB.', type: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange({ ...course, cover: reader.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <Paper id="course-curriculum-editor" elevation={0} sx={{ mt: 3, p: 2.5, border: 1, borderColor: 'divider', scrollMarginTop: 24 }}>
      {!curriculumOnly && <CourseEditorSection expanded={expandedSections.includes('details')} onToggle={() => toggleSection('details')} title="Course details" description="Edit the information learners see before they enroll.">
          <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField required fullWidth label="Course title" value={course.title} onChange={(event) => onChange({ ...course, title: event.target.value })} />
          <TextField required fullWidth label="Program / category" placeholder="Enter a category, such as Data or Design" value={course.category} onChange={(event) => onChange({ ...course, category: event.target.value })} helperText="Use an existing category or enter a new one." />
        </Stack>
        <Stack spacing={1} sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Thumbnail</Typography>
          <Box component="label" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const [file] = Array.from(event.dataTransfer.files); if (file) handleThumbnailFile(file) }} sx={{ minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2, border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}>
            {course.cover && <Box component="img" src={course.cover} alt={`${course.title || 'Course'} thumbnail`} sx={{ width: 180, height: 100, objectFit: 'cover', borderRadius: 1 }} />}
            <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{course.cover ? 'Replace thumbnail' : 'Drop a thumbnail here or browse'}</Typography><Typography color="text.secondary" variant="caption">JPG, PNG, GIF, WebP, or AVIF · 6 MB maximum</Typography></Box>
            <input hidden type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" onChange={(event) => { const [file] = Array.from(event.target.files ?? []); if (file) handleThumbnailFile(file); event.target.value = '' }} aria-label="Browse for course thumbnail" />
          </Box>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth><InputLabel>Level</InputLabel><Select label="Level" value={course.level} onChange={(event) => onChange({ ...course, level: event.target.value })}><MenuItem value="Beginner">Beginner</MenuItem><MenuItem value="Intermediate">Intermediate</MenuItem><MenuItem value="Advanced">Advanced</MenuItem></Select></FormControl>
          <FormControl fullWidth><InputLabel>Tutor</InputLabel><Select label="Tutor" value={course.tutor} onChange={(event) => onChange({ ...course, tutor: event.target.value })}>{tutorOptions.map((tutor) => <MenuItem key={tutor} value={tutor}>{tutor}</MenuItem>)}</Select></FormControl>
          <TextField fullWidth label="Price" type="number" inputProps={{ min: 0, step: 1 }} value={course.price} onChange={(event) => onChange({ ...course, price: Number(event.target.value) })} />
        </Stack>
        <TextField fullWidth multiline minRows={2} label="Description" value={course.description} onChange={(event) => onChange({ ...course, description: event.target.value })} />
        <TextField fullWidth multiline minRows={4} label="Long description" value={course.longDescription} onChange={(event) => onChange({ ...course, longDescription: event.target.value })} />
      </Stack>
          <RepeatableBulletList title="What you'll learn" values={course.learningOutcomes} onChange={(learningOutcomes) => onChange({ ...course, learningOutcomes })} />
      </CourseEditorSection>}
      {!curriculumOnly && <CourseEditorSection expanded={expandedSections.includes('status')} onToggle={() => toggleSection('status')} title="Course status" description="Control whether learners can see this course." withTopMargin>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{course.status === 'Published' ? 'Published' : 'Draft course'}</Typography><Typography variant="caption" color="text.secondary">Draft courses remain editable and hidden from learners.</Typography></Box><Stack direction="row" alignItems="center" spacing={1}><StatusChip status={course.status} /><Switch checked={course.status === 'Published'} onChange={() => onChange({ ...course, status: course.status === 'Published' ? 'Draft' : 'Published' })} inputProps={{ 'aria-label': `Publish ${course.title || 'course'}` }} /></Stack></Box>
      </CourseEditorSection>}
      {!curriculumOnly && <CourseEditorSection expanded={expandedSections.includes('requirements')} onToggle={() => toggleSection('requirements')} title="Requirements" withTopMargin>
        <RepeatableBulletList title="Requirements" values={course.requirements} onChange={(requirements) => onChange({ ...course, requirements })} />
      </CourseEditorSection>}
      <Divider sx={{ my: 3 }} />
      <CourseEditorSection expanded={expandedSections.includes('curriculum')} onToggle={() => toggleSection('curriculum')} title="Course curriculum" description={`${course.modules.length} ${course.modules.length === 1 ? 'section' : 'sections'} · ${course.title || 'Untitled course'}`}>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>Drag modules to reorder. Lessons can be reordered within their module. Add STEM Lab activities from any module&apos;s Add lesson menu.</Typography>
          <Stack spacing={1.5}>
        {course.modules.length === 0 && !isAddingModule && <Box sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1 }}><Typography color="text.secondary" sx={{ mb: 1 }}>This course has no modules yet.</Typography><Button label="Add your first module" size="small" onClick={() => setIsAddingModule(true)} /></Box>}
        {course.modules.map((module) => {
          const isExpanded = expandedModuleIds.includes(module.id)
          return <Paper key={module.id} elevation={0} draggable onDragStart={() => setDraggedModule(module.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveModule(module.id)} sx={{ p: 1.5, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => setExpandedModuleIds((ids) => isExpanded ? ids.filter((id) => id !== module.id) : [...ids, module.id])} aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${module.title}`} aria-expanded={isExpanded}><ChevronRightIcon sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 160ms ease' }} fontSize="small" /></IconButton>
              <DragIndicatorIcon color="disabled" fontSize="small" />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {editingModuleId === module.id ? <TextField autoFocus fullWidth size="small" value={editingModuleTitle} onChange={(event) => setEditingModuleTitle(event.target.value)} onBlur={() => saveModuleTitle(module.id)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} inputProps={{ 'aria-label': 'Module title' }} /> : <Box component="button" type="button" onClick={() => { setEditingModuleId(module.id); setEditingModuleTitle(module.title) }} sx={{ display: 'block', width: '100%', p: 0, border: 0, background: 'none', color: 'text.primary', cursor: 'text', font: 'inherit', textAlign: 'left' }}><Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#000' }}>{module.title}</Typography></Box>}
                <Typography color="text.secondary" variant="caption">{module.lessons.length} {module.lessons.length === 1 ? 'lecture' : 'lectures'} · {formatDuration(getModuleDuration(module))}</Typography>
              </Box>
              <Tooltip title={`Delete ${module.title}`}><IconButton size="small" color="error" onClick={() => deleteModule(module)} aria-label={`Delete ${module.title}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
            {isExpanded && <Stack spacing={0.5} sx={{ mt: 1, ml: { xs: 0, sm: 5 } }}>
              {module.lessons.map((lesson, index) => <Box key={lesson.id} draggable onDragStart={(event) => { event.stopPropagation(); setDraggedLesson({ moduleId: module.id, index }) }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.stopPropagation(); moveLesson(module.id, index) }} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1, backgroundColor: 'background.paper', borderRadius: 1, flexWrap: 'wrap' }}>
                <DragIndicatorIcon color="disabled" fontSize="small" /><Box sx={{ color: 'text.secondary', display: 'flex' }}><LessonTypeIcon type={lesson.type} /></Box>
                <Box component="button" type="button" onClick={() => openLessonPanel(module.id, lesson, false)} sx={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 1, p: 0, border: 0, background: 'none', color: 'text.primary', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}><Typography variant="body2">{lesson.title}</Typography><Chip label={getLessonLabel(lesson)} size="small" variant="outlined" /></Box>
                {course.modules.length > 1 && <Select value="" displayEmpty size="small" onChange={(event) => moveLessonToModule(module.id, index, Number(event.target.value))} renderValue={() => 'Move to module'} inputProps={{ 'aria-label': `Move ${lesson.title} to module` }} sx={{ minWidth: 145 }}><MenuItem disabled value="">Move to module</MenuItem>{course.modules.filter((targetModule) => targetModule.id !== module.id).map((targetModule) => <MenuItem key={targetModule.id} value={targetModule.id}>{targetModule.title}</MenuItem>)}</Select>}
                <Tooltip title={`Edit ${lesson.title}`}><IconButton size="small" onClick={() => openLessonPanel(module.id, lesson, false)} aria-label={`Edit ${lesson.title}`}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title={`Delete ${lesson.title}`}><IconButton size="small" color="error" onClick={() => deleteLesson(module.id, lesson.id)} aria-label={`Delete ${lesson.title}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
              </Box>)}
              {module.lessons.length === 0 && <Typography color="text.secondary" variant="body2" sx={{ py: 1 }}>No lessons yet</Typography>}
              {addingLessonModuleId === module.id ? <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>Choose a lesson type</Typography>{isClassLinked && <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 1 }}>This course is linked to a Class. Use Video, Article, Interactive, or Quiz for course content; the Class manages live sessions.</Typography>}<IconButton size="small" onClick={() => setAddingLessonModuleId(null)} aria-label="Cancel adding lesson"><CloseIcon fontSize="small" /></IconButton></Box><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, gap: 1.25 }}>{lessonTypeOptions.filter((option) => (!isClassLinked || option.type !== 'live') && (!allowedLessonTypes || allowedLessonTypes.includes(option.type))).map((option) => { const supportsDocxImport = ['article', 'quiz', 'practice', 'stepByStepSolver'].includes(option.type); const isSelected = lessonPanel?.moduleId === module.id && lessonPanel.lesson.type === option.type; return <Paper key={option.type} elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 132, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', gap: 0.75, p: 1.25, border: 1, borderColor: isSelected ? 'primary.main' : 'divider', borderRadius: 1.5, backgroundColor: isSelected ? 'action.selected' : 'background.paper', boxShadow: isSelected ? '0 0 0 1px rgba(16, 125, 111, 0.16)' : 'none', transition: 'border-color 140ms ease, background-color 140ms ease' }}><Box component='button' type='button' onClick={() => openLessonPanel(module.id, createLesson(getNextLessonId(course.modules), option.type), true)} sx={{ flex: 1, width: '100%', minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: 1, p: 0.25, border: 0, borderRadius: 1, background: 'none', color: 'text.primary', cursor: 'pointer', textAlign: 'left', font: 'inherit', '&:hover': { backgroundColor: 'action.hover' } }}><Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', flexShrink: 0 }}><LessonTypeIcon type={option.type} fontSize='medium' /></Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography variant='body2' sx={{ fontWeight: 700, lineHeight: 1.25 }}>{option.label}</Typography><Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5, lineHeight: 1.35 }}>{option.detail}</Typography></Box>{isSelected && <CheckCircleOutlineIcon color='primary' fontSize='small' />}</Box>{supportsDocxImport && <Stack direction='row' justifyContent='flex-end' spacing={0.25}><Tooltip title='Download template'><IconButton size='small' sx={{ p: 0.25 }} aria-label={'Download template for ' + option.label} onClick={() => void downloadTemplate(option.type as ImportableLessonType)}><DownloadOutlinedIcon fontSize='small' /></IconButton></Tooltip><Tooltip title='Import'><IconButton component='label' size='small' sx={{ p: 0.25 }} disabled={isImportingLesson} aria-label={'Import ' + option.label + ' lesson'}><UploadFileOutlinedIcon fontSize='small' /><input hidden type='file' accept='.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document' aria-label={'Import ' + option.label + ' lesson DOCX'} onChange={(event) => { const [file] = Array.from(event.target.files ?? []); if (file) void importLessonFile(module.id, option.type as ImportableLessonType, file); event.target.value = '' }} /></IconButton></Tooltip></Stack>}</Paper> })}</Box></Paper> : <Box component="button" type="button" onClick={() => setAddingLessonModuleId(module.id)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'flex-start', p: 0.5, color: 'primary.main', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}><AddIcon fontSize="small" /> Add lesson</Box>}
            </Stack>}
          </Paper>
        })}
        {isAddingModule ? <Box component="form" onSubmit={addModule} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TextField autoFocus required size="small" fullWidth label="Module title" value={newModuleTitle} onChange={(event) => setNewModuleTitle(event.target.value)} /><IconButton type="submit" color="primary" aria-label="Save module"><CheckIcon /></IconButton><IconButton type="button" onClick={() => setIsAddingModule(false)} aria-label="Cancel adding module"><CloseIcon /></IconButton></Box> : course.modules.length > 0 && <Box component="button" type="button" onClick={() => setIsAddingModule(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'flex-start', p: 0, color: 'primary.main', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}><AddIcon fontSize="small" /> Add module</Box>}
          </Stack>
      </CourseEditorSection>
      {lessonPanel && <LessonDetailsPanel lessonPanel={lessonPanel} updateLessonDraft={updateLessonDraft} onClose={() => setLessonPanel(null)} onSave={saveLesson} onVideoFile={handleVideoFile} onAddResources={addResources} videoUploadProgress={videoUploadProgress} disabled={cannotSaveLesson} classSchedule={classSchedule} syllabusGrade={syllabusGrade} availableLiveSessionDates={liveLessonSessionDates} />}
      <Dialog open={Boolean(lessonImportPreview)} onClose={() => setLessonImportPreview(null)} fullWidth maxWidth="md"><DialogTitle>Review imported {lessonImportPreview?.type} lesson</DialogTitle><DialogContent dividers><Stack spacing={1.5}>{isImportingLesson ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress aria-label="Reading lesson DOCX" /></Box> : lessonImportPreview && <><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{lessonImportPreview.result.title || 'Lesson title unavailable'}</Typography>{lessonImportPreview.result.fatalError && <Alert severity="error">{lessonImportPreview.result.fatalError}</Alert>}{lessonImportPreview.result.issues.map((issue, index) => <Alert key={`${index}-${issue}`} severity="warning">{issue}</Alert>)}{lessonImportPreview.type === 'article' && <ArticleImportPreview blocks={lessonImportPreview.result.articleBlocks} onUpload={(index, file) => void uploadArticlePreviewImage(index, file)} onCaptionChange={(index, caption) => setLessonImportPreview((current) => current ? { ...current, result: { ...current.result, articleBlocks: current.result.articleBlocks.map((block, blockIndex) => blockIndex === index && block.type === 'image' ? { ...block, caption } : block) } } : current)} onRemove={(index) => setLessonImportPreview((current) => current ? { ...current, result: { ...current.result, articleBlocks: current.result.articleBlocks.filter((_, blockIndex) => blockIndex !== index) } } : current)} />}{lessonImportPreview.type === 'quiz' && <QuizImportPreview questions={lessonImportPreview.result.questions} onUpload={(questionNumber, slot, file, optionIndex) => void uploadQuizPreviewImage(questionNumber, slot, file, optionIndex)} onRemove={removeQuizPreviewImage} />}{lessonImportPreview.type === 'practice' && <Stack spacing={1}>{lessonImportPreview.result.questions.map((question) => <Paper key={question.number} variant="outlined" sx={{ p: 1.5 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Question {question.number}: {question.question}</Typography><Typography variant="caption" color="text.secondary">Topic: {question.topic}</Typography><Stack spacing={0.25} sx={{ mt: 0.75 }}>{question.options.map((option, optionIndex) => <Typography key={optionIndex} variant="body2" color={optionIndex === question.correctOption ? 'success.main' : 'text.primary'}>{String.fromCharCode(65 + optionIndex)}. {option}</Typography>)}</Stack>{question.explanation && <Typography variant="body2" sx={{ mt: 0.75 }}>Explanation: {question.explanation}</Typography>}</Paper>)}</Stack>}{lessonImportPreview.type === 'stepByStepSolver' && <Stack spacing={1}>{(lessonImportPreview.result.stepByStepSolver?.problems ?? []).map((problem) => <Paper key={problem.id} variant="outlined" sx={{ p: 1.5 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Problem {problem.id}: {problem.prompt}</Typography><Typography variant="caption" color="text.secondary">{problem.steps.length} step(s) · {problem.followUpQuestions.length} follow-up question(s)</Typography></Paper>)}</Stack>}{!lessonImportPreview.result.fatalError && lessonImportPreview.result.issues.length === 0 && <Alert severity="info">This lesson will be appended to the current module. It remains a draft until you save the course or class.</Alert>}{!lessonImportPreview.result.fatalError && lessonImportPreview.result.issues.length > 0 && <Alert severity="info">{lessonImportPreview.type === 'stepByStepSolver' ? lessonImportPreview.result.stepByStepSolver?.problems.length ?? 0 : lessonImportPreview.result.questions.length} valid {lessonImportPreview.type === 'stepByStepSolver' ? 'problem(s)' : 'question(s)'} will be imported; the flagged entries will be skipped.</Alert>}</>}</Stack></DialogContent><DialogActions><MuiButton onClick={() => setLessonImportPreview(null)}>Cancel</MuiButton><MuiButton variant="contained" onClick={applyLessonImport} disabled={isImportingLesson || !lessonImportPreview || Boolean(lessonImportPreview.result.fatalError) || (lessonImportPreview.type === 'stepByStepSolver' ? !lessonImportPreview.result.stepByStepSolver?.problems.length : lessonImportPreview.type !== 'article' && !lessonImportPreview.result.questions.length)}>Add to current module</MuiButton></DialogActions></Dialog>
    </Paper>
  )
}

const PracticeQuestionsEditor: FC<{ lesson: AdminLesson; updateLessonDraft: (lesson: AdminLesson) => void }> = ({ lesson, updateLessonDraft }) => {
  const questions = lesson.practiceQuestions ?? []
  const updateQuestion = (questionId: number, update: Partial<NonNullable<AdminLesson['practiceQuestions']>[number]>) => updateLessonDraft({ ...lesson, practiceQuestions: questions.map((question) => question.id === questionId ? { ...question, ...update } : question) })
  const addQuestion = () => updateLessonDraft({ ...lesson, practiceQuestions: [...questions, { id: Math.max(0, ...questions.map((question) => question.id)) + 1, question: '', topic: '', options: ['', ''], correctAnswer: '', explanation: '' }] })
  return <Stack spacing={1.5}><Typography variant="body2" color="text.secondary">Practice questions have no timer, auto-submit, or attempt limit. Learners see the explanation immediately after choosing an answer.</Typography>{questions.map((question, index) => <Paper key={question.id} elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Stack spacing={1}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Question {index + 1}</Typography><IconButton size="small" color="error" onClick={() => updateLessonDraft({ ...lesson, practiceQuestions: questions.filter((current) => current.id !== question.id) })} aria-label={`Delete practice question ${index + 1}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Box><TextField fullWidth size="small" label="Question text" value={question.question} onChange={(event) => updateQuestion(question.id, { question: event.target.value })} /><TextField fullWidth required size="small" label="Topic" placeholder="e.g. Fractions" value={question.topic} onChange={(event) => updateQuestion(question.id, { topic: event.target.value })} /><Stack spacing={0.75}>{question.options.map((option, optionIndex) => <TextField key={`${question.id}-${optionIndex}`} fullWidth size="small" label={`Answer option ${optionIndex + 1}`} value={option} onChange={(event) => updateQuestion(question.id, { options: question.options.map((current, currentIndex) => currentIndex === optionIndex ? event.target.value : current) })} />)}</Stack><MuiButton size="small" onClick={() => updateQuestion(question.id, { options: [...question.options, ''] })} sx={{ alignSelf: 'flex-start' }}>Add answer option</MuiButton><FormControl fullWidth size="small"><InputLabel>Correct answer</InputLabel><Select label="Correct answer" value={question.correctAnswer} onChange={(event) => updateQuestion(question.id, { correctAnswer: event.target.value })}>{question.options.filter(Boolean).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</Select></FormControl><TextField fullWidth multiline minRows={2} size="small" label="Explanation" value={question.explanation} onChange={(event) => updateQuestion(question.id, { explanation: event.target.value })} /></Stack></Paper>)}<MuiButton variant="outlined" onClick={addQuestion} sx={{ alignSelf: 'flex-start' }}>Add practice question</MuiButton></Stack>
}

const ReadyMadeSimulationToolPicker: FC<{ lesson: AdminLesson; updateLessonDraft: (lesson: AdminLesson) => void }> = ({ lesson, updateLessonDraft }) => {
  const selectTool = (tool: StemToolDefinition) => updateLessonDraft({ ...lesson, simulationToolId: tool.id, simulation: tool.config })
  return <Stack spacing={1.5}><Box><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Choose a finished STEM Lab tool</Typography><Typography variant="body2" color="text.secondary">The formula, adjustable variables, and validated observation are already built in. Select a tool and enter the lesson title above.</Typography></Box><Stack spacing={1}>{STEM_TOOL_LIBRARY.map((tool) => { const selected = lesson.simulationToolId === tool.id; return <Paper key={tool.id} elevation={0} component="button" type="button" onClick={() => selectTool(tool)} sx={{ display: 'block', width: '100%', p: 1.75, textAlign: 'left', border: 1, borderColor: selected ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: selected ? 'action.selected' : 'background.paper', color: 'text.primary', cursor: 'pointer', font: 'inherit', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}><Box><Stack direction="row" spacing={1} alignItems="center"><Typography sx={{ fontWeight: 700 }}>{tool.name}</Typography><Chip label={tool.subject} size="small" color={tool.subject === 'Chemistry' ? 'warning' : tool.subject === 'Biology' ? 'success' : 'secondary'} /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{tool.description}</Typography></Box><Chip label={selected ? 'Selected' : 'Select'} color={selected ? 'primary' : 'default'} variant={selected ? 'filled' : 'outlined'} size="small" /></Stack></Paper>})}{STEM_TOOL_PICKER_COMING_SOON.map((tool) => <Paper key={tool} elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', opacity: 0.75 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{tool}</Typography><Typography variant="caption" color="text.secondary">A finished tool for this topic is not available yet.</Typography></Box><Chip label="Coming Soon" size="small" /></Stack></Paper>)}</Stack></Stack>
}

const QuizImageDropZone: FC<{ image?: string; label: string; hint?: string; compact?: boolean; onUpload: (file: File) => void; onRemove: () => void }> = ({ image, label, hint, compact = false, onUpload, onRemove }) => <Box onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const [file] = Array.from(event.dataTransfer.files); if (file) onUpload(file) }} sx={compact ? { display: 'flex', alignItems: 'center', gap: 0.5 } : { display: 'flex', minHeight: 132, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1.5, bgcolor: 'background.paper', '&:hover': { borderColor: 'primary.main' } }}>
  {image ? <><Box component="img" src={image} alt={label} sx={compact ? { width: 40, height: 32, objectFit: 'cover', borderRadius: 0.75 } : { width: '100%', height: 132, objectFit: 'contain', p: 0.5 }} /><Tooltip title={`Replace ${label}`}><IconButton component="label" size="small" aria-label={`Replace ${label}`} sx={compact ? undefined : { position: 'absolute', right: 34, top: 4, bgcolor: 'background.paper' }}><EditOutlinedIcon fontSize="small" /><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const [file] = Array.from(event.target.files ?? []); if (file) onUpload(file); event.target.value = '' }} /></IconButton></Tooltip><Tooltip title={`Remove ${label}`}><IconButton size="small" onClick={onRemove} aria-label={`Remove ${label}`} sx={compact ? undefined : { position: 'absolute', right: 4, top: 4, bgcolor: 'background.paper' }}><CloseIcon fontSize="small" /></IconButton></Tooltip></> : <Box component="label" sx={compact ? { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 1, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main', bgcolor: 'action.hover' } } : { display: 'flex', width: '100%', minHeight: 132, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, cursor: 'pointer', color: 'text.secondary', textAlign: 'center', '&:hover': { color: 'primary.main' } }}><UploadFileOutlinedIcon fontSize={compact ? 'small' : 'medium'} /><Typography variant={compact ? 'caption' : 'body2'}>{compact ? '' : <>Click to upload or drag and drop<br /><strong>JPG, PNG, WebP less than 5MB</strong></>}</Typography>{hint && !compact && <Typography variant="caption" color="text.secondary">{hint}</Typography>}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const [file] = Array.from(event.target.files ?? []); if (file) onUpload(file); event.target.value = '' }} aria-label={`Upload ${label}`} /></Box>}
</Box>

const QuizQuestionsEditor: FC<{ lesson: AdminLesson; updateLessonDraft: (lesson: AdminLesson) => void }> = ({ lesson, updateLessonDraft }) => {
  const questions = lesson.quizQuestions ?? []
  const updateQuestion = (questionId: number, update: Partial<NonNullable<AdminLesson['quizQuestions']>[number]>) => updateLessonDraft({ ...lesson, quizQuestions: questions.map((question) => question.id === questionId ? { ...question, ...update } : question) })
  const updateQuestionImage = async (question: NonNullable<AdminLesson['quizQuestions']>[number], field: 'questionImage' | 'explanationImage', file: File) => {
    try { updateQuestion(question.id, { [field]: await readArticleImage(file) }) }
    catch (error) { toast.add({ title: 'Unable to add image', description: error instanceof Error ? error.message : 'Choose a JPG, PNG, or WebP image smaller than 5 MB.', type: 'error' }) }
  }
  const updateOptionImage = async (question: NonNullable<AdminLesson['quizQuestions']>[number], optionIndex: number, file: File) => {
    try {
      const optionImages = [...(question.optionImages ?? [])]
      optionImages[optionIndex] = await readArticleImage(file)
      updateQuestion(question.id, { optionImages })
    } catch (error) { toast.add({ title: 'Unable to add image', description: error instanceof Error ? error.message : 'Choose a JPG, PNG, or WebP image smaller than 5 MB.', type: 'error' }) }
  }
  const addQuestion = () => updateLessonDraft({ ...lesson, quizQuestions: [...questions, { id: Math.max(0, ...questions.map((question) => question.id)) + 1, question: '', topic: '', options: ['', '', '', ''], correctOption: 0, explanation: '' }] })
  return <Stack spacing={2}>
    {questions.map((question, questionIndex) => <Paper key={question.id} elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Question {questionIndex + 1}</Typography><IconButton size="small" color="error" onClick={() => updateLessonDraft({ ...lesson, quizQuestions: questions.filter((current) => current.id !== question.id) })} aria-label={`Delete question ${questionIndex + 1}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Stack>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Question*</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.25, alignItems: 'stretch' }}>
            <TextField fullWidth multiline minRows={2} placeholder="Enter your question" value={question.question} onChange={(event) => updateQuestion(question.id, { question: event.target.value })} />
            <QuizImageDropZone image={question.questionImage} label="question image" onUpload={(file) => void updateQuestionImage(question, 'questionImage', file)} onRemove={() => updateQuestion(question.id, { questionImage: undefined })} />
          </Box>
          <TextField fullWidth size="small" label="Topic for learning insights" placeholder="e.g. Fractions" value={question.topic} onChange={(event) => updateQuestion(question.id, { topic: event.target.value })} sx={{ mt: 1.25 }} />
        </Paper>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 1.5, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) 118px', sm: 'minmax(0, 1fr) 145px' }, gap: 1, mb: 0.75 }}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Options*</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Right answer*</Typography></Box>
          <Stack spacing={0.75}>{question.options.map((option, optionIndex) => <Box key={`${question.id}-${optionIndex}`} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) 118px', sm: 'minmax(0, 1fr) 145px' }, gap: 1, alignItems: 'center' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}><Typography variant="body2" color="text.secondary" sx={{ width: 24, flexShrink: 0 }}>{String(optionIndex + 1).padStart(2, '0')}.</Typography><TextField fullWidth size="small" placeholder={`Option ${optionIndex + 1}`} value={option} onChange={(event) => updateQuestion(question.id, { options: question.options.map((current, index) => index === optionIndex ? event.target.value : current) })} InputProps={{ endAdornment: <InputAdornment position="end"><QuizImageDropZone compact image={question.optionImages?.[optionIndex]} label={`option ${optionIndex + 1} image`} onUpload={(file) => void updateOptionImage(question, optionIndex, file)} onRemove={() => updateQuestion(question.id, { optionImages: question.optionImages?.map((image, index) => index === optionIndex ? undefined : image) })} /></InputAdornment> }} /></Stack>
            <FormControlLabel sx={{ m: 0, minHeight: 42, px: 0.75, borderRadius: 1, bgcolor: question.correctOption === optionIndex ? 'action.selected' : 'transparent', '& .MuiFormControlLabel-label': { fontSize: 12 } }} control={<Radio size="small" checked={question.correctOption === optionIndex} onChange={() => updateQuestion(question.id, { correctOption: optionIndex })} inputProps={{ 'aria-label': `Mark option ${optionIndex + 1} as correct` }} />} label="Right Answer" />
          </Box>)}</Stack>
          <MuiButton size="small" onClick={() => updateQuestion(question.id, { options: [...question.options, ''] })} sx={{ mt: 0.75 }}>Add option</MuiButton>
        </Paper>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Explanation*</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.25, alignItems: 'stretch' }}>
            <TextField fullWidth multiline minRows={4} placeholder="Explain why the selected answer is correct" value={question.explanation ?? ''} onChange={(event) => updateQuestion(question.id, { explanation: event.target.value })} />
            <QuizImageDropZone image={question.explanationImage} label="explanation image" onUpload={(file) => void updateQuestionImage(question, 'explanationImage', file)} onRemove={() => updateQuestion(question.id, { explanationImage: undefined })} />
          </Box>
        </Paper>
      </Stack>
    </Paper>)}
    <MuiButton size="small" variant="outlined" onClick={addQuestion} sx={{ alignSelf: 'flex-start' }}>Add question</MuiButton>
  </Stack>
}

type QuizImportImageSlot = { questionNumber: number; field: 'questionImage' | 'explanationImage' | 'optionImage'; optionIndex?: number }

const QuizImportPreview: FC<{ questions: ImportedQuestion[]; onUpload: (questionNumber: number, slot: QuizImportImageSlot['field'], file: File, optionIndex?: number) => void; onRemove: (questionNumber: number, slot: QuizImportImageSlot['field'], optionIndex?: number) => void }> = ({ questions, onUpload, onRemove }) => <Stack spacing={1.25}>
  {questions.map((question) => <Paper key={question.number} variant="outlined" sx={{ p: 1.5 }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Question {question.number}: {question.question}</Typography><Typography variant="caption" color="text.secondary">Topic: {question.topic}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mt: 1 }}>
      <QuizImageDropZone image={question.questionImage} label={`question ${question.number} image`} hint={question.questionImageMarker} onUpload={(file) => onUpload(question.number, 'questionImage', file)} onRemove={() => onRemove(question.number, 'questionImage')} />
      <Stack spacing={0.75}>{question.options.map((option, optionIndex) => <Paper key={`${question.number}-${optionIndex}`} variant="outlined" sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 110px', alignItems: 'center', gap: 1, p: 0.75 }}><Typography variant="body2" color={optionIndex === question.correctOption ? 'success.main' : 'text.primary'}>{String.fromCharCode(65 + optionIndex)}. {option}</Typography><QuizImageDropZone compact image={question.optionImages?.[optionIndex]} label={`question ${question.number} option ${String.fromCharCode(65 + optionIndex)} image`} hint={question.optionImageMarkers[optionIndex]} onUpload={(file) => onUpload(question.number, 'optionImage', file, optionIndex)} onRemove={() => onRemove(question.number, 'optionImage', optionIndex)} /></Paper>)}</Stack>
      <Box sx={{ gridColumn: { sm: '1 / -1' } }}><Typography variant="body2" sx={{ mb: 0.75 }}>Explanation: {question.explanation || '—'}</Typography><QuizImageDropZone image={question.explanationImage} label={`question ${question.number} explanation image`} hint={question.explanationImageMarker} onUpload={(file) => onUpload(question.number, 'explanationImage', file)} onRemove={() => onRemove(question.number, 'explanationImage')} /></Box>
    </Box>
  </Paper>)}
</Stack>

const LessonDetailsPanel: FC<{ lessonPanel: LessonPanelState; updateLessonDraft: (lesson: AdminLesson) => void; onClose: () => void; onSave: () => void; onVideoFile: (file: File) => void; onAddResources: (files: FileList | null) => void; videoUploadProgress: number; disabled: boolean; classSchedule?: ClassLessonSchedule; syllabusGrade: number | null; availableLiveSessionDates: string[] }> = ({ lessonPanel, updateLessonDraft, onClose, onSave, onVideoFile, onAddResources, videoUploadProgress, disabled, classSchedule, syllabusGrade, availableLiveSessionDates }) => {
  const { lesson } = lessonPanel
  const questionId = Math.max(0, ...(lesson.quizQuestions ?? []).map((question) => question.id)) + 1
  const removeResource = (resourceId: number) => updateLessonDraft({ ...lesson, resources: lesson.resources.filter((resource) => resource.id !== resourceId) })
  const isVideoProcessing = lesson.type === 'video' && videoUploadProgress > 0 && videoUploadProgress < 100
  const liveLessonSettings = { meetingUrl: '', getScheduledAt: (_lesson: AdminLesson, _isNew: boolean) => lesson.scheduledAt ?? '' }
  return <Paper elevation={0} sx={{ mt: 2, p: { xs: 1.5, sm: 2.5, md: 3 }, border: 1, borderColor: 'divider', borderRadius: 2.5, backgroundColor: 'background.paper', boxShadow: '0 8px 32px rgba(16, 43, 63, 0.06)' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}><Box><Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1 }}>Create lesson</Typography><Typography variant="h5" sx={{ fontWeight: 750 }}>{lessonPanel.isNew ? lesson.type === 'live' ? 'Add Live Lesson' : 'Add Lesson' : lesson.type === 'live' ? 'Live lesson details' : 'Lesson details'}</Typography><Typography color="text.secondary" variant="body2">Add a new lesson to your course. Choose a lesson type and start building your content.</Typography></Box><IconButton onClick={onClose} aria-label="Close lesson details"><CloseIcon /></IconButton></Box>
    <Stack spacing={2}><TextField label="Title" fullWidth required value={lesson.title} onChange={(event) => updateLessonDraft({ ...lesson, title: event.target.value })} />
      {lesson.type === 'video' && <Stack spacing={1.5}><Box component="label" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const [file] = Array.from(event.dataTransfer.files); if (file) onVideoFile(file) }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, p: 3, border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1, color: 'text.secondary', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}><UploadFileOutlinedIcon color="primary" /><Typography variant="body2" sx={{ fontWeight: 600 }}>{lesson.videoUrl ? 'Replace video' : 'Drop a video here or choose a file'}</Typography><Typography variant="caption">Duration is extracted automatically after processing.</Typography><input hidden type="file" accept="video/*" onChange={(event) => { const [file] = Array.from(event.target.files ?? []); if (file) onVideoFile(file); event.target.value = '' }} /></Box>{videoUploadProgress > 0 && <Box><LinearProgress variant="determinate" value={videoUploadProgress} sx={{ mb: 0.5 }} /><Typography color="text.secondary" variant="caption">{isVideoProcessing ? `Processing video · ${videoUploadProgress}%` : lesson.duration ? `Video duration: ${formatDuration(lesson.duration)}` : 'Video uploaded. Duration will appear when metadata is available.'}</Typography></Box>}<Box><Typography variant="body2" sx={{ mb: 0.75 }}>Downloadable resources <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography></Typography><Box component="label" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.main', cursor: 'pointer', fontSize: 14 }}><UploadFileOutlinedIcon fontSize="small" /> Add files<input hidden type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx" onChange={(event) => { onAddResources(event.target.files); event.target.value = '' }} /></Box>{lesson.resources.length > 0 && <Stack spacing={0.5} sx={{ mt: 1 }}>{lesson.resources.map((resource) => <Box key={resource.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant="caption" sx={{ flex: 1 }}>Downloadable resource</Typography><IconButton size="small" onClick={() => updateLessonDraft({ ...lesson, resources: lesson.resources.filter((currentResource) => currentResource.id !== resource.id) })} aria-label="Remove downloadable resource"><CloseIcon fontSize="small" /></IconButton></Box>)}</Stack>}</Box></Stack>}
      {lesson.type === 'article' && <Box><Typography variant="body2" sx={{ mb: 0.75 }}>Downloadable resources <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography></Typography><Box component="label" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, minHeight: 96, p: 2, border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1, color: 'text.secondary', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}><UploadFileOutlinedIcon color="primary" fontSize="small" /><Typography variant="body2">Add files</Typography><input hidden type="file" multiple onChange={(event) => { onAddResources(event.target.files); event.target.value = '' }} aria-label="Add downloadable resources" /></Box>{lesson.resources.length > 0 && <Stack spacing={0.5} sx={{ mt: 1 }}>{lesson.resources.map((resource) => <Box key={resource.id} sx={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', alignItems: 'center', gap: 1, p: 1, border: 1, borderColor: 'divider', borderRadius: 1, backgroundColor: 'background.default' }}><InsertDriveFileOutlinedIcon color="primary" fontSize="small" /><Typography variant="body2" color="text.secondary">Downloadable resource</Typography><IconButton size="small" color="error" onClick={() => removeResource(resource.id)} aria-label="Remove downloadable resource"><DeleteOutlineIcon fontSize="small" /></IconButton></Box>)}</Stack>}</Box>}
      {lesson.type === 'interactive' && <InteractiveHotspotEditor lesson={lesson} onChange={updateLessonDraft} />}
      {lesson.type === 'simulation' && <PlatformEngineLessonPicker lesson={lesson} updateLessonDraft={updateLessonDraft} onSave={onSave} />}
      {lesson.type === 'stepByStepSolver' && <StepByStepSolverEditor lesson={lesson} onChange={updateLessonDraft} />}
      {lesson.type === 'article' && <><ArticleBlockEditor lesson={lesson} onChange={updateLessonDraft} readImage={readArticleImage} /><Typography color="text.secondary" variant="caption">Estimated read time: {Math.max(1, Math.ceil(getArticleWordCount(lesson.articleBody ?? '') / 200))} min</Typography><ArticleVocabularyEditor lesson={lesson} onChange={updateLessonDraft} /></>}
      {lesson.type === 'quiz' && <Stack spacing={1.5}>{classSchedule && <><TextField required fullWidth type="datetime-local" label="Quiz start date and time" value={lesson.scheduledAt && Number.isFinite(Date.parse(lesson.scheduledAt)) ? toLocalDateTime(new Date(lesson.scheduledAt)) : ''} onChange={(event) => updateLessonDraft({ ...lesson, scheduledAt: event.target.value ? new Date(event.target.value).toISOString() : '' })} InputLabelProps={{ shrink: true }} /><Typography variant="caption" color="text.secondary">Students can start at this time. The quiz timer starts when they begin and submits automatically when time runs out.</Typography></>}<QuizQuestionsEditor lesson={lesson} updateLessonDraft={updateLessonDraft} /><TextField type="number" label="Pass threshold (%)" size="small" inputProps={{ min: 0, max: 100 }} value={lesson.passThreshold ?? 70} onChange={(event) => updateLessonDraft({ ...lesson, passThreshold: Number(event.target.value) })} sx={{ maxWidth: 220 }} /></Stack>}
      {lesson.type === 'practice' && <PracticeQuestionsEditor lesson={lesson} updateLessonDraft={updateLessonDraft} />}
      {lesson.type === 'live' && classSchedule && <Stack spacing={1.5}><FormControl fullWidth required disabled={availableLiveSessionDates.length === 0}><InputLabel>Session date</InputLabel><Select label="Session date" value={getLiveLessonDate(lesson.scheduledAt)} onChange={(event) => updateLessonDraft({ ...lesson, ...getLiveLessonTiming(event.target.value, lesson.sessionTime ?? '', lesson.sessionDuration ?? 60) })}>{availableLiveSessionDates.map((sessionDate) => <MenuItem key={sessionDate} value={sessionDate}>{new Date(`${sessionDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</MenuItem>)}</Select></FormControl>{availableLiveSessionDates.length === 0 && <Typography color="error" variant="caption">No session dates are available within the class date range and recurring days.</Typography>}<TextField required fullWidth type="time" label="Session time" value={lesson.sessionTime ?? ''} onChange={(event) => updateLessonDraft({ ...lesson, sessionTime: event.target.value, ...getLiveLessonTiming(getLiveLessonDate(lesson.scheduledAt), event.target.value, lesson.sessionDuration ?? 60) })} InputLabelProps={{ shrink: true }} /><TextField required fullWidth type="url" label="Meeting link" value={lesson.meetingUrl ?? ''} onChange={(event) => updateLessonDraft({ ...lesson, meetingUrl: event.target.value })} /><TextField required fullWidth type="number" label="Session duration (minutes)" inputProps={{ min: 1 }} value={lesson.sessionDuration ?? 60} onChange={(event) => { const sessionDuration = Math.max(1, Number(event.target.value)); updateLessonDraft({ ...lesson, sessionDuration, ...getLiveLessonTiming(lesson.scheduledAt?.slice(0, 10) ?? '', lesson.sessionTime ?? '', sessionDuration) }) }} /></Stack>}{lesson.type === 'live' && !classSchedule && <Stack spacing={1.5}><Typography variant="body2"><strong>Meeting link:</strong> {lesson.meetingUrl || 'Not set'}</Typography><Typography variant="body2"><strong>Session date and time:</strong> {lesson.scheduledAt ? new Date(lesson.scheduledAt).toLocaleString() : 'Not scheduled'}</Typography><Typography variant="body2"><strong>Duration:</strong> {lesson.sessionDuration ?? 60} minutes</Typography></Stack>}{false && lesson.type === 'live' && (liveLessonSettings ? <Stack spacing={1.5}><Box><Typography variant="body2" color="text.secondary">Meeting Link</Typography><Typography variant="body2">{liveLessonSettings.meetingUrl || 'No class meeting link set'}</Typography></Box><Box><Typography variant="body2" color="text.secondary">Scheduled date and time</Typography><Typography variant="body2">{lesson.dateOverridden ? lesson.scheduledAt || 'Choose a date and time' : liveLessonSettings.getScheduledAt(lesson, lessonPanel.isNew) || 'Set class days, time, and start date to calculate'}</Typography></Box><FormControlLabel control={<Switch checked={lesson.dateOverridden === true} onChange={(event) => updateLessonDraft({ ...lesson, dateOverridden: event.target.checked, scheduledAt: event.target.checked ? (lesson.scheduledAt || liveLessonSettings.getScheduledAt(lesson, lessonPanel.isNew)) : liveLessonSettings.getScheduledAt(lesson, lessonPanel.isNew) })} inputProps={{ 'aria-label': 'Override date' }} />} label="Override date" />{lesson.dateOverridden && <TextField fullWidth label="Scheduled date and time" type="datetime-local" InputLabelProps={{ shrink: true }} value={lesson.scheduledAt ?? ''} onChange={(event) => updateLessonDraft({ ...lesson, scheduledAt: event.target.value })} />}<TextField label="Duration (minutes)" type="number" inputProps={{ min: 1 }} value={Math.round((lesson.estimatedDuration ?? 3600) / 60)} onChange={(event) => updateLessonDraft({ ...lesson, estimatedDuration: Number(event.target.value) * 60 })} /></Stack> : <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><TextField fullWidth label="Meeting link" type="url" placeholder="https://" value={lesson.meetingUrl ?? ''} onChange={(event) => updateLessonDraft({ ...lesson, meetingUrl: event.target.value })} /><TextField fullWidth label="Scheduled date and time" type="datetime-local" InputLabelProps={{ shrink: true }} value={lesson.scheduledAt ?? ''} onChange={(event) => updateLessonDraft({ ...lesson, scheduledAt: event.target.value })} /><TextField label="Duration (minutes)" type="number" inputProps={{ min: 1 }} value={Math.round((lesson.estimatedDuration ?? 3600) / 60)} onChange={(event) => updateLessonDraft({ ...lesson, estimatedDuration: Number(event.target.value) * 60 })} /></Stack>)}
      {syllabusGrade !== null && <SyllabusTopicPicker grade={syllabusGrade} lesson={lesson} updateLessonDraft={updateLessonDraft} />}
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}><Button label="Cancel" variant="text" onClick={onClose} /><Button label={isVideoProcessing ? 'Processing video' : 'Save Lesson'} onClick={() => onSave()} disabled={disabled} /></Stack>
    </Stack>
  </Paper>
}

const AnalyticsValueTooltip: FC<{ label: string; value: string; children: ReactElement }> = ({ label, value, children }) => <Tooltip arrow enterTouchDelay={0} leaveTouchDelay={1800} placement="top" title={<Box><Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,.78)', lineHeight: 1.4 }}>{label}</Typography><Stack direction="row" spacing={0.75} alignItems="center"><Box aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#5ce0c2' }} /><Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>{value}</Typography></Stack></Box>} componentsProps={{ tooltip: { sx: { bgcolor: '#102b3f', px: 1.25, py: 0.8, borderRadius: 1.5, boxShadow: '0 8px 24px rgba(16, 43, 63, .24)' } }, arrow: { sx: { color: '#102b3f' } } }}>{children}</Tooltip>

const DashboardCharts: FC<Pick<AdminDashboardOverview, 'paidRevenueYears' | 'paidRevenueByMonth' | 'learningMetrics' | 'enrollmentDistribution'>> = ({ paidRevenueYears = [], paidRevenueByMonth = [], learningMetrics, enrollmentDistribution = [] }) => {
  const [activeEnrollmentType, setActiveEnrollmentType] = useState<'courses' | 'classes' | 'exams' | null>(null)
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down('lg'))
  const currentYear = new Date().getFullYear()
  const [chosenCurrency, setChosenCurrency] = useState('')
  const [chosenYear, setChosenYear] = useState(currentYear)
  const [activeRevenueIndex, setActiveRevenueIndex] = useState<number | null>(null)
  const availableYears = [...new Set([currentYear, ...paidRevenueYears, ...paidRevenueByMonth.map((point) => Number(point.monthKey.slice(0, 4)))])].sort((a, b) => b - a)
  const year = availableYears.includes(chosenYear) ? chosenYear : availableYears[0]
  const availableCurrencies = [...new Set(paidRevenueByMonth.map((point) => point.currency))]
  const currency = availableCurrencies.includes(chosenCurrency) ? chosenCurrency : availableCurrencies[0] ?? ''
  const revenueSeries = paidRevenueByMonth.filter((point) => Number(point.monthKey.slice(0, 4)) === year && point.currency === currency).sort((a, b) => a.monthKey.localeCompare(b.monthKey))
  const revenueTotal = revenueSeries.reduce((total, point) => total + point.value, 0)
  const formatCurrency = (value: number) => currency ? new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value) : String(value)
  const formatAxisCurrency = (value: number) => currency ? new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value) : String(value)
  const formatCount = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
  const lessonCompletion = learningMetrics?.lessonCompletion
  const classAttendance = learningMetrics?.classAttendance
  const quizPerformance = learningMetrics?.quizPerformance
  const metrics = [
    lessonCompletion?.total && lessonCompletion.percentage != null ? { key: 'lesson-completion', label: 'Lesson Completion', value: lessonCompletion.percentage, detail: `${formatCount(lessonCompletion.completed)} of ${formatCount(lessonCompletion.total)} lesson records completed`, icon: <BookOutlinedIcon fontSize="small" />, color: '#0b8877' } : null,
    classAttendance?.total && classAttendance.percentage != null ? { key: 'class-attendance', label: 'Class Attendance', value: classAttendance.percentage, detail: `${formatCount(classAttendance.present)} of ${formatCount(classAttendance.total)} marked sessions attended`, icon: <ClassOutlinedIcon fontSize="small" />, color: '#0b8877' } : null,
    quizPerformance?.attempts && quizPerformance.percentage != null ? { key: 'quiz-performance', label: 'Quiz Performance', value: quizPerformance.percentage, detail: `Average score across ${formatCount(quizPerformance.attempts)} submitted attempts`, icon: <QuizOutlinedIcon fontSize="small" />, color: '#bd791b' } : null,
  ].filter((metric): metric is Exclude<typeof metric, null> => metric !== null)
  const enrollmentStyles = { courses: { label: 'Courses', color: '#0b8877' }, classes: { label: 'Classes', color: '#4279c5' }, exams: { label: 'Exams', color: '#bd791b' } } as const
  const enrollmentRecords = enrollmentDistribution.filter((record) => record.count > 0)
  const enrollmentTotal = enrollmentRecords.reduce((total, record) => total + record.count, 0)
  const donutSize = 190
  const donutCenter = donutSize / 2
  const donutRadius = 66
  const donutStroke = 22
  const donutCircumference = 2 * Math.PI * donutRadius
  let donutOffset = 0
  const revenueWidth = isNarrow ? 420 : 900
  const revenueHeight = 286
  const revenueMargins = isNarrow ? { top: 24, right: 14, bottom: 42, left: 62 } : { top: 24, right: 22, bottom: 44, left: 82 }
  const revenuePlotWidth = revenueWidth - revenueMargins.left - revenueMargins.right
  const revenuePlotHeight = revenueHeight - revenueMargins.top - revenueMargins.bottom
  const maxRevenue = Math.max(0, ...revenueSeries.map(({ value }) => value))
  const revenueStep = maxRevenue > 0 ? (() => {
    const roughStep = maxRevenue / 4
    const magnitude = 10 ** Math.floor(Math.log10(roughStep))
    const normalized = roughStep / magnitude
    return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  })() : 1
  const revenueAxisMax = revenueStep * 4
  const revenueTicks = Array.from({ length: 5 }, (_, index) => revenueAxisMax - revenueStep * index)
  const revenueCoordinates = revenueSeries.map(({ value }, index) => ({
    x: revenueMargins.left + (revenueSeries.length < 2 ? revenuePlotWidth / 2 : (revenuePlotWidth * index) / (revenueSeries.length - 1)),
    y: revenueMargins.top + revenuePlotHeight * (1 - value / revenueAxisMax),
  }))
  const revenueLine = revenueCoordinates.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const revenueArea = revenueCoordinates.length ? `${revenueLine} L ${revenueCoordinates[revenueCoordinates.length - 1].x} ${revenueMargins.top + revenuePlotHeight} L ${revenueCoordinates[0].x} ${revenueMargins.top + revenuePlotHeight} Z` : ''
  const activeRevenuePoint = activeRevenueIndex === null ? null : revenueCoordinates[activeRevenueIndex]
  const activeRevenueRecord = activeRevenueIndex === null ? null : revenueSeries[activeRevenueIndex]

  useEffect(() => {
    setActiveRevenueIndex(null)
  }, [year, currency])

  return <Stack spacing={2}>
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.75 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', minWidth: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Stack direction="row" spacing={1.25} alignItems="center"><Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, flexShrink: 0, borderRadius: 2, color: 'primary.main', backgroundColor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.1) }}><PaymentsOutlinedIcon /></Box><Box><Typography variant="h6" sx={{ fontWeight: 750 }}>Revenue Overview</Typography><Typography variant="body2" color="text.secondary">Paid revenue from courses, classes, exams, and bookstore sales</Typography></Box></Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="flex-end" spacing={1.25}>
          {availableCurrencies.length > 1 && <FormControl size="small" sx={{ minWidth: 112 }}><InputLabel id="dashboard-revenue-currency-label">Currency</InputLabel><Select labelId="dashboard-revenue-currency-label" label="Currency" value={currency} onChange={(event) => setChosenCurrency(event.target.value)}>{availableCurrencies.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>}
          <FormControl size="small" sx={{ minWidth: 112 }}><InputLabel id="dashboard-revenue-year-label">Year</InputLabel><Select labelId="dashboard-revenue-year-label" label="Year" value={year} onChange={(event) => setChosenYear(Number(event.target.value))}>{availableYears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 154 }}><Typography variant="caption" color="text.secondary">Total Paid Revenue ({year})</Typography><Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>{currency ? formatCurrency(revenueTotal) : '—'}</Typography></Box>
        </Stack>
      </Stack>
      {revenueSeries.length === 12 ? <Box onPointerLeave={(event) => { if (event.pointerType !== 'touch' && !event.currentTarget.querySelector('[data-revenue-point]:focus')) setActiveRevenueIndex(null) }} sx={{ mt: 2.25, minWidth: 0, overflow: 'visible', position: 'relative' }}><Box component="svg" viewBox={`0 0 ${revenueWidth} ${revenueHeight}`} sx={{ display: 'block', width: '100%', height: 'auto' }} role="group" aria-label={`Paid revenue from January through December ${year} in ${currency}`}>
        <defs><linearGradient id="admin-paid-revenue-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0b8877" stopOpacity="0.22" /><stop offset="100%" stopColor="#0b8877" stopOpacity="0.015" /></linearGradient></defs>
        {revenueTicks.map((tick, index) => {
          const y = revenueMargins.top + revenuePlotHeight * (index / 4)
          return <g key={`revenue-tick-${index}`}><line x1={revenueMargins.left} x2={revenueWidth - revenueMargins.right} y1={y} y2={y} stroke={theme.palette.divider} strokeDasharray="4 5" /><text x={revenueMargins.left - 9} y={y + 4} fill={theme.palette.text.secondary} fontSize={isNarrow ? 10 : 12} textAnchor="end">{formatAxisCurrency(tick)}</text></g>
        })}
        {revenueArea && <path d={revenueArea} fill="url(#admin-paid-revenue-area)" />}
        {revenueLine && <path d={revenueLine} fill="none" stroke="#0b8877" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
        {revenueCoordinates.map(({ x, y }, index) => <g key={`${revenueSeries[index].monthKey}-${index}`}>
          {activeRevenueIndex === index && <line x1={x} x2={x} y1={y} y2={revenueMargins.top + revenuePlotHeight} stroke="#0b8877" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.55" pointerEvents="none" />}
          <circle data-revenue-point="true" cx={x} cy={y} r={activeRevenueIndex === index ? 7 : 5} fill={theme.palette.background.paper} stroke="#0b8877" strokeWidth={activeRevenueIndex === index ? 3.5 : 3} tabIndex={0} role="button" aria-label={`${revenueSeries[index].label} ${year} — ${formatCurrency(revenueSeries[index].value)}`} aria-describedby={activeRevenueIndex === index ? 'revenue-point-tooltip' : undefined} onPointerEnter={() => setActiveRevenueIndex(index)} onPointerDown={(event) => { if (event.pointerType === 'touch') setActiveRevenueIndex(index) }} onFocus={() => setActiveRevenueIndex(index)} onBlur={(event) => { if (!(event.relatedTarget instanceof SVGElement) || !event.relatedTarget.hasAttribute('data-revenue-point')) setActiveRevenueIndex(null) }} onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault()
              const points = Array.from(event.currentTarget.ownerSVGElement?.querySelectorAll<SVGCircleElement>('[data-revenue-point]') ?? [])
              const currentIndex = points.indexOf(event.currentTarget)
              points[(currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + points.length) % points.length]?.focus()
            } else if (event.key === 'Escape') setActiveRevenueIndex(null)
          }}><title>{`${revenueSeries[index].label} ${year}: ${formatCurrency(revenueSeries[index].value)}`}</title></circle>
        </g>)}
        {revenueSeries.map(({ label, monthKey }, index) => {
          const x = revenueCoordinates[index].x
          const anchor = index === 0 ? 'start' : index === revenueSeries.length - 1 ? 'end' : 'middle'
          return <text key={`${monthKey}-label`} x={x} y={revenueHeight - 12} fill={theme.palette.text.secondary} fontSize={isNarrow ? 10 : 12} textAnchor={anchor}>{isNarrow ? label.slice(0, 3) : label}</text>
        })}
      </Box>{activeRevenuePoint && activeRevenueRecord && <Box id="revenue-point-tooltip" role="tooltip" sx={{ position: 'absolute', zIndex: 1, left: `${(activeRevenuePoint.x / revenueWidth) * 100}%`, top: `${(activeRevenuePoint.y / revenueHeight) * 100}%`, transform: `${activeRevenuePoint.x > revenueWidth * 0.65 ? 'translateX(-100%)' : 'translateX(0)'} ${activeRevenuePoint.y > revenueHeight * 0.38 ? 'translateY(calc(-100% - 12px))' : 'translateY(12px)'}`, px: 1.25, py: 0.8, borderRadius: 1.5, color: '#fff', bgcolor: '#102b3f', boxShadow: '0 8px 24px rgba(16, 43, 63, .24)', pointerEvents: 'none', whiteSpace: 'nowrap' }}><Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,.8)', lineHeight: 1.4 }}>{activeRevenueRecord.label} {year}</Typography><Stack direction="row" spacing={0.75} alignItems="center"><Box aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#5ce0c2' }} /><Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.5 }}>{formatCurrency(activeRevenueRecord.value)}</Typography></Stack></Box>}</Box> : <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 230 }}><Typography color="text.secondary">No paid revenue data is available for {year}.</Typography></Box>}
    </Paper>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2, alignItems: 'stretch' }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', minWidth: 0, height: '100%', boxSizing: 'border-box' }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}><Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, flexShrink: 0, borderRadius: 2, color: 'primary.main', backgroundColor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.1) }}><AssessmentOutlinedIcon fontSize="small" /></Box><Box><Typography variant="h6" sx={{ fontWeight: 750 }}>Student Learning Progress</Typography><Typography variant="body2" color="text.secondary">Learning completion and assessment outcomes.</Typography></Box></Stack>
        {metrics.length ? <Stack spacing={2.25}>{metrics.map((metric) => <Box key={metric.key}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
            <Tooltip title={metric.detail}><Box aria-label={`${metric.label}: ${metric.detail}`} sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, flexShrink: 0, borderRadius: 2, color: metric.color, bgcolor: alpha(metric.color, 0.1) }}>{metric.icon}</Box></Tooltip>
            <Typography variant="body2" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}>{metric.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: metric.color, fontVariantNumeric: 'tabular-nums' }}>{`${Math.round(metric.value)}%`}</Typography>
          </Stack>
          <AnalyticsValueTooltip label={metric.label} value={`${Math.round(metric.value)}% · ${metric.detail}`}><Box component="span" tabIndex={0} role="img" aria-label={`${metric.label}: ${Math.round(metric.value)} percent. ${metric.detail}`} sx={{ display: 'block', width: '100%', outlineOffset: 3 }}><LinearProgress variant="determinate" value={Math.min(100, Math.max(0, metric.value))} aria-label={`${metric.label} ${Math.round(metric.value)} percent`} sx={{ height: 9, borderRadius: 99, bgcolor: alpha(metric.color, 0.12), '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: metric.color } }} /></Box></AnalyticsValueTooltip>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.6, pl: 5.5 }}>{metric.detail}</Typography>
        </Box>)}</Stack> : <Box role="status" sx={{ display: 'grid', placeItems: 'center', minHeight: 180, textAlign: 'center', px: 2 }}><Typography variant="body2" color="text.secondary">Learning progress metrics will appear when completion, attendance, or assessment records are available.</Typography></Box>}
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', minWidth: 0, height: '100%', boxSizing: 'border-box' }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.5 }}><Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, flexShrink: 0, borderRadius: 2, color: 'primary.main', backgroundColor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.1) }}><GroupOutlinedIcon fontSize="small" /></Box><Box><Typography variant="h6" sx={{ fontWeight: 750 }}>Enrollment Analytics</Typography><Typography variant="body2" color="text.secondary">Paid enrollment records and practice-exam purchases</Typography></Box></Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(112px, .85fr) minmax(0, 1.15fr)', sm: 'minmax(140px, .9fr) minmax(0, 1.1fr)' }, alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
          {enrollmentTotal > 0 ? <>
            <Box sx={{ minWidth: 0, justifySelf: 'center', width: '100%', maxWidth: donutSize }}>
              <Box component="svg" viewBox={`0 0 ${donutSize} ${donutSize}`} onPointerLeave={(event) => { if (event.pointerType !== 'touch') setActiveEnrollmentType(null) }} sx={{ display: 'block', width: '100%', height: 'auto' }} role="group" aria-label={`Enrollment distribution, ${formatCount(enrollmentTotal)} records`}>
                <circle cx={donutCenter} cy={donutCenter} r={donutRadius} fill="none" stroke={theme.palette.action.hover} strokeWidth={donutStroke} />
                {enrollmentRecords.map((record) => {
                  const segment = donutCircumference * record.count / enrollmentTotal
                  const offset = donutOffset
                  donutOffset += segment
                  return <AnalyticsValueTooltip key={record.type} label={enrollmentStyles[record.type].label} value={`${formatCount(record.count)} records · ${((record.count / enrollmentTotal) * 100).toFixed(1)}%`}><circle data-enrollment-point="true" cx={donutCenter} cy={donutCenter} r={donutRadius} fill="none" stroke={enrollmentStyles[record.type].color} strokeWidth={activeEnrollmentType === record.type ? donutStroke + 3 : donutStroke} strokeDasharray={`${segment} ${donutCircumference - segment}`} strokeDashoffset={-offset} transform={`rotate(-90 ${donutCenter} ${donutCenter})`} tabIndex={0} role="button" aria-label={`${enrollmentStyles[record.type].label}: ${formatCount(record.count)} records, ${((record.count / enrollmentTotal) * 100).toFixed(1)} percent`} onPointerEnter={() => setActiveEnrollmentType(record.type)} onPointerLeave={(event) => { if (event.pointerType !== 'touch') setActiveEnrollmentType(null) }} onPointerDown={() => setActiveEnrollmentType(record.type)} onFocus={() => setActiveEnrollmentType(record.type)} onBlur={() => setActiveEnrollmentType(null)}><title>{`${enrollmentStyles[record.type].label}: ${formatCount(record.count)} records, ${((record.count / enrollmentTotal) * 100).toFixed(1)}%`}</title></circle></AnalyticsValueTooltip>
                })}
                <text x={donutCenter} y={donutCenter - 3} textAnchor="middle" fill={theme.palette.text.primary} fontSize="25" fontWeight="800">{formatCount(enrollmentTotal)}</text>
                <text x={donutCenter} y={donutCenter + 18} textAnchor="middle" fill={theme.palette.text.secondary} fontSize="10">total records</text>
              </Box>
            </Box>
            <Stack divider={<Divider flexItem />} sx={{ minWidth: 0 }}>
              {enrollmentRecords.map((record) => <Stack key={record.type} direction="row" alignItems="center" spacing={1} sx={{ py: 1.25, minWidth: 0 }}>
                <Box aria-hidden="true" sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: enrollmentStyles[record.type].color }} />
                <Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{enrollmentStyles[record.type].label}</Typography><Typography variant="caption" color="text.secondary">{((record.count / enrollmentTotal) * 100).toFixed(1)}%</Typography></Box>
                <Typography variant="body2" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{formatCount(record.count)}</Typography>
              </Stack>)}
            </Stack>
          </> : <Box role="status" sx={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', minHeight: 180, textAlign: 'center', px: 2 }}><Typography variant="body2" color="text.secondary">No paid enrollment or exam purchase records are available yet.</Typography></Box>}
        </Box>
      </Paper>
    </Box>
  </Stack>
}

const WeakAreasPanel: FC<{ weakAreas: AdminWeakArea[] }> = ({ weakAreas }) => {
  const totalResponses = weakAreas.reduce((total, area) => total + area.total, 0)
  const correctResponses = weakAreas.reduce((total, area) => total + area.correct, 0)
  const accuracy = totalResponses ? Math.round((correctResponses / totalResponses) * 100) : 0
  const needsImprovement = weakAreas.length > 0

  return <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: 3.5, border: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.25} sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, flexShrink: 0, borderRadius: '50%', color: 'error.main', backgroundColor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.08) }}><GpsFixedOutlinedIcon /></Box>
        <Box><Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>Weak Topics</Typography><Typography variant="body2" color="text.secondary">Focus more on these areas to improve scores.</Typography></Box>
      </Stack>
      <Chip size="small" icon={<WarningAmberOutlinedIcon />} label={needsImprovement ? 'Needs Improvement' : 'On Track'} color={needsImprovement ? 'error' : 'success'} variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700 }} />
    </Stack>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '110px minmax(0, 1fr)' }, gap: { xs: 2, sm: 2.25 }, alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box role="img" aria-label={`${weakAreas.length} weak topics`} sx={{ width: 104, height: 104, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', background: (theme) => `conic-gradient(${theme.palette.error.main} ${accuracy}%, ${theme.palette.action.disabledBackground} ${accuracy}% 100%)` }}>
          <Box sx={{ width: 88, height: 88, display: 'grid', placeContent: 'center', justifyItems: 'center', borderRadius: '50%', backgroundColor: 'background.paper' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>{weakAreas.length}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Weak Areas</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>Below 60%</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 48px 58px', gap: .5, px: .75, pb: .75, color: 'text.secondary' }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>SUBJECT</Typography>
          <Typography variant="caption" sx={{ textAlign: 'right', fontWeight: 700 }}>SCORE</Typography>
          <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 700 }}>STATUS</Typography>
        </Box>
        <Box sx={{ maxHeight: 280, overflowY: 'auto', overscrollBehavior: 'contain', borderTop: 1, borderColor: 'divider' }}>
          {weakAreas.map((area) => <Box key={area.topic} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 48px 58px', gap: .5, alignItems: 'center', px: .75, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontWeight: 700 }}>{area.topic}</Typography><Typography noWrap variant="caption" color="text.secondary">{area.correct} of {area.total} correct · {area.affectedStudents} learner{area.affectedStudents === 1 ? '' : 's'}</Typography></Box>
            <Typography sx={{ textAlign: 'right', fontWeight: 800, color: area.accuracy < 30 ? 'error.main' : 'warning.dark' }}>{area.accuracy}%</Typography>
            <Chip size="small" label="Weak" color="warning" sx={{ justifySelf: 'center', height: 23, fontSize: 11 }} />
          </Box>)}
          {!weakAreas.length && <Typography color="text.secondary" variant="body2" sx={{ p: 1.5 }}>Topic performance is on track. Weak areas will appear here as learner responses are recorded.</Typography>}
        </Box>
      </Box>
    </Box>

    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1.25} sx={{ mt: 2, p: 1.25, borderRadius: 2.25, backgroundColor: (theme) => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.12 : 0.05) }}>
      <LightbulbOutlinedIcon color="error" fontSize="small" />
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main', whiteSpace: 'nowrap' }}>Study Tip</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>Use topic performance to guide focused support.</Typography>
      <MuiButton size="small" variant="contained" color="error" onClick={() => navigateTo('/admin/reports')} endIcon={<ArrowForwardRoundedIcon />} sx={{ flexShrink: 0 }}>View Reports</MuiButton>
    </Stack>
  </Paper>
}

const SelectedStudentStatistics: FC = () => {
  const [classes, setClasses] = useState<AdminClassesWorkspace['classes']>([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [classesError, setClassesError] = useState<string | null>(null)
  const [classId, setClassId] = useState<number | ''>('')
  const [statistics, setStatistics] = useState<ClassStatistics | null>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [statisticsError, setStatisticsError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<number | ''>('')

  useEffect(() => {
    let current = true
    getAdminClassesWorkspace()
      .then((workspace) => {
        if (!current) return
        setClasses(workspace.classes)
        setClassId(workspace.classes[0]?.id ?? '')
        setClassesError(null)
      })
      .catch((error) => { if (current) setClassesError(error instanceof Error ? error.message : 'Unable to load classes.') })
      .finally(() => { if (current) setClassesLoading(false) })
    return () => { current = false }
  }, [])

  useEffect(() => {
    if (classId === '') {
      setStatistics(null)
      return
    }
    let current = true
    setStatisticsLoading(true)
    setStatistics(null)
    getClassStatistics(classId)
      .then((result) => {
        if (!current) return
        setStatistics(result)
        setStudentId((selected) => result.students.some((student) => student.studentId === selected) ? selected : result.students[0]?.studentId ?? '')
        setStatisticsError(null)
      })
      .catch((error) => { if (current) setStatisticsError(error instanceof Error ? error.message : 'Unable to load student statistics.') })
      .finally(() => { if (current) setStatisticsLoading(false) })
    return () => { current = false }
  }, [classId])

  const selectedStudent = statistics?.students.find((student) => student.studentId === studentId)
  const selectedClass = classes.find((classRecord) => classRecord.id === classId)
  const quizLessons = selectedStudent?.lessons.filter((lesson) => lesson.quizCount > 0 && lesson.averageScore !== null).map((lesson) => ({ title: lesson.title, score: lesson.averageScore ?? 0 })) ?? []
  const strengths = [...quizLessons].filter((lesson) => lesson.score >= 70).sort((a, b) => b.score - a.score).slice(0, 3)
  const needsAttention = [...quizLessons].filter((lesson) => lesson.score < 70).sort((a, b) => a.score - b.score).slice(0, 3)
  const formatTime = (seconds: number) => seconds >= 3600 ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m` : `${Math.floor(seconds / 60)}m`
  const averageQuizScore = selectedStudent?.averageQuizScore
  const averageAttendance = selectedStudent?.attendanceRate

  const insightList = (label: string, lessons: Array<{ title: string; score: number }>, color: 'success' | 'warning') => <Box><Typography variant="body2" sx={{ fontWeight: 700, color: `${color}.main`, mb: 1 }}>{label}</Typography><Stack spacing={1.1}>{lessons.map((lesson) => <Box key={lesson.title}><Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.4 }}><Typography variant="caption" noWrap>{lesson.title}</Typography><Typography variant="caption" sx={{ fontWeight: 700 }}>{lesson.score}%</Typography></Stack><LinearProgress color={color} variant="determinate" value={lesson.score} sx={{ height: 7, borderRadius: 4 }} /></Box>)}</Stack></Box>

  return <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: 2.25, border: 1, borderColor: 'divider', borderRadius: 3.5, minWidth: 0 }}>
    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.25 }}>
      <Box><Typography component="h2" variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.025em' }}>Student performance</Typography><Typography variant="body2" color="text.secondary">Focused learning insights for one student in a class.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
        <FormControl size="small" sx={{ minWidth: { sm: 215 } }} disabled={classesLoading || classes.length === 0}><InputLabel id="overview-class-select-label">Class</InputLabel><Select labelId="overview-class-select-label" label="Class" value={classId} onChange={(event) => setClassId(Number(event.target.value))}>{classes.map((classRecord) => <MenuItem key={classRecord.id} value={classRecord.id}>{classRecord.title}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: { sm: 200 } }} disabled={!statistics?.students.length}><InputLabel id="overview-student-select-label">Student</InputLabel><Select labelId="overview-student-select-label" label="Student" value={studentId} onChange={(event) => setStudentId(Number(event.target.value))}>{(statistics?.students ?? []).map((student) => <MenuItem key={student.studentId} value={student.studentId}>{student.studentName}</MenuItem>)}</Select></FormControl>
      </Stack>
    </Stack>
    {classesError ? <Alert severity="error">{classesError}</Alert> : classesLoading || statisticsLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress aria-label="Loading student performance" /></Box> : statisticsError ? <Alert severity="error">{statisticsError}</Alert> : !selectedClass ? <Typography color="text.secondary">No classes are available to report on yet.</Typography> : !selectedStudent ? <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No enrolled students in {selectedClass.title}</Typography><Typography variant="body2" color="text.secondary">Student learning data will appear after someone joins this class.</Typography></Paper> : <Stack spacing={2.25}>
      <Stack direction="row" alignItems="center" spacing={1}><Chip size="small" color="primary" variant="outlined" label={selectedClass.title} /><Typography variant="body2" color="text.secondary">{selectedStudent.studentName}</Typography></Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
        <StatCard label="Class progress" value={`${selectedStudent.progressPercentage}%`} detail={`${selectedStudent.lessonsCompleted} of ${statistics?.lessonCount ?? 0} lessons completed`} icon={<AssessmentOutlinedIcon fontSize="small" />} tone="violet" />
        <StatCard label="Quiz accuracy" value={averageQuizScore === null ? '—' : `${averageQuizScore ?? 0}%`} detail={`${selectedStudent.quizCount} submitted quizzes`} icon={<QuizOutlinedIcon fontSize="small" />} tone="blue" />
        <StatCard label="Time spent" value={formatTime(selectedStudent.activeSeconds)} detail="Recorded learning activity" icon={<CalendarTodayOutlinedIcon fontSize="small" />} tone="teal" />
        <StatCard label="Attendance" value={averageAttendance === null ? '—' : `${averageAttendance ?? 0}%`} detail={`${selectedStudent.presentCount} of ${selectedStudent.attendanceCount} sessions`} icon={<CheckCircleOutlineIcon fontSize="small" />} tone="amber" />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr .8fr' }, gap: 1.5 }}>
        <Paper variant="outlined" sx={{ p: { xs: 1.75, sm: 2.25 }, borderRadius: 2.5 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Lesson performance</Typography><Stack spacing={1.2}>{selectedStudent.lessons.map((lesson) => <Box key={lesson.lessonId}><Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.4 }}><Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{lesson.title}</Typography><Typography variant="caption" color="text.secondary">{lesson.type === 'quiz' ? lesson.averageScore === null ? 'No attempts' : `${lesson.averageScore}% accuracy` : lesson.completed ? 'Completed' : 'Not completed'}</Typography></Stack>{lesson.type === 'quiz' && lesson.averageScore !== null ? <LinearProgress color={lesson.averageScore >= 70 ? 'success' : 'warning'} variant="determinate" value={lesson.averageScore} sx={{ height: 7, borderRadius: 4 }} /> : <LinearProgress color={lesson.completed ? 'success' : 'primary'} variant="determinate" value={lesson.completed ? 100 : 0} sx={{ height: 7, borderRadius: 4 }} />}</Box>)}</Stack></Paper>
        <Paper variant="outlined" sx={{ p: { xs: 1.75, sm: 2.25 }, borderRadius: 2.5 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Learning insights</Typography>{quizLessons.length === 0 ? <Typography variant="body2" color="text.secondary">Quiz insights will appear after this student completes an assessment.</Typography> : <Stack spacing={2}>{strengths.length > 0 && insightList('Top strengths', strengths, 'success')}{needsAttention.length > 0 && insightList('Needs attention', needsAttention, 'warning')}</Stack>}</Paper>
      </Box>
    </Stack>}
  </Paper>
}

const OverviewPage: FC<{ displayName: string }> = ({ displayName }) => {
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([])
  const [atRiskLoading, setAtRiskLoading] = useState(true)
  const [atRiskError, setAtRiskError] = useState<string | null>(null)
  const reloadOverview = async (classId?: number) => {
    setIsLoading(true)
    try {
      setOverview(await getAdminDashboardOverview(classId))
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  const reloadAtRisk = (classId?: number) => {
    setAtRiskLoading(true)
    return getAdminAtRiskStudents({ classId, classOnly: true })
      .then((records) => { setAtRiskStudents(records); setAtRiskError(null) })
      .catch((error) => setAtRiskError(error instanceof Error ? error.message : 'Unable to load at-risk students.'))
      .finally(() => setAtRiskLoading(false))
  }

  useEffect(() => {
    void reloadOverview()
    void reloadAtRisk()
  }, [])

  return <>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-end' }} spacing={2.5} sx={{ mb: 2.25 }}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={.75} sx={{ mb: .75, color: 'primary.main' }}>
          <DashboardOutlinedIcon sx={{ fontSize: 17 }} />
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.5, lineHeight: 1.5 }}>ADMIN WORKSPACE</Typography>
        </Stack>
        <Typography component="h1" sx={{ fontSize: { xs: '1.9rem', sm: '2.4rem' }, fontWeight: 800, letterSpacing: '-.055em', lineHeight: 1.1 }}>
          Welcome back, {displayName}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: .8 }}>Here’s the latest snapshot of your learning platform.</Typography>
      </Box>
    </Stack>

    <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', mb: 2.25, borderRadius: { xs: 3.5, md: 4.5 }, color: '#fff', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #103b39 0%, #145d53 58%, #147b68 100%)' : 'linear-gradient(120deg, #123e3a 0%, #17675c 58%, #168773 100%)' }}>
      <Box aria-hidden="true" sx={{ position: 'absolute', width: 420, height: 420, right: { xs: -250, md: 70 }, top: -280, borderRadius: '50%', border: '1px solid rgba(255,255,255,.11)', boxShadow: '0 0 0 42px rgba(255,255,255,.035), 0 0 0 84px rgba(255,255,255,.025)' }} />
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={3} sx={{ position: 'relative', p: { xs: 2.5, sm: 3.5, md: 4 } }}>
        <Box sx={{ maxWidth: 680 }}>
          <Chip size="small" icon={<DashboardOutlinedIcon />} label="PLATFORM OVERVIEW" sx={{ mb: 2, color: '#e6fff8', bgcolor: 'rgba(255,255,255,.13)', '& .MuiChip-icon': { color: 'inherit' }, fontWeight: 700, letterSpacing: '.04em' }} />
          <Typography component="h2" variant="h4" sx={{ fontSize: { xs: '1.55rem', sm: '2rem' }, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.2 }}>
            Your learning community, in focus.
          </Typography>
          <Typography sx={{ mt: 1, color: 'rgba(255,255,255,.76)', maxWidth: 560 }}>
            Monitor platform performance across revenue, active students, courses, and tutors.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, alignItems: 'center', minWidth: { md: 190 }, pr: { md: 2 } }}>
          <Box sx={{ width: 148, height: 148, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}>
            <Box sx={{ width: 128, height: 128, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(10,67,59,.48)', border: '1px solid rgba(255,255,255,.16)' }}>
              <DashboardOutlinedIcon sx={{ color: '#b8f0d9', fontSize: 54 }} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Paper>

    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading dashboard data" /></Box> : loadError ? <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider', borderRadius: 3.5 }}><Typography color="error" sx={{ mb: 2 }}>{loadError}</Typography><Button label="Retry" onClick={() => { setIsLoading(true); void reloadOverview() }} /></Paper> : overview && <><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.25, sm: 1.75 }, mb: 2.25 }}>
      <StatCard label="Total revenue" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(overview.totalRevenue)} detail="Published course enrollments" icon={<PaymentsOutlinedIcon fontSize="small" />} tone="teal" />
      <StatCard label="Active students" value={new Intl.NumberFormat('en-US').format(overview.activeStudents)} detail="Across published courses" icon={<GroupOutlinedIcon fontSize="small" />} tone="blue" />
      <StatCard label="Published courses" value={new Intl.NumberFormat('en-US').format(overview.publishedCourses)} detail={`${overview.draftCourses} course${overview.draftCourses === 1 ? '' : 's'} in draft`} icon={<SchoolOutlinedIcon fontSize="small" />} tone="violet" />
      <StatCard label="Active tutors" value={new Intl.NumberFormat('en-US').format(overview.activeTutors)} detail={`${overview.inactiveTutors} inactive tutor${overview.inactiveTutors === 1 ? '' : 's'}`} icon={<PersonOutlineIcon fontSize="small" />} tone="amber" />
    </Box>
    <SelectedStudentStatistics />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.35fr) minmax(0, .9fr)' }, gap: 2.25, alignItems: 'start', minWidth: 0 }}>
      <AtRiskStudentsPanel students={atRiskStudents} loading={atRiskLoading} error={atRiskError} compact />
      <WeakAreasPanel weakAreas={overview.weakAreas} />
    </Box>
    <DashboardCharts paidRevenueYears={overview.paidRevenueYears} paidRevenueByMonth={overview.paidRevenueByMonth} learningMetrics={overview.learningMetrics} enrollmentDistribution={overview.enrollmentDistribution} /></>}
  </>
}

const createEmptyCourse = (): AdminCourse => ({
  id: 0,
  title: 'Untitled course',
  category: '',
  level: 'Beginner',
  tutor: 'Maya Chen',
  status: 'Draft',
  students: 0,
  price: 0,
  cover: '/images/courses/christopher-gower-m_HRfLhgABo-unsplash.jpg',
  description: '',
  longDescription: '',
  learningOutcomes: [''],
  requirements: [''],
  certificate: false,
  updatedAt: 'Not published',
  modules: [],
})

const CoursesPage: FC = () => {
  const [courseRows, setCourseRows] = useState<AdminCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | AdminCourse['status']>('All')
  const [programFilter, setProgramFilter] = useState('All')

  const reloadCourses = async () => {
    try {
      const courses = await getAdminCourses()
      setCourseRows(courses)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load courses.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reloadCourses()
  }, [])

  const updateCourse = async (course: AdminCourse) => {
    setCourseRows((rows) => rows.map((row) => row.id === course.id ? course : row))
    try {
      const savedCourse = await updateAdminCourse(course)
      setCourseRows((rows) => rows.map((row) => row.id === savedCourse.id ? savedCourse : row))
    } catch (error) {
      toast.add({ title: 'Unable to save course', description: error instanceof Error ? error.message : 'Please try again.', type: 'error', priority: 'high' })
      void reloadCourses()
    }
  }

  const openNewCoursePage = () => navigateTo('/admin/courses/new')
  const openEditCoursePage = (course: AdminCourse) => navigateTo(`/admin/courses/${course.id}/edit`)

  const deleteCourse = async (course: AdminCourse) => {
    if (!window.confirm(`Delete ${course.title}? This cannot be undone.`)) return

    try {
      await deleteAdminCourse(course.id)
      setCourseRows((rows) => rows.filter((row) => row.id !== course.id))
    } catch (error) {
      toast.add({ title: 'Unable to delete course', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
    }
  }

  const programs = useMemo(() => [...new Set(courseRows.map((course) => course.category))].sort(), [courseRows])
  const filteredCourses = useMemo(() => courseRows.filter((course) => (statusFilter === 'All' || course.status === statusFilter) && (programFilter === 'All' || course.category === programFilter)), [courseRows, programFilter, statusFilter])
  const columns: DataColumn<AdminCourse>[] = [
    { key: 'title', label: 'Course' },
    { key: 'category', label: 'Program' },
    { key: 'tutor', label: 'Tutor' },
    { key: 'status', label: 'Status', render: (value, course) => <Stack direction="row" alignItems="center" spacing={1}><StatusChip status={String(value)} /><Switch size="small" checked={course.status === 'Published'} onChange={() => void updateCourse({ ...course, status: course.status === 'Published' ? 'Draft' : 'Published' })} inputProps={{ 'aria-label': `${course.status === 'Published' ? 'Unpublish' : 'Publish'} ${course.title}` }} /></Stack> },
    { key: 'students', label: 'Students' },
  ]

  return (
    <>
      <PageHeading title="Programs & Courses" description="Manage your catalog, tutors, and learning content." action={<Button label="New course" onClick={openNewCoursePage} disabled={isLoading} />} />
      {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading courses" /></Box> : loadError ? <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error" sx={{ mb: 2 }}>{loadError}</Typography><Button label="Retry" onClick={() => { setIsLoading(true); void reloadCourses() }} /></Paper> : <>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Status</InputLabel><Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | AdminCourse['status'])}><MenuItem value="All">All statuses</MenuItem><MenuItem value="Published">Published</MenuItem><MenuItem value="Draft">Draft</MenuItem></Select></FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}><InputLabel>Program</InputLabel><Select label="Program" value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}><MenuItem value="All">All programs</MenuItem>{programs.map((program) => <MenuItem key={program} value={program}>{program}</MenuItem>)}</Select></FormControl>
        </Stack>
        <AdminDataTable rows={filteredCourses} columns={columns} searchPlaceholder="Search courses" searchKeys={['title', 'category', 'tutor']} actions={(course) => <Stack direction="row" justifyContent="flex-end" spacing={0.5}><Button label="View" size="small" variant="text" onClick={() => navigateTo(`/courses/${course.id}`)} /><Button label="Edit" size="small" variant="text" onClick={() => openEditCoursePage(course)} /><Tooltip title={`Delete ${course.title}`}><IconButton size="small" color="error" onClick={() => void deleteCourse(course)} aria-label={`Delete ${course.title}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip></Stack>} />
      </>}
    </>
  )
}

type CourseEditorPageProps =
  | { mode: 'new'; courseId?: never }
  | { mode: 'edit'; courseId: number }

const CourseEditorPage: FC<CourseEditorPageProps> = ({ mode, courseId }) => {
  const [course, setCourse] = useState<AdminCourse | null>(() => mode === 'new' ? createEmptyCourse() : null)
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isClassLinked, setIsClassLinked] = useState(false)

  useEffect(() => {
    let isCurrent = true
    setCourse(mode === 'new' ? createEmptyCourse() : null)
    setIsClassLinked(false)
    setIsLoading(mode === 'edit')
    setLoadError(null)

    if (mode === 'new') return () => { isCurrent = false }

    getAdminCourse(courseId)
      .then((loadedCourse) => {
        if (isCurrent) setCourse(loadedCourse)
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error instanceof Error ? error.message : 'Unable to load course.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [mode, courseId])

  const saveCourse = async () => {
    if (!course) return
    const title = course.title.trim()
    if (!title) {
      toast.add({ title: 'Course title is required', description: 'Add a title before saving the course.', type: 'error', priority: 'high' })
      return
    }
    if (!course.category.trim()) {
      toast.add({ title: 'Course category is required', description: 'Enter a category before saving the course.', type: 'error', priority: 'high' })
      return
    }
    if (!course.cover.trim()) {
      toast.add({ title: 'Course thumbnail is required', description: 'Add a thumbnail URL before saving the course.', type: 'error', priority: 'high' })
      return
    }

    setIsSaving(true)
    try {
      const courseData = { ...course, title, category: course.category.trim() }
      const savedCourse = mode === 'new' ? await createAdminCourse(courseData) : await updateAdminCourse(courseData)
      setCourse(savedCourse)
      toast.add({ title: mode === 'new' ? 'Course created' : 'Course saved', description: `${savedCourse.title} is now stored in the database.`, type: 'success' })
      if (mode === 'new') navigateTo(`/admin/courses/${savedCourse.id}/edit`, true)
      else navigateTo('/admin/courses', true)
    } catch (error) {
      toast.add({ title: 'Unable to save course', description: error instanceof Error ? error.message : 'Please try again.', type: 'error', priority: 'high' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <AdminLoadingState label="Loading course" />
  if (loadError || !course) return <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error" sx={{ mb: 2 }}>{loadError ?? 'Course not found.'}</Typography><Stack direction="row" spacing={1}><Button label="Back to courses" variant="text" onClick={() => navigateTo('/admin/courses')} /><Button label="Retry" onClick={() => window.location.reload()} /></Stack></Paper>

  return (
    <>
      <PageHeading
        title={mode === 'new' ? 'New course' : 'Edit course'}
        description={mode === 'new' ? 'Create a course and build its learning path.' : `Update ${course.title} and its learning path.`}
        action={<Stack direction="row" spacing={1}><Button label="Back to courses" variant="text" onClick={() => navigateTo('/admin/courses')} disabled={isSaving} /><Button label={isSaving ? 'Saving course...' : mode === 'new' ? 'Create course' : 'Save changes'} onClick={() => void saveCourse()} disabled={isSaving} /></Stack>}
      />
      {isSaving && <Box role="status" aria-live="polite" sx={{ mb: 2 }}><Alert severity="info" icon={<CircularProgress size={18} color="inherit" />} sx={{ mb: 1 }}>Saving course and lesson updates. This may take a moment; please keep this page open.</Alert><LinearProgress aria-label="Saving course" /></Box>}
      <CourseEditor course={course} onChange={setCourse} isClassLinked={isClassLinked} allowedLessonTypes={getAllowedCourseLessonTypes(course.id)} />
    </>
  )
}

const RegistrationsPage: FC = () => {
  const [rows, setRows] = useState<AdminRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadRegistrations = async () => {
    try {
      setRows(await getAdminRegistrations())
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load registrations.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRegistrations()
  }, [])

  const columns: DataColumn<AdminRegistration>[] = [
    { key: 'student', label: 'Student' },
    { key: 'email', label: 'Email' },
    { key: 'course', label: 'Course' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (value) => <StatusChip status={String(value)} /> },
  ]
  return (
    <>
      <PageHeading title="Registrations" description="Read-only list of course registrations. Approve or decline manual payments on Payments & verification." />
      {isLoading ? <AdminLoadingState label="Loading registrations" /> : loadError ? <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error" sx={{ mb: 2 }}>{loadError}</Typography><Button label="Retry" onClick={() => { setIsLoading(true); void loadRegistrations() }} /></Paper> : <AdminDataTable rows={rows} columns={columns} searchPlaceholder="Search registrations" actions={() => <MuiButton size="small" variant="text" onClick={() => navigateTo('/admin/payments')} endIcon={<ArrowForwardRoundedIcon />}>Review payment</MuiButton>} />}
    </>
  )
}

const TutorsPage: FC = () => {
  const [tutorRows, setTutorRows] = useState<AdminTutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'All' | AdminTutor['status']>('All')
  const [programFilter, setProgramFilter] = useState('All')

  const reloadTutors = async () => {
    try {
      const tutors = await getAdminTutors()
      setTutorRows(tutors)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load tutors.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reloadTutors()
  }, [])

  const openNewTutorPage = () => navigateTo('/admin/tutors/new')
  const openTutorDetails = (tutor: AdminTutor) => navigateTo(`/admin/tutors/${tutor.id}`)

  const toggleTutorStatus = async (tutor: AdminTutor) => {
    const status = tutor.status === 'Active' ? 'Inactive' : 'Active'
    try {
      const updatedTutor = await updateAdminTutorStatus(tutor.id, status)
      setTutorRows((rows) => rows.map((row) => row.id === updatedTutor.id ? updatedTutor : row))
    } catch (error) {
      toast.add({ title: 'Unable to update tutor status', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
    }
  }

  const deleteTutor = async (tutor: AdminTutor) => {
    if (!window.confirm(`Delete ${tutor.name}? This cannot be undone.`)) return

    try {
      await deleteAdminTutor(tutor.id)
      setTutorRows((rows) => rows.filter((row) => row.id !== tutor.id))
    } catch (error) {
      toast.add({ title: 'Unable to delete tutor', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
    }
  }

  const programs = useMemo(() => [...new Set(tutorRows.flatMap((tutor) => tutor.assignedCourses.map((course) => course.category)))].sort(), [tutorRows])
  const filteredTutors = useMemo(() => tutorRows.filter((tutor) => (statusFilter === 'All' || tutor.status === statusFilter) && (programFilter === 'All' || tutor.assignedCourses.some((course) => course.category === programFilter))), [programFilter, statusFilter, tutorRows])
  const columns: DataColumn<AdminTutor>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'assignedCourses', label: 'Assigned Courses', render: (value) => <Stack direction="row" flexWrap="wrap" gap={0.5}>{(value as AdminTutor['assignedCourses']).length ? (value as AdminTutor['assignedCourses']).map((course) => <Chip key={course.id} label={course.title} size="small" variant="outlined" />) : <Typography color="text.secondary" variant="body2">None</Typography>}</Stack> },
    { key: 'assignedClasses', label: 'Assigned Classes', render: (value) => <Stack direction="row" flexWrap="wrap" gap={0.5}>{(value as AdminTutor['assignedClasses']).length ? (value as AdminTutor['assignedClasses']).map((classRecord) => <Chip key={classRecord.id} label={classRecord.title} size="small" variant="outlined" />) : <Typography color="text.secondary" variant="body2">None</Typography>}</Stack> },
    { key: 'status', label: 'Status', render: (value) => <StatusChip status={String(value)} /> },
    { key: 'createdAt', label: 'Date Joined' },
  ]

  return (
    <>
      <PageHeading title="Tutors" description="Manage tutor profiles and review their assigned courses and classes." action={<Button label="New Tutor" onClick={openNewTutorPage} disabled={isLoading} />} />
      {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading tutors" /></Box> : loadError ? <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error" sx={{ mb: 2 }}>{loadError}</Typography><Button label="Retry" onClick={() => { setIsLoading(true); void reloadTutors() }} /></Paper> : <>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Status</InputLabel><Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | AdminTutor['status'])}><MenuItem value="All">All statuses</MenuItem><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></Select></FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Program</InputLabel><Select label="Program" value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}><MenuItem value="All">All programs</MenuItem>{programs.map((program) => <MenuItem key={program} value={program}>{program}</MenuItem>)}</Select></FormControl>
        </Stack>
        <AdminDataTable rows={filteredTutors} columns={columns} searchPlaceholder="Search tutors" searchKeys={['name', 'email']} rowClick={openTutorDetails} actions={(tutor) => <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}><Button label="Edit" size="small" variant="text" onClick={() => openTutorDetails(tutor)} /><Switch size="small" checked={tutor.status === 'Active'} onChange={() => void toggleTutorStatus(tutor)} inputProps={{ 'aria-label': `${tutor.status === 'Active' ? 'Deactivate' : 'Activate'} ${tutor.name}` }} /><Tooltip title={`Delete ${tutor.name}`}><IconButton size="small" color="error" onClick={() => void deleteTutor(tutor)} aria-label={`Delete ${tutor.name}`}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip></Stack>} />
      </>}
    </>
  )
}

type TutorEditorPageProps =
  | { mode: 'new'; tutorId?: never }
  | { mode: 'edit'; tutorId: number }

const createEmptyTutor = (): AdminTutor => ({ id: 0, name: '', email: '', phone: '', bio: '', status: 'Active', createdAt: '', assignedCourses: [], assignedClasses: [] })

const TutorEditorPage: FC<TutorEditorPageProps> = ({ mode, tutorId }) => {
  const [tutor, setTutor] = useState<AdminTutor | null>(() => mode === 'new' ? createEmptyTutor() : null)
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Array<Pick<AdminCourse, 'id' | 'title'>>>([])

  useEffect(() => {
    getAdminCourseOptions().then(setCourses).catch(() => setLoadError('Unable to load courses.'))
  }, [])

  useEffect(() => {
    let isCurrent = true
    setTutor(mode === 'new' ? createEmptyTutor() : null)
    setIsLoading(mode === 'edit')
    setLoadError(null)
    if (mode === 'new') return () => { isCurrent = false }

    getAdminTutor(tutorId)
      .then((loadedTutor) => { if (isCurrent) setTutor(loadedTutor) })
      .catch((error) => { if (isCurrent) setLoadError(error instanceof Error ? error.message : 'Unable to load tutor.') })
      .finally(() => { if (isCurrent) setIsLoading(false) })

    return () => { isCurrent = false }
  }, [mode, tutorId])

  const saveTutor = async () => {
    if (!tutor) return
    const name = tutor.name.trim()
    const email = tutor.email.trim()
    if (!name || !email) {
      toast.add({ title: 'Name and email are required', description: 'Add the tutor name and email before saving.', type: 'error', priority: 'high' })
      return
    }

    setIsSaving(true)
    try {
      const assignedCourseIds = tutor.assignedCourseIds ?? tutor.assignedCourses.map((course) => course.id)
      const savedTutor = mode === 'new' ? await createAdminTutor({ name, email, phone: tutor.phone.trim(), bio: tutor.bio.trim().slice(0, 95), status: tutor.status, assignedCourseIds }) : await updateAdminTutor({ ...tutor, name, email, phone: tutor.phone.trim(), bio: tutor.bio.trim().slice(0, 95), assignedCourseIds })
      setTutor(savedTutor)
      toast.add({ title: mode === 'new' ? 'Tutor created' : 'Tutor saved', description: mode === 'new' ? 'An invite link is ready for this tutor.' : `${savedTutor.name} is now updated.`, type: 'success' })
      if (mode === 'new') navigateTo(`/admin/tutors/${savedTutor.id}`, true)
      else navigateTo('/admin/tutors', true)
    } catch (error) {
      toast.add({ title: 'Unable to save tutor', description: error instanceof Error ? error.message : 'Please try again.', type: 'error', priority: 'high' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <AdminLoadingState label="Loading tutor" />
  if (loadError || !tutor) return <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error" sx={{ mb: 2 }}>{loadError ?? 'Tutor not found.'}</Typography><Button label="Back to tutors" variant="text" onClick={() => navigateTo('/admin/tutors')} /></Paper>

  const selectedCourseIds = tutor.assignedCourseIds ?? tutor.assignedCourses.map((course) => course.id)
  return (
    <>
      <PageHeading title={mode === 'new' ? 'New Tutor' : tutor.name} description={mode === 'new' ? 'Create a tutor profile, assign courses, and generate an invite link.' : 'Edit profile information and assigned courses.'} action={<Stack direction="row" spacing={1}><Button label="Back to tutors" variant="text" onClick={() => navigateTo('/admin/tutors')} /><Button label={mode === 'new' ? 'Create Tutor' : 'Save changes'} onClick={() => void saveTutor()} disabled={isSaving} /></Stack>} />
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile information</Typography>
          <Stack spacing={2}><TextField required fullWidth label="Name" value={tutor.name} onChange={(event) => setTutor({ ...tutor, name: event.target.value })} /><TextField required fullWidth type="email" label="Email" value={tutor.email} onChange={(event) => setTutor({ ...tutor, email: event.target.value })} /><TextField fullWidth label="Phone" value={tutor.phone} onChange={(event) => setTutor({ ...tutor, phone: event.target.value })} /><TextField fullWidth multiline minRows={5} label="Bio" value={tutor.bio.slice(0, 95)} inputProps={{ maxLength: 95 }} onChange={(event) => setTutor({ ...tutor, bio: event.target.value.slice(0, 95) })} helperText={`${Math.min(tutor.bio.length, 95)}/95`} /><FormControl fullWidth><InputLabel id="tutor-course-assignment-label">Assigned courses</InputLabel><Select labelId="tutor-course-assignment-label" multiple label="Assigned courses" value={selectedCourseIds} onChange={(event) => setTutor({ ...tutor, assignedCourseIds: (typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value) as number[] })} renderValue={(selected) => (selected as number[]).map((id) => courses.find((course) => course.id === id)?.title ?? '').join(', ')}>{courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}</Select><Typography color="text.secondary" variant="caption">Select every course this tutor teaches.</Typography></FormControl><Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>Status</Typography><Typography variant="caption" color="text.secondary">Inactive tutors remain available in existing course history.</Typography></Box><Switch checked={tutor.status === 'Active'} onChange={() => setTutor({ ...tutor, status: tutor.status === 'Active' ? 'Inactive' : 'Active' })} inputProps={{ 'aria-label': 'Tutor status' }} /></Stack></Stack>
        </Paper>
        {mode === 'edit' && <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: 'divider', flex: 1 }}><Typography variant="h6" sx={{ mb: 0.5 }}>Assigned Courses</Typography><Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>Current assignments. Update them with the multi-select in the profile form.</Typography><Stack spacing={1}>{tutor.assignedCourses.length ? tutor.assignedCourses.map((course) => <Box key={course.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}><Typography variant="subtitle2">{course.title}</Typography><Typography color="text.secondary" variant="body2">{course.category} · {course.students} students</Typography></Box>) : <Typography color="text.secondary" variant="body2">No courses assigned.</Typography>}</Stack></Paper>}
      </Stack>
    </>
  )
}

const UsersPage: FC = () => {
  const [userRows, setUserRows] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const reloadUsers = async () => {
    try {
      const accounts = await getAdminUsers()
      setUserRows(accounts)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reloadUsers()
  }, [])

  const toggleAccountStatus = async (account: AdminUser) => {
    if (!account.accountType || account.accountId === undefined) return
    const status = account.status === 'Active' ? 'Suspended' : 'Active'
    try {
      const updatedAccount = await updateAdminUserStatus(account.accountType, account.accountId, status)
      setUserRows((rows) => rows.map((row) => row.id === account.id ? updatedAccount : row))
      toast.add({ title: status === 'Active' ? 'Account activated' : 'Account deactivated', description: `${account.name} is now ${status === 'Active' ? 'active' : 'suspended'}.`, type: 'success' })
    } catch (error) {
      toast.add({ title: 'Unable to update account', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
    }
  }

  const resetPassword = async (account: AdminUser) => {
    if (!account.accountType || account.accountId === undefined) return
    if (!window.confirm(`Reset the password for ${account.name}?`)) return
    try {
      await resetAdminUserPassword(account.accountType, account.accountId)
      toast.add({ title: 'Password reset required', description: `${account.name} must reset their password before signing in again.`, type: 'success', priority: 'high' })
    } catch (error) {
      toast.add({ title: 'Unable to reset password', description: error instanceof Error ? error.message : 'Please try again.', type: 'error' })
    }
  }

  const columns: DataColumn<AdminUser>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'joined', label: 'Joined' },
    { key: 'status', label: 'Status', render: (value) => <StatusChip status={String(value)} /> },
  ]

  return (
    <>
      <PageHeading title="Users" description="Manage learners, tutors, and administrator accounts." action={<Button label="Add user" disabled={isLoading} />} />
      {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading users" /></Box> : loadError ? <Paper elevation={0} sx={{ p: 4, border: 1, borderColor: 'divider' }}><Typography color="error" sx={{ mb: 2 }}>{loadError}</Typography><Button label="Retry" onClick={() => { setIsLoading(true); void reloadUsers() }} /></Paper> : <AdminDataTable rows={userRows} columns={columns} searchPlaceholder="Search users" searchKeys={['name', 'email']} actions={(account) => <Stack direction="row" justifyContent="flex-end" spacing={0.5}><Tooltip title="Reset password"><IconButton size="small" onClick={() => void resetPassword(account)} aria-label={`Reset password for ${account.name}`}><LockResetIcon fontSize="small" /></IconButton></Tooltip><Tooltip title={account.status === 'Active' ? 'Deactivate account' : 'Activate account'}><span><IconButton size="small" color={account.status === 'Active' ? 'warning' : 'success'} onClick={() => void toggleAccountStatus(account)} aria-label={`${account.status === 'Active' ? 'Deactivate' : 'Activate'} ${account.name}`} disabled={account.role === 'Admin'}>{account.status === 'Active' ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}</IconButton></span></Tooltip></Stack>} />}
    </>
  )
}

const SimplePage: FC<{ title: string; description: string; icon: ReactNode }> = ({ title, description, icon }) => (
  <>
    <PageHeading title={title} description={description} />
    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider' }}>
      <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
      <Typography variant="h6">Content workspace</Typography>
      <Typography color="text.secondary">This area is ready for bookstore and blog content management.</Typography>
    </Paper>
  </>
)

const Button: FC<{ label: string; onClick?: () => void; size?: 'small' | 'medium'; variant?: 'contained' | 'outlined' | 'text'; type?: 'button' | 'submit'; disabled?: boolean }> = ({ label, onClick, size = 'medium', variant = 'contained', type = 'button', disabled = false }) => (
  <Box
    component="button"
    type={type}
    onClick={onClick}
    disabled={disabled}
    sx={{
      border: variant === 'outlined' ? 1 : 0,
      borderColor: 'primary.main',
      borderRadius: 6,
      px: size === 'small' ? 1.25 : 2,
      py: size === 'small' ? 0.5 : 1,
      backgroundColor: variant === 'contained' ? 'primary.main' : 'transparent',
      color: variant === 'text' ? 'primary.main' : variant === 'contained' ? 'primary.contrastText' : 'primary.main',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      fontFamily: 'inherit',
      fontSize: size === 'small' ? 12 : 14,
      '&:hover': { backgroundColor: disabled ? 'transparent' : variant === 'contained' ? 'primary.dark' : 'action.hover' },
    }}
  >
    {label}
  </Box>
)

const AdminLoadingState: FC<{ label?: string }> = ({ label = 'Loading admin workspace' }) => (
  <Box
    sx={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      backgroundColor: 'background.default',
    }}
    role="status"
    aria-live="polite"
  >
    <CircularProgress aria-label={label} />
    <Typography color="text.secondary">{label}...</Typography>
  </Box>
)

interface AdminDashboardProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

const ProfileDetail: FC<{ icon: ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 1.5, backgroundColor: 'action.hover', color: 'primary.main' }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary">{label}</Typography>
      <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
    </Box>
  </Box>
)

const AdminProfilePage: FC<{ user: AuthUser | null; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const displayName = profile.name || 'Admin User'
  const email = profile.email || 'Administrator account'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available'
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(false)
    try {
      const updatedUser = await updateAuthenticatedProfile(profile)
      saveAuthenticatedUser(updatedUser)
      setProfile({ name: updatedUser.name ?? '', email: updatedUser.email, phone: updatedUser.phone ?? '' })
      setProfileSuccess(true)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'We could not update your profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const currentPassword = String(formData.get('currentPassword') ?? '')
    const newPassword = String(formData.get('newPassword') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.')
      return
    }

    setPasswordError(null)
    setPasswordSuccess(false)
    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      setIsPasswordFormOpen(false)
      setPasswordSuccess(true)
      formElement.reset()
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'We could not update your password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <>
      <PageHeading
        title="Admin profile"
        description="Review your account details and workspace access."
        action={<StyledButton variant="outlined" onClick={() => navigateTo('/admin')}>Back to dashboard</StyledButton>}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 0.8fr) minmax(0, 1.2fr)' }, gap: 3 }}>
        <Paper elevation={0} sx={{ overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Box sx={{ p: { xs: 3, md: 4 }, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
            <Avatar sx={{ width: 76, height: 76, mb: 2.5, backgroundColor: 'primary.contrastText', color: 'primary.main', fontSize: 28, fontWeight: 700 }}>{initials || 'AU'}</Avatar>
            <Typography variant="h4" sx={{ mb: 0.5, color: 'inherit' }}>{displayName}</Typography>
            <Typography sx={{ mb: 2, color: 'inherit', opacity: 0.84, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</Typography>
            <Chip label="Administrator" size="small" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: 'inherit', fontWeight: 600 }} />
          </Box>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Workspace access</Typography>
            <Typography variant="body2" color="text.secondary">You have full access to Coursespace administration, reporting, and content management.</Typography>
            <Box sx={{ mt: 3, '& button': { width: '100%', justifyContent: 'center' } }}>
              <StyledButton variant="outlined" startIcon={<LogoutIcon />} onClick={onSignOut}>Sign out</StyledButton>
            </Box>
          </Box>
        </Paper>
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Account details</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>Your administrator account information.</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              <ProfileDetail icon={<AccountCircleOutlinedIcon fontSize="small" />} label="Name" value={displayName} />
              <ProfileDetail icon={<MailOutlineIcon fontSize="small" />} label="Email address" value={email} />
              <ProfileDetail icon={<PersonOutlineIcon fontSize="small" />} label="Role" value="Administrator" />
              <ProfileDetail icon={<CalendarTodayOutlinedIcon fontSize="small" />} label="Member since" value={memberSince} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box component="form" onSubmit={(event) => void handleSaveProfile(event)} sx={{ display: 'grid', gap: 2 }}>
              <TextField required label="Full name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
              <TextField required label="Email address" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
              <TextField label="Phone number" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
              {profileError && <Alert severity="error">{profileError}</Alert>}
              {profileSuccess && <Alert severity="success">Your profile has been updated.</Alert>}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><MuiButton type="submit" variant="contained" disabled={isSavingProfile}>{isSavingProfile ? 'Saving profile...' : 'Save profile'}</MuiButton></Box>
            </Box>
          </Paper>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ mb: 0.5 }}>Security and access</Typography>
                <Typography color="text.secondary" variant="body2">Your account is protected by authenticated workspace access.</Typography>
              </Box>
              <Chip label="Active" color="success" size="small" />
            </Box>
            <Divider sx={{ my: 2.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <LockResetIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Administrator permissions</Typography>
                <Typography color="text.secondary" variant="body2">Manage courses, tutors, users, registrations, and payment reports from this workspace.</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Password</Typography>
                <Typography color="text.secondary" variant="body2">Update your password regularly to keep your account secure.</Typography>
              </Box>
              <Button label={isPasswordFormOpen ? 'Cancel' : 'Change password'} variant="outlined" size="small" onClick={() => { setIsPasswordFormOpen((current) => !current); setPasswordError(null); setPasswordSuccess(false) }} />
            </Box>
            {passwordSuccess && <Alert severity="success" sx={{ mt: 2 }}>Your password has been changed successfully.</Alert>}
            {isPasswordFormOpen && <Box component="form" onSubmit={(event) => void handleChangePassword(event)} sx={{ display: 'grid', gap: 2, mt: 2.5 }}>
              <TextField required fullWidth label="Current password" name="currentPassword" type="password" autoComplete="current-password" />
              <TextField required fullWidth label="New password" name="newPassword" type="password" autoComplete="new-password" inputProps={{ minLength: 8 }} helperText="Use 8 to 128 characters." />
              <TextField required fullWidth label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" inputProps={{ minLength: 8 }} />
              {passwordError && <Alert severity="error">{passwordError}</Alert>}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button label={isChangingPassword ? 'Changing password...' : 'Save new password'} type="submit" disabled={isChangingPassword} />
              </Box>
            </Box>}
          </Paper>
        </Stack>
      </Box>
    </>
  )
}

const ViolationsPage: FC = () => {
  const [violations, setViolations] = useState<AdminQuizViolation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadViolations = () => {
    setIsLoading(true)
    void getAdminQuizViolations().then(setViolations).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load quiz violations.')).finally(() => setIsLoading(false))
  }

  useEffect(() => { loadViolations() }, [])

  const approveRetake = async (attemptId: number) => {
    try {
      await approveAdminQuizRetake(attemptId)
      toast.add({ title: 'Retake approved', description: 'The student can now retake this quiz once.', type: 'success' })
      loadViolations()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to approve this retake.')
    }
  }

  const formatViolation = (violation: AdminQuizViolation['violations'][number]) => {
    const type = violation?.type || 'Unknown violation'
    const timestamp = violation?.occurredAt ? new Date(violation.occurredAt) : null
    const date = timestamp && !Number.isNaN(timestamp.getTime()) ? timestamp.toLocaleString() : 'Time unavailable'
    return `${type} (${date})`
  }

  return <>
    <PageHeading title="Quiz Violations" description="Review tab-switch and fullscreen violations before approving a disqualified retake." />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress aria-label="Loading quiz violations" /></Box> : <AdminDataTable rows={violations} columns={[{ key: 'studentName', label: 'Student' }, { key: 'courseTitle', label: 'Course' }, { key: 'lessonTitle', label: 'Quiz' }, { key: 'violations', label: 'Violations', render: (value) => (value as AdminQuizViolation['violations']).map(formatViolation).join(', ') }, { key: 'disqualified', label: 'Status', render: (_, row) => { const label = row.retakeStatus === 'passed' ? 'Retake passed' : row.retakeStatus === 'failed' ? 'Retake failed' : row.retakeApproved ? 'Retake approved · not retaken' : row.disqualified ? 'Disqualified' : 'Flagged'; const color = row.retakeStatus === 'passed' ? 'success' : row.retakeStatus === 'failed' ? 'error' : row.retakeApproved ? 'info' : 'warning'; return <Chip label={label} color={color} size="small" /> } }]} searchPlaceholder="Search violations" searchKeys={['studentName', 'studentEmail', 'courseTitle']} actions={(row) => row.retakeStatus === 'not_retaken' && !row.retakeApproved && (row.disqualified || row.violations.length > 0) ? <MuiButton size="small" variant="contained" onClick={() => void approveRetake(row.id)}>Approve retake</MuiButton> : null} />}
  </>
}

const getSectionFromPath = (pathname: string): Section => {
  const pathSection = pathname.split('/')[2]
  if (pathSection === 'registrations') return 'courses'
  return navigation.some(({ key }) => key === pathSection) ? (pathSection as Section) : 'overview'
}

const AdminDashboard: FC<AdminDashboardProps> = ({ darkMode, onToggleDarkMode }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [section, setSection] = useState<Section>(() => getSectionFromPath(window.location.pathname))
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const adminUser = getAuthenticatedUser()

  const selectSection = (next: Section) => {
    navigateTo(next === 'overview' ? '/admin' : `/admin/${next}`)
    setSection(next)
    setMobileOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    toast.add({ title: 'Signed out', description: 'You have been successfully logged out.', type: 'success' })
    navigateTo('/', true)
  }

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname)
      setSection(getSectionFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  const currentPage = useMemo(() => {
    if (/^\/admin\/profile\/?$/.test(pathname)) return <AdminProfilePage user={adminUser} onSignOut={handleSignOut} />

    switch (section) {
      case 'courses': {
        if (/^\/admin\/registrations\/?$/.test(pathname)) return <RegistrationsPage />
        if (/^\/admin\/courses\/new\/?$/.test(pathname)) return <CourseEditorPage mode="new" />
        const editMatch = pathname.match(/^\/admin\/courses\/(\d+)\/edit\/?$/)
        if (editMatch) return <CourseEditorPage mode="edit" courseId={Number(editMatch[1])} />
        return <CoursesPage />
      }
      case 'registrations': return <RegistrationsPage />
      case 'classes': {
        if (/^\/admin\/classes\/pending\/?$/.test(pathname)) return <ClassesWorkspace view="pending" />
        if (/^\/admin\/classes\/new\/?$/.test(pathname)) return <ClassesWorkspace view="new" />
        const classMatch = pathname.match(/^\/admin\/classes\/(\d+)\/?$/)
        if (classMatch) return <ClassesWorkspace view="detail" classId={Number(classMatch[1])} />
        return <ClassesWorkspace view="active" />
      }
      case 'tutors': {
        if (/^\/admin\/tutors\/new\/?$/.test(pathname)) return <TutorEditorPage mode="new" />
        const tutorMatch = pathname.match(/^\/admin\/tutors\/(\d+)\/?$/)
        if (tutorMatch) return <TutorEditorPage mode="edit" tutorId={Number(tutorMatch[1])} />
        return <TutorsPage />
      }
      case 'blog': return <BookstoreAdminPage />
      case 'practice-exams': return <PracticeExamManagement />
      case 'syllabus': return <SyllabusTopicsPage />
      case 'payments': return <PaymentsPage />
      case 'access': return <AccessPage />
      case 'reports': return <ReportsPage />
      case 'violations': return <ViolationsPage />
      case 'reviews': return <ReviewsPage />
      case 'users': return <UsersPage />
      case 'security': return <SecurityPage />
      default: return <OverviewPage displayName={adminUser?.name || 'Admin'} />
    }
  }, [adminUser, pathname, section])

  const sidebar = (
    <Box sx={{ width: drawerWidth, height: '100%', overflowY: 'auto', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2.25, borderBottom: 1, borderColor: 'divider' }}><Box sx={{ transform: 'scale(.82)', transformOrigin: 'left center', width: '122%' }}><Logo /></Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .2 }}>Your management workspace</Typography></Box>
      <Box component="nav" aria-label="Admin navigation" sx={{ px: 1.75, py: 2, flex: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Overview</Typography>
        {navigation.map((item, index) => <Box key={item.key}>
          {index === 1 && <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mt: 2.25, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Manage</Typography>}
          {index === 7 && <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mt: 2.25, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Insights & access</Typography>}
          <Box
            component="button"
            title={item.label}
            aria-label={item.label}
            aria-expanded={item.subviews ? section === item.key : undefined}
            onClick={() => selectSection(item.key)}
            sx={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, border: 0, borderRadius: 2.5, px: 1.5, py: 1.05, mb: .45,
              backgroundColor: section === item.key ? 'primary.main' : 'transparent', color: section === item.key ? 'primary.contrastText' : 'text.secondary',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .18s ease', boxShadow: section === item.key ? '0 7px 16px rgba(18,124,113,.18)' : 'none', '&:hover': { backgroundColor: section === item.key ? 'primary.dark' : 'action.hover', transform: section === item.key ? 'none' : 'translateX(2px)' },
            }}
          >
            {item.icon}<Typography variant="body2" sx={{ flex: 1, fontWeight: section === item.key ? 600 : 400 }}>{item.label}</Typography>{item.subviews && (section === item.key ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />)}
          </Box>
          {item.subviews && section === item.key && <Box sx={{ ml: 2, mb: 1 }}>
            {item.subviews.map((subview) => {
              const isActiveSubview = pathname === subview.path
              return <Box key={subview.path} component="button" type="button" onClick={() => { navigateTo(subview.path); setSection(item.key); setMobileOpen(false) }} sx={{ width: '100%', border: 0, borderLeft: 2, borderColor: isActiveSubview ? 'primary.main' : 'divider', py: 0.75, pl: 1.5, pr: 1, backgroundColor: 'transparent', color: isActiveSubview ? 'primary.main' : 'text.secondary', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: isActiveSubview ? 600 : 400, textAlign: 'left', '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' } }}>{subview.label}</Box>
            })}
          </Box>}
        </Box>)}
      </Box>
      <Box sx={{ p: 1.75, pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', px: 1.5, mb: 1, letterSpacing: 1.2, fontWeight: 700 }}>Account</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.25, mb: 1.25, borderRadius: 3, background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.10)}, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.10 : 0.04)})` }}><Box sx={{ position: 'relative' }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{(adminUser?.name || 'Admin').charAt(0)}</Avatar><Box sx={{ position: 'absolute', right: -1, bottom: 0, width: 9, height: 9, borderRadius: '50%', bgcolor: 'success.main', border: (theme) => `2px solid ${theme.palette.background.paper}` }} /></Box><Box sx={{ minWidth: 0 }}><Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>{adminUser?.name || 'Admin user'}</Typography><Typography variant="caption" color="text.secondary">Administrator account</Typography></Box></Box>
        <Box title="Settings" aria-label="Settings" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: .7 }}><SettingsOutlinedIcon color="disabled" fontSize="small" /><Typography variant="caption" color="text.secondary">Manage preferences</Typography></Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {isMobile ? <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>{sidebar}</Drawer> : <Box sx={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: drawerWidth, zIndex: 'drawer' }}>{sidebar}</Box>}
      <Box sx={{ flex: 1, minWidth: 0, ml: { xs: 0, md: `${drawerWidth}px` } }}>
        <Box component="header" sx={{ minHeight: 82, px: { xs: 2, md: 3.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.96 : 0.82), backdropFilter: 'blur(16px)', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            {isMobile && <IconButton onClick={() => setMobileOpen(true)} aria-label="Open admin menu"><MenuIcon /></IconButton>}
            <Box><Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: .8, lineHeight: 1 }}>Admin workspace</Typography><Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.35 }}>{section === 'overview' ? 'Dashboard' : navigation.find((item) => item.key === section)?.label}</Typography></Box>
          </Box>
          <Stack direction="row" alignItems="center" spacing={.75}>
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', width: 220, px: 1.5, py: .55, borderRadius: 5, backgroundColor: 'action.hover', color: 'text.secondary' }}><SearchIcon fontSize="small" /><Typography variant="caption" sx={{ ml: .8 }}>Search here...</Typography></Box>
            <Tooltip title="Language: EN"><IconButton aria-label="Change language, currently EN"><TranslateOutlinedIcon fontSize="small" /></IconButton></Tooltip>
            <SecurityNotifications admin />
            <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton onClick={onToggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Admin profile">
              <IconButton
                id="admin-profile-button"
                onClick={(event) => setProfileAnchor(event.currentTarget)}
                aria-label="Open admin profile"
                aria-controls={profileAnchor ? 'admin-profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={profileAnchor ? 'true' : undefined}
                sx={{ p: .25 }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{(adminUser?.name || 'Admin').charAt(0)}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="admin-profile-menu"
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              MenuListProps={{ 'aria-labelledby': 'admin-profile-button' }}
              PaperProps={{ sx: { minWidth: 190, borderRadius: 2, p: 0.75 } }}
            >
              <MenuItem onClick={() => { setProfileAnchor(null); navigateTo('/admin/profile') }}>
                <PersonOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                Admin profile
              </MenuItem>
              <MenuItem onClick={() => { setProfileAnchor(null); handleSignOut() }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Sign out
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
        <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, width: '100%', minWidth: 0, maxWidth: 1540, boxSizing: 'border-box', minHeight: 'calc(100vh - 82px)', background: 'var(--app-content-gradient)' }}>
          {currentPage}
        </Box>
      </Box>
    </Box>
  )
}

export default AdminDashboard
