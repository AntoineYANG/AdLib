/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 22:48:36 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-16 00:24:30
 */

const useShadow = (options: {
  shape?: 'flat' | 'concave' | 'convex' | 'pressed';
  darkMode: boolean;
  size?: number;
  distance?: number;
}) => {
  const {
    shape = 'flat',
    darkMode,
    size: _size = 1,
    distance = 1
  } = options;
  const size = 10 * _size;

  const colorBrighter = darkMode ? '#3e3e3e' : '#fcfcfc';
  const colorDarker = darkMode ? '#000000' : '#020202';

  const transform = `${
    shape === 'pressed' ? '' : '-'
  }${
    distance * size * 0.5
  }px`;

  return {
    transform: `translate(${transform}, ${transform})`,
    backgroundImage: {
      flat: undefined,
      concave: `linear-gradient(145deg, ${colorDarker}10 -20%, ${colorBrighter}10)`,
      convex: `linear-gradient(145deg, ${colorBrighter}10, ${colorDarker}10)`,
      pressed: undefined
    }[shape],
    boxShadow: `${
      shape === 'pressed' ? 'inset ' : ''
    }${size}px ${size}px ${size * distance * 2.4}px ${
      colorDarker
    }20, ${
      shape === 'pressed' ? 'inset ' : ''
    }-${size}px -${size}px ${size * distance * 2.4}px ${
      colorBrighter
    }60`,
    borderRadius: '34px',
    minHeight: '68px',
    transition: [
      'background-color', 'background-image', 'color'
    ].map(n => `${n} 200ms`).join(', ')
  };
};


export default useShadow;
