import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'

const pillars = [
  { title: 'Live online classes', label: 'Live', color: '#4f6fae' },
  { title: 'Structured lessons', label: 'Learning', color: '#238b82' },
  { title: 'Timed quizzes', label: 'Assessment', color: '#8256b5' },
  { title: 'Step-by-step solver', label: 'Practice', color: '#39826f' },
  { title: 'Study plans & progress', label: 'Progress', color: '#526a9c' },
  { title: 'Enroll & pay securely', label: 'Enrollment', color: '#328b85' },
]

const introCards = [
  { label: 'Access', title: 'Live and self-paced', description: 'Join scheduled sessions or learn on your own schedule.' },
  { label: 'Programs', title: 'Courses and batches', description: 'From exam prep to summer camps, all in one place.' },
]

const cardSx = {
  position: 'relative',
  minWidth: 0,
  p: { xs: 2.5, md: 3 },
  border: 1,
  borderColor: 'divider',
  borderRadius: 2,
  backgroundColor: 'background.paper',
  transition: 'background-color 160ms ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: 'var(--accent)',
    transform: 'scaleX(0)',
    transformOrigin: 'left center',
    transition: 'transform 220ms ease',
  },
  '&:hover': {
    backgroundColor: 'rgb(244 244 245 / 1)',
    '&::after': { transform: 'scaleX(1)' },
  },
}

const DotPattern: FC<{ color: string; sx: object }> = ({ color, sx }) => (
  <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '14px 14px', ...sx }} />
)

const DotNetPillars: FC = () => (
  <Box component="section" aria-labelledby="dotnet-pillars-title" sx={{ position: 'relative', overflow: 'hidden', py: { xs: 7, md: 10 }, backgroundColor: 'background.paper' }}>
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ mb: { xs: 4, md: 5 } }}>
        <Typography variant="overline" sx={{ display: 'block', mb: 1, color: '#57b9ad', fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', lineHeight: 1.4 }}>WHAT YOU’LL CREATE</Typography>
        <Typography id="dotnet-pillars-title" component="h2" sx={{ maxWidth: 640, fontSize: { xs: '2.25rem', md: '3.25rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em' }}>Six ways to learn with CourseSharp</Typography>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 520, fontSize: '1.05rem', lineHeight: 1.7 }}>Courses, live classes, and tools built around each learner’s progress.</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 7fr)' }, gap: { xs: 2.5, md: 3 }, alignItems: 'start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            {introCards.map((card) => <Box component="article" key={card.label} sx={{ ...cardSx, '--accent': '#57b9ad', p: 2.5 }}>
              <Typography sx={{ mb: 1.5, color: '#57b9ad', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{card.label}</Typography>
              <Typography component="h3" sx={{ mb: 0.75, fontSize: '1.1rem', fontWeight: 750, lineHeight: 1.3 }}>{card.title}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{card.description}</Typography>
            </Box>)}
          </Box>
          <Box component="img" src="/images/about-students-collaborating.webp" alt="Students collaborating around a table" sx={{ display: 'block', width: '100%', aspectRatio: { xs: '4 / 3', md: '5 / 4' }, objectFit: 'cover', borderRadius: 2 }} />
        </Box>

        <Box sx={{ position: 'relative', minWidth: 0 }}>
          <DotPattern color="#57b9ad" sx={{ top: -24, right: -8, width: 140, height: 72, opacity: 0.8 }} />
          <DotPattern color="#e7c95e" sx={{ bottom: -24, left: -8, width: 110, height: 72, opacity: 0.8 }} />
          <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
            {pillars.map((pillar) => <Box component="article" key={pillar.title} sx={{ ...cardSx, '--accent': pillar.color, minHeight: { xs: 130, md: 160 }, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ width: 8, height: 8, mb: 2.5, borderRadius: '50%', backgroundColor: pillar.color }} />
              <Typography component="h3" sx={{ mb: 1, fontSize: '1.05rem', fontWeight: 750, lineHeight: 1.3 }}>{pillar.title}</Typography>
              <Typography sx={{ mt: 'auto', color: 'text.secondary', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{pillar.label}</Typography>
            </Box>)}
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
)

export default DotNetPillars
