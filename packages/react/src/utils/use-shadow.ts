/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 22:48:36 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-18 22:36:48
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
  const size = 2 * _size;

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
      concave: `linear-gradient(145deg, ${colorDarker}1a -20%, ${colorBrighter}1a)`,
      convex: `linear-gradient(145deg, ${colorBrighter}1a, ${colorDarker}1a)`,
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
    }40`,
    borderRadius: '34px',
    minHeight: '68px',
    transition: [
      'background-color', 'background-image', 'color'
    ].map(n => `${n} 120ms`).join(', ')
  };
};


export default useShadow;
