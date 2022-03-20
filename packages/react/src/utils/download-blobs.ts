/*
 * @Author: Kanata You 
 * @Date: 2022-03-20 14:38:43 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 14:41:42
 */

const downloadBlobs = (name: string, data: Blob[], type: string = 'audio/mp3'): void => {
  const blob = new Blob(data, { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};


export default downloadBlobs;
