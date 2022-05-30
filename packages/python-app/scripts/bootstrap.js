/*
 * @Author: Kanata You 
 * @Date: 2022-05-07 14:41:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-30 15:48:56
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const {
  pythonVersion,
  dependencies,
} = require('../configs/python-package.json');

const libsDir = path.join(__dirname, '..', 'libs');


const install = async () => {
  try {
    execSync('conda -V', {
      stdio: 'pipe'
    });
  } catch {
    throw new Error('Anaconda is undefined.');
  }

  if (!fs.existsSync(libsDir)) {
    execSync(`conda create -p ${libsDir}`, {
      stdio: 'pipe'
    });
  }

  execSync(
    `conda activate ${libsDir} && conda install python=${pythonVersion} -y`, {
      stdio: 'pipe'
    }
  );
  
  for (const dep in dependencies) {
    const v = dependencies[dep];
    execSync(`conda activate ${libsDir} && conda install ${dep}=${v} -y`, {
      stdio: 'pipe'
    });
  }

  // Windows 系统需要保证模块能够找到 flac 命令工具
  if (process.platform === 'win32') {
    // 解决
    const srInitModule = path.resolve(
      libsDir, 'Lib', 'site-packages', 'speech_recognition', '__init__.py'
    );

    if (fs.existsSync(srInitModule)) {
      fs.writeFileSync(
        srInitModule,
        fs.readFileSync(srInitModule, {
          encoding: 'utf-8'
        }).replace(
          'flac_converter = shutil_which("flac")  # check for installed version first',
          `flac_converter = "${path.join(libsDir, 'Library', 'bin', 'flac.exe').replace(/\\/g, '\\\\')}"  # HACK`
        ),
        {
          encoding: 'utf8'
        }
      );
    }

    // 解决 _win32api 找不到文件 bug
    const subprocessModule = path.resolve(libsDir, 'Lib', 'subprocess.py');

    if (fs.existsSync(subprocessModule)) {
      fs.writeFileSync(
        subprocessModule,
        fs.readFileSync(subprocessModule, {
          encoding: 'utf-8'
        }).replace(
          'shell=False, cwd=None, env=None, universal_newlines=None',
          'shell=True, cwd=None, env=None, universal_newlines=None'
        ),
        {
          encoding: 'utf8'
        }
      );
    }
  }

  console.log('done');
};


if (require.main === module) {
  install().then(process.exit);
}
