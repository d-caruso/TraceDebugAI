import { AnalysisResult } from '../../types';

export interface AIHandler {
  analyzeError(errorText: string): Promise<AnalysisResult>;
}
