/*
 * @Author: Kanata You 
 * @Date: 2022-05-09 21:52:14 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-11 21:04:48
 */

import React from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import type { TrainPageContext } from '.';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '@utils/use_local_storage';
import TrainResult from '@components/train-result';


const DoneElement = styled.div({
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

export interface TrainLog {
  time: number;
  analysis: {
    /** 时长 */
    duration: number;
    /** 总词数 */
    words: number;
    /** 词汇数 */
    vocab: number;
    /** 词均识别准确率 */
    accuracy: number;
    // /** 提示词数量 */
    /** 句子总数 */
    mission: number;
    // /** 提示词完成数量 */
    /** 语法正确的句子数量 */
    completed: number;
  };
}

const Done: React.FC<TrainPageContext> = React.memo(function Done ({
  result: log,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [_, setLogs] = useLocalStorage('trainLogs', [] as TrainLog[]);

  React.useEffect(() => {
    if (log) {
      setLogs(logs => [...logs, log]);
    }
  }, [log]);

  return (
    <DoneElement>
      <header>
        {t('train_completed')}
      </header>
      <TrainResult
        result={log}
      />
      <Footer>
        <Button
          onClick={e => {
            e.preventDefault();

            navigate("/");
          }}
        >
          {t('button.back')}
        </Button>
      </Footer>
    </DoneElement>
  );
});


export default Done;
