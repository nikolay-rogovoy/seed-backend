import { current } from 'node-zone'
import { Request, Response } from 'express-serve-static-core';

/***/
export function reqMiddleware(req: Request, res: Response, next) {
    return new Promise<void>((resolve, reject) => {
        current.fork({
            name: 'req',
            properties: {
                req
            }
        }).run(async () => {
            await next();
            resolve();
        });
    });
}
