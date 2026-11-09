import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { advanceCart, createCartState, createCoasterTrack, energiesAt, fastestLandmark, GRAVITY, sampleTrack, scrubCart, zeroKineticLocation, type CartState } from './energy-roller-coaster-physics'

export type EnergyRollerCoasterProps = { onComplete?: () => void }
type Feedback = 'idle' | 'correct' | 'incorrect'
type Round = { hills: [number, number] }
type Answers = { fastest: string; zeroKinetic: string; massSpeed: string }

const round = (value: number) => Math.round(value)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const createRound = (): Round => ({ hills: [randomInt(6, 9), randomInt(10, 14)] })
const HEIGHT_MIN = 8
const HEIGHT_MAX = 20
const DEFAULT_MASS = 50
const massAnswer = 'The speed stays the same'
const energyColors = ['#3d73a8', '#f0ad4e', '#d66b56']

const EnergyRollerCoasterActivity: FC<EnergyRollerCoasterProps> = ({ onComplete }) => {
  const [roundState, setRoundState] = useState<Round>(createRound)
  const [startingHeight, setStartingHeight] = useState(15)
  const [cartState, setCartState] = useState<CartState>(() => createCartState(createCoasterTrack(15, roundState.hills)))
  const cartRef = useRef(cartState)
  const [isRunning, setIsRunning] = useState(false)
  const [mass, setMass] = useState(DEFAULT_MASS)
  const [friction, setFriction] = useState(0)
  const [showPie, setShowPie] = useState(false)
  const [answers, setAnswers] = useState<Answers>({ fastest: '', zeroKinetic: '', massSpeed: '' })
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [wasReleased, setWasReleased] = useState(false)
  const [runClearedHill2, setRunClearedHill2] = useState(false)
  const [massDoubled, setMassDoubled] = useState(false)

  const track = useMemo(() => createCoasterTrack(startingHeight, roundState.hills), [startingHeight, roundState.hills])
  const currentPoint = sampleTrack(track, cartState.s)
  const energies = energiesAt(track, cartState, mass)
  const fastestAnswer = fastestLandmark(track, friction)
  const zeroEnergyAnswer = zeroKineticLocation(track, friction)
  const hillCleared = runClearedHill2
  const withinHillRange = Math.abs(startingHeight - track.hill2Height) <= 1
  const challengeCorrect = wasReleased && hillCleared && withinHillRange
  const allCorrect = answers.fastest === fastestAnswer && answers.zeroKinetic === zeroEnergyAnswer && answers.massSpeed === massAnswer && massDoubled && challengeCorrect
  const chartScale = Math.max(energies.total, mass * GRAVITY * Math.max(...track.points.map((point) => point.height)))
  const toPercent = (value: number) => Math.max(0, Math.min(100, value / chartScale * 100))

  useEffect(() => {
    cartRef.current = cartState
  }, [cartState])

  useEffect(() => {
    if (!isRunning) return undefined
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.min(.05, (now - last) / 1000)
      last = now
      const result = advanceCart(track, cartRef.current, friction, elapsed)
      cartRef.current = result.state
      setCartState(result.state)
      if (result.clearedHill2) setRunClearedHill2(true)
      if (result.stopped) {
        setIsRunning(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isRunning, track, friction])

  const updateCart = (next: CartState) => {
    cartRef.current = next
    setCartState(next)
  }
  const updateHeight = (value: number) => {
    setStartingHeight(value)
    const nextTrack = createCoasterTrack(value, roundState.hills)
    updateCart(createCartState(nextTrack))
    setIsRunning(false)
    setWasReleased(false)
    setRunClearedHill2(false)
    setAnswers({ fastest: '', zeroKinetic: '', massSpeed: '' })
    setFeedback('idle')
  }
  const release = () => {
    updateCart(createCartState(track))
    setWasReleased(true)
    setRunClearedHill2(false)
    setFeedback('idle')
    setIsRunning(true)
  }
  const step = () => {
    setIsRunning(false)
    const result = advanceCart(track, cartRef.current, friction, .05)
    updateCart(result.state)
    if (result.clearedHill2) setRunClearedHill2(true)
    setWasReleased(true)
    setFeedback('idle')
  }
  const scrub = (value: number) => {
    setIsRunning(false)
    updateCart(scrubCart(track, track.length * value / 100, friction))
    setWasReleased(false)
    setRunClearedHill2(false)
    setFeedback('idle')
  }
  const chooseAnswer = (key: keyof Answers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }))
    setFeedback('idle')
  }
  const checkActivity = () => setFeedback(allCorrect ? 'correct' : 'incorrect')
  const reset = () => {
    const nextRound = createRound()
    const nextTrack = createCoasterTrack(15, nextRound.hills)
    setRoundState(nextRound)
    setStartingHeight(15)
    updateCart(createCartState(nextTrack))
    setIsRunning(false)
    setMass(DEFAULT_MASS)
    setFriction(0)
    setAnswers({ fastest: '', zeroKinetic: '', massSpeed: '' })
    setFeedback('idle')
    setWasReleased(false)
    setRunClearedHill2(false)
    setMassDoubled(false)
  }
  const setMassValue = (value: number) => {
    setMass(value)
    setFeedback('idle')
    if (value === DEFAULT_MASS * 2) setMassDoubled(true)
  }
  const setFrictionValue = (value: number) => {
    setFriction(value)
    setIsRunning(false)
    setWasReleased(false)
    setRunClearedHill2(false)
    setAnswers({ fastest: '', zeroKinetic: '', massSpeed: '' })
    setFeedback('idle')
  }

  const svgX = (x: number) => 58 + x / 42 * 690
  const svgY = (height: number) => 316 - height * 12
  const rulerMax = 22
  const trackPath = track.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${svgX(point.x).toFixed(2)} ${svgY(point.height).toFixed(2)}`).join(' ')
  const cartX = svgX(currentPoint.x)
  const cartY = svgY(currentPoint.height)
  const cartAngle = Math.atan(currentPoint.slope) * 180 / Math.PI
  const potentialPercent = toPercent(energies.potential)
  const kineticPercent = toPercent(energies.kinetic)
  const thermalPercent = toPercent(energies.thermal)
  const stackedPercent = potentialPercent + kineticPercent + thermalPercent
  const slices = [energies.potential, energies.kinetic, energies.thermal]
  const sliceTotal = Math.max(1, slices.reduce((sum, value) => sum + value, 0))
  const pieStops = slices.map((value, index) => value / sliceTotal * 360)
  const pieGradient = `conic-gradient(${energyColors[0]} 0deg ${pieStops[0]}deg, ${energyColors[1]} ${pieStops[0]}deg ${pieStops[0] + pieStops[1]}deg, ${energyColors[2]} ${pieStops[0] + pieStops[1]}deg 360deg)`
  const options = track.landmarks.map((landmark) => landmark.label)
  const feedbackText = feedback === 'correct'
    ? 'Correct. Your answers match the track and the simulation.'
    : feedback === 'incorrect'
      ? !wasReleased
        ? `Run the simulation to test Hill 2 (${track.hill2Height} m) before checking the activity.`
        : !hillCleared
          ? `Hill 2 is ${round(track.hill2Height)} m. Your cart started at ${round(startingHeight)} m and reached ${round(cartState.maxHeight)} m, so it did not clear the second hill and turned back.`
          : !withinHillRange
            ? `Hill 2 is ${round(track.hill2Height)} m and your cart started at ${round(startingHeight)} m. Start within 1 m of the hill height to pass this challenge.`
            : answers.fastest !== fastestAnswer
              ? `The fastest point on this track is near ${fastestAnswer}; the cart gains speed as it loses height.`
              : answers.zeroKinetic !== zeroEnergyAnswer
                ? `Kinetic energy first reaches zero ${zeroEnergyAnswer.toLowerCase()}; at that turning point the cart is momentarily at rest.`
                : `Doubling mass does not change speed or path; speed depends on height and friction, not mass.`
      : challengeCorrect
        ? 'Hill 2 cleared with a starting height within 1 m. Finish the predictions and check your answers.'
        : wasReleased && !hillCleared
          ? `Hill 2 is ${round(track.hill2Height)} m. Your cart started at ${round(startingHeight)} m and reached ${round(cartState.maxHeight)} m; it needs enough energy to reach the hilltop.`
          : 'Make the predictions, double the mass, then release the cart and test the second-hill challenge.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.25}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Energy Roller Coaster</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore how energy transforms between forms.</Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Starting height: {startingHeight} m</Typography>
          <Slider min={HEIGHT_MIN} max={HEIGHT_MAX} step={.5} value={startingHeight} onChange={(_, value) => updateHeight(Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value} m`} aria-label="Starting height" />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={release} disabled={isRunning} startIcon={<PlayArrowIcon />}>Release</Button>
          <Button variant="outlined" onClick={() => setIsRunning(false)} disabled={!isRunning} startIcon={<PauseIcon />}>Pause</Button>
          <Button variant="outlined" onClick={step} disabled={isRunning} startIcon={<SkipNextIcon />}>Step</Button>
        </Stack>
      </Stack>

      <Box component="svg" viewBox="0 0 800 360" sx={{ width: '100%', minHeight: { xs: 245, sm: 310 }, borderRadius: 2, background: 'linear-gradient(180deg, #eaf6f8, #fffdf6)' }} role="img" aria-label={`Cart at ${currentPoint.height.toFixed(1)} meters, moving at ${energies.speed.toFixed(1)} meters per second`}>
        {Array.from({ length: rulerMax / 2 + 1 }, (_, index) => {
          const height = index * 2
          const y = svgY(height)
          return <g key={height}><line x1="54" x2="755" y1={y} y2={y} stroke="#8ba8a3" strokeWidth="1" opacity={height === 0 ? .6 : .2} /><line x1="49" x2="58" y1={y} y2={y} stroke="#536f70" strokeWidth="1.5" /><text x="43" y={y + 4} textAnchor="end" fontSize="11" fill="#496466">{height}</text></g>
        })}
        {Array.from({ length: 9 }, (_, index) => {
          const x = svgX(index * 5)
          return <line key={index} x1={x} x2={x} y1={svgY(rulerMax)} y2={svgY(0)} stroke="#8ba8a3" strokeWidth="1" opacity=".12" />
        })}
        <line x1="58" x2="58" y1={svgY(rulerMax)} y2={svgY(0)} stroke="#536f70" strokeWidth="2" />
        <text x="15" y="25" fontSize="12" fill="#496466">Height (m)</text>
        <path d={trackPath} fill="none" stroke="#496f70" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d={trackPath} fill="none" stroke="#b8d6cf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {track.landmarks.map((landmark, index) => {
          const point = sampleTrack(track, landmark.s)
          const labelY = svgY(point.height) + (landmark.label.startsWith('Hill') ? -24 : 29)
          return <g key={landmark.label}><text x={svgX(point.x)} y={labelY} textAnchor="middle" fontSize="13" fontWeight="700" fill="#27484b" stroke="#f5fbf9" strokeWidth="4" paintOrder="stroke">{landmark.label}</text><text x={svgX(point.x)} y={labelY + (index % 2 ? 14 : 0)} textAnchor="middle" fontSize="10" fill="#496466" stroke="#f5fbf9" strokeWidth="3" paintOrder="stroke">{landmark.height} m</text></g>
        })}
        <line x1="58" x2={cartX} y1={svgY(startingHeight)} y2={svgY(startingHeight)} stroke="#bb7343" strokeDasharray="5 5" opacity=".7" />
        <circle cx="58" cy={svgY(startingHeight)} r="5" fill="#bb7343" />
        <text x="62" y={svgY(startingHeight) - 8} fontSize="11" fill="#854d2e">Start {startingHeight} m</text>
        <g transform={`translate(${cartX} ${cartY - 10}) rotate(${cartAngle})`}>
          <rect x="-15" y="-9" width="30" height="17" rx="6" fill="#d65f4b" stroke="#783b32" strokeWidth="2" />
          <circle cx="-9" cy="9" r="4" fill="#35464a" /><circle cx="9" cy="9" r="4" fill="#35464a" />
          <circle cx="5" cy="-4" r="2" fill="#fff1d7" />
        </g>
        <text x="708" y="341" fontSize="10" fill="#496466">Track distance →</text>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Scrub cart position: {Math.round(cartState.s / track.length * 100)}%</Typography>
        <Slider min={0} max={100} step={1} value={Math.round(cartState.s / track.length * 100)} onChange={(_, value) => scrub(Array.isArray(value) ? value[0] : value)} aria-label="Scrub cart position" valueLabelDisplay="auto" valueLabelFormat={(value) => `${value}%`} />
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Energy (J)</Typography>
            <Typography variant="body2" color="text.secondary">Mass: {mass} kg · Speed: {energies.speed.toFixed(1)} m/s · Height: {currentPoint.height.toFixed(1)} m</Typography>
          </Stack>
          <Box sx={{ position: 'relative', height: 30, borderRadius: 1, overflow: 'visible', bgcolor: '#edf0ef', display: 'flex' }} aria-label={`Potential ${round(energies.potential)} joules, kinetic ${round(energies.kinetic)} joules, thermal ${round(energies.thermal)} joules, total ${round(energies.total)} joules`}>
            <Box sx={{ width: `${potentialPercent}%`, bgcolor: energyColors[0], borderRadius: '4px 0 0 4px', transition: 'width .15s' }} />
            <Box sx={{ width: `${kineticPercent}%`, bgcolor: energyColors[1], transition: 'width .15s' }} />
            <Box sx={{ width: `${thermalPercent}%`, bgcolor: energyColors[2], borderRadius: '0 4px 4px 0', transition: 'width .15s' }} />
            {stackedPercent < 100 && <Box sx={{ flex: 1 }} />}
            <Box sx={{ position: 'absolute', left: `${toPercent(energies.total)}%`, top: -5, bottom: -5, borderLeft: '2px solid #1d292a' }} />
            <Typography sx={{ position: 'absolute', left: `${toPercent(energies.total)}%`, top: -22, transform: 'translateX(-50%)', fontSize: 11, whiteSpace: 'nowrap' }}>Total {round(energies.total)} J</Typography>
          </Box>
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} flexWrap="wrap" useFlexGap>
            <Typography variant="caption" sx={{ color: energyColors[0] }}>Potential: {round(energies.potential)} J</Typography>
            <Typography variant="caption" sx={{ color: '#9b6413' }}>Kinetic: {round(energies.kinetic)} J</Typography>
            <Typography variant="caption" sx={{ color: energyColors[2] }}>Thermal: {round(energies.thermal)} J</Typography>
          </Stack>
          <FormControlLabel control={<Checkbox size="small" checked={showPie} onChange={(event) => setShowPie(event.target.checked)} />} label="Show energy pie chart" />
          {showPie && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Box sx={{ width: 88, height: 88, borderRadius: '50%', background: pieGradient, flexShrink: 0 }} /><Typography variant="caption" color="text.secondary">The slices show the current proportions of potential, kinetic, and thermal energy.</Typography></Box>}
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Cart mass: {mass} kg</Typography>
          <Slider min={25} max={100} step={25} marks={[{ value: 25, label: '25' }, { value: 50, label: '50' }, { value: 75, label: '75' }, { value: 100, label: '100' }]} value={mass} onChange={(_, value) => setMassValue(Array.isArray(value) ? value[0] : value)} aria-label="Cart mass" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Friction: {friction === 0 ? 'None' : friction <= .05 ? 'Light' : friction <= .1 ? 'Medium' : 'Lots'}</Typography>
          <Slider min={0} max={.2} step={.05} marks={[{ value: 0, label: 'None' }, { value: .05, label: 'Light' }, { value: .1, label: 'Medium' }, { value: .2, label: 'Lots' }]} value={friction} onChange={(_, value) => setFrictionValue(Array.isArray(value) ? value[0] : value)} aria-label="Friction" />
        </Box>
      </Stack>
      <Typography variant="caption" color="text.secondary">With no friction, speed follows v = √(2g(h₀ − h)). Mass changes energy amounts, not speed. Friction transfers mechanical energy into thermal energy.</Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Challenge and predictions</Typography>
          <Typography variant="body2"><strong>Challenge:</strong> Clear Hill 2 ({round(track.hill2Height)} m) with a starting height within 1 m of its height. The simulation checks whether the cart actually reaches the hill.</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>1. Where is the cart fastest on this track?</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>{options.map((option) => <Button key={option} size="small" variant={answers.fastest === option ? 'contained' : 'outlined'} onClick={() => chooseAnswer('fastest', option)}>{option}</Button>)}</Stack>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>2. Where does the cart first reach zero kinetic energy after release?</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>{[zeroEnergyAnswer, 'At every valley', 'Only at Hill 2'].map((option) => <Button key={option} size="small" variant={answers.zeroKinetic === option ? 'contained' : 'outlined'} onClick={() => chooseAnswer('zeroKinetic', option)}>{option}</Button>)}</Stack>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>3. What happens to speed if mass doubles?</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>{[massAnswer, 'The speed doubles', 'The speed is cut in half'].map((option) => <Button key={option} size="small" variant={answers.massSpeed === option ? 'contained' : 'outlined'} onClick={() => chooseAnswer('massSpeed', option)}>{option}</Button>)}</Stack>
          <Typography variant="caption" color="text.secondary">Try doubling the mass from 50 kg to 100 kg with the slider before checking your prediction.</Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {challengeCorrect && <Chip color="success" label="Hill 2 cleared" />}
            {feedback === 'correct' && <Chip color="success" label="All answers correct" />}
          </Stack>
          <Typography role="status" color={feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'error.main' : 'text.secondary'} variant="body2">{feedbackText}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={checkActivity} disabled={isRunning} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button>
            <Button variant="outlined" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
            <Button variant="contained" disabled={feedback !== 'correct'} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  </Paper>
}

export default EnergyRollerCoasterActivity
