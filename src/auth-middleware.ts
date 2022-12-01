import { current } from 'node-zone'
import { switchMap, catchError } from 'rxjs/operators';
import { IAuthPayload } from './i-auth-payload';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { of } from 'rxjs/observable/of';
import { Auth, InvalidToken, BadAutorizationHeader, NoAutorizationHeader, InvalidPayload } from './auth';
import { Request, Response } from 'express-serve-static-core';
import { getLogger } from './libs/logger';
import { CommonLib } from './common-lib';

const logger = getLogger(module);

/***/
export function authMiddleware(req: Request, res: Response, next) {
    const logId = CommonLib.getLogId();
    // Браузерный предзапрос пропускаем дальше
    if (req.method === 'OPTIONS') {
        next();
    } else {
        const auth = new Auth();
        return auth.decodeAuthorizationToken(req)
            .pipe(
                switchMap((authorizationResult: IAuthPayload) => {
                    return Observable.create((observer: Observer<any>) => {
                        current.fork({
                            properties: {
                                authorizationResult
                            }
                        }).run(async () => {
                            await next();
                            observer.next(null);
                        });

                    });
                }),
                catchError((error) => {
                    const url = `host: ${req.hostname}, baseUrl: ${req.baseUrl}, originalUrl: ${req.originalUrl}, path: ${req.path}`;
                    if (error instanceof InvalidToken ||
                        error instanceof BadAutorizationHeader ||
                        error instanceof NoAutorizationHeader ||
                        error instanceof InvalidPayload
                    ) {
                        // Не авторизованный доступ
                        logger.error(CommonLib.getLogString(logId, `Неавторизованный доступ ${error.message}, url: ${url}`));
                        res.status(401);
                    } else {
                        // Ошибка разбора токена
                        logger.error(CommonLib.getLogString(logId, `Ошибка разбора токена: ${error.message}, url: ${url}`));
                        res.status(500);
                    }
                    res.end();
                    return of(null);
                })
            ).toPromise();
    }
}
