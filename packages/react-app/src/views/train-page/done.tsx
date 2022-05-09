/*
 * @Author: Kanata You 
 * @Date: 2022-05-09 21:52:14 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-09 22:11:32
 */

import React from 'react';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import type { TrainPageContext } from '.';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '@utils/use_local_storage';


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
}

const Done: React.FC<TrainPageContext> = React.memo(function Done ({}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [_, setLogs] = useLocalStorage('trainLogs', [] as TrainLog[]);

  React.useEffect(() => {
    const log: TrainLog = {
      time: Date.now(),
    };

    setLogs(_logs => _logs.find(e => e.time === log.time) ? _logs : [..._logs, log]);
  }, []);

  return (
    <DoneElement>
      <header>
        {t('train_completed')}
      </header>
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
