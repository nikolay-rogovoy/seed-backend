import { current } from 'node-zone';
import { IAuthPayload } from '../i-auth-payload';
import { BaseController } from './base-controller';
import { IAuthController } from './i-auth-controller';
import { ParamsDictionary, Params, Query } from 'express-serve-static-core';

/***/
export class BaseAuthController<P extends Params = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = Query>
    extends BaseController<P, ResBody, ReqBody, ReqQuery> implements IAuthController<P, ResBody, ReqBody, ReqQuery> {
    /***/
    get authorizationResult(): IAuthPayload {
        return <IAuthPayload>current.get('authorizationResult');
    }
    /***/
    get idcustomerdepartment(): number {
        return <number>current.get('idcustomerdepartment');
    }
}
