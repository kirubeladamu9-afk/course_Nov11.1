import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import IconButton, { iconButtonClasses } from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FC, useEffect, useMemo, useState } from 'react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import EnrollmentModal from '@/components/course/enrollment-modal'
import { type Course } from '@/interfaces/course'
import { getPublicClasses, type PublicClass } from '@/services/api'
import { AvailabilityBadge, formatSchedule, programs, type ProgramDefinition } from './training-programs'

interface TrainingProgramsPageProps {
  courses: Course[]
  darkMode: boolean
  onToggleDarkMode: () => void
}

type SortOrder = 'recommended' | 'price-low' | 'price-high' | 'title'
type CheckoutCourse = Pick<Course, 'id' | 'title' | 'price'> & { id: number }

interface ClassListing {
  program: ProgramDefinition
  classRecord: PublicClass
  description: string
}

interface ProgramClassCardProps {
  listing: ClassListing
  onEnroll: (classRecord: PublicClass) => void
}

const ProgramClassCard: FC<ProgramClassCardProps> = ({ listing: { classRecord, description }, onEnroll }) => {
  const canEnroll = !classRecord.enrollmentClosed && (classRecord.status === 'open' || classRecord.status === 'full')
  const actionLabel = `${classRecord.status === 'full' ? 'Join waitlist for' : 'Join'} ${classRecord.title}`

  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, backgroundColor: 'background.paper', borderRadius: 4, position: 'relative', transition: (theme) => theme.transitions.create(['box-shadow']), '&:hover': { boxShadow: 2, [`& .${iconButtonClasses.root}`]: { backgroundColor: 'primary.main', color: 'primary.contrastText', boxShadow: 2 } } }}>
    <Box sx={{ position: 'relative', lineHeight: 0, overflow: 'hidden', aspectRatio: '16 / 9', borderRadius: 3, mb: 2, '& .program-cover-image': { display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 } }}>
      <img className="program-cover-image" src={classRecord.cover ?? '/images/training-programs/international-online-interactive.webp'} width={760} height={428} alt={classRecord.title} loading="lazy" />
    </Box>
    <Typography component="h4" variant="h5" sx={{ mb: 1, height: 56, overflow: 'hidden', fontSize: '1.2rem' }}>{classRecord.title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</Typography>
    <Stack spacing={0.5} sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary">{formatSchedule(classRecord.schedule)}</Typography>
      <Typography variant="body2" color="text.secondary">Tutor: {classRecord.tutorName}</Typography>
      <Box sx={{ pt: 0.5 }}><AvailabilityBadge classRecord={classRecord} /></Box>
    </Stack>
    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography variant="h5" color="primary.main">{`$${classRecord.price}`}</Typography>
        <Typography variant="h6">/ class</Typography>
      </Box>
      <IconButton color="primary" aria-label={canEnroll ? actionLabel : `${classRecord.title} is not open for enrollment`} disabled={!canEnroll} onClick={() => onEnroll(classRecord)} sx={{ '&:hover': { color: 'primary.dark' } }}>
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  </Box>
}

const TrainingProgramsPage: FC<TrainingProgramsPageProps> = ({ courses, darkMode, onToggleDarkMode }) => {
  const [search, setSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended')
  const [liveClasses, setLiveClasses] = useState<PublicClass[]>([])
  const [enrollmentCourse, setEnrollmentCourse] = useState<CheckoutCourse | null>(null)
  const [enrollmentClassId, setEnrollmentClassId] = useState<number | null>(null)

  const programTypes = useMemo(() => Array.from(new Set(programs.map((program) => program.eyebrow))), [])
  const listings = useMemo<ClassListing[]>(() => liveClasses.flatMap((classRecord) => {
    const program = programs.find((candidate) => candidate.id === classRecord.programId)
    if (!program || !classRecord.published || classRecord.status === 'closed') return []
    const course = courses.find((candidate) => Number(candidate.id) === classRecord.courseId)
    return [{ program, classRecord, description: course?.description ?? program.description }]
  }), [courses, liveClasses])
  const priceMaximum = Math.max(50, Math.ceil(Math.max(0, ...listings.map((listing) => listing.classRecord.price)) / 50) * 50)
  const activePriceRange = priceRange ?? [0, priceMaximum]
  const hasFilters = selectedTypes.length > 0 || activePriceRange[0] > 0 || activePriceRange[1] < priceMaximum

  useEffect(() => {
    let isCurrent = true
    getPublicClasses().then((records) => {
      if (isCurrent) setLiveClasses(records)
    }).catch(() => {
      if (isCurrent) setLiveClasses([])
    })
    return () => {
      isCurrent = false
    }
  }, [])

  const visibleListings = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return listings
      .filter(({ program }) => selectedTypes.length === 0 || selectedTypes.includes(program.eyebrow))
      .filter(({ classRecord }) => classRecord.price >= activePriceRange[0] && classRecord.price <= activePriceRange[1])
      .filter(({ program, classRecord, description }) => !query || `${program.title} ${program.eyebrow} ${program.features.join(' ')} ${classRecord.title} ${classRecord.tutorName} ${description}`.toLocaleLowerCase().includes(query))
      .sort((a, b) => {
        if (sortOrder === 'price-low') return a.classRecord.price - b.classRecord.price
        if (sortOrder === 'price-high') return b.classRecord.price - a.classRecord.price
        if (sortOrder === 'title') return a.classRecord.title.localeCompare(b.classRecord.title)
        return 0
      })
  }, [activePriceRange, listings, search, selectedTypes, sortOrder])

  const categoryGroups = programs
    .filter((program) => selectedTypes.length === 0 || selectedTypes.includes(program.eyebrow))
    .map((program) => ({ program, items: visibleListings.filter((listing) => listing.program.id === program.id) }))

  const clearFilters = () => {
    setSearch('')
    setSelectedTypes([])
    setPriceRange(null)
  }

  const handleEnroll = (classRecord: PublicClass) => {
    setEnrollmentCourse({ id: classRecord.courseId ?? classRecord.id, title: classRecord.title, price: classRecord.price })
    setEnrollmentClassId(classRecord.id)
  }

  return <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
    <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
    <Box component="main">
      <Box sx={{ position: 'relative', overflow: 'hidden', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
        <Box aria-hidden="true" sx={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', right: { xs: -240, md: -90 }, top: -225, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 0 0 48px rgba(255,255,255,.035), 0 0 0 96px rgba(255,255,255,.025)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, md: 9 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={12} lg={7}>
              <Chip icon={<AutoAwesomeOutlinedIcon />} label="FIND YOUR PATH" size="small" sx={{ mb: 2.5, px: 0.5, color: 'common.white', backgroundColor: 'rgba(255,255,255,.12)', '& .MuiChip-icon': { color: '#b9f0dd' }, fontWeight: 700, letterSpacing: '.06em' }} />
              <Typography component="h1" sx={{ maxWidth: 700, mb: 2, fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.045em' }}>Our Training Programs</Typography>
              <Typography sx={{ maxWidth: 590, mb: 3.5, color: 'rgba(255,255,255,.78)', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>Choose the learning experience that fits your goals, schedule, and stage. Small groups, expert tutors, and real progress.</Typography>
            </Grid>
            <Grid item xs={12} md={5} lg={5} sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', minHeight: { xs: 220, sm: 280, md: 360 } }}>
              <Box component="img" src="/images/training-programs/international-online-interactive.webp" alt="" sx={{ position: 'absolute', top: 77, right: 0, height: '100%', width: 'auto', maxWidth: 'none' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="program-catalog" maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, scrollMarginTop: 24 }}>
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.25 }}>Browse and discover</Typography>
          <Typography component="h2" variant="h4" sx={{ mt: 0.25, fontWeight: 800, letterSpacing: '-.035em' }}>Explore all programs</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>Search the programs or filter by type and price to find your next step.</Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
          <TextField fullWidth value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search programs, formats, or features" aria-label="Search programs" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'background.paper', borderRadius: 2 } }} />
          <FormControl size="small" sx={{ width: { xs: '100%', md: 210 }, flexShrink: 0 }}>
            <Select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} inputProps={{ 'aria-label': 'Sort programs' }} sx={{ minHeight: 56, backgroundColor: 'background.paper', borderRadius: 2 }}>
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="price-low">Price: low to high</MenuItem>
              <MenuItem value="price-high">Price: high to low</MenuItem>
              <MenuItem value="title">Class name</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="flex-start">
          <Grid item xs={12} md={3}>
            <Paper elevation={0} component="aside" aria-label="Program filters" sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', position: { md: 'sticky' }, top: { md: 24 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 750 }}>Filters</Typography>
                {(hasFilters || search) && <Button size="small" onClick={clearFilters}>Clear all</Button>}
              </Stack>
              <Divider />
              <Box sx={{ py: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Program type</Typography>
                <FormGroup>
                  {programTypes.map((type) => <FormControlLabel key={type} control={<Checkbox size="small" checked={selectedTypes.includes(type)} onChange={(event) => setSelectedTypes((current) => event.target.checked ? [...current, type] : current.filter((value) => value !== type))} />} label={<Typography variant="body2">{type} <Typography component="span" variant="caption" color="text.secondary">({programs.filter((program) => program.eyebrow === type).length})</Typography></Typography>} sx={{ ml: 0, mr: 0, minHeight: 34 }} />)}
                </FormGroup>
              </Box>
              <Divider />
              <Box sx={{ py: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Price range</Typography>
                <Typography variant="caption" color="text.secondary">${activePriceRange[0]} – ${activePriceRange[1]}</Typography>
                <Slider getAriaLabel={(index) => (index === 0 ? 'Minimum class price' : 'Maximum class price')} value={activePriceRange} min={0} max={priceMaximum} step={1} onChange={(_, value) => { if (Array.isArray(value)) setPriceRange([value[0], value[1]]) }} valueLabelDisplay="auto" valueLabelFormat={(value) => `$${value}`} sx={{ mt: 1, mb: 0.5, color: 'primary.main' }} />
                <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Min</Typography><Typography variant="caption" color="text.secondary">Max</Typography></Stack>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Showing <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{visibleListings.length}</Box> {visibleListings.length === 1 ? 'class' : 'classes'}</Typography>
              {(hasFilters || search) && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
            </Stack>
            {categoryGroups.map(({ program, items }) => <Box key={program.id} component="section" aria-labelledby={`program-${program.id}`} sx={{ mb: 6 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.25 }}>{program.eyebrow}</Typography>
                <Typography component="h3" id={`program-${program.id}`} variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.02em' }}>{program.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 680 }}>{program.description}</Typography>
              </Box>
              {items.length ? <Grid container spacing={2} alignItems="stretch">
                {items.map((listing) => <Grid item xs={12} sm={6} md={4} key={listing.classRecord.id}><ProgramClassCard listing={listing} onEnroll={handleEnroll} /></Grid>)}
              </Grid> : <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3, backgroundColor: 'background.paper' }}>
                <Typography color="text.secondary">{hasFilters || search ? 'No classes in this program match your filters.' : 'No published classes yet. Check back soon.'}</Typography>
              </Paper>}
            </Box>)}
          </Grid>
        </Grid>
      </Container>
    </Box>
    {enrollmentCourse && <EnrollmentModal course={enrollmentCourse} classId={enrollmentClassId} open={Boolean(enrollmentCourse)} onClose={() => { setEnrollmentCourse(null); setEnrollmentClassId(null) }} />}
    <Footer />
  </Box>
}

export default TrainingProgramsPage
