import { Request, Response } from 'express';
import { analyzeError } from '../services/aiService';

export async function analyze(req: Request, res: Response): Promise<void> {
  try {
    const result = await analyzeError(req.body.error as string);
    res.status(200).json(result);
  } catch (err) {
    const error = err as Error;
    if (error.message === 'MALFORMED_RESPONSE') {
      res.status(422).json({ message: 'Unable to generate a valid analysis. Please try again.' });
      return;
    }
    res.status(503).json({ message: 'The analysis service is temporarily unavailable.' });
  }
}
