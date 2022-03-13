/*
 * @Author: Kanata You 
 * @Date: 2022-01-25 21:31:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-01-26 00:27:04
 */
'use strict';

// initialize
const init = require('./utils/init');
init('dev');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = import('chalk').then(mod => mod.default);
const env = require('espoir-cli/env').default;
const openBrowser = require('react-dev-utils/openBrowser');

const useWebpackConfig = require('./utils/use-webpack-config');
const EspoirStatsPrinterPlugin = require('./utils/espoir-stats-printer-plugin');


const { name: appName, proxy } = require('../package.json');
const paths = require('../configs/path.json');

// dev server configs
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const {
  choosePort,
  prepareProxy
} = require('react-dev-utils/WebpackDevServerUtils');

const setup = async () => {
  // check packageJSON.browsers.development, write in a default one if it's not defined.
  await checkBrowsers(paths.rootDir);

  const port = await choosePort(HOST, DEFAULT_PORT);

  if (port === null) {
    const err = new Error('Failed to find an available port.');

    await chalk.then(_chalk => {
      console.log(_chalk.red(err.message));
    });

    throw err;
  }
  
  // Load proxy config
  const proxyConfig = prepareProxy(
    proxy,
    env.resolvePathInPackage(appName, paths.rootDir),
    env.resolvePathInPackage(appName, paths.rootDir, paths.referencePath)
  );

  const config = useWebpackConfig('development');

  const compiler = webpack(config);

  // remove default DefaultStatsPrinterPlugin
  compiler.hooks.compilation.taps = compiler.hooks.compilation.taps.filter(plg => {
    return plg.name !== 'DefaultStatsPrinterPlugin';
  });

  new EspoirStatsPrinterPlugin().apply(compiler);

  const devServer = new WebpackDevServer({
    host: HOST,
    port,
    proxy: proxyConfig,
    static: [{
      directory: env.resolvePathInPackage(appName, paths.rootDir, paths.publicPath),
      publicPath: paths.referencePath,
      watch: true
    }]
  }, compiler);

  const url = `http://localhost:${port}/`;

  return {
    port,
    url,
    devServer
  };
};

/** @param {{devServer: import('webpack-dev-server')}} options */
const watch = ({
  url,
  devServer
}) => new Promise(async resolve => {
  await chalk.then(_chalk => {
    console.log(`Dev server will be activate on ${
      _chalk.cyan.bold(url)
    }.`)
  });

  // launch
  await devServer.start();

  openBrowser(url);
    
  ['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      devServer.close();
      resolve(0);
    });
  });
    
  if (process.env.CI !== 'true') {
    // Gracefully exit when stdin ends
    process.stdin.on('end', () => {
      devServer.close();
      resolve(0);
    });
  }
});

const webpackServeDev = async () => {
  const options = await setup();

  return await watch(options);
};


if (require.main === module) {
  webpackServeDev().then(process.exit);
}


module.exports = webpackServeDev;
