import { IController } from './i-controller';
import { IAuthPayload } from '../i-auth-payload';
import { ParamsDictionary, Params, Query } from 'express-serve-static-core';
/***/
export interface IAuthController<P extends Params = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query>
    extends IController<P, ResBody, ReqBody, ReqQuery> {
    /***/
    readonly authorizationResult: IAuthPayload;
}
