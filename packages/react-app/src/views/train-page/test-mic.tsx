/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:19:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-05 22:51:12
 */

import React from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import type { TrainPageContext } from '.';
import VirtualAudioInterface from '@components/virtual-audio-interface';


const TestMicElement = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginInline: '8px',
  paddingBlock: '20px',
  paddingInline: '60px',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  alignItems: 'stretch',
  justifyContent: 'space-around',
  overflow: 'hidden scroll',

  '> header': {
    fontSize: '1.15rem',
    fontWeight: 550,
    lineHeight: '1.6em',
    textAlign: 'center',
    userSelect: 'none',
  },
});

const Control = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
});

const TestMic: React.FC<TrainPageContext> = React.memo(function TestMic ({
  next,
  microphone,
  audioInterface,
}) {
  const { t } = useTranslation();

  return (
    <TestMicElement>
      <header>
        {microphone === 'pending' && t('mic_init')}
        {microphone === 'failed' && t('mic_failed')}
        {typeof microphone === 'object' && t('test_mic')}
      </header>
      <Control>
        <VirtualAudioInterface
          control={audioInterface}
        />
      </Control>
    </TestMicElement>
  );
});


export default TestMic;
