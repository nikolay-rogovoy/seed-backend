import { Observable } from 'rxjs/Observable';
import { Userdep } from '../model/user/userdep';
import { DbLib } from './db-lib';
import { Table } from './table';

export class UserdepTable extends Table<Userdep> {
    getAll(): Observable<Userdep[]> {
        return DbLib.getAll<Userdep>('userdep');
    }
}
