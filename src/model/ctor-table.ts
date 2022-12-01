import { Table } from '../db/table';

export interface TableCtor<T> {
    new(): Table<T>;
}
