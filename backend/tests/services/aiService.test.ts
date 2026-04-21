import { analyzeError } from '../../src/services/aiService';

const mockOpenAIAnalyze = jest.fn();
const mockGeminiAnalyze = jest.fn();

jest.mock('../../src/services/handlers/openai', () => ({
  OpenAIHandler: jest.fn().mockImplementation(() => ({
    analyzeError: mockOpenAIAnalyze,
  })),
}));

jest.mock('../../src/services/handlers/gemini', () => ({
  GeminiHandler: jest.fn().mockImplementation(() => ({
    analyzeError: mockGeminiAnalyze,
  })),
}));

const validResult = {
  explanation: 'Test.',
  rootCause: 'Test cause.',
  fixSteps: ['Fix it'],
  severity: 'low' as const,
};

describe('analyzeError orchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AI_PROVIDER;
  });

  it('uses OpenAIHandler by default', async () => {
    mockOpenAIAnalyze.mockResolvedValueOnce(validResult);
    await analyzeError('some error');
    expect(mockOpenAIAnalyze).toHaveBeenCalledWith('some error');
    expect(mockGeminiAnalyze).not.toHaveBeenCalled();
  });

  it('uses OpenAIHandler when AI_PROVIDER=openai', async () => {
    process.env.AI_PROVIDER = 'openai';
    mockOpenAIAnalyze.mockResolvedValueOnce(validResult);
    await analyzeError('some error');
    expect(mockOpenAIAnalyze).toHaveBeenCalledWith('some error');
    expect(mockGeminiAnalyze).not.toHaveBeenCalled();
  });

  it('uses GeminiHandler when AI_PROVIDER=gemini', async () => {
    process.env.AI_PROVIDER = 'gemini';
    mockGeminiAnalyze.mockResolvedValueOnce(validResult);
    await analyzeError('some error');
    expect(mockGeminiAnalyze).toHaveBeenCalledWith('some error');
    expect(mockOpenAIAnalyze).not.toHaveBeenCalled();
  });
});
