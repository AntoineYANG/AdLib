/*
 * @Author: Kanata You 
 * @Date: 2022-04-29 15:51:25 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-04-29 18:14:16
 */

import React from 'react';
import styled from 'styled-components';
import Lottie from 'react-lottie';

import logo from '@public/icon256.png';
import lottieWave from './wave-loop.json';
import lottieLoading from './loading.json';


const WelcomeWindowElement = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  userSelect: 'none',
  
  '@media (prefers-color-scheme: dark)': {
    color: '#bbb',
    backgroundColor: '#2154',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#444',
    backgroundColor: '#fffc',
  },

  '> div:nth-child(3)': {
    '@media (prefers-color-scheme: dark)': {
      filter: 'invert(100%)',
    },
  },
});

const Logo = styled.img({
  position: 'absolute',
  top: '26px',
  left: '14vw',
  width: '64px',
  height: '64px',
  borderRadius: '5%',
  boxShadow: '1px 2px 6px 2px #0004',
  pointerEvents: 'none',
});

const Header = styled.header({
  position: 'absolute',
  top: '24px',
  right: '14vw',
  display: 'flex',
  flexDirection: 'column',
  fontSize: '1rem',
  lineHeight: '1.6em',
  fontWeight: 600,

  '> *:nth-child(1)': {
    fontSize: '1.15rem',
    lineHeight: '1.8em',
  },

  '> *:last-child': {
    fontWeight: 500,
  },

  '> span > a': {
    color: '#85e',
    textDecoration: 'none',
    cursor: 'pointer',
  },
});

/**
 * 欢迎界面.
 */
const WelcomeWindow: React.FC = React.memo(function WelcomeWindow () {
  React.useEffect(() => {
    electron.setResizable(false);

    return () => {
      electron.setResizable(true);
    };
  }, []);

  return (
    <WelcomeWindowElement>
      {/* @ts-ignore */}
      <Lottie
        options={{
          animationData: lottieWave
        }}
        width={400}
        height={240}
        style={{
          position: 'absolute',
          bottom: '-70px',
          left: '0px',
          pointerEvents: 'none',
        }}
      />
      <Logo
        src={logo}
        alt=""
        aria-hidden
      />
      {/* @ts-ignore */}
      <Lottie
        options={{
          animationData: lottieLoading
        }}
        width={84}
        height={84}
        style={{
          position: 'absolute',
          top: '92px',
          left: '50vw',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '132px',
          left: '60vw',
        }}
      >
        initializing...
      </span>
      <Header>
        <span>
          {APP_NAME}
        </span>
        <span>
          {`version: ${VERSION}-alpha`}
        </span>
        <span>
          Powered by <a href="https://antoineyang.github.io/">Zhendong Yang</a>.
        </span>
      </Header>
    </WelcomeWindowElement>
  );
});


export default WelcomeWindow;
