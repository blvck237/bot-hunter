import { Router } from 'express';
import CaptchaRouter from './captcha.routes';
import EvaluationRouter from './evaluation.routes';
import VisitorRouter from './visitor.routes';

class AppRouters {
  baseRouter: Router;
  evaluationRouter: EvaluationRouter;
  visitorRouter: VisitorRouter;
  captchaRouter: CaptchaRouter;

  constructor() {
    this.baseRouter = Router();
    this.evaluationRouter = new EvaluationRouter();
    this.visitorRouter = new VisitorRouter();
    this.captchaRouter = new CaptchaRouter();
  }

  initAppRouters(): Router {
    this.evaluationRouter.init(this.baseRouter);
    this.visitorRouter.init(this.baseRouter);
    this.captchaRouter.init(this.baseRouter);
    return this.baseRouter;
  }
}

export default AppRouters;
