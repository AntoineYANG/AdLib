/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:39:37 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-10 01:02:57
 */

import React from 'react';
import { nanoid } from 'nanoid';

// import useAlert from '@utils/use-alert';
// import downloadBlobs from './download-blobs';


const ac = new AudioContext();


/**
 * 麦克风.
 */
export class Microphone {

  private _source: MediaStream | undefined;
  private input: MediaStreamAudioSourceNode | undefined;

  constructor() {
    this._source = undefined;
    this.input = undefined;
    this.init();
  }

  get source() {
    return this._source;
  }

  onload(this: Microphone, err: Error | null) {}

  /**
   * 初始化 MediaStream 和 MediaRecorder 实例.
   */
  private async init(): Promise<void> {
    try {
      /**
       * @see https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
       */
      this._source = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      /** 声音输入 */
      this.input = ac.createMediaStreamSource(this._source);

      this.onload(null);
    } catch (error) {
      console.error(error);
      this.onload(error);
    }
  }

  connect(destinationNode: AudioNode) {
    this.input?.connect(destinationNode);
  }

  /**
   * 关闭媒体流（不可逆）.
   */
  close(): void {
    this.source?.getTracks().forEach(track => {
      track.stop();
      this.source?.removeTrack(track);
    });
  }

}

const useMicrophone = () => {
  const [microphone, setMicrophone] = React.useState<Microphone | 'failed' | 'pending'>(
    'pending'
  );

  React.useEffect(() => {
    const mic = new Microphone();

    mic.onload = err => {
      setMicrophone(err ? 'failed' : mic);
    };
  }, [setMicrophone]);

  React.useEffect(() => {
    // 关闭麦克风
    return () => {
      if (typeof microphone !== 'string') {
        microphone.close();
      }
    };
  }, [microphone]);

  return microphone;
};

export interface AudioRealTimeData {
  /** 音量，最小 0，最大 1 */
  volume: number;
}

/** 人声频率范围 */
const FREQ_MAX = 1800;
const FREQ_MIN = 1000;

/**
 * 虚拟声卡.
 */
export class AudioInterface {
  
  private input: Microphone | undefined;
  private filter: {
    highPass: BiquadFilterNode;
    lowPass: BiquadFilterNode;
    connected: boolean;
  };
  private gainNode: GainNode;
  private analyseNode: AnalyserNode;
  private monitorVolumeNode: GainNode;
  private monitor: AudioDestinationNode;

  private recorder: MediaRecorder | undefined;
  private _isRecording: boolean;
  public get isRecording(): boolean {
    return this._isRecording;
  }
  /** 录制数据 */
  private bufferedData: Blob[];
  /** 已上传的长度 */
  private streamedLength: number;

  private listeners: ((this: AudioInterface) => void)[];

  private analyserListeners: ((data: AudioRealTimeData) => void)[];

  private parseListeners: ((resp: AudioAnalyseResp) => void)[];

  constructor() {
    this.input = undefined;
    this.filter = {
      highPass: ac.createBiquadFilter(),
      lowPass: ac.createBiquadFilter(),
      connected: false,
    };
    this.filter.highPass.type = 'highpass';
    this.filter.highPass.frequency.setValueAtTime(125, ac.currentTime);
    this.filter.highPass.Q.setValueAtTime(0, ac.currentTime);
    this.filter.lowPass.type = 'lowpass';
    this.filter.lowPass.frequency.setValueAtTime(8000, ac.currentTime);
    this.filter.lowPass.Q.setValueAtTime(0, ac.currentTime);
    this.filter.highPass.connect(this.filter.lowPass);
    this.gainNode = ac.createGain();
    this.gainNode.gain.value = 0.95;
    this.analyseNode = ac.createAnalyser();
    this.analyseNode.fftSize = 2048;
    this.monitorVolumeNode = ac.createGain();
    this.monitorVolumeNode.gain.value = 0;
    this.monitor = ac.destination;

    this.filter.highPass.connect(this.filter.lowPass);
    this.filter.lowPass.connect(this.gainNode);
    this.gainNode.connect(this.analyseNode);
    this.analyseNode.connect(this.monitorVolumeNode);
    this.monitorVolumeNode.connect(this.monitor);

    this.listeners = [];
    this.analyserListeners = [];
    this.parseListeners = [];

    let analyserCallbackHandler = 0;

    const analyserCallback = () => {
      try {
        const dataArray = new Uint8Array(this.analyseNode.fftSize);
        this.analyseNode.getByteTimeDomainData(dataArray);
        
        const volume = dataArray.reduce((max, d) => {
          const vol = (128 - d) / 128;

          return Math.max(vol, max);
        }, 0);

        this.analyserListeners.forEach(cb => {
          cb({
            volume,
          });
        });
  
        analyserCallbackHandler = requestAnimationFrame(analyserCallback);
      } catch (error) {
        cancelAnimationFrame(analyserCallbackHandler);
        return;
      }
    };

    analyserCallbackHandler = requestAnimationFrame(analyserCallback);

    this.recorder = undefined;
    this._isRecording = false;
    this.bufferedData = []
    this.streamedLength = 0;
  }

  useInput(microphone: Microphone): void {
    if (microphone === this.input) {
      return;
    }

    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }

    this.input = microphone;
    this.input.connect(this.filter.highPass);

    if (microphone.source) {
      this.recorder = ((): MediaRecorder => {
        // 兼容媒体类型
        for (const option of ['audio/webm', 'audio/mp3']) {
          try {
            const mr = new MediaRecorder(microphone.source, {
              mimeType: option
            });
  
            return mr;
          } catch {
            continue;
          }
        }
  
        throw new Error('无法正确实例化 MediaRecorder 对象');
      })();
  
      this.bufferedData = [];
      this.streamedLength = 0;

      this.recorder.ondataavailable = ev => {
        if ((ev.data?.size ?? 0) > 0 && this._isRecording) {
          this.bufferedData.push(ev.data);

          this.streamChunk();
        }
      };
    }

    this.fireUpdate();
  }

  get hasInput() {
    return Boolean(this.input);
  }

  get gain() {
    return this.gainNode.gain.value;
  }

  set gain(gain: number) {
    this.gainNode.gain.setValueAtTime(gain, ac.currentTime);
    this.fireUpdate();
  }

  get monitorVolume() {
    return this.monitorVolumeNode.gain.value;
  }

  set monitorVolume(val: number) {
    this.monitorVolumeNode.gain.setValueAtTime(val, ac.currentTime);

    this.fireUpdate();
  }

  subscribe(cb: (this: AudioInterface) => void): void {
    this.listeners.push(cb);
  }

  unsubscribe(cb: (this: AudioInterface) => void): void {
    const which = this.listeners.findIndex(e => e === cb);

    if (which !== -1) {
      this.listeners.splice(which, 1);
    }
  }

  fireUpdate(): void {
    this.listeners.forEach(cb => cb.call(this));
  }

  connectToAnalyser(cb: (data: AudioRealTimeData) => void): void {
    this.analyserListeners.push(cb);
  }

  disconnectFromAnalyser(cb: (data: AudioRealTimeData) => void): void {
    const which = this.analyserListeners.findIndex(e => e === cb);

    if (which !== -1) {
      this.analyserListeners.splice(which, 1);
    }
  }

  connectAudioParser(cb: (data: AudioAnalyseResp) => void): void {
    this.parseListeners.push(cb);
  }

  disconnectFromAudioParser(cb: (data: AudioAnalyseResp) => void): void {
    const which = this.parseListeners.findIndex(e => e === cb);

    if (which !== -1) {
      this.parseListeners.splice(which, 1);
    }
  }

  get filterOn() {
    return this.filter.connected;
  }

  set filterOn(on: boolean) {
    this.filter.connected = on;

    this.filter.highPass.frequency.setValueAtTime(on ? FREQ_MIN : 125, ac.currentTime);
    this.filter.lowPass.frequency.setValueAtTime(on ? FREQ_MAX : 8000, ac.currentTime);

    this.fireUpdate();
  }

  private static readonly STREAM_SPAN = 40;
  private streamId = nanoid(10);
  // 如果窗口内结果均相同，则视为一条独立语句，更新 streamId
  private window: string[] = [];
  private readonly MAX_WINDOW = 5;
  private clearWindow = () => {
    this.window = [];
    this.streamId = nanoid(10);
    this.clear();
  };
  private updateWindow = (resp: AudioAnalyseResp) => {
    const d = resp.parsed?.[0]?.transcript;

    if (d) {
      this.window.push(d);

      if (this.window.length > this.MAX_WINDOW) {
        this.window.splice(0, 1);

        const isAllSame = this.window.every((d, i, arr) => i === 0 || d === arr[i - 1]);

        // console.log({w: this.window, isAllSame});

        if (isAllSame) {
          this.clearWindow();
        }
      }
    }
  };

  private async streamChunk() {
    const nextCursor = this.streamedLength + AudioInterface.STREAM_SPAN;
    
    if (this.bufferedData.length >= nextCursor) {
      const chunk = this.bufferedData.slice(
        this.streamedLength,
        nextCursor
      );
      this.streamedLength = nextCursor;

      const blob = new Blob(chunk, { type: 'audio/webm' });

      // console.log('send', blob, new Date().toLocaleTimeString());
      
      const resp = await post.audio({
        id: this.streamId,
        data: await blob.arrayBuffer(),
      });

      resp.parsed = [{transcript: 'this is my application hello world', confidence: 0.9}];

      // downloadBlobs(`${this.streamId}.webw`, [blob], 'audio/webm');

      const p = new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          this.updateWindow(resp);
    
          // console.log(resp);
    
          this.parseListeners.forEach(cb => cb(resp));
         
          resolve();
        });
      });

      await p;

      return true;
    }

    return false;
  }

  /**
   * 开始录制.
   */
  startRecording(): void {
    if (this.recorder && !this._isRecording) {
      this.clearWindow();
      
      if (this.recorder.state === 'paused') {
        this.recorder.resume();
      } else {
        this.recorder.start(100);
      }
      
      this._isRecording = this.recorder.state === 'recording';
  
      this.fireUpdate();
    }
  }

  /**
   * 暂停录制.
   */
  pauseRecording(): void {
    if (this.recorder && this._isRecording) {
      this._isRecording = false;
      this.recorder.stop();
      this.clearWindow();
  
      this.fireUpdate();
    }
  }

  /**
   * 清空已录制内容.
   */
  clear(): void {
    this.bufferedData = [];
    this.streamedLength = 0;
  }

}

export const useAudioInterface = () => {
  return React.useMemo(() => {
    return new AudioInterface();
  }, []);
};


export default useMicrophone;
