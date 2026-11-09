import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { type DragEvent, type FC, useEffect, useRef, useState } from 'react'
import { advanceConductionRod, advanceConvection, advanceHeatScene, advanceRadiation, createHeatRound, createHeatSceneState, fastestSourceObject, formatTemperature, heatDirection, objectById, sourceTemperature, temperatureOnSourceAfter, timeToChangeBy, transferTypeDescription, type HeatObjectId, type HeatRound, type HeatSceneState, type MatchItem, type TransferType } from './heat-flow-model'

export type HeatFlowLabProps = { onComplete?: () => void }
type Answers = { firstHot: HeatObjectId | ''; heatDirection: string; transferType: TransferType | ''; match: Record<string, 'Conductor' | 'Insulator' | ''> }
type MiniState = { rod: number[]; convection: [number, number, number]; radiation: number; elapsed: number }
const emptyAnswers = (): Answers => ({ firstHot: '', heatDirection: '', transferType: '', match: {} })
const createMiniState = (round: HeatRound): MiniState => ({ rod: [...round.rodTemperatures], convection: [...round.convectionTemperatures], radiation: round.radiationTemperature, elapsed: 0 })

const Thermometer: FC<{ temperature: number; label: string }> = ({ temperature, label }) => <Box aria-label={`${label}: ${formatTemperature(temperature)} degrees Celsius`} sx={{ display: 'flex', alignItems: 'center', gap: .75 }}><Box sx={{ position: 'relative', width: 14, height: 66, border: 1, borderColor: 'divider', borderRadius: 8, bgcolor: 'background.paper', p: .35, display: 'flex', alignItems: 'flex-end' }}><Box sx={{ width: '100%', height: `${Math.max(6, Math.min(100, temperature))}%`, borderRadius: 6, bgcolor: temperature > 55 ? 'error.main' : temperature > 30 ? 'warning.main' : 'info.main', transition: 'height .2s' }} /><Box sx={{ position: 'absolute', bottom: -5, left: 1, width: 12, height: 12, borderRadius: '50%', bgcolor: temperature > 55 ? 'error.main' : temperature > 30 ? 'warning.main' : 'info.main' }} /></Box><Typography variant="caption" sx={{ minWidth: 48, fontVariantNumeric: 'tabular-nums' }}>{formatTemperature(temperature)}°C</Typography></Box>

const HeatObjectCard: FC<{ round: HeatRound; objectId: HeatObjectId; state: HeatSceneState; onDropTo: (id: HeatObjectId, placement: 'tray' | 'plate' | 'contact') => void }> = ({ round, objectId, state, onDropTo }) => {
  const object = objectById(round, objectId)
  const placement = state.placements[objectId]
  return <Paper draggable onDragStart={(event: DragEvent) => event.dataTransfer.setData('text/plain', objectId)} variant="outlined" sx={{ p: 1.25, minWidth: 155, borderColor: placement === 'contact' ? 'primary.main' : 'divider', cursor: 'grab', touchAction: 'none' }}>
    <Stack spacing={.75} alignItems="center">
      <Box sx={{ width: 75, height: 45, borderRadius: objectId === 'water' ? '50% 50% 10px 10px' : 1, border: 2, borderColor: object.material.color, bgcolor: `${object.material.color}55`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: 'text.primary' }}>{objectId === 'water' ? 'H₂O' : object.material.label}</Box>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center' }}>{objectId === 'block' ? `${object.material.label} block` : object.label}</Typography>
      <Typography variant="caption" color="text.secondary">{placement === 'plate' ? 'On hot plate' : placement === 'contact' ? 'Touching pair' : 'On tray'}</Typography>
      <Thermometer temperature={state.temperatures[objectId]} label={object.label} />
      <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={.5}>
        <Button size="small" onClick={() => onDropTo(objectId, 'plate')}>Plate</Button>
        <Button size="small" onClick={() => onDropTo(objectId, 'contact')}>Touch</Button>
        <Button size="small" onClick={() => onDropTo(objectId, 'tray')}>Tray</Button>
      </Stack>
    </Stack>
  </Paper>
}

const HeatFlowLabActivity: FC<HeatFlowLabProps> = ({ onComplete }) => {
  const [round, setRound] = useState<HeatRound>(createHeatRound)
  const [scene, setSceneState] = useState<HeatSceneState>(() => createHeatSceneState(round))
  const sceneRef = useRef(scene)
  const [running, setRunning] = useState(false)
  const [mini, setMini] = useState<MiniState>(() => createMiniState(round))
  const [activeMini, setActiveMini] = useState<TransferType | null>(null)
  const [miniHasRun, setMiniHasRun] = useState<Record<TransferType, boolean>>({ conduction: false, convection: false, radiation: false })
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const objectA = scene.contactPair[0]
  const objectB = scene.contactPair[1]
  const labelFor = (id: HeatObjectId) => objectById(round, id).label
  const touching = scene.placements[objectA] === 'contact' && scene.placements[objectB] === 'contact'
  const currentDirection = touching ? heatDirection(scene, objectA, objectB) : 'No net flow'
  const currentDifference = Math.abs(scene.temperatures[objectA] - scene.temperatures[objectB])
  const source = sourceTemperature(scene.sourceMode)
  const firstHot = fastestSourceObject(round, source)
  const challengeComplete = touching && scene.placements[firstHot.id] === 'plate' && answers.firstHot === firstHot.id && answers.heatDirection === currentDirection && answers.transferType === round.highlightedScene && miniHasRun[round.highlightedScene] && round.matchItems.every((item) => answers.match[item.label] === item.category) && running === false && scene.sourceSeconds[firstHot.id] >= 2

  useEffect(() => { sceneRef.current = scene }, [scene])

  useEffect(() => {
    if (!running) return undefined
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.min(.1, (now - last) / 1000)
      last = now
      const next = advanceHeatScene(round, sceneRef.current, elapsed * 8)
      sceneRef.current = next
      updateScene(next)
      if (next.elapsedSeconds >= 120) {
        setRunning(false)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, round])

  useEffect(() => {
    if (!activeMini) return undefined
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.min(.1, (now - last) / 1000) * 6
      last = now
      setMini((current) => {
        if (activeMini === 'conduction') return { ...current, rod: advanceConductionRod(current.rod, elapsed), elapsed: current.elapsed + elapsed }
        if (activeMini === 'convection') return { ...current, convection: advanceConvection(current.convection, elapsed), elapsed: current.elapsed + elapsed }
        return { ...current, radiation: advanceRadiation(current.radiation, elapsed), elapsed: current.elapsed + elapsed }
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [activeMini])

  const updateScene = (next: HeatSceneState | ((current: HeatSceneState) => HeatSceneState)) => {
    setSceneState((current) => {
      const value = typeof next === 'function' ? next(current) : next
      sceneRef.current = value
      return value
    })
  }

  const updatePlacement = (id: HeatObjectId, placement: 'tray' | 'plate' | 'contact') => {
    updateScene((current) => {
      const placements = { ...current.placements, [id]: placement }
      let contactPair = current.contactPair
      if (placement === 'contact') {
        const partner = round.objects.find((object) => object.id !== id && placements[object.id] === 'contact')
        if (partner) contactPair = [partner.id, id]
      }
      return { ...current, placements, contactPair }
    })
    setFeedback('idle')
  }
  const handleDrop = (event: DragEvent, placement: 'plate' | 'contact') => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain') as HeatObjectId
    if (id === 'metal' || id === 'block' || id === 'water') updatePlacement(id, placement)
  }
  const changeSource = (hot: boolean) => {
    updateScene((current) => ({ ...current, sourceMode: hot ? 'hot' : 'cold' }))
    setFeedback('idle')
  }
  const startMainScene = () => { setFeedback('idle'); setRunning(true) }
  const stepMainScene = () => {
    setRunning(false)
    updateScene((current) => advanceHeatScene(round, current, 1))
  }
  const runMiniScene = (type: TransferType) => {
    if (activeMini === type) {
      setActiveMini(null)
      return
    }
    setMini((current) => {
      if (type === 'conduction') return { ...current, rod: [...round.rodTemperatures], elapsed: 0 }
      if (type === 'convection') return { ...current, convection: [...round.convectionTemperatures], elapsed: 0 }
      return { ...current, radiation: round.radiationTemperature, elapsed: 0 }
    })
    setMiniHasRun((current) => ({ ...current, [type]: true }))
    setActiveMini(type)
  }
  const chooseAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }))
    setFeedback('idle')
  }
  const assignMatch = (item: MatchItem, category: 'Conductor' | 'Insulator') => {
    setAnswers((current) => ({ ...current, match: { ...current.match, [item.label]: category } }))
    setFeedback('idle')
  }
  const checkActivity = () => setFeedback(challengeComplete ? 'correct' : 'incorrect')
  const reset = () => {
    const nextRound = createHeatRound()
    const nextScene = createHeatSceneState(nextRound)
    setRound(nextRound)
    updateScene(nextScene)
    setRunning(false)
    setMini(createMiniState(nextRound))
    setActiveMini(null)
    setMiniHasRun({ conduction: false, convection: false, radiation: false })
    setAnswers(emptyAnswers())
    setFeedback('idle')
  }
  const handleDragOver = (event: DragEvent) => event.preventDefault()
  const miniButton = (type: TransferType) => <Button variant={activeMini === type ? 'contained' : 'outlined'} startIcon={activeMini === type ? <PauseIcon /> : <PlayArrowIcon />} onClick={() => runMiniScene(type)}>{activeMini === type ? 'Pause' : `Run ${type}`}</Button>
  const zeroDirectionOptions = [{ value: `${objectA} → ${objectB}`, label: `${labelFor(objectA)} → ${labelFor(objectB)}` }, { value: `${objectB} → ${objectA}`, label: `${labelFor(objectB)} → ${labelFor(objectA)}` }, { value: 'No net flow', label: 'No net flow' }]
  const fastHeatingTime = Math.ceil(timeToChangeBy(firstHot, source))
  const fastTempAfter30 = formatTemperature(temperatureOnSourceAfter(firstHot, 30, source))
  const slowObject = round.objects.filter((object) => object.id !== firstHot.id).reduce((slow, object) => timeToChangeBy(object, source) > timeToChangeBy(slow, source) ? object : slow)
  const slowTempAfter30 = formatTemperature(temperatureOnSourceAfter(slowObject, 30, source))
  const wrongMatch = round.matchItems.find((item) => answers.match[item.label] && answers.match[item.label] !== item.category)
  const incompleteMatch = round.matchItems.find((item) => !answers.match[item.label])
  const feedbackText = feedback === 'correct'
    ? 'Correct. Your predictions match the measured heat flow and transfer scenes.'
    : feedback === 'incorrect'
      ? answers.firstHot !== firstHot.id
        ? `${firstHot.label} ${scene.sourceMode === 'hot' ? 'heats' : 'cools'} first: its ${firstHot.material.label.toLowerCase()} conducts energy fastest. After 30 seconds on the ${scene.sourceMode} plate, it reaches ${fastTempAfter30}°C; ${slowObject.label.toLowerCase()} reaches ${slowTempAfter30}°C. It takes about ${fastHeatingTime} seconds to change by 10°C.`
        : scene.placements[firstHot.id] !== 'plate' || scene.sourceSeconds[firstHot.id] < 2
          ? `Put ${firstHot.label.toLowerCase()} on the ${scene.sourceMode} plate and run the simulation. After 30 seconds it reaches ${fastTempAfter30}°C, compared with ${slowTempAfter30}°C for ${slowObject.label.toLowerCase()}.`
          : !touching || answers.heatDirection !== currentDirection
            ? touching ? currentDirection === 'No net flow' ? `The touching objects are both about ${formatTemperature(scene.temperatures[objectA])}°C, so there is no net heat flow.` : `Heat flows from ${scene.temperatures[objectA] > scene.temperatures[objectB] ? labelFor(objectA) : labelFor(objectB)} at ${formatTemperature(Math.max(scene.temperatures[objectA], scene.temperatures[objectB]))}°C to ${scene.temperatures[objectA] > scene.temperatures[objectB] ? labelFor(objectB) : labelFor(objectA)} at ${formatTemperature(Math.min(scene.temperatures[objectA], scene.temperatures[objectB]))}°C because heat moves from warmer to cooler.` : 'Place two objects in the Touching objects area so the simulation can calculate their heat flow.'
            : answers.transferType !== round.highlightedScene || !miniHasRun[round.highlightedScene]
              ? `The featured mini-scene is ${round.highlightedScene}: ${transferTypeDescription[round.highlightedScene]}`
              : wrongMatch ? `${wrongMatch.label} is made from ${wrongMatch.material.label.toLowerCase()}, which this activity classifies as ${wrongMatch.material.category.toLowerCase()}.` : incompleteMatch ? `Choose whether ${incompleteMatch.label.toLowerCase()} is a conductor or an insulator. Its ${incompleteMatch.material.label.toLowerCase()} material is classified as ${incompleteMatch.category.toLowerCase()}.` : `Heat flows from warmer to cooler, and ${firstHot.material.label.toLowerCase()} reaches ${fastTempAfter30}°C after 30 seconds compared with ${slowTempAfter30}°C for ${slowObject.label.toLowerCase()}.`
      : `The touching objects differ by ${formatTemperature(currentDifference)}°C. Heat flows from warmer to cooler; run the highlighted mini-scene and complete the material matches.`

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.25}>
      <Box>
        <Stack direction="row" gap={.75} flexWrap="wrap" sx={{ mb: 1 }}><Chip label="Platform engine" color="primary" variant="outlined" /><Chip label="Physics" variant="outlined" /><Chip label="Grades 5–6" variant="outlined" /></Stack>
        <Typography variant="h5">Heat Flow Lab</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore how heat moves between objects.</Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Hot plate: {scene.sourceMode === 'hot' ? '90°C' : '5°C'} · Experiment time: {formatTemperature(scene.elapsedSeconds)} s</Typography>
        <FormControlLabel control={<Switch checked={scene.sourceMode === 'hot'} onChange={(_, checked) => changeSource(checked)} />} label={scene.sourceMode === 'hot' ? 'Hot source' : 'Cold source'} />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="stretch">
        <Paper variant="outlined" onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, 'plate')} sx={{ flex: 1, minHeight: 175, p: 1.5, display: 'grid', placeItems: 'center', borderStyle: 'dashed', borderColor: 'warning.main', bgcolor: 'warning.50' }}>
          <Stack alignItems="center" spacing={1}><Box sx={{ width: 135, height: 48, borderRadius: 2, bgcolor: scene.sourceMode === 'hot' ? '#e65d3b' : '#4e9fcb', color: 'white', fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 5px 0 rgba(60,50,40,.2)' }}>{scene.sourceMode === 'hot' ? 'HOT PLATE' : 'COLD PLATE'}</Box><Typography variant="caption">Drop an object here to heat or cool it</Typography>{round.objects.filter((object) => scene.placements[object.id] === 'plate').map((object) => <Typography key={object.id} variant="caption">{object.label}</Typography>)}</Stack>
        </Paper>
        <Paper variant="outlined" onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, 'contact')} sx={{ flex: 2, minHeight: 175, p: 1.5, display: 'grid', placeItems: 'center', borderStyle: 'dashed', borderColor: 'primary.main' }}>
          <Stack alignItems="center" spacing={1}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Touching objects</Typography><Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap">{round.objects.filter((object) => scene.placements[object.id] === 'contact').map((object) => <Chip key={object.id} label={`${object.label}: ${formatTemperature(scene.temperatures[object.id])}°C`} color="primary" variant="outlined" />)}{!touching ? <Typography variant="body2">Set two objects to Touch to see heat flow.</Typography> : currentDifference < .1 ? <Typography variant="body2">No net heat flow</Typography> : <Box aria-label={`Heat flows ${currentDirection}; temperature difference ${formatTemperature(currentDifference)} degrees`} sx={{ display: 'flex', alignItems: 'center', gap: .5, color: 'error.main' }}><Box sx={{ height: 4, width: `${Math.max(20, Math.min(120, currentDifference * 2))}px`, bgcolor: 'error.main', borderRadius: 5 }} /><Typography sx={{ fontSize: Math.max(16, Math.min(34, 14 + currentDifference / 3)), fontWeight: 900 }}>{currentDirection.startsWith(objectA) ? '→' : '←'}</Typography></Box>}</Stack><Typography variant="caption" color="text.secondary">Arrow size shows the temperature difference</Typography></Stack>
        </Paper>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} flexWrap="wrap" useFlexGap>
        {round.objects.map((object) => <HeatObjectCard key={object.id} round={round} objectId={object.id} state={scene} onDropTo={updatePlacement} />)}
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={startMainScene} disabled={running} startIcon={<PlayArrowIcon />}>Start heating</Button>
        <Button variant="outlined" onClick={() => setRunning(false)} disabled={!running} startIcon={<PauseIcon />}>Pause</Button>
        <Button variant="outlined" onClick={stepMainScene} disabled={running} startIcon={<SkipNextIcon />}>Step 1 second</Button>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>Objects on the plate exchange heat with the source; touching objects exchange heat with each other.</Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Three ways heat travels</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
            <Paper variant="outlined" sx={{ p: 1.5, flex: 1, borderColor: round.highlightedScene === 'conduction' ? 'primary.main' : 'divider', borderWidth: round.highlightedScene === 'conduction' ? 2 : 1, bgcolor: round.highlightedScene === 'conduction' ? 'action.selected' : 'background.paper' }}><Stack spacing={1}><Typography sx={{ fontWeight: 800 }}>Conduction · metal rod</Typography><Box component="svg" viewBox="0 0 330 95" sx={{ width: '100%', height: 86 }} aria-label="Heat spreading along a metal rod from its left end">{mini.rod.map((temperature, index) => <g key={index}><rect x={15 + index * 42} y="30" width="38" height="28" rx="4" fill={`hsl(${Math.max(200, 210 - temperature * 1.6)}, 70%, 55%)`} stroke="#667680" /><text x={34 + index * 42} y="76" textAnchor="middle" fontSize="10">{formatTemperature(temperature)}°</text></g>)}<text x="14" y="18" fontSize="10">Hot end</text><path d="M8 32 q-6 8 0 16 M2 32 q-6 8 0 16" stroke="#e65d3b" strokeWidth="2" fill="none" /><text x="257" y="18" fontSize="10">Cool end</text></Box>{miniButton('conduction')}{miniHasRun.conduction && <Typography variant="caption">{transferTypeDescription.conduction}</Typography>}</Stack></Paper>
            <Paper variant="outlined" sx={{ p: 1.5, flex: 1, borderColor: round.highlightedScene === 'convection' ? 'primary.main' : 'divider', borderWidth: round.highlightedScene === 'convection' ? 2 : 1, bgcolor: round.highlightedScene === 'convection' ? 'action.selected' : 'background.paper' }}><Stack spacing={1}><Typography sx={{ fontWeight: 800 }}>Convection · pot of water</Typography><Box component="svg" viewBox="0 0 330 95" sx={{ width: '100%', height: 86 }} aria-label="Warm water rises and cool water sinks in a pot"><path d="M70 26 L78 75 Q80 84 90 84 L238 84 Q248 84 250 75 L258 26" fill="#94c9e5" stroke="#566e7b" strokeWidth="3" /><rect x="100" y="88" width="130" height="5" rx="2" fill="#e87554" /><text x="165" y="94" textAnchor="middle" fontSize="8">Heat source</text>{mini.convection.map((temperature, index) => <g key={index}><circle cx="125" cy={68 - index * 22} r="11" fill={temperature > 45 ? '#e87554' : '#72b7dc'} /><text x="145" y={72 - index * 22} fontSize="10">{formatTemperature(temperature)}°C</text></g>)}<path d="M105 70 C82 48 98 31 110 28 M226 34 C248 54 232 70 222 73" fill="none" stroke="#c74b3c" strokeWidth="3" /><text x="104" y="27" fontSize="18" fill="#c74b3c">↑</text><text x="220" y="82" fontSize="18" fill="#3c8db5">↓</text></Box>{miniButton('convection')}{miniHasRun.convection && <Typography variant="caption">{transferTypeDescription.convection}</Typography>}</Stack></Paper>
            <Paper variant="outlined" sx={{ p: 1.5, flex: 1, borderColor: round.highlightedScene === 'radiation' ? 'primary.main' : 'divider', borderWidth: round.highlightedScene === 'radiation' ? 2 : 1, bgcolor: round.highlightedScene === 'radiation' ? 'action.selected' : 'background.paper' }}><Stack spacing={1}><Typography sx={{ fontWeight: 800 }}>Radiation · lamp across a gap</Typography><Box component="svg" viewBox="0 0 330 95" sx={{ width: '100%', height: 86 }} aria-label="Radiation carries heat from a lamp across a gap">{Array.from({ length: 7 }, (_, index) => <path key={index} d={`M${85 + index * 22} 45 q 5 -16 10 0 q 5 16 10 0`} fill="none" stroke="#ed9c3d" strokeWidth="2" />)}<circle cx="42" cy="38" r="14" fill="#f3bf4d" stroke="#916d24" strokeWidth="2" /><path d="M34 50 L50 50 L48 61 L36 61 Z" fill="#b8bec4" stroke="#707980" strokeWidth="2" /><path d="M42 12 V6 M22 18 L17 13 M62 18 L67 13" stroke="#ed9c3d" strokeWidth="2" /><rect x="245" y="28" width="42" height="36" rx="6" fill="#c98a4e" stroke="#795532" strokeWidth="2" /><text x="266" y="83" textAnchor="middle" fontSize="10">Object {formatTemperature(mini.radiation)}°C</text></Box>{miniButton('radiation')}{miniHasRun.radiation && <Typography variant="caption">{transferTypeDescription.radiation}</Typography>}</Stack></Paper>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Predict and check</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>1. Which object {scene.sourceMode === 'hot' ? 'heats up' : 'cools down'} first on the {scene.sourceMode} plate?</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">{round.objects.map((object) => <Button key={object.id} size="small" variant={answers.firstHot === object.id ? 'contained' : 'outlined'} onClick={() => chooseAnswer('firstHot', object.id)}>{object.id === 'block' ? `${object.material.label} block` : object.label}</Button>)}</Stack>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>2. When these two objects touch, which way does heat flow?</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">{zeroDirectionOptions.map((option) => <Button key={option.value} size="small" variant={answers.heatDirection === option.value ? 'contained' : 'outlined'} onClick={() => chooseAnswer('heatDirection', option.value)}>{option.label}</Button>)}</Stack>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>3. Which kind of heat transfer is shown in the highlighted mini-scene: {round.highlightedScene}?</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">{(['conduction', 'convection', 'radiation'] as const).map((type) => <Button key={type} size="small" variant={answers.transferType === type ? 'contained' : 'outlined'} onClick={() => chooseAnswer('transferType', type)}>{type}</Button>)}</Stack>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>4. Match everyday materials with their behavior.</Typography>
          {round.matchItems.map((item) => <MatchRow key={item.label} item={item} answer={answers.match[item.label] ?? ''} onSelect={assignMatch} />)}
          <Typography role="status" color={feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'error.main' : 'text.secondary'} variant="body2">{feedbackText}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={checkActivity} disabled={running} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button>
            <Button variant="outlined" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
            <Button variant="contained" disabled={feedback !== 'correct'} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  </Paper>
}

const MatchRow: FC<{ item: MatchItem; answer: 'Conductor' | 'Insulator' | ''; onSelect: (item: MatchItem, category: 'Conductor' | 'Insulator') => void }> = ({ item, answer, onSelect }) => <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1}><Typography variant="body2" sx={{ minWidth: 130 }}>{item.label}</Typography><Stack direction="row" gap={.75}><Button size="small" variant={answer === 'Conductor' ? 'contained' : 'outlined'} onClick={() => onSelect(item, 'Conductor')}>Conductor</Button><Button size="small" variant={answer === 'Insulator' ? 'contained' : 'outlined'} onClick={() => onSelect(item, 'Insulator')}>Insulator</Button></Stack></Stack>

export default HeatFlowLabActivity
