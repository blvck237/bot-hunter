import express from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors';
import AppRouters from '@routes/index.routes';
import { errorMiddleware } from '@middlewares/error';
import { ipMiddleware } from '@middlewares/ip';

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
    app.set('trust proxy', true)
    
    const appRouters = this.appRouters.initAppRouters();
    app.use('/', appRouters);
    app.use(errorMiddleware);
    app.use(ipMiddleware)
  }
}

export default ExpressLoader;
