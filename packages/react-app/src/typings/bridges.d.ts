/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 23:05:23 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-29 14:43:03
 */

declare const shortcuts: {
  set: (name: string, cb: () => any) => void;
};

declare const edit: {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
};

declare const electron: {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  fullscreen: () => Promise<void>;
  isFullscreen: () => Promise<boolean>;
  setResizable: (resizable: boolean) => Promise<void>;
  reload: () => Promise<void>;
};

declare const darkMode: {
  toggle: () => Promise<boolean>;
};
