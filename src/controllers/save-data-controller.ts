import { Request, Response } from 'express-serve-static-core';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { from } from 'rxjs/observable/from';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { map, mergeMap, reduce, switchMap, catchError } from 'rxjs/operators';
import { Auth } from '../auth';
import { getLogger } from '../libs/logger';
import { getServerAppMetadataArgsStorage } from '../metadata/common-metadata';
import { BaseAuthController } from './base-auth-controller';
import { _throw } from 'rxjs/observable/throw';
import { IBPMessage } from '../b-p-metadata/i-b-p-message';
import { MetadataTable } from '../model/metadata';
import { CommonLib } from '../common-lib';
import { ISaveDataStrategy } from '../interfaces/i-save-data-strategy';
import { SaveDataStrategyFactory } from '../strategy/save-data-strategy/save-data-strategy-factory';


/***/
class NotFoundEntity {
  /***/
  constructor(public message: string) {
  }
}

/***/
export class SaveDataController<T> extends BaseAuthController {

  /***/
  static logger = getLogger(module);

  /***/
  constructor(public metadataTable: MetadataTable) {
    super();
  }

  /***/
  async handler(req: Request, res: Response) {
    const logId = this.getLogId();
    SaveDataController.logger.debug(CommonLib.getLogString(logId, `handleRoutes -> post /${this.metadataTable.name}`));

    this.getSaveDataStrategy(this.metadataTable)
      .pipe(
        switchMap((saveDataStrategy) => {
          if (req.body == null) {
            return _throw(new Error('body is null'));
          } else if (req.body.data == null) {
            return _throw(new Error('body.data is null'));
          } else if (!Array.isArray(req.body.data)) {
            return _throw(new Error('body.data is not array'));
          }
          let entitysToSave = (<any[]>req.body.data);
          CommonLib.getLogString(logId, req.body.data);
          return this.saveRawData(entitysToSave, saveDataStrategy);
        }),
      )
      .subscribe((savedEntitys: any[]) => {
        let primaryColumn = this.metadataTable.primaryKey;
        res.json({
          message: 'Successful',
          result: savedEntitys.map(x => {
            return {
              key_value: x[primaryColumn]
            };
          })
        });
        SaveDataController.logger.debug(CommonLib.getLogString(logId, `Сохранение выполнено успешно ${savedEntitys.map(x => x[primaryColumn])}`));
      },
        (error => {
          this.handleError(error, logId, req, res);
        })
      );
  }

  /***/
  handleError(error, logId: number, req: Request, res: Response) {
    if (error instanceof NotFoundEntity) {
      SaveDataController.logger.error(CommonLib.getLogString(logId, { error: error.message }));
      res.status(404);
      res.json({ message: error.message });
      SaveDataController.logger.error(CommonLib.getLogString(logId, { body: req.body }));
    }
    else {
      let errorMessage = `Request Execution Error: ${error.message ? error.message : error}`;
      SaveDataController.logger.error(CommonLib.getLogString(logId, { error: errorMessage }));
      SaveDataController.logger.error(CommonLib.getLogString(logId, { body: req.body }));
      res.status(500);
      res.json({ message: errorMessage });
    }
  }

  /***/
  getSaveDataStrategy<T>(metadataTable: MetadataTable): Observable<ISaveDataStrategy<T>> {
    return of(new SaveDataStrategyFactory<T>(metadataTable).getStrategy());
  }

  /***/
  saveRawData(entitysToSave: any[], saveDataStrategy: ISaveDataStrategy<any>): Observable<any[]> {
    let newEntitysToSave = entitysToSave.filter(x => SaveDataController.isNewEntity(x, this.metadataTable));
    let existsEntitysToSave = entitysToSave.filter(x => !SaveDataController.isNewEntity(x, this.metadataTable));
    return forkJoin(
      (() => {
        if (newEntitysToSave.length) {
          return from(newEntitysToSave)
            .pipe(
              mergeMap((newEntityToSave) => {
                return saveDataStrategy.createEntity(newEntityToSave);
              }),
              reduce((acc, val: any) => {
                acc.push(val);
                return acc;
              }, [])
            );
        } else {
          return of([]);
        }
      })(),
      (() => {
        if (existsEntitysToSave.length) {
          return from(existsEntitysToSave)
            .pipe(
              mergeMap((existsEntityToSave) => {
                return this.update(existsEntityToSave, saveDataStrategy);
              }),
              reduce((acc, val: any) => {
                acc.push(val);
                return acc;
              }, [])
            );
        } else {
          return of([]);
        }
      })()
    ).pipe(
      map((source: any[]) => {
        return [...source[0], ...source[1]];
      })
    );
  }

  /***/
  static isNewEntity(entity: any, metadataTable: MetadataTable) {
    if (metadataTable.primaryKey) {
      return false;
    } else if (entity[metadataTable.primaryKey]) {
      return false;
    } else {
      return true;
    }
  }

  /***/
  static getPrimaryFieldName(metadataTable: MetadataTable): string {
    return metadataTable.primaryKey;
  }

  /***/
  update(object: T, saveDataStrategy: ISaveDataStrategy<T>): Observable<T> {
    // Выполняем акшон обновления
    return saveDataStrategy.updateEntity(object);
  }
}
