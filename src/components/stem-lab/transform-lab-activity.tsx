import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, type PointerEvent, useState } from 'react'
import { CoordinateGridLines, DraggableVertex } from './coordinate-grid-primitives'
import { applyTransformations, createTransformRound, describeRule, type Point, type TransformRound, type Transformation } from './transform-lab-data'

type Props = { onComplete?: () => void }
type DraftPoint = { x: string; y: string }

const CELL = 24
const GRID_MIN = -8
const GRID_MAX = 8
const GRID_SIZE = (GRID_MAX - GRID_MIN) * CELL
const LETTERS = ['A', 'B', 'C', 'D']
const toSvgX = (x: number) => (x - GRID_MIN) * CELL
const toSvgY = (y: number) => (GRID_MAX - y) * CELL
const pointLabel = ({ x, y }: Point) => `(${x}, ${y})`
const toDrafts = (points: Point[]) => points.map(({ x, y }) => ({ x: String(x), y: String(y) }))
const parseDraft = ({ x, y }: DraftPoint): Point | null => {
  if (!/^-?\d+$/.test(x.trim()) || !/^-?\d+$/.test(y.trim())) return null
  const point = { x: Number(x), y: Number(y) }
  return point.x >= GRID_MIN && point.x <= GRID_MAX && point.y >= GRID_MIN && point.y <= GRID_MAX ? point : null
}
const samePoints = (a: Point[], b: Point[]) => a.length === b.length && a.every((point, index) => point.x === b[index].x && point.y === b[index].y)
const pointIn = (point: Point, transformation: Transformation) => {
  if (transformation.type === 'translation') return `(${point.x}${transformation.dx >= 0 ? '+' : '−'}${Math.abs(transformation.dx)}, ${point.y}${transformation.dy >= 0 ? '+' : '−'}${Math.abs(transformation.dy)})`
  return pointLabel(point)
}
const ruleExplanation = (transformations: Transformation[]) => transformations.map((transformation) => {
  if (transformation.type === 'translation') return `Translation: (x, y) → (x${transformation.dx >= 0 ? '+' : '−'}${Math.abs(transformation.dx)}, y${transformation.dy >= 0 ? '+' : '−'}${Math.abs(transformation.dy)})`
  if (transformation.type === 'reflection') return `Reflection across ${transformation.line === 'vertical' ? `x = ${transformation.k}` : `the ${transformation.line}`}`
  if (transformation.type === 'rotation') {
    const about = transformation.center.x === 0 && transformation.center.y === 0 ? 'the origin' : pointLabel(transformation.center)
    const turns = (transformation.angle / 90 * (transformation.direction === 'clockwise' ? -1 : 1) + 4) % 4
    const mapping = turns === 1 ? '(x, y) → (−y, x)' : turns === 3 ? '(x, y) → (y, −x)' : turns === 2 ? '(x, y) → (−x, −y)' : '(x, y) → (x, y)'
    return `Rotation ${transformation.angle}° ${transformation.direction} about ${about}: ${mapping}`
  }
  return `Dilation by ${transformation.scale} about ${pointLabel(transformation.center)}`
}).join('; then ')
const createInitialImage = (round: TransformRound) => round.mode === 'find-rule' ? applyTransformations(round.original, round.transformations) : round.mode === 'apply' ? round.original.map(({ x, y }) => ({ x: x + 1, y: y + 1 })) : []
const createInitialDrafts = (round: TransformRound) => round.mode === 'predict' ? round.original.map(() => ({ x: '', y: '' })) : toDrafts(createInitialImage(round))

const TransformLabActivity: FC<Props> = ({ onComplete }) => {
  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState<TransformRound>(() => createTransformRound(0))
  const [imagePoints, setImagePoints] = useState<Point[]>(() => createInitialImage(round))
  const [drafts, setDrafts] = useState<DraftPoint[]>(() => createInitialDrafts(round))
  const [selectedRule, setSelectedRule] = useState('')
  const [dragging, setDragging] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [completed, setCompleted] = useState(false)

  const expected = applyTransformations(round.original, round.transformations)
  const showImage = round.mode !== 'predict' || correct
  const expectedRule = describeRule(round.transformations)
  const translation = round.transformations.find((item) => item.type === 'translation')
  const dilation = round.transformations.find((item) => item.type === 'dilation')
  const ruleText = ruleExplanation(round.transformations)
  const imageForLines = round.mode === 'find-rule' ? expected : imagePoints
  const parsedDrafts = drafts.map(parseDraft)
  const answers = parsedDrafts.every((point): point is Point => point !== null) ? parsedDrafts as Point[] : []
  const coordinatesReady = answers.length === round.original.length

  const clearCheck = () => { setChecked(false); setCorrect(false); setFeedback(''); setCompleted(false) }
  const updateImagePoint = (index: number, point: Point) => {
    if (point.x < GRID_MIN || point.x > GRID_MAX || point.y < GRID_MIN || point.y > GRID_MAX) return
    setImagePoints((current) => current.map((item, itemIndex) => itemIndex === index ? point : item))
    setDrafts((current) => current.map((draft, itemIndex) => itemIndex === index ? { x: String(point.x), y: String(point.y) } : draft))
    clearCheck()
  }
  const onGridPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * (GRID_MAX - GRID_MIN) + GRID_MIN)
    const y = GRID_MAX - Math.round(((event.clientY - bounds.top) / bounds.height) * (GRID_MAX - GRID_MIN))
    updateImagePoint(dragging, { x, y })
  }
  const startDrag = (event: PointerEvent<SVGCircleElement>, index: number) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(index)
  }
  const loadRound = (index: number) => {
    const next = createTransformRound(index)
    setRoundIndex(index)
    setRound(next)
    setImagePoints(createInitialImage(next))
    setDrafts(createInitialDrafts(next))
    setSelectedRule('')
    setDragging(null)
    setChecked(false)
    setCorrect(false)
    setFeedback('')
    setCompleted(false)
  }
  const reset = () => loadRound(roundIndex)
  const checkActivity = () => {
    if (round.mode === 'find-rule') {
      const isCorrect = selectedRule === expectedRule
      setChecked(true)
      setCorrect(isCorrect)
      setFeedback(isCorrect ? 'Correct! You identified the transformation and its parameters.' : 'Choose the rule, including its direction, center, or scale factor.')
      return
    }
    const parsed = drafts.map(parseDraft)
    if (parsed.some((point) => point === null)) {
      setChecked(true)
      setCorrect(false)
      setFeedback(`Enter a whole-number coordinate from ${GRID_MIN} to ${GRID_MAX} for every vertex.`)
      return
    }
    const points = parsed as Point[]
    const isCorrect = samePoints(points, expected)
    setChecked(true)
    setCorrect(isCorrect)
    if (isCorrect) {
      setImagePoints(expected)
      setFeedback(round.mode === 'predict' ? 'Correct prediction! Watch the image move to its new coordinates.' : 'Correct! Every image vertex matches the computed transformation.')
      return
    }
    const wrongIndex = points.findIndex((point, index) => point.x !== expected[index].x || point.y !== expected[index].y)
    const transformation = round.transformations[0]
    const label = LETTERS[wrongIndex]
    if (round.transformations.length === 1 && transformation.type === 'translation') {
      setFeedback(`${label} is at ${pointLabel(points[wrongIndex])}. After a translation of (${transformation.dx >= 0 ? '+' : '−'}${Math.abs(transformation.dx)}, ${transformation.dy >= 0 ? '+' : '−'}${Math.abs(transformation.dy)}), it should be at ${pointLabel(expected[wrongIndex])}.`)
    } else {
      setFeedback(`${label} should be at ${pointLabel(expected[wrongIndex])} after ${describeRule(round.transformations).toLowerCase()}.`)
    }
  }

  const prompt = round.mode === 'apply'
    ? `Apply this rule by moving the image vertices: ${describeRule(round.transformations)}.`
    : round.mode === 'find-rule'
      ? 'Look at the original and image. Which rule and parameters transformed the shape?'
      : `Predict each image vertex before it moves. ${ruleText}`

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}><Chip label="Platform engine" color="primary" variant="outlined" /><Chip label="Core" color="primary" /><Chip label="Grade 8" variant="outlined" /></Stack><Typography variant="h5">Transform Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Move, flip, turn and resize shapes on a coordinate grid.</Typography></Box>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap"><Chip label={`Round ${roundIndex + 1} · ${round.mode === 'apply' ? 'Apply it' : round.mode === 'find-rule' ? 'Find the rule' : 'Predict'}`} color="secondary" /><Typography variant="body2" color="text.secondary">{round.original.length}-vertex {round.original.length === 3 ? 'triangle' : 'quadrilateral'}</Typography></Stack>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{prompt}</Typography>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Paper elevation={0} sx={{ flex: 1, minWidth: 0, width: '100%', border: 1, borderColor: correct ? 'success.main' : 'divider', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`} role="img" aria-label="Coordinate grid with original shape and transformed image" style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'none', backgroundColor: '#fff' }} onPointerMove={onGridPointerMove} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)}>
            <CoordinateGridLines columns={16} rows={16} cellSize={CELL} axisColumn={8} axisRow={8} />
            {Array.from({ length: 17 }, (_, index) => { const value = index - 8; return <g key={`axis-${value}`} aria-hidden="true"><text x={toSvgX(value)} y={GRID_SIZE - 3} textAnchor="middle" fontSize={9} fill="#526d82">{value}</text><text x={3} y={toSvgY(value) + 3} textAnchor="start" fontSize={9} fill="#526d82">{value}</text></g> })}
            {dilation && showImage && imageForLines.map((point, index) => <line key={`dilation-${index}`} x1={toSvgX(round.original[index].x)} y1={toSvgY(round.original[index].y)} x2={toSvgX(point.x)} y2={toSvgY(point.y)} stroke="#e9a227" strokeWidth={2} strokeDasharray="5 4" />)}
            <polygon points={round.original.map(({ x, y }) => `${toSvgX(x)},${toSvgY(y)}`).join(' ')} fill="#4a90e2" fillOpacity={.16} stroke="#3572b6" strokeWidth={3} strokeLinejoin="round" />
            {showImage && imageForLines.length > 0 && <polygon points={imageForLines.map(({ x, y }) => `${toSvgX(x)},${toSvgY(y)}`).join(' ')} fill="#1d8a76" fillOpacity={.14} stroke="#1d8a76" strokeWidth={3} strokeDasharray={round.mode === 'find-rule' ? 'none' : '7 3'} strokeLinejoin="round" />}
            {round.original.map((point, index) => <g key={`original-${index}`} aria-label={`Original vertex ${LETTERS[index]} ${pointLabel(point)}`}><DraggableVertex cx={toSvgX(point.x)} cy={toSvgY(point.y)} fill="#3572b6" cursor="default" /><text x={toSvgX(point.x) + 8} y={toSvgY(point.y) - 8} fontSize={12} fontWeight={800} fill="#244f7e">{LETTERS[index]}</text></g>)}
            {showImage && imageForLines.map((point, index) => <g key={`image-${index}`} aria-label={`Image vertex ${LETTERS[index]}' ${pointLabel(point)}`}><DraggableVertex cx={toSvgX(point.x)} cy={toSvgY(point.y)} fill="#1d8a76" stroke={round.mode === 'apply' ? '#fff' : '#1d8a76'} cursor={round.mode === 'apply' ? 'grab' : 'default'} onPointerDown={round.mode === 'apply' ? (event) => startDrag(event, index) : undefined} /><text x={toSvgX(point.x) + 8} y={toSvgY(point.y) - 8} fontSize={12} fontWeight={800} fill="#126856">{LETTERS[index]}&apos;</text></g>)}
          </svg>
          <Stack direction="row" justifyContent="space-between" sx={{ px: 1, py: .5 }}><Typography variant="caption" color="text.secondary">x-axis →</Typography><Typography variant="caption" color="text.secondary">y-axis ↑</Typography></Stack>
        </Paper>
        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Live vertex coordinates</Typography><Stack spacing={.5} sx={{ mt: .75 }}>{round.original.map((point, index) => <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>{LETTERS[index]} {pointLabel(point)}{translation && <> → {pointIn(point, translation)}</>}{showImage && imageForLines[index] && <> · {LETTERS[index]}&apos; {pointLabel(imageForLines[index])}</>}</Typography>)}</Stack></Paper>
          {dilation && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Dilation side-length ratio</Typography><Typography variant="body2">Image ÷ original = {dilation.scale} : 1</Typography><Typography variant="caption" color="text.secondary">Each dashed segment joins a vertex to its image.</Typography></Paper>}
          {round.mode === 'find-rule' && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Choose the rule</Typography><Stack spacing={.75}>{round.ruleChoices.map((choice) => <Button key={choice} variant={selectedRule === choice ? 'contained' : 'outlined'} onClick={() => { setSelectedRule(choice); setChecked(false); setCorrect(false); setFeedback(''); setCompleted(false) }} sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}>{choice}</Button>)}</Stack></Paper>}
          {round.mode !== 'find-rule' && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{round.mode === 'predict' ? 'Predict image coordinates' : 'Edit image coordinates'}</Typography><Stack spacing={.75} sx={{ mt: 1 }}>{drafts.map((draft, index) => <Stack key={index} direction="row" spacing={1} alignItems="center"><Typography variant="body2" sx={{ width: 24, fontWeight: 800 }}>{LETTERS[index]}′</Typography><TextField size="small" label="x" type="number" value={draft.x} onChange={(event) => { const next = drafts.map((item, itemIndex) => itemIndex === index ? { ...item, x: event.target.value } : item); setDrafts(next); const parsed = parseDraft(next[index]); if (parsed) setImagePoints((current) => current.map((point, pointIndex) => pointIndex === index ? parsed : point)); clearCheck() }} inputProps={{ min: GRID_MIN, max: GRID_MAX, step: 1 }} /><TextField size="small" label="y" type="number" value={draft.y} onChange={(event) => { const next = drafts.map((item, itemIndex) => itemIndex === index ? { ...item, y: event.target.value } : item); setDrafts(next); const parsed = parseDraft(next[index]); if (parsed) setImagePoints((current) => current.map((point, pointIndex) => pointIndex === index ? parsed : point)); clearCheck() }} inputProps={{ min: GRID_MIN, max: GRID_MAX, step: 1 }} /></Stack>)}</Stack></Paper>}
        </Stack>
      </Stack>

      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'warning.main', backgroundColor: correct ? 'success.light' : 'warning.light' }}><Typography color={correct ? 'success.dark' : 'warning.dark'} sx={{ fontWeight: 700 }}>{feedback}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={checkActivity} disabled={round.mode === 'find-rule' ? !selectedRule : !coordinatesReady}>Check Activity</Button>{correct && roundIndex < 7 && <Button variant="contained" color="success" onClick={() => loadRound(roundIndex + 1)}>Next Round</Button>}{roundIndex === 7 && <Button variant="contained" color="success" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />}>{completed ? 'Completed' : 'Complete Activity'}</Button>}</Stack>
    </Stack>
  </Paper>
}

export default TransformLabActivity
