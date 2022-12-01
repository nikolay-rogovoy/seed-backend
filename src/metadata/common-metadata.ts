import {ServerAppMetadataArgsStorage} from './server-app-metadata-args-storage';

/**
 * Gets metadata args storage.
 */
export function getServerAppMetadataArgsStorage(): ServerAppMetadataArgsStorage {
    const globalScope: any = global;
    if (!globalScope.serverAppMetadataArgsStorage)
        globalScope.serverAppMetadataArgsStorage = new ServerAppMetadataArgsStorage();

    return globalScope.serverAppMetadataArgsStorage;
}
