/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:39:37 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-06 03:16:42
 */

import React from 'react';
import axios from 'axios';
import { nanoid } from 'nanoid';

import useAlert from '@utils/use-alert';
import downloadBlobs from './download-blobs';


const ac = new AudioContext();


export interface AudioInputReceiverOption {
  /** 每个 Blob 的毫秒数，默认 10 */
  timeSlice?: number;
  /** 设备完成加载，初始化完成 */
  onLoad?: (this: AudioInputReceiver) => void;
  /** 初始化失败 */
  onFailed?: (reason: Error) => void;
  /** 主动结束 */
  onClose?: () => void;
}

export enum AudioInputReceiverState {
  /** 媒体流关闭，或因无法修补的异常无法正常使用 */
  CLOSED = -2,
  /** 未初始化 */
  UNINITIALIZED = -1,
  /** 初始化完成，可以开始录制 */
  READY = 0,
  /** 录制中 */
  RECORDING = 1,
}

export interface AudioParseResp {
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
  ];
  parseError: { message: string } | null;
}

/**
 * 音频输入实例，用于通过麦克风接收和发送音频流.
 */
export class AudioInputReceiver {

  private _status: AudioInputReceiverState;

  /**
   * 组件状态.
   */
  get status() {
    return this._status;
  }

  /** 是否已启用 */
  get active() {
    return [
      AudioInputReceiverState.READY,
      AudioInputReceiverState.RECORDING
    ].includes(this._status);
  }

  /** 是否被禁用 */
  get disabled() {
    return AudioInputReceiverState.CLOSED === this._status;
  }

  /** 上传设置 */
  private streamOption: {
    url: string;
    mode: 'slice' | 'all';
    span: number;
  } | null;

  /** 每个 Blob 的毫秒数 */
  private readonly TIME_SLICE: number;

  private source: MediaStream | undefined;

  private recorder: MediaRecorder | undefined;

  /** 录制数据 */
  private bufferedData: Blob[];

  /** 已上传的长度 */
  private streamedLength: number;

  private readonly onClose: (() => void) | undefined;

  constructor(option?: AudioInputReceiverOption) {
    this._status = AudioInputReceiverState.UNINITIALIZED;

    this.TIME_SLICE = option?.timeSlice ?? 10;

    this.onClose = option?.onClose;

    this.bufferedData = [];
    this.streamOption = null;
    this.streamedLength = 0;
    
    this.init(option?.onLoad, option?.onFailed);
  }

  /**
   * 开始录制.
   */
  start(): void {
    if (!this.recorder) {
      throw new Error('初始化未完成，无法进行录制。');
    } else if (this._status !== AudioInputReceiverState.READY) {
      throw new Error(`当前状态 [${this._status}] 无法开始录制。`);
    }

    this.recorder.start(this.TIME_SLICE);
    this._status = AudioInputReceiverState.RECORDING;
  }

  /**
   * 结束录制.
   */
  stop(): void {
    if (this._status !== AudioInputReceiverState.RECORDING) {
      throw new Error(`当前未在录制中。`);
    }

    this.recorder?.stop();
    this.streamChunk();
    this._status = AudioInputReceiverState.READY;
  }

  /**
   * 清空已录制内容.
   */
  clear(): void {
    this.bufferedData = [];
    this.streamedLength = 0;
  }

  /**
   * 关闭媒体流（不可逆）.
   */
  close(): void {
    this.source?.getTracks().forEach(track => {
      track.stop();
      this.source?.removeTrack(track);
    });

    this._status = AudioInputReceiverState.CLOSED;
    this.onClose?.();
  }

  /**
   * 设置视频流上传接口.
   */
  useStream(
    url: string,
    mode: 'slice' | 'all' = 'slice',
    span: number = 20
  ): void {
    this.streamOption = {
      url,
      mode,
      span
    };
  }

  /**
   * 关闭视频流上传.
   */
  closeStream(): void {
    this.streamOption = null;
  }

  download(): void {
    if (this.bufferedData.length === 0) {
      throw new Error('录制内容为空。');
    }

    console.log(this.bufferedData.length, this.streamedLength);
    
    downloadBlobs('test.mp3', this.bufferedData);
  }

  private async streamChunk() {
    const nextCursor = this.streamedLength + (this.streamOption?.span ?? 1);

    if (this.streamOption && this.bufferedData.length >= nextCursor) {
      const chunk = this.bufferedData.slice(
        this.streamOption.mode === 'slice' ? this.streamedLength : 0,
        nextCursor
      );
      this.streamedLength = nextCursor;

      const fileName = nanoid(10) + '.webm';

      const blob = new Blob(chunk, { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('excelFile', blob);
      formData.append('fileName', fileName);

      await axios.post<AudioParseResp>(
        this.streamOption.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(({ data }) => {
        const container = document.getElementById('resp') as HTMLDivElement;

        for (let i = container.childElementCount - 1; i >= 0; i--) {
          container.removeChild(container.childNodes.item(i));
        }
        
        data.parsed.forEach((d, i) => {
          const node = document.createElement(
            'p'
          );

          node.style.fontSize = '2rem';
          node.style.lineHeight = '1.6em';
          node.style.margin = '0';
          node.style.fontWeight = i ? 'normal' : '550';

          node.textContent = d?.transcript ?? '';

          container.appendChild(node);
        });
      });

      return true;
    }

    return false;
  }

  /**
   * 初始化 MediaStream 和 MediaRecorder 实例.
   */
  async init(
    onLoad?: (this: AudioInputReceiver) => void,
    onFailed?: (reason: Error) => void
  ): Promise<void> {
    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
     */
    await navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      this.source = stream;
    }).catch((reason: DOMException) => {
      this._status = AudioInputReceiverState.CLOSED;

      switch (reason.name ?? 'unknown') {
        // 中止错误
        case 'AbortError': {
          // 尽管用户和操作系统都授予了访问设备硬件的权利，
          // 而且未出现可能抛出NotReadableError异常的硬件问题，
          // 但仍然有一些问题的出现导致了设备无法被使用。
          useAlert({
            msg: `麦克风访问异常，设备无法使用。[${
              reason.message
            }]`
          });

          break;
        }
        // 拒绝错误
        case 'NotAllowedError': {
          // 用户拒绝了当前的浏览器实例的访问请求；
          // 或者用户拒绝了当前会话的访问；
          // 或者用户在全局范围内拒绝了所有媒体访问请求。
          useAlert({
            msg: `麦克风访问请求被拒绝，请管理您的浏览器设置。[${
              reason.message
            }]`
          });
          
          break;
        }
        // 找不到错误
        case 'NotFoundError': {
          // 找不到满足请求参数的媒体类型。
          useAlert({
            msg: `找不到满足麦克风请求的设备。[${
              reason.message
            }]`
          });
          
          break;
        }
        // 无法读取错误
        case 'NotReadableError': {
          // 尽管用户已经授权使用相应的设备，
          // 操作系统上某个硬件、浏览器或者网页层面发生的错误导致设备无法被访问。
          useAlert({
            msg: `出现读取异常，无法正确访问麦克风设备。[${
              reason.message
            }]`
          });

          break;
        }
        // 无法满足要求错误
        case 'OverconstrainedError': {
          // 指定的要求无法被设备满足，
          // 此异常是一个类型为OverconstrainedError的对象，
          // 拥有一个constraint属性，包含当前无法被满足的constraint对象，
          // 还拥有一个message属性，包含了阅读友好的字符串用来说明情况。
          // 因为这个异常甚至可以在用户尚未授权使用当前设备的情况下抛出，
          // 所以应当可以当作一个探测设备能力属性的手段。
          useAlert({
            msg: `请求的麦克风设备无法被满足。[${
              reason.message
            }]`
          });

          break;
        }
        // 安全错误
        case 'SecurityError': {
          // 在getUserMedia() 被调用的 Document 上面，使用设备媒体被禁止。
          // 这个机制是否开启或者关闭取决于单个用户的偏好设置。
          useAlert({
            msg: `在本页面访问麦克风请求被禁止，请管理您的浏览器设置。[${
              reason.message
            }]`
          });

          break;
        }
        // 类型错误
        case 'TypeError': {
          // constraints对象未设置［空］，或者都被设置为false。
          useAlert({
            msg: `发生预期外的参数错误，初始化失败。[${
              reason.message
            }]`
          });

          break;
        }
        // 未知错误
        default: {
          useAlert({
            msg: `未知错误。[${
              reason.message
            }]`
          });

          break;
        }
      }

      onFailed?.(reason);
    });

    if (this.source) {
      // @see https://juejin.cn/post/6844903953381982222#heading-3

      /** 声源的载体 */
      const context = new window.AudioContext();
  
      /** 声音输入 */
      const audioInput = context.createMediaStreamSource(this.source);

      audioInput.connect(context.destination);

      try {
        /** 录制实例 */
        const recorder = ((): MediaRecorder => {
          // 兼容媒体类型
          for (const option of ['audio/webm', 'audio/mp3']) {
            try {
              const mr = new MediaRecorder(this.source as MediaStream, {
                mimeType: option
              });

              return mr;
            } catch {
              continue;
            }
          }

          throw new Error('无法正确实例化 MediaRecorder 对象');
        })();

        this.recorder = recorder;

        this.bufferedData = [];
        this.streamedLength = 0;

        recorder.ondataavailable = ev => {
          if ((ev.data?.size ?? 0) > 0) {
            this.bufferedData.push(ev.data);

            this.streamChunk();
          }
        };

        this._status = AudioInputReceiverState.READY;
        onLoad?.call(this);
      } catch (error) {
        this._status = AudioInputReceiverState.CLOSED;
        onFailed?.(error);
      }
    } else {
      this._status = AudioInputReceiverState.CLOSED;
    }
  }

}

/**
 * 麦克风.
 */
export class Microphone {

  private source: MediaStream | undefined;
  private input: MediaStreamAudioSourceNode | undefined;

  constructor() {
    this.source = undefined;
    this.input = undefined;
    this.init();
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
      this.source = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      /** 声音输入 */
      this.input = ac.createMediaStreamSource(this.source);

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

/**
 * 虚拟声卡.
 */
export class AudioInterface {
  
  private input: Microphone | undefined;
  private gainNode: GainNode;
  private analyseNode: AnalyserNode;
  private monitorVolumeNode: GainNode;
  private monitor: AudioDestinationNode;

  private monitorOn: boolean;

  private listeners: ((this: AudioInterface) => void)[];

  private analyserListeners: ((data: AudioRealTimeData) => void)[];

  constructor() {
    this.input = undefined;
    this.gainNode = ac.createGain();
    this.gainNode.gain.value = 0.95;
    this.analyseNode = ac.createAnalyser();
    this.analyseNode.fftSize = 2048;
    this.gainNode.connect(this.analyseNode);
    this.monitorVolumeNode = ac.createGain();
    this.monitorVolumeNode.gain.value = 1;
    this.monitor = ac.destination;
    this.monitorVolumeNode.connect(this.monitor);

    this.monitorOn = false;

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
  }

  useInput(microphone: Microphone): void {
    if (microphone === this.input) {
      return;
    }

    this.input = microphone;
    this.input.connect(this.gainNode);

    this.fireUpdate();
  }

  get hasInput() {
    return Boolean(this.input);
  }

  get gain() {
    return this.gainNode.gain.value;
  }

  set gain(gain: number) {
    this.gainNode.gain.value = gain;
    this.fireUpdate();
  }

  get monitorStatus() {
    return this.monitorOn;
  }

  set monitorStatus(on: boolean) {
    if (this.monitorOn === on) {
      return;
    }

    if (this.monitorOn) {
      this.analyseNode.disconnect();
    }

    this.monitorOn = on;

    if (on) {
      this.analyseNode.connect(this.monitorVolumeNode);
    }

    this.fireUpdate();
  }

  get monitorVolume() {
    return this.monitorVolumeNode.gain.value;
  }

  set monitorVolume(val: number) {
    this.monitorVolumeNode.gain.value = val;
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

}

export const useAudioInterface = () => {
  return React.useMemo(() => {
    return new AudioInterface();
  }, []);
};


export default useMicrophone;
