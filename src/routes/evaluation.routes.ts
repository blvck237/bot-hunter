import { Router } from 'express';
import { evaluateRequest, flagUser } from '@controllers/evaluation.controller';

class EvaluationRouter {
  router = Router();

  init(baseRouter: Router) {
    baseRouter.use('/', this.router);

    this.router.post('/', evaluateRequest);
    this.router.post('/flag', flagUser);
  }
}

export default EvaluationRouter;
