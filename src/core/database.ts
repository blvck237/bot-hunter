import { LoggerInstance } from '@utils/logger';
import { MongoClient, Db } from 'mongodb';

class DbHandler {
  #client: MongoClient;
  #url = process.env.MONGO_URL;
  db: Db;

  constructor() {}

  async connect(): Promise<void> {
    try {
      this.#client = MongoClient.connect(this.#url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      this.db = (await this.#client).db();
    } catch (error) {
      LoggerInstance.error('Error connecting to database', error);
      throw error;
    }
  }

  updateIndexes() {}

  disconnect(): void {
    if (!this.#client) {
      return;
    }
    this.#client.close();
  }
}

export default new DbHandler();
