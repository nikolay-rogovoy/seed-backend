import { Request } from 'express-serve-static-core';
import { current } from 'node-zone';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { map, switchMap } from 'rxjs/operators';
import { IBPMetadata } from './b-p-metadata/i-b-p-metadata';
import { IMetadataTable } from './metadata/i-metadata-table';
const oracledb = require('oracledb');
import config from './config/config';
import { MockConnection } from './mock-connection';

/***/
export class CommonLib {

    /***/
    static getLogString(id: number, message: string | object): string {
        let logRow = { id, user: null, ip: null, message };
        const req = <Request>current.get('req');
        if (req) {
            logRow.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        }
        return JSON.stringify(logRow);
    }

    /***/
    static getConnection() {
        if (config.get('server:mosk')) {
            return of(new MockConnection());
        } else {
            return fromPromise(oracledb.getConnection(
                {
                    user: 'apps',
                    password: 'apps',
                    connectionString: 'FMISDB02AE:1521/LUKPROD',
                })
            );
        }
    }

    static getOracleMonth(monthInd: number) {
        switch (monthInd) {
            case 0:
                return 'JAN';
            case 1:
                return 'FEB';
            case 2:
                return 'MAR';
            case 3:
                return 'APR';
            case 4:
                return 'MAY';
            case 5:
                return 'JUN';
            case 6:
                return 'JUL';
            case 7:
                return 'AUG';
            case 8:
                return 'SEP';
            case 9:
                return 'OCT';
            case 10:
                return 'NOV';
            case 11:
                return 'DEC';
            default:
                throw new Error(`Unknown index ${monthInd}`);
        }
    }

    static getJSMonthFromOracleMonth(monthAliase: string): number {
        switch (monthAliase.toUpperCase()) {
            case 'JAN':
                return 1;
            case 'FEB':
                return 2;
            case 'MAR':
                return 3;
            case 'APR':
                return 4;
            case 'MAY':
                return 5;
            case 'JUN':
                return 6;
            case 'JUL':
                return 7;
            case 'AUG':
                return 8;
            case 'SEP':
                return 9;
            case 'OCT':
                return 10;
            case 'NOV':
                return 11;
            case 'DEC':
                return 12;
            default:
                throw new Error(`Unknown aliase ${monthAliase}`);
        }
    }

    static parseOracleDate(source: string): Date {
        if (source == null) {
            return null;
        }
        let parts = source.split('-');
        if (parts.length === 3) {
            return new Date(Date.parse(`20${parts[2]}-${CommonLib.getJSMonthFromOracleMonth(parts[1])}-${CommonLib.padStart(parts[0], 2, '0')} 12:00:00`));
        } else {
            return null;
        }
    }

    /***/
    static getOracleData(date: Date) {
        return `${CommonLib.padStart(date.getDate().toString(), 2, '0')}-${CommonLib.getOracleMonth(date.getMonth())}-${date.getFullYear().toString().slice(2, 4)}`;
    }

    /***/
    static padStart(source: string, targetLength: number, padString: string): string {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (source.length > targetLength) {
            return String(source);
        }
        else {
            targetLength = targetLength - source.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(source);
        }
    }

    /***/
    static execute(query: string): Observable<boolean> {
        return CommonLib.getConnection()
            .pipe(
                switchMap((connection: any) => {
                    return fromPromise(
                        connection.execute(query, [], { autoCommit: true })
                    );
                }),
                switchMap((result: any) => {
                    console.log(result);
                    return of(true);
                }),
            )
    }
    /***/
    static select(query: string): Observable<any[]> {
        return CommonLib.getConnection()
            .pipe(
                switchMap((connection: any) => {
                    return fromPromise(
                        connection.execute(query,
                            [],
                            {
                                // resultSet: true,
                                outFormat: oracledb.OUT_FORMAT_OBJECT,
                                autoCommit: true,
                            }
                        )
                    );
                }),
                switchMap((result: any) => {
                    return of(result.rows);
                    // const rs = result.resultSet;
                    // return CommonLib.getRows(rs)
                    //     .pipe(
                    //         switchMap((result: any[]) => {
                    //             return fromPromise(rs.close())
                    //                 .pipe(
                    //                     map(() => {
                    //                         return result;
                    //                     })
                    //                 );
                    //         })
                    //     );
                }),
            )
    }

    /***/
    static getMonthStr(date: Date) {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];
        return monthNames[date.getMonth()];
    }

    /***/
    static getRows(rs): Observable<any[]> {
        return fromPromise(rs.getRow())
            .pipe(
                switchMap((row: any) => {
                    if (row) {
                        return CommonLib.getRows(rs)
                            .pipe(
                                switchMap((rowsNext: any[]) => {
                                    return of([row, ...rowsNext]);
                                })
                            );
                    } else {
                        return of([]);
                    }
                })
            );
    }

    /***/
    static getLogId(): number {
        return current.get('id');
    }

    /***/
    static getMetadata<T extends IMetadataTable>(entityName: string): Observable<T> {
        if (entityName) {
            let metadata = current.get('metadata');
            if (metadata && metadata[entityName]) {
                return of(metadata[entityName]);
            } else {
                return of(<T>{});
            }
        } else {
            return of(<T>{});
        }
    }

    /***/
    static getAllMetadata(): Observable<IBPMetadata> {
        return of(<IBPMetadata>{});
    }
}
