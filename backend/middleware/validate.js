const { MIN_INPUT_LENGTH, MAX_INPUT_LENGTH } = require('../../shared/constants');

function validateAnalyzeInput(req, res, next) {
  const { error } = req.body;

  if (!error || typeof error !== 'string') {
    return res.status(400).json({ message: 'Please enter an error message or stack trace.' });
  }

  const trimmed = error.trim();

  if (trimmed.length < MIN_INPUT_LENGTH) {
    return res.status(400).json({ message: 'Please enter an error message or stack trace.' });
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ message: `Input must not exceed ${MAX_INPUT_LENGTH} characters.` });
  }

  req.body.error = trimmed;
  next();
}

module.exports = validateAnalyzeInput;
