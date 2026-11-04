import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { PlatformEnginePreview } from '@/components/stem-lab/platform-engine-previews'
import { PLATFORM_ENGINES, engineForStemTool, type PlatformEngineId } from '@/components/stem-lab/platform-engine-library'
import { STEM_TOPICS } from '@/components/stem-lab/stem-lab-data'

const PlatformStemLabPage = () => {
  const [selectedEngine, setSelectedEngine] = useState<PlatformEngineId>('drag-drop')
  const selectedDefinition = PLATFORM_ENGINES.find((engine) => engine.id === selectedEngine) ?? PLATFORM_ENGINES[0]
  const mappedTopics = useMemo(() => STEM_TOPICS.filter((topic) => topic.tools.some((tool) => engineForStemTool[tool] === selectedEngine)).slice(0, 8), [selectedEngine])

  return <Stack spacing={3}>
    <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: 'divider', background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: 'primary.contrastText' }}>
      <Stack spacing={1}><Typography variant="overline" sx={{ opacity: .82, fontWeight: 800, letterSpacing: 1.2 }}>Platform-owned curriculum system</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>STEM Lab engines</Typography><Typography sx={{ maxWidth: 760, opacity: .92 }}>These reusable engines are built and maintained by the platform. Curriculum topics are mapped to the engines below; administrators do not create separate activity tools.</Typography><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`${PLATFORM_ENGINES.length} reusable engines`} sx={{ color: 'inherit', borderColor: 'currentColor' }} variant="outlined" /><Chip label={`${STEM_TOPICS.length} curriculum topics`} sx={{ color: 'inherit', borderColor: 'currentColor' }} variant="outlined" /></Stack></Stack>
    </Paper>
    <Grid container spacing={2}>
      <Grid item xs={12} lg={7}>
        <Grid container spacing={1.5}>{PLATFORM_ENGINES.map((engine) => { const selected = selectedEngine === engine.id; return <Grid item xs={12} sm={6} key={engine.id}><Box component="button" type="button" onClick={() => setSelectedEngine(engine.id)} sx={{ width: '100%', minHeight: 156, p: 2, textAlign: 'left', border: 1, borderColor: selected ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: selected ? 'action.selected' : 'background.paper', color: 'text.primary', cursor: 'pointer', font: 'inherit', transition: 'border-color .18s ease, transform .18s ease', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}><Stack spacing={1}><Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start"><Typography sx={{ fontWeight: 800 }}>{engine.name}</Typography>{selected && <Chip size="small" color="primary" label="Previewing" />}</Stack><Typography variant="body2" color="text.secondary">{engine.description}</Typography><Stack direction="row" spacing={.5} flexWrap="wrap">{engine.subjects.map((subject) => <Chip key={subject} size="small" label={subject} variant="outlined" />)}</Stack></Stack></Box></Grid> })}</Grid>
      </Grid>
      <Grid item xs={12} lg={5}><Stack spacing={2}><PlatformEnginePreview engineId={selectedEngine} /><Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{selectedDefinition.name} curriculum mapping</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Built-in examples: {selectedDefinition.examples.join(' · ')}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .75 }}>Interaction: {selectedDefinition.interaction}</Typography><Stack spacing={.75} sx={{ mt: 1.5 }}>{mappedTopics.length ? mappedTopics.map((topic) => <Box key={topic.id} sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'background.default' }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{topic.title}</Typography><Typography variant="caption" color="text.secondary">{topic.subject} · Grades {topic.grades.join(', ')}</Typography></Box>) : <Typography variant="body2" color="text.secondary">Additional curriculum mappings are scheduled for this engine.</Typography>}</Stack></Paper></Stack></Grid>
    </Grid>
  </Stack>
}

export default PlatformStemLabPage
