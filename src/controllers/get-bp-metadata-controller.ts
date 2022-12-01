import { Request, Response } from 'express-serve-static-core';
import { getLogger } from '../libs/logger';
import { BaseAuthController } from './base-auth-controller';
import { Lib } from '../libs/lib';
import { CommonLib } from '../common-lib';

/***/
export class GetBpMetadataController extends BaseAuthController {

    /***/
    static logger = getLogger(module);

    /***/
    lib = new Lib();

    /***/
    constructor() {
        super();
    }

    /***/
    async handler(req: Request, res: Response) {
        GetBpMetadataController.logger.debug(`handleRoutes /bp_mt`);
        CommonLib.getAllMetadata()
            .subscribe(
                (metadata) => {
                    res.status(200);
                    res.json({
                        message: 'Successful',
                        result: {
                            data: metadata
                        }
                    });
                },
                (error) => {
                    GetBpMetadataController.logger.error(error);
                    res.status(500);
                    res.json({
                        message: error.toString()
                    });
                }
            );
    }
}
