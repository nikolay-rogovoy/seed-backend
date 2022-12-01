import { CmmsWoSumTable } from '../db/cmms-wo-sum-table';
import { CmmsWoTable } from '../db/cmms-wo-table';
import { DepTable } from '../db/dep-table';
import { PostTable } from '../db/post-table';
import { UserTable } from '../db/user-table';
import { UserdepTable } from '../db/userdep-table';
import { TableCtor } from './ctor-table';

/***/
export class MetadataStorage {
    /***/
    static getMetadata(): Metadata {
        return {
            user: {
                primaryKey: 'iduser',
                name: 'user',
                ctorTable: UserTable,
            },
            userdep: {
                primaryKey: 'iduserdep',
                name: 'userdep',
                ctorTable: UserdepTable,
            },
            dep: {
                primaryKey: 'iddep',
                name: 'dep',
                ctorTable: DepTable,
            },
            post: {
                primaryKey: 'idpost',
                name: 'post',
                ctorTable: PostTable,
            },
            cmms_wo: {
                primaryKey: 'work_order_no',
                name: 'cmms_wo',
                ctorTable: CmmsWoTable,
            },
            cmms_wo_sum: {
                primaryKey: 'activity',
                name: 'cmms_wo_sum',
                ctorTable: CmmsWoSumTable,
            },
        };
    }
}

/***/
export interface Metadata {
    /***/
    [index: string]: MetadataTable;
}

/***/
export interface MetadataTable {
    /***/
    primaryKey: string;
    /***/
    name: string;
    /***/
    ctorTable: TableCtor<any>;
}
