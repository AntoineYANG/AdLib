/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:39:37 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-07 00:49:35
 */

import React from 'react';
import { nanoid } from 'nanoid';

// import useAlert from '@utils/use-alert';
import downloadBlobs from './download-blobs';


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
  private isRecording: boolean;
  /** 录制数据 */
  private bufferedData: Blob[];
  /** 已上传的长度 */
  private streamedLength: number;

  private listeners: ((this: AudioInterface) => void)[];

  private analyserListeners: ((data: AudioRealTimeData) => void)[];

  constructor() {
    this.input = undefined;
    this.filter = {
      highPass: ac.createBiquadFilter(),
      lowPass: ac.createBiquadFilter(),
      connected: false,
    };
    this.filter.highPass.type = 'highpass';
    this.filter.highPass.frequency.setValueAtTime(FREQ_MIN, ac.currentTime);
    this.filter.highPass.Q.setValueAtTime(0, ac.currentTime);
    this.filter.lowPass.type = 'lowpass';
    this.filter.lowPass.frequency.setValueAtTime(FREQ_MAX, ac.currentTime);
    this.filter.lowPass.Q.setValueAtTime(0, ac.currentTime);
    this.filter.highPass.connect(this.filter.lowPass);
    this.gainNode = ac.createGain();
    this.gainNode.gain.value = 0.95;
    this.analyseNode = ac.createAnalyser();
    this.analyseNode.fftSize = 2048;
    this.monitorVolumeNode = ac.createGain();
    this.monitorVolumeNode.gain.value = 0;
    this.monitor = ac.destination;

    this.gainNode.connect(this.analyseNode);
    this.analyseNode.connect(this.monitorVolumeNode);
    this.monitorVolumeNode.connect(this.monitor);

    this.listeners = [];
    this.analyserListeners = [];

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
    this.isRecording = false;
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
    this.input.connect(this.filterOn ? this.filter.highPass : this.gainNode);

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
        if ((ev.data?.size ?? 0) > 0 && this.isRecording) {
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

  get filterOn() {
    return this.filter.connected;
  }

  set filterOn(on: boolean) {
    this.filter.connected = on;
    this.input?.connect(on ? this.filter.highPass : this.gainNode);

    this.filter.lowPass.disconnect();

    if (on) {
      this.input?.connect(this.filter.highPass);
      this.filter.lowPass.connect(this.gainNode);
    } else {
      this.input?.connect(this.gainNode);
    }

    this.fireUpdate();
  }

  private static readonly STREAM_SPAN = 10;

  private async streamChunk() {
    const nextCursor = this.streamedLength + AudioInterface.STREAM_SPAN;

    if (this.bufferedData.length >= nextCursor) {
      const chunk = this.bufferedData.slice(
        this.streamedLength,
        nextCursor
      );
      this.streamedLength = nextCursor;

      const id = nanoid(10);

      const blob = new Blob(chunk, { type: 'audio/webm' });

      if ((window as any).aaa) {return}
      (window as any).aaa = true;

      const resp = await post.audio({
        id,
        data: await blob.arrayBuffer(),
      });

      downloadBlobs(`${id}.webw`, [blob], 'audio/webm');

      console.log({ resp });

      return true;
    }

    return false;
  }

  /**
   * 开始录制.
   */
  startRecording(): void {
    if (this.recorder && !this.isRecording) {
      if (this.recorder.state === 'paused') {
        this.recorder.resume();
      } else {
        this.recorder.start(10);
      }
      
      this.isRecording = this.recorder.state === 'recording';
  
      this.fireUpdate();
    }
  }

  /**
   * 暂停录制.
   */
  pauseRecording(): void {
    if (this.recorder && this.isRecording) {
      this.isRecording = false;
      this.recorder.pause();
  
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
