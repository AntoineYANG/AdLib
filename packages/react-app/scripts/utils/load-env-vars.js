/*
 * @Author: Kanata You 
 * @Date: 2022-01-24 17:59:40 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-24 21:15:59
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

const loadEnvVars = (env = 'prod') => {
  const common = {
    APP_NAME: `"${appName}"`,
    VERSION: `"${version}"`,
    IS_DEV: (env === 'dev').toString(),
    IS_PROD: (env === 'prod').toString(),
  };

  if (fs.existsSync(envVarsFile)) {
    return {
      ...common,
      ...Object.fromEntries(
        Object.entries(require(envVarsFile)).map(([k, v]) => {
          return [k, JSON.stringify(v)];
        })
      )
    };
  }

  return common;
};


module.exports = loadEnvVars;
