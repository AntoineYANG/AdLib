/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 22:26:12 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-19 16:10:16
 */
'use strict';

const startWebpack = require('react-app/dev');
const openWindow = require('../src/main');


if (module === require.main) {
  const reactEnv = process.argv.slice(2).includes('--react-prod') ? 'prod' : 'dev';

  if (reactEnv === 'prod') {
    openWindow();
  } else {
    startWebpack(openWindow).then(process.exit);
  }
}
