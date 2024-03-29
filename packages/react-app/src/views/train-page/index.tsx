/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 12:05:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-10 00:39:04
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
import Done, { TrainLog } from './done';


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
  /** 已完成 */
  DONE,
}

export interface TrainPageContext {
  photos: string[];
  next: (log?: TrainLog) => void;
  microphone: Microphone | 'failed' | 'pending';
  audioInterface: AudioInterface;
  result?: TrainLog | undefined;
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
    [TrainPageProgress.DONE]: Done,
  }[progress];

  const [result, setResult] = React.useState<TrainLog>();

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
        next={log => {
          setProgress(p => (({
            [TrainPageProgress.TEST_MIC]: TrainPageProgress.GOING,
            [TrainPageProgress.GOING]: TrainPageProgress.DONE,
          } as Record<TrainPageProgress, TrainPageProgress>)[p] ?? p));

          if (log && !result) {
            setResult(log);
          }
        }}
        result={result}
      />
    </TrainPageElement>
  );
});


export default TrainPage;
