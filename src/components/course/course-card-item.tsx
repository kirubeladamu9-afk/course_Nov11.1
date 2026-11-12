import React, { FC, FocusEvent, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton, { iconButtonClasses } from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { Course } from '@/interfaces/course'
import { navigateTo } from '@/lib/navigation'

interface Props {
  item: Course
  onOpen?: (item: Course) => void
}

const CourseCardItem: FC<Props> = ({ item, onOpen }) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const openDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    setDetailsOpen(true)
  }
  const delayCloseDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setDetailsOpen(false), 180)
  }
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget as Node | null
    if (nextTarget && (cardRef.current?.contains(nextTarget) || panelRef.current?.contains(nextTarget))) return
    setDetailsOpen(false)
  }

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
  }, [])

  const openCourse = () => (onOpen ? onOpen(item) : navigateTo(`/courses/${item.id}`))

  return (
    <Box
      sx={{
        width: '100%',
        px: 1,
        py: 4,
      }}
    >
      <Box
        ref={cardRef}
        className="course-card"
        onMouseEnter={openDetails}
        onMouseLeave={delayCloseDetails}
        onFocus={openDetails}
        onBlur={handleBlur}
        aria-describedby={detailsOpen ? `course-details-${item.id}` : undefined}
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 4,
          position: 'relative',
          transition: (theme) => theme.transitions.create(['box-shadow']),
          '&:hover': {
            boxShadow: 2,
            [`& .${iconButtonClasses.root}`]: {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: 2,
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            lineHeight: 0,
            overflow: 'hidden',
            aspectRatio: '16 / 9',
            borderRadius: 3,
            mb: 2,
            '& .course-cover-image': {
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 3,
            },
          }}
        >
          <img className="course-cover-image" src={item.cover} width={760} height={760} alt={'Course ' + item.title} loading="lazy" />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography component="h2" variant="h5" sx={{ mb: 2, height: 56, overflow: 'hidden', fontSize: '1.2rem' }}>
            {item.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating name="rating-course" value={item.rating} max={5} sx={{ color: '#ffce31', mr: 1 }} readOnly />
            <Typography component="span" variant="body2" color="text.secondary">
              {item.ratingCount ? `(${item.ratingCount})` : 'No reviews yet'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" color="primary.main">
              {'$' + item.price}
            </Typography>
            <Typography variant="h6">/ course</Typography>
          </Box>
          <IconButton
            color="primary"
            aria-label={`Open ${item.title} course`}
            onClick={openCourse}
            sx={{ '&:hover': { color: 'primary.dark' } }}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>
      <Popper
        id={`course-details-${item.id}`}
        open={detailsOpen}
        anchorEl={cardRef.current}
        placement={isMobile ? 'bottom-start' : 'right-start'}
        modifiers={[{ name: 'offset', options: { offset: [0, 12] } }, { name: 'flip', options: { fallbackPlacements: ['left-start', 'top-start', 'bottom-start'] } }, { name: 'preventOverflow', options: { boundary: 'viewport', padding: 12 } }]}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        <Paper
          ref={panelRef}
          onMouseEnter={openDetails}
          onMouseLeave={delayCloseDetails}
          onFocus={openDetails}
          onBlur={handleBlur}
          elevation={8}
          sx={{ width: 340, maxWidth: 'min(340px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto', p: 2.25, border: 1, borderColor: 'divider', borderRadius: 3, color: 'text.primary', backgroundColor: 'background.paper' }}
        >
          <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 800, lineHeight: 1.25 }}>{item.title}</Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 1.5 }}>
            <Chip size="small" label={item.category} color="primary" variant="outlined" />
            {item.level && item.level !== 'Not specified' && <Chip size="small" label={item.level} variant="outlined" />}
          </Stack>
          {item.description?.trim() && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{item.description}</Typography>}
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 700 }}>{'$' + item.price} / course</Typography>
          <Button fullWidth variant="contained" onClick={openCourse} sx={{ minHeight: 42, borderRadius: 2, fontWeight: 800 }}>View course</Button>
        </Paper>
      </Popper>
    </Box>
  )
}

export default CourseCardItem
