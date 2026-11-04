import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FaqOutlinedIcon from '@mui/icons-material/QuizOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState, type FC, type FormEvent } from 'react'
import { navigateTo } from '@/lib/navigation'

const emailAddress = 'support@coursesharp.com'
const contactHeroImage = '/images/contact-support-banner.webp'
const officeAddress = 'Bole, Addis Ababa, Ethiopia'
const subjects = ['Course enrollment & payments', 'Technical support', 'Account & profile issues', 'General inquiry']
const faqs = [
  { question: 'How do I enroll in a course?', answer: 'Browse the course catalog, open a course to review its details, and choose Enroll to get started.', action: 'Browse courses', href: '/courses' },
  { question: 'Where can I get help with a payment?', answer: 'Email our support team with your course name and payment question. We will help you review the next steps.', action: 'Email support', href: `mailto:${emailAddress}?subject=Payment%20support` },
  { question: 'I need help with my account. What should I do?', answer: 'Send us a message with the email address on your account. Please do not include your password.', action: 'Contact support', href: `mailto:${emailAddress}?subject=Account%20support` },
]

const ContactPage: FC = () => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('fullName') ?? '')
    const email = String(formData.get('email') ?? '')
    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
    const link = document.createElement('a')
    link.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    link.click()
  }

  return <Box component="main" sx={{ backgroundColor: 'background.default', color: 'text.primary' }}>
    <Box sx={{ position: 'relative', overflow: 'hidden', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
      <Box aria-hidden="true" sx={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', right: { xs: -240, md: -90 }, top: -225, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 0 0 48px rgba(255,255,255,.035), 0 0 0 96px rgba(255,255,255,.025)' }} />
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, md: 9 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={12} lg={7}>
            <Box sx={{ maxWidth: 700 }}>
              <Typography variant="overline" sx={{ color: '#b9f0dd', fontWeight: 800, letterSpacing: 1.1 }}>GET IN TOUCH</Typography>
              <Typography component="h1" sx={{ mt: .75, mb: 1.5, fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' }, lineHeight: 1.05, letterSpacing: '-.045em', fontWeight: 800 }}>Contact Us</Typography>
              <Typography sx={{ maxWidth: 590, color: 'rgba(255,255,255,.78)', lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.1rem' } }}>We’d love to hear from you! Whether you have a question, need support, or just want to say hello — we’re here to help.</Typography>
              <Stack direction="row" spacing={{ xs: 2, sm: 2.5 }} sx={{ mt: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={.75} alignItems="center"><MenuBookOutlinedIcon sx={{ color: '#b9f0dd' }} fontSize="small" /><Typography variant="body1" sx={{ color: 'rgba(255,255,255,.88)', fontWeight: 600, lineHeight: 1.3 }}>Better Learning<br />Together</Typography></Stack>
                <Stack direction="row" spacing={.75} alignItems="center"><FavoriteBorderRoundedIcon sx={{ color: '#b9f0dd' }} fontSize="small" /><Typography variant="body1" sx={{ color: 'rgba(255,255,255,.88)', fontWeight: 600, lineHeight: 1.3 }}>Your Success<br />Matters</Typography></Stack>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} lg={5} sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', minHeight: { xs: 220, sm: 280, md: 360 } }}>
            <Box component="img" src={contactHeroImage} alt="Support professional wearing a headset at a laptop" sx={{ position: 'absolute', top: 77, right: 0, height: '100%', width: 'auto', maxWidth: 'none' }} />
          </Grid>
        </Grid>
      </Container>
    </Box>

    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 7 }, pb: { xs: 3, md: 4 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4, md: 4.5 }, border: 1, borderColor: 'divider', borderRadius: 3.5, boxShadow: '0 10px 35px rgba(15, 60, 70, .055)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.65fr .85fr' }, gap: { xs: 4, md: 5 } }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: .5, md: 1 }, minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: .9 }}>SEND US A MESSAGE</Typography>
            <Typography component="h2" variant="h4" sx={{ mt: .25, fontWeight: 800, letterSpacing: '-.035em' }}>Let’s Talk</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1, mb: 4 }}>Fill out the form below and we’ll get back to you as soon as possible.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mb: 2.5 }}>
              <TextField required fullWidth name="fullName" label="Full Name" autoComplete="name" />
              <TextField required fullWidth name="email" type="email" label="Email Address" autoComplete="email" />
            </Stack>
            <FormControl fullWidth required sx={{ mb: 2.5 }}>
              <InputLabel id="contact-subject-label">Subject</InputLabel>
              <Select labelId="contact-subject-label" id="contact-subject" value={subject} label="Subject" onChange={(event) => setSubject(event.target.value)}>
                {subjects.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField required fullWidth multiline minRows={5} name="message" label="Message" value={message} onChange={(event) => setMessage(event.target.value.slice(0, 1000))} inputProps={{ maxLength: 1000 }} />
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mt: 2.25 }}>
              <Button type="submit" variant="contained" endIcon={<SendRoundedIcon />} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 2.75, py: 1.1, borderRadius: 6, fontWeight: 700, boxShadow: 'none' }}>Send Message</Button>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>{message.length}/1000</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>Your email app will open with your message ready to send.</Typography>
          </Box>

          <Stack spacing={2.5}>
            <Card elevation={0} sx={{ flex: 1, borderRadius: 3, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(145deg, #143b3a, #173032)' : 'linear-gradient(145deg, #e9f8f4, #f3fbf8)' }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}><Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, mb: 2.5, borderRadius: 2.5, color: 'primary.main', backgroundColor: 'rgba(255,255,255,.65)' }}><FaqOutlinedIcon /></Box><Typography variant="h6" sx={{ fontWeight: 750 }}>Need Quick Help?</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .75, mb: 2, lineHeight: 1.6 }}>Check common questions for quick answers to enrollment, payment, and account questions.</Typography><Button component="a" href="#contact-faq" variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 5, fontWeight: 700 }}>View FAQ</Button></CardContent>
            </Card>
            <Card elevation={0} sx={{ flex: 1, borderRadius: 3, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(145deg, #143b3a, #173032)' : 'linear-gradient(145deg, #e9f8f4, #f3fbf8)' }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}><Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 750 }}>We’re Here to Help</Typography><Stack spacing={1.15}>{['Course enrollment & payments', 'Technical support', 'Account and profile issues', 'General inquiries'].map((item) => <Stack key={item} direction="row" spacing={1} alignItems="center"><CheckCircleRoundedIcon sx={{ color: 'primary.main', fontSize: 17 }} /><Typography variant="body2" color="text.secondary">{item}</Typography></Stack>)}</Stack></CardContent>
            </Card>
          </Stack>
        </Box>
      </Paper>
    </Container>

    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Paper elevation={0} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '.8fr 1.2fr' }, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 3.5, boxShadow: '0 10px 35px rgba(15, 60, 70, .055)' }}>
        <Box sx={{ p: { xs: 3.5, sm: 4, md: 4.5 }, alignSelf: 'center' }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: .9 }}>OUR LOCATION</Typography>
          <Typography component="h2" variant="h5" sx={{ mt: .25, fontWeight: 800 }}>Visit Our Office</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1, lineHeight: 1.7 }}>We’re located in Bole, Addis Ababa. Feel free to stop by or reach out to us anytime.</Typography>
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2.5 }}><LocationOnOutlinedIcon color="primary" fontSize="small" sx={{ mt: .15 }} /><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{officeAddress}</Typography><Typography variant="caption" color="text.secondary">Near Bole International Airport</Typography></Box></Stack>
          <Button component="a" href="https://www.google.com/maps/search/?api=1&query=Bole%2C%20Addis%20Ababa%2C%20Ethiopia" target="_blank" rel="noreferrer" variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2.5, borderRadius: 5, fontWeight: 700 }}>Get Directions</Button>
        </Box>
        <Box component="iframe" title="Map showing Bole, Addis Ababa" src="https://maps.google.com/maps?q=Bole%2C%20Addis%20Ababa%2C%20Ethiopia&z=14&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" sx={{ display: 'block', width: '100%', height: { xs: 230, sm: 320 }, minHeight: { sm: 320 }, border: 0 }} />
      </Paper>
    </Container>

    <Container maxWidth="lg" id="contact-faq" sx={{ pt: { xs: 4, md: 5 }, pb: { xs: 6, md: 8 }, scrollMarginTop: 24 }}>
      <Box sx={{ mb: 3.5, textAlign: 'center' }}><Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: .9 }}>FAQ</Typography><Typography component="h2" variant="h4" sx={{ mt: .25, fontWeight: 800 }}>Common questions</Typography></Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>{faqs.map((faq) => <Paper key={faq.question} elevation={0} sx={{ p: { xs: 3, sm: 3.5 }, border: 1, borderColor: 'divider', borderRadius: 2.5, backgroundColor: 'background.paper' }}><Typography variant="subtitle1" sx={{ fontWeight: 750 }}>{faq.question}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .75, lineHeight: 1.65 }}>{faq.answer}</Typography><Link href={faq.href} onClick={faq.href === '/courses' ? (event) => { event.preventDefault(); navigateTo('/courses') } : undefined} underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: .5, mt: 1.25, fontSize: '.875rem', fontWeight: 700 }}>{faq.action}<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} /></Link></Paper>)}</Box>
    </Container>
  </Box>
}

export default ContactPage
