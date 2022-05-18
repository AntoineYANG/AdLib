/*
 * @Author: Kanata You 
 * @Date: 2022-05-02 16:08:36 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-05 12:08:23
 */

import React from 'react';
import styled from 'styled-components';

import ButtonGroups from '@components/button-groups';
import HomeButton from '@components/home-button';
import BackButton from '@components/back-button';
import PhotoMasonry, { PhotoMasonryHandler } from '@components/photo-masonry';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


const IdeaPageElement = styled.div({
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

const PicList = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginInline: '8px',
  paddingBlock: '20px',
  paddingInline: '16px',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-around',
  overflow: 'hidden scroll',
});

const MasonryHeader = styled.header({
  flexGrow: 0,
  flexShrink: 0,
  paddingBlock: '16px',
  paddingInline: '36px',
  fontSize: '1.2rem',
  fontWeight: 550,
});

const MasonryFooter = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  paddingBlockStart: '20px',
  paddingBlockEnd: '32px',
  paddingInline: '36px',
  fontSize: '1.2rem',
  fontWeight: 550,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
});

const Button = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  lineHeight: '1.6em',
  marginBlock: '0.2em',
  marginInline: '4px',
  paddingBlock: '0.4em',
  paddingInline: '24px',
  borderRadius: '0.25em',
  backgroundColor: '#ffb300',
  border: '1px solid #666',
  boxShadow: '0 2px 2px #0006',
  backgroundImage: 'linear-gradient(45deg, #0003, transparent 60%, #fff2)',
  color: '#eee',
  userSelect: 'none',
  cursor: 'pointer',

  ':hover': {
    marginBlock: '0',
    marginInline: '0',
    paddingBlock: '0.6em',
    paddingInline: '28px',
  },

  transition: 'margin 200ms, padding 200ms',
});

const IdeaPage: React.FC = React.memo(function IdeaPage () {
  const photoFormRef = React.useRef<PhotoMasonryHandler>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <IdeaPageElement>
      <ButtonGroups>
        <HomeButton />
        <BackButton />
      </ButtonGroups>
      <MasonryHeader>
        {t('choose_photo')}
      </MasonryHeader>
      <PicList>
        <PhotoMasonry
          handler={photoFormRef}
        />
      </PicList>
      <MasonryFooter>
        <Button
          style={{
            backgroundColor: '#ddd',
            color: '#666',
          }}
          onClick={
            () => {
              photoFormRef.current?.reset();
            }
          }
        >
          {t('button.reset')}
        </Button>
        <Button
          onClick={
            () => {
              const photos = photoFormRef.current?.getSelected();

              if (!photos?.length) {
                alert(t('alert.no_photo_selected'));
              } else {
                navigate(`/train?photos=${photos.map(escape).join(',')}`);
              }
            }
          }
        >
          {t('button.start')}
        </Button>
      </MasonryFooter>
    </IdeaPageElement>
  );
});


export default IdeaPage;
