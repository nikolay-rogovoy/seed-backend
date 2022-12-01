'use strict'

import * as cluster from 'cluster';
import { create } from 'domain';
import { of } from 'rxjs/observable/of';
import { switchMap } from 'rxjs/operators';
import * as sticky from 'sticky-session';
import { AddRoutesError } from './add-routes-error';
import config from './config/config';
import { getLogger } from './libs/logger';
import { Server } from './server';
var os = require('os');
const rp = require('request-promise');

(function main() {

    /***/
    let logger = getLogger(module);

    let serverDomain = create();
    serverDomain.on('error',
        (err) => {
            if (err instanceof AddRoutesError) {
                logger.debug(`serverDomain: Ошибка: ${err.name}\nсообщение: ${err.message}\n${err.stack}`);
            }
            else {
                logger.debug(`serverDomain: Ошибка: ${err.name}\nсообщение: ${err.message}\n${err.stack}`);
            }
        }
    );

    // Запуск сервера
    serverDomain.run(
        () => {
            let server = new Server();
            logger.debug('> Server()');
            server.run()
                .pipe(
                    switchMap(() => {
                        if (config.get('server:pulse_schedule')) {
                            setTimeout(() => {
                                setInterval(() => {
                                    rp({
                                        jar: true,
                                        method: 'POST',
                                        uri: `http://localhost:${process.env.PORT || config.get('express:port')}/api/pulse_schedule`,
                                        timeout: 0,
                                        headers:
                                        {
                                            'content-type': 'application/json',
                                        }
                                    })
                                        .catch((error) => {
                                        });
                                }, 60000);
                            }, 60000 * 15);
                        }
                        return of(true);
                    })
                )
                .subscribe(() => { logger.debug('< Server()') });
        });

    // /**Запуск сервера*/
    // serverDomain.run(
    //     () => {
    //         let server = new Server();
    //         const port = process.env.PORT ? process.env.PORT : config.get('express:port');
    //         let qu_workers = process.env.SERVER_DEBUG ? 1 : os.cpus().length;
    //         if (qu_workers > config.get('server:max_workers')) {
    //             qu_workers = config.get('server:max_workers');
    //         }
    //         if (!sticky.listen(server.httpServer, port,
    //             { workers: qu_workers })) {
    //             // Master code
    //             server.httpServer.once('listening', function () {
    //                 console.log(`server started on ${port} port`);
    //                 if (config.get('server:pulse_schedule')) {
    //                     setTimeout(() => {
    //                         setInterval(() => {
    //                             rp({
    //                                 jar: true,
    //                                 method: 'POST',
    //                                 uri: `http://localhost:${process.env.PORT || config.get('express:port')}/api/pulse_schedule`,
    //                                 timeout: 0,
    //                                 headers:
    //                                 {
    //                                     'content-type': 'application/json',
    //                                 }
    //                             })
    //                                 .catch((error) => {
    //                                 });
    //                         }, 60000);
    //                     }, 60000 * 15);
    //                 }
    //             });
    //         } else {
    //             // Worker code
    //             server.run().subscribe(() => {
    //                 logger.debug(`Server started id = ${cluster.worker.id}, port: ${port}`)
    //             });
    //         }
    // });
})();
