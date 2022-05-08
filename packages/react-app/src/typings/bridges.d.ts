/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 23:05:23 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-09 00:13:45
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

declare const cache: {
  size: () => Promise<number>;
  clear: () => Promise<boolean>;
};

interface AudioAnalyseData {
  id: string;
  data: ArrayBuffer;
}

interface AudioAnalyseResp {
  message: 'ok' | 'failed';
  fileName: string;
  timeInfo: {
    receiveTime: number;
    settleTime: number;
    serverCost: number;
  };
  parsed: [
    {
      transcript: string;
      confidence: number;
    }?,
    ...({
      transcript: string;
    })[]
  ] | null;
  parseError: { message: string } | null;
}

declare const post: {
  audio: (data: AudioAnalyseData) => Promise<AudioAnalyseResp>;
};
