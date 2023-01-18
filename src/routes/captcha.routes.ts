import { Router } from 'express';
import { createCaptcha, resolveCaptcha } from '@controllers/captcha.controller';

class CaptchaRouter {
  router = Router();

  init(baseRouter: Router) {
    baseRouter.use('/captcha', this.router);

    this.router.post('/', createCaptcha);
    this.router.post('/:captcha', resolveCaptcha);
  }
}

export default CaptchaRouter;
