const express = require('express');
const validateAnalyzeInput = require('../middleware/validate');
const { analyze } = require('../controllers/analyzeController');

const router = express.Router();

router.post('/analyze-error', validateAnalyzeInput, analyze);

module.exports = router;
