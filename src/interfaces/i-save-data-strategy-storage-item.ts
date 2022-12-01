import { ISaveDataStrategyCtor } from './i-save-data-strategy-ctor';

/***/
export interface ISaveDataStrategyStorageItem {
    /***/
    name: string;
    /***/
    ctor: ISaveDataStrategyCtor<any>;
}
