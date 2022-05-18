/*
 * @Author: Kanata You 
 * @Date: 2022-04-29 18:32:31 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-04 18:02:34
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Lottie from 'react-lottie';
import { useTranslation } from 'react-i18next';


const CardButtonElement = styled.article({
  padding: '1rem 1.2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'space-around',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  lineHeight: 1.2,
  whiteSpace: 'pre-wrap',
  transform: 'scale(85%)',

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#131515',

    '&:hover': {
      transform: 'scale(100%)',
      filter: 'contrast(90%)',
      boxShadow: '3px 5px 4px 2px #0008',
    },
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ecf3fb',
      boxShadow: '4px 5px 6px 4px #4448',

    '&:hover': {
      transform: 'scale(100%)',
      filter: 'contrast(105%)',
      boxShadow: '4px 5px 18px 16px #4444',
    },
  },

  transition: 'transform 200ms, background-color 200ms, filter 120ms 40ms, box-shadow 200ms',
});

const CardTitle = styled.header({
  marginBlockStart: '1em',
  marginBlockEnd: '0.7em',
  fontSize: '1.4rem',
  lineHeight: '1.6em',
  fontWeight: 600,
  textAlign: 'center',
  userSelect: 'none',
  pointerEvents: 'none',

  '@media (prefers-color-scheme: dark)': {
    color: '#bdeef5',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#1c1e21',
  },
});

const CardDesc = styled.p({
  margin: '1em 0.8em 1.2em',
  flexGrow: 1,
  flexShrink: 1,
  fontSize: '1.1rem',
  fontWeight: 500,
  lineHeight: '1.5em',
  transition: 'color 200ms',
  userSelect: 'none',
  pointerEvents: 'none',
  textAlign: 'center',

  '@media (prefers-color-scheme: dark)': {
    color: '#8bb5bb',
  },
  '@media (prefers-color-scheme: light)': {
    color: '#41474e',
  },
});

export interface CardButtonProps {
  lottie: any;
  label: string;
  path: string;
}

/**
 * 组件：卡片.
 * 用作应用跳转.
 */
const CardButton = React.memo<CardButtonProps>(function AppCard ({
  lottie, label, path
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [active, setActive] = React.useState(false);

  return (
    <Link
      to={path}
      onClick={e => {
        e.preventDefault();
        navigate(`${path}`);
      }}
      onMouseOver={() => setActive(true)}
      onMouseOut={() => setActive(false)}
      style={{
        textDecoration: 'none',
        outline: 'none'
      }}
      onDragStart={e => e.preventDefault()}
      role="link"
      aria-label={label}
    >
      <CardButtonElement>
        {/* @ts-ignore */}
        <Lottie
          options={{
            animationData: lottie
          }}
          width={240}
          height={160}
          isStopped={!active}
          style={{
            pointerEvents: 'none',
          }}
        />
        <CardTitle>
          {t(`card.${label}.label`)}
        </CardTitle>
        <CardDesc>
          {t(`card.${label}.desc`)}
        </CardDesc>
      </CardButtonElement>
    </Link>
  );
});

export default CardButton;
