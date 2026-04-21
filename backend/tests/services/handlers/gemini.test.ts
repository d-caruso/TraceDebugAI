import { GeminiHandler } from '../../../src/services/handlers/gemini';

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

function makeGeminiResponse(content: string) {
  return { response: { text: () => content } };
}

describe('GeminiHandler', () => {
  let handler: GeminiHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GeminiHandler();
  });

  it('returns AnalysisResult for a well-formed response', async () => {
    const payload = {
      explanation: 'The module was not found.',
      rootCause: 'Missing npm package.',
      fixSteps: ['Run npm install', 'Check package.json'],
      severity: 'high',
    };
    mockGenerateContent.mockResolvedValueOnce(makeGeminiResponse(JSON.stringify(payload)));

    const result = await handler.analyzeError('Cannot find module express');
    expect(result).toMatchObject(payload);
  });

  it('throws INVALID_INPUT when isError is false', async () => {
    mockGenerateContent.mockResolvedValueOnce(makeGeminiResponse(JSON.stringify({ isError: false })));
    await expect(handler.analyzeError('this is a test')).rejects.toThrow('INVALID_INPUT');
  });

  it('throws MALFORMED_RESPONSE when required fields are missing', async () => {
    const payload = { explanation: 'Something went wrong.' };
    mockGenerateContent.mockResolvedValueOnce(makeGeminiResponse(JSON.stringify(payload)));

    await expect(handler.analyzeError('some error')).rejects.toThrow('MALFORMED_RESPONSE');
  });

  it('throws MALFORMED_RESPONSE when fixSteps is an empty array', async () => {
    const payload = {
      explanation: 'Error occurred.',
      rootCause: 'Unknown cause.',
      fixSteps: [],
    };
    mockGenerateContent.mockResolvedValueOnce(makeGeminiResponse(JSON.stringify(payload)));

    await expect(handler.analyzeError('some error')).rejects.toThrow('MALFORMED_RESPONSE');
  });
});
