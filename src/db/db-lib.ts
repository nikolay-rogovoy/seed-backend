import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
const fs = require('fs');

export class DbLib {
    static getAll<T>(entityName: string): Observable<T[]> {
        return Observable.create((obsever: Observer<T>) => {
            fs.readFile(`data/${entityName}.json`, (err, rawData) => {
                if (err) {
                    obsever.error(err);
                } else {
                    let data = JSON.parse(rawData);
                    obsever.next(data);
                    obsever.complete();
                }
            });
        });
    }
}
