/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 17:40:36 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-16 00:12:37
 */

import styled from 'styled-components';


/**
 * 页面最外层标签.
 */
export const Page = styled.div<{}>(() => ({
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'space-between'
}));

/**
 * 页面主要内容.
 */
export const PageBody = styled.main<{ darkMode: boolean }>(({ darkMode }) => ({
  flexGrow: 1,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  backgroundColor: darkMode ? '#161c1d' : '#deedf8',
  color: darkMode ? '#e0e0e0' : '#202020',
  transition: 'background-color 200ms'
}));
