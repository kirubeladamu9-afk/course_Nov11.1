import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect, useMemo, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import { createTheme } from '@/config/theme'
import { Toaster } from '@/components/toast'
import AccessibilitySettings, { type AccessibilityPreferences } from '@/components/accessibility-settings'
import App from './App'

import 'slick-carousel/slick/slick.css'
import '@/styles/globals.css'
import '@/styles/react-slick.css'

const getInitialDarkMode = () => {
  const savedMode = window.localStorage.getItem('color-mode')
  if (savedMode) return savedMode === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const getInitialAccessibilityPreferences = (): AccessibilityPreferences => {
  try {
    const saved = window.localStorage.getItem('accessibility-preferences')
    if (saved) {
      const preferences = JSON.parse(saved)
      return {
        textSize: preferences.textSize === 'large' ? 'large' : 'normal',
        highContrast: preferences.highContrast === true,
        reducedMotion: preferences.reducedMotion === true,
      }
    }
  } catch {
    return { textSize: 'normal', highContrast: false, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches }
  }
  return { textSize: 'normal', highContrast: false, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches }
}

const Root = () => {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode)
  const [accessibility, setAccessibility] = useState(getInitialAccessibilityPreferences)
  const theme = useMemo(() => createTheme(darkMode, accessibility.highContrast, accessibility.textSize), [darkMode, accessibility.highContrast, accessibility.textSize])

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    document.documentElement.dataset.reducedMotion = String(accessibility.reducedMotion)
    window.localStorage.setItem('color-mode', darkMode ? 'dark' : 'light')
    window.localStorage.setItem('accessibility-preferences', JSON.stringify(accessibility))
  }, [darkMode, accessibility])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); const main = document.querySelector('main'); if (main) { main.tabIndex = -1; main.focus() } }}>Skip to main content</a>
      <App darkMode={darkMode} onToggleDarkMode={() => setDarkMode((current) => !current)} />
      <AccessibilitySettings preferences={accessibility} onChange={setAccessibility} />
      <Toaster />
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
