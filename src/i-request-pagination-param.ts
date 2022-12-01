import { IRequestPaginationParamFilter } from './i-request-pagination-param-filter';
import { IRequestPaginationParamSort } from './i-request-pagination-param-sort';

/***/
export interface IRequestPaginationParam {
    /***/
    limit: number;
    /***/
    offset: number;
    /***/
    filters: IRequestPaginationParamFilter[];
    /***/
    sorts: IRequestPaginationParamSort[];
}
