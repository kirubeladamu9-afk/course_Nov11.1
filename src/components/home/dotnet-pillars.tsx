import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'

const pillars = [
  {
    title: 'Live online classes',
    description: 'Join scheduled live sessions with tutors and small learning groups.',
    icon: <VideocamOutlinedIcon fontSize="small" />,
    color: '#4f6fae',
    background: '#eef2f9',
  },
  {
    title: 'Structured lessons',
    description: 'Learn through lessons, articles, and checkpoints that track each step.',
    icon: <MenuBookOutlinedIcon fontSize="small" />,
    color: '#238b82',
    background: '#eaf6f4',
  },
  {
    title: 'Timed quizzes',
    description: 'Take quizzes with timed attempts and review answers after each submission.',
    icon: <QuizOutlinedIcon fontSize="small" />,
    color: '#8256b5',
    background: '#f3eff9',
  },
  {
    title: 'Step-by-step solver',
    description: 'Get guided hints and follow-up questions for every problem you work on.',
    icon: <LightbulbOutlinedIcon fontSize="small" />,
    color: '#39826f',
    background: '#edf6f2',
  },
  {
    title: 'Study plans & progress',
    description: 'Build a personal study plan and track completed lessons in every course.',
    icon: <EventNoteOutlinedIcon fontSize="small" />,
    color: '#526a9c',
    background: '#eef1f8',
  },
  {
    title: 'Enroll & pay securely',
    description: 'Choose a course or batch and get access once payment is verified.',
    icon: <PaymentsOutlinedIcon fontSize="small" />,
    color: '#328b85',
    background: '#eaf6f5',
  },
]

const DotNetPillars: FC = () => (
  <Box component="section" aria-labelledby="dotnet-pillars-title" sx={{ position: 'relative', overflow: 'hidden', py: { xs: 7, md: 10 }, backgroundColor: 'background.paper' }}>
    <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: '13%', left: '44%', width: 140, height: 72, opacity: 0.8, backgroundImage: 'radial-gradient(#8bd9cc 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
    <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: '4%', bottom: '3%', width: 110, height: 72, opacity: 0.8, backgroundImage: 'radial-gradient(#e7c95e 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: { xs: 2, md: 4 }, mb: 5 }}>
        <Box>
          <Typography variant="overline" sx={{ display: 'block', mb: 0.5, color: '#57b9ad', fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', lineHeight: 1.4 }}>WHAT YOU’LL CREATE</Typography>
          <Typography id="dotnet-pillars-title" component="h2" sx={{ maxWidth: 720, fontSize: { xs: '2.25rem', md: '3.25rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em' }}>Six ways to learn with CourseSharp</Typography>
        </Box>
        <Typography color="text.secondary" sx={{ maxWidth: 360, pb: 0.75, fontSize: '1.05rem', lineHeight: 1.6 }}>Courses, live classes, and tools built around each learner’s progress.</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
        {pillars.map((pillar) => <Box component="article" key={pillar.title} sx={{ minWidth: 0, minHeight: { xs: 180, md: 210 }, p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider', borderRadius: 2, position: 'relative', backgroundColor: 'background.paper', transition: 'background-color 160ms ease', '&::after': { content: '""', position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: pillar.color, transform: 'scaleX(0)', transformOrigin: 'left center', transition: 'transform 220ms ease' }, '&:hover': { backgroundColor: 'rgb(244 244 245 / 1)', '&::after': { transform: 'scaleX(1)' } } }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, mb: 2.5, border: 1, borderColor: 'divider', borderRadius: 1, color: pillar.color, backgroundColor: pillar.background, '& svg': { fontSize: 24 } }}>{pillar.icon}</Box>
          <Typography component="h3" sx={{ mb: 1, fontSize: '1.25rem', fontWeight: 750, lineHeight: 1.3 }}>{pillar.title}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{pillar.description}</Typography>
        </Box>)}
      </Box>
    </Container>
  </Box>
)

export default DotNetPillars
