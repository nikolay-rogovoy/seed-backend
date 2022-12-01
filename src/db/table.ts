import { Observable } from 'rxjs/Observable';
import { _throw } from 'rxjs/observable/throw';
import { map } from 'rxjs/operators';

/***/
export class Table<T> {
    /***/
    getAll(): Observable<T[]> {
        return _throw(new Error('Not implemented'));
    }
    /***/
    find(predicate: (value: T) => boolean): Observable<T> {
        return this.getAll()
            .pipe(
                map((data: T[]) => {
                    return data.find(predicate);
                })
            );
    }
    /***/
    findAll(predicate: (value: T) => boolean): Observable<T[]> {
        return this.getAll()
            .pipe(
                map((data: T[]) => {
                    return data.filter(predicate);
                })
            );
    }
}
