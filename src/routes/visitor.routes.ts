import { Router } from 'express';
import { registerVisitor } from '@controllers/visitor.controller';

class VisitorRouter {
  router = Router();

  init(baseRouter: Router) {
    baseRouter.use('/visitors', this.router);

    this.router.post('/', registerVisitor);
  }
}

export default VisitorRouter;
