import request from 'supertest';
import app from '../../src/app';

const mockAnalyzeError = jest.fn();

jest.mock('../../src/services/aiService', () => ({
  analyzeError: (...args: unknown[]) => mockAnalyzeError(...args),
}));

const validPayload = {
  explanation: 'Module not found.',
  rootCause: 'Missing dependency.',
  fixSteps: ['Run npm install'],
  severity: 'high',
};

describe('POST /api/analyze-error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with structured JSON for a valid request', async () => {
    mockAnalyzeError.mockResolvedValueOnce(validPayload);

    const res = await request(app)
      .post('/api/analyze-error')
      .send({ error: 'Cannot find module express after npm ci' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(validPayload);
  });

  it('returns 400 for empty body', async () => {
    const res = await request(app).post('/api/analyze-error').send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 for input that is too short', async () => {
    const res = await request(app)
      .post('/api/analyze-error')
      .send({ error: 'err' });
    expect(res.status).toBe(400);
  });

  it('returns 422 when aiService throws MALFORMED_RESPONSE', async () => {
    mockAnalyzeError.mockRejectedValueOnce(new Error('MALFORMED_RESPONSE'));

    const res = await request(app)
      .post('/api/analyze-error')
      .send({ error: 'Cannot find module express after npm ci' });

    expect(res.status).toBe(422);
  });

  it('returns 503 when aiService throws a generic error', async () => {
    mockAnalyzeError.mockRejectedValueOnce(new Error('Network timeout'));

    const res = await request(app)
      .post('/api/analyze-error')
      .send({ error: 'Cannot find module express after npm ci' });

    expect(res.status).toBe(503);
  });
});
