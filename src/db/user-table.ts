import { Observable } from 'rxjs/Observable';
import { User } from '../model/user/user';
import { DbLib } from './db-lib';
import { Table } from './table';

export class UserTable extends Table<User> {
    getAll(): Observable<User[]> {
        return DbLib.getAll<User>('user');
    }
}
