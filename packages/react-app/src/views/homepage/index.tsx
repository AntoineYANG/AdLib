/*
 * @Author: Kanata You 
 * @Date: 2022-04-29 17:52:55 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-02 17:54:59
 */

import React from 'react';
import styled from 'styled-components';

import CardButton from '@components/card-button';

import lottieSpeaking from '@components/card-button/speaking.json';
import lottieCalender from '@components/card-button/calendar.json';
import lottieSettings from '@components/card-button/settings.json';
import lottieNotebook from '@components/card-button/notepad.json';


const HomepageElement = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginBlock: '0',
  marginInline: '20vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#0d0d0d',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#fdfdfdcc',
    boxShadow: '4px 4px 1px #0008',
  },
});

const CardList = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  paddingBlock: '40px',
  paddingInline: '20px',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-around',
});

const Homepage: React.FC = React.memo(function Homepage () {
  return (
    <HomepageElement>
      <CardList>
        <CardButton
          label="start"
          lottie={lottieSpeaking}
          path="/idea"
        />
        <CardButton
          label="logs"
          lottie={lottieCalender}
          path="/logs"
        />
        <CardButton
          label="note"
          lottie={lottieNotebook}
          path="/note"
        />
        <CardButton
          label="configs"
          lottie={lottieSettings}
          path="/configs"
        />
      </CardList>
    </HomepageElement>
  );
});


export default Homepage;
