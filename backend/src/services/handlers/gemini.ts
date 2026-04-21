import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '../../types';
import { AIHandler } from './types';

const SYSTEM_PROMPT =
  'You are a debugging assistant. Analyze errors and return only valid JSON.';

function buildUserPrompt(errorText: string): string {
  return `Analyze the following error. Return a JSON object with:
- "explanation": a brief technical explanation (1-3 sentences)
- "rootCause": the most probable root cause (1-2 sentences)
- "fixSteps": an array of 2-5 concrete action steps
- "severity": one of "low", "medium", or "high"

Error:
${errorText}`;
}

export class GeminiHandler implements AIHandler {
  private client: GoogleGenerativeAI | undefined;

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    }
    return this.client;
  }

  async analyzeError(errorText: string): Promise<AnalysisResult> {
    const model = this.getClient().getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(
      buildUserPrompt(errorText),
      { timeout: 8000 }
    );

    const parsed = JSON.parse(result.response.text()) as Partial<AnalysisResult>;
    const { explanation, rootCause, fixSteps } = parsed;

    if (!explanation || !rootCause || !Array.isArray(fixSteps) || fixSteps.length === 0) {
      throw new Error('MALFORMED_RESPONSE');
    }

    return parsed as AnalysisResult;
  }
}
