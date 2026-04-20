import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const SEVERITY_COLOR = {
  low: 'success',
  medium: 'warning',
  high: 'error',
}

export default function SeverityBadge({ severity }) {
  if (!severity) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
      <Typography variant="body2" color="text.secondary" fontWeight="medium">
        Severity:
      </Typography>
      <Chip
        label={severity.charAt(0).toUpperCase() + severity.slice(1)}
        color={SEVERITY_COLOR[severity] ?? 'default'}
        size="medium"
        variant="filled"
      />
    </Box>
  )
}
