import { Request, Response, ParamsDictionary, Params, Query, NextFunction } from 'express-serve-static-core';

/***/
export interface IController<P extends Params = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query> {
    /***/
    handler(req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next?: NextFunction);
    /***/
    getLogId(): number;
}
