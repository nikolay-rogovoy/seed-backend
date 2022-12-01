import { current } from 'node-zone'

import { Request, Response } from 'express-serve-static-core';
import * as cluster from 'cluster';

/***/
export function logIdMiddleware(req: Request, res: Response, next) {
    return new Promise<void>((resolve, reject) => {
        current.fork({
            name: 'api',
            properties: {
                id: `${cluster.worker ? cluster.worker.id : 'SINGLE'}_${Math.round(Math.random() * 10000)}`
            }
        }).run(async () => {
            await next();
            resolve();
        });
    });
}
