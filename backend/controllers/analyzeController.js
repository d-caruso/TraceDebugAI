const { analyzeError } = require('../services/aiService');

async function analyze(req, res) {
  try {
    const result = await analyzeError(req.body.error);
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === 'MALFORMED_RESPONSE') {
      return res.status(422).json({ message: 'Unable to generate a valid analysis. Please try again.' });
    }
    if (err.constructor?.name === 'APIConnectionTimeoutError' || err.code === 'ETIMEDOUT') {
      return res.status(503).json({ message: 'The analysis service is temporarily unavailable.' });
    }
    return res.status(503).json({ message: 'The analysis service is temporarily unavailable.' });
  }
}

module.exports = { analyze };
