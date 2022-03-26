/*
 * @Author: Kanata You 
 * @Date: 2022-03-20 17:06:20 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-26 17:35:30
 */

import type { Express } from 'express';
import { execSync } from 'child_process';
let fs: typeof import('fs');
import('fs').then(_fs => fs = _fs);
let path: typeof import('path');
import('path').then(_path => path = _path);
let multiparty: typeof import('multiparty');
import('multiparty').then(_multiparty => multiparty = _multiparty);

import { TEMP_DIR } from '.';


const useRouters = (app: Express) => {
  app.get('/test', (req, res) => {
    res.send('ok');
  });

  app.post('/audio-upload', (req, res) => {
    const receiveTime = Date.now();
    const form = new multiparty.Form({ uploadDir: TEMP_DIR });

    form.parse(req, (err, { fileName, lang='en-EN' }, files) => {
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
      } else {
        res.statusCode = 200;

        const prevPath = path.resolve(
          files.excelFile[0].path
        );
        const nextPath = path.resolve(
          TEMP_DIR, fileName[0]
        );

        fs.renameSync(prevPath, nextPath);

        let parsed: [
          {
            transcript: string;
            confidence: number;
          }?,
          ...({
            transcript: string;
          })[]
        ] = [];
        let parseError: { message: string } | null = null;

        try {
          const output = (
            execSync(
              `chcp 65001 & ${
                'E:/Anaconda/envs/ad-lib/python.exe'
              } ../engine/src/parse.py ${nextPath} ${lang}`,
              {
                encoding: 'utf-8'
              }
            ).split(/[\r\n]+/)[1]
            ?? '[]'
          ).replace(/'/g, '"');

          parsed = JSON.parse(output);
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


export default useRouters;
