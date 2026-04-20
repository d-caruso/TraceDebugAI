import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { analyzeError } from './api/analyzeError'
import AnalysisResult from './components/AnalysisResult'
import ErrorInput from './components/ErrorInput'
import { MIN_INPUT_LENGTH } from './constants'
import { AnalysisResult as AnalysisResultType } from './types'

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [inputText, setInputText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<AnalysisResultType | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const theme = useMemo(
    () => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }),
    [darkMode]
  )

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (inputText.trim().length < MIN_INPUT_LENGTH) {
      setErrorMessage('Please enter an error message or stack trace.')
      return
    }

    setIsLoading(true)
    setResult(null)
    setErrorMessage(null)

    try {
      const data = await analyzeError(inputText.trim())
      setResult(data)
    } catch (err) {
      setErrorMessage((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDarkMode(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Dark mode</Typography>}
            />
          </Box>

          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              AI Error Explainer
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Paste an error message or stack trace and get a structured explanation.
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <ErrorInput
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                errorMessage={errorMessage}
              />
            </CardContent>
          </Card>

          {result && <AnalysisResult result={result} />}
        </Container>
      </Box>
    </ThemeProvider>
  )
}
