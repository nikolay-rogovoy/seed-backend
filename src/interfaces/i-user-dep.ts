import { IUserDepPost } from './i-user-dep-post';

/***/
export interface IUserDep {
    /***/
    iddep: number;
    /***/
    name: string;
    /***/
    comment: string;
    /***/
    posts: IUserDepPost[];
}
