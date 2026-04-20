import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { MIN_INPUT_LENGTH, MAX_INPUT_LENGTH } from '../constants'

export default function ErrorInput({ value, onChange, onSubmit, isLoading, errorMessage }) {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <TextField
        label="Error message or stack trace"
        multiline
        rows={8}
        fullWidth
        value={value}
        onChange={onChange}
        disabled={isLoading}
        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
        helperText={`${value.length} / ${MAX_INPUT_LENGTH}`}
      />
      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || value.trim().length < MIN_INPUT_LENGTH}
        sx={{ mt: 2 }}
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </Button>
    </Box>
  )
}
