/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 17:54:04 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-16 19:30:41
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import PreferenceContext from '@context/preference';
import useShadow from '@utils/use-shadow';


const Container = styled.section(() => ({
  margin: 0,
  // 抵消滚动条影响
  padding: '1vw calc(4vw - 12px) 1vw 4vw',
  flexGrow: 1,
  flexShrink: 0,
  display: 'flex',
  overflow: 'hidden',
  // 抵消滚动条影响
  transform: 'translateX(4px)'
}));

/**
 * @see https://neumorphism.io/
 */
const CardListContainer = styled.div<{ darkMode: boolean }>(({ darkMode }) => ({
  flexGrow: 1,
  flexShrink: 1,
  padding: '30px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  color: darkMode ? '#d6d6d6' : '#202020',
  backgroundColor: darkMode ? '#101314' : '#e8f1fc',
  ...useShadow({ darkMode })
}));

const Card = styled.article<{
  darkMode: boolean;
  active?: boolean;
}>((
  { darkMode, active = false }
) => ({
  padding: '0.5em',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  fontFamily: '"Microsoft Yahei", "微软雅黑", Menlo, Consolas, monospace',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  lineHeight: 1.2,
  whiteSpace: 'pre-wrap',
  backgroundColor: darkMode ? '#0c0e0e' : '#f0f7ff',
  ...useShadow({
    shape: active ? 'pressed' : 'convex',
    size: 0.8,
    distance: 0.3,
    darkMode
  })
}));

const CardImg = styled.div<{ darkMode: boolean, _src: string }>(({ darkMode, _src }) => ({
  width: '14vmax',
  height: '10vmax',
  margin: '1vmax 2.2vmax',
  backgroundImage: `url(${_src})`,
  backgroundAttachment: 'local',
  backgroundSize: 'auto 200%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '46% 30%',
  filter: darkMode ? 'saturate(240%) contrast(180%) brightness(50%)' : undefined,
  transition: 'filter 200ms',
  userSelect: 'none',
  pointerEvents: 'none'
}));

const CardTitle = styled.header<{ darkMode: boolean }>(({ darkMode }) => ({
  margin: '0.5em 0 0',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: darkMode ? '#bdeef5' : '#1c1e21',
  transition: 'color 200ms',
  userSelect: 'none',
  pointerEvents: 'none'
}));

const CardDesc = styled.p<{ darkMode: boolean }>(({ darkMode }) => ({
  margin: '0.8em 1.2em 1.8em',
  width: '16vmax',
  fontWeight: 500,
  lineHeight: 1.5,
  color: darkMode ? '#8bb5bb' : '#41474e',
  transition: 'color 200ms',
  userSelect: 'none',
  pointerEvents: 'none'
}));

export interface CardProps {
  pic: string;
  name: string;
  path: string;
  desc: string;
}

/**
 * 组件：卡片.
 * 用作应用跳转.
 */
const AppCard = React.memo<CardProps>(({ pic, name, path, desc }) => {
  const { colorScheme } = PreferenceContext.useContext();
  const [hovering, setHovering] = React.useState(false);

  return (
    <Link
      to={path}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      style={{
        flexGrow: 0,
        flexShrink: 0,
        margin: '1em',
        textDecoration: 'none'
      }}
      onDragStart={e => e.preventDefault()}
      role="link"
      aria-label={name}
      aria-description={desc}
    >
      <Card
        darkMode={colorScheme === 'dark'}
        active={hovering}
      >
        <CardImg
          role="presentation"
          aria-hidden
          _src={pic}
          darkMode={colorScheme === 'dark'}
        />
        <CardTitle
          darkMode={colorScheme === 'dark'}
        >
          {name}
        </CardTitle>
        <CardDesc
          darkMode={colorScheme === 'dark'}
        >
          {desc}
        </CardDesc>
      </Card>
    </Link>
  );
});

export interface CardListProps {
  cards: CardProps[];
}

/**
 * 组件：卡片列表.
 * 配置应用跳转卡片.
 */
const CardList = React.memo<CardListProps>(({ cards }) => {
  const { colorScheme } = PreferenceContext.useContext();

  return (
    <Container
    onDoubleClick={
      () => PreferenceContext.actions.setColorScheme(
        colorScheme === 'dark' ? 'light' : 'dark'
      )
    }>
      <CardListContainer darkMode={colorScheme === 'dark'}>
        {
          cards.map((card, i) => (
            <AppCard
              key={i}
              pic={card.pic}
              name={card.name}
              path={card.path}
              desc={card.desc}
            />
          ))
        }
      </CardListContainer>
    </Container>
  );
});


export default CardList;
