/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 12:05:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-06 18:01:57
 */

import React from 'react';
import styled from 'styled-components';

import ButtonGroups from '@components/button-groups';
import HomeButton from '@components/home-button';
import BackButton from '@components/back-button';
import { useLocation } from 'react-router-dom';
import TestMic from './test-mic';
import useMicrophone, {
  AudioInterface,
  Microphone,
  useAudioInterface
} from '@utils/use_microphone';
import Train from './train';


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

enum TrainPageProgress {
  /** 测试麦克风 */
  TEST_MIC,
  /** 进行中 */
  GOING,
}

export interface TrainPageContext {
  photos: string[];
  next: () => void;
  microphone: Microphone | 'failed' | 'pending';
  audioInterface: AudioInterface;
};

const TrainPage: React.FC = React.memo(function TrainPage () {
  const [progress, setProgress] = React.useState(TrainPageProgress.TEST_MIC);
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
    [TrainPageProgress.GOING]: Train,
  }[progress];

  return (
    <TrainPageElement>
      <ButtonGroups>
        <HomeButton />
        <BackButton />
      </ButtonGroups>
      <Body
        photos={photos ?? []}
        microphone={microphone}
        audioInterface={audioInterface}
        next={() => {
          setProgress(p => (({
            [TrainPageProgress.TEST_MIC]: TrainPageProgress.GOING,
          } as Record<TrainPageProgress, TrainPageProgress>)[p] ?? p));
        }}
      />
    </TrainPageElement>
  );
});


export default TrainPage;
