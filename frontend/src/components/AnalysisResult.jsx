import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const SEVERITY_COLOR = {
  low: 'success',
  medium: 'warning',
  high: 'error',
}

function formatForClipboard({ explanation, rootCause, fixSteps, severity }) {
  const steps = fixSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const lines = [
    'Explanation:',
    explanation,
    '',
    'Root Cause:',
    rootCause,
    '',
    'Suggested Fix Steps:',
    steps,
  ]
  if (severity) lines.push('', `Severity: ${severity}`)
  return lines.join('\n')
}

export default function AnalysisResult({ result }) {
  const [copied, setCopied] = useState(false)

  if (!result) return null

  const { explanation, rootCause, fixSteps, severity } = result

  async function handleCopy() {
    await navigator.clipboard.writeText(formatForClipboard(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Analysis</Typography>
          <Button size="small" variant="outlined" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>Explanation</Typography>
        <Typography variant="body1" paragraph>{explanation}</Typography>

        <Typography variant="h6" gutterBottom>Root Cause</Typography>
        <Typography variant="body1" paragraph>{rootCause}</Typography>

        <Typography variant="h6" gutterBottom>Suggested Fix Steps</Typography>
        <Box component="ol" sx={{ pl: 2, mt: 0 }}>
          {fixSteps.map((step, i) => (
            <Box component="li" key={i} sx={{ mb: 0.5 }}>
              <Typography variant="body1">{step}</Typography>
            </Box>
          ))}
        </Box>

        {severity && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={severity.charAt(0).toUpperCase() + severity.slice(1)}
              color={SEVERITY_COLOR[severity] ?? 'default'}
              size="small"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
