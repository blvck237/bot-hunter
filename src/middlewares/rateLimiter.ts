import { TOO_MANY_REQUESTS } from '@constants/errors';
import { LimitException } from '@core/exceptions';
import { errorHandler } from '@core/response';
import rateLimit from 'express-rate-limit';

// The average rate limit is 3000 requests per hour, so 50 requests per minute
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  // If limit is reached, return a 429 status code
  handler: (req, res, next) => {
    errorHandler(next, new LimitException(TOO_MANY_REQUESTS));
  }
});
