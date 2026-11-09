import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState, type FC } from 'react'

interface SpeechResult {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: { transcript: string }
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number
  readonly results: ArrayLike<SpeechResult>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike
type SpeechWindow = Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }

interface VoiceDictationButtonProps {
  disabled?: boolean
  onTranscript: (text: string) => void
}

const VoiceDictationButton: FC<VoiceDictationButtonProps> = ({ disabled = false, onTranscript }) => {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [listening, setListening] = useState(false)
  const [message, setMessage] = useState('')
  const Recognition = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const toggle = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = navigator.language || 'en'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).slice(event.resultIndex).map((result) => result[0]?.transcript ?? '').join(' ').trim()
      if (transcript) onTranscript(transcript)
      setMessage(transcript ? 'Voice input added to your answer.' : 'No speech was detected.')
    }
    recognition.onerror = () => setMessage('Voice input did not work. You can type your answer instead.')
    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
    }
    recognitionRef.current = recognition
    setMessage('Listening. Speak your answer now.')
    setListening(true)
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setListening(false)
      setMessage('Voice input could not start. You can type your answer instead.')
    }
  }

  return <>
    <Button size="small" variant="outlined" disabled={disabled || !Recognition} onClick={toggle} startIcon={listening ? <StopCircleOutlinedIcon /> : <MicNoneOutlinedIcon />} aria-pressed={listening}>
      {listening ? 'Stop voice input' : Recognition ? 'Speak your answer' : 'Voice input unavailable'}
    </Button>
    <Typography variant="caption" color="text.secondary" role="status" aria-live="polite">{message || 'Voice input is processed by your browser; availability and privacy vary.'}</Typography>
  </>
}

export default VoiceDictationButton
