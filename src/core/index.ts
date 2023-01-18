import ExpressLoader from './express';
import DbHandler from './database';
import { LoggerInstance } from '@utils/logger';

class AppLoader {
  expressLoader: ExpressLoader;
  dbLoader: typeof DbHandler;

  constructor() {
    this.expressLoader = new ExpressLoader();
    this.dbLoader = DbHandler;
  }

  async initApp({ expressApp }) {
    await this.dbLoader.connect();
    LoggerInstance.info('✌️ Database loaded and connected!');
    await this.dbLoader.seed();
    await this.expressLoader.initExpress(expressApp);
    LoggerInstance.info('✌️ Express loaded');
  }
}

export default AppLoader;
