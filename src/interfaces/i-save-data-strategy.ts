import { Observable } from 'rxjs/Observable';

/***/
export interface ISaveDataStrategy<T> {
    /***/
    createEntity(object: any): Observable<T>;
    /***/
    updateEntity(object: any): Observable<T>;
    /***/
    updateEntities(entities: T[]): Observable<T[]>
}
