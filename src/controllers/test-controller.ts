import { Request, Response } from 'express-serve-static-core';
import { getLogger } from '../libs/logger';
import { BaseController } from './base-controller';
import { _throw } from 'rxjs/observable/throw';
import { CommonLib } from '../common-lib';
import { of } from 'rxjs/observable/of';

/***/
export class TestController extends BaseController {

    /***/
    static logger = getLogger(module);

    /***/
    constructor() {
        super();
    }

    /***/
    async handler(req: Request, res: Response) {
        const logId = this.getLogId();

        TestController.logger.info(CommonLib.getLogString(logId, 'handleRoutes /test get'));

        //CommonLib.select(`select * from hr_organization_units`)
        CommonLib.select(`select * from hr_organization_units`)
            .subscribe(
                (result) => {
                    TestController.logger.info(CommonLib.getLogString(logId, `Test api - OK!`));
                    res.json({ message: `Test api - OK!`, result: result.map(x => x.NAME) });
                }
            );
    }
}
