import { getServerAppMetadataArgsStorage } from '../../metadata/common-metadata';
import { ISaveDataStrategy } from '../../interfaces/i-save-data-strategy';
import { MetadataTable } from '../../model/metadata';
import { CmmsWoSaveDataStrategy } from './custom/cmms-wo-save-data-strategy';

/***/
export class SaveDataStrategyFactory<T> {

    /***/
    constructor(private metadataTable: MetadataTable) {
    }

    /***/
    getStrategy(): ISaveDataStrategy<T> {

        // todo  - Сделать загрузчик модулей
        let arr = [
            CmmsWoSaveDataStrategy,
        ];

        let strategy = getServerAppMetadataArgsStorage()
            .saveDataStrategyStorageItem.find(x => x.name === this.metadataTable.name);
        if (strategy) {
            return new strategy.ctor(this.metadataTable.ctorTable);
        } else {
            throw (new Error(`strategy not found`));
        }
    }
}
