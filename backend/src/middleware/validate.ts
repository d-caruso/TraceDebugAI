import { Request, Response, NextFunction } from 'express';
import { MIN_INPUT_LENGTH, MAX_INPUT_LENGTH } from '../constants';

export function validateAnalyzeInput(req: Request, res: Response, next: NextFunction): void {
  const { error } = req.body as { error?: unknown };

  if (!error || typeof error !== 'string') {
    res.status(400).json({ message: 'Please enter an error message or stack trace.' });
    return;
  }

  const trimmed = error.trim();

  if (trimmed.length < MIN_INPUT_LENGTH) {
    res.status(400).json({ message: 'Please enter an error message or stack trace.' });
    return;
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    res.status(400).json({ message: `Input must not exceed ${MAX_INPUT_LENGTH} characters.` });
    return;
  }

  req.body.error = trimmed;
  next();
}
