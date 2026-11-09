import { type ArticleCheckpoint } from '@/lib/article-checkpoints'

export type LessonType = 'video' | 'article' | 'interactive' | 'simulation' | 'quiz' | 'practice' | 'live' | 'stepByStepSolver'

export interface StepByStepSolverStep {
  id: number
  instruction: string
  explanation: string
  hint: string
  correctiveFeedback: string
  correctAnswer: string
}

export interface StepByStepSolverFollowUp {
  id: number
  prompt: string
  correctAnswer: string
  explanation: string
  correctiveFeedback: string
}

export interface StepByStepSolverSession {
  sessionId: number
  problemId: number
  problem: string
  currentStep: number
  totalSteps: number
  completed: boolean
  revealedSteps: Array<{ index: number; instruction: string; correctAnswer: string; explanation: string }>
  activeStep: { index: number; instruction: string } | null
  followUpQuestions: Array<{ id: number; prompt: string }>
  followUpResults: Record<number, { correct: boolean; feedback: string }>
}

export interface StepByStepSolverState {
  problems: Array<{ id: number; prompt: string }>
  completedProblemIds: number[]
  session: StepByStepSolverSession | null
}

export interface StepByStepSolverProblem {
  id: number
  prompt: string
  steps: StepByStepSolverStep[]
  followUpQuestions: StepByStepSolverFollowUp[]
}

export interface StepByStepSolverConfig {
  problems: StepByStepSolverProblem[]
}

export interface StepByStepSolverLearnerConfig {
  problems: Array<{ id: number; prompt: string }>
}

export type SimulationRule = 'pendulum-period' | 'osmosis-movement' | 'neutralization' | 'projectile-range' | 'linear'

export interface SimulationVariable {
  id: number
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
}

export interface SimulationConfig {
  scenarioName: string
  overview: string
  variables: SimulationVariable[]
  rule: SimulationRule
  calculation: string
  outputLabel: string
  outputUnit: string
  observationPrompt: string
  expectedObservation: string
  acceptedObservations: string[]
}

export interface InteractiveHotspot {
  id: number
  left: string
  top: string
  label: string
  explanation: string
}

export interface LessonResource {
  id: number
  name: string
  url?: string
}

export interface QuizQuestion {
  id: number
  question: string
  topic: string
  options: string[]
  correctOption: number
  questionImage?: string
  optionImages?: Array<string | undefined>
  explanation?: string
  explanationImage?: string
}

export interface PracticeQuestion {
  id: number
  question: string
  topic: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export type ArticleContentBlock =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; marker?: string; imageUrl?: string; caption: string }

export interface ArticleVocabularyEntry {
  word: string
  definition: string
  example: string
}

export interface AdminLesson {
  id: number
  title: string
  type: LessonType
  duration: number | null
  videoUrl?: string
  thumbnailUrl?: string
  captionsVtt?: string
  captionLanguage?: string
  transcript?: string
  resources: LessonResource[]
  articleBody?: string
  articleBlocks?: ArticleContentBlock[]
  articleVocabulary?: ArticleVocabularyEntry[]
  articleHeaderImageUrl?: string
  articleCheckpoints?: ArticleCheckpoint[]
  articleHelpDisabledSections?: number[]
  baseImageUrl?: string
  interactiveHotspots?: InteractiveHotspot[]
  simulation?: SimulationConfig
  stepByStepSolver?: StepByStepSolverConfig
  simulationToolId?: string
  platformEngineId?: string
  curriculumTopic?: string
  quizQuestions?: QuizQuestion[]
  practiceQuestions?: PracticeQuestion[]
  passThreshold?: number
  meetingUrl?: string
  recurringDays?: string[]
  sessionTime?: string
  sessionDuration?: number
  scheduledAt?: string
  endsAt?: string
  dateOverridden?: boolean
  estimatedDuration?: number
  syllabusTopicIds?: number[]
}

export interface AdminCourse {
  id: number
  title: string
  category: string
  level: string
  tutor: string
  status: 'Published' | 'Draft'
  students: number
  price: number
  cover: string
  rating?: number
  ratingCount?: number
  description: string
  longDescription: string
  learningOutcomes: string[]
  requirements: string[]
  certificate: boolean
  updatedAt: string
  modules: AdminModule[]
}

export interface AdminModule {
  id: number
  title: string
  lessons: AdminLesson[]
}

let lastGeneratedLessonId = 0

export const getNextLessonId = (modules: AdminModule[]) => {
  const currentMaximum = Math.max(0, ...modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
  lastGeneratedLessonId = Math.max(lastGeneratedLessonId + 1, Date.now() * 1000, currentMaximum + 1)
  return lastGeneratedLessonId
}

export interface AssignedCourse {
  id: number
  title: string
  category: string
  students: number
}

export interface AssignedClass {
  id: number
  title: string
}

export interface AdminTutor {
  id: number
  name: string
  email: string
  phone: string
  bio: string
  status: 'Active' | 'Inactive'
  createdAt: string
  assignedCourses: AssignedCourse[]
  assignedClasses: AssignedClass[]
  assignedCourseIds?: number[]
  specialty?: string
  courses?: number
}

export type Tutor = AdminTutor

export interface AdminUser {
  id: number
  accountId?: number
  accountType?: 'user' | 'tutor'
  name: string
  email: string
  role: 'Student' | 'Tutor' | 'Admin'
  joined: string
  status: 'Active' | 'Suspended'
}

export const tutors: Tutor[] = [
  { id: 1, name: 'Maya Chen', email: 'maya@example.com', phone: '', bio: '', status: 'Active', createdAt: 'Jul 12, 2025', assignedCourses: [], assignedClasses: [], specialty: 'Data Science', courses: 4 },
  { id: 2, name: 'Leon Kennedy', email: 'leon@example.com', phone: '', bio: '', status: 'Active', createdAt: 'Jun 24, 2025', assignedCourses: [], assignedClasses: [], specialty: 'Cloud Engineering', courses: 3 },
  { id: 3, name: 'Jhon Dwirian', email: 'jhon@example.com', phone: '', bio: '', status: 'Inactive', createdAt: 'May 09, 2025', assignedCourses: [], assignedClasses: [], specialty: 'Frontend Development', courses: 2 },
  { id: 4, name: 'Rizki Known', email: 'rizki@example.com', phone: '', bio: '', status: 'Active', createdAt: 'Apr 18, 2025', assignedCourses: [], assignedClasses: [], specialty: 'Product Design', courses: 5 },
]

export const users: AdminUser[] = [
  { id: 1, name: 'Ava Johnson', email: 'ava@example.com', role: 'Student', joined: 'Aug 18, 2025', status: 'Active' },
  { id: 2, name: 'Maya Chen', email: 'maya@example.com', role: 'Tutor', joined: 'Jul 12, 2025', status: 'Active' },
  { id: 3, name: 'Noah Williams', email: 'noah@example.com', role: 'Student', joined: 'Jun 24, 2025', status: 'Active' },
  { id: 4, name: 'Jhon Dwirian', email: 'jhon@example.com', role: 'Tutor', joined: 'May 09, 2025', status: 'Suspended' },
]
