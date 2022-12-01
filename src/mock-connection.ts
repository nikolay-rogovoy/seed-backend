import { getLogger } from './libs/logger';

/***/
export class MockConnection {

    /***/
    static logger = getLogger(module);

    /***/
    execute(query: string, arr: [], param) {
        MockConnection.logger.debug(query);
        if (query.indexOf('LUKOIL_EAM_REPORTS.ApproveWO') !== -1) {
            return Promise.resolve({ rows: [
                {
                    wip_entity_id: '001001',
                    order_num: '001001',
                    work_order_no: '001001',
                    user_text: 'user_text',
                    work_order_status_pending: 'Released',
                    work_order_type: 'Preventive maitenence',
                    description: 'description',
                    completion_date: 'completion_date',
                    scheduled_start_date: '01-DEC-22',
                    scheduled_completion_date: '01-DEC-22',
                    asset_number: 'asset_number',
                    asset_description: 'asset_description',
                    activity: 'activity',
                    wip_accounting_class: 'wip_accounting_class',
                    qty: 1,
                    unit_rate: 2.5,
                }
            ] });
        } else {
            return Promise.resolve({ rows: [] });
        }
    }
}
