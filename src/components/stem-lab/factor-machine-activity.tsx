import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'
import { createFactorRound, createMultipleChoiceRound, createMultiplesSequence, getFactorPairs, type FactorPair, type MultipleChoiceRound, type MultiplesSequence } from './factor-machine-data'

type Props = { topic: MathTopic; onComplete?: () => void }
type Mode = 'factors' | 'multiples'
type MultipleTask = 'fill' | 'identify'
type DivisorTest = { quotient: number; remainder: number; pair?: FactorPair }

const ArrayVisual: FC<{ pair: FactorPair }> = ({ pair }) => <Box role="img" aria-label={`${pair.a} rows of ${pair.b} dots`} sx={{ width: '100%', minHeight: 45, display: 'grid', gridTemplateColumns: `repeat(${Math.min(pair.b, 8)}, 7px)`, gridAutoRows: '7px', gap: .4, alignContent: 'center', justifyContent: 'center', p: .5, overflow: 'hidden' }}>{Array.from({ length: pair.a * pair.b }, (_, index) => <Box key={index} sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'secondary.main' }} />)}</Box>

const FactorMachineActivity: FC<Props> = ({ topic, onComplete }) => {
  const [mode, setMode] = useState<Mode>('factors')
  const [roundNumber, setRoundNumber] = useState(0)
  const [round, setRound] = useState(() => createFactorRound(0))
  const [divisorInput, setDivisorInput] = useState('')
  const [testedNumbers, setTestedNumbers] = useState<number[]>([])
  const [testResults, setTestResults] = useState<Record<number, DivisorTest>>({})
  const [foundPairs, setFoundPairs] = useState<Record<string, FactorPair>>({})
  const [trayPairs, setTrayPairs] = useState<string[]>([])
  const [factorMessage, setFactorMessage] = useState('')
  const [factorChecked, setFactorChecked] = useState(false)
  const [factorCorrect, setFactorCorrect] = useState(false)
  const [factorCompleted, setFactorCompleted] = useState(false)
  const [multiplesTask, setMultiplesTask] = useState<MultipleTask>('fill')
  const [sequence, setSequence] = useState<MultiplesSequence>(() => createMultiplesSequence())
  const [sequenceNumberInput, setSequenceNumberInput] = useState(String(sequence.number))
  const [sequenceCountInput, setSequenceCountInput] = useState(String(sequence.count))
  const [sequenceAnswers, setSequenceAnswers] = useState<Record<number, string>>({})
  const [multipleChoice, setMultipleChoice] = useState<MultipleChoiceRound>(() => createMultipleChoiceRound())
  const [testedOptions, setTestedOptions] = useState<number[]>([])
  const [multipleAnswers, setMultipleAnswers] = useState<Record<number, boolean>>({})
  const [multipleFeedback, setMultipleFeedback] = useState<Record<number, string>>({})
  const [multipleCompletedTasks, setMultipleCompletedTasks] = useState<MultipleTask[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [completed, setCompleted] = useState(false)
  const [spinning, setSpinning] = useState(false)

  const expectedPairs = useMemo(() => getFactorPairs(round.target), [round.target])
  const foundPairList = Object.values(foundPairs)
  const correctFactors = expectedPairs.every(({ id }) => trayPairs.includes(id)) && trayPairs.length === expectedPairs.length
  const missingPairs = expectedPairs.filter(({ id }) => !trayPairs.includes(id))
  const sequenceIsCorrect = sequence.missingIndexes.every((index) => sequenceAnswers[index]?.trim() !== '' && Number(sequenceAnswers[index]) === sequence.values[index])
  const multipleChoicesAreCorrect = multipleChoice.options.every((value) => testedOptions.includes(value) && multipleAnswers[value] === multipleChoice.answers.includes(value))
  const multiplesModeCorrect = multipleCompletedTasks.length === 2

  const feedDivisor = () => {
    const divisor = Number(divisorInput)
    if (!Number.isInteger(divisor) || divisor < 1) {
      setFactorMessage('Enter a whole-number divisor greater than zero.')
      return
    }
    const quotient = Math.floor(round.target / divisor)
    const remainder = round.target % divisor
    const result: DivisorTest = { quotient, remainder }
    if (remainder === 0) {
      const a = Math.min(divisor, quotient)
      const b = Math.max(divisor, quotient)
      const pair = { a, b, id: `${a}-${b}` }
      result.pair = pair
      setFoundPairs((current) => ({ ...current, [pair.id]: pair }))
      setFactorMessage(`${round.target} ÷ ${divisor} = ${quotient}, so ${a} × ${b} = ${round.target}. The pair popped out.`)
    } else {
      setFactorMessage(`${round.target} ÷ ${divisor} = ${quotient} remainder ${remainder}, so ${divisor} is not a factor.`)
    }
    setTestResults((current) => ({ ...current, [divisor]: result }))
    setTestedNumbers((current) => current.includes(divisor) ? current : [...current, divisor])
    setDivisorInput('')
    setFactorChecked(false)
    setFactorCorrect(false)
    setFactorCompleted(false)
    setChecked(false)
    setCorrect(false)
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 500)
  }
  const toggleTrayPair = (id: string) => {
    if (!foundPairs[id] || factorCompleted) return
    setTrayPairs((current) => current.includes(id) ? current.filter((pairId) => pairId !== id) : [...current, id])
    setFactorChecked(false)
    setFactorCorrect(false)
    setFactorCompleted(false)
    setFeedback('')
  }
  const dropPair = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/factor-pair')
    if (id && foundPairs[id] && !trayPairs.includes(id)) toggleTrayPair(id)
  }
  const checkFactors = () => {
    const isCorrect = expectedPairs.every(({ id }) => trayPairs.includes(id)) && trayPairs.length === expectedPairs.length
    setFactorChecked(true)
    setFactorCorrect(isCorrect)
    setFactorMessage(isCorrect ? `You found all ${expectedPairs.length} factor pairs of ${round.target}.` : missingPairs.length ? `You’re missing ${missingPairs.length} pair${missingPairs.length === 1 ? '' : 's'}. Keep testing divisors and add each pair to the tray.` : 'Remove any extra pair from the output tray.')
  }
  const completeFactorRound = () => {
    setFactorCompleted(true)
    onComplete?.()
  }
  const nextFactorRound = () => {
    const nextRoundNumber = roundNumber + 1
    const nextRound = createFactorRound(nextRoundNumber, round.target)
    setRoundNumber(nextRoundNumber)
    setRound(nextRound)
    setDivisorInput('')
    setTestedNumbers([])
    setTestResults({})
    setFoundPairs({})
    setTrayPairs([])
    setFactorMessage('')
    setFactorChecked(false)
    setFactorCorrect(false)
    setFactorCompleted(false)
  }
  const feedSequence = () => {
    const number = Number(sequenceNumberInput)
    const count = Number(sequenceCountInput)
    if (!Number.isInteger(number) || number < 1 || number > 20 || !Number.isInteger(count) || count < 3 || count > 8) {
      setFeedback('Choose a whole number from 1 to 20 and a count from 3 to 8.')
      setChecked(false)
      return
    }
    setSequence(createMultiplesSequence(number, count))
    setSequenceAnswers({})
    setMultipleCompletedTasks((current) => current.filter((task) => task !== 'fill'))
    setCompleted(false)
    setFeedback('')
    setChecked(false)
    setCorrect(false)
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 500)
  }
  const testMultiple = (value: number) => {
    const quotient = Math.floor(value / multipleChoice.number)
    const remainder = value % multipleChoice.number
    const message = remainder === 0
      ? `${value} ÷ ${multipleChoice.number} = ${quotient} remainder 0. It is a multiple.`
      : `${value} ÷ ${multipleChoice.number} = ${quotient} remainder ${remainder}. It is not a multiple.`
    setTestedOptions((current) => current.includes(value) ? current : [...current, value])
    setMultipleFeedback((current) => ({ ...current, [value]: message }))
    setMultipleAnswers((current) => { const next = { ...current }; delete next[value]; return next })
    setMultipleCompletedTasks((current) => current.filter((task) => task !== 'identify'))
    setCompleted(false)
    setChecked(false)
    setCorrect(false)
    setFeedback('')
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 500)
  }
  const setMultipleAnswer = (value: number, answer: boolean) => {
    setMultipleAnswers((current) => ({ ...current, [value]: answer }))
    setMultipleCompletedTasks((current) => current.filter((task) => task !== 'identify'))
    setCompleted(false)
    setChecked(false)
    setCorrect(false)
    setFeedback('')
  }
  const checkActivity = () => {
    const isCorrect = multiplesTask === 'fill' ? sequenceIsCorrect : multipleChoicesAreCorrect
    setChecked(true)
    setCorrect(isCorrect)
    if (isCorrect) {
      setFeedback(multiplesTask === 'fill' ? 'Correct skip-counting! You filled every missing multiple.' : 'Correct! You identified every multiple of 6.')
      setMultipleCompletedTasks((current) => current.includes(multiplesTask) ? current : [...current, multiplesTask])
    } else if (multiplesTask === 'fill') {
      const wrongIndex = sequence.missingIndexes.find((index) => !sequenceAnswers[index] || Number(sequenceAnswers[index]) !== sequence.values[index])
      setFeedback(`The ${wrongIndex! + 1}${wrongIndex === 0 ? 'st' : wrongIndex === 1 ? 'nd' : wrongIndex === 2 ? 'rd' : 'th'} multiple of ${sequence.number} is ${sequence.values[wrongIndex!]}.`)
    } else {
      const untested = multipleChoice.options.find((value) => !testedOptions.includes(value))
      const wrong = multipleChoice.options.find((value) => testedOptions.includes(value) && multipleAnswers[value] !== multipleChoice.answers.includes(value))
      setFeedback(untested !== undefined ? `Test ${untested} with the machine and choose whether it is a multiple.` : wrong !== undefined ? multipleFeedback[wrong] ?? 'Check the division remainder for that option.' : 'Choose which options are multiples of 6.')
    }
  }
  const reset = () => {
    setRound(createFactorRound(roundNumber, round.target))
    setDivisorInput('')
    setTestedNumbers([])
    setTestResults({})
    setFoundPairs({})
    setTrayPairs([])
    setFactorMessage('')
    setFactorChecked(false)
    setFactorCorrect(false)
    setFactorCompleted(false)
    const nextSequence = createMultiplesSequence()
    setSequence(nextSequence)
    setSequenceNumberInput(String(nextSequence.number))
    setSequenceCountInput(String(nextSequence.count))
    setSequenceAnswers({})
    setMultipleChoice(createMultipleChoiceRound())
    setTestedOptions([])
    setMultipleAnswers({})
    setMultipleFeedback({})
    setMultipleCompletedTasks([])
    setChecked(false)
    setCorrect(false)
    setFeedback('')
    setCompleted(false)
    setSpinning(false)
  }

  const multipleTaskComplete = multipleCompletedTasks.includes(multiplesTask)

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Discover number relationships by finding factor pairs.</Typography></Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center"><Button variant={mode === 'factors' ? 'contained' : 'outlined'} onClick={() => { setMode('factors'); setChecked(false); setCorrect(false); setFeedback('') }}>Find the factors</Button><Button variant={mode === 'multiples' ? 'contained' : 'outlined'} onClick={() => { setMode('multiples'); setChecked(false); setCorrect(false); setFeedback('') }}>Multiples</Button></Stack>
      {mode === 'multiples' && <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center"><Button size="small" variant={multiplesTask === 'fill' ? 'contained' : 'outlined'} onClick={() => { setMultiplesTask('fill'); setChecked(false); setCorrect(false); setFeedback('') }}>Fill the multiples</Button><Button size="small" variant={multiplesTask === 'identify' ? 'contained' : 'outlined'} onClick={() => { setMultiplesTask('identify'); setChecked(false); setCorrect(false); setFeedback('') }}>Which are multiples of 6?</Button></Stack>}
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{mode === 'factors' ? `Round ${roundNumber + 1} · ${round.stage}: find every factor pair of ${round.target}.` : multiplesTask === 'fill' ? `Feed a number and count to list its first multiples.` : 'Which of these are multiples of 6?'}</Typography>

      {mode === 'factors' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="center"><TextField label={`Divisor for ${round.target}`} type="number" value={divisorInput} onChange={(event) => setDivisorInput(event.target.value)} inputProps={{ min: 1, step: 1 }} onKeyDown={(event) => { if (event.key === 'Enter') feedDivisor() }} /><Button variant="contained" onClick={feedDivisor} disabled={!divisorInput || factorCompleted}>Feed divisor</Button><Chip label={`Target ${round.target}`} color="warning" /></Stack>}
      {mode === 'multiples' && multiplesTask === 'fill' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="center"><TextField type="number" label="Number to skip-count" value={sequenceNumberInput} onChange={(event) => { setSequenceNumberInput(event.target.value); setMultipleCompletedTasks((current) => current.filter((task) => task !== 'fill')); setCompleted(false); setChecked(false); setCorrect(false) }} inputProps={{ min: 1, max: 20 }} /><TextField type="number" label="How many multiples?" value={sequenceCountInput} onChange={(event) => { setSequenceCountInput(event.target.value); setMultipleCompletedTasks((current) => current.filter((task) => task !== 'fill')); setCompleted(false); setChecked(false); setCorrect(false) }} inputProps={{ min: 3, max: 8 }} /><Button variant="contained" onClick={feedSequence}>Feed the machine</Button></Stack>}

      <Box sx={{ maxWidth: 390, mx: 'auto', width: '100%', textAlign: 'center' }}>
        <Box sx={{ width: 116, height: 50, mx: 'auto', border: 3, borderBottom: 0, borderColor: 'text.primary', borderRadius: '54% 54% 0 0', backgroundColor: 'warning.light', transform: spinning ? 'rotate(-4deg)' : 'none', animation: spinning ? 'machineWhir .25s ease-in-out infinite alternate' : 'none', '@keyframes machineWhir': { from: { transform: 'rotate(-4deg)' }, to: { transform: 'rotate(4deg)' } } }} />
        <Box sx={{ position: 'relative', p: 2, border: 4, borderColor: (mode === 'factors' ? factorCorrect : correct) ? 'success.main' : 'text.primary', borderRadius: 2.5, backgroundColor: 'background.default', boxShadow: (mode === 'factors' ? factorCorrect : correct) ? '0 0 24px rgba(46, 125, 50, .5)' : 'none', animation: checked && !correct ? 'machineShake .45s ease' : 'none', '@keyframes machineShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: 1 }}>FACTOR MACHINE</Typography>
          <Box sx={{ mt: 1, minHeight: 32, borderRadius: 1, backgroundColor: spinning ? 'info.light' : 'action.hover', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>{spinning ? 'Whirring…' : mode === 'factors' ? `Testing ${round.target}` : multiplesTask === 'fill' ? `${sequence.number} × ${sequence.count}` : `Testing multiples of ${multipleChoice.number}`}</Box>
        </Box>
        <Box sx={{ width: 54, height: 18, mx: 'auto', border: 3, borderTop: 0, borderColor: 'text.primary', borderRadius: '0 0 8px 8px' }} />
      </Box>

      {mode === 'factors' && <>
        <Stack spacing={.75}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Divisors tested</Typography><Paper elevation={0} sx={{ p: 1.25, minHeight: 50, backgroundColor: 'background.default' }}>{testedNumbers.length ? <Stack direction="row" spacing={.75} flexWrap="wrap">{testedNumbers.map((divisor) => { const result = testResults[divisor]; return <Chip key={divisor} size="small" color={result.remainder === 0 ? 'success' : 'default'} label={result.remainder === 0 ? `${divisor}: factor` : `${divisor}: remainder ${result.remainder}`} /> })}</Stack> : <Typography variant="body2" color="text.secondary">Feed a divisor to test it.</Typography>}</Paper>{factorMessage && !factorChecked && <Typography role="status" variant="body2" color={factorMessage.includes('not a factor') || factorMessage.includes('missing') ? 'warning.dark' : 'text.secondary'}>{factorMessage}</Typography>}</Stack>
        {foundPairList.length > 0 && <><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pairs popping out</Typography><Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">{foundPairList.map((pair, index) => <Box key={pair.id} draggable={!factorCompleted} onDragStart={(event) => event.dataTransfer.setData('text/factor-pair', pair.id)} onClick={() => toggleTrayPair(pair.id)} role="button" tabIndex={0} aria-pressed={trayPairs.includes(pair.id)} sx={{ width: 150, height: 118, p: .75, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: 2, borderColor: trayPairs.includes(pair.id) ? 'primary.main' : 'divider', borderRadius: 1.5, backgroundColor: trayPairs.includes(pair.id) ? 'primary.light' : 'background.default', cursor: 'grab', animation: 'pairPop .45s ease both', animationDelay: `${index * .12}s`, '@keyframes pairPop': { from: { opacity: 0, transform: 'translateY(-8px) scale(.9)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } } }}><ArrayVisual pair={pair} /><Typography variant="body2" sx={{ fontWeight: 800 }}>{pair.a} × {pair.b} = {round.target}</Typography></Box>)}</Stack></>}
        <Paper elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={dropPair} sx={{ minHeight: 102, p: 1.5, border: 2, borderStyle: 'dashed', borderColor: factorCorrect ? 'success.main' : 'divider', backgroundColor: factorCorrect ? 'success.light' : 'background.default' }}><Typography variant="subtitle2">Output tray</Typography><Typography variant="caption" color="text.secondary">Drag discovered pairs here or tap a pair card. {trayPairs.length}/{expectedPairs.length} pairs placed.</Typography><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>{trayPairs.map((id) => { const pair = foundPairs[id]; return pair ? <Chip key={id} label={`${pair.a} × ${pair.b} = ${round.target}`} onDelete={() => toggleTrayPair(id)} color="primary" /> : null })}</Stack></Paper>
      </>}

      {mode === 'multiples' && multiplesTask === 'fill' && <Paper elevation={0} sx={{ p: 1.5, border: 2, borderStyle: 'dashed', borderColor: 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2">Output tray · skip-counting by {sequence.number}</Typography><Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mt: 1 }}>{sequence.values.map((value, index) => sequence.missingIndexes.includes(index) ? <TextField key={index} type="number" size="small" label={`Multiple ${index + 1}`} value={sequenceAnswers[index] ?? ''} onChange={(event) => { setSequenceAnswers((current) => ({ ...current, [index]: event.target.value })); setMultipleCompletedTasks((current) => current.filter((task) => task !== 'fill')); setCompleted(false); setChecked(false); setCorrect(false); setFeedback('') }} sx={{ width: 104 }} inputProps={{ 'aria-label': `Missing multiple ${index + 1}` }} /> : <Chip key={index} label={value} color="primary" variant="outlined" />)}</Stack></Paper>}

      {mode === 'multiples' && multiplesTask === 'identify' && <>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Test every option in the machine, then choose “multiple” or “not a multiple.”</Typography>
        <Paper elevation={0} sx={{ p: 1.5, border: 2, borderStyle: 'dashed', borderColor: 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2">Output tray · multiples of 6</Typography><Stack direction="row" spacing={.75} flexWrap="wrap" sx={{ mt: 1 }}>{multipleChoice.options.filter((value) => multipleAnswers[value] === true).map((value) => <Chip key={value} label={value} color="success" />)}{!multipleChoice.options.some((value) => multipleAnswers[value] === true) && <Typography variant="caption" color="text.secondary">Choose the options that are multiples.</Typography>}</Stack></Paper>
        <Stack spacing={1}>{multipleChoice.options.map((value) => <Paper key={value} elevation={0} sx={{ p: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, border: 1, borderColor: 'divider' }}><Stack direction="row" spacing={1} alignItems="center"><Chip label={value} /><Button size="small" variant="outlined" onClick={() => testMultiple(value)}>Test in machine</Button></Stack><Stack direction="row" spacing={.5}><Button size="small" variant={multipleAnswers[value] === true ? 'contained' : 'outlined'} disabled={!testedOptions.includes(value)} onClick={() => setMultipleAnswer(value, true)}>Multiple</Button><Button size="small" variant={multipleAnswers[value] === false ? 'contained' : 'outlined'} disabled={!testedOptions.includes(value)} onClick={() => setMultipleAnswer(value, false)}>Not a multiple</Button></Stack>{multipleFeedback[value] && <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>{multipleFeedback[value]}</Typography>}</Paper>)}</Stack>
      </>}

      {mode === 'multiples' && multiplesTask === 'identify' && <Paper elevation={0} sx={{ p: 1.25, backgroundColor: 'action.hover' }}><Typography variant="caption" color="text.secondary">Tested options: {testedOptions.length}/{multipleChoice.options.length}</Typography></Paper>}

      {mode === 'multiples' && multipleCompletedTasks.length > 0 && <Typography variant="caption" color="success.main">Completed multiples rounds: {multipleCompletedTasks.map((task) => task === 'fill' ? 'Fill the multiples' : 'Which are multiples of 6?').join(' · ')}</Typography>}
      {mode === 'multiples' && multipleTaskComplete && <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>This multiples round is complete.</Typography>}

      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={mode === 'factors' ? checkFactors : checkActivity} disabled={mode === 'factors' ? factorCompleted : multipleTaskComplete}>{mode === 'factors' ? 'Check Activity' : 'Check Activity'}</Button></Stack>
      {mode === 'factors' && factorChecked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: factorCorrect ? 'success.main' : 'warning.main', backgroundColor: factorCorrect ? 'success.light' : 'warning.light' }}><Typography color={factorCorrect ? 'success.dark' : 'warning.dark'} sx={{ fontWeight: 800 }}>{factorMessage}</Typography>{!factorCorrect && missingPairs.slice(0, 2).map((pair) => <Typography key={pair.id} variant="body2" color="warning.dark">Try testing a divisor that could make {pair.a} × {pair.b} = {round.target}.</Typography>)}</Paper>}
      {mode === 'multiples' && checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'warning.main', backgroundColor: correct ? 'success.light' : 'warning.light' }}><Typography color={correct ? 'success.dark' : 'warning.dark'} sx={{ fontWeight: 800 }}>{feedback}</Typography></Paper>}

      {mode === 'factors' ? roundNumber < 7 ? <Button variant="contained" disabled={!factorCorrect || factorCompleted} onClick={nextFactorRound} sx={{ alignSelf: 'flex-start' }}>Next target</Button> : <Button variant="contained" disabled={!factorCorrect || factorCompleted} onClick={completeFactorRound} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{factorCompleted ? 'Completed' : 'Complete Activity'}</Button> : <Button variant="contained" disabled={!multiplesModeCorrect || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete Activity'}</Button>}
    </Stack>
  </Paper>
}

export default FactorMachineActivity
