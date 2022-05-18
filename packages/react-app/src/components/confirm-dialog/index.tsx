/*
 * @Author: Kanata You 
 * @Date: 2022-05-09 23:55:16 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-10 00:28:15
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';


const Modal = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
  zIndex: 1023,
});

const Dialog = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  border: '1px solid',
  paddingBlock: '6px',
  paddingInline: '48px',
  backdropFilter: 'blur(16px)',
  width: '20vw',

  '> div': {
    paddingBlock: '1.5em',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-around',
  },
});

const Button = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  lineHeight: '1.6em',
  marginBlock: '0.4em',
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
    marginBlock: '0.2em',
    marginInline: '0',
    paddingBlock: '0.6em',
    paddingInline: '28px',
  },

  transition: 'margin 200ms, padding 200ms',
});

export interface ConfirmDialogProps {
  desc: string;
  highlight: 'yes' | 'no';
  handler: (confirmed: boolean) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(function ConfirmDialog ({
  desc,
  highlight,
  handler,
}) {
  const { t } = useTranslation();
  
  return (
    <Modal>
      <Dialog role="dialog">
        <div>
          {t(desc)}
        </div>
        <div>
          <Button
            style={highlight === 'yes' ? undefined : {
              backgroundColor: '#ddd',
              color: '#666',
            }}
            onClick={
              () => {
                handler(true);
              }
            }
          >
            {t('button.yes')}
          </Button>
          <Button
            style={highlight === 'no' ? undefined : {
              backgroundColor: '#ddd',
              color: '#666',
            }}
            onClick={
              () => {
                handler(false);
              }
            }
          >
            {t('button.no')}
          </Button>
        </div>
      </Dialog>
    </Modal>
  );
});


export default ConfirmDialog;
