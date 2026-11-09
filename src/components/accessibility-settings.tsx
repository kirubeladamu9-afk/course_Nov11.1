import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState, type FC, type MouseEvent } from 'react'

export interface AccessibilityPreferences {
  textSize: 'normal' | 'large'
  highContrast: boolean
  reducedMotion: boolean
}

interface AccessibilitySettingsProps {
  preferences: AccessibilityPreferences
  onChange: (preferences: AccessibilityPreferences) => void
}

const AccessibilitySettings: FC<AccessibilitySettingsProps> = ({ preferences, onChange }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const open = Boolean(anchor)
  const update = (change: Partial<AccessibilityPreferences>) => onChange({ ...preferences, ...change })

  return <>
    <IconButton
      aria-label="Accessibility settings"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? 'accessibility-settings' : undefined}
      onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
      sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: (theme) => theme.zIndex.tooltip, width: 52, height: 52, border: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'primary.main', boxShadow: 3, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <AccessibilityNewOutlinedIcon />
    </IconButton>
    <Popover
      id="accessibility-settings"
      open={open}
      anchorEl={anchor}
      onClose={() => setAnchor(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      slotProps={{ paper: { role: 'dialog', 'aria-labelledby': 'accessibility-settings-title', sx: { width: 320, maxWidth: 'calc(100vw - 32px)', p: 2.5 } } }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography id="accessibility-settings-title" component="h2" variant="h6">Accessibility settings</Typography>
          <Typography variant="body2" color="text.secondary">These preferences are saved on this device.</Typography>
        </Box>
        <Box>
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 700 }}>Text size</Typography>
          <RadioGroup row aria-label="Text size" value={preferences.textSize} onChange={(event) => update({ textSize: event.target.value as AccessibilityPreferences['textSize'] })}>
            <FormControlLabel value="normal" control={<Radio />} label="Standard" />
            <FormControlLabel value="large" control={<Radio />} label="Large" />
          </RadioGroup>
        </Box>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={preferences.highContrast} onChange={(event) => update({ highContrast: event.target.checked })} />} label="High contrast" />
          <FormControlLabel control={<Checkbox checked={preferences.reducedMotion} onChange={(event) => update({ reducedMotion: event.target.checked })} />} label="Reduce motion" />
        </FormGroup>
        <Button variant="outlined" onClick={() => setAnchor(null)}>Close settings</Button>
      </Stack>
    </Popover>
  </>
}

export default AccessibilitySettings
