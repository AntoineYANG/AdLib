/*
 * @Author: Kanata You 
 * @Date: 2022-01-24 17:59:40 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-29 17:30:56
 */
'use strict';

const fs = require('fs');
const env = require('espoir-cli/env').default;

const { name: appName, version } = require('../../package.json');

const envVarsFile = env.resolvePathInPackage(
  appName,
  'configs',
  'env.json'
);

const loadEnvVars = () => {
  if (fs.existsSync(envVarsFile)) {
    return {
      APP_NAME: `"${appName}"`,
      VERSION: `"${version}"`,
      ...Object.fromEntries(
        Object.entries(require(envVarsFile)).map(([k, v]) => {
          return [k, JSON.stringify(v)];
        })
      )
    };
  }

  return {
    APP_NAME: `"${appName}"`,
    VERSION: `"${version}"`,
  };
};


module.exports = loadEnvVars;
