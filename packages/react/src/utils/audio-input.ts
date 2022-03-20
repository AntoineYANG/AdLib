/*
 * @Author: Kanata You 
 * @Date: 2022-03-19 23:42:46 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 21:11:03
 */

import axios from 'axios';

import useAlert from '@utils/use-alert';
import downloadBlobs from './download-blobs';


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

/**
 * 音频输入实例，用于通过麦克风接收和发送音频流.
 */
export default class AudioInputReceiver {

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

  constructor(option: AudioInputReceiverOption) {
    this._status = AudioInputReceiverState.UNINITIALIZED;

    this.TIME_SLICE = option.timeSlice ?? 10;

    this.onClose = option.onClose;

    this.bufferedData = [];
    this.streamOption = null;
    this.streamedLength = 0;
    
    this.init(option.onLoad, option.onFailed);
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

      // const fr = new FileReader();
      // fr.readAsArrayBuffer(new Blob(chunk, {
      //   type: 'audio/mp3'
      //   // type: 'audio/x-wav'
      // }));

      const output = await this.getWavData(chunk);

      const form = new FormData();
      form.append('record', output, 'a.mp3');
      axios.post(this.streamOption.url, form);

      // const xhr = new XMLHttpRequest();
      // xhr.open('POST', this.streamOption.url, true);
      // xhr.overrideMimeType('application/octet-stream');
      // xhr.setRequestHeader('Content-Type', 'text/plain')
      // xhr.send(fr.result as ArrayBuffer);

      // await axios.post(
      //   this.streamOption.url,
      //   fr.result as ArrayBuffer
      // ).then(res => {
      //   console.log(res);
      // });

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

  private async getWavData(
    blobs: Blob[],
    inputSampleRate: number = 8000,
    outputSampleRate: number = 8000,
    inputSampleBits: 8 | 16 = 16,
    outputSampleBits: 8 | 16 = 16,

  ) {
    return new Blob(blobs, { type: 'audio/mp3' });
//     const sampleRate = Math.min(inputSampleRate, outputSampleRate);
//     const sampleBits = Math.min(inputSampleBits, outputSampleBits); 

//     const bytes = await new Promise<Float32Array>(resolve => {
//       const fr = new FileReader();
//       fr.readAsArrayBuffer(new Blob(blobs));

//       fr.onload = () => {
//         const d = fr.result as ArrayBuffer;
//         const size = Math.floor(d.byteLength / 4) * 4;

//         const fa = new Float32Array(d.slice(0, size));

//         return resolve(new Float32Array(fa));
//       };
//     });

//     const dataLength = bytes.length * (sampleBits / 8);
//     const buffer = new ArrayBuffer(44 + dataLength);
//     const data = new DataView(buffer);
    
//     let offset = 0;
//     const writeString = (str: string) => {
//       for (let i = 0; i < str.length; i += 1) {
//         data.setUint8(offset + i, str.charCodeAt(i));
//       }
//     };
//     // 资源交换文件标识符
//     writeString('RIFF');
//     offset += 4;
//     // 下个地址开始到文件尾总字节数,即文件大小-8
//     data.setUint32(offset, 36 + dataLength, true);
//     offset += 4;
//     // WAV文件标志
//     writeString('WAVE');
//     offset += 4;
//     // 波形格式标志
//     writeString('fmt ');
//     offset += 4;
//     // 过滤字节,一般为 0x10 = 16
//     data.setUint32(offset, 16, true);
//     offset += 4;
//     // 格式类别 (PCM形式采样数据)
//     data.setUint16(offset, 1, true);
//     offset += 2;
//     // 通道数
//     const channelCount = 1;
//     data.setUint16(offset, channelCount, true);
//     offset += 2;
//     // 采样率,每秒样本数,表示每个通道的播放速度
//     data.setUint32(offset, sampleRate, true);
//     offset += 4;
//     // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
//     data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true);
//     offset += 4;
//     // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
//     data.setUint16(offset, channelCount * (sampleBits / 8), true);
//     offset += 2;
//     // 每样本数据位数
//     data.setUint16(offset, sampleBits, true);
//     offset += 2;
//     // 数据标识符
//     writeString('data');
//     offset += 4;
//     // 采样数据总数,即数据总大小
//     data.setUint32(offset, dataLength, true);
//     offset += 4;
//     // 写入采样数据   
//     const output = this.reshapeWavData(sampleBits, offset, bytes, data);
// //                var wavd = new Int8Array(data.buffer.byteLength);
// //                var pos = 0;
// //                for (var i = 0; i < data.buffer.byteLength; i++, pos++) {
// //                    wavd[i] = data.getInt8(pos);
// //                }                
// //                return wavd;

//     return new Blob([output], { type: 'audio/wav' });
  }

  private reshapeWavData(sampleBits: number, offset: number, iBytes: Float32Array, oData: DataView) {
    if (sampleBits === 8) {
      for (let i = 0; i < iBytes.length; i++, offset++) {
        const s = Math.max(-1, Math.min(1, iBytes[i] as number));
        let val = s < 0 ? s * 0x8000 : s * 0x7fff;
        val = Math.floor(255 / (65535 / (val + 32768)));
        oData.setInt8(offset, val);
      }
    } else {
      for (let i = 0; i < iBytes.length; i++, offset += 2) {
          var s = Math.max(-1, Math.min(1, iBytes[i] as number));
          oData.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    }
    
    return oData;
  }

}
