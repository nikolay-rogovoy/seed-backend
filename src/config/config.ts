import nconf from 'nconf';
let config = (<any>nconf).argv().env().file({ file: `config/config.json` });
export default config;
