/*
 * @Author: Kanata You 
 * @Date: 2022-03-20 16:12:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-26 15:49:36
 */

import useRouters from './routers';

const _express = import('express');
const _bodyParser = import('body-parser');
const _fs = import('fs');


const PORT = 4000;

export const TEMP_DIR = 'temp';

const clearOutput = (fs: typeof import('fs')) => {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, {
      recursive: true,
      force: true
    });
  }

  fs.mkdirSync(TEMP_DIR);
};

const main = async () => Promise.all(
  [_express, _bodyParser, _fs]
).then(([express, bodyParser, fs]) => (
  new Promise<number>(
    resolve => {
      clearOutput(fs);

      const app = express();

      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      useRouters(app);

      app.listen(PORT, () => {
        console.log(`Express app listening on port ${PORT}.`);
      });

      return process.on('exit', () => {
        clearOutput(fs);
        console.log('Process terminating, Express server closed.');
        resolve(0);
      });
    }
  )
));

if (require.main === module) {
  main();
}

export default main;

