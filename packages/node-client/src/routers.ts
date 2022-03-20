/*
 * @Author: Kanata You 
 * @Date: 2022-03-20 17:06:20 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 21:16:02
 */

import type { Express } from 'express';
let fs: typeof import('fs');
import('fs').then(_fs => fs = _fs);


const useRouters = (app: Express) => {
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
    chunks = chunks.replace(
      /(^[.\r\n]*Content-Type: .*(\r\n){2})|([\r\n]*WebKitFormBoundary.*[\r\n]*$)/g,
      ''
    );
    req.on('end', () => {
      fs.writeFileSync('video.wav', chunks);
    });
  });
};


export default useRouters;
