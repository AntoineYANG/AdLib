/*
 * @Author: Kanata You 
 * @Date: 2022-05-02 17:12:47 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-02 17:22:34
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'react-lottie';
import { useTranslation } from 'react-i18next';

import lottieBack from './back.json';


export interface BackButtonProps {
  shouldNavigate?: () => Promise<boolean>;
}

const BackButton: React.FC<BackButtonProps> = React.memo(function BackButton ({
  shouldNavigate = async () => true
}) {
  const { t } = useTranslation();
  const label = t('back');

  const dirtyRef = React.useRef(false);

  const [active, setActive] = React.useState(false);
  
  return (
    <Link
      to="/"
      onClick={e => {
        e.preventDefault();

        if (dirtyRef.current) {
          return;
        }

        dirtyRef.current = true;

        shouldNavigate().then(ok => {
          dirtyRef.current = false;
          
          if (ok) {
            window.history.go(-1);
          }
        })
      }}
      style={{
        marginInline: '8px',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        outline: 'none'
      }}
      onDragStart={e => e.preventDefault()}
      onMouseOver={() => setActive(true)}
      onMouseOut={() => setActive(false)}
      role="link"
      aria-label={label}
      title={label}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 8,
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          boxShadow: '0 2px 4px 2px #0004',
          overflow: 'hidden',
          backgroundColor: '#fffe',
          marginBlockEnd: '-6px'
        }}
      >
        {/* @ts-ignore */}
        <Lottie
          options={{
            loop: 0,
            animationData: lottieBack,
          }}
          width={160}
          height={160}
          isStopped={!active}
          style={{
            transform: 'translate(-37%, -37%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <label
        style={{
          position: 'relative',
          zIndex: 9,
          color: '#ffb300',
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 600,
          textShadow: '0 0.5px 3px #000c',
          textTransform: 'uppercase',
          userSelect: 'none',
          cursor: 'pointer'
        }}
      >
        {label}
      </label>
    </Link>
  );
});

export default BackButton;
