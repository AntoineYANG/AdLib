/*
 * @Author: Kanata You 
 * @Date: 2022-03-20 00:25:28 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 00:27:24
 */

export interface AlertOption {
  msg: string;
}

const useAlert = (option: AlertOption) => {
  return alert(option.msg);
};


export default useAlert;
