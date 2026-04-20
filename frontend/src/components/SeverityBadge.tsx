import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { AnalysisResult } from '../types'

type SeverityColor = 'success' | 'warning' | 'error'

const SEVERITY_COLOR: Record<NonNullable<AnalysisResult['severity']>, SeverityColor> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
}

interface SeverityBadgeProps {
  severity?: AnalysisResult['severity']
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (!severity) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        Severity:
      </Typography>
      <Chip
        label={severity.charAt(0).toUpperCase() + severity.slice(1)}
        color={SEVERITY_COLOR[severity]}
        size="medium"
        variant="filled"
      />
    </Box>
  )
}
