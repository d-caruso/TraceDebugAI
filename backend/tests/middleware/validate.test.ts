import { Request, Response, NextFunction } from 'express';
import { validateAnalyzeInput } from '../../src/middleware/validate';
import { MIN_INPUT_LENGTH, MAX_INPUT_LENGTH } from '../../src/constants';

function makeReq(body: unknown): Request {
  return { body } as Request;
}

function makeRes(): { res: Response; status: jest.Mock; json: jest.Mock } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status } as unknown as Response;
  return { res, status, json };
}

describe('validateAnalyzeInput', () => {
  it('returns 400 for empty body', () => {
    const req = makeReq({});
    const { res, status } = makeRes();
    const next = jest.fn();
    validateAnalyzeInput(req, res, next as NextFunction);
    expect(status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when error field is not a string', () => {
    const req = makeReq({ error: 42 });
    const { res, status } = makeRes();
    const next = jest.fn();
    validateAnalyzeInput(req, res, next as NextFunction);
    expect(status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when input is below minimum length', () => {
    const req = makeReq({ error: 'a'.repeat(MIN_INPUT_LENGTH - 1) });
    const { res, status } = makeRes();
    const next = jest.fn();
    validateAnalyzeInput(req, res, next as NextFunction);
    expect(status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when input exceeds maximum length', () => {
    const req = makeReq({ error: 'a'.repeat(MAX_INPUT_LENGTH + 1) });
    const { res, status } = makeRes();
    const next = jest.fn();
    validateAnalyzeInput(req, res, next as NextFunction);
    expect(status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and trims req.body.error for valid input', () => {
    const raw = '  ' + 'a'.repeat(MIN_INPUT_LENGTH) + '  ';
    const req = makeReq({ error: raw });
    const { res } = makeRes();
    const next = jest.fn();
    validateAnalyzeInput(req, res, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect((req as Request).body.error).toBe(raw.trim());
  });
});
