import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type ReactNode, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'
import { type BalanceCheck, type BalanceKind, type BalanceRound, checkBalance, createBalanceRounds, type Relation, type Side } from './number-balance-problems'

type NumberBalanceActivityProps = { topic: MathTopic; onComplete?: () => void }

type Session = {
  rounds: BalanceRound[]
  roundIndex: number
  left: number
  right: number
  relation: Relation | null
  heavier: Side | null
  check: BalanceCheck | null
}

const MAX_BLOCKS = 20
const TILT_PER_BLOCK = 4
const MAX_TILT = 20
const PIVOT_X = 240
const PIVOT_Y = 110
const BEAM_HALF = 160
const PAN_DROP = 90
const BEAM_COLOR = '#5d4200'
const PAN_COLOR = '#c9a227'
const BLOCK_COLORS: Record<Side, string> = { left: '#4f8cff', right: '#107d6f' }
const RELATIONS: Relation[] = ['>', '<', '=']
const RELATION_NAMES: Record<Relation, string> = { '>': 'Greater than', '<': 'Less than', '=': 'Equal to' }
const SIDES: Side[] = ['left', 'right']

const clampBlocks = (value: number) => Math.min(MAX_BLOCKS, Math.max(0, value))
const editableSides = (kind: BalanceKind): Side[] => (kind === 'build' ? SIDES : kind === 'make-equal' ? ['right'] : [])

const startRound = (rounds: BalanceRound[], roundIndex: number): Session => {
  const { kind, pair } = rounds[roundIndex]
  const empty = kind === 'build'
  return { rounds, roundIndex, left: empty ? 0 : pair.left, right: empty ? 0 : pair.right, relation: null, heavier: null, check: null }
}

const SeesawPan: FC<{ side: Side; count: number; x: number; y: number; highlighted: boolean }> = ({ side, count, x, y, highlighted }) => <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform .35s ease' }}>
  <line x1={0} y1={0} x2={-50} y2={PAN_DROP} stroke={BEAM_COLOR} strokeWidth={2} />
  <line x1={0} y1={0} x2={50} y2={PAN_DROP} stroke={BEAM_COLOR} strokeWidth={2} />
  <rect x={-55} y={PAN_DROP} width={110} height={8} rx={4} fill={PAN_COLOR} stroke={highlighted ? 'var(--mui-palette-primary-main)' : 'none'} strokeWidth={3} />
  {Array.from({ length: count }, (_, index) => <rect key={index} x={-53 + (index % 5) * 22} y={PAN_DROP - 14 - Math.floor(index / 5) * 17} width={18} height={14} rx={3} fill={BLOCK_COLORS[side]} />)}
  <text x={0} y={PAN_DROP + 32} textAnchor="middle" fontSize={22} fontWeight={700} fill="currentColor">{count}</text>
</g>

const NumberBalanceActivity: FC<NumberBalanceActivityProps> = ({ topic, onComplete }) => {
  const [session, setSession] = useState(() => startRound(createBalanceRounds(), 0))
  const { rounds, roundIndex, left, right, relation, heavier, check } = session
  const round = rounds[roundIndex]
  const { kind, pair } = round
  const editable = editableSides(kind)
  const canComplete = check?.ok === true
  const hasNext = canComplete && roundIndex < rounds.length - 1

  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, (right - left) * TILT_PER_BLOCK))
  const radians = (tilt * Math.PI) / 180
  const leftEnd = { x: PIVOT_X - BEAM_HALF * Math.cos(radians), y: PIVOT_Y - BEAM_HALF * Math.sin(radians) }
  const rightEnd = { x: PIVOT_X + BEAM_HALF * Math.cos(radians), y: PIVOT_Y + BEAM_HALF * Math.sin(radians) }

  const changeBlocks = (side: Side, delta: number) => setSession((current) => (side === 'left'
    ? { ...current, left: clampBlocks(current.left + delta), check: null }
    : { ...current, right: clampBlocks(current.right + delta), check: null }))
  const chooseRelation = (next: Relation) => setSession((current) => ({ ...current, relation: next, check: null }))
  const chooseHeavier = (side: Side) => setSession((current) => ({ ...current, heavier: side, check: null }))
  const goToRound = (index: number) => setSession((current) => startRound(current.rounds, index))
  const reset = () => setSession(startRound(createBalanceRounds(), 0))
  const runCheck = () => setSession((current) => ({
    ...current,
    check: checkBalance(current.rounds[current.roundIndex], { left: current.left, right: current.right, relation: current.relation, heavier: current.heavier }),
  }))

  const prompt = kind === 'build'
    ? `Build ${pair.left} blocks on the left pan and ${pair.right} on the right.`
    : kind === 'compare'
      ? 'Choose the symbol that compares the two pans.'
      : kind === 'which-side'
        ? 'Which side has more? Tap that pan.'
        : `The left pan has ${pair.left} blocks. Add blocks to the right pan until the seesaw balances.`

  const sideGrid = (render: (side: Side) => ReactNode) => <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, width: '100%', maxWidth: 560 }}>
    {SIDES.map((side) => <Stack key={side} spacing={1} alignItems="center">{render(side)}</Stack>)}
  </Box>

  const blockControls = (side: Side): ReactNode => editable.includes(side)
    ? <>
      <Button variant="contained" onClick={() => changeBlocks(side, 1)} aria-label={`Add a block to the ${side} pan`} sx={{ width: '100%' }}>+ Add to {side}</Button>
      <Button variant="outlined" onClick={() => changeBlocks(side, -1)} aria-label={`Remove a block from the ${side} pan`} sx={{ width: '100%' }}>− Remove from {side}</Button>
    </>
    : <Typography variant="body2" color="text.secondary">Fixed pan</Typography>

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.5} alignItems="center">
      <Box sx={{ width: '100%' }}>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">{topic.activity}</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
        <Chip label={`Round ${roundIndex + 1} of ${rounds.length}`} size="small" color="primary" />
        <Chip label={round.label} size="small" variant="outlined" />
      </Stack>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{prompt}</Typography>
      {kind === 'compare' && <Typography variant="h4" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{pair.left} ? {pair.right}</Typography>}
      <Box component="svg" viewBox="0 0 480 300" role="img" aria-label={`Seesaw with ${left} blocks on the left pan and ${right} blocks on the right pan`} sx={{ width: '100%', maxWidth: 560, height: 'auto', backgroundColor: 'background.default', borderRadius: 2 }}>
        <polygon points={`${PIVOT_X},${PIVOT_Y} ${PIVOT_X - 22},250 ${PIVOT_X + 22},250`} fill={BEAM_COLOR} />
        <rect x={PIVOT_X - 50} y={250} width={100} height={8} rx={4} fill={BEAM_COLOR} />
        <line x1={PIVOT_X - BEAM_HALF} x2={PIVOT_X + BEAM_HALF} y1={PIVOT_Y} y2={PIVOT_Y} stroke={BEAM_COLOR} strokeWidth={8} strokeLinecap="round" style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`, transition: 'transform .35s ease' }} />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={7} fill={BEAM_COLOR} />
        <SeesawPan side="left" count={left} x={leftEnd.x} y={leftEnd.y} highlighted={heavier === 'left'} />
        <SeesawPan side="right" count={right} x={rightEnd.x} y={rightEnd.y} highlighted={heavier === 'right'} />
      </Box>
      {kind === 'which-side'
        ? sideGrid((side) => <Button variant={heavier === side ? 'contained' : 'outlined'} onClick={() => chooseHeavier(side)} sx={{ width: '100%' }}>Tap {side} pan</Button>)
        : kind === 'compare'
          ? <ToggleButtonGroup exclusive value={relation} onChange={(_, next: Relation | null) => next && chooseRelation(next)} aria-label="Choose greater than, less than, or equal to">
            {RELATIONS.map((symbol) => <ToggleButton key={symbol} value={symbol} aria-label={RELATION_NAMES[symbol]} sx={{ px: 3, fontSize: 24, fontWeight: 800 }}>{symbol}</ToggleButton>)}
          </ToggleButtonGroup>
          : sideGrid(blockControls)}
      {check && <Typography role="status" color={check.ok ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700, textAlign: 'center' }}>{check.message}</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Button variant="outlined" onClick={runCheck}>Check Activity</Button>
        <Button variant="contained" disabled={!canComplete} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
        {hasNext && <Button variant="outlined" onClick={() => goToRound(roundIndex + 1)} endIcon={<ArrowForwardIcon />}>Next problem</Button>}
        <Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
      </Stack>
    </Stack>
  </Paper>
}

export default NumberBalanceActivity
