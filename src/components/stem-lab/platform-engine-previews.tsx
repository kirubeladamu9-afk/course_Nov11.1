import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { type FC, type PointerEvent, type ReactNode, useState } from 'react'
import ForcePlaygroundActivity from './force-playground-activity'
import MachinePlaygroundActivity from './machine-playground-activity'
import EnergyRollerCoasterActivity from './energy-roller-coaster-activity'
import CircuitBuilderActivity from './circuit-builder-activity'
import ForceMotionLabActivity from './force-motion-lab-activity'
import SurfaceTestActivity from './surface-test-activity'
import DropZoneActivity from './drop-zone-activity'
import LightRaySimulatorActivity from './light-ray-simulator-activity'
import LightThroughMaterialsActivity from './light-through-materials-activity'
import VectorPlaygroundPhysicsActivity from './vector-playground-physics-activity'
import CollisionPlaygroundActivity from './collision-playground-activity'
import MomentumLabActivity from './momentum-lab-activity'
import MotionTrackActivity from './motion-track-activity'
import SpeedRaceActivity from './speed-race-activity'
import SpeedCalculatorLabActivity from './speed-calculator-lab-activity'
import ShadowLabActivity from './shadow-lab-activity'
import WaveSimulatorActivity from './wave-simulator-activity'
import KinematicsActivity from './kinematics-activity'
import ProjectileMotionActivity from './projectile-motion-activity'
import SemiconductorActivity from './semiconductor-activity'
import ParticleHeatActivity from './particle-heat-activity'
import MagneticPlaygroundActivity from './magnetic-playground-activity'
import FloatingSinkingActivity from './floating-sinking-activity'
import DragDropEngine from './drag-drop-engine'
import MatchingEngine from './matching-engine'
import PercentageBatteryActivity from './percentage-battery-activity'
import FactorMachineActivity from './factor-machine-activity'
import MirrorDrawingActivity from './mirror-drawing-activity'
import CoordinateRobotActivity from './coordinate-robot-activity'
import ProbabilityMachineActivity from './probability-machine-activity'
import PatternTrainActivity from './pattern-train-activity'
import ShopSimulatorActivity from './shop-simulator-activity'
import ElevatorIntegersActivity from './elevator-integers-activity'
import BalanceEquationActivity from './balance-equation-activity'
import FunctionMachineActivity from './function-machine-activity'
import LineIntersectionActivity from './line-intersection-activity'
import TriangleBuilderActivity from './triangle-builder-activity'
import ImprovedSetSorterActivity from './set-sorter-activity'
import ShapeScalerActivity from './shape-scaler-activity'
import SequenceBuilderActivity from './sequence-builder-activity'
import VectorPlaygroundActivity from './vector-playground-activity'
import RecipeMixerActivity from './recipe-mixer-activity'
import ShapeBuilderActivity from './shape-builder-activity'
import TenFrameBuilderActivity from './ten-frame-builder-activity'
import NumberBalanceActivity from './number-balance-activity'
import TileRoomActivity from './tile-room-activity'
import DecimalPainterActivity from './decimal-painter-activity'
import CurveSculptorActivity from './curve-sculptor-activity'
import ShapeAnalyzerActivity from './shape-analyzer-activity'
import ImprovedApproachingPointActivity from './approaching-point-activity'
import TangentLineActivity from './tangent-line-activity'
import AreaUnderCurveActivity from './area-under-curve-activity'
import EquationChallengeActivity from './equation-challenge-activity'
import { type PlatformEngineId } from './platform-engine-library'
import FaradaySimulation from '@/components/admin/faraday-simulation'
import PendulumSimulation from './pendulum-simulation'
import LivingOrNotActivity from './living-or-not-activity'
import PlantLabelingActivity from './plant-labeling-activity'
import HumanBodyPartsActivity from './human-body-parts-activity'
import SenseChallengeActivity from './sense-challenge-activity'
import AnimalSpotterActivity from './animal-spotter-activity'
import HealthyPlateActivity from './healthy-plate-activity'
import MaterialSorterActivity from './material-sorter-activity'
import StateSorterActivity from './state-sorter-activity'
import ParticleStateSimulator from './particle-state-simulator'
import SolutionBuilderActivity from './solution-builder-activity'
import AcidBaseLabActivity from './acid-base-lab-activity'
import WaterPropertiesLabActivity from './water-properties-lab-activity'
import AtomBuilderActivity from './atom-builder-activity'
import ElementCompoundSorterActivity from './element-compound-sorter-activity'
import ReactionSimulatorActivity from './reaction-simulator-activity'
import PeriodicTableActivity from './periodic-table-activity'
import ChemicalBondingActivity from './chemical-bonding-activity'
import MaterialsPropertiesActivity from './materials-properties-activity'
import FormulaBuilderActivity from './formula-builder-activity'
import PhotosynthesisLabActivity from './photosynthesis-lab-activity'
import CellZoomActivity from './cell-zoom-activity'
import { type MathTopic } from '@/components/admin/stem-curriculum'

export type EnginePreviewProps = { onComplete?: () => void }

type FrameProps = { name: string; description: string; children: ReactNode }
const EngineFrame: FC<FrameProps> = ({ name, description, children }) => <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">{name}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{description}</Typography></Box>{children}</Stack></Paper>

const CompleteButton: FC<{ disabled?: boolean; onComplete?: () => void; label?: string }> = ({ disabled, onComplete, label = 'Complete activity' }) => <Button variant="contained" disabled={disabled} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{label}</Button>

export const NumberLineEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [value, setValue] = useState(7)
  const target = 7
  const x = 24 + (value / 10) * 352
  return <EngineFrame name="Interactive Number Line" description="Drag the marker to the target value and see the number move along the line."><Box component="svg" viewBox="0 0 400 110" sx={{ width: '100%', height: 150, overflow: 'visible' }} role="img" aria-label={`Number line marker at ${value}`}><line x1="24" x2="376" y1="55" y2="55" stroke="currentColor" strokeWidth="3" />{Array.from({ length: 11 }, (_, index) => { const tickX = 24 + (index / 10) * 352; return <g key={index}><line x1={tickX} x2={tickX} y1="45" y2="65" stroke="currentColor" strokeWidth="2" /><text x={tickX} y="86" textAnchor="middle" fontSize="12">{index}</text></g> })}<circle cx={x} cy="55" r="13" fill="var(--mui-palette-primary-main)" /></Box><Slider min={0} max={10} step={1} value={value} onChange={(_, next) => setValue(Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" aria-label="Number line value" /><Typography variant="body2" color={value === target ? 'success.main' : 'text.secondary'}>{value === target ? 'Target reached.' : `Place the marker on ${target}.`}</Typography><CompleteButton disabled={value !== target} onComplete={onComplete} /></EngineFrame>
}

export const GraphEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [slope, setSlope] = useState(2)
  const [intercept, setIntercept] = useState(1)
  const points = Array.from({ length: 9 }, (_, index) => { const x = index - 4; const y = slope * x + intercept; return `${40 + index * 40},${100 - y * 8}` }).join(' ')
  return <EngineFrame name="Graph Builder" description="Change slope and intercept, then inspect how the line changes in real time."><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 190, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label="Interactive linear graph"><line x1="20" x2="380" y1="100" y2="100" stroke="currentColor" opacity=".35" /><line x1="200" x2="200" y1="15" y2="155" stroke="currentColor" opacity=".35" /><polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">Slope: {slope}</Typography><Slider min={-3} max={3} step={1} value={slope} onChange={(_, next) => setSlope(Array.isArray(next) ? next[0] : next)} aria-label="Slope" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">Intercept: {intercept}</Typography><Slider min={-4} max={4} step={1} value={intercept} onChange={(_, next) => setIntercept(Array.isArray(next) ? next[0] : next)} aria-label="Intercept" /></Box></Stack><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>y = {slope}x {intercept >= 0 ? '+' : '−'} {Math.abs(intercept)}</Typography><CompleteButton onComplete={onComplete} /></EngineFrame>
}

export const GeometryEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [width, setWidth] = useState(6)
  const [height, setHeight] = useState(4)
  return <EngineFrame name="Geometry Manipulator" description="Change the rectangle dimensions and read the live perimeter and area calculations."><Box component="svg" viewBox="0 0 400 180" sx={{ width: '100%', height: 190, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label="Interactive rectangle"><rect x="100" y="30" width={width * 28} height={height * 24} rx="5" fill="var(--mui-palette-primary-main)" opacity=".28" stroke="var(--mui-palette-primary-main)" strokeWidth="3" /><text x="200" y="165" textAnchor="middle" fontSize="14">{width} × {height}</text></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">Width: {width}</Typography><Slider min={2} max={8} step={1} value={width} onChange={(_, next) => setWidth(Array.isArray(next) ? next[0] : next)} aria-label="Width" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">Height: {height}</Typography><Slider min={2} max={6} step={1} value={height} onChange={(_, next) => setHeight(Array.isArray(next) ? next[0] : next)} aria-label="Height" /></Box></Stack><Stack direction="row" spacing={2}><Chip label={`Area: ${width * height} units²`} color="primary" /><Chip label={`Perimeter: ${2 * (width + height)} units`} /></Stack><CompleteButton onComplete={onComplete} /></EngineFrame>
}

export const EquationBalanceEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [left, setLeft] = useState(4)
  const [right, setRight] = useState(7)
  const [adjustment, setAdjustment] = useState(3)
  const balanced = left + adjustment === right
  return <EngineFrame name="Equation / Balance" description="Apply the same operation to both sides until the equation is balanced."><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center"><Paper elevation={0} sx={{ p: 2, flex: 1, textAlign: 'center', border: 1, borderColor: balanced ? 'success.main' : 'divider' }}><Typography variant="h4">x + {adjustment}</Typography></Paper><Typography variant="h4">=</Typography><Paper elevation={0} sx={{ p: 2, flex: 1, textAlign: 'center', border: 1, borderColor: balanced ? 'success.main' : 'divider' }}><Typography variant="h4">{right}</Typography></Paper></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField type="number" label="x value" value={left} onChange={(event) => setLeft(Number(event.target.value))} inputProps={{ min: 0 }} /><TextField type="number" label="Add to x" value={adjustment} onChange={(event) => setAdjustment(Number(event.target.value))} inputProps={{ min: 0 }} /><TextField type="number" label="Right side" value={right} onChange={(event) => setRight(Number(event.target.value))} inputProps={{ min: 0 }} /></Stack><Typography color={balanced ? 'success.main' : 'text.secondary'}>{balanced ? 'Both sides have equal value.' : 'Adjust the values until both sides balance.'}</Typography><CompleteButton disabled={!balanced} onComplete={onComplete} /></EngineFrame>
}

export const MoleculeAtomEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [atoms, setAtoms] = useState<string[]>([])
  const addAtom = (atom: string) => setAtoms((current) => current.length < 3 ? [...current, atom] : current)
  const correct = atoms.join('') === 'HHO'
  return <EngineFrame name="Molecule / Atom Builder" description="Place atoms on the canvas to build the configured water molecule target."><Box sx={{ minHeight: 130, p: 2, border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>{atoms.length ? atoms.map((atom, index) => <Box key={`${atom}-${index}`} sx={{ width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: atom === 'O' ? 'error.main' : 'primary.main', color: 'common.white', fontWeight: 800 }}>{atom}</Box>) : <Typography color="text.secondary">Place 2 hydrogen atoms and 1 oxygen atom</Typography>}</Box><Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => addAtom('H')}>Add H</Button><Button variant="outlined" onClick={() => addAtom('O')}>Add O</Button><Button variant="text" onClick={() => setAtoms([])}>Reset</Button></Stack><Typography color={correct ? 'success.main' : 'text.secondary'}>{correct ? 'Target structure built: H₂O.' : 'Target: H₂O'}</Typography><CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

export const BiologyExplorerEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null)
  const parts = [{ name: 'Root', explanation: 'Absorbs water and anchors the plant.' }, { name: 'Stem', explanation: 'Supports the plant and transports materials.' }, { name: 'Leaf', explanation: 'Uses light to make food.' }]
  return <EngineFrame name="Biology Explorer" description="Select a plant structure to reveal its role in the connected system."><Stack direction="row" spacing={1} justifyContent="center">{parts.map((part) => <Button key={part.name} variant={selected === part.name ? 'contained' : 'outlined'} onClick={() => setSelected(part.name)}>{part.name}</Button>)}</Stack>{selected && <Paper role="status" elevation={0} sx={{ p: 2, backgroundColor: 'success.light' }}><Typography sx={{ fontWeight: 700 }}>{selected}</Typography><Typography variant="body2">{parts.find((part) => part.name === selected)?.explanation}</Typography></Paper>}<CompleteButton disabled={!selected} onComplete={onComplete} /></EngineFrame>
}

export const MicroscopeEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [zoom, setZoom] = useState(1)
  const identified = zoom >= 3
  return <EngineFrame name="Virtual Microscope" description="Increase magnification to inspect the specimen and identify its structure."><Box sx={{ minHeight: 150, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 2, backgroundColor: '#102a43' }}><Box sx={{ width: 90, height: 90, borderRadius: '50%', transform: `scale(${zoom})`, transition: 'transform .35s ease', background: 'radial-gradient(circle at 35% 30%, #f8c4d8 0 12%, transparent 13%), radial-gradient(circle at 68% 62%, #8ed1c5 0 20%, transparent 21%), #d5f3ec' }} /></Box><Typography variant="body2">Magnification: {zoom}×</Typography><Slider min={1} max={4} step={1} value={zoom} onChange={(_, next) => setZoom(Array.isArray(next) ? next[0] : next)} aria-label="Microscope magnification" /><Typography color={identified ? 'success.main' : 'text.secondary'}>{identified ? 'Structure identified: cell nucleus.' : 'Increase magnification to inspect the nucleus.'}</Typography><CompleteButton disabled={!identified} onComplete={onComplete} /></EngineFrame>
}

export const TimelineEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [stages, setStages] = useState(['Egg', 'Larva', 'Pupa', 'Adult'])
  const [checked, setChecked] = useState(false)
  const move = (index: number, direction: -1 | 1) => setStages((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return next; [next[index], next[target]] = [next[target], next[index]]; return next })
  const correct = stages.join('|') === 'Egg|Larva|Pupa|Adult'
  return <EngineFrame name="Timeline / Lifecycle" description="Arrange the lifecycle stages, then validate the sequence."><Stack spacing={1}>{stages.map((stage, index) => <Paper key={stage} elevation={0} sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1, border: 1, borderColor: 'divider' }}><Typography sx={{ flex: 1, fontWeight: 700 }}>{index + 1}. {stage}</Typography><Button size="small" onClick={() => move(index, -1)} disabled={index === 0}>Up</Button><Button size="small" onClick={() => move(index, 1)} disabled={index === stages.length - 1}>Down</Button></Paper>)}</Stack><Button variant="outlined" onClick={() => setChecked(true)}>Check order</Button>{checked && <Typography color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct lifecycle order.' : 'Try another order.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

export const DataChartEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [values, setValues] = useState([5, 8, 4, 9, 7])
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((total, value) => total + value, 0) / values.length
  const median = sorted[Math.floor(sorted.length / 2)]
  return <EngineFrame name="Data / Chart Builder" description="Adjust the bars and calculate statistics from the same dataset."><Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 150, px: 2, borderBottom: 1, borderColor: 'divider' }}>{values.map((value, index) => <Box key={index} sx={{ flex: 1, height: `${value * 10}%`, minHeight: 8, backgroundColor: 'primary.main', borderRadius: '6px 6px 0 0', transition: 'height .25s ease' }} />)}</Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>{values.map((value, index) => <TextField key={index} type="number" size="small" label={`Value ${index + 1}`} value={value} onChange={(event) => setValues((current) => current.map((item, itemIndex) => itemIndex === index ? Number(event.target.value) : item))} inputProps={{ min: 0, max: 10 }} />)}</Stack><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`Mean: ${mean.toFixed(1)}`} /><Chip label={`Median: ${median}`} /><Chip label={`Range: ${Math.max(...values) - Math.min(...values)}`} /></Stack><CompleteButton onComplete={onComplete} /></EngineFrame>
}

const SimulationEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [temperature, setTemperature] = useState(50)
  const [ran, setRan] = useState(false)
  const output = Math.round(temperature * 1.6)
  return <EngineFrame name="Simulation Engine" description="Change an input, run the model, and inspect the calculated output."><Typography variant="body2">Temperature: {temperature}°C</Typography><Slider min={0} max={100} value={temperature} onChange={(_, next) => { setTemperature(Array.isArray(next) ? next[0] : next); setRan(false) }} aria-label="Temperature" /><Button variant="contained" onClick={() => setRan(true)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Run simulation</Button>{ran && <Paper role="status" elevation={0} sx={{ p: 2, backgroundColor: 'background.default' }}><Typography variant="h4" color="primary.main">{output}</Typography><Typography variant="caption" color="text.secondary">Model output units</Typography></Paper>}<CompleteButton disabled={!ran} onComplete={onComplete} /></EngineFrame>
}

const VirtualLabEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [mixed, setMixed] = useState(false)
  return <EngineFrame name="Virtual Lab Engine" description="Combine safe virtual materials, run the procedure, and observe the configured result."><Stack direction="row" spacing={1} justifyContent="center"><Chip label="Acid sample" color="warning" /><Typography sx={{ alignSelf: 'center' }}>+</Typography><Chip label="Base sample" color="info" /></Stack><Button variant="contained" onClick={() => setMixed(true)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Mix and observe</Button>{mixed && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main', backgroundColor: 'success.light' }}><Typography sx={{ fontWeight: 700 }}>Neutralization observed</Typography><Typography variant="body2">The combined sample moves toward neutral pH.</Typography></Paper>}<CompleteButton disabled={!mixed} onComplete={onComplete} /></EngineFrame>
}

const PredictionExperimentEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [prediction, setPrediction] = useState<'increase' | 'decrease' | null>(null)
  const [input, setInput] = useState(70)
  const [result, setResult] = useState<'increase' | 'decrease' | null>(null)
  const actual = input >= 50 ? 'increase' : 'decrease'
  return <EngineFrame name="Prediction → Experiment → Result" description="Make a prediction, run the experiment, and compare it with the observed result."><Typography sx={{ fontWeight: 700 }}>What will happen when the input increases?</Typography><Stack direction="row" spacing={1}><Button variant={prediction === 'increase' ? 'contained' : 'outlined'} onClick={() => setPrediction('increase')}>Increase</Button><Button variant={prediction === 'decrease' ? 'contained' : 'outlined'} onClick={() => setPrediction('decrease')}>Decrease</Button></Stack><Typography variant="body2">Experiment input: {input}</Typography><Slider min={0} max={100} value={input} onChange={(_, next) => { setInput(Array.isArray(next) ? next[0] : next); setResult(null) }} aria-label="Experiment input" /><Button variant="contained" disabled={!prediction} onClick={() => setResult(actual)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Run experiment</Button>{result && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: result === prediction ? 'success.main' : 'warning.main', backgroundColor: result === prediction ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{result === prediction ? 'Prediction correct' : 'Prediction needs revision'}</Typography><Typography variant="body2">Observed result: {result}. The result follows the experiment input.</Typography></Paper>}<CompleteButton disabled={!result} onComplete={onComplete} /></EngineFrame>
}

const getMathActivityPrompt = (topic: MathTopic) => {
  const prompts: Record<string, string> = {
    'Counting & Number Recognition': `Tap bugs and fruits until the garden has ${topic.target} counted objects.`,
    'Place Value': 'Build the requested hundreds, tens, and ones number with blocks.',
    'Multiplication/Division Concepts': 'Arrange equal critter groups, then enter the number of groups.',
    Fractions: `Tap pizza slices to show ${topic.target}/8 of the whole.`,
    Decimals: `Shade ${topic.target} squares on the 100-grid.`,
    Ratios: `Adjust the recipe to ${topic.target} servings and multiply the ingredients.`,
    Percentages: `Charge the 100-grid battery to ${topic.target}%.`,
    'Factors & Multiples': `Feed ${topic.target} into the machine to reveal its factor pairs.`,
    Measurement: `Drag the virtual ruler until the measured object reads ${topic.target} units.`,
    Geometry: `Place ${topic.target} vertices to complete the target shape.`,
    Angles: `Rotate the ray until the angle reads ${topic.target}°.`,
    'Perimeter & Area': `Place tiles until the room area is ${topic.target} square units.`,
    Symmetry: 'Complete the missing mirror half and check the reflection.',
    'Coordinate Grids': `Guide the robot to coordinate (${topic.target}, ${topic.target}).`,
    'Data & Statistics': `Build the chart and enter the target value ${topic.target}.`,
    Probability: 'Draw balls from the bag and compare the live probability graph.',
    Patterns: `Complete the pattern train with the next value ${topic.target}.`,
    Money: `Buy the item and enter the correct change: ${topic.target}.`,
    Time: `Set the clock hands to ${topic.target} minutes elapsed.`,
    Integers: `Move the elevator until it reaches floor ${topic.target}.`,
    Algebra: `Balance both sides and isolate x = ${topic.target}.`,
    'Linear Equations': `Adjust m until the graph matches slope ${topic.target}.`,
    Functions: `Feed the input into the machine and produce output ${topic.target}.`,
    'Simultaneous Equations': 'Drag the two lines until their intersection is highlighted.',
    'Pythagorean Theorem': `Resize the triangle until the target side is ${topic.target}.`,
    Sets: 'Sort each item into the correct Venn diagram region.',
    Similarity: `Scale the twin shape to factor ${topic.target}.`,
    'Quadratic Equations': `Reshape the parabola until its target parameter is ${topic.target}.`,
    'Sequences & Series': `Place the next sequence term: ${topic.target}.`,
    Trigonometry: `Spin the unit-circle point to ${topic.target}° and read sin/cos/tan.`,
    'Coordinate Geometry': `Click two points and measure distance ${topic.target}.`,
    'Mathematical Modelling': `Adjust the scenario until the outcome reaches ${topic.target}.`,
    'Polynomial Functions': `Sculpt the curve until the target coefficient is ${topic.target}.`,
    'Exponential & Logarithmic Functions': `Grow the population to input level ${topic.target}.`,
    'Analytical Geometry': `Manipulate the equation until the target coefficient is ${topic.target}.`,
    Vectors: `Combine arrows until the resultant magnitude is ${topic.target}.`,
    Limits: 'Move the marker toward x = 2 and observe the approaching value.',
    Differentiation: `Drag the point until the tangent slope is ${topic.target}.`,
    Integration: `Increase rectangles until the area estimate uses ${topic.target} rectangles.`,
    'Advanced Algebra': `Solve the equation challenge: x = ${topic.target}.`,
  }
  return prompts[topic.title] ?? topic.activityDescription
}

const TopicCheck: FC<{ correct: boolean; checked: boolean; onCheck: () => void; onComplete?: () => void }> = ({ correct, checked, onCheck, onComplete }) => <><Button variant="outlined" onClick={onCheck}>Check activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct — target matched.' : 'Keep exploring and adjust the visual.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></>

const GridActivity: FC<{ topic: MathTopic; value: number; setValue: (value: number) => void; suffix?: string }> = ({ topic, value, setValue, suffix = '' }) => <><Paper elevation={0} sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: .5, backgroundColor: 'background.default' }}>{Array.from({ length: 100 }, (_, index) => <Button key={index} aria-label={`Grid square ${index + 1}`} onClick={() => setValue(index + 1)} sx={{ minWidth: 0, p: .4, aspectRatio: 1, backgroundColor: index < value ? 'primary.main' : 'action.hover', color: index < value ? 'primary.contrastText' : 'text.secondary' }}>{index < value ? '■' : '·'}</Button>)}</Paper><Typography variant="body2" color="text.secondary">Shade the visual grid to {topic.target}{suffix}.</Typography></>

const GraphVisual: FC<{ kind: 'linear' | 'intersection' | 'parabola' | 'polynomial'; value: number; target: number; setValue: (value: number) => void }> = ({ kind, value, target, setValue }) => { const points = Array.from({ length: 9 }, (_, index) => { const x = index - 4; const y = kind === 'parabola' ? value * x * x - 1 : kind === 'polynomial' ? value * x * x * x / 5 : value * x + 1; return `${40 + index * 40},${105 - y * 8}` }).join(' '); return <><Box component="svg" viewBox="0 0 400 130" sx={{ width: '100%', height: 155, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${kind} graph`}><line x1="20" x2="380" y1="105" y2="105" stroke="currentColor" opacity=".3" /><line x1="200" x2="200" y1="15" y2="120" stroke="currentColor" opacity=".3" />{kind === 'intersection' ? <><polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" /><polyline points={Array.from({ length: 9 }, (_, index) => `${40 + index * 40},${105 - ((-value * (index - 4)) + 2) * 8}`).join(' ')} fill="none" stroke="var(--mui-palette-secondary-main)" strokeWidth="4" /><circle cx="200" cy="89" r={value === target ? 8 : 4} fill="var(--mui-palette-success-main)" /></> : <polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" />}</Box><Typography variant="body2">{kind === 'linear' ? `y = ${value}x + 1` : kind === 'intersection' ? `Intersection control: ${value}` : `${kind} coefficient: ${value}`}</Typography><Slider min={1} max={5} step={1} value={value} onChange={(_, next) => setValue(Array.isArray(next) ? next[0] : next)} aria-label={`${kind} graph control`} /></> }

const SetSorterActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  type Region = 'a' | 'overlap' | 'b' | 'outside'
  const [rules, setRules] = useState({ a: 'even numbers', b: 'multiples of 3', aTest: (value: number) => value % 2 === 0, bTest: (value: number) => value % 3 === 0 })
  const [placements, setPlacements] = useState<Record<number, Region | null>>(() => Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, null])))
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const expected = (value: number): Region => { const inA = rules.aTest(value); const inB = rules.bTest(value); return inA && inB ? 'overlap' : inA ? 'a' : inB ? 'b' : 'outside' }
  const allPlaced = Object.values(placements).every(Boolean)
  const correct = allPlaced && Object.entries(placements).every(([value, region]) => region === expected(Number(value)))
  const place = (region: Region) => { if (selected === null) return; setPlacements((current) => ({ ...current, [selected]: region })); setSelected(null); setChecked(false) }
  const reset = () => { setPlacements(Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, null]))); setSelected(null); setChecked(false); setCompleted(false) }
  const nextActivity = () => { const next = Math.random() > .5 ? { a: 'odd numbers', b: 'multiples of 4', aTest: (value: number) => value % 2 !== 0, bTest: (value: number) => value % 4 === 0 } : { a: 'numbers greater than 6', b: 'multiples of 2', aTest: (value: number) => value > 6, bTest: (value: number) => value % 2 === 0 }; setRules(next); reset() }
  const regionCount = (region: Region) => Object.values(placements).filter((item) => item === region).length
  const regionStyle = (region: Region) => ({ position: 'absolute' as const, border: 0, borderRadius: region === 'outside' ? 1 : '50%', backgroundColor: region === 'a' ? 'rgba(16, 125, 111, .22)' : region === 'b' ? 'rgba(79, 140, 255, .22)' : region === 'overlap' ? 'rgba(120, 100, 190, .28)' : 'rgba(246, 183, 60, .16)', color: 'text.primary', cursor: 'pointer', font: 'inherit', transition: 'box-shadow .2s ease, filter .2s ease', '&:hover': { filter: 'brightness(1.08)' } })
  const feedback = Object.entries(placements).filter(([value, region]) => region && region !== expected(Number(value))).map(([value, region]) => { const number = Number(value); const reason = rules.aTest(number) && rules.bTest(number) ? `it is ${rules.a} and ${rules.b}` : rules.aTest(number) ? `it is ${rules.a}` : rules.bTest(number) ? `it is ${rules.b}` : 'it belongs outside both sets'; return `${value} is in ${region}, but ${reason}.` })
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Typography variant="h6" sx={{ textAlign: 'center' }}>Sort these numbers: A = {rules.a}, B = {rules.b}</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Tap a number, then tap its Venn region, or drag it into a region.</Typography><Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ p: 1.25, minHeight: 58, borderRadius: 2, backgroundColor: 'rgba(16, 125, 111, .1)' }}>{Object.entries(placements).filter(([, region]) => !region).map(([value]) => <Button key={value} draggable onDragStart={(event) => event.dataTransfer.setData('text/set-value', value)} onClick={() => setSelected(Number(value))} variant={selected === Number(value) ? 'contained' : 'outlined'} aria-label={`Number ${value}`}>{value}</Button>)}{!allPlaced && <Typography variant="caption" sx={{ alignSelf: 'center' }}>Numbers left in tray</Typography>}</Stack><Box sx={{ position: 'relative', maxWidth: 500, height: 300, mx: 'auto', p: 1, border: 2, borderColor: 'divider', borderRadius: 2, backgroundColor: 'rgba(246, 183, 60, .08)' }} onDragOver={(event) => event.preventDefault()}><Typography variant="caption" sx={{ position: 'absolute', top: 6, left: 8 }}>Universal set</Typography>{(['a', 'overlap', 'b', 'outside'] as Region[]).map((region) => <Box key={region} component="button" type="button" onClick={() => place(region)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const value = Number(event.dataTransfer.getData('text/set-value')); if (value) setPlacements((current) => ({ ...current, [value]: region })) }} sx={region === 'a' ? { ...regionStyle(region), left: '12%', top: '20%', width: '46%', height: 190, zIndex: 1 } : region === 'b' ? { ...regionStyle(region), right: '12%', top: '20%', width: '46%', height: 190, zIndex: 1 } : region === 'overlap' ? { ...regionStyle(region), left: '38%', top: '34%', width: '24%', height: 150, zIndex: 2 } : { ...regionStyle(region), inset: 0, zIndex: 0 }}><Typography sx={{ fontWeight: 800 }}>{region === 'a' ? `A only (${regionCount('a')})` : region === 'b' ? `B only (${regionCount('b')})` : region === 'overlap' ? `A ∩ B (${regionCount('overlap')})` : `Outside (${regionCount('outside')})`}</Typography><Stack direction="row" spacing={.5} flexWrap="wrap" justifyContent="center" sx={{ mt: 2 }}>{Object.entries(placements).filter(([, current]) => current === region).map(([value]) => <Chip key={value} label={value} onClick={(event) => { event.stopPropagation(); setSelected(Number(value)); setPlacements((current) => ({ ...current, [Number(value)]: null })) }} />)}</Stack></Box>)}</Box><Stack direction="row" spacing={1} justifyContent="center"><Button variant="outlined" onClick={reset}>Start Over</Button><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button></Stack>{checked && <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: correct ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{correct ? 'All items are in the correct Venn regions.' : `${feedback.length} item${feedback.length === 1 ? '' : 's'} need${feedback.length === 1 ? 's' : ''} moving. ${Object.values(placements).filter((region) => !region).length} remain in the tray.`}</Typography>{feedback.slice(0, 3).map((message) => <Typography key={message} variant="body2">{message}</Typography>)}</Paper>}{correct && <Typography color="success.main" sx={{ textAlign: 'center' }}>Set sort complete — every number matches its set membership.</Typography>}<CompleteButton disabled={!correct || completed} label={completed ? 'Completed' : 'Complete activity'} onComplete={() => { setCompleted(true); onComplete?.() }} />{completed && <Button variant="contained" onClick={nextActivity}>Next Activity</Button>}</EngineFrame>
}

const ArrayBuilderActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [mode, setMode] = useState<'groups' | 'sharing'>('groups')
  const [groupCount, setGroupCount] = useState(3)
  const [groupSize, setGroupSize] = useState(4)
  const [groupRows, setGroupRows] = useState<number[][]>(Array.from({ length: 3 }, () => []))
  const [basketCount, setBasketCount] = useState(4)
  const [shareTotal, setShareTotal] = useState(24)
  const [baskets, setBaskets] = useState<number[]>([0, 0, 0, 0])
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const groupTotal = groupRows.reduce((sum, row) => sum + row.length, 0)
  const groupsCorrect = groupRows.length === groupCount && groupRows.every((row) => row.length === groupSize)
  const sharingCorrect = baskets.length === basketCount && shareTotal % basketCount === 0 && baskets.every((count) => count === shareTotal / basketCount) && baskets.reduce((sum, count) => sum + count, 0) === shareTotal
  const correct = mode === 'groups' ? groupsCorrect : sharingCorrect
  const reset = () => { setGroupRows(Array.from({ length: groupCount }, () => [])); setBaskets(Array(basketCount).fill(0)); setChecked(false); setCompleted(false) }
  const nextActivity = () => { const nextGroups = 2 + Math.floor(Math.random() * 3); const nextSize = 2 + Math.floor(Math.random() * 4); setGroupCount(nextGroups); setGroupSize(nextSize); setShareTotal(nextGroups * nextSize); setBasketCount(nextGroups); setGroupRows(Array.from({ length: nextGroups }, () => [])); setBaskets(Array(nextGroups).fill(0)); setMode(Math.random() > .5 ? 'groups' : 'sharing'); setChecked(false); setCompleted(false) }
  const toggleCritter = (rowIndex: number, cellIndex: number) => setGroupRows((rows) => rows.map((row, index) => index !== rowIndex ? row : row.length > cellIndex ? row.filter((_, itemIndex) => itemIndex !== cellIndex) : [...row, row.length]))
  const dropCritter = (rowIndex: number) => setGroupRows((rows) => rows.map((row, index) => index === rowIndex && row.length < groupSize ? [...row, row.length] : row))
  const addToBasket = (index: number) => { if (baskets.reduce((sum, count) => sum + count, 0) >= shareTotal) return; setBaskets((current) => current.map((count, basketIndex) => basketIndex === index ? count + 1 : count)); setChecked(false) }
  const removeFromBasket = (index: number) => setBaskets((current) => current.map((count, basketIndex) => basketIndex === index && count > 0 ? count - 1 : count))
  const feedback = mode === 'groups' ? groupRows.length !== groupCount ? `Wrong number of groups: build ${groupCount} groups.` : groupRows.some((row) => row.length !== groupSize) ? `Unequal groups: every row must contain ${groupSize} critters.` : groupTotal !== groupCount * groupSize ? 'The total does not match the multiplication fact.' : 'Correct equal groups.' : baskets.reduce((sum, count) => sum + count, 0) < shareTotal ? `There are still ${shareTotal - baskets.reduce((sum, count) => sum + count, 0)} critters in the pile.` : baskets.some((count) => count !== shareTotal / basketCount) ? `Unequal baskets: each basket needs ${shareTotal / basketCount} critters.` : 'Correct fair sharing.'
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack direction="row" spacing={1} justifyContent="center"><Button variant={mode === 'groups' ? 'contained' : 'outlined'} onClick={() => { setMode('groups'); reset() }}>Equal groups</Button><Button variant={mode === 'sharing' ? 'contained' : 'outlined'} onClick={() => { setMode('sharing'); reset() }}>Fair sharing</Button></Stack>{mode === 'groups' ? <><Typography variant="h6" sx={{ textAlign: 'center' }}>Build {groupCount} groups of {groupSize}</Typography><Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(16, 125, 111, .12)' }}><Typography variant="body2" color="text.secondary">Drag from here</Typography><Box draggable onDragStart={(event) => event.dataTransfer.setData('text/critter', 'critter')} role="button" tabIndex={0} aria-label="Drag a critter" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') dropCritter(0) }} sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 2, backgroundColor: '#f6a623', color: 'common.white', cursor: 'grab', fontSize: 22 }}>🍊</Box><Typography variant="caption" color="text.secondary">or tap a square</Typography></Stack><Stack spacing={1}>{groupRows.map((row, rowIndex) => <Stack key={rowIndex} direction="row" spacing={.5} alignItems="center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); dropCritter(rowIndex) }} sx={{ p: .75, borderRadius: 1.5, backgroundColor: row.length === groupSize ? 'success.light' : row.length ? 'warning.light' : 'background.default' }}><Typography sx={{ width: 58, fontWeight: 700 }}>Group {rowIndex + 1}</Typography>{Array.from({ length: groupSize }, (_, cellIndex) => <Button key={cellIndex} aria-label={`Group ${rowIndex + 1} critter ${cellIndex + 1}`} onClick={() => toggleCritter(rowIndex, cellIndex)} draggable={cellIndex < row.length} onDragStart={(event) => event.dataTransfer.setData('text/critter', `${rowIndex}:${cellIndex}`)} sx={{ minWidth: 36, height: 36, p: 0, borderRadius: '50%', backgroundColor: cellIndex < row.length ? 'rgba(246, 166, 35, .2)' : 'action.hover', color: cellIndex < row.length ? '#9a6732' : 'text.secondary' }}>{cellIndex < row.length ? '🍊' : '+'}</Button>)}<Typography variant="caption">{row.length}</Typography></Stack>)}</Stack><Typography variant="h6" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{Array.from({ length: groupCount }, (_, index) => groupRows[index]?.length ?? 0).join(' + ')} = {groupTotal}</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{groupSize} × {groupCount} = {groupCount * groupSize}</Typography></> : <><Typography variant="h6" sx={{ textAlign: 'center' }}>Share {shareTotal} critters fairly among {basketCount} baskets</Typography><Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(246, 183, 60, .12)', textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Orange pile</Typography><Typography sx={{ fontSize: 24, letterSpacing: 2 }}>{'🍊'.repeat(Math.min(shareTotal - baskets.reduce((sum, count) => sum + count, 0), 12)) || '—'}</Typography><Typography variant="body2" color="text.secondary">Critters left in pile: {shareTotal - baskets.reduce((sum, count) => sum + count, 0)}</Typography></Paper><Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Chip label={`Pile: ${shareTotal - baskets.reduce((sum, count) => sum + count, 0)} critters`} color="warning" />{baskets.map((count, index) => <Paper key={index} elevation={0} sx={{ p: 1, minWidth: 82, textAlign: 'center', border: 2, borderColor: count === shareTotal / basketCount ? 'success.main' : 'divider', backgroundColor: count === shareTotal / basketCount ? 'success.light' : 'background.default' }}><Typography variant="caption">Basket {index + 1}</Typography><Typography sx={{ minHeight: 28, fontSize: 18, letterSpacing: 1 }}>{'🍊'.repeat(Math.min(count, 8)) || '—'}</Typography><Typography variant="h6">{count}</Typography><Stack direction="row" justifyContent="center"><Button size="small" onClick={() => removeFromBasket(index)} aria-label={`Remove from basket ${index + 1}`}>−</Button><Button size="small" onClick={() => addToBasket(index)} aria-label={`Add to basket ${index + 1}`}>+</Button></Stack></Paper>)}</Stack><Typography variant="body2" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{baskets.join(' + ')} = {baskets.reduce((sum, count) => sum + count, 0)} · {shareTotal} ÷ {basketCount} = {shareTotal / basketCount}</Typography></>}
  <Stack direction="row" spacing={1} justifyContent="center"><Button variant="outlined" onClick={reset}>Start Over</Button><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button></Stack>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'} sx={{ textAlign: 'center' }}>{feedback}</Typography>}{correct && <Typography color="success.main" sx={{ textAlign: 'center' }}>{mode === 'groups' ? `${groupSize}, ${groupSize + groupSize}, ${groupSize * groupCount} — multiplication fact linked.` : `${shareTotal} ÷ ${basketCount} = ${shareTotal / basketCount} — fair sharing complete.`}</Typography>}<CompleteButton disabled={!correct || completed} label={completed ? 'Completed' : 'Complete activity'} onComplete={() => { setCompleted(true); onComplete?.() }} />{completed && <Button variant="contained" onClick={nextActivity}>Next Activity</Button>}</EngineFrame>
}

const BaseTenBuilderActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [blocks, setBlocks] = useState({ hundreds: 0, tens: 0, ones: 0 })
  const [checked, setChecked] = useState(false)
  const target = topic.target
  const builtValue = blocks.hundreds * 100 + blocks.tens * 10 + blocks.ones
  const correct = builtValue === target
  const addBlock = (kind: keyof typeof blocks) => setBlocks((current) => {
    const next = { ...current, [kind]: current[kind] + 1 }
    if (next.ones >= 10) { next.ones -= 10; next.tens += 1 }
    if (next.tens >= 10) { next.tens -= 10; next.hundreds += 1 }
    setChecked(false)
    return next
  })
  const removeBlock = (kind: keyof typeof blocks) => setBlocks((current) => current[kind] > 0 ? { ...current, [kind]: current[kind] - 1 } : current)
  const stack = (kind: keyof typeof blocks, label: string, color: string) => <Stack spacing={.75} alignItems="center" sx={{ flex: 1 }}><Typography variant="subtitle2">{label} ({blocks[kind]})</Typography><Box sx={{ minHeight: 150, width: '100%', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: .5 }}>{Array.from({ length: blocks[kind] }, (_, index) => <Box key={`${kind}-${index}-${blocks[kind]}`} sx={{ width: kind === 'hundreds' ? 72 : kind === 'tens' ? 54 : 30, height: kind === 'hundreds' ? 38 : kind === 'tens' ? 28 : 22, display: 'grid', placeItems: 'center', borderRadius: 1, backgroundColor: color, color: 'common.white', fontSize: 11, fontWeight: 800, boxShadow: '0 3px 0 rgba(0,0,0,.15)', animation: 'baseTenSnap .25s ease', '@keyframes baseTenSnap': { from: { transform: 'scale(.65) translateY(-12px)', opacity: .4 }, to: { transform: 'scale(1) translateY(0)', opacity: 1 } } }}>{label}</Box>)}</Box><Stack direction="row" spacing={.5}><Button size="small" variant="outlined" onClick={() => removeBlock(kind)} disabled={!blocks[kind]}>−</Button><Button size="small" variant="contained" onClick={() => addBlock(kind)}>+{kind === 'hundreds' ? '100' : kind === 'tens' ? '10' : '1'}</Button></Stack></Stack>
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Typography variant="h6" sx={{ textAlign: 'center' }}>Build the number {target}</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Stack hundreds, tens, and ones blocks. Ten smaller blocks regroup with a snap.</Typography><Stack direction="row" spacing={1} alignItems="flex-end" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.default' }}>{stack('hundreds', '100s', '#107d6f')}{stack('tens', '10s', '#4f8cff')}{stack('ones', '1s', '#f6a623')}</Stack><Typography variant="h5" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>Built value: {builtValue}</Typography><Typography variant="body2" color={correct ? 'success.main' : 'text.secondary'} sx={{ textAlign: 'center' }}>{correct ? 'Correct place-value build.' : `Target remaining: ${Math.max(0, target - builtValue)}`}</Typography><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct — the blocks sum to the target.' : 'Not yet — check the hundreds, tens, and ones.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

const AngleRotatorActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [angle, setAngle] = useState(45)
  const [touched, setTouched] = useState(false)
  const [checked, setChecked] = useState(false)
  const correct = touched && angle === 90
  const radians = angle * Math.PI / 180
  const rayEnd = { x: 200 + Math.cos(radians) * 105, y: 125 - Math.sin(radians) * 105 }
  const classification = angle === 0 ? 'zero angle' : angle < 90 ? 'acute angle' : angle === 90 ? 'right angle' : angle < 180 ? 'obtuse angle' : 'straight angle'
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Box component="svg" viewBox="0 0 400 180" sx={{ width: '100%', height: 220, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${angle} degree ${classification}`}><line x1="200" y1="125" x2="330" y2="125" stroke="#107d6f" strokeWidth="6" strokeLinecap="round" /><line x1="200" y1="125" x2={rayEnd.x} y2={rayEnd.y} stroke="#e94f64" strokeWidth="6" strokeLinecap="round" /><path d={`M ${200 + Math.cos(radians) * 45} ${125 - Math.sin(radians) * 45} A 45 45 0 0 0 245 125`} fill="none" stroke="#5d4200" strokeWidth="3" /><circle cx="200" cy="125" r="9" fill="#5d4200" /><text x="200" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="#5d4200">{angle}°</text></Box><Typography variant="h5" sx={{ textAlign: 'center' }}>{angle}° · {classification}</Typography><Typography variant="body2" color="text.secondary">Rotate the red ray from the fixed horizontal ray. Target: 90°.</Typography><Slider min={0} max={180} step={1} value={angle} onChange={(_, next) => { setAngle(Array.isArray(next) ? next[0] : next); setTouched(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Angle in degrees" /><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct right angle.' : 'Not yet. Set the rays to exactly 90°.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

const ClockQuestActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [touchedHour, setTouchedHour] = useState(false)
  const [touchedMinute, setTouchedMinute] = useState(false)
  const [checked, setChecked] = useState(false)
  const correct = touchedHour && touchedMinute && hour === 9 && minute === 30
  const minuteAngle = minute * 6
  const hourAngle = (hour % 12) * 30 + minute * 0.5
  const handPoint = (angle: number, length: number) => ({ x: 200 + Math.sin(angle * Math.PI / 180) * length, y: 105 - Math.cos(angle * Math.PI / 180) * length })
  const hourPoint = handPoint(hourAngle, 48)
  const minutePoint = handPoint(minuteAngle, 70)
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Box component="svg" viewBox="0 0 400 210" sx={{ width: '100%', height: 250, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`Clock set to ${hour}:${String(minute).padStart(2, '0')}`}><circle cx="200" cy="105" r="86" fill="#fff7df" stroke="#9a6732" strokeWidth="5" />{Array.from({ length: 60 }, (_, index) => { const pointA = handPoint(index * 6, index % 5 === 0 ? 76 : 81); const pointB = handPoint(index * 6, 84); return <line key={index} x1={pointA.x} y1={pointA.y} x2={pointB.x} y2={pointB.y} stroke="#5d4200" strokeWidth={index % 5 === 0 ? 3 : 1} /> })}{Array.from({ length: 12 }, (_, index) => { const point = handPoint((index + 1) * 30, 64); return <text key={index} x={point.x} y={point.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#5d4200">{index + 1}</text> })}<line x1="200" y1="105" x2={hourPoint.x} y2={hourPoint.y} stroke="#107d6f" strokeWidth="7" strokeLinecap="round" /><line x1="200" y1="105" x2={minutePoint.x} y2={minutePoint.y} stroke="#e94f64" strokeWidth="4" strokeLinecap="round" /><circle cx="200" cy="105" r="7" fill="#5d4200" /></Box><Typography variant="h5" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{hour}:{String(minute).padStart(2, '0')}</Typography><Typography variant="body2" color="text.secondary">Set the playful clock to 9:30.</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">Hour hand: {hour}</Typography><Slider min={1} max={12} step={1} value={hour} onChange={(_, next) => { setHour(Array.isArray(next) ? next[0] : next); setTouchedHour(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Hour hand" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">Minute hand: {minute}</Typography><Slider min={0} max={59} step={1} value={minute} onChange={(_, next) => { setMinute(Array.isArray(next) ? next[0] : next); setTouchedMinute(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Minute hand" /></Box></Stack><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct time — the clock matches 9:30.' : 'Not yet. Set both hands to 9:30.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

const LinearEquationActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [slope, setSlope] = useState(0)
  const [intercept, setIntercept] = useState(0)
  const [touchedSlope, setTouchedSlope] = useState(false)
  const [touchedIntercept, setTouchedIntercept] = useState(false)
  const [checked, setChecked] = useState(false)
  const targetSlope = topic.target
  const targetIntercept = 1
  const correct = touchedSlope && touchedIntercept && slope === targetSlope && intercept === targetIntercept
  const points = Array.from({ length: 41 }, (_, index) => {
    const x = index / 2 - 10
    const y = slope * x + intercept
    const screenY = Math.max(8, Math.min(122, 65 - y * 8))
    return `${20 + index * 9},${screenY}`
  }).join(' ')
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Box component="svg" viewBox="0 0 400 130" sx={{ width: '100%', height: 180, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`Graph of y equals ${slope}x plus ${intercept}`}><line x1="20" x2="380" y1="105" y2="105" stroke="currentColor" opacity=".35" /><line x1="200" x2="200" y1="10" y2="120" stroke="currentColor" opacity=".35" />{Array.from({ length: 41 }, (_, index) => <line key={index} x1={20 + index * 9} x2={20 + index * 9} y1="101" y2="109" stroke="currentColor" opacity=".25" />)}<polyline points={points} fill="none" stroke="#107d6f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></Box><Typography variant="h6" sx={{ fontFamily: 'monospace', textAlign: 'center' }}>y = {slope}x {intercept >= 0 ? '+' : '−'} {Math.abs(intercept)}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">m (slope): {slope}</Typography><Slider min={-3} max={3} step={1} value={slope} onChange={(_, next) => { setSlope(Array.isArray(next) ? next[0] : next); setTouchedSlope(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Slope m" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">b (y-intercept): {intercept}</Typography><Slider min={-4} max={4} step={1} value={intercept} onChange={(_, next) => { setIntercept(Array.isArray(next) ? next[0] : next); setTouchedIntercept(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Intercept b" /></Box></Stack><Typography variant="body2" color={correct ? 'success.main' : 'text.secondary'}>{correct ? 'Target equation reached: y = 2x + 1.' : 'Move both sliders to build y = 2x + 1.'}</Typography><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct equation and graph.' : 'Not yet. Set both m and b to the target values.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

type ScenarioModel = 'linear' | 'quadratic' | 'exponential'
type ScenarioRound = 'predict outcome' | 'reach target' | 'compare two options'
type ScenarioVariable = { key: string; label: string; min: number; max: number; step: number; start: number; unit: string }
type ScenarioDefinition = {
  id: string
  model: ScenarioModel
  round: ScenarioRound
  story: string
  illustration: string
  goal: string
  variables: ScenarioVariable[]
  target: number
  targetLabel: string
  evaluate: (values: Record<string, number>) => number
  equation: (values: Record<string, number>) => string
  solution: (values: Record<string, number>) => number
  answerLabel: string
  modelChoice?: boolean
}

const scenarioDefinitions: ScenarioDefinition[] = [
  { id: 'gym-budget', model: 'linear', round: 'reach target', story: 'A gym charges a $20 sign-up fee plus $15 per month. You have a budget of $200.', illustration: '🏋️', goal: 'How many months can you afford without going over budget?', variables: [{ key: 'months', label: 'Months', min: 0, max: 16, step: 1, start: 6, unit: 'months' }, { key: 'monthly', label: 'Monthly fee', min: 5, max: 30, step: 1, start: 15, unit: '$/month' }, { key: 'signup', label: 'Sign-up fee', min: 0, max: 50, step: 5, start: 20, unit: '$' }], target: 200, targetLabel: 'Budget', evaluate: (v) => v.signup + v.monthly * v.months, equation: (v) => `Cost = ${v.signup} + ${v.monthly}m = ${v.signup} + ${v.monthly} × ${v.months} = ${v.signup + v.monthly * v.months}`, solution: (v) => Math.max(0, Math.floor((200 - v.signup) / v.monthly)), answerLabel: 'Months you can afford' },
  { id: 'phone-plan', model: 'linear', round: 'compare two options', story: 'Two phone plans compete for your data-heavy month. Plan A has a base fee plus a per-GB charge; Plan B has a higher base fee but cheaper data.', illustration: '📱', goal: 'Find the break-even data usage where both plans cost the same.', variables: [{ key: 'gb', label: 'Data usage', min: 0, max: 20, step: 1, start: 6, unit: 'GB' }, { key: 'baseA', label: 'Plan A base', min: 10, max: 40, step: 5, start: 20, unit: '$' }, { key: 'rateA', label: 'Plan A / GB', min: 1, max: 8, step: 1, start: 5, unit: '$/GB' }, { key: 'baseB', label: 'Plan B base', min: 20, max: 60, step: 5, start: 40, unit: '$' }, { key: 'rateB', label: 'Plan B / GB', min: 1, max: 5, step: 1, start: 2, unit: '$/GB' }], target: 0, targetLabel: 'Break-even difference', evaluate: (v) => (v.baseA + v.rateA * v.gb) - (v.baseB + v.rateB * v.gb), equation: (v) => `A − B = (${v.baseA} + ${v.rateA}g) − (${v.baseB} + ${v.rateB}g) = ${(v.baseA + v.rateA * v.gb) - (v.baseB + v.rateB * v.gb)}`, solution: (v) => (v.baseB - v.baseA) / (v.rateA - v.rateB), answerLabel: 'Break-even GB' },
  { id: 'garden-fence', model: 'quadratic', round: 'predict outcome', story: 'You have 40 m of fencing for a rectangular garden. Choose the width and calculate the area when the length uses the remaining fence.', illustration: '🌿', goal: 'What area does this garden enclose?', variables: [{ key: 'width', label: 'Width', min: 2, max: 18, step: 1, start: 8, unit: 'm' }, { key: 'fence', label: 'Fencing', min: 20, max: 60, step: 5, start: 40, unit: 'm' }], target: 96, targetLabel: 'Reference area', evaluate: (v) => v.width * (v.fence / 2 - v.width), equation: (v) => `Area = w(${v.fence} ÷ 2 − w) = ${v.width} × (${v.fence / 2} − ${v.width}) = ${v.width * (v.fence / 2 - v.width)}`, solution: (v) => v.width * (v.fence / 2 - v.width), answerLabel: 'Area in m²' },
  { id: 'savings-growth', model: 'exponential', round: 'reach target', story: 'A savings jar starts with $100 and grows by 10% each year through compound interest.', illustration: '🪙', goal: 'How many years until the balance reaches $160 or more?', variables: [{ key: 'years', label: 'Years', min: 0, max: 12, step: 1, start: 4, unit: 'years' }, { key: 'start', label: 'Starting amount', min: 50, max: 200, step: 10, start: 100, unit: '$' }, { key: 'rate', label: 'Growth rate', min: 0.05, max: 0.2, step: 0.01, start: 0.1, unit: '/year' }], target: 160, targetLabel: 'Target balance', evaluate: (v) => v.start * (1 + v.rate) ** v.years, equation: (v) => `Balance = ${v.start}(1 + ${v.rate})^${v.years} = ${Math.round(v.start * (1 + v.rate) ** v.years)}`, solution: (v) => Math.ceil(Math.log(160 / v.start) / Math.log(1 + v.rate)), answerLabel: 'Years to reach target' },
  { id: 'ball-flight', model: 'quadratic', round: 'reach target', story: 'A ball is thrown from a balcony. Its height follows a quadratic path as it travels away from the thrower.', illustration: '⚽', goal: 'At what distance does the ball first reach the target height of 8 m?', variables: [{ key: 'distance', label: 'Distance', min: 0, max: 20, step: 1, start: 4, unit: 'm' }, { key: 'launch', label: 'Launch height', min: 2, max: 12, step: 1, start: 4, unit: 'm' }, { key: 'curve', label: 'Curve factor', min: 0.02, max: 0.12, step: 0.01, start: 0.05, unit: '/m²' }], target: 8, targetLabel: 'Target height', evaluate: (v) => v.launch + 4 * v.distance - v.curve * v.distance ** 2, equation: (v) => `Height = ${v.launch} + 4d − ${v.curve}d² = ${Math.round(v.launch + 4 * v.distance - v.curve * v.distance ** 2)} m`, solution: (v) => (4 - Math.sqrt(Math.max(0, 16 - 4 * v.curve * (8 - v.launch)))) / (2 * v.curve), answerLabel: 'Distance in metres', modelChoice: true },
]

const ScenarioSolverActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [scenario, setScenario] = useState(() => scenarioDefinitions[Math.floor(Math.random() * scenarioDefinitions.length)])
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(scenario.variables.map((variable) => [variable.key, variable.start])))
  const [answer, setAnswer] = useState('')
  const [modelChoice, setModelChoice] = useState<ScenarioModel | ''>('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const output = scenario.evaluate(values)
  const xVariable = scenario.variables[0]
  const graphSamples = Array.from({ length: 9 }, (_, index) => { const x = xVariable.min + (xVariable.max - xVariable.min) * index / 8; return { x, y: scenario.evaluate({ ...values, [xVariable.key]: x }) } })
  const yValues = [...graphSamples.map(({ y }) => y), scenario.target]
  const yMin = Math.min(...yValues) - 1
  const yMax = Math.max(...yValues) + 1
  const graphY = (y: number) => 135 - ((y - yMin) / Math.max(1, yMax - yMin)) * 105
  const graphX = (x: number) => 35 + ((x - xVariable.min) / Math.max(1, xVariable.max - xVariable.min)) * 330
  const expected = scenario.round === 'predict outcome' ? output : scenario.solution(values)
  const isCorrect = answer.trim() !== '' && Number.isFinite(Number(answer)) && Math.abs(Number(answer) - expected) <= 0.05 && (!scenario.modelChoice || modelChoice === scenario.model)
  const updateValue = (key: string, value: number) => { setValues((current) => ({ ...current, [key]: value })); setChecked(null) }
  const nextRound = () => { const next = scenarioDefinitions[Math.floor(Math.random() * scenarioDefinitions.length)]; setScenario(next); setValues(Object.fromEntries(next.variables.map((variable) => [variable.key, variable.start]))); setAnswer(''); setModelChoice(''); setChecked(null) }
  const reset = () => { setValues(Object.fromEntries(scenario.variables.map((variable) => [variable.key, variable.start]))); setAnswer(''); setModelChoice(''); setChecked(null) }
  const message = isCorrect ? (scenario.round === 'reach target' ? `Correct! ${scenario.equation(values)} reaches the ${scenario.targetLabel.toLowerCase()}.` : `Correct! Your model gives ${Math.round(output * 100) / 100}.`) : output > scenario.target && scenario.round === 'reach target' ? `Your outcome is ${Math.round(output - scenario.target)} over the target. Try adjusting the input down.` : 'Not quite. Check the substituted values and try a nearby value.'
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack spacing={2.25}>
    <Paper elevation={0} sx={{ p: 2, background: 'linear-gradient(135deg, rgba(16,125,111,.12), rgba(79,140,255,.08))', border: 1, borderColor: 'divider' }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}><Typography sx={{ fontSize: 52, lineHeight: 1 }} aria-label={`${scenario.id} illustration`}>{scenario.illustration}</Typography><Box><Chip label={`${scenario.model} model · ${scenario.round}`} size="small" color="primary" /><Typography variant="h6" sx={{ mt: .75 }}>{scenario.story}</Typography><Typography color="text.secondary">Goal: {scenario.goal}</Typography></Box></Stack></Paper>
    {scenario.modelChoice && <Box><Typography variant="subtitle2">Choose the model type before solving</Typography><Stack direction="row" spacing={1} sx={{ mt: 1 }}>{(['linear', 'quadratic', 'exponential'] as ScenarioModel[]).map((model) => <Button key={model} size="small" variant={modelChoice === model ? 'contained' : 'outlined'} onClick={() => { setModelChoice(model); setChecked(null) }}>{model}</Button>)}</Stack></Box>}
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch"><Paper elevation={0} sx={{ p: 2, flex: 1, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Adjust the variables</Typography>{scenario.variables.map((variable) => <Box key={variable.key} sx={{ mb: 2 }}><Stack direction="row" justifyContent="space-between"><Typography variant="body2" sx={{ fontWeight: 700 }}>{variable.label}</Typography><Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>{values[variable.key]} {variable.unit}</Typography></Stack><Slider min={variable.min} max={variable.max} step={variable.step} marks value={values[variable.key]} onChange={(_, next) => updateValue(variable.key, Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" aria-label={variable.label} /></Box>)}</Paper><Paper elevation={0} sx={{ p: 2, flex: 1.4, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Live model</Typography><Typography sx={{ fontFamily: 'monospace', mt: .75, minHeight: 48 }}>{scenario.equation(values)}</Typography><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 190, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${scenario.model} model graph`}><line x1="35" x2="365" y1="135" y2="135" stroke="currentColor" opacity=".4" /><line x1="35" x2="35" y1="20" y2="135" stroke="currentColor" opacity=".4" /><line x1="35" x2="365" y1={graphY(scenario.target)} y2={graphY(scenario.target)} stroke="#f6a623" strokeDasharray="7 5" strokeWidth="2" /><polyline points={graphSamples.map(({ x, y }) => `${graphX(x)},${graphY(y)}`).join(' ')} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" strokeLinejoin="round" style={{ transition: 'all .35s ease' }} /><circle cx={graphX(values[xVariable.key])} cy={graphY(output)} r="7" fill={checked === true ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-secondary-main)'} style={{ transition: 'cx .35s ease, cy .35s ease' }} /><text x="200" y="160" textAnchor="middle" fontSize="12">{xVariable.label} ({xVariable.unit})</text><text x="10" y="25" fontSize="12">outcome</text></Box><Stack direction="row" justifyContent="space-between"><Typography variant="caption">Current outcome: {Math.round(output * 100) / 100}</Typography><Typography variant="caption" color="warning.main">Target: {scenario.target}</Typography></Stack></Paper></Stack>
    <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', overflowX: 'auto' }}><Typography variant="subtitle2" sx={{ mb: .5 }}>Value table</Typography><Stack direction="row" spacing={2}>{graphSamples.slice(0, 5).map(({ x, y }) => <Box key={x} sx={{ minWidth: 70 }}><Typography variant="caption" color="text.secondary">{xVariable.label}</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{Math.round(x * 100) / 100}</Typography><Typography variant="caption" color="primary.main">{Math.round(y * 100) / 100}</Typography></Box>)}</Stack></Paper>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-end' }}><TextField type="number" label={scenario.answerLabel} value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(null) }} placeholder="Type your answer" inputProps={{ step: 'any' }} sx={{ minWidth: 230 }} /><Button variant="contained" onClick={() => setChecked(isCorrect)} disabled={!answer.trim()}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="text" onClick={nextRound}>Next round</Button></Stack>
    {checked !== null && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: checked ? 'success.main' : 'error.main', backgroundColor: checked ? 'success.light' : 'error.light', animation: checked ? 'scenarioGlow .45s ease' : 'scenarioShake .35s ease', '@keyframes scenarioGlow': { from: { boxShadow: '0 0 0 rgba(46,125,50,0)' }, to: { boxShadow: '0 0 18px rgba(46,125,50,.45)' } }, '@keyframes scenarioShake': { '25%': { transform: 'translateX(-4px)' }, '75%': { transform: 'translateX(4px)' } } }}><Typography sx={{ fontWeight: 700 }}>{message}</Typography></Paper>}
    <CompleteButton disabled={checked !== true} onComplete={onComplete} />
  </Stack></EngineFrame>
}

type GrowthRound = 'predict the population' | 'how long until' | 'decay' | 'match the graph'
type GrowthDefinition = { id: string; round: GrowthRound; story: string; illustration: string; start: number; factor: number; target: number; unit: string; answerLabel: string }
const growthDefinitions: GrowthDefinition[] = [
  { id: 'bacteria', round: 'predict the population', story: 'A bacteria colony starts with 100 cells and doubles every hour.', illustration: '🧫', start: 100, factor: 2, target: 3200, unit: 'cells', answerLabel: 'Population after t hours' },
  { id: 'interest', round: 'how long until', story: 'A savings account starts with $500 and earns 8% interest each year.', illustration: '💰', start: 500, factor: 1.08, target: 800, unit: '$', answerLabel: 'Years to reach target' },
  { id: 'decay', round: 'decay', story: 'A medicine dose starts at 160 mg and retains 75% of its amount each hour.', illustration: '🧪', start: 160, factor: .75, target: 50, unit: 'mg', answerLabel: 'Amount after t hours' },
  { id: 'match', round: 'match the graph', story: 'A wildlife reserve tracks a population that grows by 50% each season.', illustration: '🦋', start: 40, factor: 1.5, target: 0, unit: 'animals', answerLabel: 'Choose the matching curve' },
]

const GrowthSimulatorActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [scenario, setScenario] = useState(() => growthDefinitions[Math.floor(Math.random() * growthDefinitions.length)])
  const [time, setTime] = useState(5)
  const [start, setStart] = useState(scenario.start)
  const [factor, setFactor] = useState(scenario.factor)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [view, setView] = useState<'normal' | 'log'>('normal')
  const [compare, setCompare] = useState(false)
  const output = start * factor ** time
  const inverse = Math.log(scenario.target / start) / Math.log(factor)
  const expected = scenario.round === 'how long until' ? inverse : output
  const correct = scenario.round === 'match the graph' ? answer === 'exponential' : answer.trim() !== '' && Math.abs(Number(answer) - expected) <= .1
  const values = Array.from({ length: 9 }, (_, index) => start * factor ** (index * 1.5))
  const transform = (value: number) => view === 'log' ? Math.log10(Math.max(1, value)) : value
  const yValues = values.map(transform)
  const yMin = Math.min(0, ...yValues)
  const yMax = Math.max(1, ...yValues, transform(scenario.target)) * 1.08
  const x = (value: number) => 35 + value / 12 * 330
  const y = (value: number) => 135 - (transform(value) - yMin) / Math.max(.01, yMax - yMin) * 105
  const equation = scenario.round === 'how long until' ? `${factor}^t = ${scenario.target} ÷ ${start}, so t = log${factor}(${(scenario.target / start).toFixed(2)}) ≈ ${inverse.toFixed(1)}` : `P = ${start} × ${factor}^t → P(${time}) = ${Math.round(output * 100) / 100} ${scenario.unit}`
  const reset = () => { setTime(5); setStart(scenario.start); setFactor(scenario.factor); setAnswer(''); setChecked(null) }
  const next = () => { const item = growthDefinitions[Math.floor(Math.random() * growthDefinitions.length)]; setScenario(item); setTime(5); setStart(item.start); setFactor(item.factor); setAnswer(''); setChecked(null) }
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack spacing={2.25}><Paper elevation={0} sx={{ p: 2, background: 'linear-gradient(135deg, rgba(16,125,111,.12), rgba(79,140,255,.08))', border: 1, borderColor: 'divider' }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}><Typography sx={{ fontSize: 52 }}>{scenario.illustration}</Typography><Box><Chip label={scenario.round} size="small" color="primary" /><Typography variant="h6" sx={{ mt: .75 }}>{scenario.story}</Typography><Typography color="text.secondary">{scenario.round === 'how long until' ? `When does it pass ${scenario.target} ${scenario.unit}?` : scenario.round === 'match the graph' ? 'Choose the curve that matches the exponential equation.' : `Find the ${scenario.unit} at the selected time.`}</Typography></Box></Stack></Paper><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper elevation={0} sx={{ p: 2, flex: .75, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Inputs</Typography><Typography variant="body2">Time: {time} steps</Typography><Slider min={0} max={12} step={1} marks value={time} onChange={(_, nextValue) => { setTime(Array.isArray(nextValue) ? nextValue[0] : nextValue); setChecked(null) }} aria-label="Time" /><Typography variant="body2">Starting amount: {start} {scenario.unit}</Typography><Slider min={scenario.start / 2} max={scenario.start * 2} step={scenario.start >= 100 ? 10 : 1} marks value={start} onChange={(_, nextValue) => { setStart(Array.isArray(nextValue) ? nextValue[0] : nextValue); setChecked(null) }} aria-label="Starting amount" /><Typography variant="body2">Factor per step: ×{factor}</Typography><Slider min={factor < 1 ? .5 : 1.1} max={factor < 1 ? .95 : 3} step={.01} marks value={factor} onChange={(_, nextValue) => { setFactor(Array.isArray(nextValue) ? nextValue[0] : nextValue); setChecked(null) }} aria-label="Growth factor" /></Paper><Paper elevation={0} sx={{ p: 2, flex: 1.5, border: 1, borderColor: 'divider' }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Live growth graph</Typography><Stack direction="row" spacing={.5}><Button size="small" variant={view === 'normal' ? 'contained' : 'outlined'} onClick={() => setView('normal')}>Normal</Button><Button size="small" variant={view === 'log' ? 'contained' : 'outlined'} onClick={() => setView('log')}>Log view</Button></Stack></Stack><Typography sx={{ fontFamily: 'monospace', mt: 1, minHeight: 42 }}>{equation}</Typography><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 190, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label="Exponential population graph"><line x1="35" x2="365" y1="135" y2="135" stroke="currentColor" opacity=".4" /><line x1="35" x2="35" y1="20" y2="135" stroke="currentColor" opacity=".4" /><polyline points={values.map((value, index) => `${x(index * 1.5)},${y(value)}`).join(' ')} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" style={{ transition: 'all .35s ease' }} />{compare && <polyline points={values.map((_, index) => `${x(index * 1.5)},${y(start + index * (output - start) / Math.max(1, time))}`).join(' ')} fill="none" stroke="var(--mui-palette-secondary-main)" strokeDasharray="6 4" strokeWidth="3" />}{scenario.round !== 'match the graph' && <line x1="35" x2="365" y1={y(scenario.target)} y2={y(scenario.target)} stroke="#f6a623" strokeDasharray="7 5" strokeWidth="2" />}<circle cx={x(time)} cy={y(output)} r="7" fill={checked === true ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-secondary-main)'} style={{ transition: 'cx .35s ease, cy .35s ease' }} /><text x="200" y="160" textAnchor="middle" fontSize="12">time (steps)</text><text x="8" y="25" fontSize="12">{view === 'log' ? 'log amount' : scenario.unit}</text></Box><Button size="small" variant={compare ? 'contained' : 'outlined'} onClick={() => setCompare((current) => !current)}>Compare linear growth</Button></Paper></Stack><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', overflowX: 'auto' }}><Typography variant="subtitle2">Values (t, {scenario.unit})</Typography><Stack direction="row" spacing={2} sx={{ mt: .75 }}>{Array.from({ length: 6 }, (_, index) => <Box key={index} sx={{ minWidth: 70 }}><Typography variant="caption" color="text.secondary">t = {index * 2}</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{Math.round(start * factor ** (index * 2) * 100) / 100}</Typography></Box>)}</Stack></Paper>{scenario.round === 'match the graph' ? <Stack direction="row" spacing={1}><Button variant={answer === 'linear' ? 'contained' : 'outlined'} onClick={() => { setAnswer('linear'); setChecked(null) }}>Straight line</Button><Button variant={answer === 'exponential' ? 'contained' : 'outlined'} onClick={() => { setAnswer('exponential'); setChecked(null) }}>Exponential curve</Button></Stack> : <TextField type="number" label={scenario.answerLabel} value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(null) }} placeholder="Type your answer" inputProps={{ step: 'any' }} />}<Stack direction="row" spacing={1.5}><Button variant="contained" onClick={() => setChecked(correct)} disabled={scenario.round === 'match the graph' ? !answer : !answer.trim()}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="text" onClick={next}>Next round</Button></Stack>{checked !== null && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: checked ? 'success.main' : 'error.main', backgroundColor: checked ? 'success.light' : 'error.light', animation: checked ? 'scenarioGlow .45s ease' : 'scenarioShake .35s ease' }}><Typography sx={{ fontWeight: 700 }}>{checked ? `Correct! ${equation}.` : scenario.round === 'how long until' ? 'The target is not reached yet — use the logarithm relationship to estimate the time.' : `Each step multiplies by ${factor}. Try again and watch the curve.`}</Typography></Paper>}<CompleteButton disabled={checked !== true} onComplete={onComplete} /></Stack></EngineFrame>
}

type LimitKind = 'removable hole' | 'continuous' | 'jump' | 'infinite' | 'estimate from a table'
type LimitDefinition = { kind: LimitKind; point: number; limit: number | null; equation: string; evaluate: (x: number) => number }
const limitDefinitions: LimitDefinition[] = [
  { kind: 'removable hole', point: 2, limit: 4, equation: 'f(x) = (x² − 4) ÷ (x − 2)', evaluate: (x) => x + 2 },
  { kind: 'continuous', point: 1, limit: 1, equation: 'f(x) = x²', evaluate: (x) => x ** 2 },
  { kind: 'jump', point: 2, limit: null, equation: 'f(x) = 1 when x < 2; 3 when x ≥ 2', evaluate: (x) => x < 2 ? 1 : 3 },
  { kind: 'infinite', point: 2, limit: null, equation: 'f(x) = 1 ÷ (x − 2)', evaluate: (x) => 1 / (x - 2) },
  { kind: 'estimate from a table', point: 3, limit: 6, equation: 'f(x) = x + 3', evaluate: (x) => x + 3 },
]
const ApproachingPointActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(() => limitDefinitions[Math.floor(Math.random() * limitDefinitions.length)])
  const [leftDistance, setLeftDistance] = useState(.5)
  const [rightDistance, setRightDistance] = useState(.5)
  const [leftValues, setLeftValues] = useState<number[]>([])
  const [rightValues, setRightValues] = useState<number[]>([])
  const [answer, setAnswer] = useState('')
  const [choice, setChoice] = useState<'exists' | 'dne' | ''>('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const leftX = round.point - leftDistance
  const rightX = round.point + rightDistance
  const leftValue = round.evaluate(leftX)
  const rightValue = round.evaluate(rightX)
  const approach = (side: 'left' | 'right') => { if (side === 'left') { setLeftDistance((value) => value / 2); setLeftValues((values) => [...values, leftValue]) } else { setRightDistance((value) => value / 2); setRightValues((values) => [...values, rightValue]) }; setChecked(null) }
  const creep = () => { approach('left'); approach('right') }
  const correct = leftValues.length >= 3 && rightValues.length >= 3 && (round.limit === null ? choice === 'dne' : choice === 'exists' && answer.trim() !== '' && Math.abs(Number(answer) - round.limit) <= .05)
  const reset = () => { setLeftDistance(.5); setRightDistance(.5); setLeftValues([]); setRightValues([]); setAnswer(''); setChoice(''); setChecked(null) }
  const next = () => { const item = limitDefinitions[Math.floor(Math.random() * limitDefinitions.length)]; setRound(item); setLeftDistance(.5); setRightDistance(.5); setLeftValues([]); setRightValues([]); setAnswer(''); setChoice(''); setChecked(null) }
  const mapX = (value: number) => 35 + ((value - (round.point - 3)) / 6) * 330
  const mapY = (value: number) => 135 - Math.max(-8, Math.min(8, value)) / 16 * 105
  const points = Array.from({ length: 25 }, (_, index) => { const xValue = round.point - 3 + index * .25; const value = round.evaluate(xValue); return Number.isFinite(value) && Math.abs(xValue - round.point) > .01 ? `${mapX(xValue)},${mapY(value)}` : '' }).filter(Boolean).join(' ')
  const statusText = correct ? (round.limit === null ? 'Correct! The left and right values do not settle on the same limit.' : `Correct! As x approaches ${round.point}, f(x) approaches ${round.limit}, even though the marker is still moving.`) : 'Compare the left and right values — do they settle on the same number?'
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack spacing={2.25}><Paper elevation={0} sx={{ p: 2, background: 'linear-gradient(135deg, rgba(16,125,111,.12), rgba(79,140,255,.08))', border: 1, borderColor: 'divider' }}><Chip label={`${round.kind} round`} color="primary" size="small" /><Typography variant="h6" sx={{ mt: .75 }}>Move the marker toward x = {round.point} from both sides. What value does f(x) approach?</Typography><Typography color="text.secondary" sx={{ fontFamily: 'monospace' }}>{round.equation}</Typography></Paper><Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 230, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`Graph of ${round.equation}`}><defs><pattern id="limit-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" opacity=".12" /></pattern></defs><rect width="400" height="170" fill="url(#limit-grid)" /><line x1="35" x2="365" y1="135" y2="135" stroke="currentColor" opacity=".45" /><line x1={mapX(round.point)} x2={mapX(round.point)} y1="20" y2="145" stroke="#f6a623" strokeDasharray="5 4" /><polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" style={{ transition: 'all .35s ease' }} />{round.kind === 'removable hole' && <circle cx={mapX(round.point)} cy={mapY(round.limit ?? 0)} r="7" fill="var(--mui-palette-background-default)" stroke="#e94f64" strokeWidth="3" />}{round.kind === 'infinite' && <line x1={mapX(round.point)} x2={mapX(round.point)} y1="20" y2="145" stroke="#e94f64" strokeDasharray="4 3" /> }<line x1={mapX(leftX)} x2={mapX(leftX)} y1={mapY(leftValue)} y2="135" stroke="var(--mui-palette-secondary-main)" strokeDasharray="4 3" /><line x1={mapX(leftX)} x2="35" y1={mapY(leftValue)} y2={mapY(leftValue)} stroke="var(--mui-palette-secondary-main)" strokeDasharray="4 3" /><circle cx={mapX(leftX)} cy={mapY(leftValue)} r="7" fill="var(--mui-palette-secondary-main)" style={{ transition: 'cx .35s ease, cy .35s ease' }} /><text x="200" y="160" textAnchor="middle" fontSize="12">x-axis · approach point {round.point}</text><text x="8" y="25" fontSize="12">f(x)</text></Box><Typography sx={{ fontFamily: 'monospace', textAlign: 'center' }}>x = {leftX.toFixed(3)} → f(x) = {Number.isFinite(leftValue) ? leftValue.toFixed(3) : 'undefined'}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={() => approach('left')}>Approach from left</Button><Button variant="outlined" onClick={() => approach('right')}>Approach from right</Button><Button variant="contained" onClick={creep}>Creep closer</Button></Stack></Paper><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2">Convergence table</Typography><Stack direction="row" spacing={4} sx={{ mt: .75 }}><Box><Typography variant="caption">Left side</Typography>{leftValues.slice(-4).map((value, index) => <Typography key={index} variant="body2">x → {value.toFixed(3)}</Typography>)}</Box><Box><Typography variant="caption">Right side</Typography>{rightValues.slice(-4).map((value, index) => <Typography key={index} variant="body2">x → {value.toFixed(3)}</Typography>)}</Box></Stack></Paper>{round.limit === null ? <Stack direction="row" spacing={1}><Button variant={choice === 'exists' ? 'contained' : 'outlined'} onClick={() => setChoice('exists')}>Limit exists</Button><Button variant={choice === 'dne' ? 'contained' : 'outlined'} onClick={() => setChoice('dne')}>Limit does not exist</Button></Stack> : <TextField type="number" label="Estimated limit" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(null) }} placeholder="Type the limit" inputProps={{ step: 'any' }} />}<Stack direction="row" spacing={1.5}><Button variant="contained" onClick={() => setChecked(correct)} disabled={round.limit === null ? !choice : !answer.trim()}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="text" onClick={next}>Next round</Button></Stack>{checked !== null && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: checked ? 'success.main' : 'error.main', backgroundColor: checked ? 'success.light' : 'error.light', animation: checked ? 'scenarioGlow .45s ease' : 'scenarioShake .35s ease' }}><Typography sx={{ fontWeight: 700 }}>{statusText}</Typography></Paper>}<CompleteButton disabled={checked !== true} onComplete={onComplete} /></Stack></EngineFrame>
}

type TrigRound = { kind: 'read values' | 'find angle' | 'signs and quadrants' | 'radians' | 'identity'; target: number; prompt: string }
const trigRounds: TrigRound[] = [
  { kind: 'read values', target: 30, prompt: 'Rotate the point to 30° and enter sin θ.' },
  { kind: 'find angle', target: 60, prompt: 'Rotate until sin θ = √3/2, then enter the angle.' },
  { kind: 'signs and quadrants', target: 135, prompt: 'At this angle, which ratios are positive?' },
  { kind: 'radians', target: 45, prompt: 'Convert the current angle to radians.' },
  { kind: 'identity', target: 30, prompt: 'Use the live triangle to verify sin²θ + cos²θ = 1.' },
]
const UnitCircleSpinnerActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(() => trigRounds[Math.floor(Math.random() * trigRounds.length)])
  const [answer, setAnswer] = useState('')
  const [choice, setChoice] = useState('')
  const [radians, setRadians] = useState(false)
  const [checked, setChecked] = useState<boolean | null>(null)
  const [angleState, setAngleState] = useState(round.kind === 'find angle' ? 45 : round.target)
  const angle = angleState
  const theta = angle * Math.PI / 180
  const sine = Math.sin(theta)
  const cosine = Math.cos(theta)
  const tangent = Math.abs(cosine) < .0001 ? null : Math.tan(theta)
  const quadrant = angle % 360 < 90 ? 'I' : angle % 360 < 180 ? 'II' : angle % 360 < 270 ? 'III' : 'IV'
  const correct = round.kind === 'signs and quadrants' ? choice === (sine > 0 ? 'sin' : '') + (cosine > 0 ? 'cos' : '') : round.kind === 'identity' ? answer.trim() !== '' && Math.abs(Number(answer) - (sine ** 2 + cosine ** 2)) < .01 : round.kind === 'read values' ? answer.trim() !== '' && Math.abs(Number(answer) - sine) < .03 && Math.abs(angle - round.target) <= 1 : round.kind === 'find angle' ? answer.trim() !== '' && Math.abs(Number(answer) - round.target) <= 2 && Math.abs(sine - Math.sin(round.target * Math.PI / 180)) < .03 : answer.trim() !== '' && Math.abs(Number(answer) - round.target * Math.PI / 180) < .03
  const setAngle = (next: number) => { setAngleValue(next); setChecked(null) }
  const setAngleValue = (next: number) => setAngleState(((next % 360) + 360) % 360)
  const currentAngle = angleState
  const currentTheta = currentAngle * Math.PI / 180
  const currentSin = Math.sin(currentTheta)
  const currentCos = Math.cos(currentTheta)
  const currentTan = Math.abs(currentCos) < .0001 ? null : Math.tan(currentTheta)
  const chooseRound = () => { const next = trigRounds[Math.floor(Math.random() * trigRounds.length)]; setRound(next); setAngleState(next.target); setAnswer(''); setChoice(''); setChecked(null) }
  const reset = () => { setAngleState(round.kind === 'find angle' ? 45 : round.target); setAnswer(''); setChoice(''); setChecked(null) }
  const cx = 130; const cy = 130; const radius = 92; const px = cx + currentCos * radius; const py = cy - currentSin * radius
  const wave = Array.from({ length: 25 }, (_, index) => `${220 + index * 7},${95 - Math.sin(index / 24 * Math.PI * 2) * 35}`).join(' ')
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack spacing={2.25}><Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', background: 'linear-gradient(135deg, rgba(16,125,111,.12), rgba(79,140,255,.08))' }}><Chip label={`${round.kind} round`} color="primary" size="small" /><Typography variant="h6" sx={{ mt: .75 }}>{round.prompt}</Typography></Paper><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper elevation={0} sx={{ p: 1, flex: 1, border: 1, borderColor: 'divider' }}><Box component="svg" viewBox="0 0 420 260" sx={{ width: '100%', height: 300, touchAction: 'none' }} role="img" aria-label={`Unit circle at ${currentAngle} degrees`}><line x1="35" x2="225" y1={cy} y2={cy} stroke="currentColor" opacity=".5" /><line x1={cx} x2={cx} y1="35" y2="225" stroke="currentColor" opacity=".5" /><circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="3" />{[-1, 0, 1].map((mark) => <g key={mark}><line x1={cx + mark * radius} x2={cx + mark * radius} y1={cy - 5} y2={cy + 5} stroke="currentColor" /><text x={cx + mark * radius} y={cy + 20} textAnchor="middle" fontSize="11">{mark}</text><line x1={cx - 5} x2={cx + 5} y1={cy - mark * radius} y2={cy - mark * radius} stroke="currentColor" /><text x={cx - 14} y={cy - mark * radius + 4} textAnchor="middle" fontSize="11">{mark}</text></g>)}<line x1={cx} y1={cy} x2={px} y2={py} stroke="#107d6f" strokeWidth="3" /><line x1={px} y1={py} x2={px} y2={cy} stroke="#e94f64" strokeDasharray="5 4" strokeWidth="3" /><line x1={cx} y1={cy} x2={px} y2={cy} stroke="#4f8cff" strokeWidth="3" /><path d={`M ${cx + 35} ${cy} A 35 35 0 ${currentAngle > 180 ? 1 : 0} 0 ${cx + 35 * currentCos} ${cy - 35 * currentSin}`} fill="none" stroke="#f6a623" strokeWidth="2" /><circle cx={px} cy={py} r="9" fill="var(--mui-palette-secondary-main)" onPointerDown={(event) => { const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect(); if (bounds) { const xPos = (event.clientX - bounds.left) / bounds.width * 420; const yPos = (event.clientY - bounds.top) / bounds.height * 260; setAngleState(((Math.atan2(cy - yPos, xPos - cx) * 180 / Math.PI) + 360) % 360) } }} /><text x="130" y="244" textAnchor="middle" fontSize="13">x-axis · cos θ</text><text x="8" y="38" fontSize="13">y-axis · sin θ</text><text x="130" y="26" textAnchor="middle" fontSize="14">θ = {currentAngle}°</text></Box><Stack direction="row" spacing={1} justifyContent="center"><Button size="small" onClick={() => setAngle(currentAngle - 15)}>−15°</Button><Button size="small" variant="contained" onClick={() => setAngle(currentAngle + 15)}>+15°</Button></Stack></Paper><Paper elevation={0} sx={{ p: 2, flex: .8, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Live ratios · Quadrant {quadrant}</Typography><Typography sx={{ mt: 1 }}>θ = {currentAngle}° = {(currentAngle * Math.PI / 180).toFixed(3)} rad</Typography><Typography color="error.main">sin θ = {currentSin.toFixed(3)}</Typography><Typography color="info.main">cos θ = {currentCos.toFixed(3)}</Typography><Typography color="warning.main">tan θ = {currentTan === null ? 'undefined' : currentTan.toFixed(3)}</Typography><Typography sx={{ mt: 1, fontFamily: 'monospace' }}>sin²θ + cos²θ = {(currentSin ** 2 + currentCos ** 2).toFixed(3)}</Typography><Box component="svg" viewBox="0 0 400 130" sx={{ width: '100%', height: 130, mt: 2, backgroundColor: 'background.default' }}><polyline points={wave} fill="none" stroke="#e94f64" strokeWidth="3" /><line x1={220 + currentAngle / 360 * 168} x2={220 + currentAngle / 360 * 168} y1="15" y2="115" stroke="#107d6f" strokeDasharray="4 3" /><text x="220" y="125" fontSize="12">sine wave · angle marker</text></Box></Paper></Stack><Stack direction="row" spacing={1}><Button size="small" variant={radians ? 'contained' : 'outlined'} onClick={() => setRadians((value) => !value)}>{radians ? 'Show degrees' : 'Show radians'}</Button>{round.kind === 'signs and quadrants' ? <><Button size="small" variant={choice.includes('sin') ? 'contained' : 'outlined'} onClick={() => setChoice(choice.includes('sin') ? '' : `${cosine > 0 ? 'cos' : ''}${sine > 0 ? 'sin' : ''}`)}>sin positive</Button><Button size="small" variant={choice.includes('cos') ? 'contained' : 'outlined'} onClick={() => setChoice(choice.includes('cos') ? '' : `${sine > 0 ? 'sin' : ''}${cosine > 0 ? 'cos' : ''}`)}>cos positive</Button></> : <TextField size="small" type="number" label={round.kind === 'radians' ? 'Radians' : round.kind === 'identity' ? 'Identity value' : round.kind === 'find angle' ? 'Angle in degrees' : 'sin θ'} value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(null) }} placeholder="Type your answer" inputProps={{ step: 'any' }} />}</Stack><Stack direction="row" spacing={1.5}><Button variant="contained" onClick={() => setChecked(correct)} disabled={round.kind === 'signs and quadrants' ? !choice : !answer.trim()}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="text" onClick={chooseRound}>Next round</Button></Stack>{checked !== null && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: checked ? 'success.main' : 'error.main', backgroundColor: checked ? 'success.light' : 'error.light', animation: checked ? 'scenarioGlow .45s ease' : 'scenarioShake .35s ease' }}><Typography sx={{ fontWeight: 700 }}>{checked ? `Correct! At ${currentAngle}°, sin θ = ${currentSin.toFixed(3)} and cos θ = ${currentCos.toFixed(3)}.` : 'Sine is the height of the point — how high is it now?'}</Typography></Paper>}<CompleteButton disabled={checked !== true} onComplete={onComplete} /></Stack></EngineFrame>
}

type DistanceRound = 'explore' | 'find the distance' | 'find the midpoint' | 'missing endpoint' | 'real-world'
type DistanceDefinition = { kind: DistanceRound; a: [number, number]; b: [number, number]; prompt: string }
const distanceRounds: DistanceDefinition[] = [
  { kind: 'explore', a: [-2, 1], b: [3, 4], prompt: 'Click two points on the grid and watch the distance appear.' },
  { kind: 'find the distance', a: [1, 2], b: [5, 5], prompt: 'Click the two given points, then enter their distance.' },
  { kind: 'find the midpoint', a: [-4, -2], b: [2, 4], prompt: 'Place both points, then enter the midpoint coordinates as x,y.' },
  { kind: 'missing endpoint', a: [-2, 3], b: [4, -1], prompt: 'Place the endpoints and calculate the missing coordinate pattern.' },
  { kind: 'real-world', a: [-3, -1], b: [4, 3], prompt: 'Two map locations are marked. Find the direct distance between them.' },
]
const DistanceDetectiveActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(() => distanceRounds[Math.floor(Math.random() * distanceRounds.length)])
  const [points, setPoints] = useState<Array<[number, number]>>([])
  const [answer, setAnswer] = useState('')
  const [midpoint, setMidpoint] = useState(false)
  const [checked, setChecked] = useState<boolean | null>(null)
  const a = points[0] ?? round.a
  const b = points[1] ?? round.b
  const dx = b[0] - a[0]; const dy = b[1] - a[1]; const distance = Math.sqrt(dx ** 2 + dy ** 2); const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const map = (point: [number, number]) => [35 + (point[0] + 6) / 12 * 330, 170 - (point[1] + 6) / 12 * 140]
  const plotA = map(a); const plotB = map(b); const plotM = map(mid as [number, number])
  const addPoint = (event: React.PointerEvent<SVGSVGElement>) => { const bounds = event.currentTarget.getBoundingClientRect(); const xValue = Math.max(-6, Math.min(6, Math.round(((event.clientX - bounds.left) / bounds.width * 12) - 6))); const yValue = Math.max(-6, Math.min(6, Math.round(6 - (event.clientY - bounds.top) / bounds.height * 12))); setPoints((current) => current.length < 2 ? [...current, [xValue, yValue]] : [[xValue, yValue]]); setChecked(null) }
  const correct = round.kind === 'find the midpoint' ? answer.trim() === `${mid[0]},${mid[1]}` : answer.trim() !== '' && Math.abs(Number(answer) - distance) <= .1
  const reset = () => { setPoints([]); setAnswer(''); setMidpoint(false); setChecked(null) }
  const next = () => { const item = distanceRounds[Math.floor(Math.random() * distanceRounds.length)]; setRound(item); reset() }
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack spacing={2.25}><Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', background: 'linear-gradient(135deg, rgba(16,125,111,.12), rgba(79,140,255,.08))' }}><Chip label={`${round.kind} round`} color="primary" size="small" /><Typography variant="h6" sx={{ mt: .75 }}>{round.prompt}</Typography></Paper><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper elevation={0} sx={{ p: 1, flex: 1, border: 1, borderColor: 'divider' }}><Box component="svg" viewBox="0 0 400 210" sx={{ width: '100%', height: 300, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.06) 0 1px, transparent 1px 17.5px), repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 1px, transparent 1px 27.5px)', cursor: 'crosshair' }} role="img" aria-label="Coordinate plane" onPointerDown={addPoint}><line x1="35" x2="365" y1="170" y2="170" stroke="currentColor" strokeWidth="2" /><line x1="200" x2="200" y1="30" y2="190" stroke="currentColor" strokeWidth="2" /><text x="365" y="188" fontSize="12">x</text><text x="207" y="32" fontSize="12">y</text>{Array.from({ length: 13 }, (_, index) => <g key={index}><text x={35 + index * 27.5} y="188" textAnchor="middle" fontSize="9">{index - 6}</text><text x="191" y={174 - index * 11.67} textAnchor="end" fontSize="9">{6 - index}</text></g>)}{points.length >= 2 && <><line x1={plotA[0]} y1={plotA[1]} x2={plotB[0]} y2={plotB[1]} stroke="var(--mui-palette-primary-main)" strokeWidth="4" strokeDasharray="7 4" style={{ transition: 'all .4s ease' }} /><line x1={plotA[0]} y1={plotA[1]} x2={plotB[0]} y2={plotA[1]} stroke="#e94f64" strokeDasharray="5 4" /><line x1={plotB[0]} y1={plotA[1]} x2={plotB[0]} y2={plotB[1]} stroke="#4f8cff" strokeDasharray="5 4" /><text x={(plotA[0] + plotB[0]) / 2} y={plotA[1] - 5} textAnchor="middle" fontSize="11">Δx = {Math.abs(dx)}</text><text x={plotB[0] + 5} y={(plotA[1] + plotB[1]) / 2} fontSize="11">Δy = {Math.abs(dy)}</text></>}{points.map((point, index) => { const plotted = map(point); return <g key={index}><circle cx={plotted[0]} cy={plotted[1]} r="8" fill={index === 0 ? '#107d6f' : '#f6a623'} /><text x={plotted[0] + 9} y={plotted[1] - 8} fontSize="12" fontWeight="700">{index === 0 ? `A(${point[0]}, ${point[1]})` : `B(${point[0]}, ${point[1]})`}</text></g> })}{midpoint && points.length >= 2 && <><circle cx={plotM[0]} cy={plotM[1]} r="7" fill="#e94f64" /><text x={plotM[0] + 8} y={plotM[1] - 8} fontSize="12">M({mid[0]}, {mid[1]})</text></>}</Box><Typography variant="caption" color="text.secondary">Click grid intersections to place A, then B. Points snap to whole-number coordinates.</Typography></Paper><Paper elevation={0} sx={{ p: 2, flex: .8, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Live working</Typography><Typography sx={{ fontFamily: 'monospace', mt: 1 }}>d = √(({b[0]} − {a[0]})² + ({b[1]} − {a[1]})²)</Typography><Typography variant="h5" color="primary.main" sx={{ mt: 1 }}>{points.length >= 2 ? `${distance.toFixed(2)} units` : 'Place two points'}</Typography><Typography sx={{ mt: 1 }}>Midpoint: ({mid[0]}, {mid[1]})</Typography><Button size="small" variant={midpoint ? 'contained' : 'outlined'} onClick={() => setMidpoint((value) => !value)} disabled={points.length < 2}>Show midpoint</Button><TextField type="text" label={round.kind === 'find the midpoint' ? 'Midpoint x,y' : 'Distance'} value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(null) }} placeholder="Your answer" sx={{ mt: 2 }} /></Paper></Stack><Stack direction="row" spacing={1.5}><Button variant="contained" onClick={() => setChecked(correct)} disabled={points.length < 2 || !answer.trim()}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="text" onClick={next}>Next round</Button></Stack>{checked !== null && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: checked ? 'success.main' : 'error.main', backgroundColor: checked ? 'success.light' : 'error.light', animation: checked ? 'scenarioGlow .45s ease' : 'scenarioShake .35s ease' }}><Typography sx={{ fontWeight: 700 }}>{checked ? `Correct! The distance from (${a[0]}, ${a[1]}) to (${b[0]}, ${b[1]}) is ${distance.toFixed(2)}.` : 'Find the horizontal and vertical differences first, then use the Pythagorean theorem.'}</Typography></Paper>}<CompleteButton disabled={checked !== true} onComplete={onComplete} /></Stack></EngineFrame>
}

type GardenObject = { id: string; icon: string; label: string; left: number; top: number; size: number }
type GardenRound = { objects: GardenObject[] }

const GARDEN_OBJECTS = [
  { icon: '🐞', label: 'ladybug' },
  { icon: '🐝', label: 'bee' },
  { icon: '🐌', label: 'snail' },
  { icon: '🍎', label: 'apple' },
  { icon: '🍓', label: 'strawberry' },
  { icon: '🍇', label: 'grapes' },
]

const createGardenRound = () => {
  const total = 3 + Math.floor(Math.random() * 8)
  const objects = Array.from({ length: total }, (_, index) => {
    const item = GARDEN_OBJECTS[Math.floor(Math.random() * GARDEN_OBJECTS.length)]
    return { id: `garden-${Date.now()}-${index}`, ...item, left: 10 + Math.random() * 78, top: 12 + Math.random() * 70, size: 34 + Math.floor(Math.random() * 20) }
  })
  return { objects }
}

const CountingGardenActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [roundNumber, setRoundNumber] = useState(0)
  const [round, setRound] = useState<GardenRound>(() => createGardenRound())
  const [counted, setCounted] = useState<string[]>([])
  const [animating, setAnimating] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const countedCount = counted.length
  const toggleObject = (id: string) => {
    if (animating === id) return
    if (counted.includes(id)) {
      setCounted((current) => current.filter((item) => item !== id))
      setChecked(false)
      setCorrect(false)
      return
    }
    setAnimating(id)
    window.setTimeout(() => {
      setCounted((current) => current.includes(id) ? current : [...current, id])
      setAnimating(null)
      setChecked(false)
      setCorrect(false)
    }, 220)
  }
  const reset = () => { setCounted([]); setAnimating(null); setChecked(false); setCorrect(false); setCompleted(false) }
  const nextRound = () => { setRoundNumber((current) => current + 1); setRound(createGardenRound()); reset() }
  const checkActivity = () => { const isCorrect = countedCount === round.objects.length; setChecked(true); setCorrect(isCorrect) }
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Chip label="Foundation" color="primary" sx={{ alignSelf: 'flex-start' }} /><Typography variant="h6">Round {roundNumber + 1}: Count the garden objects</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch"><Box sx={{ flex: 1, minHeight: 320, position: 'relative', overflow: 'hidden', borderRadius: 3, border: 2, borderColor: correct ? 'success.main' : 'divider', background: 'linear-gradient(180deg, #b9edff 0 30%, #77cb70 30% 100%)', animation: correct ? 'gardenCelebrate .8s ease-in-out' : checked && !correct ? 'gardenShake .35s ease' : 'none', '@keyframes gardenShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } }, '@keyframes gardenCelebrate': { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.02)' } }, '&:after': { content: '""', position: 'absolute', inset: '30% 0 0', background: 'repeating-linear-gradient(165deg, rgba(38, 112, 54, .18) 0 2px, transparent 2px 14px)', pointerEvents: 'none' } }}><Typography sx={{ position: 'absolute', top: 10, left: 14, zIndex: 2, color: '#1e6a46', fontWeight: 800 }}>Garden patch</Typography><Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>{round.objects.map((object) => { const isCounted = counted.includes(object.id); const isAnimating = animating === object.id; return <Box key={object.id} component="button" type="button" onClick={() => toggleObject(object.id)} aria-label={`${isCounted ? 'Uncount' : 'Count'} ${object.label}`} sx={{ position: 'absolute', left: `${object.left}%`, top: `${object.top}%`, transform: 'translate(-50%, -50%)', width: object.size + 22, height: object.size + 22, p: 0, display: 'grid', placeItems: 'center', border: 0, borderRadius: '50%', backgroundColor: isCounted ? 'rgba(255,255,255,.7)' : 'transparent', cursor: 'pointer', fontSize: object.size, lineHeight: 1, filter: isCounted ? 'drop-shadow(0 0 8px rgba(255,255,255,.95))' : 'none', animation: isAnimating ? 'gardenPop .42s ease' : correct ? 'gardenBounce .8s ease-in-out infinite' : 'none', '&:hover': { transform: 'translate(-50%, -50%) scale(1.12)' }, '@keyframes gardenPop': { '0%': { transform: 'translate(-50%, -50%) scale(.7) rotate(-8deg)' }, '55%': { transform: 'translate(-50%, -50%) scale(1.18) rotate(8deg)' }, '100%': { transform: 'translate(-50%, -50%) scale(1) rotate(0)' } }, '@keyframes gardenBounce': { '0%, 100%': { marginTop: 0 }, '50%': { marginTop: -8 } } }}>{object.icon}{isCounted && <Typography component="span" sx={{ position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: 'success.main', color: 'common.white', fontSize: 13, fontWeight: 900 }}>✓</Typography>}</Box> })}</Box></Box><Paper elevation={0} sx={{ minWidth: { sm: 150 }, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Typography variant="overline" color="text.secondary">Count so far</Typography><Typography variant="h1" color="primary.main" sx={{ fontWeight: 900, lineHeight: 1, animation: animating ? 'gardenCounterBounce .3s ease' : 'none', '@keyframes gardenCounterBounce': { '0%': { transform: 'scale(.8)' }, '65%': { transform: 'scale(1.16)' }, '100%': { transform: 'scale(1)' } } }}>{countedCount}!</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Tap an object to count it. Tap again to undo.</Typography></Paper></Stack><Typography variant="body1" sx={{ fontWeight: 700 }}>Count the garden objects: {countedCount} of {round.objects.length}.</Typography><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="outlined" onClick={checkActivity}>Check Activity</Button></Stack>{checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'warning.main', backgroundColor: correct ? 'success.light' : 'background.default' }}><Typography color={correct ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700 }}>{correct ? `You counted all ${round.objects.length}!` : `Keep counting! ${round.objects.length - countedCount} more to go.`}</Typography></Paper>}{correct && !completed && <CompleteButton onComplete={() => { setCompleted(true); onComplete?.() }} />}{completed && <Stack direction="row" spacing={1} alignItems="center"><Typography color="success.main" sx={{ fontWeight: 700 }}>Activity complete!</Typography><Button variant="outlined" onClick={nextRound}>Next round</Button></Stack>}</EngineFrame>
}

type ParabolaCoefficients = { a: number; b: number; c: number }
type ParabolaRoundType = 'match the curve' | 'hit the roots' | 'hit the vertex' | 'read the graph' | 'factor it'
type ParabolaRound = {
  type: ParabolaRoundType
  title: string
  instruction: string
  target: ParabolaCoefficients
  readMode?: 'roots' | 'vertex' | 'y-intercept'
  factoredForm?: string
}

const PARABOLA_TARGETS: Record<ParabolaRoundType, ParabolaCoefficients[]> = {
  'match the curve': [{ a: 2, b: -4, c: -3 }, { a: 1, b: 2, c: -3 }, { a: 0.5, b: -1, c: -2 }],
  'hit the roots': [{ a: 1, b: -1, c: -6 }, { a: 1, b: 2, c: -8 }, { a: 1, b: -4, c: 3 }],
  'hit the vertex': [{ a: 1, b: -4, c: 1 }, { a: 0.5, b: 3, c: -2 }, { a: 2, b: 4, c: -1 }],
  'read the graph': [{ a: 1, b: -3, c: -4 }, { a: 1, b: 4, c: -5 }, { a: 0.5, b: -2, c: -3 }],
  'factor it': [{ a: 1, b: -1, c: -6 }, { a: 1, b: 1, c: -12 }, { a: 1, b: -5, c: 6 }],
}

const parabolaNumber = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\\.$/, '')
const signedTerm = (value: number, suffix: string) => `${value < 0 ? '−' : '+'} ${parabolaNumber(Math.abs(value))}${suffix}`
const equationFor = ({ a, b, c }: ParabolaCoefficients) => `y = ${parabolaNumber(a)}x² ${signedTerm(b, 'x')} ${signedTerm(c, '')}`
const rootsFor = ({ a, b, c }: ParabolaCoefficients) => {
  const discriminant = b * b - 4 * a * c
  if (discriminant < -0.0001) return []
  if (Math.abs(discriminant) < 0.0001) return [-b / (2 * a)]
  const rootDistance = Math.sqrt(discriminant)
  return [(-b - rootDistance) / (2 * a), (-b + rootDistance) / (2 * a)].sort((left, right) => left - right)
}
const vertexFor = ({ a, b, c }: ParabolaCoefficients) => {
  const x = -b / (2 * a)
  return { x, y: a * x * x + b * x + c }
}
const closeEnough = (left: number, right: number, tolerance = 0.12) => Math.abs(left - right) <= tolerance
const coefficientsClose = (left: ParabolaCoefficients, right: ParabolaCoefficients) => closeEnough(left.a, right.a) && closeEnough(left.b, right.b) && closeEnough(left.c, right.c)
const normalizeParabolaAnswer = (value: string) => value.toLowerCase().replace(/[\\s=]/g, '').replace(/−/g, '-').replace(/\^2/g, '²')

const createParabolaRound = (roundNumber: number): ParabolaRound => {
  const types: ParabolaRoundType[] = ['hit the roots', 'match the curve', 'hit the vertex', 'read the graph', 'factor it']
  const type = types[roundNumber % types.length]
  const targets = PARABOLA_TARGETS[type]
  const target = targets[Math.floor(Math.random() * targets.length)]
  if (type === 'hit the roots') {
    const roots = rootsFor(target).map((root) => parabolaNumber(root)).join(' and ')
    return { type, title: 'Hit the roots', instruction: `Adjust a, b and c until the parabola has roots at x = ${roots}.`, target }
  }
  if (type === 'match the curve') return { type, title: 'Match the curve', instruction: 'Adjust a, b and c until your curve overlaps the faint target parabola.', target }
  if (type === 'hit the vertex') {
    const vertex = vertexFor(target)
    return { type, title: 'Hit the vertex', instruction: `Adjust a, b and c until the vertex is at (${parabolaNumber(vertex.x)}, ${parabolaNumber(vertex.y)}).`, target }
  }
  if (type === 'read the graph') {
    return { type, title: 'Read the graph', instruction: 'Read the fixed parabola, then enter the requested feature.', target, readMode: roundNumber % 3 === 0 ? 'roots' : roundNumber % 3 === 1 ? 'vertex' : 'y-intercept' }
  }
  const roots = rootsFor(target)
  const factoredForm = `(x ${roots[0] < 0 ? '+' : '−'} ${parabolaNumber(Math.abs(roots[0]))})(x ${roots[1] < 0 ? '+' : '−'} ${parabolaNumber(Math.abs(roots[1]))})`
  return { type, title: 'Factor it', instruction: `Expand ${factoredForm} and enter the matching equation.`, target, factoredForm }
}

const ParabolaGraph: FC<{ coefficients: ParabolaCoefficients; target?: ParabolaCoefficients; correct: boolean; checked: boolean }> = ({ coefficients, target, correct, checked }) => {
  const width = 640
  const height = 450
  const plot = { left: 120, top: 50, right: 520, bottom: 370 }
  const xMin = -10
  const xMax = 10
  const yMin = -8
  const yMax = 8
  const xToSvg = (x: number) => plot.left + (x - xMin) * 20
  const yToSvg = (y: number) => plot.bottom - (y - yMin) * 20
  const pointsFor = (values: ParabolaCoefficients) => Array.from({ length: 161 }, (_, index) => {
    const x = xMin + index * 0.125
    return `${xToSvg(x)},${yToSvg(values.a * x * x + values.b * x + values.c)}`
  }).join(' ')
  const roots = rootsFor(coefficients)
  const vertex = vertexFor(coefficients)
  const discriminant = coefficients.b * coefficients.b - 4 * coefficients.a * coefficients.c
  const withinX = (x: number) => x >= xMin && x <= xMax
  const withinY = (y: number) => y >= yMin && y <= yMax
  const graphColor = checked && correct ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-primary-main)'
  return <Box sx={{ width: '100%', overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.default', animation: checked && !correct ? 'parabolaShake .35s ease' : 'none', '@keyframes parabolaShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
    <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ display: 'block', width: '100%', minHeight: { xs: 300, sm: 390 } }} role="img" aria-label={`Coordinate graph of ${equationFor(coefficients)}`}>
      <defs><clipPath id="parabola-plot-clip"><rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} /></clipPath><filter id="parabola-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} fill="var(--mui-palette-background-paper)" />
      {Array.from({ length: 21 }, (_, index) => { const value = xMin + index; return <line key={`grid-x-${value}`} x1={xToSvg(value)} x2={xToSvg(value)} y1={plot.top} y2={plot.bottom} stroke="currentColor" opacity={value % 2 === 0 ? '.16' : '.08'} /> })}
      {Array.from({ length: 17 }, (_, index) => { const value = yMin + index; return <line key={`grid-y-${value}`} x1={plot.left} x2={plot.right} y1={yToSvg(value)} y2={yToSvg(value)} stroke="currentColor" opacity={value % 2 === 0 ? '.16' : '.08'} /> })}
      <line x1={plot.left} x2={plot.right} y1={yToSvg(0)} y2={yToSvg(0)} stroke="currentColor" strokeWidth="2" opacity=".65" />
      <line x1={xToSvg(0)} x2={xToSvg(0)} y1={plot.top} y2={plot.bottom} stroke="currentColor" strokeWidth="2" opacity=".65" />
      {Array.from({ length: 11 }, (_, index) => { const value = -10 + index * 2; return <text key={`x-label-${value}`} x={xToSvg(value)} y={plot.bottom + 24} textAnchor="middle" fontSize="12" fill="currentColor">{value}</text> })}
      {Array.from({ length: 9 }, (_, index) => { const value = -8 + index * 2; return <text key={`y-label-${value}`} x={plot.left - 14} y={yToSvg(value) + 4} textAnchor="end" fontSize="12" fill="currentColor">{value}</text> })}
      <text x={plot.right + 8} y={yToSvg(0) + 4} fontSize="13" fontWeight="700" fill="currentColor">x</text><text x={xToSvg(0) + 8} y={plot.top - 10} fontSize="13" fontWeight="700" fill="currentColor">y</text><circle cx={xToSvg(0)} cy={yToSvg(0)} r="5" fill="var(--mui-palette-secondary-main)" /><text x={xToSvg(0) + 9} y={yToSvg(0) - 9} fontSize="11" fill="currentColor">O</text>
      {target && <polyline points={pointsFor(target)} fill="none" stroke="var(--mui-palette-secondary-main)" strokeWidth="3" strokeDasharray="8 7" opacity=".38" clipPath="url(#parabola-plot-clip)" />}
      <polyline points={pointsFor(coefficients)} fill="none" stroke={graphColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#parabola-plot-clip)" filter={checked && correct ? 'url(#parabola-glow)' : undefined} style={{ transition: 'stroke .2s ease' }} />
      {roots.filter(withinX).map((root) => <g key={`root-${root}`}><circle cx={xToSvg(root)} cy={yToSvg(0)} r="7" fill={graphColor} className="parabola-pulse" /><text x={xToSvg(root)} y={yToSvg(0) + 38} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">x = {parabolaNumber(root)}</text></g>)}
      {withinX(vertex.x) && withinY(vertex.y) && <g><line x1={xToSvg(vertex.x)} x2={xToSvg(vertex.x)} y1={yToSvg(vertex.y)} y2={yToSvg(0)} stroke={graphColor} strokeDasharray="5 5" opacity=".7" /><line x1={xToSvg(vertex.x)} x2={xToSvg(0)} y1={yToSvg(vertex.y)} y2={yToSvg(vertex.y)} stroke={graphColor} strokeDasharray="5 5" opacity=".7" /><circle cx={xToSvg(vertex.x)} cy={yToSvg(vertex.y)} r="7" fill={graphColor} filter={checked && correct ? 'url(#parabola-glow)' : undefined} /><text x={xToSvg(vertex.x) + 10} y={yToSvg(vertex.y) - 12} fontSize="12" fontWeight="700" fill="currentColor">V ({parabolaNumber(vertex.x)}, {parabolaNumber(vertex.y)})</text></g>}
      {withinY(coefficients.c) && <g><circle cx={xToSvg(0)} cy={yToSvg(coefficients.c)} r="6" fill="var(--mui-palette-warning-main)" /><text x={xToSvg(0) + 10} y={yToSvg(coefficients.c) + 4} fontSize="12" fontWeight="700" fill="currentColor">(0, {parabolaNumber(coefficients.c)})</text></g>}
      <style>{'.parabola-pulse { animation: parabolaPulse 1.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; } @keyframes parabolaPulse { 0%, 100% { opacity: .65; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.25); } }'}</style>
    </Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ px: 2, pb: 1.5, flexWrap: 'wrap' }}>
      <Chip size="small" label={roots.length ? `Roots: ${roots.map((root) => `x = ${parabolaNumber(root)}`).join(', ')}` : 'No real roots'} color={roots.length ? 'primary' : 'default'} />
      <Chip size="small" label={`Vertex: (${parabolaNumber(vertex.x)}, ${parabolaNumber(vertex.y)})`} />
      <Chip size="small" label={`y-intercept: (0, ${parabolaNumber(coefficients.c)})`} />
      <Chip size="small" label={`Discriminant: ${parabolaNumber(discriminant)} — ${discriminant > 0 ? 'two roots' : discriminant === 0 ? 'one root' : 'no real roots'}`} />
    </Stack>
  </Box>
}

const ParabolaControllerActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [roundNumber, setRoundNumber] = useState(0)
  const [round, setRound] = useState(() => createParabolaRound(0))
  const [coefficients, setCoefficients] = useState<ParabolaCoefficients>({ a: 1, b: 0, c: 0 })
  const [readAnswer, setReadAnswer] = useState({ first: '', second: '' })
  const [equationAnswer, setEquationAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const targetRoots = rootsFor(round.target)
  const targetVertex = vertexFor(round.target)
  const targetDiscriminant = round.target.b * round.target.b - 4 * round.target.a * round.target.c
  const updateCoefficient = (key: keyof ParabolaCoefficients, value: number) => { setCoefficients((current) => ({ ...current, [key]: value })); setChecked(false); setCorrect(false) }
  const reset = () => { setCoefficients({ a: 1, b: 0, c: 0 }); setReadAnswer({ first: '', second: '' }); setEquationAnswer(''); setChecked(false); setCorrect(false); setCompleted(false) }
  const checkActivity = () => {
    let isCorrect = false
    if (round.type === 'hit the roots') isCorrect = rootsFor(coefficients).length === targetRoots.length && rootsFor(coefficients).every((root, index) => closeEnough(root, targetRoots[index]))
    else if (round.type === 'hit the vertex') { const vertex = vertexFor(coefficients); isCorrect = closeEnough(vertex.x, targetVertex.x) && closeEnough(vertex.y, targetVertex.y) }
    else if (round.type === 'read the graph') {
      const first = Number(readAnswer.first)
      const second = Number(readAnswer.second)
      isCorrect = round.readMode === 'roots' ? Number.isFinite(first) && Number.isFinite(second) && closeEnough(first, targetRoots[0]) && closeEnough(second, targetRoots[1]) : round.readMode === 'vertex' ? Number.isFinite(first) && Number.isFinite(second) && closeEnough(first, targetVertex.x) && closeEnough(second, targetVertex.y) : Number.isFinite(first) && closeEnough(first, round.target.c)
    } else if (round.type === 'factor it') isCorrect = normalizeParabolaAnswer(equationAnswer) === normalizeParabolaAnswer(equationFor(round.target))
    else isCorrect = coefficientsClose(coefficients, round.target)
    setChecked(true); setCorrect(isCorrect)
  }
  const nextRound = () => { const next = roundNumber + 1; setRoundNumber(next); setRound(createParabolaRound(next)); reset() }
  const slider = (key: keyof ParabolaCoefficients, label: string, min: number, max: number, step: number) => <Box sx={{ flex: 1, minWidth: 150 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2">{label}</Typography><Chip size="small" label={parabolaNumber(coefficients[key])} color="primary" /></Stack><Slider min={min} max={max} step={step} value={coefficients[key]} marks valueLabelDisplay="off" onChange={(_, next) => updateCoefficient(key, Array.isArray(next) ? next[0] : next)} aria-label={`${label} coefficient`} /></Box>
  const readPrompt = round.readMode === 'roots' ? 'Enter the two roots in ascending order.' : round.readMode === 'vertex' ? 'Enter the vertex coordinates (x, y).' : 'Enter the y-intercept c.'
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Stack spacing={1}><Chip label="Advanced" color="secondary" sx={{ alignSelf: 'flex-start' }} /><Typography variant="h6">Round {roundNumber + 1}: {round.title}</Typography><Typography variant="body2" color="text.secondary">{round.instruction}</Typography></Stack><Typography variant="h5" sx={{ fontFamily: 'monospace', textAlign: 'center', letterSpacing: '.02em' }}>{round.type === 'factor it' ? `y = ${round.factoredForm}` : equationFor(coefficients)}</Typography><ParabolaGraph coefficients={round.type === 'read the graph' ? round.target : coefficients} target={round.type === 'match the curve' ? round.target : undefined} correct={correct} checked={checked} />{round.type !== 'read the graph' && round.type !== 'factor it' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>{slider('a', 'a · stretch / flip', 0.25, 3, 0.25)}{slider('b', 'b · shift', -8, 8, 0.5)}{slider('c', 'c · height', -8, 8, 0.5)}</Stack>}{round.type === 'read the graph' && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{readPrompt}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>{round.readMode === 'y-intercept' ? <TextField size="small" label="c" value={readAnswer.first} onChange={(event) => { setReadAnswer({ first: event.target.value, second: '' }); setChecked(false); setCorrect(false) }} /> : <><TextField size="small" label={round.readMode === 'roots' ? 'root 1' : 'x-coordinate'} value={readAnswer.first} onChange={(event) => { setReadAnswer((current) => ({ ...current, first: event.target.value })); setChecked(false); setCorrect(false) }} /><TextField size="small" label={round.readMode === 'roots' ? 'root 2' : 'y-coordinate'} value={readAnswer.second} onChange={(event) => { setReadAnswer((current) => ({ ...current, second: event.target.value })); setChecked(false); setCorrect(false) }} /></>}</Stack></Paper>}{round.type === 'factor it' && <TextField label="Expanded equation" placeholder="y = x² + ..." value={equationAnswer} onChange={(event) => { setEquationAnswer(event.target.value); setChecked(false); setCorrect(false) }} fullWidth />}{round.type !== 'read the graph' && round.type !== 'factor it' && <Typography variant="body2" color="text.secondary">Live readout: {equationFor(coefficients)}</Typography>}{round.type === 'read the graph' && <Typography variant="body2" color="text.secondary">Fixed equation: {equationFor(round.target)} · Discriminant: {parabolaNumber(targetDiscriminant)}</Typography>}<Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={checkActivity}>Check Activity</Button></Stack>{checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'background.default' }}><Typography sx={{ fontWeight: 700, color: correct ? 'success.main' : 'error.main' }}>{correct ? `Correct! ${targetRoots.length ? `Roots at x = ${targetRoots.map(parabolaNumber).join(' and ')}` : `Vertex at (${parabolaNumber(targetVertex.x)}, ${parabolaNumber(targetVertex.y)})`}.` : round.type === 'hit the roots' ? 'Try lowering c to move the curve down, closer to crossing the axis at those points.' : round.type === 'hit the vertex' ? 'Move the axis of symmetry first, then adjust c to reach the target height.' : 'Check the labels and use the live equation to guide your next adjustment.'}</Typography>{correct && round.type === 'factor it' && <Typography variant="body2">{round.factoredForm} = {equationFor(round.target).replace('y = ', 'y = ')}</Typography>}{correct && <Typography variant="body2">Discriminant {parabolaNumber(targetDiscriminant)} means {targetDiscriminant > 0 ? 'two roots' : targetDiscriminant === 0 ? 'one root' : 'no real roots'}.</Typography>}</Paper>}{correct && !completed && <CompleteButton onComplete={() => { setCompleted(true); onComplete?.() }} />}{completed && <Stack direction="row" spacing={1} alignItems="center"><Typography color="success.main" sx={{ fontWeight: 700 }}>Activity complete.</Typography><Button variant="outlined" onClick={nextRound}>Next round</Button></Stack>}</EngineFrame>
}

const MathActivityEngine: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const initial = topic.title === 'Fractions' ? topic.target : Math.min(Math.max(topic.target - 2, 0), 10)
  const [value, setValue] = useState(initial)
  const [checked, setChecked] = useState(false)
  const [chartValues, setChartValues] = useState([4, 5, 6, 7, 8])
  const [selected, setSelected] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [rulerX, setRulerX] = useState(28)
  const correct = value === topic.target
  const update = (next: number) => { setValue(next); setChecked(false) }
  const finish = <TopicCheck correct={correct} checked={checked} onCheck={() => setChecked(true)} onComplete={onComplete} />
  const frame = (children: ReactNode) => <EngineFrame name={topic.activity} description={topic.activityDescription}>{children}{finish}</EngineFrame>

  if (topic.title === 'Sets') return <ImprovedSetSorterActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Place Value') return <BaseTenBuilderActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Multiplication/Division Concepts') return <ArrayBuilderActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Comparing Numbers') return <NumberBalanceActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Addition & Subtraction') return <TenFrameBuilderActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Angles') return <AngleRotatorActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Time') return <ClockQuestActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Linear Equations') return <LinearEquationActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Data & Statistics') {
    const mean = chartValues.reduce((sum, item) => sum + item, 0) / chartValues.length
    const chartCorrect = Math.round(mean) === topic.target
    return <EngineFrame name={topic.activity} description={topic.activityDescription}><Paper elevation={0} sx={{ p: 2, minHeight: 190, display: 'flex', alignItems: 'flex-end', gap: 1.5, backgroundColor: chartCorrect ? 'success.light' : 'background.default' }}>{chartValues.map((item, index) => <Box key={index} sx={{ flex: 1, height: `${item * 16}px`, backgroundColor: 'primary.main', borderRadius: '6px 6px 0 0', position: 'relative' }}><Typography variant="caption" sx={{ position: 'absolute', top: -22 }}>{item}</Typography></Box>)}</Paper><Typography variant="body2">Drag bars until the rounded mean is {topic.target}.</Typography><Stack direction="row" spacing={1}>{chartValues.map((item, index) => <Slider key={index} min={1} max={10} value={item} onChange={(_, next) => { const n = Array.isArray(next) ? next[0] : next; setChartValues(current => current.map((entry, i) => i === index ? n : entry)) }} aria-label={`Chart bar ${index + 1}`} sx={{ flex: 1 }} />)}</Stack><Chip label={`Mean: ${mean.toFixed(1)}`} /><CompleteButton disabled={!chartCorrect} onComplete={onComplete} /></EngineFrame>
  }
  if (topic.title === 'Fractions') return frame(<><Paper elevation={0} sx={{ p: 2, display: 'grid', placeItems: 'center' }}><Box sx={{ width: 150, height: 150, borderRadius: '50%', background: `conic-gradient(#f6b73c ${value / 8 * 360}deg, #fff3c4 0)`, border: 8, borderColor: '#a85d32' }} /></Paper><Typography variant="body2">Tap pizza slices to show {topic.target}/8.</Typography><Stack direction="row" spacing={1} flexWrap="wrap">{Array.from({ length: 8 }, (_, index) => <Button key={index} variant={index < value ? 'contained' : 'outlined'} onClick={() => update(index + 1)}>Slice {index + 1}</Button>)}</Stack></>)
  if (topic.title === 'Counting & Number Recognition') return <CountingGardenActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Percentages') return <PercentageBatteryActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Decimals') return <DecimalPainterActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Perimeter & Area') return <TileRoomActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Probability') return <ProbabilityMachineActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Sets') return <ImprovedSetSorterActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Simultaneous Equations') return <LineIntersectionActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Quadratic Equations') return <ParabolaControllerActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Polynomial Functions') return <CurveSculptorActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Linear Equations') return frame(<GraphVisual kind="linear" value={value || 1} target={topic.target} setValue={update} />)
  if (topic.title === 'Algebra') return <BalanceEquationActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Functions') return <FunctionMachineActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Integers') return <ElevatorIntegersActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Vectors') return <VectorPlaygroundActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Time') return frame(<><Box component="svg" viewBox="0 0 400 150" sx={{ width: '100%', height: 150, backgroundColor: 'background.default' }}><circle cx="200" cy="75" r="55" fill="none" stroke="currentColor" strokeWidth="3" /><line x1="200" y1="75" x2="200" y2="35" stroke="var(--mui-palette-primary-main)" strokeWidth="5" /><line x1="200" y1="75" x2="245" y2="75" stroke="var(--mui-palette-secondary-main)" strokeWidth="4" /></Box><Slider min={0} max={60} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label="Time visual control" /><Typography>Live value: {value}</Typography></>)
  if (topic.title === 'Trigonometry') return <UnitCircleSpinnerActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Measurement') {
    const updateRuler = (event: PointerEvent<HTMLElement>) => {
      if (!dragging) return
      const bounds = event.currentTarget.getBoundingClientRect()
      const nextRulerX = Math.max(0, Math.min(bounds.width - 330, event.clientX - bounds.left - 20))
      const objectStart = 28
      const objectEnd = objectStart + topic.target * 26
      const liveMeasurement = Math.max(0, Math.min(12, Math.round((objectEnd - nextRulerX) / 26)))
      setRulerX(nextRulerX)
      update(liveMeasurement)
    }
    return frame(<><Typography variant="body2">Drag the ruler alongside the pencil until its zero mark aligns with the pencil tip and the endpoint reads {topic.target} units.</Typography><Box onPointerMove={updateRuler} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} sx={{ position: 'relative', height: 210, overflow: 'hidden', borderRadius: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider', touchAction: 'none' }}><Box sx={{ position: 'absolute', left: 28, top: 32, width: `${topic.target * 26}px`, height: 28, borderRadius: 3, backgroundColor: '#e5b46a', border: 2, borderColor: '#9a6732', transform: 'rotate(-2deg)' }}><Box sx={{ position: 'absolute', right: -10, top: 7, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #9a6732' }} /></Box><Typography sx={{ position: 'absolute', left: 30, top: 65, fontSize: 12, fontWeight: 700 }}>Pencil: {topic.target} units</Typography><Box onPointerDown={() => setDragging(true)} sx={{ position: 'absolute', left: rulerX, top: 108, width: 330, height: 48, borderRadius: 1, backgroundColor: '#f6b73c', border: 2, borderColor: '#a86b00', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', transition: dragging ? 'none' : 'left .2s ease' }}><Box component="svg" viewBox="0 0 330 48" sx={{ width: '100%', height: '100%' }} aria-label={`Ruler currently reads ${value} units`}>{Array.from({ length: 13 }, (_, index) => <g key={index}><line x1={index * 26} x2={index * 26} y1={index % 5 === 0 ? 5 : 17} y2="40" stroke="#5d4200" strokeWidth="2" /><text x={index * 26 + 2} y="14" fontSize="10" fill="#5d4200">{index}</text></g>)}</Box></Box></Box><Typography role="status" color={correct ? 'success.main' : 'text.secondary'}>Live measurement: <strong>{value} units</strong>{correct ? ' — aligned!' : ' — drag the ruler to the pencil endpoint.'}</Typography></>)
  }
  if (topic.title === 'Patterns') return <PatternTrainActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Money') return <ShopSimulatorActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Sequences & Series') return <SequenceBuilderActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Factors & Multiples') return <FactorMachineActivity topic={topic} onComplete={onComplete} />
  if (['Place Value', 'Multiplication/Division Concepts'].includes(topic.title)) return frame(<><Typography>Build with manipulatives: hundreds, tens, ones, or equal groups.</Typography><Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">{Array.from({ length: Math.min(topic.target, 12) }, (_, index) => <Button key={index} onClick={() => update(index === Math.min(topic.target, 12) - 1 ? topic.target : index + 1)} variant={index < value ? 'contained' : 'outlined'}>{topic.title === 'Place Value' ? (index < 3 ? '100' : index < 6 ? '10' : '1') : '● ●'}</Button>)}</Stack><Chip label={`Built value: ${value}`} /></>)
  if (topic.title === 'Pythagorean Theorem') return <TriangleBuilderActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Similarity') return <ShapeScalerActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Geometry') return <ShapeBuilderActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Angles') return frame(<><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 170, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${topic.title} shape visual`}><polygon points={`200,20 ${100 + value * 8},140 ${300 - value * 5},140`} fill="var(--mui-palette-primary-main)" opacity=".3" stroke="var(--mui-palette-primary-main)" strokeWidth="4" /><text x="200" y="160" textAnchor="middle">{value}° angle</text></Box><Slider min={1} max={Math.max(topic.target, 10)} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label="Angles shape control" /><Typography>Rotate the ray to explore this angle.</Typography></>)
  if (topic.title === 'Coordinate Grids') return <CoordinateRobotActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Symmetry') return <MirrorDrawingActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Coordinate Geometry') return <DistanceDetectiveActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Mathematical Modelling') return <ScenarioSolverActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Exponential & Logarithmic Functions') return <GrowthSimulatorActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Limits') return <ImprovedApproachingPointActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Analytical Geometry') return <ShapeAnalyzerActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Differentiation') return <TangentLineActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Integration') return <AreaUnderCurveActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Advanced Algebra') return <EquationChallengeActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Ratios') return <RecipeMixerActivity topic={topic} onComplete={onComplete} />
  return frame(<><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4">{topic.title}</Typography><Typography>Interactive model value: {value}</Typography></Paper><Slider min={0} max={Math.max(topic.target, 10)} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label={`${topic.title} visual control`} /><Typography>{getMathActivityPrompt(topic)}</Typography></>)
}

export const PlatformEnginePreview: FC<{ engineId: PlatformEngineId; onComplete?: () => void; mathTopic?: MathTopic; topicTitle?: string }> = ({ engineId, onComplete, mathTopic, topicTitle }) => {
  const normalizedTopicTitle = topicTitle?.trim().replace(/[’‘]/g, "'")
  if (mathTopic) return <MathActivityEngine topic={mathTopic} onComplete={onComplete} />
  if (engineId === 'formula-builder' || normalizedTopicTitle === 'Chemical Formulae') return <FormulaBuilderActivity onComplete={onComplete} />
  if (engineId === 'photosynthesis-lab' || normalizedTopicTitle === 'Photosynthesis') return <PhotosynthesisLabActivity onComplete={onComplete} />
  if (engineId === 'cell-zoom' || normalizedTopicTitle === 'Cells') return <CellZoomActivity onComplete={onComplete} />
  if (engineId === 'material-sorter' || normalizedTopicTitle === 'Materials Around Us') return <MaterialSorterActivity onComplete={onComplete} />
  if (engineId === 'state-sorter' || normalizedTopicTitle === 'Solids/Liquids/Gases') return <StateSorterActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Heat & Cold') return <ParticleHeatActivity onComplete={onComplete} />
  if (engineId === 'particle-state-simulator' || normalizedTopicTitle === 'States of Matter') return <ParticleStateSimulator onComplete={onComplete} />
  if (engineId === 'solution-builder' || normalizedTopicTitle === 'Solutions' || normalizedTopicTitle === 'Dissolving') return <SolutionBuilderActivity onComplete={onComplete} />
  if (engineId === 'acid-base-lab' || normalizedTopicTitle === 'Acids & Bases') return <AcidBaseLabActivity onComplete={onComplete} />
  if (engineId === 'water-properties-lab' || normalizedTopicTitle === 'Water Chemistry') return <WaterPropertiesLabActivity onComplete={onComplete} />
  if (engineId === 'atom-builder' || normalizedTopicTitle === 'Atomic Structure') return <AtomBuilderActivity onComplete={onComplete} />
  if (engineId === 'element-compound-sorter' || normalizedTopicTitle === 'Elements & Compounds') return <ElementCompoundSorterActivity onComplete={onComplete} />
  if (engineId === 'reaction-simulator' || normalizedTopicTitle === 'Chemical Reactions') return <ReactionSimulatorActivity onComplete={onComplete} />
  if (engineId === 'periodic-table' || normalizedTopicTitle === 'Periodic Table') return <PeriodicTableActivity onComplete={onComplete} />
  if (engineId === 'chemical-bonding' || normalizedTopicTitle === 'Chemical Bonding') return <ChemicalBondingActivity onComplete={onComplete} />
  if (engineId === 'materials-properties' || normalizedTopicTitle === 'Properties of Materials' || normalizedTopicTitle === 'Mixing Materials') return <MaterialsPropertiesActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Electromagnetic Induction') return <FaradaySimulation onComplete={onComplete} />
  if (normalizedTopicTitle === 'Pendulum Experiment') return <PendulumSimulation onComplete={onComplete} />
  if (normalizedTopicTitle === 'Forces & Motion') return <ForceMotionLabActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Friction') return <SurfaceTestActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Gravity') return <DropZoneActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Reflection') return <LightRaySimulatorActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Refraction') return <LightThroughMaterialsActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Vectors & Scalars') return <VectorPlaygroundPhysicsActivity onComplete={onComplete} />
  if (normalizedTopicTitle === "Newton's Laws") return <CollisionPlaygroundActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Momentum') return <MomentumLabActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Simple Machines') return <MachinePlaygroundActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Energy') return <EnergyRollerCoasterActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Electricity') return <CircuitBuilderActivity onComplete={onComplete} />
  if (engineId === 'drag-drop') return <DragDropEngine config={{ title: 'Sort living and non-living things', prompt: 'Place each example into the correct category.', categories: ['Living', 'Non-living'], items: [{ id: 'tree', label: 'Tree', correctCategory: 'Living' }, { id: 'rock', label: 'Rock', correctCategory: 'Non-living' }, { id: 'dog', label: 'Dog', correctCategory: 'Living' }, { id: 'water', label: 'Water', correctCategory: 'Non-living' }] }} onComplete={onComplete ?? (() => undefined)} />
  if (engineId === 'living-or-not') return <LivingOrNotActivity onComplete={onComplete} />
  if (engineId === 'plant-labeling') return <PlantLabelingActivity onComplete={onComplete} />
  if (engineId === 'human-body-parts') return <HumanBodyPartsActivity onComplete={onComplete} />
  if (engineId === 'sense-challenge') return <SenseChallengeActivity onComplete={onComplete} />
  if (engineId === 'animal-spotter') return <AnimalSpotterActivity onComplete={onComplete} />
  if (engineId === 'healthy-plate') return <HealthyPlateActivity onComplete={onComplete} />
  if (engineId === 'matching') return <MatchingEngine config={{ title: 'Match shapes and features', prompt: 'Connect each shape to its defining feature.', leftLabel: 'Shape', rightLabel: 'Feature', pairs: [{ id: 'triangle', left: 'Triangle', right: '3 sides' }, { id: 'square', left: 'Square', right: '4 equal sides' }, { id: 'circle', left: 'Circle', right: 'No straight sides' }] }} onComplete={onComplete ?? (() => undefined)} />
  if (engineId === 'number-line') return <NumberLineEngine onComplete={onComplete} />
  if (engineId === 'graph') return <GraphEngine onComplete={onComplete} />
  if (engineId === 'geometry') return <GeometryEngine onComplete={onComplete} />
  if (engineId === 'equation-balance') return <EquationBalanceEngine onComplete={onComplete} />
  if (engineId === 'molecule-atom') return <MoleculeAtomEngine onComplete={onComplete} />
  if (engineId === 'biology-explorer') return <BiologyExplorerEngine onComplete={onComplete} />
  if (engineId === 'microscope') return <MicroscopeEngine onComplete={onComplete} />
  if (engineId === 'timeline') return <TimelineEngine onComplete={onComplete} />
  if (engineId === 'data-chart') return <DataChartEngine onComplete={onComplete} />
  if (engineId === 'simulation') return <SimulationEngine onComplete={onComplete} />
  if (engineId === 'machine-playground') return <MachinePlaygroundActivity onComplete={onComplete} />
  if (engineId === 'energy-roller-coaster') return <EnergyRollerCoasterActivity onComplete={onComplete} />
  if (engineId === 'circuit-builder') return <CircuitBuilderActivity onComplete={onComplete} />
  if (normalizedTopicTitle === 'Push & Pull' || (!normalizedTopicTitle && engineId === 'force-playground')) return <ForcePlaygroundActivity onComplete={onComplete} />
  if (engineId === 'force-motion-lab' || (engineId === 'physics' && normalizedTopicTitle === 'Forces & Motion')) return <ForceMotionLabActivity onComplete={onComplete} />
  if (engineId === 'surface-test' || (engineId === 'physics' && normalizedTopicTitle === 'Friction')) return <SurfaceTestActivity onComplete={onComplete} />
  if (engineId === 'drop-zone' || (engineId === 'physics' && normalizedTopicTitle === 'Gravity')) return <DropZoneActivity onComplete={onComplete} />
  if (engineId === 'light-ray' || (engineId === 'physics' && normalizedTopicTitle === 'Reflection')) return <LightRaySimulatorActivity onComplete={onComplete} />
  if (engineId === 'light-through-materials' || (engineId === 'physics' && normalizedTopicTitle === 'Refraction')) return <LightThroughMaterialsActivity onComplete={onComplete} />
  if (engineId === 'vector-playground-physics' || (engineId === 'physics' && normalizedTopicTitle === 'Vectors & Scalars')) return <VectorPlaygroundPhysicsActivity onComplete={onComplete} />
  if (engineId === 'collision-playground' || (engineId === 'physics' && normalizedTopicTitle === "Newton's Laws")) return <CollisionPlaygroundActivity onComplete={onComplete} />
  if (engineId === 'momentum-lab' || (engineId === 'physics' && normalizedTopicTitle === 'Momentum')) return <MomentumLabActivity onComplete={onComplete} />
  if (engineId === 'motion-track' || (engineId === 'physics' && normalizedTopicTitle === 'Movement')) return <MotionTrackActivity onComplete={onComplete} />
  if (engineId === 'speed-race' || (engineId === 'physics' && normalizedTopicTitle === 'Fast & Slow')) return <SpeedRaceActivity onComplete={onComplete} />
  if (engineId === 'speed-calculator-lab' || (engineId === 'physics' && normalizedTopicTitle === 'Speed & Velocity')) return <SpeedCalculatorLabActivity onComplete={onComplete} />
  if (engineId === 'shadow-lab' || (engineId === 'physics' && normalizedTopicTitle === 'Light & Shadows')) return <ShadowLabActivity onComplete={onComplete} />
  if (engineId === 'wave-simulator' || (engineId === 'physics' && ['Sound & Vibrations', 'Waves'].includes(normalizedTopicTitle ?? ''))) return <WaveSimulatorActivity onComplete={onComplete} />
  if (engineId === 'kinematics' || (engineId === 'physics' && normalizedTopicTitle === 'Kinematics')) return <KinematicsActivity onComplete={onComplete} />
  if (engineId === 'projectile-motion' || (engineId === 'physics' && normalizedTopicTitle === 'Projectile Motion')) return <ProjectileMotionActivity onComplete={onComplete} />
  if (engineId === 'semiconductor' || (engineId === 'physics' && normalizedTopicTitle === 'Semiconductor Electronics')) return <SemiconductorActivity onComplete={onComplete} />
  if (engineId === 'particle-heat' || (engineId === 'physics' && normalizedTopicTitle === 'Heat & Cold')) return <ParticleHeatActivity onComplete={onComplete} />
  if (engineId === 'magnetic-playground' || (engineId === 'physics' && normalizedTopicTitle === 'Magnets')) return <MagneticPlaygroundActivity onComplete={onComplete} />
  if (engineId === 'floating-sinking' || (engineId === 'physics' && normalizedTopicTitle === 'Floating & Sinking')) return <FloatingSinkingActivity onComplete={onComplete} />
  if (engineId === 'physics') return <SimulationEngine onComplete={onComplete} />
  if (engineId === 'virtual-lab') return <VirtualLabEngine onComplete={onComplete} />
  return <PredictionExperimentEngine onComplete={onComplete} />
}
