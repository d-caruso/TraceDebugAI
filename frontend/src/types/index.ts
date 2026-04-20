export interface AnalysisResult {
  explanation: string;
  rootCause: string;
  fixSteps: string[];
  severity?: 'low' | 'medium' | 'high';
}
