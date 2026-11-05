import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

const TICK = 30
const PAD = 24
const WORKSPACE_TICKS = 22
const RULER_TICKS = 12
const RULER_MAX_TICK = WORKSPACE_TICKS - RULER_TICKS

const OBJECTS = [
  { name: 'pencil', color: '#f2c14e' },
  { name: 'crayon', color: '#e4572e' },
  { name: 'eraser', color: '#f4a6b7' },
  { name: 'key', color: '#9aa5b1' },
  { name: 'leaf', color: '#5fa052' },
]

const STAGES = ['units-from-zero', 'units-offset', 'centimeters', 'compare'] as const
type Stage = (typeof STAGES)[number]
const STAGE_TITLES: Record<Stage, string> = {
  'units-from-zero': 'Units from zero',
  'units-offset': 'Units from an offset start',
  centimeters: 'Centimeters',
  compare: 'Compare two objects',
}

type Bar = { name: string; color: string; start: number; length: number }
type Round = { stage: Stage; bars: Bar[] }

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const randomObject = () => OBJECTS[randomInt(0, OBJECTS.length - 1)]

const createRound = (index: number): Round => {
  const stage = STAGES[Math.min(index, STAGES.length - 1)]
  if (stage === 'compare') {
    const first = randomObject()
    const second = OBJECTS[(OBJECTS.indexOf(first) + randomInt(1, OBJECTS.length - 1)) % OBJECTS.length]
    const start = randomInt(0, RULER_MAX_TICK)
    const firstLength = randomInt(2, 9)
    let secondLength = randomInt(2, 9)
    while (secondLength === firstLength) secondLength = randomInt(2, 9)
    return { stage, bars: [{ ...first, start, length: firstLength }, { ...second, start, length: secondLength }] }
  }
  if (stage === 'units-from-zero') return { stage, bars: [{ ...randomObject(), start: 0, length: randomInt(2, 9) }] }
  if (stage === 'units-offset') return { stage, bars: [{ ...randomObject(), start: randomInt(2, RULER_MAX_TICK), length: randomInt(2, 9) }] }
  return { stage, bars: [{ ...randomObject(), start: randomInt(1, RULER_MAX_TICK), length: randomInt(3, 12) }] }
}

const startingRulerTick = (round: Round) => (round.bars[0].start === 0 ? RULER_MAX_TICK : 0)

const checkRound = (round: Round, rulerTick: number, answer: string, choice: string | null) => {
  const problems: string[] = []
  const { bars } = round
  if (rulerTick !== bars[0].start) problems.push(`The ruler’s 0 isn’t at the start of the ${bars.map((bar) => bar.name).join(' and ')}.`)

  if (round.stage !== 'compare') {
    const [bar] = bars
    if (answer.trim() === '') problems.push(`Type the length of the ${bar.name}.`)
    else if (Number(answer) !== bar.length) problems.push(`You typed ${answer}, but the ${bar.name} ends at ${bar.length}.`)
    return problems
  }

  const [first, second] = bars
  const longer = first.length > second.length ? first : second
  const difference = Math.abs(first.length - second.length)
  if (choice !== longer.name) problems.push('Choose the object whose end sits farther along the ruler.')
  if (answer.trim() === '') problems.push('Type how many units longer it is.')
  else if (Number(answer) !== difference) problems.push(`You typed ${answer}, but the difference is ${difference} units.`)
  return problems
}

const MeasurementRulerActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0))
  const [rulerTick, setRulerTick] = useState(() => startingRulerTick(round))
  const [answer, setAnswer] = useState('')
  const [choice, setChoice] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const dragStart = useRef<{ pointerX: number; startTick: number } | null>(null)

  const problems = checkRound(round, rulerTick, answer, choice)
  const isCorrect = problems.length === 0
  const isCompare = round.stage === 'compare'
  const unit = round.stage === 'centimeters' ? 'centimeters' : 'units'
  const instruction = isCompare
    ? 'Drag the ruler so 0 sits on the start of both objects. Which one is longer, and how many units longer is it?'
    : `Drag the ruler so 0 sits on the start of the ${round.bars[0].name}. Then type its length in ${unit}.`

  const loadRound = (index: number) => {
    const next = createRound(index)
    setRoundIndex(index)
    setRound(next)
    setRulerTick(startingRulerTick(next))
    setAnswer('')
    setChoice(null)
    setChecked(false)
  }

  const moveRuler = (tick: number) => {
    const next = clamp(tick, 0, RULER_MAX_TICK)
    if (next === rulerTick) return
    setRulerTick(next)
    setChecked(false)
  }

  const startRulerDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { pointerX: event.clientX, startTick: rulerTick }
  }

  const dragRuler = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start) return
    moveRuler(start.startTick + Math.round((event.clientX - start.pointerX) / TICK))
  }

  const endRulerDrag = () => {
    dragStart.current = null
  }

  const onRulerKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveRuler(rulerTick - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveRuler(rulerTick + 1)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box>
          <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
          <Typography variant="h5">{topic.activity}</Typography>
          <Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography>
        </Box>
        <Typography variant="h6">Round {roundIndex + 1}: {STAGE_TITLES[round.stage]}</Typography>
        <Typography variant="body2" color="text.secondary">{instruction}</Typography>

        <Box sx={{ overflowX: 'auto', borderRadius: 2, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}>
          <Box sx={{ position: 'relative', width: PAD * 2 + WORKSPACE_TICKS * TICK, height: 196 }}>
            {round.bars.map((bar, index) => (
              <Box
                key={bar.name}
                sx={{
                  position: 'absolute',
                  left: PAD + bar.start * TICK,
                  top: isCompare ? 24 + index * 46 : 44,
                  width: bar.length * TICK,
                  height: 34,
                  boxSizing: 'border-box',
                  backgroundColor: bar.color,
                  borderLeft: '4px solid #2d2d2d',
                  borderRight: '4px solid #2d2d2d',
                  borderRadius: 1,
                }}
              />
            ))}

            <Box
              role="slider"
              tabIndex={0}
              aria-label="Ruler, drag or use the left and right arrow keys"
              aria-valuemin={0}
              aria-valuemax={RULER_MAX_TICK}
              aria-valuenow={rulerTick}
              onPointerDown={startRulerDrag}
              onPointerMove={dragRuler}
              onPointerUp={endRulerDrag}
              onPointerCancel={endRulerDrag}
              onKeyDown={onRulerKey}
              sx={{
                position: 'absolute',
                left: PAD + rulerTick * TICK,
                top: 124,
                width: RULER_TICKS * TICK,
                height: 58,
                backgroundColor: '#f6b73c',
                boxShadow: 'inset 0 0 0 2px #a86b00',
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
                '&:active': { cursor: 'grabbing' },
                '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              }}
            >
              {Array.from({ length: RULER_TICKS }, (_, index) => (
                <Box
                  key={`cell-${index}`}
                  sx={{
                    position: 'absolute',
                    left: index * TICK,
                    top: 0,
                    width: TICK,
                    height: '100%',
                    backgroundColor: unit === 'units' && index % 2 === 1 ? '#e9a93a' : 'transparent',
                  }}
                />
              ))}
              {Array.from({ length: RULER_TICKS + 1 }, (_, index) => (
                <Box key={`tick-${index}`}>
                  <Box sx={{ position: 'absolute', left: index * TICK - 1, top: 0, width: 2, height: 14, backgroundColor: '#5a3a00' }} />
                  <Typography sx={{ position: 'absolute', left: index * TICK, top: 18, transform: 'translateX(-50%)', fontSize: 18, fontWeight: 800, lineHeight: 1, color: '#3d2600' }}>
                    {index}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {isCompare ? (
          <Stack spacing={2}>
            <ToggleButtonGroup
              exclusive
              size="small"
              aria-label="Longer object"
              value={choice}
              onChange={(_, next: string | null) => {
                setChoice(next)
                setChecked(false)
              }}
            >
              {round.bars.map((bar) => <ToggleButton key={bar.name} value={bar.name}>The {bar.name} is longer</ToggleButton>)}
            </ToggleButtonGroup>
            <TextField
              type="number"
              size="small"
              label="How many units longer?"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value)
                setChecked(false)
              }}
              sx={{ maxWidth: 260 }}
            />
          </Stack>
        ) : (
          <TextField
            type="number"
            size="small"
            label={`Length in ${unit}`}
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value)
              setChecked(false)
            }}
            sx={{ maxWidth: 260 }}
          />
        )}

        {checked && (
          isCorrect ? (
            <Typography role="status" color="success.main">Correct. Complete the activity or move to the next round.</Typography>
          ) : (
            <Stack role="status" spacing={.5}>
              {problems.map((problem) => <Typography key={problem} color="warning.main">{problem}</Typography>)}
            </Stack>
          )
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
          <Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>
          <Button variant="contained" disabled={!isCorrect} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
          <Button variant="outlined" onClick={() => loadRound(roundIndex)} startIcon={<ReplayIcon />}>Reset</Button>
          <Button variant="text" disabled={!isCorrect} onClick={() => loadRound(roundIndex + 1)}>Next round</Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default MeasurementRulerActivity
