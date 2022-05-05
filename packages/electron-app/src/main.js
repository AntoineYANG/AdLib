/*
 * @Author: Kanata You 
 * @Date: 2022-04-18 23:52:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-29 18:26:09
 */
'use strict';

const path = require('path');
const fs = require('fs');
const isProd = fs.existsSync('./resources/app/package.json');
const {
  app,
  BrowserWindow,
  nativeTheme,
  ipcMain,
  Menu,
  MenuItem,
} = require('electron');
const { name: PACKAGE_NAME } = require(
  isProd ? path.join(__dirname, '..', 'package.json') : '../../react-app/package.json'
);


const DEFAULT_WINDOW_WIDTH = 1140;
const DEFAULT_WINDOW_HEIGHT = 740;

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
