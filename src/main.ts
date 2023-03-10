import express from 'express';
import http from 'http';
import AppLoader from '@core';
import config from '@config';
import { displayStartMessage } from '@utils/common';
import { LoggerInstance } from '@utils/logger';

const app = express();
const server = http.createServer(app);

class AppServer {
  appLoader: AppLoader;

  async start() {
    this.appLoader = new AppLoader();
    LoggerInstance.info('🚀 Starting app');

    await this.appLoader.initApp({ expressApp: app });

    server.listen(config.port, () => {
      displayStartMessage(config.port);
    });
  }
}

const appServer = new AppServer();

appServer.start();
