import { Router } from 'express';
import MonitorRouter from './monitor.routes';

class AppRouters {
  baseRouter: Router;
  monitorRouter: MonitorRouter;
  constructor() {
    this.baseRouter = Router();
    this.monitorRouter = new MonitorRouter();
  }

  initAppRouters(): Router {
    this.monitorRouter.init(this.baseRouter);
    return this.baseRouter;
  }
}

export default AppRouters;
