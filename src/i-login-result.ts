import { ILoginUserInfo } from './iLoginUserInfo';
import { IUserDep } from './interfaces/i-user-dep';

/***/
export interface ILoginResult {
    /***/
    message: string,
    /***/
    success: boolean,
    /***/
    token: string,
    /***/
    user: ILoginUserInfo
    /***/
    iduserdeps: IUserDep[]
}
