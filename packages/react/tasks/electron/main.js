/*
 * @Author: Kanata You 
 * @Date: 2022-04-18 23:52:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-20 16:51:50
 */

// 这个脚本用于在完成 build 的 React App 上完成 Electron 打包.

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
  isProd ? path.join(__dirname, '..', 'package.json') : '../../package.json'
);


const { output, template } = isProd ? {} : require('../../configs/path.json');
const H5_ENTRY = isProd ? path.join(
  __dirname,
  '..',
  'index.html'
) : path.resolve(
  output,
  template.replace(/^.*[/\\]/, '')
);
const DEFAULT_WINDOW_WIDTH = 375;
const DEFAULT_WINDOW_HEIGHT = 812;

let close = () => {};

const useJSB = () => {
  // JSB：关闭窗口

  ipcMain.handle('electron:close', () => {
    close();
  });

  // JSB：夜间模式切换

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
    label: 'Window',
    submenu: [{
      role: 'quit',
      label: 'Close',
      accelerator: 'Ctrl+W',
      click: close
    }]
  }));

  menu.append(new MenuItem({
    label: 'Electron',
    submenu: [{
      role: 'help',
      accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
      click: () => console.log('Electron rocks!')
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
    accelerator: 'Ctrl+Alt+D'
  }));

  Menu.setApplicationMenu(menu);
};

/**
 * 创建 BrowserWindow 实例并导入入口文件.
 * @returns {Promise<number>}
 */
const createWindow = () => {
  const win = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    autoHideMenuBar: false,
    backgroundColor: '#444',
    center: true,
    // transparent: true,
    darkTheme: nativeTheme.shouldUseDarkColors,
    frame: false,
    fullscreen: false,
    fullscreenable: true,
    hasShadow: true,
    resizable: false,
    title: PACKAGE_NAME,
    webPreferences: {
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  return new Promise((resolve, reject) => {
    win.loadFile(H5_ENTRY);

    close = () => win.close();

    useJSB();

    useMenu();

    // win.webContents.openDevTools();

    // macOS apps generally continue running even without any windows open,
    // and activating the app when no windows are available should open a new one.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        win.loadFile(H5_ENTRY);
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
 * @returns {Promise<number>}
 */
const main = async () => {
  // In Electron, browser windows can only be created
  // after the app module's ready event is fired
  await app.whenReady();

  const returnCode = await createWindow();

  return returnCode;
};


if (require.main === module) {
  main().then(process.exit);
}
