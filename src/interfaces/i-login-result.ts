import { IUserDep } from './i-user-dep';
import { ILoginUserInfo } from './iLoginUserInfo';

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