import { Request, Response, Query, ParamsDictionary } from 'express-serve-static-core';
import { Auth } from '../auth';
import { CommonLib } from '../common-lib';
import { getLogger } from '../libs/logger';
import { BaseAuthController } from './base-auth-controller';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { switchMap, map } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { IRequestPaginationParam } from '../i-request-pagination-param';
import { Table } from '../db/table';
import { MetadataTable } from '../model/metadata';

/***/
export class GetListController<T> extends BaseAuthController {

    /***/
    static logger = getLogger(module);

    /***/
    auth = new Auth();

    /***/
    constructor(public metadataTable: MetadataTable) {
        super();
    }

    /***/
    async handler(req: Request<Param, any, any, IPaginationParam>, res: Response) {
        const logId = this.getLogId();
        GetListController.logger.debug(CommonLib.getLogString(logId, `handleRoutes get list`));

        let paginationParam = req.query.paginationParam ? <IRequestPaginationParam>JSON.parse(req.query.paginationParam) : null;

        new this.metadataTable.ctorTable().getAll()
            .pipe(
                switchMap((entities: T[]) => {
                    return forkJoin(
                        of(entities.length),
                        of(entities));
                }),
            ).subscribe(
                (entitysToGetAndCount: [number, any[]]) => {
                    res.json({
                        message: 'Successful',
                        result: {
                            data: entitysToGetAndCount[1],
                            count: entitysToGetAndCount[0],
                            limit: paginationParam ? paginationParam.limit : null,
                            offset: paginationParam ? paginationParam.offset : null
                        }
                    });
                    GetListController.logger.debug(CommonLib.getLogString(logId, { result: `Successful`, length: entitysToGetAndCount[1].length }));
                },
                (error) => {
                    let errorMessage = `Error: ${error.message}`;
                    GetListController.logger.error(CommonLib.getLogString(logId, { error: errorMessage }));
                    res.status(500);
                    res.json({ message: errorMessage });
                });
    }
}

/***/
export interface IPaginationParam extends Query {
    paginationParam: string;
}


/***/
interface Param extends ParamsDictionary {
}
