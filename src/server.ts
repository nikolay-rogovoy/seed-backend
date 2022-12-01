import * as bodyParser from 'body-parser';
import express from 'express';
import { Router } from 'express-serve-static-core';
import * as http from 'http';
import 'reflect-metadata';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { Observer } from 'rxjs/Observer';
import { map, switchMap } from 'rxjs/operators';
import config from './config/config';
import { getLogger } from './libs/logger';
import { logIdMiddleware } from './log-id-middleware';
import { RestRouter } from './rest-router';
import { reqMiddleware } from './req-middleware';
import { CommonLib } from './common-lib';
import { IServices, listen } from 'soap';
var xml = require('fs').readFileSync('hello_service.wsdl', 'utf8');
import { current } from 'node-zone';
import { RestRouterAuth } from './rest-router-auth';

/**OKNA.space backend server*/
export class Server {

    /***/
    static logger = getLogger(module);

    /**express*/
    app: express.Application;

    /***/
    httpServer: http.Server;

    /**Конструктор*/
    constructor() {
        this.initServer();
    }

    /***/
    private initServer(): void {
        this.app = express();
        this.httpServer = http.createServer(this.app);
    }

    /***/
    run(): Observable<http.Server> {
        return of('')
            .pipe(
                switchMap(() => this.configureExpress()),
                switchMap(() => this.startServer())
            );
    }

    /**Конфигурация HTTP сервера*/
    configureExpress(): Observable<string> {
        this.app.use(function (req, res, next) {
            // if (origins.indexOf(req.header('host').toLowerCase()) > -1) {
            //     res.header('Access-Control-Allow-Origin', `${req.headers.origin}`);
            // }
            res.header('Access-Control-Allow-Origin', `*`);
            res.header('Access-Control-Allow-Credentials', `true`);
            res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });
        this.app.use(bodyParser.urlencoded({ extended: true }));

        /**
         * https://stackoverflow.com/questions/19917401/error-request-entity-too-large
         * Размер для парсера, обязательно нужно установить
         * */
        this.app.use(bodyParser.json({ limit: '550mb' }));
        this.app.use(logIdMiddleware);
        this.app.use(reqMiddleware);
        let router: Router = express.Router();
        this.app.use('/api', router);
        let routerAuth: Router = express.Router();
        this.app.use('/api', routerAuth);
        const restRouter = new RestRouter();
        const restRouterAuth = new RestRouterAuth();
        restRouter.handleRoutes(router);
        restRouterAuth.handleRoutes(routerAuth);
        
        return of(null);
    };

    /**Запуск сервера*/
    startServer(): Observable<http.Server> {
        let myService: IServices = {
            Hello_Service: {
                Hello_Port: {
                    sayHello: function (args) {
                        return {
                            greeting: `Hello ${args.firstName}!`
                        };
                    },

                    // This is how to define an asynchronous function with a callback.
                    MyAsyncFunction: function (args, callback) {
                        // do some work
                        callback({
                            name: args.name
                        });
                    },

                    // This is how to define an asynchronous function with a Promise.
                    MyPromiseFunction: function (args) {
                        return new Promise((resolve) => {
                            // do some work
                            resolve({
                                name: args.name
                            });
                        });
                    },

                    // This is how to receive incoming headers
                    HeadersAwareFunction: function (args, cb, headers) {
                        return {
                            name: headers.Token
                        };
                    },

                    // You can also inspect the original `req`
                    reallyDetailedFunction: function (args, cb, headers, req) {
                        console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                        return {
                            name: headers.Token
                        };
                    }
                }
            }
        };

        // return of(this.httpServer);
        return Observable.create((observer: Observer<string>) => {
            // sticky.listen(this.httpServer, config.get('express:port'), () => {
            //     this.logger.info('App listening on port ');
            //     observer.next(null);
            //     observer.complete();
            // });
            this.httpServer.listen(config.get('express:port'), () => {
                let server = listen(this.app, '/wsdl', myService, xml, function () {
                    Server.logger.debug('server soap initialized');
                });
                server.log = function (type, data) {
                    Server.logger.debug(CommonLib.getLogString(current.get('id'), `${type}-${data}`));
                };
                server.on('request', function (request, methodName) {
                    Server.logger.debug(CommonLib.getLogString(current.get('id'), `request ${request}-${methodName}`));
                });
                server.on('response', function (response, methodName) {
                    Server.logger.debug(CommonLib.getLogString(current.get('id'), `response ${response}-${methodName}`));
                });
                server.on('headers', function (headers, methodName) {
                    Server.logger.debug(CommonLib.getLogString(current.get('id'), `headers ${headers}-${methodName}`));
                });
                observer.next(null);
                observer.complete();
            });
        })
        // Запуск экспресса по старому
        // this.app.listen(config.get('express:port'), () => {
        //     this.logger.info('startServer - OK');
        // });
    };

    /**Остановка сервера*/
    stop(err) {
        Server.logger.debug('stop - OK', err);
        this.httpServer.close();
    };
}
