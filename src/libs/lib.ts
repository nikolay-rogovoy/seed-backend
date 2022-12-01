import { getLogger } from './logger';
import { Response } from 'express-serve-static-core';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { CommonLib } from '../common-lib';
import { switchMap } from 'rxjs/operators';

export class Lib {

    /***/
    static logger = getLogger(module);

    /**Форматировать телефон*/
    getFormatPhone(phone: string) {
        // Удалить все кроме цифер
        phone = phone.replace(/\D/g, '');
        return phone;
    }

    /**Форматировать телефон*/
    getFormatPhoneOld(phone: string) {
        // Удалить все кроме цифер
        phone = phone.replace(/\D/g, '');

        // Добавляем разделители
        if (phone.length === 0) {
            phone = '';
        } else if (phone.length <= 1) {
            phone = phone.replace(/^(\d{0,1})/, '+$1');
        } else if (phone.length <= 4) {
            phone = phone.replace(/^(\d{0,1})(\d{0,3})/, '+$1($2');
        } else if (phone.length <= 7) {
            phone = phone.replace(/^(\d{0,1})(\d{0,3})(\d{0,3})/, '+$1($2) $3');
        } else if (phone.length <= 9) {
            phone = phone.replace(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})/, '+$1($2) $3-$4');
        } else {
            phone = phone.replace(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(.*)/, '+$1($2) $3-$4-$5');
        }
        return phone;
    }

    /**
     * Получить get запрос
     * */
    responseToGetQuery(res, pool, entityName, value, columnName, columnValue, columnValue2, valueGroup, idcustomerkey, idcustomer, idcustomerdepartment) {

        // Обрабатываем нулл поля
        if (columnValue === 'null') {
            columnValue = null;
        }

        //Запрос
        let query = 'select * from get_entity_json($1, $2, $3, $4, $5, $6, $7, $8, $9);';

        pool.query(query, [entityName, idcustomerkey, idcustomer, value, columnName, columnValue, columnValue2, valueGroup, idcustomerdepartment], (err, result) => {
            if (err) {
                let errorMessage = `requestExecutionError:${'\n'}${query}${'\n'}entityName=${entityName}, value=${value}, columnName=${columnName}, columnValue=${columnValue}, valueGroup=${valueGroup}${'\n'}${err}`;
                Lib.logger.error(errorMessage);
                res.status(500);
                res.json({
                    message: errorMessage
                });
            } else {

                let rowsShema = null;
                if (result.rows.length == 1
                    && result.rows[0]['idmessage'] != null
                ) {
                    rowsShema = result.rows[0];
                }

                if (rowsShema == null) {
                    let errorMessage = 'Неправильный возврат результата сохранения:\n'
                        + query;
                    Lib.logger.error(errorMessage);
                    res.status(500);
                    res.json({
                        message: errorMessage
                    });
                }
                else {

                    if (rowsShema['idmessage'] == 4) {
                        let errorMessage = 'Не найденн объект  #' + value;
                        Lib.logger.info(errorMessage);
                        res.status(404);
                        res.json({
                            message: errorMessage
                        });
                    }
                    else if (rowsShema['idmessage'] == 6) {
                        let resultObject = rowsShema['result'];
                        let resultData = {
                            message: 'Successful',
                            result: resultObject
                        };
                        res.json(resultData);
                    }
                    else {
                        let errorMessage = 'Ошибка получения данных #'
                            + value + '\n' + query + '\n' + rowsShema['message'];
                        Lib.logger.error(errorMessage);
                        res.status(500);
                        res.json({
                            message: errorMessage
                        });
                    }

                }
            }
        });
    }

    /**
     * Ответ на запрос
     * */
    responseAnyQuery(res, pool, query, ...params) {
        pool.query(query, params, (err, result) => {
            if (err) {
                let errorMessage = 'requestExecutionError:\n' + query + '\n' + err;
                Lib.logger.error(errorMessage);
                res.status(500);
                res.json({ message: errorMessage });
            } else {
                Lib.logger.debug(result.rows);
                let resultData = {
                    message: 'Successful',
                    result: {
                        data: result.rows
                    }
                };
                res.json(resultData);
            }
        });
    }
}
