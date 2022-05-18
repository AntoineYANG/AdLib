/*
 * @Author: Kanata You 
 * @Date: 2022-05-04 19:10:18 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-09 21:48:05
 */

import React from 'react';
import styled from 'styled-components';
import Masonry from 'react-masonry-component';
import Lottie from 'react-lottie';

import fetchPics from '@utils/fetch_pics';

import lottieCheckbox from './checkbox.json';
import lottieLoading from './loading.json';


const Container = styled.div({
  position: 'relative',
  width: '100%',
});

const PicContainer = styled.article<{ selected: boolean }>(({ selected }) => ({
  position: 'absolute', // 瀑布流自动置为 absolute
  width: 'min-content',
  marginBlockStart: '6px',
  marginBlockEnd: '10px',
  marginInline: '10px',
  paddingBlockStart: '10px',
  paddingBlockEnd: '6px',
  paddingInline: '10px',
  opacity: selected ? 1 : 0.6,
  zIndex: 1,

  '&:hover': {
    transform: 'scale(130%)',
    zIndex: 10,
  },

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#191b1c',

    '&:hover': {
      opacity: 1,
      boxShadow: '3px 5px 4px 2px #0008',
    },
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ecf3fb',
    boxShadow: '4px 5px 6px 4px #444a',

    '&:hover': {
      opacity: 1,
      boxShadow: '4px 5px 18px 16px #4446',
    },
  },

  transition: 'all 200ms',
}));

const Pic = styled.img<{ selected: boolean }>(({ selected }) => ({
  minWidth: '140px',
  minHeight: '140px',
  maxWidth: '50%',
  maxHeight: '25vh',
  filter: `contrast(${selected ? '95%' : '70%'})`,

  '@media (prefers-color-scheme: dark)': {

    '&:hover': {
      filter: 'contrast(100%)',
    },
  },
  '@media (prefers-color-scheme: light)': {

    '&:hover': {
      filter: 'contrast(100%)',
    },
  },

  transition: 'filter 120ms 40ms',
}));

const PicSkeleton = styled.img({
  minWidth: '140px',
  minHeight: '140px',
  maxWidth: '50%',
  maxHeight: '25vh',
  backgroundColor: '#aaaa',
});

const CheckboxContainer = styled.div({
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  width: '30px',
  height: '30px',
  margin: '0',
  pointerEvents: 'none',
});

const LoadingContainer = styled.div({
  marginBlock: '4vh',
  pointerEvents: 'none',
});

const Photo: React.FC<{
  mode: 'display' | 'checkbox';
  url: string;
  selected?: boolean;
  onToggle?: () => void;
}> = React.memo(function Photo ({
  mode,
  url,
  selected = false,
  onToggle,
}) {
  return (
    <PicContainer
      selected={selected}
      onClick={onToggle}
    >
      <Pic
        selected={selected}
        alt=""
        src={url}
        onDragStart={e => e.preventDefault()}
      />
      {
        mode === 'checkbox' && (
          <CheckboxContainer>
            {/* @ts-ignore */}
            <Lottie
              options={{
                loop: false,
                animationData: lottieCheckbox,
                autoplay: selected,
              }}
              width={120}
              height={120}
              isStopped={!selected}
              isClickToPauseDisabled
              speed={1.25}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </CheckboxContainer>
        )
      }
    </PicContainer>
  );
});

export interface PhotoMasonryHandler {
  reset: () => void;
  getSelected: () => string[];
}

const PhotoMasonry: React.FC<{
  handler: React.MutableRefObject<PhotoMasonryHandler | undefined>;
}> = React.memo(function PhotoMasonry ({ handler }) {
  const [cn, setCn] = React.useState('');
  const [pics, setPics] = React.useState<string[]>([]);

  const fetchMorePics = React.useCallback(() => {
    fetchPics(20).then(urls => {
      setPics(curList => {
        return [...new Set<string>([
          ...curList,
          ...urls
        ])];
      });
    });
  }, [setPics]);

  // 获取首屏
  React.useEffect(() => {
   fetchMorePics();
  }, []);

  // 已选择的图片的下标
  const [selected, setSelected] = React.useState<number[]>([]);

  React.useEffect(() => {
    handler.current = {
      reset: () => setSelected([]),
      getSelected: () => selected.map(i => pics[i] as string),
    };
  }, [handler, setSelected, selected, pics]);

  const skeletonId = React.useId();
  React.useEffect(() => {
    const skeleton = document.getElementById(skeletonId);

    if (!skeleton) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      const rate = entry?.intersectionRatio ?? 0;

      if (rate > 0) {
        fetchMorePics();
      }
    });

    observer.observe(skeleton);

    return () => {
      observer.unobserve(skeleton);
      observer.disconnect();
    };
  }, [fetchMorePics, document.getElementById(skeletonId)]);

  const elements = pics.map((d, i) => (
    <Photo
      mode="checkbox"
      key={i}
      selected={selected.includes(i)}
      url={d}
      onToggle={() => {
        if (selected.includes(i)) {
          setSelected(cur => cur.filter(e => e !== i));
        } else {
          setSelected(cur => [...cur, i]);
        }
      }}
    />
  )).concat(
    <PicContainer
      key="skeleton"
      id={skeletonId}
      selected={false}
      style={{
        pointerEvents: 'none',
        cursor: 'default',
      }}
    >
      <PicSkeleton />
    </PicContainer>
  );
  
  return cn ? (
    // @ts-ignore
    <Masonry
      elementType="section"
      className={cn}
      options={{
        transitionDuration: '200ms',
      }}
    >
      {elements.length === 1 ? [(
        <LoadingContainer key="loading">
          {/* @ts-ignore */}
            <Lottie
            options={{
              animationData: lottieLoading,
            }}
            width={300}
            height={300}
            isClickToPauseDisabled
          />
        </LoadingContainer>
      )] : elements}
    </Masonry>
  ) : (
    <Container
      ref={e => {
        const _cn = e?.className ?? '';

        if (_cn && _cn !== cn) {
          setCn(_cn);
        }
      }}
    />
  );
});

export const PhotoMasonryDisplay: React.FC<{
  photos: string[];
}> = React.memo(function PhotoMasonry ({ photos }) {
  const [cn, setCn] = React.useState('');

  const elements = photos.map((d, i) => (
    <Photo
      mode="display"
      key={i}
      url={d}
    />
  ));
  
  return cn ? (
    // @ts-ignore
    <Masonry
      elementType="section"
      className={cn}
      options={{
        transitionDuration: '200ms',
      }}
    >
      {elements.length === 1 ? [] : elements}
    </Masonry>
  ) : (
    <Container
      ref={e => {
        const _cn = e?.className ?? '';

        if (_cn && _cn !== cn) {
          setCn(_cn);
        }
      }}
    />
  );
});

export default PhotoMasonry;
