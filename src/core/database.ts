import { BLACKLISTED_IPS_COLLECTION } from '@constants/collections';
import { LoggerInstance } from '@utils/logger';
import { MongoClient, Db } from 'mongodb';
import ips from '@db/ip.json';

const CHUNK_SIZE = 255;
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

  async seed() {
    await this.#seedIPs();
  }

  async #seedIPs() {
    // Check if ip collection exists
    const sample = await this.db.collection(BLACKLISTED_IPS_COLLECTION).findOne();
    if (!sample) {
      LoggerInstance.info('Seeding IPs...');
      // Insert in chunks of CHUNK_SIZE
      const chunks = [];
      // @ts-ignore
      for (let i = 0; i < ips.length; i += CHUNK_SIZE) {
        // @ts-ignore
        const chunk = ips.slice(i, i + CHUNK_SIZE);
        chunks.push(chunk);
      }
      for (const chunk of chunks) {
        await this.db.collection(BLACKLISTED_IPS_COLLECTION).insertMany(chunk);
      }
    }
  }
}

export default new DbHandler();
