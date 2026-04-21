import { AnalysisResult } from '../types';
import { AIHandler } from './handlers/types';
import { OpenAIHandler } from './handlers/openai';
import { GeminiHandler } from './handlers/gemini';

function createHandler(): AIHandler {
  return process.env.AI_PROVIDER === 'gemini'
    ? new GeminiHandler()
    : new OpenAIHandler();
}

export async function analyzeError(errorText: string): Promise<AnalysisResult> {
  return createHandler().analyzeError(errorText);
}
