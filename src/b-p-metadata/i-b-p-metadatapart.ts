import { IMetadataTable } from '../metadata/i-metadata-table';

export interface IMetadataPart {
    [index: string]: IMetadataTable;
}
