/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:19:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-08 18:58:53
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

const Footer = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  paddingBlockStart: '20px',
  paddingBlockEnd: '32px',
  paddingInline: '36px',
  fontSize: '1.2rem',
  fontWeight: 550,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
});

const Button = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  lineHeight: '1.6em',
  marginBlock: '0.2em',
  marginInline: '4px',
  paddingBlock: '0.4em',
  paddingInline: '24px',
  borderRadius: '0.25em',
  backgroundColor: '#ffb300',
  border: '1px solid #666',
  boxShadow: '0 2px 2px #0006',
  backgroundImage: 'linear-gradient(45deg, #0003, transparent 60%, #fff2)',
  color: '#eee',
  userSelect: 'none',
  cursor: 'pointer',

  ':hover': {
    marginBlock: '0',
    marginInline: '0',
    paddingBlock: '0.6em',
    paddingInline: '28px',
  },

  transition: 'margin 200ms, padding 200ms',
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
      {
        typeof microphone === 'object' && (
          <Footer>
            <Button
              onClick={next}
            >
              {t('button.start')}
            </Button>
          </Footer>
        )
      }
      <Control>
        <VirtualAudioInterface
          control={audioInterface}
          allowRecording={false}
        />
      </Control>
    </TestMicElement>
  );
});


export default TestMic;
