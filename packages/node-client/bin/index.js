"use strict";
/*
 * @Author: Kanata You
 * @Date: 2022-03-20 16:12:15
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-26 16:16:51
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMP_DIR = void 0;
const routers_1 = require("./routers");
const _express = Promise.resolve().then(() => require('express'));
const _bodyParser = Promise.resolve().then(() => require('body-parser'));
const _fs = Promise.resolve().then(() => require('fs'));
const PORT = 4000;
exports.TEMP_DIR = 'temp';
const clearOutput = (fs) => {
    if (fs.existsSync(exports.TEMP_DIR)) {
        fs.rmSync(exports.TEMP_DIR, {
            recursive: true,
            force: true
        });
    }
    fs.mkdirSync(exports.TEMP_DIR);
};
const main = async () => Promise.all([_express, _bodyParser, _fs]).then(([express, bodyParser, fs]) => (new Promise(resolve => {
    clearOutput(fs);
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    (0, routers_1.default)(app);
    app.listen(PORT, () => {
        console.log(`Express app listening on port ${PORT}.`);
    });
    return process.on('exit', () => {
        // clearOutput(fs);
        console.log('Process terminating, Express server closed.');
        resolve(0);
    });
})));
if (require.main === module) {
    main();
}
exports.default = main;
