import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000;
const limit = parseInt(process.env.RATE_LIMIT_MAX ?? '20', 10);

export const analyzeLimiter = rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
