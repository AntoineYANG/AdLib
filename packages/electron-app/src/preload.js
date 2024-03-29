/*
 * @Author: Kanata You 
 * @Date: 2022-04-19 00:17:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-19 03:07:52
 */

const { contextBridge, ipcRenderer } = require('electron');


// events

/** @type {{ [name: string]: () => any }} */
const shortcuts = {};

ipcRenderer.on('shortcut', (_event, name) => {
  const handler = shortcuts[name];

  if (!handler) {
    throw new Error(`Shortcut ${name} is not implemented.`);
  }

  return handler();
});

// JSB

contextBridge.exposeInMainWorld('shortcuts', {
  set: (name, cb) => shortcuts[name] = cb,
});

contextBridge.exposeInMainWorld('edit', {
  redo: () => shortcuts['menu.edit.redo'](),
  undo: () => shortcuts['menu.edit.undo'](),
});

contextBridge.exposeInMainWorld('electron', {
  close: () => ipcRenderer.invoke('electron:close'),
  minimize: () => ipcRenderer.invoke('electron:minimize'),
  maximize: () => ipcRenderer.invoke('electron:maximize'),
  fullscreen: () => ipcRenderer.invoke('electron:fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('electron:isFullscreen'),
  setResizable: () => ipcRenderer.invoke('electron:setResizable'),
  reload: () => ipcRenderer.invoke('electron:reload'),
});

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
});

contextBridge.exposeInMainWorld('cache', {
  size: () => ipcRenderer.invoke('cache:size'),
  clear: () => ipcRenderer.invoke('cache:clear'),
});

contextBridge.exposeInMainWorld('post', {
  audio: data => ipcRenderer.invoke('post:audio', data),
  grammar: data => ipcRenderer.invoke('post:grammar', data),
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
