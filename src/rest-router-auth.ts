import { Request, Response, Router, NextFunction } from 'express-serve-static-core';
import { current } from 'node-zone';
import { IRequestParam } from './actions/i-request-param';
import { Auth } from './auth';
import { authMiddleware } from './auth-middleware';
import { BaseAuthController } from './controllers/base-auth-controller';
import { GetBpMetadataController } from './controllers/get-bp-metadata-controller';
import { GetController } from './controllers/get-controller';
import { GetFilesController } from './controllers/get-files-controller';
import { GetListController } from './controllers/get-list-controller';
import { SaveDataController } from './controllers/save-data-controller';
import { T1Controller } from './controllers/t1-controller';
import { Lib } from './libs/lib';
import { getLogger } from './libs/logger';
import { MetadataStorage } from './model/metadata';


/**Класс обработки маршрутов*/
export class RestRouterAuth {

    /***/
    static logger = getLogger(module);

    /***/
    lib = new Lib();

    /***/
    auth = new Auth();

    /***/
    // entityFactory = new EntityFactory();

    /*
     * Используемые коды ответа HTTP
     *
     * 200 OK — успешный запрос. Если клиентом были запрошены какие-либо данные, то они находятся в заголовке и/или теле сообщения.
     * 201 Created — в результате успешного выполнения запроса был создан новый ресурс.
     *               Сервер может указать адреса (их может быть несколько) созданного ресурса в теле ответа, при этом предпочтительный
     *               адрес указывается в заголовке Location. Серверу рекомендуется указывать в теле ответа характеристики созданного
     *               ресурса и его адреса, формат тела ответа определяется заголовком Content-Type.
     *
     * 400 Bad Request — сервер обнаружил в запросе клиента синтаксическую ошибку.
     * 401 Unauthorized — для доступа к запрашиваемому ресурсу требуется аутентификация.
     *               В заголовке ответ должен содержать поле WWW-Authenticate с перечнем условий аутентификации. Клиент может повторить
     *               запрос, включив в заголовок сообщения поле Authorization с требуемыми для аутентификации данными.
     * 403 Forbidden - (запрещено (не уполномочен));
     * 404 Not Found — основная причина — ошибка в написании адреса Web-страницы. Сервер понял запрос, но не нашёл соответствующего
     *               ресурса по указанному URI. Если серверу известно, что по этому адресу был документ, то ему желательно использовать
     *               код 410.
     * 424 Failed Dependency - реализация текущего запроса может зависеть от успешности выполнения другой операции.
     *               Если она не выполнена и из-за этого нельзя выполнить текущий запрос, то сервер вернёт этот код.
     *
     * 500 Internal Server Error — любая внутренняя ошибка сервера, которая не входит в рамки остальных ошибок класса.
     *
     *
     * */

    async handleRoutes(router: Router) {

        let cnt: BaseAuthController = null;

        router.use(authMiddleware);

        cnt = new GetListController(MetadataStorage.getMetadata()['user']);
        router.get('/user', cnt.handler.bind(cnt));

        cnt = new GetController(MetadataStorage.getMetadata()['user']);
        router.get('/user/:id', cnt.handler.bind(cnt));

        cnt = new GetListController(MetadataStorage.getMetadata()['userdep']);
        router.get('/userdep', cnt.handler.bind(cnt));

        cnt = new GetController(MetadataStorage.getMetadata()['userdep']);
        router.get('/userdep/:id', cnt.handler.bind(cnt));

        cnt = new GetListController(MetadataStorage.getMetadata()['dep']);
        router.get('/dep', cnt.handler.bind(cnt));

        cnt = new GetController(MetadataStorage.getMetadata()['dep']);
        router.get('/dep/:id', cnt.handler.bind(cnt));

        cnt = new GetBpMetadataController();
        router.get('/bp_mt', this.setRequestContext(cnt));

        cnt = new GetFilesController();
        router.get('/get_files', this.setRequestContext(cnt));

        cnt = new SaveDataController(MetadataStorage.getMetadata()['cmms_wo']);
        router.post(`/cmms_wo/:iddep`, this.setRequestContext(cnt, 'iddep'));

        cnt = new T1Controller();
        router.get(`/t1`, this.setRequestContext(cnt, 'iddep'));

    }

    /***/
    setRequestContext(controller: BaseAuthController, propName?: string) {
        return (req: Request, res: Response, next: NextFunction) => {

            let iddep = null;
            if (propName) {
                iddep = +req.params[propName];
            }
            let requestParam = <IRequestParam>{
                iddep: iddep,
            };
            current.fork({
                properties: {
                    requestParam,
                }
            }).run(async () => {
                controller.handler(req, res, next);
            });
        }
    }
}
