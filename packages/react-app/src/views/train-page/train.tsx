/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:19:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-07 00:02:56
 */

import React from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import type { TrainPageContext } from '.';
import VirtualAudioInterface from '@components/virtual-audio-interface';
import { PhotoMasonryDisplay } from '@components/photo-masonry';


const TrainElement = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginInline: '8px',
  paddingBlock: '20px',
  paddingInline: '60px',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
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

const Train: React.FC<TrainPageContext> = React.memo(function Train ({
  photos,
  next,
  audioInterface,
}) {
  const { t } = useTranslation();

  React.useEffect(() => {
    audioInterface.startRecording();

    return () => {
      audioInterface.pauseRecording();
    };
  }, [audioInterface]);

  return (
    <TrainElement>
      <header>
        {t('training')}
      </header>
      <PicList>
        <PhotoMasonryDisplay
          photos={photos ?? []}
        />
      </PicList>
      <Footer>
        <Button
          onClick={next}
        >
          {t('button.end')}
        </Button>
      </Footer>
      <Control>
        <VirtualAudioInterface
          control={audioInterface}
        />
      </Control>
    </TrainElement>
  );
});


export default Train;
