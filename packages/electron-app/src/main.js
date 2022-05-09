/*
 * @Author: Kanata You 
 * @Date: 2022-04-18 23:52:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-09 21:22:10
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const isProd = fs.existsSync('./resources/app/package.json');
const {
  app,
  BrowserWindow,
  nativeTheme,
  ipcMain,
  Menu,
  MenuItem,
} = require('electron');
const root = isProd
  ? path.join(__dirname, '..') // FIXME:
  : path.join(__dirname, '..', '..', '..');
const { name: PACKAGE_NAME } = require(
  isProd ? path.join(__dirname, '..', 'package.json') : '../../react-app/package.json'
);

const pythonDir = isProd
  ? '' // FIXME:
  : path.join(root, 'packages', 'python-app');

const {
  exports: py,
} = require('../../python-app/package.json');

const pythonInterpreter = isProd
  ? '' // FIXME:
  : path.join(pythonDir, 'libs', 'python');

let pythonProcessId = 0;

const python = Object.fromEntries(
  Object.entries(py).map(([name, fn]) => [
    name,
    (() => {
      const file = isProd
        ? '' // FIXME:
        : path.join(pythonDir, fn);
      
      return (...args) => {
        const pid = pythonProcessId;

        pythonProcessId += 1;

        const cmd = `${pythonInterpreter} ${file} ${args.join(' ')}`;
  
        console.log(
          `[python:${pid}]`,
          new Date().toLocaleTimeString(),
          { cmd }
        );

        return [{"transcript": "hey hey hey hey hey hey hey hey hey hey", "confidence": 0.98762906}, {"transcript": "hey hey hey hey hey hey hey hey hey hey hey"}];

        const output = execSync(
          `chcp 65001 & ${cmd}`, {
            encoding: 'utf-8',
            cwd: pythonDir,
          }
        ).replace(/^Active code page: 65001\r\n/, '');

        console.log(
          `[python:${pid}]`,
          new Date().toLocaleTimeString(),
          { cmd, output }
        );

        return JSON.parse(output);
      };
    })()
  ])
);

const configs = {
  cache: 'cache',
};

// const DEFAULT_WINDOW_WIDTH = 1140;
// const DEFAULT_WINDOW_HEIGHT = 740;

let send = (channelName, data) => {};
let close = () => {};
let minimize = () => {};
let maximize = () => {};
let fullscreen = () => {};
let isFullscreen = () => {};
let reload = () => {};
let setResizable = resizable => {};

const useJSB = () => {
  ipcMain.handle('electron:close', () => {
    close();
  });
  ipcMain.handle('electron:minimize', () => {
    minimize();
  });
  ipcMain.handle('electron:maximize', () => {
    maximize();
  });
  ipcMain.handle('electron:fullscreen', () => {
    fullscreen();
  });
  ipcMain.handle('electron:isFullscreen', () => {
    return isFullscreen();
  });
  ipcMain.handle('electron:setResizable', () => {
    setResizable();
  });
  ipcMain.handle('electron:reload', () => {
    reload();
  });

  nativeTheme.themeSource = 'system';

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light';
    } else {
      nativeTheme.themeSource = 'dark';
    }
    
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle('cache:size', () => {
    const dir = path.join(root, configs.cache);

    if (!fs.existsSync(dir)) {
      return 0;
    }

    let size = 0;

    fs.readdirSync(dir).forEach(n => {
      const fn = path.join(dir, n);

      size += fs.statSync(fn).size;
    });
    
    return size;
  });

  ipcMain.handle('cache:clear', () => {
    const dir = path.join(root, configs.cache);

    if (!fs.existsSync(dir)) {
      return 0;
    }

    fs.readdirSync(dir).forEach(n => {
      const fn = path.join(dir, n);

      fs.rmSync(fn);
    });
    
    return true;
  });

  let _id = 0;
  let cache = [];
  let cacheName = null;

  ipcMain.handle('post:audio', (_, data) => {
    const receiveTime = Date.now();
    const dir = path.join(root, configs.cache);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const fn = path.join(dir, `${data.id}.webm`);

    if (fn !== cacheName) {
      cache = [];
      cacheName = fn;
    }

    cache.push(Buffer.from(data.data));

    fs.appendFileSync(fn, Buffer.from(data.data));

    const fnTemp = path.join(dir, `tmp-${(_id++) % 1000}.webm`);

    cache.forEach(b => {
      fs.appendFileSync(fnTemp, b);
    });

    const lang = data.lang || 'en-EN';

    let res = null;
    let error = null;

    try {
      res = python.parse(fnTemp, lang);
      console.log({
        fnTemp,
        res,
      });
    } catch (err) {
      error = err;
    } finally {
      // fs.rmSync(fnTemp);

      // if (fs.existsSync(fnTemp.replace(/.webm$/, '.wav'))) {
      //   fs.rmSync(fnTemp.replace(/.webm$/, '.wav'));
      // }
    }

    const settleTime = Date.now();
    
    return {
      message: 'ok',
      fileName: fn,
      timeInfo: {
        receiveTime,
        settleTime,
        serverCost: settleTime - receiveTime,
      },
      parsed: res,
      parseError: error,
    };
  });
};

const useMenu = () => {
  const menu = new Menu();

  menu.append(new MenuItem({
    label: 'App',
    submenu: [ {
      label: 'Reload Window',
      accelerator: 'Ctrl+Alt+R',
      click: () => send('shortcut', 'menu.app.reload')
    }, {
      role: 'quit',
      label: 'Exit',
      accelerator: 'Alt+W',
      click: () => send('shortcut', 'control.close')
    }]
  }));

  menu.append(new MenuItem({
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'Ctrl+Z',
      click: () => send('shortcut', 'menu.edit.undo')
    }, {
      label: 'Redo',
      accelerator: 'Ctrl+Y',
      click: () => send('shortcut', 'menu.edit.redo')
    }]
  }));

  menu.append(new MenuItem({
    label: 'Dark Mode',
    click: () => {
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light';
      } else {
        nativeTheme.themeSource = 'dark';
      }
    },
    accelerator: 'Alt+D'
  }));

  Menu.setApplicationMenu(menu);
};

/**
 * @returns {Promise<number>}
 */
const createWindow = (url = undefined) => {
  const win = new BrowserWindow({
    minWidth: 400,
    minHeight: 240,
    width: 400,
    height: 240,
    autoHideMenuBar: false,
    center: true,
    transparent: true,
    darkTheme: nativeTheme.shouldUseDarkColors,
    frame: false,
    fullscreen: false,
    fullscreenable: true,
    hasShadow: true,
    resizable: false,
    title: PACKAGE_NAME,
    webPreferences: {
      devTools: !isProd,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  return new Promise((resolve, reject) => {
    if (url) {
      win.loadURL(url);
    } else {
      const { output, template } = isProd ? {} : require('../../react-app/configs/path.json');
      const H5_ENTRY = isProd ? path.join(
        __dirname,
        '..',
        'index.html'
      ) : path.join(
        __dirname,
        '..',
        '..',
        'react-app',
        output,
        template.replace(/^.*[/\\]/, '')
      );

      win.loadFile(H5_ENTRY);
    }

    send = (channelName, data) => win.webContents.send(channelName, data);

    close = () => win.close();
    minimize = () => win.minimize();
    maximize = () => win.isMaximized() ? win.unmaximize() : win.maximize();
    isFullscreen = () => win.isFullScreen();
    fullscreen = () => win.setFullScreen(!isFullscreen());
    setResizable = resizable => {
      if (resizable) {
        // win.setFullScreenable(true);
        // win.setResizable(true);
        // win.setSize(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);
        // win.setMinimumSize(800, 600);
        win.setFullScreen(true);
      } else {
        // win.setFullScreenable(false);
        // win.setResizable(false);
        // win.setMinimumSize(400, 240);
        win.setSize(400, 240);
        win.center();
      }
    };
    reload = () => win.reload();

    useJSB();

    useMenu();

    win.webContents.openDevTools();

    // macOS apps generally continue running even without any windows open,
    // and activating the app when no windows are available should open a new one.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        if (url) {
          win.loadURL(url);
        } else {
          const { output, template } = isProd ? {} : require('../../react-app/configs/path.json');
          const H5_ENTRY = isProd ? path.join(
            __dirname,
            '..',
            'index.html'
          ) : path.join(
            __dirname,
            '..',
            '..',
            'react-app',
            output,
            template.replace(/^.*[/\\]/, '')
          );

          win.loadFile(H5_ENTRY);
        }
      }
    });

    // end of lifecycle
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
        resolve(0);
      }
    });
  });
};

/**
 * @param {string | undefined} [url]
 * @returns {Promise<number>}
 */
const main = async (url) => {
  // In Electron, browser windows can only be created
  // after the app module's ready event is fired
  await app.whenReady();

  const returnCode = await createWindow(url);

  return returnCode;
};


if (require.main === module) {
  main().then(process.exit);
}


module.exports = main;
