/*
 * @Author: Kanata You 
 * @Date: 2022-04-29 18:32:31 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-24 21:45:28
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Lottie from 'react-lottie';
import { useTranslation } from 'react-i18next';


const CardButtonElement = styled.article({
  padding: '0.6rem 0.8rem',
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
      boxShadow: '2px 4px 4px 2px #0008',
    },
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ecf3fb',
    boxShadow: '3px 4px 6px 4px #4448',

    '&:hover': {
      transform: 'scale(100%)',
      filter: 'contrast(105%)',
      boxShadow: '3px 4px 18px 16px #4444',
    },
  },

  transition: 'transform 200ms, background-color 200ms, filter 120ms 40ms, box-shadow 200ms',
});

const CardTitle = styled.header({
  marginBlockStart: '0.5em',
  marginBlockEnd: '0.3em',
  fontSize: '1.4rem',
  lineHeight: '1.3em',
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
  margin: '0.5em 0.6em 0.7em',
  flexGrow: 1,
  flexShrink: 1,
  fontSize: '1.1rem',
  fontWeight: 500,
  lineHeight: '1.2em',
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
const CardButton = React.memo<CardButtonProps>(function CardButton ({
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
      <CardButtonElement
        style={{
          borderRadius: '2rem',
        }}
      >
        {/* @ts-ignore */}
        <Lottie
          options={{
            animationData: lottie
          }}
          width={160}
          height={120}
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


export const CardButtonMain = React.memo<CardButtonProps>(function AppCardMain ({
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
        position: 'absolute',
        top: 0,
        left: 0,
        textDecoration: 'none',
        outline: 'none',
        width: '-webkit-fill-available',
        height: '-webkit-fill-available',
      }}
      onDragStart={e => e.preventDefault()}
      role="link"
      aria-label={label}
    >
      <CardButtonElement
        style={{
          height: '100%',
        }}
      >
        {/* @ts-ignore */}
        <Lottie
          options={{
            animationData: lottie
          }}
          width={360}
          height={240}
          isStopped={!active}
          style={{
            pointerEvents: 'none',
            marginInline: 'auto',
            marginBlockStart: '40%',
          }}
        />
        <CardTitle>
          {t(`card.${label}.label`)}
        </CardTitle>
        <CardDesc
          style={{
            flexGrow: 0,
            marginBlockEnd: '12%',
          }}
        >
          {t(`card.${label}.desc`)}
        </CardDesc>
      </CardButtonElement>
    </Link>
  );
});
