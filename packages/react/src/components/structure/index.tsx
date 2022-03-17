/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 17:40:36 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-17 17:00:27
 */

import styled from 'styled-components';

import useShadow from '@utils/use-shadow';


/**
 * 页面最外层标签.
 */
export const Page = styled.div<{ darkMode: boolean }>(({ darkMode }) => ({
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  backgroundColor: darkMode ? '#161c1d' : '#deedf8'
}));

/**
 * 顶部导航栏.
 */
export const PageHeader = styled.nav<{ darkMode: boolean }>(({ darkMode }) => ({
  margin: '0 4vw 1vw',
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  ...useShadow({
    shape: 'convex',
    size: 0.8,
    distance: 0.3,
    darkMode
  }),
  borderRadius: '14px',
  fontSize: '1.12rem',
  lineHeight: '1.2em',
  minHeight: 'initial',
  height: '1.6em',
  padding: '0.2em 1em',
  color: darkMode ? '#e2f1f3' : '#1c1e21',
  transition: 'background-color 200ms',
  userSelect: 'none'
}));

/**
 * 页面主要内容.
 */
export const PageBody = styled.main<{ darkMode: boolean }>(({ darkMode }) => ({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  color: darkMode ? '#e0e0e0' : '#202020',
  transition: 'background-color 200ms',
  overflow: 'hidden scroll'
}));

export const ANI_HIDE_MS = 200;

export const PageShowAnimation = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 999;
  pointer-events: none;
  animation: page-show ${ANI_HIDE_MS}ms forwards;

  @keyframes page-show {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

export const PageHideAnimation = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  z-index: 999;
  animation: page-hide ${ANI_HIDE_MS}ms forwards;

  @keyframes page-hide {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
