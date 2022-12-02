import { Request, Response, Query, ParamsDictionary } from 'express-serve-static-core';
import { Auth } from '../auth';
import { CommonLib } from '../common-lib';
import { getLogger } from '../libs/logger';
import { BaseAuthController } from './base-auth-controller';
import { _throw } from 'rxjs/observable/throw';
const fs = require('fs');

/***/
export class GetFilesController<T> extends BaseAuthController {

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
        GetFilesController.logger.debug(CommonLib.getLogString(logId, `handleRoutes get /get_files`));

        new Promise((resolve, reject) => {
            fs.readdir('./', (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            })
        })
            .then((files: string[]) => {
                res.json({
                    message: 'Successful',
                    result: {
                        data: files.map(x => {
                            return {
                                fileName: x
                            }
                        }),
                    }
                });
                GetFilesController.logger.debug(CommonLib.getLogString(logId, { result: `Successful` }));
            });
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
