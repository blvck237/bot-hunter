import { Router } from 'express';
import { evaluateRequest, evaluateRtt } from '@controllers/monitor.controller';

class MonitorRouter {
  router = Router();

  init(baseRouter: Router) {
    baseRouter.use('/evaluate', this.router);

    this.router.post('/', evaluateRequest);
    this.router.post('/rtt', evaluateRtt);
  }
}

export default MonitorRouter;
