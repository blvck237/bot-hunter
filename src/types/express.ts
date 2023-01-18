import { AnalyticsInput } from './Analytics';
import { Request } from 'express';

interface CustomRequest  {
  body: AnalyticsInput;
}

declare global {
  namespace Express {
    interface Request {
      clientIp: string;
    }
  }
}
