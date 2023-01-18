import express from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors';
import AppRouters from '@routes/index.routes';
import { errorMiddleware } from '@middlewares/error';
import { ipMiddleware } from '@middlewares/ip';
import { rateLimiter } from '@middlewares/rateLimiter';

class ExpressLoader {
  appRouters: AppRouters;
  
  constructor() {
    this.appRouters = new AppRouters();
  }
  
  async initExpress(app: express.Application) {
    app.use(logger('dev'));
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cors());
    app.set('trust proxy', true);
    app.disable('etag');
    app.use(ipMiddleware)
    app.use(rateLimiter)
    
    
    const appRouters = this.appRouters.initAppRouters();
    app.use('/', appRouters);
    app.use(errorMiddleware);
  }
}

export default ExpressLoader;
