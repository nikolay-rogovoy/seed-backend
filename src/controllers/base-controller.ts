import { Request, Response, ParamsDictionary, Params, Query, NextFunction } from 'express-serve-static-core';
import { current } from 'node-zone';
import { IController } from './i-controller';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

/***/
export class BaseController<P extends Params = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query>
    implements IController<P, ResBody, ReqBody, ReqQuery> {

    /***/
    getLogId(): number {
        return current.get('id');
    }

    /***/
    async handler(req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next?: NextFunction) {
        throw new Error('Not implemented');
    }

    /***/
    setContext<T>(context, observableFactory: () => Observable<T>): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            current.fork({
                name: 'context',
                properties: context
            }).run(() => {
                observableFactory().subscribe(observer);
            });
        });
    }

    /***/
    getContext<T>(): T {
        return <T>current.get('context');
    }
}
