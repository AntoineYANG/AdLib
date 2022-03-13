/*
 * @Author: Kanata You 
 * @Date: 2022-03-13 18:57:39 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-13 23:58:53
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const semver = require('semver');

const pkgJSON = require('../../package.json');


/**
 * 检查并安装 python 模块.
 * 
 * @returns {boolean}
 */
const checkLibs = () => {
  const { name: vEnv } = pkgJSON.python;
  
  try {
    // 重置 anaconda 环境
    execSync(
      'conda deactivate', {
        encoding: 'utf-8'
      }
    );
  
    const vEnvList = (
      JSON.parse(
        execSync(
          'conda env list --json', {
            encoding: 'utf-8'
          }
        )
      ).envs || []
    ).slice(
      // 去掉第一个 base
      1
    ).map(
      // 前面获得的是绝对路径，取最后一级即为 env 名称
      path => path.split(/[\\/]/g).reverse()[0]
    );
  
    if (!vEnvList.includes(vEnv)) {
      // 目前没有目标坏境
      // 创建环境
      execSync(
        `echo y | conda create -n ${vEnv}`, {
          encoding: 'utf-8'
        }
      );
  
      console.log(
        `\x1B[32mCreated Anaconda venv\x1B[0m \x1B[36m${vEnv}\x1B[0m`
      );
    }
  
    const requiredDeps = Object.entries(
      pkgJSON.python.dependencies
    ).map(([name, range]) => ({
      name,
      range
    }));
  
    const localDeps = (
      JSON.parse(
        execSync(
          `conda list -n ${vEnv} --json`, {
            encoding: 'utf-8'
          }
        )
      ) || []
    ).map(({ name, version }) => ({
      name,
      version
    }));
  
    requiredDeps.forEach(dep => {
      const which = localDeps.find(
        d => d.name === dep.name && semver.satisfies(d.version, dep.range)
      );
  
      if (which) {
        console.info(
          `[python] \x1B[32m\u2713\x1B[0m  \x1B[36m${
            dep.name
          }\x1B[0m ${which.version}  \x1B[34m(${dep.range})\x1B[0m`
        );
      } else {
        // 安装

        const localWheel = pkgJSON.python.dependenciesMeta[dep.name];

        if (localWheel) {
          const wheelPath = localWheel.path ? path.resolve(
            __dirname, '..', '..', 'libs', localWheel.path
          ) : null;

          if (fs.existsSync(wheelPath)) {
            try {
              execSync(
                `pip install ${wheelPath}`, {
                  encoding: 'utf-8'
                }
              );
            } catch (error) {
              if (localWheel.pip) {
                execSync(
                  `pip install ${dep.name}`, {
                    encoding: 'utf-8'
                  }
                );
              } else {
                throw error;
              }
            }
  
            console.info(
              `[python] \x1B[32m\u2713\x1B[0m  \x1B[36m${
                dep.name
              }\x1B[0m installed by wheel`
            );
          } else if (localWheel.pip) {
            execSync(
              `pip install ${dep.name}`, {
                encoding: 'utf-8'
              }
            );
          }

          return;
        }

        const available = (
          JSON.parse(
            execSync(
              `conda search ${dep.name} --json`, {
                encoding: 'utf-8'
              }
            )
          )[dep.name] || []
        ).reduceRight((list, { name, version }) => {
          if (!semver.satisfies(semver.valid(version), dep.range)) {
            // 排除不适用版本
            return list;
          }
  
          if (list.find(e => e.version === version)) {
            // 去重
            return list;
          }
  
          return [...list, {
            name,
            version
          }];
        }, []);
  
        const { version } = available[0] || {};
  
        if (!version) {
          throw new Error(
            `No package satisfies '${dep.name}@${dep.range}'.`
          );
        }
  
        const installCmd = `conda install -n ${vEnv} ${dep.name}=${version}`;
  
        console.info(installCmd);
  
        execSync(
          installCmd, {
            encoding: 'utf-8'
          }
        );
  
        console.info(
          `[python] \x1B[32m\u2713\x1B[0m  \x1B[36m${
            dep.name
          }\x1B[0m ${version} installed`
        );
      }
    });
  } catch (error) {
    console.error(
      '\x1B[37m\x1B[41mError\x1B[0m:\x1B[0m',
      `\x1B[31m${error.message}\x1B[0m`
    );

    return false;
  }

  // Windows 系统需要保证模块能够找到 flac 命令工具
  if (process.platform === 'win32') {
    const envDir = JSON.parse(
      execSync(
        'conda env list --json', {
          encoding: 'utf-8'
        }
      ).replace(/[\r\n]$/, '')
    ).envs.find(e => e.endsWith(vEnv));

    const target = path.join(
      envDir,
      'Library',
      'bin',
      'flac.exe'
    );

    const p0 = path.resolve(__dirname, '..', '..', '..', '..', '.espoir', '.bin', 'flac');
    const p1 = path.resolve(__dirname, '..', '..', 'flac');

    if (!fs.existsSync(p0)) {
      fs.symlinkSync(target, p0);
    }

    if (!fs.existsSync(p1)) {
      fs.symlinkSync(target, p1);
    }
  }

  return true;
};


module.exports = checkLibs;
