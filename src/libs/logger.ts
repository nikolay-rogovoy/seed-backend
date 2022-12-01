import {createLogger, LoggerOptions, transports, format} from 'winston'
import 'winston-daily-rotate-file';

/***/
function getLabelModule(filename: string) {
    return filename.split('/').slice(-1).join('/');
}

/***/
export function getLogger(module: NodeModule) {
    return getLoggerInstance(module);
}

/***/
export function getTestLogger(module: NodeModule) {
    return getLoggerInstance(module, 'test');
}

/***/
function getLoggerInstance(module: NodeModule, loggerPref?: string) {
    if (!loggerPref) {
        loggerPref = '';
    }

    const transportFile = new transports.DailyRotateFile({
        level: 'debug',
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        zippedArchive: true,
        maxSize: '512m',
        maxFiles: '15d',
        format: format.combine(format.timestamp(), format.simple())
    });

    const cto: transports.ConsoleTransportOptions = {};
    cto.level = 'debug';
    cto.handleExceptions = true;
    cto.format = format.combine(format.timestamp(), format.colorize(), format.simple());
    const transportConsole = new transports.Console(cto);
    const lopts: LoggerOptions = {};
    lopts.transports = [transportFile, transportConsole];
    const logger = createLogger(lopts);

    logger.exitOnError = false;
    return logger;
}
