import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { ISaveDataStrategy } from '../../../interfaces/i-save-data-strategy';
import { SaveDataMetadata } from '../save-data-metadata';
import { of } from 'rxjs/observable/of';
import { CommonLib } from '../../../common-lib';
import { CmmsWo } from '../../../model/cmms/cmms-wo';

/***/
@SaveDataMetadata('cmms_wo')
export class CmmsWoSaveDataStrategy<T extends CmmsWo> implements ISaveDataStrategy<T> {

    /***/
    constructor() {
    }

    /***/
    createEntity(object: any): Observable<T> {
        return _throw(new Error(`not implemented`));
    }

    /***/
    updateEntities(entities: T[]): Observable<T[]> {
        return from(entities)
            .pipe(
                mergeMap((entity: T) => this.updateEntity(entity)),
                reduce((acc: T[], val: T) => {
                    if (val) {
                        acc.push(val);
                    }
                    return acc;
                }, [])
            )
    }

    /***/
    updateEntity(entity: T): Observable<T> {
        let attribute4 = new Date(Date.parse(<string><any>entity.attribute4));
        let query = `
            declare
            begin
            
            update wip_discrete_jobs set attribute4='${CommonLib.getOracleData(attribute4)}' where wip_discrete_jobs.organization_id = 83 and wip_discrete_jobs.wip_entity_id in (
            select we.wip_entity_id
            from wip_entities we
            where we.organization_id = 83 and we.wip_entity_name = '${entity.work_order_no}');
            
            update wip_operations set attribute6='${entity.qty}' where wip_operations.organization_id = 83 and wip_operations.wip_entity_id in (
            select we.wip_entity_id
            from wip_entities we
            where we.organization_id = 83 and we.wip_entity_name = '${entity.work_order_no}');
            
            end;
            `;
            // commit;
        console.log(entity, attribute4, query);
        return CommonLib.execute(query)
        // return of(entity)
        .pipe(
            map(() => {
                return entity;
            })
        );
    }
}
