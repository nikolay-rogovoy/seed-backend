import { getServerAppMetadataArgsStorage } from "../../metadata/common-metadata";
import { ISaveDataStrategyStorageItem } from "../../interfaces/i-save-data-strategy-storage-item";

export function SaveDataMetadata(name: string): Function {
    return function (target: Function) {
        const saveDataMetadata = <ISaveDataStrategyStorageItem>{name, ctor: target};
        getServerAppMetadataArgsStorage().saveDataStrategyStorageItem.push(saveDataMetadata);
    };
}
