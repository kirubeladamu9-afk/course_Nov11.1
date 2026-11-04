import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { type FC } from 'react'
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'

const pillars = [
  {
    title: 'Desktop with WPF',
    description: 'Native Windows apps with rich UI, MVVM architecture, and system integration.',
    icon: <DesktopWindowsOutlinedIcon fontSize="small" />,
    color: '#4f6fae',
    background: '#eef2f9',
  },
  {
    title: 'Web with ASP.NET Core',
    description: 'REST APIs, server-rendered pages, and Razor on the high-performance .NET runtime.',
    icon: <LanguageOutlinedIcon fontSize="small" />,
    color: '#238b82',
    background: '#eaf6f4',
  },
  {
    title: 'Blazor — C# in browser',
    description: 'Interactive web UIs without JavaScript. Server or WebAssembly mode.',
    icon: <LayersOutlinedIcon fontSize="small" />,
    color: '#8256b5',
    background: '#f3eff9',
  },
  {
    title: 'EF Core & SQL',
    description: 'Model data, query with LINQ, run migrations on SQL Server or PostgreSQL.',
    icon: <StorageOutlinedIcon fontSize="small" />,
    color: '#39826f',
    background: '#edf6f2',
  },
  {
    title: 'Auth & Security',
    description: 'JWT, Identity, OAuth, role-based access — production patterns from day one.',
    icon: <SecurityOutlinedIcon fontSize="small" />,
    color: '#526a9c',
    background: '#eef1f8',
  },
  {
    title: 'Deploy anywhere',
    description: 'Docker, Azure, AWS, Linux servers — package and ship apps with confidence.',
    icon: <RocketLaunchOutlinedIcon fontSize="small" />,
    color: '#328b85',
    background: '#eaf6f5',
  },
]

const DotNetPillars: FC = () => (
  <Box component="section" aria-labelledby="dotnet-pillars-title" sx={{ position: 'relative', overflow: 'hidden', py: { xs: 6, md: 8 }, backgroundColor: 'background.paper' }}>
    <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: '13%', left: '44%', width: 140, height: 72, opacity: 0.8, backgroundImage: 'radial-gradient(#8bd9cc 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
    <Box aria-hidden="true" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: '4%', bottom: '3%', width: 110, height: 72, opacity: 0.8, backgroundImage: 'radial-gradient(#e7c95e 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, width: '90%', maxWidth: 1140, px: '0 !important' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: { xs: 2, md: 4 }, mb: 3.5 }}>
        <Box>
          <Typography variant="overline" sx={{ display: 'block', mb: 0.5, color: '#57b9ad', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', lineHeight: 1.4 }}>WHAT YOU’LL MASTER</Typography>
          <Typography id="dotnet-pillars-title" component="h2" sx={{ maxWidth: 480, fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em' }}>Six pillars of .NET development</Typography>
        </Box>
        <Typography color="text.secondary" sx={{ maxWidth: 300, pb: 0.35, fontSize: '0.875rem', lineHeight: 1.5 }}>Hands-on projects, not endless theory. Build real software from week one.</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
        {pillars.map((pillar) => <Box component="article" key={pillar.title} sx={{ minWidth: 0, minHeight: { xs: 112, md: 110 }, p: { xs: 1.75, md: 2 }, border: 1, borderColor: 'divider', borderRadius: 1, backgroundColor: 'background.paper', transition: 'background-color 160ms ease, border-color 160ms ease', '&:hover': { borderColor: pillar.color, backgroundColor: (theme) => alpha(pillar.color, theme.palette.mode === 'dark' ? 0.16 : 0.06) } }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 24, height: 24, mb: 1.25, border: 1, borderColor: 'divider', borderRadius: 0.5, color: pillar.color, backgroundColor: pillar.background }}>{pillar.icon}</Box>
          <Typography component="h3" sx={{ mb: 0.55, fontSize: '0.875rem', fontWeight: 750, lineHeight: 1.3 }}>{pillar.title}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>{pillar.description}</Typography>
        </Box>)}
      </Box>
    </Container>
  </Box>
)

export default DotNetPillars
