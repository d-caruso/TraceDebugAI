import axios from 'axios'
import { AnalysisResult } from '../types'

const MESSAGES = {
  service_unavailable: 'The analysis service is temporarily unavailable.',
  malformed: 'Unable to generate a valid analysis. Please try again.',
  rate_limited: 'Too many requests. Please wait a moment and try again.',
}

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function analyzeError(errorText: string): Promise<AnalysisResult> {
  try {
    const { data } = await axios.post<AnalysisResult>(
      `${BASE_URL}/api/analyze-error`,
      { error: errorText },
      { timeout: 20000 }
    )
    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') throw new Error(MESSAGES.service_unavailable)
      if (err.response?.status === 429) throw new Error(MESSAGES.rate_limited)
      if (err.response?.status === 422) throw new Error(MESSAGES.malformed)
    }
    throw new Error(MESSAGES.service_unavailable)
  }
}
