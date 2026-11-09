import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'
import {
  COLS,
  ROWS,
  SHAPE_NAMES,
  type Point,
  type Round,
  type ShapeName,
  type Stage,
  clamp,
  cornerAngles,
  createRound,
  describeSpec,
  evaluateShape,
  formatLength,
  parkedPoints,
  rightCorners,
  sideLengths,
  sidesOf,
} from './shape-geometry'
import { CoordinateGridLines, DraggableVertex } from './coordinate-grid-primitives'

const CELL = 25
const WIDTH = COLS * CELL
const HEIGHT = ROWS * CELL

const shapeIcons: Record<ShapeName, string> = { triangle: '△', square: '□', rectangle: '▭', pentagon: '⬠', hexagon: '⬡' }
const STAGE_TITLES: Record<Stage, string> = { build: 'Build from scratch', fix: 'Fix the shape', name: 'Name this shape' }

const centroid = (points: Point[]): Point => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
})

const unit = (from: Point, to: Point): Point => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  return { x: dx / length, y: dy / length }
}

const ShapeBuilderActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState<Round>(() => createRound(0))
  const [pickedShape, setPickedShape] = useState<ShapeName>(round.spec.shape)
  const [points, setPoints] = useState<Point[]>(round.points)
  const [dragging, setDragging] = useState<number | null>(null)
  const [answerName, setAnswerName] = useState<ShapeName | null>(null)
  const [answerSides, setAnswerSides] = useState('')
  const [checked, setChecked] = useState(false)

  const isName = round.stage === 'name'
  const checks = isName ? [] : evaluateShape(points, round.spec)
  const nameProblems: string[] = []
  if (answerName === null) nameProblems.push('Choose the name of the shape.')
  else if (answerName !== round.spec.shape) nameProblems.push(`This shape is not a ${answerName}.`)
  if (answerSides.trim() === '') nameProblems.push('Type how many sides the shape has.')
  else if (Number(answerSides) !== sidesOf(round.spec.shape)) nameProblems.push(`You entered ${answerSides} sides. Count the corners again.`)
  const problems = isName ? nameProblems : checks.filter((check) => check.status === 'fail').map((check) => check.problem)
  const passing = problems.length === 0

  const angles = cornerAngles(points)
  const right = rightCorners(points)
  const lengths = sideLengths(points)
  const center = centroid(points)
  const polygon = points.map((point) => `${point.x * CELL},${point.y * CELL}`).join(' ')
  const instruction = isName
    ? 'Look at the finished shape, then pick its name and type how many sides it has.'
    : round.stage === 'build'
      ? `Build ${describeSpec(round.spec)}. Drag each dot onto a grid point.`
      : `Move the dots so the shape is ${describeSpec(round.spec)}.`

  const loadRound = (index: number) => {
    const next = createRound(index)
    setRoundIndex(index)
    setRound(next)
    setPickedShape(next.spec.shape)
    setPoints(next.points)
    setDragging(null)
    setAnswerName(null)
    setAnswerSides('')
    setChecked(false)
  }

  const pickShape = (shape: ShapeName) => {
    if (shape === pickedShape) return
    setPickedShape(shape)
    setPoints(parkedPoints(sidesOf(shape)))
    setChecked(false)
  }

  const toGrid = (event: PointerEvent<SVGSVGElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect()
    return {
      x: clamp(Math.round(((event.clientX - box.left) / box.width) * COLS), 0, COLS),
      y: clamp(Math.round(((event.clientY - box.top) / box.height) * ROWS), 0, ROWS),
    }
  }

  const startDrag = (event: PointerEvent<SVGCircleElement>, index: number) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(index)
  }

  const moveDot = (event: PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return
    const next = toGrid(event)
    setPoints((current) => {
      const existing = current[dragging]
      if (existing.x === next.x && existing.y === next.y) return current
      return current.map((point, index) => (index === dragging ? next : point))
    })
    setChecked(false)
  }

  const stopDrag = () => setDragging(null)

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box>
          <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
          <Typography variant="h5">{topic.activity}</Typography>
          <Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography>
        </Box>
        <Chip label="Foundation" color="primary" sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="h6">Round {roundIndex + 1}: {STAGE_TITLES[round.stage]}</Typography>
        <Typography variant="body2" color="text.secondary">{instruction}</Typography>

        {!isName && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {SHAPE_NAMES.map((name) => (
              <Button key={name} variant={pickedShape === name ? 'contained' : 'outlined'} onClick={() => pickShape(name)}>
                {shapeIcons[name]} {name}
              </Button>
            ))}
          </Stack>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <Paper elevation={0} sx={{ flex: 1, minWidth: 0, width: '100%', border: 1, borderColor: passing ? 'success.main' : 'divider', overflow: 'hidden' }}>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label={isName ? 'Finished shape' : `Shape canvas with ${points.length} dots on a grid`}
              style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'none', backgroundColor: '#fff' }}
              onPointerMove={moveDot}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            >
              <CoordinateGridLines columns={COLS} rows={ROWS} cellSize={CELL} />
              <polygon points={polygon} fill="var(--mui-palette-primary-main)" fillOpacity={0.18} stroke="var(--mui-palette-primary-main)" strokeWidth={3} strokeLinejoin="round" />

              {!isName && points.map((point, index) => {
                const next = points[(index + 1) % points.length]
                const mid = { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 }
                const outward = unit(center, mid)
                const labelX = mid.x * CELL + outward.x * 22
                const labelY = mid.y * CELL + outward.y * 22
                return (
                  <g key={`side-${index}`}>
                    <rect x={labelX - 18} y={labelY - 11} width={36} height={22} rx={11} fill="#fff" stroke="#1d6b5f" />
                    <text x={labelX} y={labelY + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1d6b5f">
                      {formatLength(lengths[index])}
                    </text>
                  </g>
                )
              })}

              {!isName && points.map((corner, index) => {
                const previous = points[(index - 1 + points.length) % points.length]
                const next = points[(index + 1) % points.length]
                const cx = corner.x * CELL
                const cy = corner.y * CELL
                const inward = unit(corner, center)
                const towardPrevious = unit(corner, previous)
                const towardNext = unit(corner, next)
                const markStart = { x: cx + towardPrevious.x * 14, y: cy + towardPrevious.y * 14 }
                const markInner = { x: markStart.x + towardNext.x * 14, y: markStart.y + towardNext.y * 14 }
                const markEnd = { x: cx + towardNext.x * 14, y: cy + towardNext.y * 14 }
                return (
                  <g key={`corner-${index}`}>
                    {right[index] && (
                      <path d={`M ${markStart.x} ${markStart.y} L ${markInner.x} ${markInner.y} L ${markEnd.x} ${markEnd.y}`} fill="none" stroke="#2e7d32" strokeWidth={2} />
                    )}
                    <text
                      x={cx + inward.x * 32}
                      y={cy + inward.y * 32 + 4}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={right[index] ? 800 : 500}
                      fill={right[index] ? '#2e7d32' : '#37474f'}
                    >
                      {Math.round(angles[index])}°
                    </text>
                  </g>
                )
              })}

              {points.map((point, index) => (
                <DraggableVertex
                  key={index}
                  cx={point.x * CELL}
                  cy={point.y * CELL}
                  radius={isName ? 5 : 9}
                  fill={isName ? '#1d6b5f' : 'var(--mui-palette-secondary-main)'}
                  cursor={isName ? 'default' : 'grab'}
                  onPointerDown={isName ? undefined : (event) => startDrag(event, index)}
                />
              ))}
            </svg>
          </Paper>

          <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            {isName ? (
              <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Name and count</Typography>
                <Stack spacing={2} sx={{ mt: 1.5 }}>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    aria-label="Shape name"
                    value={answerName}
                    onChange={(_, next: ShapeName | null) => {
                      setAnswerName(next)
                      setChecked(false)
                    }}
                  >
                    {SHAPE_NAMES.map((name) => (
                      <ToggleButton key={name} value={name} sx={{ textTransform: 'capitalize' }}>{name}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <TextField
                    type="number"
                    size="small"
                    label="Number of sides"
                    value={answerSides}
                    onChange={(event) => {
                      setAnswerSides(event.target.value)
                      setChecked(false)
                    }}
                    sx={{ maxWidth: 220 }}
                  />
                </Stack>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Properties</Typography>
                <Stack spacing={.75} sx={{ mt: 1 }}>
                  {checks.map((check) => (
                    <Stack key={check.id} direction="row" spacing={1} alignItems="center">
                      {check.status === 'pass' && <CheckCircleOutlineIcon fontSize="small" color="success" />}
                      {check.status === 'fail' && <CancelOutlinedIcon fontSize="small" color="error" />}
                      {check.status === 'not-required' && <RemoveCircleOutlineIcon fontSize="small" color="disabled" />}
                      <Typography variant="body2" color={check.status === 'not-required' ? 'text.disabled' : 'text.primary'}>
                        {check.label}
                        {check.status === 'not-required' ? ' (not required for this shape)' : ''}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 700 }}>Corner angles</Typography>
                <Stack direction="row" spacing={.75} flexWrap="wrap" sx={{ mt: .75 }}>
                  {angles.map((angle, index) => (
                    <Chip
                      key={index}
                      size="small"
                      label={`Corner ${index + 1}: ${Math.round(angle)}°${right[index] ? ' (right angle)' : ''}`}
                      color={right[index] ? 'success' : 'default'}
                      variant={right[index] ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Stack>

        {checked && (
          passing ? (
            <Typography role="status" color="success.main">Every check passes. Complete the activity or move to the next round.</Typography>
          ) : (
            <Stack role="status" spacing={.5}>
              {problems.map((problem) => <Typography key={problem} color="warning.main">{problem}</Typography>)}
            </Stack>
          )
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
          <Button variant="outlined" onClick={() => loadRound(roundIndex)} startIcon={<ReplayIcon />}>Reset</Button>
          <Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>
          <Button variant="contained" disabled={!passing} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
          <Button variant="text" disabled={!passing} onClick={() => loadRound(roundIndex + 1)}>Next round</Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default ShapeBuilderActivity
