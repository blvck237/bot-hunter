import { Collection, Db, OptionalId, Filter, WithId, FindCursor, UpdateFilter, FindOptions, FilterOperations } from 'mongodb';
import { IRepository } from './ibase.repository';
import DbHandler from '@core/database';

export abstract class BaseRepository<T> implements IRepository<T> {
  collection: Collection;
  #db: Db;

  constructor(collectionName: string) {
    this.#db = DbHandler.db;
    this.collection = this.#db.collection(collectionName, {});
  }

  async create(item: OptionalId<T>): Promise<T> {
    const { insertedId } = await this.collection.insertOne(item);
    // Mongo v4.xx returns objectId on insert and not the inserted document
    const result = await this.collection.findOne({ _id: insertedId });
    return result as T;
  }

  getOne = async (filter: Filter<T>): Promise<WithId<T>> => {
    const document = await this.collection.findOne(filter);
    return document as WithId<T>;
  };

  getMany(query: Filter<T>, options?: FindOptions): Promise<T[]> {
    const cursor = this.collection.find<T>(query);
    if (options?.sort) {
      cursor.sort(options?.sort);
    }
    if (options?.limit) {
      cursor.limit(options?.limit);
    }
    if (options?.projection) {
      cursor.project(options?.projection);
    }
    return cursor.toArray();
  }

  deleteOne = async (query: Filter<T>): Promise<boolean> => {
    const result = await this.collection.deleteOne(query);
    return result.deletedCount === 1;
  };

  deleteMany = async (query: Filter<T>): Promise<boolean> => {
    const result = await this.collection.deleteMany(query);
    return result.deletedCount > 0;
  };

  count = async (query: Filter<T>): Promise<number> => {
    const result = await this.collection.countDocuments(query);
    return result;
  };

  updateOne = async (query: Filter<T>, update: UpdateFilter<T>): Promise<T> => {
    const result = await this.collection.findOneAndUpdate(query, update, { returnDocument: 'after' });
    return result.value as T;
  };

  updateOrCreate = async (query: Filter<T>, update: UpdateFilter<T>): Promise<T> => {
    const result = await this.collection.findOneAndUpdate(query, update, { upsert: true, returnDocument: 'after' });
    return result.value as T;
  };
}
