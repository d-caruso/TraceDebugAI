import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { analyzeError } from './api/analyzeError'
import AnalysisResult from './components/AnalysisResult'
import ErrorInput from './components/ErrorInput'
import { MIN_INPUT_LENGTH } from './constants'

export default function App() {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  async function handleSubmit(e) {
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
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
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
  )
}
