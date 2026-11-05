import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'
import { checkNumberLine, checkTenFrame, createTenFrameRounds, framesFor, type TenFrameCheck, type TenFrameRound } from './ten-frame-problems'

type TenFrameBuilderActivityProps = { topic: MathTopic; onComplete?: () => void }
type Mode = 'ten-frame' | 'number-line'
type Counter = 'first' | 'second' | 'removed'
type Slot = Counter | null
type Hop = { from: number; to: number }
type Session = {
  mode: Mode
  rounds: TenFrameRound[]
  roundIndex: number
  slots: Slot[]
  hops: Hop[]
  answer: string
  placing: 'first' | 'second'
  check: TenFrameCheck | null
}

const FRAME_SIZE = 10
const LINE_MAX = 20
const LINE_NUMBERS = Array.from({ length: LINE_MAX + 1 }, (_, value) => value)
const COUNTER_COLORS: Record<Counter, string> = { first: '#4f8cff', second: '#f6b73c', removed: '#c4cad2' }
const COUNTER_NAMES: Record<Counter, string> = { first: 'first number counter', second: 'second number counter', removed: 'removed counter' }
const lineX = (value: number) => 20 + value * 20

const countCounters = (slots: Slot[], kind: Counter, from = 0, to = slots.length) => slots.slice(from, to).filter((slot) => slot === kind).length
const countHops = (hops: Hop[]) => ({ forward: hops.filter((hop) => hop.to > hop.from).length, backward: hops.filter((hop) => hop.to < hop.from).length })

const startRound = (mode: Mode, rounds: TenFrameRound[], roundIndex: number): Session => {
  const { problem } = rounds[roundIndex]
  return {
    mode,
    rounds,
    roundIndex,
    slots: Array.from({ length: 2 * FRAME_SIZE }, (_, index) => (problem.operation === 'subtract' && index < problem.first ? 'first' : null)),
    hops: [],
    answer: '',
    placing: 'first',
    check: null,
  }
}

const evaluate = (session: Session): TenFrameCheck => {
  const { problem } = session.rounds[session.roundIndex]
  const answer = session.answer.trim() === '' ? null : Number(session.answer)
  if (session.mode === 'number-line') return checkNumberLine(problem, countHops(session.hops), answer)
  return checkTenFrame(
    problem,
    { firstCounters: countCounters(session.slots, 'first'), secondCounters: countCounters(session.slots, 'second'), removed: countCounters(session.slots, 'removed') },
    answer,
  )
}

const nextSlotFor = (slot: Slot, placing: 'first' | 'second', subtraction: boolean): Slot | undefined => {
  if (subtraction) return slot === 'first' ? 'removed' : slot === 'removed' ? 'first' : undefined
  return slot ? null : placing
}

const Counters: FC<{ kind: Counter }> = ({ kind }) => <Box sx={{ width: '72%', height: '72%', borderRadius: '50%', backgroundColor: COUNTER_COLORS[kind], boxShadow: '0 3px 0 rgba(0,0,0,.12)' }} />

const TenFrameBuilderActivity: FC<TenFrameBuilderActivityProps> = ({ topic, onComplete }) => {
  const [session, setSession] = useState(() => startRound('ten-frame', createTenFrameRounds(), 0))
  const { mode, rounds, roundIndex, slots, hops, answer, placing, check } = session
  const round = rounds[roundIndex]
  const { problem } = round
  const subtraction = problem.operation === 'subtract'
  const symbol = subtraction ? '−' : '+'
  const locked = Boolean(round.predictFirst) && answer.trim() === ''
  const frameCount = framesFor(problem)
  const frameOneFull = slots.slice(0, FRAME_SIZE).every((slot) => slot !== null)
  const placedFirst = countCounters(slots, 'first')
  const placedSecond = countCounters(slots, 'second')
  const removedCount = countCounters(slots, 'removed')
  const lineHops = countHops(hops)
  const position = hops.length ? hops[hops.length - 1].to : problem.first
  const canComplete = check?.ok === true
  const hasNext = canComplete && roundIndex < rounds.length - 1

  const updateSession = (patch: Partial<Session>) => setSession((current) => ({ ...current, ...patch, check: null }))
  const tapSlot = (index: number) => setSession((current) => {
    const next = nextSlotFor(current.slots[index], current.placing, subtraction)
    if (next === undefined) return current
    return { ...current, check: null, slots: current.slots.map((slot, slotIndex) => (slotIndex === index ? next : slot)) }
  })
  const moveHop = (direction: 1 | -1) => setSession((current) => {
    const from = current.hops.length ? current.hops[current.hops.length - 1].to : current.rounds[current.roundIndex].problem.first
    const to = from + direction
    if (to < 0 || to > LINE_MAX) return current
    return { ...current, check: null, hops: [...current.hops, { from, to }] }
  })
  const switchMode = (next: Mode) => setSession((current) => startRound(next, current.rounds, current.roundIndex))
  const goToRound = (index: number) => setSession((current) => startRound(current.mode, current.rounds, index))
  const reset = () => setSession((current) => startRound(current.mode, createTenFrameRounds(), 0))
  const runCheck = () => setSession((current) => ({ ...current, check: evaluate(current) }))

  const answerField = <TextField
    label="Final answer"
    type="number"
    value={answer}
    onChange={(event) => updateSession({ answer: event.target.value })}
    inputProps={{ min: 0, max: LINE_MAX, 'aria-label': 'Final answer' }}
    sx={{ width: 200 }}
  />

  const tenFrameView = <Stack spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
    {Array.from({ length: frameCount }, (_, frameIndex) => <Box key={frameIndex} sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, p: 1.5, width: '100%', maxWidth: 340, border: 2, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.default' }}>
      {Array.from({ length: FRAME_SIZE }, (_, box) => {
        const index = frameIndex * FRAME_SIZE + box
        const slot = slots[index]
        const blockedByMakeTen = Boolean(round.makeTen) && frameIndex === 1 && !frameOneFull && slot === null
        const disabled = locked || blockedByMakeTen || (subtraction && slot === null)
        return <Box
          key={index}
          component="button"
          type="button"
          disabled={disabled}
          aria-label={`Frame ${frameIndex + 1}, box ${box + 1}${slot ? `, ${COUNTER_NAMES[slot]}` : ', empty'}`}
          onClick={() => tapSlot(index)}
          sx={{ aspectRatio: '1 / 1', p: 0, border: 2, borderColor: 'divider', borderRadius: 1.5, backgroundColor: 'background.paper', cursor: disabled ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', opacity: disabled && slot === null ? 0.5 : 1 }}
        >
          {slot && <Counters kind={slot} />}
        </Box>
      })}
    </Box>)}
    {subtraction
      ? <Typography sx={{ fontWeight: 700 }}>Removed: {removedCount} · Remaining: {placedFirst}</Typography>
      : <>
        <Typography variant="body2" color="text.secondary">Counters on the frame: {placedFirst + placedSecond}</Typography>
        <Typography variant="h5" sx={{ fontFamily: 'monospace' }}>{placedFirst} + {placedSecond} = {placedFirst + placedSecond}</Typography>
        <ToggleButtonGroup exclusive size="small" value={placing} onChange={(_, next: 'first' | 'second' | null) => next && setSession((current) => ({ ...current, placing: next }))} aria-label="Counter color">
          <ToggleButton value="first"><Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COUNTER_COLORS.first, mr: 1 }} />Place {problem.first}</ToggleButton>
          <ToggleButton value="second"><Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COUNTER_COLORS.second, mr: 1 }} />Place {problem.second}</ToggleButton>
        </ToggleButtonGroup>
      </>}
  </Stack>

  const numberLineView = <Stack spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
    <Box component="svg" viewBox="0 0 440 170" role="img" aria-label={`Number line with marker at ${position}`} sx={{ width: '100%', maxWidth: 560, height: 190, backgroundColor: 'background.default', borderRadius: 2 }}>
      <line x1={lineX(0)} x2={lineX(LINE_MAX)} y1="110" y2="110" stroke="currentColor" strokeWidth="3" />
      {LINE_NUMBERS.map((value) => <g key={value}>
        <line x1={lineX(value)} x2={lineX(value)} y1="102" y2="118" stroke="currentColor" strokeWidth="2" />
        <text x={lineX(value)} y="146" textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor">{value}</text>
      </g>)}
      {hops.map((hop, index) => <path
        key={index}
        d={`M ${lineX(hop.from)} 100 Q ${(lineX(hop.from) + lineX(hop.to)) / 2} 20 ${lineX(hop.to)} 100`}
        fill="none"
        stroke={hop.to > hop.from ? 'var(--mui-palette-primary-main)' : '#e94f64'}
        strokeWidth="3"
        strokeLinecap="round"
      />)}
      <circle cx={lineX(position)} cy="110" r="9" fill="var(--mui-palette-primary-main)" />
    </Box>
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" disabled={locked || position <= 0} onClick={() => moveHop(-1)}>Backward −1</Button>
      <Button variant="contained" disabled={locked || position >= LINE_MAX} onClick={() => moveHop(1)}>Forward +1</Button>
    </Stack>
    <Typography variant="h5" sx={{ fontFamily: 'monospace' }}>
      {[String(problem.first), lineHops.forward ? `+ ${lineHops.forward}` : '', lineHops.backward ? `− ${lineHops.backward}` : ''].filter(Boolean).join(' ')} = {position}
    </Typography>
  </Stack>

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.5}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">{topic.activity}</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`Round ${roundIndex + 1} of ${rounds.length}`} size="small" color="primary" />
        <Chip label={round.label} size="small" variant="outlined" />
      </Stack>
      <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, next: Mode | null) => next && switchMode(next)} aria-label="Activity mode">
        <ToggleButton value="ten-frame">Ten Frame</ToggleButton>
        <ToggleButton value="number-line">Number Line</ToggleButton>
      </ToggleButtonGroup>
      <Typography variant="h4" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{problem.first} {symbol} {problem.second} = ?</Typography>
      {round.makeTen && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Make ten: fill the first frame to 10 before placing the rest.</Typography>}
      {round.predictFirst && <Typography variant="body2" color={locked ? 'warning.dark' : 'text.secondary'} sx={{ textAlign: 'center', fontWeight: locked ? 700 : 400 }}>
        {locked ? 'Predict first: type your answer to unlock the model.' : 'Prediction made. Use the model to check it.'}
      </Typography>}
      {round.predictFirst && answerField}
      {mode === 'ten-frame' ? tenFrameView : numberLineView}
      {!round.predictFirst && answerField}
      {check && <Typography role="status" color={check.ok ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700 }}>{check.message}</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Button variant="outlined" onClick={runCheck}>Check Activity</Button>
        <Button variant="contained" disabled={!canComplete} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
        {hasNext && <Button variant="outlined" onClick={() => goToRound(roundIndex + 1)} endIcon={<ArrowForwardIcon />}>Next problem</Button>}
        <Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
      </Stack>
    </Stack>
  </Paper>
}

export default TenFrameBuilderActivity
