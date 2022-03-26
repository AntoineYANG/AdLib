"use strict";
/*
 * @Author: Kanata You
 * @Date: 2022-03-20 17:06:20
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-26 18:18:22
 */
Object.defineProperty(exports, "__esModule", { value: true });
let fs;
Promise.resolve().then(() => require('fs')).then(_fs => fs = _fs);
let path;
Promise.resolve().then(() => require('path')).then(_path => path = _path);
const {execSync} = require('child_process');
let multiparty;
Promise.resolve().then(() => require('multiparty')).then(_multiparty => multiparty = _multiparty);
const _1 = require(".");
const useRouters = (app) => {
    app.get('/test', (req, res) => {
        res.send('ok');
    });
    app.post('/audio-upload', (req, res) => {
        const receiveTime = Date.now();
        const form = new multiparty.Form({ uploadDir: _1.TEMP_DIR });
        form.parse(req, (err, { fileName, lang = 'ja' }, files) => {
            const settleTime = Date.now();
            const timeInfo = {
                receiveTime,
                settleTime,
                serverCost: settleTime - receiveTime
            };
            if (err) {
                res.statusCode = 500;
                res.json({
                    message: 'failed',
                    clause: err,
                    timeInfo
                });
            }
            else {
                res.statusCode = 200;
                const prevPath = path.resolve(files.excelFile[0].path);
                const nextPath = path.resolve(_1.TEMP_DIR, fileName[0]);
                fs.renameSync(prevPath, nextPath);

                let parsed = [];
                let parseError = null;

                try {
                    const output = execSync(
                        `${
                            'E:/Anaconda/envs/ad-lib/python.exe'
                        } ../engine/src/parse.py ${nextPath} ${lang}`
                    );

                    parsed = JSON.parse(
                        new TextDecoder('gbk').decode(output).replace(/'/g, '"')
                    );
                } catch (error) {
                    parseError = {
                        message: error.message
                    };
                }

                res.json({
                    message: 'ok',
                    fileName: nextPath,
                    timeInfo,
                    parsed,
                    parseError
                });
            }
        });
    });
};
exports.default = useRouters;
