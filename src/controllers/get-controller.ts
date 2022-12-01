import { Request, Response, Query, ParamsDictionary } from 'express-serve-static-core';
import { Auth } from '../auth';
import { CommonLib } from '../common-lib';
import { getLogger } from '../libs/logger';
import { BaseAuthController } from './base-auth-controller';
import { _throw } from 'rxjs/observable/throw';
import { Table } from '../db/table';
import { Metadata, MetadataTable } from '../model/metadata';
import { switchMap } from 'rxjs/operators';
import { NotFound } from './errors/not-found';
import { of } from 'rxjs/observable/of';
import { AccessDenied } from './errors/access-denied';

/***/
export class GetController<T> extends BaseAuthController {

    /***/
    static logger = getLogger(module);

    /***/
    auth = new Auth();

    /***/
    constructor(public metadataTable: MetadataTable) {
        super();
    }

    /***/
    async handler(req: Request<Param, any, any>, res: Response) {
        const logId = this.getLogId();
        GetController.logger.debug(CommonLib.getLogString(logId, `handleRoutes get ${this.metadataTable.name} = ${req.params.id}`));
        new this.metadataTable.ctorTable().find(x => x[this.metadataTable.primaryKey] === +req.params.id)
            .pipe(
                switchMap((entity: T) => {
                    if (entity) {
                        return of(entity);
                    } else {
                        return _throw(new NotFound(`Not found ${this.metadataTable.name} = ${req.params.id}`));
                    }
                })
            ).subscribe(
                (entity: T) => {
                    res.json({
                        message: 'Successful',
                        result: {
                            data: [entity],
                        }
                    });
                    GetController.logger.debug(CommonLib.getLogString(logId, { result: `Successful` }));
                },
                (error) => {
                    if (error instanceof AccessDenied) {
                        let errorMessage = `Ошибка: ${error.message}`;
                        GetController.logger.error(CommonLib.getLogString(logId, { error: errorMessage }));
                        res.status(403);
                        res.json({ message: errorMessage });
                    } else if (error instanceof NotFound) {
                        let errorMessage = `Ошибка: ${error.message}`;
                        GetController.logger.error(CommonLib.getLogString(logId, { error: errorMessage }));
                        res.status(404);
                        res.json({ message: errorMessage });
                    } else {
                        let errorMessage = `Ошибка: ${error.message}`;
                        GetController.logger.error(CommonLib.getLogString(logId, { error: errorMessage }));
                        res.status(500);
                        res.json({ message: errorMessage });
                    }
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
