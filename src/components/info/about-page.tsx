import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState, type FC } from 'react'
import HomeOurMentors from '@/components/home/mentors'
import { navigateTo } from '@/lib/navigation'

const valueCards = [
  { title: 'Built for steady progress', description: 'Learn at a pace that works for you with practical content, live support, and explanations that make difficult ideas easier to understand.', icon: <SchoolOutlinedIcon fontSize="small" />, color: '#168c7d', background: '#e4f6f1' },
  { title: 'Learners come first', description: 'Whether you are exploring a new subject or preparing for your next milestone, CourseSpace keeps learning welcoming and useful.', icon: <MailOutlineIcon fontSize="small" />, color: '#2782b4', background: '#e8f3fb' },
]

const cardSx = { border: 1, borderColor: 'divider', borderRadius: 3, boxShadow: '0 8px 26px rgba(15, 60, 70, .055)', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 32px rgba(15, 60, 70, .1)' } }
const faqCategories = {
  General: [
    { question: 'What is CourseSharp?', answer: 'CourseSharp is an online learning platform offering practical courses, tutor-led support, and practice to help learners build skills.' },
    { question: 'Who can learn with CourseSharp?', answer: 'Students can explore courses, practice new skills, and get support from experienced tutors.' },
    { question: 'How do I get started?', answer: 'Browse the course catalog, choose a course that fits your goals, and follow its enrollment steps.' },
    { question: 'Where can I see available courses?', answer: 'Visit the Courses page to browse the catalog, search topics, and compare course details.' },
  ],
  Platform: [
    { question: 'How do I find the right course?', answer: 'Browse the course catalog, compare course details, and use the available filters to find a course that fits your goals.' },
    { question: 'Can I search by subject or topic?', answer: 'Yes. Use the catalog search field to look for courses, topics, or skills.' },
    { question: 'How do I view course details?', answer: 'Select a course in the catalog to view its description, lessons, and other available information.' },
    { question: 'Can I browse different course types?', answer: 'Use the catalog filters to browse self-paced courses, live classes, and practice options.' },
  ],
  Features: [
    { question: 'Can I learn at my own pace?', answer: 'Yes. Explore self-paced courses and practice activities, or choose live classes when you want guided learning.' },
    { question: 'Are live classes available?', answer: 'Some courses include live classes. Check each course page for its learning format and schedule.' },
    { question: 'Can I practice what I learn?', answer: 'CourseSharp offers practice activities and exams to help learners apply their knowledge.' },
    { question: 'Can I track my learning?', answer: 'Your learning area shows your course enrollments and progress.' },
  ],
  Support: [
    { question: 'How can I get help with a course?', answer: 'Use the Contact Us page to send our support team a message, and we’ll help you with your question.' },
    { question: 'Who can help with a payment question?', answer: 'Contact the support team with your course name and payment question so they can assist.' },
    { question: 'Where can I get account help?', answer: 'Send a message through the Contact Us page and include the email address on your account.' },
    { question: 'How do I contact the support team?', answer: 'Visit Contact Us and send a message using the support form.' },
  ],
}

const AboutPage: FC = () => {
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<keyof typeof faqCategories>('General')

  return <Box component="main" sx={{ backgroundColor: 'background.default', color: 'text.primary' }}>
  <Box sx={{ position: 'relative', overflow: 'hidden', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
    <Box aria-hidden="true" sx={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', right: { xs: -240, md: -90 }, top: -225, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 0 0 48px rgba(255,255,255,.035), 0 0 0 96px rgba(255,255,255,.025)' }} />
    <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, md: 9 } }}>
      <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
        <Grid item xs={12} md={12} lg={7}>
          <Chip icon={<AutoAwesomeOutlinedIcon />} label="ABOUT COURSESPACE" size="small" sx={{ mb: 2.5, px: 0.5, color: 'common.white', backgroundColor: 'rgba(255,255,255,.12)', '& .MuiChip-icon': { color: '#b9f0dd' }, fontWeight: 700, letterSpacing: '.06em' }} />
          <Typography component="h1" sx={{ maxWidth: 700, mb: 2, fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.045em' }}>Learning that meets you where you are.</Typography>
          <Typography sx={{ maxWidth: 590, mb: 3.5, color: 'rgba(255,255,255,.78)', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>CourseSpace helps learners build practical skills through clear courses, supportive tutors, and relaxed practice.</Typography>
        </Grid>
        <Grid item xs={12} md={5} lg={5} sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', minHeight: { xs: 220, sm: 280, md: 360 } }}>
          <Box component="img" src="/images/about-study-group-banner.webp" alt="Students studying together around a laptop" sx={{ position: 'relative', top: 84, right: '56%', height: '100%', width: 'auto', maxWidth: 'none' }} />
        </Grid>
      </Grid>
    </Container>
  </Box>

  <Container maxWidth="lg" sx={{ py: { xs: 6, md: 7 } }}>
    <Grid container spacing={3}>
      {valueCards.map(({ title, description, icon, color, background }) => <Grid key={title} item xs={12} md={6}>
        <Card elevation={0} sx={cardSx}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.25 } }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, mb: 2.5, borderRadius: 2, color, backgroundColor: background }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 750 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: .75, lineHeight: 1.7 }}>{description}</Typography>
          </CardContent>
        </Card>
      </Grid>)}
    </Grid>
  </Container>

  <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
    <Box sx={{ maxWidth: 700, mx: 'auto', mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
      <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>LEARNING THAT MOVES YOU FORWARD</Typography>
      <Typography component="h2" variant="h3" sx={{ mt: .75, fontWeight: 800, letterSpacing: '-.035em', fontSize: { xs: '2rem', md: '2.75rem' } }}>Built for modern learning</Typography>
      <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>We bring clear courses, experienced tutors, and flexible practice together to help every learner make steady progress.</Typography>
    </Box>

    <Grid container spacing={2} alignItems="center" sx={{ mb: { xs: 4, md: 5 } }}>
      <Grid item xs={12} sm={4}>
        <Box component="img" src="/images/about-students-collaborating.webp" alt="Students collaborating around a laptop" sx={{ display: 'block', width: '100%', height: { xs: 210, sm: 190, md: 220 }, borderRadius: 3, objectFit: 'cover' }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Box component="img" src="/images/about-ai-classroom.webp" alt="Students learning with computers in a classroom" sx={{ display: 'block', width: '100%', height: { xs: 230, sm: 230, md: 270 }, borderRadius: 3, objectFit: 'cover' }} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Box component="img" src="/images/about-young-learners.webp" alt="Young learners exploring a laptop together" sx={{ display: 'block', width: '100%', height: { xs: 210, sm: 190, md: 220 }, borderRadius: 3, objectFit: 'cover' }} />
      </Grid>
    </Grid>

    <Typography component="p" sx={{ maxWidth: 790, mx: 'auto', mb: { xs: 4, md: 5 }, textAlign: 'center', fontSize: { xs: '1.1rem', md: '1.35rem' }, lineHeight: 1.6 }}>
      Our mission is to make quality learning accessible, supportive, and practical for students wherever they are.
    </Typography>

    <Paper elevation={0} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper' }}>
      {[{ value: '500+', label: 'Students' }, { value: '20+', label: 'Quality courses' }, { value: '10+', label: 'Experienced tutors' }].map((stat, index) => <Box key={stat.label} sx={{ py: { xs: 1.5, sm: 1 }, textAlign: 'center', borderRight: { sm: index < 2 ? 1 : 0 }, borderBottom: { xs: index < 2 ? 1 : 0, sm: 0 }, borderColor: 'divider' }}>
        <Typography sx={{ fontSize: { xs: '1.6rem', md: '1.9rem' }, fontWeight: 800 }}>{stat.value}</Typography>
        <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
      </Box>)}
    </Paper>

    <Grid container spacing={{ xs: 4, md: 7 }} alignItems="center" sx={{ mt: { xs: 6, md: 9 }, pb: { xs: 4, md: 6 }, borderBottom: 1, borderColor: 'divider' }}>
      <Grid item xs={12} md={6}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: .8 }}>A CLEAR PATH FORWARD</Typography>
        <Typography component="h3" variant="h4" sx={{ mt: .5, fontWeight: 800 }}>Learning designed for real progress</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.75 }}>Build confidence through practical lessons that break big ideas into manageable steps. Learn at your own pace and keep your progress moving forward.</Typography>
        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Flexible courses that fit your schedule</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Practice that turns knowledge into confidence</Typography>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box component="img" src="/images/about-ai-classroom.webp" alt="Students using computers in a classroom" sx={{ display: 'block', width: '100%', height: { xs: 240, md: 330 }, borderRadius: 3, objectFit: 'cover' }} />
      </Grid>
    </Grid>

    <Grid container spacing={{ xs: 4, md: 7 }} alignItems="center" sx={{ mt: { xs: 4, md: 6 } }}>
      <Grid item xs={12} md={6}>
        <Box component="img" src="/images/about-young-learners.webp" alt="Young students learning together" sx={{ display: 'block', width: '100%', height: { xs: 240, md: 330 }, borderRadius: 3, objectFit: 'cover' }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: .8 }}>SUPPORT THAT GROWS WITH YOU</Typography>
        <Typography component="h3" variant="h4" sx={{ mt: .5, fontWeight: 800 }}>Guidance at every step</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.75 }}>Learning feels easier when you have the right support. Our tutors make space for questions, explain challenging topics, and help learners stay motivated.</Typography>
        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Experienced tutors who meet you where you are</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>A welcoming place to ask, explore, and improve</Typography>
        </Stack>
      </Grid>
    </Grid>
  </Container>

  <HomeOurMentors autoplay />

  <Container maxWidth="md" sx={{ pt: { xs: 7, md: 10 }, pb: { xs: 9, md: 12 } }}>
    <Box sx={{ mb: 3.5, textAlign: 'center' }}>
      <Typography component="h2" variant="h3" sx={{ fontWeight: 800, letterSpacing: '-.035em', fontSize: { xs: '2rem', md: '2.75rem' } }}>Frequently Asked Questions</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>Clear answers about courses, learning, and support.</Typography>
    </Box>

    <Stack direction="row" justifyContent="center" flexWrap="wrap" useFlexGap spacing={.75} sx={{ mb: 3.5 }} role="group" aria-label="FAQ categories">
      {(Object.keys(faqCategories) as Array<keyof typeof faqCategories>).map((category) => <Button key={category} aria-pressed={selectedFaqCategory === category} size="small" onClick={() => setSelectedFaqCategory(category)} sx={{ minWidth: 0, px: 1.75, borderRadius: 6, color: selectedFaqCategory === category ? 'text.primary' : 'text.secondary', backgroundColor: selectedFaqCategory === category ? 'background.paper' : 'transparent', boxShadow: selectedFaqCategory === category ? 1 : 'none', textTransform: 'none' }}>{category}</Button>)}
    </Stack>

    <Stack spacing={1.5}>
      {faqCategories[selectedFaqCategory].map((faq, index) => <Accordion key={faq.question} defaultExpanded={selectedFaqCategory === 'General' && index === 0} disableGutters elevation={0} sx={{ border: 1, borderColor: 'transparent', borderRadius: '10px !important', backgroundColor: '#fff', color: '#173a38', '&:before': { display: 'none' }, '&.Mui-expanded': { borderColor: 'primary.main', backgroundColor: '#fff' } }}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} aria-controls={`about-faq-${selectedFaqCategory}-${index}-content`} id={`about-faq-${selectedFaqCategory}-${index}-header`} sx={{ px: { xs: 2, sm: 2.5 }, '& .MuiAccordionSummary-content': { my: 1.75 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{faq.question}</Typography>
        </AccordionSummary>
        <AccordionDetails id={`about-faq-${selectedFaqCategory}-${index}-content`} sx={{ pt: 0, px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{faq.answer}</Typography>
        </AccordionDetails>
      </Accordion>)}
    </Stack>
  </Container>

  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 8 } }}>
    <Paper elevation={0} sx={{ overflow: 'hidden', p: { xs: 3.5, sm: 5, md: 6 }, borderRadius: 3, textAlign: 'center', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
      <Typography component="h2" variant="h4" sx={{ fontWeight: 800, letterSpacing: '-.025em', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Let’s make your next step count</Typography>
      <Typography sx={{ mt: 1, color: 'rgba(255,255,255,.9)' }}>Find a course, meet a tutor, and build skills with confidence.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1.5} sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => navigateTo('/courses')} endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 1.5, px: 2.5, backgroundColor: '#0c2022', color: 'common.white', '&:hover': { backgroundColor: '#16383a' } }}>Explore courses</Button>
        <Button variant="contained" href="/contact-us" sx={{ borderRadius: 1.5, px: 2.5, backgroundColor: 'common.white', color: '#182d32', '&:hover': { backgroundColor: '#eef8f7' } }}>Contact support</Button>
      </Stack>
    </Paper>
  </Container>
</Box>
}

export default AboutPage
