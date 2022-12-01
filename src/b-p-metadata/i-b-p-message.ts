import { IMetadataTable } from '../metadata/i-metadata-table';

/***/
export interface IBPMessage extends IMetadataTable {
    requestExecutionError: number;
}
