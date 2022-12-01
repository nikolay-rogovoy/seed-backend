import { IAuthUser } from './i-auth-user';

/***/
export interface IAuthPayload {
    /***/
    iss: string;
    /**/
    aud: string;
    /***/
    iat: number;
    /***/
    typ: string;
    /***/
    user: IAuthUser;
    /***/
    token: string;
}
