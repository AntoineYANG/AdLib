/*
 * @Author: Kanata You 
 * @Date: 2022-03-20 16:12:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 18:28:44
 */

import useRouters from './routers';

const _express = import('express');
const _bodyParser = import('body-parser');


const PORT = 4000;

const main = async () => Promise.all([_express, _bodyParser]).then(([express, bodyParser]) => (
  new Promise<number>(
    resolve => {
      const app = express();

      app.use(bodyParser.json());

      useRouters(app);

      app.listen(PORT, () => {
        console.log(`Express app listening on port ${PORT}.`);
      });

      return process.on('exit', () => {
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

