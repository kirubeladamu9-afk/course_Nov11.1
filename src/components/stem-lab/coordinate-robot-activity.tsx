import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useEffect, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Point = { x: number; y: number }
type RoundType = 'Move' | 'Read' | 'Plan'
type Round = { start: Point; target: Point; walls: Point[]; type: RoundType; showReadout: boolean }
type Props = { topic: MathTopic; onComplete?: () => void }

const size = 8
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const wallKey = (point: Point) => `${point.x}-${point.y}`
const parsePoint = (value: string): Point | null => {
  const match = value.match(/^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/)
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null
}
const neighbors = (point: Point): Point[] => [
  { x: point.x + 1, y: point.y },
  { x: point.x - 1, y: point.y },
  { x: point.x, y: point.y + 1 },
  { x: point.x, y: point.y - 1 },
].filter(({ x, y }) => x >= 0 && x < size && y >= 0 && y < size)

const findPath = (start: Point, target: Point, walls: Set<string>): Point[] | null => {
  const queue: Point[][] = [[start]]
  const visited = new Set([wallKey(start)])
  while (queue.length) {
    const path = queue.shift()!
    const current = path[path.length - 1]
    if (same(current, target)) return path
    for (const next of neighbors(current)) {
      const key = wallKey(next)
      if (visited.has(key) || walls.has(key)) continue
      visited.add(key)
      queue.push([...path, next])
    }
  }
  return null
}

const roundTypeFor = (roundNumber: number): RoundType => {
  const progression: { through: number; type: RoundType }[] = [
    { through: 1, type: 'Move' },
    { through: 3, type: 'Move' },
    { through: 4, type: 'Move' },
    { through: Infinity, type: 'Read' },
  ]
  const stage = progression.find(({ through }) => roundNumber <= through)!
  if (roundNumber > 4) {
    const laterTypes: RoundType[] = ['Read', 'Plan', 'Move']
    return { ...stage, type: laterTypes[(roundNumber - 5) % laterTypes.length] }.type
  }
  return stage.type
}

const createRound = (roundNumber: number): Round => {
  const type = roundTypeFor(roundNumber)
  const showReadout = roundNumber <= 3
  const wallsEnabled = roundNumber >= 2
  const point = (): Point => ({ x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) })
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const start = point()
    let target = point()
    while (same(start, target)) target = point()
    const walls: Point[] = []
    if (wallsEnabled) {
      for (let index = 0; index < 7; index += 1) {
        const wall = point()
        if (!same(wall, start) && !same(wall, target) && !walls.some((item) => same(item, wall))) walls.push(wall)
      }
    }
    if (findPath(start, target, new Set(walls.map(wallKey)))) return { start, target, walls, type, showReadout }
  }
  return { start: { x: 0, y: 0 }, target: { x: 1, y: 0 }, walls: [], type, showReadout }
}

const CoordinateRobotActivity: FC<Props> = ({ topic, onComplete }) => {
  const [roundNumber, setRoundNumber] = useState(0)
  const [round, setRound] = useState(() => createRound(0))
  const [position, setPosition] = useState<Point>(round.start)
  const [coordinateInput, setCoordinateInput] = useState('')
  const [robotAnswer, setRobotAnswer] = useState('')
  const [flagAnswer, setFlagAnswer] = useState('')
  const [planInput, setPlanInput] = useState('')
  const [movement, setMovement] = useState<Point[]>([])
  const [runMessage, setRunMessage] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const wallSet = useMemo(() => new Set(round.walls.map(wallKey)), [round])

  useEffect(() => {
    if (!movement.length) return
    const timer = window.setTimeout(() => {
      setPosition(movement[0])
      setMovement((path) => path.slice(1))
    }, 140)
    return () => window.clearTimeout(timer)
  }, [movement])

  const move = (next: Point) => {
    if (movement.length || next.x < 0 || next.x >= size || next.y < 0 || next.y >= size || wallSet.has(wallKey(next))) return
    setPosition(next)
    setChecked(false)
    setCorrect(false)
    setFeedback('')
  }
  const step = (dx: number, dy: number) => move({ x: position.x + dx, y: position.y + dy })
  const walkTo = (target: Point) => {
    if (target.x < 0 || target.x >= size || target.y < 0 || target.y >= size) {
      setRunMessage('That coordinate is outside the grid.')
      return
    }
    const path = findPath(position, target, wallSet)
    if (!path) {
      setRunMessage('The walls block a path to that point.')
      return
    }
    setRunMessage('')
    setChecked(false)
    setCorrect(false)
    setFeedback('')
    setMovement(path.slice(1))
  }
  const sendToCoordinate = () => {
    const point = parsePoint(coordinateInput)
    if (point) walkTo(point)
    else setRunMessage('Enter a coordinate as (x, y), such as 4, 3.')
  }
  const runPlan = () => {
    const commands = planInput.match(/(?:right|left|up|down)\s+\d+/gi)
    if (!commands?.length || planInput.replace(/(?:right|left|up|down)\s+\d+/gi, '').replace(/[\s,]+/g, '')) {
      setRunMessage('Enter moves such as right 3, up 2.')
      return
    }
    let current = position
    const path: Point[] = []
    let collision = ''
    for (const command of commands) {
      const [, direction, countText] = command.match(/(right|left|up|down)\s+(\d+)/i)!
      const [dx, dy] = direction.toLowerCase() === 'right' ? [1, 0] : direction.toLowerCase() === 'left' ? [-1, 0] : direction.toLowerCase() === 'up' ? [0, 1] : [0, -1]
      for (let index = 0; index < Number(countText); index += 1) {
        const next = { x: current.x + dx, y: current.y + dy }
        if (next.x < 0 || next.x >= size || next.y < 0 || next.y >= size) { collision = 'The robot reached the edge of the grid and stopped.'; break }
        if (wallSet.has(wallKey(next))) { collision = 'A wall blocked the robot, so it stopped there.'; break }
        current = next
        path.push(next)
      }
      if (collision) break
    }
    setChecked(false)
    setCorrect(false)
    setFeedback('')
    setMovement(path)
    setRunMessage(collision)
  }
  const reset = () => {
    const nextRound = createRound(roundNumber)
    setRound(nextRound)
    setPosition(nextRound.start)
    setCoordinateInput('')
    setRobotAnswer('')
    setFlagAnswer('')
    setPlanInput('')
    setMovement([])
    setRunMessage('')
    setChecked(false)
    setCorrect(false)
    setCompleted(false)
    setFeedback('')
  }
  const nextRound = () => {
    const nextNumber = roundNumber + 1
    const next = createRound(nextNumber)
    setRoundNumber(nextNumber)
    setRound(next)
    setPosition(next.start)
    setCoordinateInput('')
    setRobotAnswer('')
    setFlagAnswer('')
    setPlanInput('')
    setMovement([])
    setRunMessage('')
    setChecked(false)
    setCorrect(false)
    setCompleted(false)
    setFeedback('')
  }
  const checkActivity = () => {
    let isCorrect = false
    let message = ''
    if (round.type === 'Read') {
      const robot = parsePoint(robotAnswer)
      const flag = parsePoint(flagAnswer)
      isCorrect = Boolean(robot && flag && same(robot, position) && same(flag, round.target))
      if (!robot || !same(robot, position)) {
        message = robot ? `You typed (${robot.x}, ${robot.y}). The robot is at ${position.x} across and ${position.y} up, so it’s (${position.x}, ${position.y}).` : `Enter the robot’s coordinates as (x, y).`
      } else if (!flag || !same(flag, round.target)) {
        message = flag ? `You typed (${flag.x}, ${flag.y}). The flag is ${round.target.x} across and ${round.target.y} up, so it’s (${round.target.x}, ${round.target.y}).` : `Enter the flag’s coordinates as (x, y).`
      }
    } else {
      isCorrect = same(position, round.target)
      if (!isCorrect) message = `The robot is at (${position.x}, ${position.y}). The flag is ${round.target.x} across and ${round.target.y} up, so it’s (${round.target.x}, ${round.target.y}).`
    }
    setChecked(true)
    setCorrect(isCorrect)
    setFeedback(isCorrect ? `Correct! ${round.type === 'Read' ? 'You read both ordered pairs accurately.' : `The robot reached (${round.target.x}, ${round.target.y}).`}` : message)
  }

  const prompt = round.type === 'Move'
    ? `Guide the robot to (${round.target.x}, ${round.target.y}).`
    : round.type === 'Read'
      ? 'Read the grid. Enter the robot’s coordinates and the flag’s coordinates as ordered pairs (x, y).'
      : `Plan a route to (${round.target.x}, ${round.target.y}). Enter moves, then press Run.`

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Plot and move points on a coordinate grid.</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{prompt}</Typography>
      {round.type !== 'Read' && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{round.type === 'Plan' ? 'The robot follows each move in order. Walls stop the robot.' : 'Use the arrows or tap an adjacent square. Walls block movement.'}</Typography>}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: .5 }}>
        <Stack direction="row" alignItems="center" spacing={.5} sx={{ pt: 2.5, pb: 3 }}><Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 700 }}>y-axis</Typography><Stack justifyContent="space-around">{Array.from({ length: size }, (_, index) => <Typography key={index} variant="caption" sx={{ height: 31, display: 'grid', placeItems: 'center', fontWeight: 700 }}>{size - 1 - index}</Typography>)}</Stack></Stack>
        <Box>
          <Box role="grid" aria-label="Coordinate grid" sx={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: 'min(78vw, 440px)', aspectRatio: '1', gap: .35, p: .75, border: 2, borderColor: checked && correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', boxShadow: checked && correct ? '0 0 24px rgba(46, 125, 50, .5)' : 'none' }}>
            {Array.from({ length: size * size }, (_, index) => { const x = index % size; const y = size - 1 - Math.floor(index / size); const point = { x, y }; const isWall = wallSet.has(wallKey(point)); const isTarget = same(point, round.target); const isCurrent = same(point, position); return <Box key={`${x}-${y}`} role="gridcell" aria-label={`Coordinate (${x}, ${y})${isWall ? ', wall' : ''}`} onClick={() => !isWall && (Math.abs(position.x - x) + Math.abs(position.y - y) === 1) && move(point)} sx={{ position: 'relative', minWidth: 0, aspectRatio: '1', display: 'grid', placeItems: 'center', border: 1, borderColor: isTarget ? 'warning.main' : 'divider', borderRadius: .75, backgroundColor: isWall ? '#34454b' : isTarget ? 'warning.light' : 'background.paper', cursor: isWall ? 'not-allowed' : 'pointer' }}>{isWall ? <Typography aria-hidden sx={{ color: 'rgba(255,255,255,.5)', fontSize: 16 }}>▦</Typography> : isTarget ? <Typography aria-label="Target flag" sx={{ fontSize: 20 }}>⚑</Typography> : null}{isCurrent && <Box aria-label={round.showReadout ? `Robot at (${position.x}, ${position.y})` : 'Robot'} sx={{ position: 'absolute', zIndex: 2, fontSize: { xs: 18, sm: 25 }, lineHeight: 1, transition: 'transform .25s ease' }}>🤖</Box>}</Box> })}
          </Box>
          <Stack direction="row" justifyContent="space-around" sx={{ pt: .5 }}>{Array.from({ length: size }, (_, index) => <Typography key={index} variant="caption" sx={{ width: `${100 / size}%`, textAlign: 'center', fontWeight: 700 }}>{index}</Typography>)}</Stack>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: .5, fontWeight: 700 }}>x-axis</Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Go across first (x), then up (y).</Typography>
      {round.showReadout && <Typography role="status" variant="body2" sx={{ textAlign: 'center' }}>Robot at ({position.x}, {position.y})</Typography>}
      {round.type === 'Move' && <>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center"><Button aria-label="Move up" onClick={() => step(0, 1)} variant="outlined" disabled={Boolean(movement.length)}>↑</Button><Button aria-label="Move left" onClick={() => step(-1, 0)} variant="outlined" disabled={Boolean(movement.length)}>←</Button><Button aria-label="Move down" onClick={() => step(0, -1)} variant="outlined" disabled={Boolean(movement.length)}>↓</Button><Button aria-label="Move right" onClick={() => step(1, 0)} variant="outlined" disabled={Boolean(movement.length)}>→</Button></Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="center"><TextField label="Send coordinate (x, y)" value={coordinateInput} onChange={(event) => { setCoordinateInput(event.target.value); setChecked(false); setCorrect(false) }} placeholder="4, 3" inputProps={{ 'aria-label': 'Coordinate pair' }} /><Button variant="outlined" onClick={sendToCoordinate} disabled={Boolean(movement.length)}>Send robot</Button></Stack>
      </>}
      {round.type === 'Read' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center"><TextField label="Robot coordinates (x, y)" value={robotAnswer} onChange={(event) => { setRobotAnswer(event.target.value); setChecked(false); setCorrect(false) }} placeholder="2, 5" /><TextField label="Flag coordinates (x, y)" value={flagAnswer} onChange={(event) => { setFlagAnswer(event.target.value); setChecked(false); setCorrect(false) }} placeholder="4, 3" /></Stack>}
      {round.type === 'Plan' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center"><TextField label="Move list" value={planInput} onChange={(event) => { setPlanInput(event.target.value); setChecked(false); setCorrect(false) }} placeholder="right 3, up 2" /><Button variant="outlined" onClick={runPlan} disabled={Boolean(movement.length)}>Run</Button></Stack>}
      {runMessage && <Typography role="status" color={runMessage.includes('blocked') || runMessage.includes('wall') ? 'warning.dark' : 'text.secondary'} sx={{ textAlign: 'center' }}>{runMessage}</Typography>}
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={checkActivity} disabled={Boolean(movement.length)}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.main'} sx={{ fontWeight: 800 }}>{feedback}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete Activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default CoordinateRobotActivity
