import { Router } from 'express';
import { analyzeLimiter } from '../middleware/rateLimit';
import { validateAnalyzeInput } from '../middleware/validate';
import { analyze } from '../controllers/analyzeController';

const router = Router();

router.post('/analyze-error', analyzeLimiter, validateAnalyzeInput, analyze);

export default router;
