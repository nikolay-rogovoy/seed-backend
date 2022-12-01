import { Observable } from 'rxjs/Observable';
import { Post } from '../model/user/post';
import { DbLib } from './db-lib';
import { Table } from './table';

export class PostTable extends Table<Post> {
    getAll(): Observable<Post[]> {
        return DbLib.getAll<Post>('post');
    }
}
