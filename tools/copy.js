const fs = require('fs');
const mkdirp = require('mkdirp');
var ncp = require('ncp').ncp;

(function main() {
    // Копируем необходимые файлы
    fs.createReadStream('src/config/config.json').pipe(fs.createWriteStream('dist/config/config.json'));
    fs.createReadStream('src/hello_service.wsdl').pipe(fs.createWriteStream('dist/hello_service.wsdl'));

    ncp('src/data', 'dist/data', function (error) {
        if (error) {
            return console.error(error);
        }
        console.log('data скопирован!');
    });

    ncp('src/reports', 'dist/reports', function (error) {
        if (error) {
            return console.error(error);
        }
        console.log('data скопирован!');
    });

    let tempFile = fs.createReadStream('package.json').pipe(fs.createWriteStream('dist/package.json'));
    tempFile.on('close', () => {
        // Удалить лишнее из package.json
        const packageJson = JSON.parse(fs.readFileSync('./dist/package.json').toString());
        delete packageJson.devDependencies;
        // Скрипты не удаляем - нужен запус миграций через npm
        // delete packageJson.scripts;
        fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
    });

    // let ormconfigJsonFile = fs.createReadStream('ormconfig.json').pipe(fs.createWriteStream('dist/ormconfig.json'));
    // ormconfigJsonFile.on('close', () => {
    //     const ormconfigJson = JSON.parse(fs.readFileSync('./dist/ormconfig.json').toString());
    //     ormconfigJson.host = 'db';
    //     ormconfigJson.migrations = [
    //         "migration/**/*.js"
    //     ];
    //     fs.writeFileSync('./dist/ormconfig.json', JSON.stringify(ormconfigJson, null, 2));
    // });
    // Создаем логи
    mkdirp('dist/logs', function (err) {
        if (err) {
            console.log(err);
        }
    });
})();
