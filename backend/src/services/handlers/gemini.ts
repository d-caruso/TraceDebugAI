import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '../../types';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompt';
import { AIHandler } from './types';

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

    const parsed = JSON.parse(result.response.text()) as Partial<AnalysisResult> & { isError?: boolean };

    if (parsed.isError === false) {
      throw new Error('INVALID_INPUT');
    }

    const { explanation, rootCause, fixSteps } = parsed;
    if (!explanation || !rootCause || !Array.isArray(fixSteps) || fixSteps.length === 0) {
      throw new Error('MALFORMED_RESPONSE');
    }

    return parsed as AnalysisResult;
  }
}
