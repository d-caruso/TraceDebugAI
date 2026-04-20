import axios from 'axios'

const MESSAGES = {
  service_unavailable: 'The analysis service is temporarily unavailable.',
  malformed: 'Unable to generate a valid analysis. Please try again.',
}

export async function analyzeError(errorText) {
  try {
    const { data } = await axios.post(
      '/api/analyze-error',
      { error: errorText },
      { timeout: 20000 }
    )
    return data
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error(MESSAGES.service_unavailable)
    }
    const status = err.response?.status
    if (status === 422) {
      throw new Error(MESSAGES.malformed)
    }
    throw new Error(MESSAGES.service_unavailable)
  }
}
