/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 14:19:54 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-24 23:57:31
 */

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import type { TrainPageContext } from '.';
import VirtualAudioInterface from '@components/virtual-audio-interface';
import { PhotoMasonryDisplay } from '@components/photo-masonry';
import ConfirmDialog from '@components/confirm-dialog';
import type { TrainLog } from './done';
import GrammarChecker, { GrammarCheckResponseData, GrammarIssue } from '@utils/grammar_checker';


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

const WrongClause = styled.span({
  position: 'relative',
  color: 'red',
  display: 'inline-flex',
  flexDirection: 'column',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: '1.28em',
    height: '0.24em',
    width: '100%',
    backgroundImage: `
      linear-gradient(135deg, transparent 42%, red, transparent 58%),
      linear-gradient(45deg, transparent 42%, red, transparent 58%)
    `,
    backgroundSize: '0.4em 0.4em',
    backgroundRepeat: 'repeat-x, repeat-x',
  },

  '> span.root': {
    color: 'orangered',
    display: 'inline-flex',
    flexDirection: 'column',
    position: 'relative',
    width: '1px',
    overflow: 'visible',
    fontSize: '80%',

    '> .body': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid',
      paddingInline: '0.2em',
      minWidth: '100px',
      width: 'fit-content',

      '> .replace': {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },

      '> .msg': {
        paddingBlockStart: '0.2em',
        fontStyle: 'italic',
        width: 'max-content',
      },
    },
  },
});

const grammarCache: { [text: string]: GrammarIssue[] } = {};

const Train: React.FC<TrainPageContext> = React.memo(function Train ({
  photos,
  next,
  audioInterface,
}) {
  const { t } = useTranslation();
  const id = React.useId();

  const [data, setData] = React.useState<{
    text: string;
    grammar: GrammarIssue[] | undefined | null;
  }[]>([]);

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
          const text = d.parsed?.[0]?.transcript ?? '...';

          text.split(/(\s|\/)+/).forEach(word => {
            if (word.replace(/[ \/]+/g, '').length === 0) {
              return;
            }
            
            if (!wordsRef.current[word]) {
              wordsRef.current[word] = 0;
            }

            wordsRef.current[word] += 1;
            accuracyRef.current += d.parsed?.[0]?.confidence ?? 1;
          });

          return [..._data, {
            text,
            grammar: grammarCache[text]
          }].splice(-5);
        });
      }
    };

    audioInterface.connectAudioParser(cb);

    return () => {
      audioInterface.disconnectFromAudioParser(cb);
      audioInterface.pauseRecording();
    };
  }, [audioInterface, wordsRef, accuracyRef]);

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

    container?.scrollTo(0, 0);
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

      console.log({result}, wordsRef);
      
      if (ok) {
        next(result);
      }
    });
  }, [terminate, setTerminate, next, audioInterface, wordsRef, accuracyRef, missionCountRef]);

  React.useEffect(() => {
    for (const d of data) {
      if (d.grammar === undefined) {
        setData(_data => _data.map(item => item === d ? {
          text: d.text,
          grammar: null
        } : item));

        console.log('test', d.text);

        GrammarChecker.check({
          text: d.text,
          language: 'en-US', // FIXME:
        }).then(res => {
          console.log('grammar', res);

          if (res === null) {
            return;
          }

          grammarCache[d.text] = res.matches;

          setData(_data => _data.map(d => ({
            text: d.text,
            grammar: grammarCache[d.text]
          })));
        });
      }
    }
  }, [data[data.length - 1]?.text, setData]);

  return (
    <TrainElement>
      <PicList>
        <PhotoMasonryDisplay
          photos={photos ?? []}
        />
      </PicList>
      <TextView id={id}>
        {
          [...data].reverse().map((d, i) => (
            <p
              key={i}
              style={{
                textDecoration: 'none',
              }}
            >
              {`>> `}
              {
                d.grammar ? (
                  (() => {
                    const elements: JSX.Element[] = [];

                    let cursor = 0;

                    d.grammar.sort(
                      (a, b) => a.offset - b.offset
                    ).forEach(issue => {
                      if (issue.offset > cursor) {
                        elements.push(
                          <span>
                            {d.text.slice(cursor, issue.offset)}
                          </span>
                        );
                      }

                      elements.push(
                        <WrongClause>
                          {d.text.slice(issue.offset, issue.offset + issue.length)}
                          <span className="root">
                            <span className="body">
                              {issue.replacements.length && (
                                <span className="replace">
                                  {issue.replacements.map(d => d.value).join(', ')}
                                </span>
                              )}
                              {issue.message && (
                                <span className="msg">
                                  {issue.message}
                                </span>
                              )}
                            </span>
                          </span>
                        </WrongClause>
                      );

                      cursor = issue.offset + issue.length;
                    });

                    if (cursor < d.text.length) {
                      elements.push(
                        <span>
                          {d.text.slice(cursor)}
                        </span>
                      );
                    }

                    return (
                      <>
                        {elements.map((e, i) => (
                          <React.Fragment key={i}>
                            {e}
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()
                ) : d.text
              }
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
