/*
 * @Author: Kanata You 
 * @Date: 2022-05-10 00:31:40 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-10 03:11:04
 */

import React from 'react';
import styled from 'styled-components';
import Lottie from 'react-lottie';

import type { TrainLog } from '@views/train-page/done';

import lottie from './trophy.json';


const TrainResultView = styled.div({
  display: 'flex',
  flexDirection: 'row',

  '> *': {
    flexGrow: 0,
    flexShrink: 0,
  },

  '> svg': {
    width: '300px',
    height: '300px',
  },
});

export interface TrainResultData {
  /** 语速 */
  speed: number;
  /** 词汇量 */
  vocab: number;
  /** 丰富度 */
  variety: number;
  /** 发音 */
  pronounce: number;
  /** 任务达成 */
  mission: number;
}

const LEVEL = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS'];
const COLOR = [
  'rgb(180,180,180)',
  'rgb(225,225,225)',
  'rgb(92,150,138)',
  'rgb(48,197,152)',
  'rgb(187,98,203)',
  'rgb(238,100,81)',
  'rgb(255,201,31)',
  'rgb(249,177,33)'
];
const GRADE = [10, 30, 50, 60, 80, 90, 95, 100];

const getLevel = (val: number): string => {
  let idx = 0;

  while (val > GRADE[idx]!) {
    idx += 1;
  }

  return LEVEL[idx] ?? 'SS';
};

const getColor = (val: number): string => {
  let idx = 0;

  while (val > GRADE[idx]!) {
    idx += 1;
  }

  return COLOR[idx] ?? 'rgb(249,177,33)';
};

const interpolate = (grades: [
  number, // F  =10
  number, // E  =30
  number, // D  =50
  number, // C  =60
  number, // B  =80
  number, // A  =90
  number, // S  =95
  number, // MAX=100
], value: number): number => {
  if (value <= grades[0]) {
    return 10;
  } else if (value >= grades[7]) {
    return 100;
  }

  const idx = grades.findIndex(e => e > value);

  const low = GRADE[idx - 1]!;
  const high = GRADE[idx]!;

  const span = grades[idx]! - grades[idx - 1]!;
  const val = value - grades[idx - 1]!;

  return low + (high - low) * val / span;
};

const analyse = (log: TrainLog): TrainResultData => {
  const minute = log.analysis.duration / 1000 / 60;

  const wordsPerMinute = log.analysis.words / minute;
  const variety = log.analysis.vocab / log.analysis.words;

  return {
    speed: interpolate([
      10, 12, 14, 16, 18, 20, 25, 30
    ], wordsPerMinute),
    vocab: interpolate([
      10, 12, 14, 16, 18, 20, 25, 30
    ], log.analysis.vocab / Math.max(1, Math.sqrt(minute))),
    variety: interpolate([
      0.2, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75
    ], Number.isNaN(variety) ? 0.3 : variety),
    pronounce: interpolate([
      0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9
    ], log.analysis.accuracy),
    mission: interpolate([
      0, 0.1, 0.5, 0.6, 0.7, 0.8, 0.85, 0.95
    ], log.analysis.mission ? log.analysis.completed / log.analysis.mission : 0.3),
  };
};

const RADIUS = 32;

const f = (idx: number, val: number) => {
  const x = 50 + Math.sin(idx / 5 * Math.PI * 2) * val / 100 * RADIUS;
  const y = 50 - Math.cos(idx / 5 * Math.PI * 2) * val / 100 * RADIUS;

  return { x, y };
};

const TrainResult: React.FC<{ result: TrainLog | undefined }> = React.memo(function TrainResult ({
  result,
}) {
  const d = React.useMemo(() => {
    if (!result) {
      return null;
    }

    const val = analyse(result);
    console.log({result, val});

    let shape = '';

    const text: ({
      label: string;
      x: number;
      y: number;
      level: string;
      color: string;
    })[] = [];

    Object.entries(val).forEach(([k, v], i) => {
      const { x, y } = f(i, v);

      shape += `${i ? ' L' : 'M'}${x},${y}`;

      const { x: tx, y: ty } = f(i, 124);

      text.push({
        label: k,
        x: tx,
        y: ty,
        level: getLevel(v),
        color: getColor(v),
      });
    });

    return {
      shape: shape + ' Z',
      text,
    };
  }, [result]);
  
  if (!result || !d) {
    return null;
  }
  
  return (
    <TrainResultView>
      <svg viewBox="0 0 100 100">
        <path
          d={
            new Array(5).fill(0).map((_, t) => f(t, 100)).map(
              ({ x, y }, j) => `${j ? 'L' : 'M'}${x},${y}`
            ).join(' ') + 'Z'
          }
          style={{
            fill: '#4444',
            stroke: '#666',
            strokeWidth: '0.5px',
          }}
        />
        {
          GRADE.map((g, i) => (
            <path
              key={`grade-${i}`}
              d={
                new Array(5).fill(0).map((_, t) => f(t, g)).map(
                  ({ x, y }, j) => `${j ? 'L' : 'M'}${x},${y}`
                ).join(' ') + 'Z'
              }
              style={{
                fill: 'none',
                stroke: '#6668',
                strokeWidth: '0.25px',
              }}
            />
          ))
        }
        {
          new Array(5).fill(0).map((_, i) => (
            <line
              key={`line-${i}`}
              x1={50}
              y1={50}
              {...(() => {
                const { x, y } = f(i, 100);

                return {
                  x2: x,
                  y2: y,
                };
              })()}
              style={{
                fill: 'none',
                stroke: '#6668',
                strokeWidth: '0.3px',
              }}
            />
          ))
        }
        <path
          d={d.shape}
          style={{
            fill: 'rgba(255, 223, 102, 0.8)',
            stroke: 'rgb(255, 201, 31)',
            strokeWidth: '0.6px',
          }}
        />
        {
          d.text.map((e, i) => (
            <text
              key={`level-${i}`}
              x={e.x}
              y={e.y}
              textAnchor="middle"
              style={{
                letterSpacing: '-1.5px',
                fill: e.color,
                stroke: '#444',
                strokeWidth: '0.2px',
                fontSize: '10px',
                lineHeight: '10px',
                userSelect: 'none',
                fontWeight: 550,
              }}
            >
              {e.level}
            </text>
          ))
        }
        {
          d.text.map((e, i) => (
            <text
              key={`label-${i}`}
              x={e.x}
              y={e.y + 8}
              textAnchor="middle"
              style={{
                fill: e.color,
                stroke: '#444',
                strokeWidth: '0.2px',
                fontSize: '6px',
                lineHeight: '6px',
                letterSpacing: '-0.02em',
                userSelect: 'none',
              }}
            >
              {e.label}
            </text>
          ))
        }
      </svg>
      {/* @ts-ignore */}
      <Lottie
        options={{
          loop: 0,
          animationData: lottie,
        }}
        ariaRole="presentation"
        width={300}
        height={300}
        isClickToPauseDisabled
        ref={e => {
          const rect = (e as { el?: HTMLDivElement })?.el?.querySelector('g > rect') as SVGRectElement;

          if (rect) {
            rect.style.fill = 'none';
          }
        }}
      />
    </TrainResultView>
  );
});

export default TrainResult;
