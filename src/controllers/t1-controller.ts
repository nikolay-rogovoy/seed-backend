import { Request, Response, Query, ParamsDictionary } from 'express-serve-static-core';
import { Auth } from '../auth';
import { CommonLib } from '../common-lib';
import { getLogger } from '../libs/logger';
import { BaseAuthController } from './base-auth-controller';
import { _throw } from 'rxjs/observable/throw';

/***/
export class T1Controller<T> extends BaseAuthController {

    /***/
    static logger = getLogger(module);

    /***/
    auth = new Auth();

    /***/
    constructor() {
        super();
    }

    /***/
    async handler(req: Request<Param, any, any>, res: Response) {
        const logId = this.getLogId();
        T1Controller.logger.debug(CommonLib.getLogString(logId, `handleRoutes get /t1`));
        res.json({
            message: 'Successful',
            result: {
                data: [{ foo: 'bar' }],
            }
        });
        T1Controller.logger.debug(CommonLib.getLogString(logId, { result: `Successful` }));
    }
}

/***/
export interface IPaginationParam extends Query {
    paginationParam: string;
}


/***/
interface Param extends ParamsDictionary {
    id: string;
}
