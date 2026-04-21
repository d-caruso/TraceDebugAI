import { OpenAIHandler } from '../../../src/services/handlers/openai';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

function makeOpenAIResponse(content: string) {
  return {
    choices: [{ message: { content } }],
  };
}

describe('OpenAIHandler', () => {
  let handler: OpenAIHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new OpenAIHandler();
  });

  it('returns AnalysisResult for a well-formed response', async () => {
    const payload = {
      explanation: 'The module was not found.',
      rootCause: 'Missing npm package.',
      fixSteps: ['Run npm install', 'Check package.json'],
      severity: 'high',
    };
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse(JSON.stringify(payload)));

    const result = await handler.analyzeError('Cannot find module express');
    expect(result).toMatchObject(payload);
  });

  it('throws MALFORMED_RESPONSE when required fields are missing', async () => {
    const payload = { explanation: 'Something went wrong.' };
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse(JSON.stringify(payload)));

    await expect(handler.analyzeError('some error')).rejects.toThrow('MALFORMED_RESPONSE');
  });

  it('throws MALFORMED_RESPONSE when fixSteps is an empty array', async () => {
    const payload = {
      explanation: 'Error occurred.',
      rootCause: 'Unknown cause.',
      fixSteps: [],
    };
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse(JSON.stringify(payload)));

    await expect(handler.analyzeError('some error')).rejects.toThrow('MALFORMED_RESPONSE');
  });
});
