import { ISaveDataStrategy } from './i-save-data-strategy';

/***/
export interface ISaveDataStrategyCtor<T> {
    /***/
    new(ctor: T): ISaveDataStrategy<T>;
}
