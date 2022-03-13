/*
 * @Author: Kanata You 
 * @Date: 2022-03-13 17:52:53 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-13 20:15:57
 */

const { execSync } = require('child_process');

const semver = require('semver');

const pkgJSON = require('../../package.json');


/**
 * 检查引擎支持项.
 *
 * @param {{ name: string; range: string; cmd: string; pattern: RegExp; }} config 支持项设置
 * @returns {() => null | Error}
 */
const useChecker = config => () => {
  let version = '';

  try {
    const { v } = (
      config.pattern.exec(
        execSync(
          config.cmd, {
            encoding: 'utf-8'
          }
        ).replace(/[\r\n]+/, '')
      ).groups || {}
    );

    version = semver.valid(v);
  } catch (error) {
    // 获取 {name} 版本失败
    return new Error(`Cannot find '${config.name}'`, {
      cause: error
    });
  }
  
  if (!version || !semver.satisfies(version, config.range)) {
    // {name} 版本不符
    return new Error(
      `'${config.name}' version '${version}' does not satisfy required range '${
        config.range
      }'.`
    );
  }

  console.info(
    `\x1B[32m\u2713\x1B[0m  \x1B[36m${
      config.name
    }\x1B[0m ${version}  \x1B[34m(${config.range})\x1B[0m`
  );

  return null;
};
 
/**
 * 检查当前环境是否支持引擎运行.
 *
 * @returns {boolean}
 */
const checkEnv = () => {
  const engineCheckers = [{
    name: 'python',
    range: pkgJSON.pythonEngines.python,
    cmd: 'python --version',
    pattern: /^Python (?<v>.*)$/
  }, {
    name: 'anaconda',
    range: pkgJSON.pythonEngines.anaconda,
    cmd: 'conda --version',
    pattern: /^conda (?<v>.*)$/
  }].map(useChecker);

  for (const checker of engineCheckers) {
    const err = checker();
    
    if (err) {
      console.error(
        '\x1B[37m\x1B[41mError\x1B[0m:\x1B[0m',
        `\x1B[31m${err.message}\x1B[0m`
      );

      return false;
    }
  }

  return true;
};


module.exports = checkEnv;
