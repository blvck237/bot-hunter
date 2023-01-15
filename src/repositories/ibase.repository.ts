import { Filter, FindCursor, OptionalId, WithId, UpdateFilter, FindOptions } from 'mongodb';

export interface IRepository<T> {
  create?: (doc: OptionalId<T>) => Promise<T>;
  getOne?: (query: Filter<T>) => Promise<WithId<T>>;
  getMany?: (query: Filter<T>, options: FindOptions) => Promise<T[]>;
  deleteOne?: (query: Filter<T>) => Promise<boolean>;
  updateOne?: (query: Filter<T>, data: UpdateFilter<T>) => Promise<T>;
  deleteMany?: (query: Filter<T>) => Promise<boolean>;
  count?: (query: Filter<T>) => Promise<number>;
}
