/*
 * @Author: Kanata You 
 * @Date: 2022-05-07 14:41:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-07 16:57:58
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
    const target = path.join(
      libsDir,
      'Library',
      'bin',
      'flac.exe'
    );

    const p0 = path.resolve(__dirname, '..', '..', '..', '.espoir', '.bin', 'flac');
    const p1 = path.resolve(__dirname, '..', 'flac');

    if (!fs.existsSync(p0)) {
      fs.symlinkSync(target, p0);
    }

    if (!fs.existsSync(p1)) {
      fs.symlinkSync(target, p1);
    }
  }

  console.log('done');
};


if (require.main === module) {
  install().then(process.exit);
}
