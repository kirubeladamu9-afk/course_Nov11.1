import { alpha, createTheme as createMuiTheme, type Theme, type TypographyOptions } from '@mui/material/styles'
import typography from './typography'
import paletteBase from './palette-base'
import paletteLight from './palette-light'
import paletteDark from './palette-dark'
import shadows from './shadows'

const createTheme = (darkMode = false, highContrast = false, textSize: 'normal' | 'large' = 'normal'): Theme => {
  const basePalette = darkMode ? { ...paletteBase, ...paletteDark } : { ...paletteBase, ...paletteLight }
  const palette = highContrast ? {
    ...basePalette,
    primary: { ...basePalette.primary, main: darkMode ? '#9ff1d2' : '#00584f', dark: darkMode ? '#c8ffe8' : '#003d37', contrastText: darkMode ? '#000000' : '#ffffff' },
    secondary: { ...basePalette.secondary, main: darkMode ? '#ffe08a' : '#754000', dark: darkMode ? '#fff0bf' : '#512b00', contrastText: darkMode ? '#000000' : '#ffffff' },
    background: { default: darkMode ? '#000000' : '#ffffff', paper: darkMode ? '#000000' : '#ffffff' },
    text: { primary: darkMode ? '#ffffff' : '#000000', secondary: darkMode ? '#ffffff' : '#000000', disabled: darkMode ? '#d0d0d0' : '#333333' },
    divider: darkMode ? '#ffffff' : '#000000',
    action: { ...basePalette.action, hover: darkMode ? '#262626' : '#eeeeee', selected: darkMode ? '#404040' : '#dddddd', focus: darkMode ? '#595959' : '#cccccc' },
  } : basePalette
  const accessibleTypography = textSize === 'large'
    ? Object.fromEntries(Object.entries(typography).map(([key, value]) => {
      if (typeof value !== 'object' || !value || !('fontSize' in value) || value.fontSize === undefined) return [key, value]
      return [key, { ...value, fontSize: typeof value.fontSize === 'number' ? value.fontSize * 1.2 : `calc(${value.fontSize} * 1.2)` }]
    })) as TypographyOptions
    : typography

  return createMuiTheme({
    palette,
    typography: accessibleTypography,
    shadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          ':root': {
            '--app-canvas': theme.palette.background.default,
            '--app-surface': theme.palette.background.paper,
            '--app-text': theme.palette.text.primary,
            '--app-text-muted': theme.palette.text.secondary,
            '--app-border': theme.palette.divider,
            '--app-hover': theme.palette.action.hover,
            '--app-selected': theme.palette.action.selected,
            '--app-overlay': alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.56 : 0.12),
            '--app-drawer-shadow': `-12px 0 28px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.34 : 0.12)}`,
            '--app-content-gradient': theme.palette.background.default,
            '--app-auth-backdrop': `radial-gradient(circle at 20% 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.12)}, transparent 34%)`,
            '--app-auth-panel': theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, #101716 0%, #172725 58%, #155d56 100%)'
              : 'linear-gradient(145deg, #1f1717 0%, #302323 58%, #163f3c 100%)',
          },
          html: { colorScheme: theme.palette.mode },
          body: { backgroundColor: theme.palette.background.default, color: theme.palette.text.primary },
          '::selection': { backgroundColor: alpha(theme.palette.primary.main, 0.35) },
        }),
      },
      MuiPaper: { styleOverrides: { root: ({ theme }) => ({ backgroundImage: 'none', borderColor: theme.palette.divider }) } },
      MuiCard: { styleOverrides: { root: ({ theme }) => ({ backgroundImage: 'none', borderColor: theme.palette.divider }) } },
      MuiAppBar: { styleOverrides: { root: ({ theme }) => ({ backgroundImage: 'none', backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }) } },
      MuiDrawer: { styleOverrides: { paper: ({ theme }) => ({ backgroundImage: 'none', backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }) } },
      MuiDialog: { styleOverrides: { paper: ({ theme }) => ({ backgroundImage: 'none', backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }) } },
      MuiMenu: { styleOverrides: { paper: ({ theme }) => ({ backgroundImage: 'none', backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }) } },
      MuiMenuItem: { styleOverrides: { root: ({ theme }) => ({ '&:hover': { backgroundColor: theme.palette.action.hover }, '&.Mui-selected': { backgroundColor: theme.palette.action.selected }, '&.Mui-selected:hover': { backgroundColor: theme.palette.action.focus } }) } },
      MuiOutlinedInput: { styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.background.default, '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main, borderWidth: 2 }, '&.Mui-disabled': { backgroundColor: theme.palette.action.disabledBackground } }) } },
      MuiInputLabel: { styleOverrides: { root: ({ theme }) => ({ color: theme.palette.text.secondary, '&.Mui-focused': { color: theme.palette.primary.main }, '&.Mui-disabled': { color: theme.palette.text.disabled } }) } },
      MuiButton: { styleOverrides: { root: ({ theme }) => ({ '&.Mui-disabled': { color: theme.palette.text.disabled, borderColor: theme.palette.action.disabled }, '&:focus-visible': { outline: `2px solid ${theme.palette.primary.light}`, outlineOffset: 2 } }) } },
      MuiIconButton: { styleOverrides: { root: ({ theme }) => ({ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary }, '&:focus-visible': { outline: `2px solid ${theme.palette.primary.light}`, outlineOffset: 2 } }) } },
      MuiChip: { styleOverrides: { outlined: ({ theme }) => ({ borderColor: theme.palette.divider }) } },
      MuiLinearProgress: { styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.action.selected }) } },
      MuiTableCell: { styleOverrides: { root: ({ theme }) => ({ borderColor: theme.palette.divider }), head: ({ theme }) => ({ backgroundColor: theme.palette.action.hover, color: theme.palette.text.primary, fontWeight: 700 }) } },
      MuiTableRow: { styleOverrides: { root: ({ theme }) => ({ '&:hover': { backgroundColor: theme.palette.action.hover }, '&.Mui-selected': { backgroundColor: theme.palette.action.selected } }) } },
      MuiTooltip: { styleOverrides: { tooltip: ({ theme }) => ({ backgroundColor: theme.palette.mode === 'dark' ? '#07100e' : theme.palette.grey[800], color: theme.palette.common.white }) } },
    },
  })
}

const theme = createTheme(false)

export { createTheme, paletteBase, paletteLight, paletteDark, typography, shadows }
export default theme
