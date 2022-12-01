import { Request, Response } from 'express-serve-static-core';
import { CommonLib } from '../common-lib';
import { getLogger } from '../libs/logger';
import { _throw } from 'rxjs/observable/throw';
import { BaseController } from './base-controller';
import { of } from 'rxjs/observable/of';

/***/
export class PulseScheduleController extends BaseController {

    /***/
    static logger = getLogger(module);

    /***/
    constructor() {
        super();
    }

    /***/
    async handler(req: Request, res: Response) {
        const logId = this.getLogId();
        PulseScheduleController.logger.debug(CommonLib.getLogString(logId, `handleRoutes pulse_schedule`));

        of()
            .pipe()
            .subscribe(() => {
                res.json({
                    message: 'Successful'
                });
                PulseScheduleController.logger.debug(CommonLib.getLogString(logId, `Completed`));
            },
                (error) => {
                    let errorMessage = error.message;
                    PulseScheduleController.logger.error(CommonLib.getLogString(logId, { error: errorMessage }));
                    res.status(500);
                    res.json({ message: errorMessage });
                });
    }
}
