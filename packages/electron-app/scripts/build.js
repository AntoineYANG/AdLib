/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 14:45:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-30 20:26:35
 */
'use strict';

const path = require('path');
const fs = require('fs');
const packager = require('electron-packager');
const {
  author,
  productName,
  version,
  dependencies,
  devDependencies,
} = require('../package.json');


const readDirAll = dir => {
  return fs.readdirSync(dir).reduce((prev, cur) => {
    const n = path.join(dir, cur);

    if (fs.statSync(n).isDirectory()) {
      return [...prev, n, ...readDirAll(n)];
    }

    return [...prev, n];
  }, []);
};

/**
 * @returns {Promise<number>}
 * @see https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html
 */
const bundleElectronApp = async () => {
  const entryDir = path.join(__dirname, '..', '..', 'react-app', 'build');
  const entryFile = path.join(__dirname, '..', 'src', 'main.js');
  const preloadFile = path.join(__dirname, '..', 'src', 'preload.js');

  if (!fs.existsSync(entryDir)) {
    console.error(
      `Cannot find dir "${entryDir}", maybe you need to build React app first.`
    );

    return 1;
  }

  const targetDir = path.join(__dirname, '..', 'build');

  const packageData = {
    name: productName,
    author,
    version,
    main: './electron/main.js',
    dependencies,
    devDependencies
  };

  const tmpDir = path.join(entryDir, 'electron');

  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { force: true, recursive: true });
  }
  
  fs.mkdirSync(tmpDir);
  
  const tmpEntry = path.join(tmpDir, 'main.js');
  const tmpPreload = path.join(tmpDir, 'preload.js');
  const tmpPkgJSON = path.join(entryDir, 'package.json');

  fs.copyFileSync(entryFile, tmpEntry);
  fs.copyFileSync(preloadFile, tmpPreload);
  fs.writeFileSync(
    tmpPkgJSON,
    JSON.stringify(packageData, undefined, 2) + '\n',
    {
      encoding: 'utf-8'
    }
  );

  const appPaths = await packager({
    name: productName,
    appVersion: `${version}`,
    appBundleId: `bundle-${version}`,
    buildVersion: `${version}`,
    dir: entryDir,
    // electronZipDir: path.join(__dirname, '..', 'electron-cache'),
    executableName: productName,
    icon: path.join(__dirname, '..', '..', 'react-app', 'public', 'favicon.ico'),
    ignore: ['.espoir'],
    out: targetDir,
    overwrite: true,
    platform: ['win32'],
    tmpdir: path.join(__dirname, '..', 'output-tmp'),
    win32metadata: {
      CompanyName: author.split(/ +/)[0],
      FileDescription: productName,
      InternalName: productName,
      ProductName: productName,
    },
    appCategoryType: 'public.app-category.education',
    darwinDarkModeSupport: true,
  });

  const pythonTarget = path.resolve('..', '..', 'python-app');

  for (const dir of appPaths) {    
    const pythonDir = path.join(dir, 'python');

    fs.mkdirSync(pythonDir);

    for (const f of ['src', 'libs', 'ffmpeg']) {
      fs.mkdirSync(path.join(pythonDir, f));
      
      readDirAll(path.join(pythonTarget, f)).forEach(target => {
        const dest = path.join(pythonDir, path.relative(pythonTarget, target));

        if (fs.statSync(target).isDirectory()) {
          if (fs.existsSync(dest)) {
            return;
          }
          
          fs.mkdirSync(dest);
        } else {
          fs.copyFileSync(target, dest);
        }
      });
    }

    for (const n of ['package.json']) {
      const target = path.join(pythonTarget, n);
      const dest = path.join(pythonDir, n);

      fs.copyFileSync(target, dest);
    }
  }
  
  console.log(`Electron app bundles created:\n${appPaths.join('\n')}`);

  console.log('Remove temporary files');

  fs.rmSync(tmpPkgJSON);
  fs.rmSync(tmpDir, { force: true, recursive: true });

  return 0;
};


if (module === require.main) {
  bundleElectronApp().then(process.exit);
}
