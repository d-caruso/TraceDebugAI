require('dotenv').config();
const OpenAI = require('openai');

let client;
function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15000 });
  }
  return client;
}

const SYSTEM_PROMPT =
  'You are a debugging assistant. Analyze errors and return only valid JSON.';

function buildUserPrompt(errorText) {
  return `Analyze the following error. Return a JSON object with:
- "explanation": a brief technical explanation (1-3 sentences)
- "rootCause": the most probable root cause (1-2 sentences)
- "fixSteps": an array of 2-5 concrete action steps
- "severity": one of "low", "medium", or "high"

Error:
${errorText}`;
}

async function analyzeError(errorText) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(errorText) },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  const { explanation, rootCause, fixSteps } = parsed;

  if (!explanation || !rootCause || !Array.isArray(fixSteps) || fixSteps.length === 0) {
    throw new Error('MALFORMED_RESPONSE');
  }

  return parsed;
}

module.exports = { analyzeError };
