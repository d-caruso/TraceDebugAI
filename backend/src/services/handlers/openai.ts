import 'dotenv/config';
import OpenAI from 'openai';
import { AnalysisResult } from '../../types';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompt';
import { AIHandler } from './types';

export class OpenAIHandler implements AIHandler {
  private client: OpenAI | undefined;

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 8000 });
    }
    return this.client;
  }

  async analyzeError(errorText: string): Promise<AnalysisResult> {
    const response = await this.getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(errorText) },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? '{}') as Partial<AnalysisResult> & { isError?: boolean };

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
