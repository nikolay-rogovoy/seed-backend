var rimraf = require('rimraf');

(function main() {
    console.log('remove dist');
    rimraf.sync('dist');
    console.log('pre-build finished');
})();
