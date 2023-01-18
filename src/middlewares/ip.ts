import { getClientIp } from '@supercharge/request-ip';

export const ipMiddleware = (req, res, next) => {
  req.clientIp = getClientIp(req);
  next();
};
