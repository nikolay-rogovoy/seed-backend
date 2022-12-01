import * as crypto from 'crypto';
import { getLogger } from './libs/logger';
import * as jwt from 'jsonwebtoken';
import { IAuthPayload } from './i-auth-payload';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { CommonLib } from './common-lib';
import { UserTable } from './db/user-table';
import { User } from './model/user/user';

export class Auth {

    /***/
    static logger = getLogger(module);

    /**Ключ шифровки JWT*/
    get getSecret() {
        return 'TOPSECRETTTTT123123';
    };

    /**Разбор заголовка*/
    decodeAuthorizationToken(req): Observable<IAuthPayload> {
        const logId = CommonLib.getLogId();
        // Получить заголовок авторизации
        let token = req.get('Authorization');
        if (token != null) {
            if (token.startsWith('Bearer<') || token.startsWith('Bearer <')) {
                if (token.startsWith('Bearer <')) {
                    token = token.substring(8, token.length - 1);
                } else {
                    token = token.substring(7, token.length - 1);
                }
                try {
                    jwt.verify(token, this.getSecret);
                    // Токен нормальный
                    let payload = <IAuthPayload>jwt.decode(token);
                    payload.token = token;
                    return this.checkPayload(payload);
                } catch (error) {
                    return _throw(new InvalidToken(`Error verify token token=${token}`));
                }
            } else {
                return _throw(new BadAutorizationHeader(`Invalid format Authorization token=${token}`));
            }
        } else {
            return _throw(new NoAutorizationHeader(`Header Authorization not found`));
        }
    }

    /***/
    checkPayload(payload: IAuthPayload): Observable<IAuthPayload> {
        // Запросить данные в базе
        let userTable = new UserTable();

        return userTable.find((x: User) => x.iduser === payload.user.iduser)
            .pipe(
                map(
                    (user: User) => {
                        if (user && user.login === payload.user.login && crypto.createHash('md5').update(user.pass).digest("hex") === payload.user.password) {
                            return payload;
                        } else {
                            throw new InvalidPayload('Payload is invalid');
                        }
                    }
                )
            );
    }
}


/***/
export class InvalidToken {
    /***/
    constructor(public message: string) {
    }
}

/***/
export class BadAutorizationHeader {
    /***/
    constructor(public message: string) {
    }
}

/***/
export class NoAutorizationHeader {
    /***/
    constructor(public message: string) {
    }
}

/***/
export class InvalidPayload {
    /***/
    constructor(public message: string) {
    }
}
