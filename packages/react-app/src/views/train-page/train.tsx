/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:19:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-10 01:13:32
 */

import React from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import type { TrainPageContext } from '.';
import VirtualAudioInterface from '@components/virtual-audio-interface';
import { PhotoMasonryDisplay } from '@components/photo-masonry';
import ConfirmDialog from '@components/confirm-dialog';
import type { TrainLog } from './done';


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

const TextView = styled.section({
  height: '25vh',
  fontSize: '1.6rem',
  lineHeight: '1.6em',
  paddingInline: '1em',
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  overflow: 'hidden scroll',

  '> p': {
    marginBlock: '0.4em',
    textDecoration: 'underline',
  },
});

const Train: React.FC<TrainPageContext> = React.memo(function Train ({
  photos,
  next,
  audioInterface,
}) {
  const { t } = useTranslation();
  const id = React.useId();

  const [data, setData] = React.useState<AudioAnalyseResp[]>([]);

  const durationRef = React.useRef(0);
  const wordsRef = React.useRef<{ [word: string]: number }>({});
  const accuracyRef = React.useRef(0);
  const missionCountRef = React.useRef<{
    total: number;
    completed: number;
  }>({
    total: 0,
    completed: 0
  });

  React.useEffect(() => {
    audioInterface.startRecording();

    const cb = (d: AudioAnalyseResp) => {
      if (d.message === 'ok' && d.parsed?.length) {
        setData(_data => {
          const which = _data.findIndex(e => e.fileName === d.fileName);

          if (which === -1) {
            d.parsed?.[0]?.transcript.split(/(\s|\/)+/).forEach(word => {
              if (word.replace(/[ \/]+/g, '').length === 0) {
                return;
              }
              
              if (!wordsRef.current[word]) {
                wordsRef.current[word] = 0;
              }

              wordsRef.current[word] += 1;
              accuracyRef.current += d.parsed?.[0]?.confidence ?? 1;
            });

            return [..._data, d];
          }

          const next = [..._data];
          next[which] = d;

          return next;
        });
      }
    };

    audioInterface.connectAudioParser(cb);

    return () => {
      audioInterface.disconnectFromAudioParser(cb);
      audioInterface.pauseRecording();
    };
  }, [audioInterface]);

  React.useEffect(() => {
    if (audioInterface.isRecording) {
      const beginTime = Date.now();

      const handleEnd = () => {
        const pauseTime = Date.now();

        durationRef.current += (pauseTime - beginTime);
      };

      return handleEnd;
    }

    return;
  }, [audioInterface.isRecording]);

  React.useLayoutEffect(() => {
    const container = document.getElementById(id);

    container?.scrollTo(0, Infinity);
  }, [data, id]);

  const [terminate, setTerminate] = React.useState<(confirm: boolean) => void>();

  const handleClickEnd = React.useCallback(() => {
    if (terminate) {
      return;
    }

    new Promise<boolean>(resolve => {
      if (audioInterface.isRecording) {
        audioInterface.pauseRecording();
      }
      
      setTerminate(() => resolve);
    }).then(ok => {
      setTerminate(undefined);

      const words = Object.values(wordsRef.current).reduce((sum, v) => sum + v, 0);

      const result: TrainLog = {
        time: Date.now(),
        analysis: {
          duration: durationRef.current,
          words,
          vocab: Object.keys(wordsRef.current).length,
          accuracy: words ? accuracyRef.current / words : 0,
          mission: missionCountRef.current.total,
          completed: missionCountRef.current.completed,
        },
      };

      // console.log({result});
      
      if (ok) {
        next(result);
      }
    });
  }, [terminate, setTerminate, next, audioInterface]);

  return (
    <TrainElement>
      <PicList>
        <PhotoMasonryDisplay
          photos={photos ?? []}
        />
      </PicList>
      <TextView id={id}>
        {
          data.map((d, i) => (
            <p key={i}>
              {d.parsed?.[0]?.transcript ?? '...'}
            </p>
          ))
        }
      </TextView>
      <Footer>
        <Button
          onClick={handleClickEnd}
        >
          {t('button.end')}
        </Button>
      </Footer>
      <Control>
        <VirtualAudioInterface
          allowRecording
          control={audioInterface}
        />
      </Control>
      {terminate && (
        <ConfirmDialog
          desc="should_end_train"
          highlight="yes"
          handler={terminate}
        />
      )}
    </TrainElement>
  );
});


export default Train;
