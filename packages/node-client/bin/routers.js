"use strict";
/*
 * @Author: Kanata You
 * @Date: 2022-03-20 17:06:20
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 21:16:02
 */
Object.defineProperty(exports, "__esModule", { value: true });
let fs;
Promise.resolve().then(() => require('fs')).then(_fs => fs = _fs);
const useRouters = (app) => {
    app.get('/test', (req, res) => {
        res.send('ok');
    });
    app.post('/audio-upload', (req, res) => {
        req.setEncoding('binary');
        let chunks = '';
        req.on('data', (chunk) => {
            if (chunk) {
                chunks += chunk;
            }
        });
        chunks = chunks.replace(/(^[.\r\n]*Content-Type: .*(\r\n){2})|([\r\n]*WebKitFormBoundary.*[\r\n]*$)/g, '');
        req.on('end', () => {
            fs.writeFileSync('video.wav', chunks);
        });
    });
};
exports.default = useRouters;
