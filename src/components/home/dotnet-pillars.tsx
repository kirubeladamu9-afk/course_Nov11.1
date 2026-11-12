import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import type { FC } from 'react'

const accentColors = ['#4f6fae', '#238b82', '#8256b5', '#39826f', '#526a9c', '#328b85']
const introImage = '/images/about-students-collaborating.webp'

const categories = [
  { name: 'Mathematics', label: 'Academic' },
  { name: 'Programming & IT', label: 'Technology' },
  { name: 'Business & Management', label: 'Business' },
  { name: 'Languages', label: 'Communication' },
  { name: 'Design & Creativity', label: 'Creative Arts' },
  { name: 'Science', label: 'Academic' },
  { name: 'Digital Marketing', label: 'Marketing' },
  { name: 'Finance & Accounting', label: 'Finance' },
  { name: 'History & Social Studies', label: 'Humanities' },
  { name: 'Photography & Media', label: 'Media' },
  { name: 'Education & Teaching', label: 'Education' },
  { name: 'Personal Development', label: 'Life Skills' },
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

const DotNetPillars: FC = () => {
  return (
    <Box component="section" aria-labelledby="dotnet-pillars-title" sx={{ position: 'relative', overflow: 'hidden', py: { xs: 7, md: 10 }, backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Typography variant="overline" sx={{ display: 'block', mb: 1, color: '#57b9ad', fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', lineHeight: 1.4 }}>EXPLORE CATEGORIES</Typography>
          <Typography id="dotnet-pillars-title" component="h2" sx={{ maxWidth: 640, fontSize: { xs: '2.25rem', md: '3.25rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em' }}>Explore courses by category</Typography>
          <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 520, fontSize: '1.05rem', lineHeight: 1.7 }}>Discover learning opportunities across different subjects and fields.</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 5fr) minmax(0, 7fr)' }, gap: { xs: 2.5, md: 3 }, alignItems: 'start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              <Box component="article" sx={{ ...cardSx, '--accent': '#57b9ad', p: 2.5 }}>
                <Typography sx={{ mb: 1.5, color: '#57b9ad', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Catalog</Typography>
                <Typography component="h3" sx={{ mb: 0.75, fontSize: '1.1rem', fontWeight: 750, lineHeight: 1.3 }}>12 categories</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>Subjects spanning academic, technology, business and creative fields.</Typography>
              </Box>
              <Box component="article" sx={{ ...cardSx, '--accent': '#57b9ad', p: 2.5 }}>
                <Typography sx={{ mb: 1.5, color: '#57b9ad', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Format</Typography>
                <Typography component="h3" sx={{ mb: 0.75, fontSize: '1.1rem', fontWeight: 750, lineHeight: 1.3 }}>Live and self-paced</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>Join scheduled sessions or learn on your own schedule.</Typography>
              </Box>
            </Box>
            <Box component="img" src={introImage} alt="Students collaborating around a table" sx={{ display: 'block', width: '100%', aspectRatio: { xs: '4 / 3', md: '5 / 4' }, objectFit: 'cover', borderRadius: 2 }} />
          </Box>

          <Box sx={{ position: 'relative', minWidth: 0 }}>
            <DotPattern color="#57b9ad" sx={{ top: -24, right: -8, width: 140, height: 72, opacity: 0.8 }} />
            <DotPattern color="#e7c95e" sx={{ bottom: -24, left: -8, width: 110, height: 72, opacity: 0.8 }} />
            <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
              {categories.map((category, index) => {
                const color = accentColors[index % accentColors.length]
                return (
                  <Box component="article" key={category.name} sx={{ ...cardSx, '--accent': color, minHeight: { xs: 130, md: 160 }, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ width: 8, height: 8, mb: 2.5, borderRadius: '50%', backgroundColor: color }} />
                    <Typography component="h3" sx={{ mb: 1, fontSize: '1.05rem', fontWeight: 750, lineHeight: 1.3 }}>{category.name}</Typography>
                    <Typography sx={{ mt: 'auto', color: 'text.secondary', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{category.label}</Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default DotNetPillars
