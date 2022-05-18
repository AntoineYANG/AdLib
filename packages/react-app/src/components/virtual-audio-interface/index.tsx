/*
 * @Author: Kanata You 
 * @Date: 2022-05-05 15:28:34 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-08 19:43:40
 */

import React from 'react';
import styled from 'styled-components';

import type { AudioInterface, AudioRealTimeData } from '@utils/use_microphone';
import { useTranslation } from 'react-i18next';


const Box = styled.div({
  transform: 'scale(1.15)',
  flexGrow: 0,
  flexShrink: 0,
  position: 'relative',
  marginBlock: '20px',
  marginInline: '30px',
  minWidth: '280px',
  minHeight: '84px',
  maxHeight: '200px',
  paddingBlockStart: '8px',
  paddingBlockEnd: '10px',
  paddingInline: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  border: '4px solid rgb(95,25,143)',
  borderRadius: '8px',
  backgroundColor: '#101010',
});

const TitleWithTips = styled.text({
  userSelect: 'none',
  cursor: 'help',
  pointerEvents: 'all !important' as unknown as 'all',

  '& + g': {
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 400ms',

    '& *': {
      userSelect: 'none',
      fill: 'rgb(250, 220, 25)',
      textShadow: '0 0 2px #000',
    },
  },

  '&:hover + g': {
    opacity: 1,
  },
});

const Tips: React.FC<{ children: string }> = React.memo(function Tips({ children }) {
  return (
    <g>
      <text dy="22">
        {children}
      </text>
    </g>
  );
});

const Shape = styled.svg({
  flexGrow: 0,
  flexShrink: 0,
  width: '64px',
  height: '90px',
  marginInline: '8px',
  overflow: 'visible',

  '& text': {
    fontSize: '1.2rem',
    lineHeight: '1.4em',
    fill: '#eeea',
    fontWeight: 550,
    pointerEvents: 'none',
    userSelect: 'none',
  },

  '& path': {
    fill: '#eeea',
    stroke: 'none',
  },
});

const InputShape: React.FC<{ connected: boolean }> = React.memo(function InputShape ({
  connected
}) {
  const { t } = useTranslation();
  
  return (
    <Shape viewBox="0 0 100 100">
      <path
        d="
          M12,50 A38,38,0,1,0,88,50 A38,38,0,1,0,12,50
          M38,18.4 A33,33,0,1,0,62,18.4
        "
        style={{
          fill: '#060607',
          stroke: '#464641',
          strokeWidth: '1.8px',
        }}
      />
      <path
        d="M33,19 A35,35,0,1,0,67,19"
        style={{
          fill: 'none',
          stroke: '#626065',
          strokeWidth: '4px',
          pointerEvents: 'none',
        }}
      />
      <path
        d="
          M42,27 A23.5,23.5,0,1,0,58,27 L57.5,29 H41.5 Z
          M31,31 A1.5,1.5,0,1,0,34,34 A1.5,1.5,0,1,0,31,31
        "
        style={{
          fill: '#545258',
          stroke: 'none',
          pointerEvents: 'none',
        }}
      />
      <path
        d="
          M41.5,50 A8.5,8.5,0,1,0,58.5,50 A8.5,8.5,0,1,0,41.5,50
          M43.2,50 A4,4,0,1,0,35.2,50 A4,4,0,1,0,43.2,50
          M56.8,50 A4,4,0,1,0,64.8,50 A4,4,0,1,0,56.8,50
          M50,56.8 A4,4,0,1,0,50,64.8 A4,4,0,1,0,50,56.8
        "
        style={{
          fill: '#050506',
          stroke: 'none',
          pointerEvents: 'none',
        }}
      />
      <circle
        cx="96"
        cy="3"
        r="4"
        style={{
          stroke: '#4e4e53',
          strokeWidth: '2px',
          fill: connected ? '#2fff5a' : '#666',
          filter: 'drop-shadow(0 0 2px #000)',
          pointerEvents: 'none',
        }}
      />
      <TitleWithTips
        x={50}
        y={-2}
        textAnchor="middle"
      >
        INPUT
      </TitleWithTips>
      <Tips>
        {t(`audio-interface.input.${connected ? 'on' : 'off'}`)}
      </Tips>
    </Shape>
  );
});

const FilterShape: React.FC<{
  on: boolean;
  toggle: () => void;
}> = React.memo(function FilterShape ({
  on,
  toggle,
}) {
  const { t } = useTranslation();
  
  return (
    <Shape
      viewBox="10 0 80 100"
      style={{
        width: '48px',
        marginInline: '-20px',
      }}
    >
      <circle
        cx="50"
        cy="10"
        r="10"
        style={{
          stroke: '#2e2e33',
          strokeWidth: '6px',
          fill: on ? '#2fff5a' : '#666a',
          filter: 'drop-shadow(0 0 2px #000)',
          cursor: 'pointer',
        }}
        onClick={toggle}
      />
      <TitleWithTips
        x={50}
        y={-12}
        textAnchor="middle"
      >
        FILTER
      </TitleWithTips>
      <Tips>
        {t(`audio-interface.filter`)}
      </Tips>
    </Shape>
  );
});

const ROTATE_DEG_RANGE = 306;
const SIGN_POS = 0.01;
const GRAY: [number, number, number] = [55, 94, 62];
const GREEN_POS = 0.7;
const GREEN: [number, number, number] = [47, 255, 90];
const YELLOW_POS = 0.85;
const YELLOW: [number, number, number] = [255, 210, 100];
const RED_POS = 0.95;
const RED: [number, number, number] = [255, 6, 0];

const intersect = (
  a: [number, number, number],
  b: [number, number, number],
  v: number
) => {
  return `rgb(${
    a[0] * (1 - v) + b[0] * v
  },${
    a[1] * (1 - v) + b[1] * v
  },${
    a[2] * (1 - v) + b[2] * v
  })`;
};

const colorizeVolume = (vol: number): string => {
  if (vol < SIGN_POS) {
    return '';
  } else if (vol < GREEN_POS) {
    return intersect(GRAY, GREEN, vol / GREEN_POS);
  } else if (vol < YELLOW_POS) {
    return intersect(GREEN, YELLOW, (vol - GREEN_POS) / (YELLOW_POS - GREEN_POS));
  } else if (vol < RED_POS) {
    return intersect(YELLOW, RED, (vol - YELLOW_POS) / (RED_POS - YELLOW_POS));
  } else {
    return `rgb(${RED[0]},${RED[1]},${RED[2]})`;
  }
};

const MAX_GAIN = 2.5;

const GainKnob: React.FC<{
  value: number;
  setValue: (value: number) => void;
  control: AudioInterface;
}> = React.memo(function GainKnob ({ value, setValue, control }) {
  const { t } = useTranslation();

  const [gainMsg, setGainMsg] = React.useState<
    'no' | 'too_low' | 'ok' | 'too_high'
  >('no');

  const maxVolRef = React.useRef(0);

  React.useEffect(() => {
    maxVolRef.current = 0;
  }, [value, maxVolRef]);

  const analyserId = React.useId();
  const rotateDeg = (value / MAX_GAIN - 0.5) * ROTATE_DEG_RANGE;

  React.useEffect(() => {
    let clearColorHandler: NodeJS.Timeout | undefined = undefined;

    const cb = (data: AudioRealTimeData) => {      
      if (typeof clearColorHandler === 'number') {
        clearTimeout(clearColorHandler);
      }

      const { volume } = data;

      maxVolRef.current = Math.max(maxVolRef.current, volume);

      setGainMsg(
        maxVolRef.current < SIGN_POS ? 'no'
          : maxVolRef.current < GREEN_POS ? 'too_low'
            : maxVolRef.current < YELLOW_POS * 0.8 + RED_POS * 0.2 ? 'ok'
              : 'too_high'
      );
      
      const analyser = document.getElementById(analyserId);

      if (analyser) {
        analyser.style.fill = colorizeVolume(volume);
        clearColorHandler = setTimeout(() => {
          analyser.style.fill = '';
        }, 400);
      }
    };

    control.connectToAnalyser(cb);

    return () => {
      control.disconnectFromAnalyser(cb);
    };
  }, [control, analyserId, maxVolRef]);

  const handleMouseDown = React.useCallback((e: React.MouseEvent<SVGGElement>) => {
    const posBegin = {
      x: e.clientX,
      y: e.clientY
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons === 0) {
        document.body.removeEventListener('mousemove', handleMouseMove);
      }

      const pos = {
        x: e.clientX,
        y: e.clientY
      };

      const dist = Math.sqrt(
        Math.pow(posBegin.y - pos.y, 2) + Math.pow(pos.x - posBegin.x, 2)
      );

      if (dist < 20) {
        return;
      }

      const cos = (posBegin.y - pos.y) / dist;

      const deg = Math.max(
        -0.5 * ROTATE_DEG_RANGE,
        Math.min(
          0.5 * ROTATE_DEG_RANGE,
          Math.acos(cos) * Math.sign(pos.x - posBegin.x) / 2 / Math.PI * 360
        )
      ) + 0.5 * ROTATE_DEG_RANGE;

      const val = Math.max(
        0,
        Math.min(
          deg / ROTATE_DEG_RANGE,
          1
        )
      ) * MAX_GAIN;

      setValue(val);
    };

    document.body.addEventListener('mousemove', handleMouseMove);
  }, [setValue]);

  return (
    <Shape viewBox="0 0 100 100">
      <g
        style={{
          pointerEvents: 'none',
        }}
      >
        {
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v, i) => {
            const deg = ((v / 10 - 0.5) * ROTATE_DEG_RANGE);
            const x = 50 + Math.sin(deg / 180 * Math.PI) * 52;
            const y = 50 - Math.cos(deg / 180 * Math.PI) * 57;

            return (
              <React.Fragment key={i}>
                <path
                  d="M49,50 v-44 a1,1,0,1,1,2,0 v44 Z"
                  style={{
                    transform: `rotate(${
                      deg.toFixed(0)
                    }deg)`,
                    transformOrigin: '50% 50%',
                    pointerEvents: 'none',
                  }}
                />
                {[0, 10].includes(v) && (
                  <text
                    x={x}
                    y={y + 8}
                    textAnchor="middle"
                  >
                    {v === 0 ? '0' : `${(MAX_GAIN * 100).toFixed(0)}%`}
                  </text>
                )}
              </React.Fragment>
            );
          })
        }
        <circle
          id={analyserId}
          cx="50"
          cy="50"
          r="38.5"
          style={{
            stroke: '#4e4e5388',
            strokeWidth: '1px',
            fill: 'rgb(58,58,58)',
            filter: 'drop-shadow(0 0 2px #000)',
            transition: 'fill 80ms',
          }}
        />
      </g>
      <g
        style={{
          cursor: 'move',
          transform: `rotate(${rotateDeg.toFixed(1)}deg)`,
          transformOrigin: 'center',
          transition: 'transform 80ms',
        }}
        onMouseDown={handleMouseDown}
      >
        <circle
          cx="50"
          cy="50"
          r="31.5"
          style={{
            stroke: 'rgb(115,43,167)',
            strokeWidth: '3.2px',
            fill: '#000',
            filter: 'drop-shadow(0 0 3px #000)',
          }}
        />
        <circle
          cx="50"
          cy="50"
          r="29.5"
          style={{
            stroke: '#c6c5c818',
            strokeWidth: '8px',
            fill: '#161518',
            pointerEvents: 'none',
          }}
        />
        <path
          d="M48.1,20 v18 a1.9,1.9,0,1,0,3.8,0 v-18 Z"
          style={{
            fill: 'rgb(115,43,167)',
            stroke: 'none',
            pointerEvents: 'none',
            filter: 'brightness(1.35) drop-shadow(0 0 2px #000)',
          }}
        />
      </g>
      <TitleWithTips
        x={50}
        y={-2}
        textAnchor="middle"
      >
        GAIN
      </TitleWithTips>
      <Tips>
        {t(`audio-interface.gain.${gainMsg}`)}
      </Tips>
    </Shape>
  );
});

const MonitorKnob: React.FC<{
  value: number;
  setValue: (value: number) => void;
}> = React.memo(function MonitorKnob ({ value, setValue }) {
  const rotateDeg = (value / MAX_GAIN - 0.5) * ROTATE_DEG_RANGE;

  const handleMouseDown = React.useCallback((e: React.MouseEvent<SVGGElement>) => {
    const posBegin = {
      x: e.clientX,
      y: e.clientY
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons === 0) {
        document.body.removeEventListener('mousemove', handleMouseMove);
      }

      const pos = {
        x: e.clientX,
        y: e.clientY
      };

      const dist = Math.sqrt(
        Math.pow(posBegin.y - pos.y, 2) + Math.pow(pos.x - posBegin.x, 2)
      );

      if (dist < 20) {
        return;
      }

      const cos = (posBegin.y - pos.y) / dist;

      const deg = Math.max(
        -0.5 * ROTATE_DEG_RANGE,
        Math.min(
          0.5 * ROTATE_DEG_RANGE,
          Math.acos(cos) * Math.sign(pos.x - posBegin.x) / 2 / Math.PI * 360
        )
      ) + 0.5 * ROTATE_DEG_RANGE;

      const val = Math.max(
        0,
        Math.min(
          deg / ROTATE_DEG_RANGE,
          1
        )
      ) * MAX_GAIN;

      setValue(val);
    };

    document.body.addEventListener('mousemove', handleMouseMove);
  }, [setValue]);

  return (
    <Shape viewBox="0 0 100 100">
      <g
        style={{
          pointerEvents: 'none',
        }}
      >
        {
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v, i) => {
            const deg = ((v / 10 - 0.5) * ROTATE_DEG_RANGE);
            const x = 50 + Math.sin(deg / 180 * Math.PI) * 52;
            const y = 50 - Math.cos(deg / 180 * Math.PI) * 57;

            return (
              <React.Fragment key={i}>
                <path
                  d="M49,50 v-44 a1,1,0,1,1,2,0 v44 Z"
                  style={{
                    transform: `rotate(${
                      deg.toFixed(0)
                    }deg)`,
                    transformOrigin: '50% 50%',
                    pointerEvents: 'none',
                  }}
                />
                {[0, 10].includes(v) && (
                  <text
                    x={x}
                    y={y + 8}
                    textAnchor="middle"
                  >
                    {v === 0 ? '0' : `${(MAX_GAIN * 100).toFixed(0)}%`}
                  </text>
                )}
              </React.Fragment>
            );
          })
        }
      </g>
      <g
        style={{
          cursor: 'move',
          transform: `rotate(${rotateDeg.toFixed(1)}deg)`,
          transformOrigin: 'center',
          transition: 'transform 80ms',
        }}
        onMouseDown={handleMouseDown}
      >
        <circle
          cx="50"
          cy="50"
          r="31.5"
          style={{
            stroke: 'rgb(115,43,167)',
            strokeWidth: '3.2px',
            fill: '#000',
            filter: 'drop-shadow(0 0 3px #000)',
          }}
        />
        <circle
          cx="50"
          cy="50"
          r="29.5"
          style={{
            stroke: '#c6c5c818',
            strokeWidth: '8px',
            fill: '#161518',
            pointerEvents: 'none',
          }}
        />
        <path
          d="M48.1,20 v18 a1.9,1.9,0,1,0,3.8,0 v-18 Z"
          style={{
            fill: 'rgb(115,43,167)',
            stroke: 'none',
            pointerEvents: 'none',
            filter: 'brightness(1.35) drop-shadow(0 0 2px #000)',
          }}
        />
      </g>
      <text
        x={50}
        y={-2}
        textAnchor="middle"
      >
        MONITOR
      </text>
    </Shape>
  );
});

const RecordingLight = styled.rect<{
  status: 'recording' | 'stopped' | 'paused';
}>(({ status }) => ({
  stroke: '#2e2e33',
  strokeWidth: '5px',
  fill: {
    recording: '#2fff5a',
    stopped: '#666a',
    paused: '#fa0',
  }[status],
  filter: 'drop-shadow(0 0 2px #000)',
  cursor: status !== 'stopped' ? 'pointer' : 'default',

  '@keyframes blink': {
    '0': {
      fill: '#2fff5a',
    },

    '50%': {
      fill: '#888c',
    }
  },

  animationName: status === 'recording' ? 'blink' : undefined,
  animationDuration: '1s',
  animationIterationCount: 'infinite',
}));

const RecorderShape: React.FC<{
  status: 'recording' | 'stopped' | 'paused';
  toggle: () => void;
  deleteRecording: () => void;
}> = React.memo(function RecorderShape ({
  status,
  toggle,
  deleteRecording,
}) {
  return (
    <Shape
      viewBox="0 0 180 100"
      style={{
        width: '120px',
        marginInlineStart: '24px',
      }}
    >
      <rect
        x={0}
        y={3}
        rx={4}
        ry={4}
        width={180}
        height={100}
        style={{
          fill: 'none',
          stroke: '#eee',
          strokeWidth: '1px',
        }}
      />
      <rect
        x={7}
        y={-7}
        width={86}
        height={18}
        style={{
          fill: '#101010',
          stroke: 'none',
        }}
      />
      <text
        x={50}
        y={8}
        textAnchor="middle"
      >
        RECORDER
      </text>
      <RecordingLight
        x="16"
        y="32"
        width="20"
        height="14"
        status={status}
        onClick={status !== 'stopped' ? toggle : undefined}
      />
      <text
        x={50}
        y={44}
      >
        PAUSE/RESUME
      </text>
      <circle
        cx="26"
        cy="78"
        r="14"
        style={{
          stroke: '#6d2e33',
          strokeWidth: '2px',
          fill: '#222',
          filter: 'drop-shadow(0 0 2px #000)',
          cursor: status !== 'stopped' ? 'pointer' : 'default',
        }}
        onClick={status !== 'stopped' ? deleteRecording : undefined}
      />
      <text
        x={50}
        y={84}
      >
        DELETE
      </text>
    </Shape>
  );
});

const VirtualAudioInterface: React.FC<{
  control: AudioInterface;
  allowRecording: boolean;
}> = React.memo(function VirtualAudioInterface ({ control, allowRecording }) {
  const [hasInput, setInput] = React.useState(control.hasInput);
  const [filter, setFilter] = React.useState(control.filterOn);
  const [gain, setGain] = React.useState(control.gain);
  const [monitorVol, setMonitorVol] = React.useState(control.monitorVolume);
  const [recording, setRecording] = React.useState(control.isRecording);

  React.useEffect(() => {
    const cb = () => {
      setInput(control.hasInput);
      setFilter(control.filterOn);
      setGain(control.gain);
      setMonitorVol(control.monitorVolume);
      setRecording(control.isRecording);
    };

    control.subscribe(cb);

    return () => {
      control.unsubscribe(cb);
    }
  }, [control]);

  const toggleRecording = React.useCallback(() => {
    if (!allowRecording) {
      return;
    }
    
    if (control.isRecording) {
      control.pauseRecording();
    } else {
      control.startRecording();
    }
  }, [control, allowRecording]);

  const deleteRecording = React.useCallback(() => {
    if (!allowRecording) {
      return;
    }

    if (control.isRecording) {
      control.pauseRecording();
    }

    control.clear();
  }, [control, allowRecording]);

  return (
    <Box>
      <InputShape
        connected={hasInput}
      />
      <FilterShape
        on={filter}
        toggle={() => control.filterOn = !filter}
      />
      <GainKnob
        control={control}
        value={gain}
        setValue={v => control.gain = v}
      />
      <MonitorKnob
        value={monitorVol}
        setValue={v => control.monitorVolume = v}
      />
      <RecorderShape
        status={allowRecording ? (recording ? 'recording' : 'paused') : 'stopped'}
        toggle={toggleRecording}
        deleteRecording={deleteRecording}
      />
    </Box>
  );
});

export default VirtualAudioInterface;
