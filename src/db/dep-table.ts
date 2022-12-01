import { Observable } from 'rxjs/Observable';
import { Dep } from '../model/user/dep';
import { DbLib } from './db-lib';
import { Table } from './table';

export class DepTable extends Table<Dep> {
    getAll(): Observable<Dep[]> {
        return DbLib.getAll<Dep>('dep');
    }
}
