import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useState } from 'react'

type ShapeName = 'circle' | 'square' | 'triangle' | 'rectangle'
type ShapeObject = { id: string; label: string; shape: ShapeName; artwork: string }
type ActivityRounds = { find: ShapeObject[]; name: { scene: ShapeObject[]; target: ShapeObject }; count: { scene: ShapeObject[]; target: ShapeObject }; sort: ShapeObject[] }
type Props = { onComplete?: () => void }

const SHAPE_NAMES: ShapeName[] = ['circle', 'square', 'triangle', 'rectangle']
const SHAPE_PROPERTIES: Record<ShapeName, { sides: number; corners: number }> = {
  circle: { sides: 0, corners: 0 },
  square: { sides: 4, corners: 4 },
  triangle: { sides: 3, corners: 3 },
  rectangle: { sides: 4, corners: 4 },
}
const OBJECTS_BY_SHAPE: Record<ShapeName, Omit<ShapeObject, 'shape'>[]> = {
  circle: [{ id: 'clock', label: 'Clock', artwork: 'clock' }, { id: 'plate', label: 'Plate', artwork: 'plate' }, { id: 'ball', label: 'Ball', artwork: 'ball' }],
  square: [{ id: 'window', label: 'Window', artwork: 'window' }, { id: 'tile', label: 'Floor tile', artwork: 'tile' }, { id: 'gift', label: 'Gift', artwork: 'gift' }],
  triangle: [{ id: 'pizza', label: 'Pizza slice', artwork: 'pizza' }, { id: 'pennant', label: 'Pennant', artwork: 'pennant' }, { id: 'roof', label: 'Roof', artwork: 'roof' }],
  rectangle: [{ id: 'door', label: 'Door', artwork: 'door' }, { id: 'book', label: 'Book', artwork: 'book' }, { id: 'phone', label: 'Phone', artwork: 'phone' }],
}
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)
const createObject = (shape: ShapeName): ShapeObject => ({ ...randomItem(OBJECTS_BY_SHAPE[shape]), shape })
const createScene = (): ShapeObject[] => {
  const scene: ShapeObject[] = []
  for (const shape of shuffle(['circle', 'circle', 'square', 'triangle', 'rectangle'] as ShapeName[])) {
    const object = createObject(shape)
    scene.push({ ...object, id: `${object.id}-${scene.length}` })
  }
  return shuffle(scene)
}
const createActivityRounds = (): ActivityRounds => {
  const scenes: ShapeObject[][] = []
  const distinctScene = () => {
    let scene = createScene()
    const signature = (items: ShapeObject[]) => items.map(({ label, shape }) => `${label}:${shape}`).sort().join('|')
    while (scenes.some((previous) => signature(previous) === signature(scene))) scene = createScene()
    scenes.push(scene)
    return scene
  }
  const nameScene = distinctScene()
  const countScene = distinctScene()
  return {
    find: distinctScene(),
    name: { scene: nameScene, target: randomItem(nameScene) },
    count: { scene: countScene, target: randomItem(countScene.filter(({ shape }) => shape === 'square' || shape === 'rectangle')) },
    sort: distinctScene(),
  }
}

const ObjectArtwork: FC<{ object: ShapeObject }> = ({ object }) => {
  const body = object.shape === 'circle'
    ? <circle cx="40" cy="40" r="27" />
    : object.shape === 'square'
      ? <rect x="14" y="14" width="52" height="52" rx="2" />
      : object.shape === 'triangle'
        ? <polygon points="40,10 70,66 10,66" />
        : <rect x="19" y="9" width="42" height="62" rx="2" />
  const details = object.artwork === 'clock'
    ? <><path d="M40 25v16l12 8" /><circle cx="40" cy="40" r="2" fill="currentColor" /></>
    : object.artwork === 'window'
      ? <path d="M40 15v50M15 40h50" />
      : object.artwork === 'door'
        ? <><path d="M27 68V20h26v48" /><circle cx="47" cy="44" r="2" fill="currentColor" /></>
        : object.artwork === 'pizza'
          ? <><circle cx="38" cy="43" r="3" fill="currentColor" /><circle cx="49" cy="54" r="3" fill="currentColor" /><circle cx="30" cy="56" r="3" fill="currentColor" /></>
          : object.artwork === 'ball'
            ? <><path d="M20 22c17 9 27 26 31 43M59 21c-15 8-26 26-30 44" /></>
            : null
  return <Box component="svg" viewBox="0 0 80 80" aria-hidden="true" sx={{ width: 72, height: 72, color: 'primary.dark', '& > :first-of-type': { fill: 'primary.light', stroke: 'primary.dark', strokeWidth: 3 }, '& path, & circle:not(:first-child)': { fill: 'none', stroke: 'primary.dark', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } }}>
    {body}{details}
  </Box>
}

const ShapeHuntActivity: FC<Props> = ({ onComplete }) => {
  const [rounds, setRounds] = useState(() => createActivityRounds())
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedObjects, setSelectedObjects] = useState<string[]>([])
  const [selectedShape, setSelectedShape] = useState<ShapeName | null>(null)
  const [sideAnswer, setSideAnswer] = useState('')
  const [cornerAnswer, setCornerAnswer] = useState('')
  const [selectedTrayObject, setSelectedTrayObject] = useState<string | null>(null)
  const [sortedObjects, setSortedObjects] = useState<Record<string, ShapeName>>({})
  const [checked, setChecked] = useState(false)
  const [roundCorrect, setRoundCorrect] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [completed, setCompleted] = useState(false)

  const activeScene = roundIndex === 0 ? rounds.find : roundIndex === 1 ? rounds.name.scene : roundIndex === 2 ? rounds.count.scene : rounds.sort
  const highlightedObject = roundIndex === 1 ? rounds.name.target : rounds.count.target
  const resetAnswer = () => { setChecked(false); setRoundCorrect(false); setFeedback('') }
  const toggleObject = (id: string) => {
    setSelectedObjects((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    resetAnswer()
  }
  const selectShape = (shape: ShapeName) => { setSelectedShape(shape); resetAnswer() }
  const sortedIds = Object.keys(sortedObjects)
  const trayObjects = rounds.sort.filter(({ id }) => !sortedIds.includes(id))
  const sortObject = (id: string, shape: ShapeName) => {
    const object = rounds.sort.find((item) => item.id === id)
    if (!object) return
    if (object.shape !== shape) {
      const properties = SHAPE_PROPERTIES[object.shape]
      setFeedback(`A ${object.shape} has ${properties.sides} sides. ${object.label} belongs in the ${object.shape} bin.`)
      setChecked(false)
      setRoundCorrect(false)
      setSelectedTrayObject(null)
      return
    }
    setSortedObjects((current) => ({ ...current, [id]: shape }))
    setSelectedTrayObject(null)
    resetAnswer()
  }

  const checkActivity = () => {
    let correct = false
    let message = ''
    if (roundIndex === 0) {
      const targetIds = rounds.find.filter(({ shape }) => shape === 'circle').map(({ id }) => id)
      const missed = rounds.find.filter(({ id, shape }) => shape === 'circle' && !selectedObjects.includes(id))
      const extra = rounds.find.find(({ id, shape }) => shape !== 'circle' && selectedObjects.includes(id))
      correct = missed.length === 0 && !extra && selectedObjects.length === targetIds.length
      if (!correct) {
        const details = []
        if (missed.length) details.push(`You missed ${missed.map(({ label }) => `the ${label.toLowerCase()}`).join(' and ')}.`)
        if (extra) details.push(`The ${extra.label.toLowerCase()} is a ${extra.shape}, not a circle.`)
        message = details.join(' ')
      }
    } else if (roundIndex === 1) {
      correct = selectedShape === rounds.name.target.shape
      message = !selectedShape ? 'Choose the shape that matches the highlighted object.' : `The ${rounds.name.target.label.toLowerCase()} is a ${rounds.name.target.shape}, not a ${selectedShape}.`
    } else if (roundIndex === 2) {
      const properties = SHAPE_PROPERTIES[rounds.count.target.shape]
      correct = sideAnswer.trim() !== '' && cornerAnswer.trim() !== '' && Number(sideAnswer) === properties.sides && Number(cornerAnswer) === properties.corners
      message = `${rounds.count.target.label} is a ${rounds.count.target.shape}. It has ${properties.sides} sides and ${properties.corners} corners.`
    } else {
      correct = rounds.sort.every(({ id, shape }) => sortedObjects[id] === shape)
      message = correct ? 'Every object is in the correct shape bin.' : 'Sort every object into its matching shape bin.'
    }
    setChecked(true)
    setRoundCorrect(correct)
    setFeedback(correct ? roundIndex === 3 ? 'Great sorting! Every shape is in the right bin.' : 'Correct! You found the right answer.' : message)
  }
  const nextRound = () => {
    setRoundIndex((current) => current + 1)
    setSelectedObjects([])
    setSelectedShape(null)
    setSideAnswer('')
    setCornerAnswer('')
    setSelectedTrayObject(null)
    setSortedObjects({})
    setChecked(false)
    setRoundCorrect(false)
    setFeedback('')
  }
  const reset = () => {
    setRounds(createActivityRounds())
    setRoundIndex(0)
    setSelectedObjects([])
    setSelectedShape(null)
    setSideAnswer('')
    setCornerAnswer('')
    setSelectedTrayObject(null)
    setSortedObjects({})
    setChecked(false)
    setRoundCorrect(false)
    setFeedback('')
    setCompleted(false)
  }

  const roundLabels = ['Find it', 'Name it', 'Count the sides', 'Sort it']
  const targetName = roundIndex === 0 ? 'circles' : roundIndex === 1 ? `the ${rounds.name.target.label.toLowerCase()}` : roundIndex === 2 ? `the ${rounds.count.target.label.toLowerCase()}` : 'each object by shape'
  const prompt = roundIndex === 0 ? 'Tap all the circles.' : roundIndex === 1 ? 'What shape is the highlighted object?' : roundIndex === 2 ? `How many sides and corners does the highlighted ${rounds.count.target.shape} have?` : 'Sort each object into the matching shape bin.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}><Chip label="Platform engine" color="primary" variant="outlined" /><Chip label="Foundation" color="primary" /><Chip label="Grades 1–2" variant="outlined" /></Stack>
        <Typography variant="h5">Shape Hunt</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Find and name the shapes in everyday objects.</Typography>
      </Box>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" flexWrap="wrap"><Typography variant="h6">Round {roundIndex + 1} of 4: {roundLabels[roundIndex]}</Typography><Chip size="small" label={`Find ${targetName}`} /></Stack>
      <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 700 }}>{prompt}</Typography>

      {roundIndex < 3 ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}>
        {activeScene.map((object) => {
          const selected = roundIndex === 0 ? selectedObjects.includes(object.id) : object.id === highlightedObject.id
          return <Paper key={`${roundIndex}-${object.id}`} component={roundIndex === 0 ? 'button' : 'div'} type={roundIndex === 0 ? 'button' : undefined} onClick={roundIndex === 0 ? () => toggleObject(object.id) : undefined} elevation={0} sx={{ minWidth: 0, p: 1.5, textAlign: 'center', border: 2, borderColor: selected ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: selected ? 'primary.light' : 'background.paper', color: 'text.primary', cursor: roundIndex === 0 ? 'pointer' : 'default', font: 'inherit', transition: 'border-color .15s ease, background-color .15s ease', '&:hover': roundIndex === 0 ? { borderColor: 'primary.main' } : undefined }} aria-pressed={roundIndex === 0 ? selected : undefined} aria-label={`${object.label}${roundIndex === 1 || roundIndex === 2 ? selected ? ', highlighted' : '' : ''}`}>
            <ObjectArtwork object={object} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{object.label}</Typography>
            {(roundIndex === 1 || roundIndex === 2) && selected && <Chip size="small" color="primary" label="Look here" sx={{ mt: .5 }} />}
          </Paper>
        })}
      </Box> : <>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Tap an object, then tap a bin, or drag an object into a bin. Incorrect objects stay in the tray.</Typography>
        <Paper elevation={0} sx={{ p: 1.5, minHeight: 130, border: 1, borderStyle: 'dashed', borderColor: 'divider', backgroundColor: 'background.default' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Objects to sort</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {trayObjects.map((object) => <Button key={object.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/shape-object', object.id)} onClick={() => { setSelectedTrayObject(object.id); setFeedback('') }} variant={selectedTrayObject === object.id ? 'contained' : 'outlined'} sx={{ textTransform: 'none' }}><ObjectArtwork object={object} /><span>{object.label}</span></Button>)}
            {!trayObjects.length && <Typography variant="body2" color="success.main">All objects sorted.</Typography>}
          </Stack>
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1 }}>
          {SHAPE_NAMES.map((shape) => {
            const inBin = rounds.sort.filter(({ id }) => sortedObjects[id] === shape)
            return <Paper key={shape} component="button" type="button" onClick={() => selectedTrayObject && sortObject(selectedTrayObject, shape)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData('text/shape-object'); if (id) sortObject(id, shape) }} elevation={0} aria-label={`${shape} bin`} sx={{ minHeight: 140, p: 1, border: 2, borderStyle: 'dashed', borderColor: selectedTrayObject ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: 'background.paper', color: 'text.primary', cursor: 'pointer', font: 'inherit', '&:hover': { backgroundColor: 'action.hover' } }}>
              <Stack alignItems="center" spacing={.5}><Typography variant="subtitle2" sx={{ textTransform: 'capitalize', fontWeight: 800 }}>{shape}</Typography><Typography variant="caption" color="text.secondary">{SHAPE_PROPERTIES[shape].sides} sides · {SHAPE_PROPERTIES[shape].corners} corners</Typography><Stack direction="row" spacing={.5} flexWrap="wrap" justifyContent="center">{inBin.map((object) => <Chip key={object.id} size="small" label={object.label} color="success" />)}</Stack></Stack>
            </Paper>
          })}
        </Box>
      </>}

      {roundIndex === 1 && <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">{SHAPE_NAMES.map((shape) => <Button key={shape} variant={selectedShape === shape ? 'contained' : 'outlined'} onClick={() => selectShape(shape)} sx={{ textTransform: 'capitalize' }}>{shape}</Button>)}</Stack>}
      {roundIndex === 2 && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center"><TextField type="number" label="Number of sides" value={sideAnswer} onChange={(event) => { setSideAnswer(event.target.value); resetAnswer() }} inputProps={{ min: 0, step: 1 }} /><TextField type="number" label="Number of corners" value={cornerAnswer} onChange={(event) => { setCornerAnswer(event.target.value); resetAnswer() }} inputProps={{ min: 0, step: 1 }} /></Stack>}

      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: checked && roundCorrect ? 'success.main' : checked || roundIndex === 3 ? 'warning.main' : 'divider', backgroundColor: checked && roundCorrect ? 'success.light' : roundIndex === 3 && !checked ? 'warning.light' : 'background.default' }}><Typography color={checked && roundCorrect ? 'success.dark' : roundIndex === 3 && !checked ? 'warning.dark' : checked ? 'warning.dark' : 'text.secondary'} sx={{ fontWeight: 700 }}>{feedback}</Typography></Paper>}
      {roundIndex === 3 && !checked && !feedback && <Typography variant="caption" color="text.secondary">A triangle has 3 sides.</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" flexWrap="wrap">
        <Button variant="outlined" onClick={reset}>Reset</Button>
        <Button variant="contained" onClick={checkActivity} disabled={roundCorrect}>Check Activity</Button>
        {roundCorrect && roundIndex < 3 && <Button variant="contained" color="success" onClick={nextRound}>Next Round</Button>}
        <Button variant="contained" disabled={roundIndex !== 3 || !roundCorrect || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />}>{completed ? 'Completed' : 'Complete Activity'}</Button>
      </Stack>
    </Stack>
  </Paper>
}

export default ShapeHuntActivity
