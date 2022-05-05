/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 12:05:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-05 16:00:24
 */

import React from 'react';
import styled from 'styled-components';

import ButtonGroups from '@components/button-groups';
import HomeButton from '@components/home-button';
import BackButton from '@components/back-button';
import PhotoMasonry, { PhotoMasonryDisplay, PhotoMasonryHandler } from '@components/photo-masonry';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import TestMic from './test-mic';
import useMicrophone, { AudioInterface, Microphone, useAudioInterface } from '@utils/use_microphone';


const TrainPageElement = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginBlock: '0',
  marginInline: '8vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  overflow: 'hidden',

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#0d0d0d',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#fdfdfdcc',
    boxShadow: '4px 4px 1px #0008',
  },
});

const PicList = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginInline: '8px',
  paddingBlock: '20px',
  paddingInline: '16px',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-around',
  overflow: 'hidden scroll',
});

enum TrainPageProgress {
  /** 测试麦克风 */
  TEST_MIC,
  /** 进行中 */
  GOING,
}

export interface TrainPageContext {
  next: () => void;
  microphone: Microphone | 'failed' | 'pending';
  audioInterface: AudioInterface;
};

const TrainPage: React.FC = React.memo(function TrainPage () {
  const [progress, setProgress] = React.useState(TrainPageProgress.TEST_MIC);
  const { t } = useTranslation();
  const photos = /[?&]photos=(?<urls>[^?&]*)/.exec(
    useLocation().search
  )?.groups?.['urls']?.split(',').map(unescape);

  const microphone = useMicrophone();
  const audioInterface = useAudioInterface();

  React.useEffect(() => {
    if (typeof microphone === 'object') {
      audioInterface.useInput(microphone);
    }
  }, [microphone]);

  const Body = {
    [TrainPageProgress.TEST_MIC]: TestMic,
    [TrainPageProgress.GOING]: TestMic, // FIXME:
  }[progress];

  return (
    <TrainPageElement>
      <ButtonGroups>
        <HomeButton />
        <BackButton />
      </ButtonGroups>
      <Body
        microphone={microphone}
        audioInterface={audioInterface}
        next={() => {
          setProgress(p => (({
            [TrainPageProgress.TEST_MIC]: TrainPageProgress.GOING,
          } as Record<TrainPageProgress, TrainPageProgress>)[p] ?? p));
        }}
      />
      {/* <PicList>
        <PhotoMasonryDisplay
          photos={photos ?? []}
        />
      </PicList> */}
    </TrainPageElement>
  );
});


export default TrainPage;
