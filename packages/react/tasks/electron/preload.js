/*
 * @Author: Kanata You 
 * @Date: 2022-04-19 00:17:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-20 16:51:04
 */

const { contextBridge, ipcRenderer } = require('electron');


// JSB

contextBridge.exposeInMainWorld('electron', {
  close: () => ipcRenderer.invoke('electron:close'),
});

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
});

/**
 * A preload script runs before the renderer process is loaded,
 * and has access to both renderer globals
 * (e.g. window and document) and a Node.js environment.
 * @see https://www.electronjs.org/docs/latest/tutorial/quick-start#access-nodejs-from-the-renderer-with-a-preload-script
 */

window.addEventListener('DOMContentLoaded', () => {
  window.console.info('[DOMContentLoaded] electron-preload');
  // do something
});
