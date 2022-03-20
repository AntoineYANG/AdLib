"use strict";
/*
 * @Author: Kanata You
 * @Date: 2022-03-20 16:12:15
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 18:28:44
 */
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("./routers");
const _express = Promise.resolve().then(() => require('express'));
const _bodyParser = Promise.resolve().then(() => require('body-parser'));
const PORT = 4000;
const main = async () => Promise.all([_express, _bodyParser]).then(([express, bodyParser]) => (new Promise(resolve => {
    const app = express();
    app.use(bodyParser.json());
    (0, routers_1.default)(app);
    app.listen(PORT, () => {
        console.log(`Express app listening on port ${PORT}.`);
    });
    return process.on('exit', () => {
        console.log('Process terminating, Express server closed.');
        resolve(0);
    });
})));
if (require.main === module) {
    main();
}
exports.default = main;
