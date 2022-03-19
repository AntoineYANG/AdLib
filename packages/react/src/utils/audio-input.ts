/*
 * @Author: Kanata You 
 * @Date: 2022-03-19 23:42:46 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 01:41:45
 */

import useAlert from '@utils/use-alert';


// declare class AudioWorkletProcessor {}

// class RandomNoiseProcessor extends AudioWorkletProcessor {

//   process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: any): boolean {
//     const output = outputs[0];

//     output?.forEach((channel, j) => {
//       for (let i = 0; i < channel.length; i++) {
//         channel[i] = (inputs[0]?.[j]?.[i] ?? 0) + Math.random() * 2 - 1;
//       }
//     });
    
//     return true;
//   }

// }

// registerProcessor('random-noise-processor', RandomNoiseProcessor);


export interface AudioInputReceiverOption {
  /** 缓存大小，默认 4096 */
  bufferSize?: number;
  /** 声道数量，默认 1 */
  channelCount?: number;
  /** 设备完成加载，初始化完成 */
  onLoad?: () => void;
  /** 初始化失败 */
  onDisabled?: (reason: DOMException) => void;
  /** 主动结束 */
  onClose?: () => void;
}

/**
 * 音频输入实例，用于通过麦克风接收和发送音频流.
 */
export default class AudioInputReceiver {

  /** 是否已启用 */
  private _active: boolean;

  get active() {
    return this._active;
  }

  /** 麦克风是否被禁用 */
  private _disabled: boolean;

  get disabled() {
    return this._disabled;
  }

  /** 缓存大小 */
  private readonly bufferSize: number;

  /** 声道数量 */
  private readonly channelCount: number;

  private source: MediaStream | undefined;

  private readonly onClose: (() => void) | undefined;

  constructor(option: AudioInputReceiverOption) {
    this._active = false;
    this._disabled = false;

    this.bufferSize = option.bufferSize ?? 4096;
    this.channelCount = option.channelCount ?? 1;

    this.onClose = option.onClose;

    /**
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
     */
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(stream => {
      this.source = stream;
      option.onLoad?.();
    }).catch((reason: DOMException) => {
      this._disabled = true;

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

      option.onDisabled?.(reason);
    });
  }

  /**
   * 关闭媒体流（不可逆）.
   */
  close(): void {
    this.source?.getTracks().forEach(track => {
      track.stop();
      this.source?.removeTrack(track);
    });

    this._active = false;
    this.onClose?.();
  }

  listen(): void {
    if (this.source) {
      // @see https://juejin.cn/post/6844903953381982222#heading-3

      /** 声源的载体 */
      const context = new window.AudioContext();
  
      /** 声音输入 */
      const audioInput = context.createMediaStreamSource(this.source);
      // await context.audioWorklet.addModule('random-noise-processor.js')

      audioInput.connect(context.destination);

      // TODO:

      // /** 缓存节点 */
      // const processor = new AudioWorkletNode(context, 'recorder');
      // context.createMediaStreamSource
      // processor.connect(context.destination);
    }
  }

}
