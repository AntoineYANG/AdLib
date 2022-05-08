/*
 * @Author: Kanata You 
 * @Date: 2022-05-02 16:08:36 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-08 16:51:29
 */

import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ButtonGroups from '@components/button-groups';
import HomeButton from '@components/home-button';
import BackButton from '@components/back-button';


const ConfigPageElement = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginBlock: '0',
  marginInline: '20vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  overflow: 'hidden',

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#0d0d0d',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#fdfdfdcc',
    boxShadow: '4px 4px 1px #0008',
  },
});

const List = styled.section({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  paddingBlock: '4vh',
  paddingInline: '10%',
  fontSize: '1.1rem',
  lineHeight: '2em',
});

const ListRow = styled.article({
  flexGrow: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
  justifyContent: 'space-around',
  marginBlock: '10px',
});

const ListCell = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  paddingInline: '12px',

  '> header': {
    textAlign: 'center',
    fontWeight: 550,
  },

  '> label': {
    marginBlock: '0.3em',
    paddingInline: '20px',
  },

  '@media (prefers-color-scheme: dark)': {
    color: '#eee',
  },

  '@media (prefers-color-scheme: light)': {
    color: '#161819',
  },

  transition: 'color 200ms',
});

const Button = styled.div<{ disabled: boolean }>(({ disabled }) => ({
  flexGrow: 0,
  flexShrink: 0,
  maxWidth: '50%',
  lineHeight: '1.6em',
  marginBlock: '0.2em',
  marginInline: '4px',
  paddingBlock: '0.4em',
  paddingInline: '24px',
  borderRadius: '0.25em',
  backgroundColor: disabled ? '#ddd'/*'#ffb300'*/ : 'rgb(174,255,122)',
  border: '1px solid',
  boxShadow: '0 2px 2px #0006',
  backgroundImage: 'linear-gradient(45deg, #0003, transparent 60%, #fff2)',
  color: '#444',
  userSelect: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  textAlign: 'center',
  opacity: disabled ? 0.5 : 1,

  ':hover': disabled ? {} : {
    marginBlock: '0.2em',
    marginInline: '2px',
    paddingBlock: '0.4em',
    paddingInline: '26px',
  },

  transition: 'margin 200ms, padding 200ms',
}));

const sizeFlags = [
  'B',
  'KB',
  'MB',
  'GB',
];

const formatSize = (size: number): string => {
  let num = size;
  let flag = sizeFlags[0];

  for (const _flag of sizeFlags.slice(1)) {
    if (num >= 1024) {
      num /= 1024;
      flag = _flag;
    } else {
      break;
    }
  }

  return `${num.toFixed(2).replace(/\.0+$/, '')}${flag}`;
};

const ConfigPage: React.FC = React.memo(function ConfigPage () {
  const { t } = useTranslation();

  const [cacheSize, setCacheSize] = React.useState(NaN);

  const getCacheSize = React.useMemo(() => {
    let isFetching = false;

    return () => {
      if (isFetching) {
        return;
      }

      isFetching = true;
      cache.size().then(setCacheSize).finally(
        () => isFetching = false
      );
    };
  }, [setCacheSize]);

  React.useEffect(() => {
    getCacheSize();
  }, []);

  const clearCache = React.useMemo(() => {
    let isRunning = false;

    return () => {
      if (isRunning || Number.isNaN(cacheSize) || cacheSize === 0) {
        return;
      }

      setCacheSize(NaN);

      isRunning = true;
      cache.clear().finally(() => {
        getCacheSize();
        isRunning = false;
      });
    };
  }, [cacheSize, setCacheSize, getCacheSize]);

  return (
    <ConfigPageElement>
      <ButtonGroups>
        <HomeButton />
        <BackButton />
      </ButtonGroups>
      <List>
        <ListRow>
          <ListCell>
            <header>
              {t('configs.cache')}
            </header>
          </ListCell>
          <ListCell>
            <label>
              {Number.isNaN(cacheSize) ? t('calculating') : formatSize(cacheSize)}
            </label>
            <Button 
              disabled={Number.isNaN(cacheSize) || cacheSize === 0}
              onClick={clearCache}
            >
              {t('button.clear')}
            </Button>
          </ListCell>
        </ListRow>
        {/* <ListRow>
          <Button
            onClick={
              () => {
              }
            }
          >
            {t('button.start')}
          </Button>
        </ListRow> */}
      </List>
    </ConfigPageElement>
  );
});


export default ConfigPage;
