import { Router } from 'express';
import { validateAnalyzeInput } from '../middleware/validate';
import { analyze } from '../controllers/analyzeController';

const router = Router();

router.post('/analyze-error', validateAnalyzeInput, analyze);

export default router;
