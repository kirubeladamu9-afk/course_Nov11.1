import React, { Suspense, lazy, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { SpinnerCustom } from '@/components/spinner'
import SignInPage from '@/components/auth/sign-in-page'
import SetPasswordPage from '@/components/auth/set-password-page'
import { navigateTo } from '@/lib/navigation'
import { SITE_NAME } from '@/lib/site'
import { type Course } from '@/interfaces/course'
import { getAuthenticatedUser, getCourses } from '@/services/api'

const loadSection = <Props extends object = {}>(load: () => Promise<{ default: React.ComponentType<Props> }>) => lazy(load)

const AdminDashboard = loadSection(() => import('@/components/admin/admin-dashboard'))
const CourseDetailPage = loadSection(() => import('@/components/course/course-detail-page'))
const CourseMarketplacePage = loadSection(() => import('@/components/course/course-marketplace-page'))
const TrainingProgramsPage = loadSection<{ courses: Course[]; darkMode: boolean; onToggleDarkMode: () => void }>(() => import('@/components/home/training-programs-page'))
const StudentDashboard = loadSection(() => import('@/components/course/student-dashboard'))
const AccountSecurity = loadSection(() => import('@/components/course/account-security'))
const TutorDashboard = loadSection(() => import('@/components/tutor/tutor-dashboard'))
const PracticeExamCatalog = loadSection(() => import('@/components/practice/practice-exam-catalog'))
const PracticeExamPlayer = loadSection(() => import('@/components/practice/practice-exam-player'))
const InfoPage = loadSection(() => import('@/components/info/info-page'))
const BookstorePage = lazy(() => import('@/components/bookstore/bookstore-page').then((module) => ({ default: module.BookstorePage })))

const HomeHero = loadSection(() => import('@/components/home/hero'))
const HomeDotNetPillars = loadSection(() => import('@/components/home/dotnet-pillars'))
const HomeFeature = loadSection(() => import('@/components/home/feature'))
const HomePopularCourse = loadSection<{ courses: Course[] }>(() => import('@/components/home/popular-courses'))
const HomeTrainingPrograms = loadSection<{ courses: Course[] }>(() => import('@/components/home/training-programs'))
const HomeTestimonial = loadSection(() => import('@/components/home/testimonial'))
const HomeOurMentors = loadSection(() => import('@/components/home/mentors'))
const HomeNewsLetter = loadSection(() => import('@/components/home/newsletter'))

interface AppProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

const getAdminPageTitle = (pathname: string) => {
  const normalizedPath = pathname.replace(/\/$/, '') || '/admin'
  if (normalizedPath === '/admin') return 'Overview'
  if (normalizedPath === '/admin/profile') return 'Admin Profile'
  if (normalizedPath === '/admin/courses/new') return 'New Course'
  if (/^\/admin\/courses\/\d+\/edit$/.test(normalizedPath)) return 'Edit Course'
  if (normalizedPath === '/admin/courses') return 'Programs & Courses'
  if (normalizedPath === '/admin/registrations') return 'Registrations'
  if (normalizedPath === '/admin/classes/pending') return 'Pending Scheduling'
  if (normalizedPath === '/admin/classes/new') return 'New Class'
  if (/^\/admin\/classes\/\d+$/.test(normalizedPath)) return 'Class Details'
  if (normalizedPath === '/admin/classes' || normalizedPath === '/admin/classes/active') return 'Active Classes'
  if (normalizedPath === '/admin/tutors/new') return 'New Tutor'
  if (/^\/admin\/tutors\/\d+$/.test(normalizedPath)) return 'Edit Tutor'
  if (normalizedPath === '/admin/tutors') return 'Tutors'
  if (normalizedPath === '/admin/blog') return 'Bookstore'
  if (normalizedPath === '/admin/practice-exams') return 'Practice Exams'
  if (normalizedPath === '/admin/syllabus') return 'Syllabus Topics'
  if (normalizedPath === '/admin/payments') return 'Payments'
  if (normalizedPath === '/admin/access') return 'Access & Sponsors'
  if (normalizedPath === '/admin/reports') return 'Reports'
  if (normalizedPath === '/admin/violations') return 'Quiz Violations'
  if (normalizedPath === '/admin/reviews') return 'Learner Reviews'
  if (normalizedPath === '/admin/users') return 'Users'
  if (normalizedPath === '/admin/security') return 'Security'
  return 'Admin Dashboard'
}

const RouteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<div className="page-loading-state"><SpinnerCustom /></div>}>{children}</Suspense>
)

const RouteLoadingState: React.FC<{ message: string }> = ({ message }) => (
  <Box
    sx={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      backgroundColor: 'background.default',
    }}
    aria-live="polite"
  >
    <SpinnerCustom />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
)

const App: React.FC<AppProps> = ({ darkMode, onToggleDarkMode }) => {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [homeCourses, setHomeCourses] = useState<Course[] | null>(null)
  const isAdminPath = /^\/admin(?:\/|$)/.test(currentPath)
  const isDashboardPath = /^\/(?:dashboard|calendar|enrollments|classes|explore-courses|explore-classes|study-planner|quizzes|purchases|profile|payments|account\/(?:courses|classes)\/\d+)\/?$/.test(currentPath)
  const isSecurityPath = /^\/security\/?$/.test(currentPath)
  const isTutorPath = /^\/tutor(?:\/|$)/.test(currentPath)
  const isPracticeCatalogPath = /^\/practice-exams\/?$/.test(currentPath)
  const practiceExamMatch = currentPath.match(/^\/practice-exams\/(\d+)\/?$/)
  const isAboutPath = /^\/about-us\/?$/.test(currentPath)
  const isBookstorePath = /^\/bookstore\/?$/.test(currentPath)
  const isContactPath = /^\/contact-us\/?$/.test(currentPath)
  const isSignInPath = /^\/sign-in\/?$/.test(currentPath)
  const isSetPasswordPath = /^\/set-password\/?$/.test(currentPath)
  const isCourseMarketplacePath = /^\/courses\/?$/.test(currentPath)
  const isTrainingProgramsPath = /^\/training-programs\/?$/.test(currentPath)
  const courseMatch = currentPath.match(/^\/courses\/([^/]+)\/?$/)
  const currentUser = getAuthenticatedUser()
  const isAuthenticated = currentUser !== null
  const canAccessAdmin = currentUser?.role === 'admin'
  const canAccessTutor = currentUser?.role === 'tutor'
  const isPublicPath = !isAdminPath && !isTutorPath && !isDashboardPath && !isSecurityPath && !isSetPasswordPath
  const signedInHomePath = currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'tutor' ? '/tutor' : '/dashboard'

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (isDashboardPath) return
    const pageName = isSignInPath
      ? 'Sign In'
      : isAdminPath
        ? getAdminPageTitle(currentPath)
        : isTutorPath
            ? 'Tutor Dashboard'
            : isPracticeCatalogPath
              ? 'Practice Exams'
              : practiceExamMatch
                ? 'Practice Exam'
                : isAboutPath
                  ? 'About Us'
                  : isBookstorePath
                    ? 'Bookstore'
                    : isContactPath
                      ? 'Contact Us'
                      : isCourseMarketplacePath
                        ? 'Courses'
                        : isTrainingProgramsPath
                          ? 'Training Programs'
                          : courseMatch
                          ? 'Course'
                          : 'Home'
    document.title = `${SITE_NAME} | ${pageName}`
  }, [isSignInPath, currentPath, isAboutPath, isAdminPath, isBookstorePath, isContactPath, isCourseMarketplacePath, isDashboardPath, isPracticeCatalogPath, isTrainingProgramsPath, isTutorPath, practiceExamMatch, courseMatch])

  useEffect(() => {
    if (isAdminPath || isDashboardPath || isTutorPath || isSecurityPath || window.location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [currentPath, isAdminPath, isDashboardPath, isSecurityPath, isTutorPath])

  useEffect(() => {
    if (/^\/stem-lab\/?$/.test(currentPath)) navigateTo('/', true)
    if (isAdminPath && !canAccessAdmin) navigateTo('/', true)
    if (isTutorPath && !canAccessTutor) navigateTo('/', true)
    if (isSecurityPath && !isAuthenticated) navigateTo('/sign-in', true)
    if (isDashboardPath && (!isAuthenticated || currentUser?.role === 'admin' || currentUser?.role === 'tutor')) navigateTo(currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'tutor' ? '/tutor' : '/', true)
    if (isAuthenticated && isPublicPath) navigateTo(signedInHomePath, true)
  }, [canAccessAdmin, canAccessTutor, currentPath, currentUser?.role, isAdminPath, isAuthenticated, isDashboardPath, isPublicPath, isSecurityPath, isTutorPath, signedInHomePath])

  useEffect(() => {
    if (isAdminPath || isDashboardPath || isTutorPath || isSecurityPath || isPracticeCatalogPath || practiceExamMatch || isAboutPath || isBookstorePath || isContactPath || isSignInPath || courseMatch) {
      setHomeCourses(null)
      return
    }

    let isCurrent = true
    setHomeCourses(null)
    getCourses()
      .then((courses) => {
        if (isCurrent) setHomeCourses(courses)
      })
      .catch(() => {
        if (isCurrent) setHomeCourses([])
      })

    return () => {
      isCurrent = false
    }
  }, [currentPath, isAboutPath, isAdminPath, isBookstorePath, isContactPath, isDashboardPath, isPracticeCatalogPath, isSecurityPath, isTutorPath, practiceExamMatch])

  const isHomePath = /^\/?$/.test(currentPath)

  useEffect(() => {
    document.documentElement.classList.toggle('home-section-snap', isHomePath)
    return () => document.documentElement.classList.remove('home-section-snap')
  }, [isHomePath])

  if ((isAdminPath && !canAccessAdmin) || (isTutorPath && !canAccessTutor) || (isSecurityPath && !isAuthenticated) || (isDashboardPath && (!isAuthenticated || currentUser?.role === 'admin' || currentUser?.role === 'tutor')) || (isAuthenticated && isPublicPath)) return <RouteLoadingState message="Returning to Coursespace..." />
  if (isSecurityPath) return <RouteSuspense><Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}><Button onClick={() => navigateTo(currentUser?.role === 'admin' ? '/admin' : currentUser?.role === 'tutor' ? '/tutor' : '/dashboard')} sx={{ mb: 3 }}>Back to dashboard</Button><AccountSecurity /></Container></RouteSuspense>
  if (isAdminPath) return <RouteSuspense><AdminDashboard darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isTutorPath) return <RouteSuspense><TutorDashboard darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isDashboardPath) return <RouteSuspense><StudentDashboard darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isPracticeCatalogPath) return <RouteSuspense><PracticeExamCatalog darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (practiceExamMatch) return <RouteSuspense><PracticeExamPlayer examId={Number(practiceExamMatch[1])} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isAboutPath) return <RouteSuspense><InfoPage kind="about" darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isBookstorePath) return <RouteSuspense><BookstorePage darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isCourseMarketplacePath) return <RouteSuspense><CourseMarketplacePage courses={homeCourses ?? []} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} isLoading={homeCourses === null} /></RouteSuspense>
  if (isTrainingProgramsPath) return <RouteSuspense><TrainingProgramsPage courses={homeCourses ?? []} darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isContactPath) return <RouteSuspense><InfoPage kind="contact" darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /></RouteSuspense>
  if (isSignInPath) return <Box component="main"><Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /><SignInPage mode="sign-in" /><Footer /></Box>
  if (isSetPasswordPath) return <Box component="main"><Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} /><SetPasswordPage /><Footer /></Box>
  return (
    <Box component="main">
      <Suspense
        fallback={
          <div className="page-loading-state">
            <SpinnerCustom />
          </div>
        }
      >
        <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
        {courseMatch ? (
          <CourseDetailPage courseId={decodeURIComponent(courseMatch[1])} />
        ) : (
          <>
            <HomeHero />
            <HomeDotNetPillars courses={homeCourses ?? []} />
            <HomePopularCourse courses={homeCourses ?? []} />
            <HomeTrainingPrograms courses={homeCourses ?? []} />
            <HomeFeature />
            <HomeTestimonial />
            <HomeOurMentors />
            <HomeNewsLetter />
            <Footer />
          </>
        )}
      </Suspense>
    </Box>
  )
}

export default App
