import * as crypto from 'crypto';
import { Request, Response } from 'express-serve-static-core';
import * as jwt from 'jsonwebtoken';
import { Auth } from '../auth';
import { IAuthPayload } from '../i-auth-payload';
import { IAuthUser } from '../i-auth-user';
import { ILoginResult } from '../i-login-result';
import { getLogger } from '../libs/logger';
import { BaseController } from './base-controller';
import { CommonLib } from '../common-lib';
import { switchMap, catchError, map, mergeMap, reduce } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { Observable } from 'rxjs/Observable';
import { UserTable } from '../db/user-table';
import { User } from '../model/user/user';
import { Lib } from '../libs/lib';
import { IUserDep } from '../interfaces/i-user-dep';
import { UserdepTable } from '../db/userdep-table';
import { Userdep } from '../model/user/userdep';
import { from } from 'rxjs/observable/from';
import { DepTable } from '../db/dep-table';
import { Dep } from '../model/user/dep';
import { PostTable } from '../db/post-table';
import { Post } from '../model/user/post';

/***/
export class LoginController extends BaseController {

    /***/
    static logger = getLogger(module);

    /***/
    lib = new Lib();

    /***/
    auth = new Auth();

    /***/
    constructor() {
        super();
    }

    /***/
    async handler(req: Request, res: Response) {
        const logId = this.getLogId();
        LoginController.logger.debug(CommonLib.getLogString(logId, 'handleRoutes /login'));

        let userUnfo = req.body;

        if (this.checkRequest(userUnfo, logId, res)) {
            let user = userUnfo.user;
            let pass = userUnfo.pass;
            LoginController.logger.debug(CommonLib.getLogString(logId, `user: ${user}, pwd: ${pass}`));
            // Запросить данные в базе
            let userTable = new UserTable();
            userTable.findAll((x: User) => x.login === user && x.pass === pass)
                .pipe(
                    switchMap((users: User[]) => {
                        if (users.length > 1) {
                            return _throw(new ManyUserError(''));
                        } else if (users.length === 0) {
                            return _throw(new NotFoundCustomerError(''));
                        } else {
                            let userRow = users[0];
                            // Найден пользователь
                            let payload = this.getPayload(userRow);
                            // Получить токен
                            return bindNodeCallback(<(v1: IAuthPayload, v2: string, callback: (err: any, token: string) => any) => any>jwt.sign)(payload, this.auth.getSecret)
                                .pipe(
                                    catchError((errorJWT) => {
                                        return _throw(new GetTokenError(errorJWT));
                                    }),
                                    switchMap((token) => {
                                        return this.getLoginResult(token, userRow);
                                    })
                                );
                        }
                    })
                )
                .subscribe((loginResult: ILoginResult) => {
                    LoginController.logger.debug(CommonLib.getLogString(logId, `Пользователь прошел авторизацию успешно: ${user}`));
                    res.json(loginResult);
                },
                    (error) => {
                        if (error instanceof ManyUserError) {
                            // Несколько записей, такого быть не должно
                            let message = `Несколько записей для ${user}`;
                            LoginController.logger.error(CommonLib.getLogString(logId, message));
                            res.status(500);
                            res.json({ message: message, success: false });
                        } else if (error instanceof GetTokenError) {
                            // Ошибка получения токена
                            res.status(500);
                            res.json({ message: error.message, success: false });
                        } else if (error instanceof NotFoundCustomerError) {
                            // Не найдено записей, значит логин/пароль неправильный
                            let message = `Неправильный логин/пароль`;
                            LoginController.logger.info(CommonLib.getLogString(logId, message));
                            res.json({ message: message, success: false });
                        } else if (error instanceof UndefinedCustomerError) {
                            let message = `Не удалось определить idcustomerkey для ${user}`;
                            LoginController.logger.info(CommonLib.getLogString(logId, message));
                            res.status(400);
                            res.json({ message: message, success: false });
                        } else {
                            let errorMessage = `Ошибка получения данных из БД о пользователе: user = ${user}; ${error}`;
                            LoginController.logger.error(CommonLib.getLogString(logId, errorMessage));
                            res.status(500);
                            res.json({ message: errorMessage, success: false });
                        }
                    })
        }
    }

    /***/
    checkRequest(userUnfo: any, logId: number, res: Response): boolean {
        // Проверка объекта на правильность
        if (userUnfo.user == null) {
            let message = `Нет поля user: ${JSON.stringify(userUnfo)}`;
            LoginController.logger.error(CommonLib.getLogString(logId, message));
            res.json({ message: message, success: false });
            return false;
        }
        if (userUnfo.pass == null) {
            let message = `Нет поля pass: ${JSON.stringify(userUnfo)}`;
            LoginController.logger.error(CommonLib.getLogString(logId, message));
            res.json({ message: message, success: false });
            return false;
        }
        // Обязательно должны быть заполнены
        if (userUnfo.user === '' || userUnfo.pass === '') {
            let message = `Логин и пароль не должны быть пустыми`;
            LoginController.logger.error(CommonLib.getLogString(logId, message));
            res.json({ message: message, success: false });
            return false;
        }
        return true;
    }

    /***/
    getLoginResult(token: string, userRow: User): Observable<ILoginResult> {
        return this.getUserDeps(userRow.iduser)
            .pipe(
                map((userDeps: IUserDep[]) => {
                    return <ILoginResult>{
                        message: 'Successful',
                        success: true,
                        token: token,
                        user: {
                            iduser: userRow.iduser,
                            user_name: userRow.name,
                        },
                        iduserdeps: userDeps
                    };
                })
            );
    }

    /***/
    getUserDeps(iduser: number): Observable<IUserDep[]> {
        return new UserdepTable().findAll(x => x.iduser === iduser)
            .pipe(
                switchMap((userdeps: Userdep[]) => {
                    return from(userdeps)
                        .pipe(
                            mergeMap((userdep: Userdep) => {
                                return new PostTable().find(x => x.idpost === userdep.idpost)
                                    .pipe(
                                        switchMap((post: Post) => {
                                            return new DepTable().find(x => x.iddep === userdep.iddep)
                                                .pipe(
                                                    switchMap((dep: Dep) => {
                                                        return of({
                                                            iddep: userdep.iddep,
                                                            name: dep.name,
                                                            comment: null,
                                                            posts: [post]
                                                        });
                                                    }),
                                                );
                                        })
                                    );
                            }),
                            reduce((acc: IUserDep[], val: IUserDep) => {
                                acc.push(val);
                                return acc;
                            }, [])
                        );
                })
            );
    }

    /***/
    getPayload(userRow: User): IAuthPayload {
        return <IAuthPayload>{
            iss: 'my_issurer',
            aud: 'World',
            iat: 1400062400223,
            typ: '/online/transactionstatus/v2',
            user: <IAuthUser>{
                iduser: userRow.iduser,
                user_name: userRow.name,
                login: userRow.login,
                password: crypto.createHash('md5').update(userRow.pass).digest("hex"),
            }
        }
    }

}

/***/
class ManyUserError {
    /***/
    constructor(public message: string) { }
}

/***/
class UndefinedCustomerError {
    /***/
    constructor(public message: string) { }
}

/***/
class NotFoundCustomerError {
    /***/
    constructor(public message: string) { }
}

/***/
class GetTokenError {
    /***/
    constructor(public message: string) { }
}

