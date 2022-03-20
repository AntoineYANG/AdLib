/*
 * @Author: Kanata You 
 * @Date: 2022-03-17 17:56:51 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-20 21:07:38
 */

import React from 'react';

import {
  ANI_HIDE_MS,
  Page,
  PageBody,
  PageHeader,
  PageShowAnimation,
  PageHideAnimation
} from '@components/structure';
import PreferenceContext from '@context/preference';

import { createContext } from '@context/hibou/core';
import AudioInputReceiver from '@utils/audio-input';


interface IIdeaPageContext extends Record<string, any> {
  /** 页面交互是否响应 */
  interactive: boolean;
  /** 重定向链接 */
  redirecting: null | string;
}

const defaultContext: IIdeaPageContext = {
  interactive: true,
  redirecting: null
};

/**
 * 页面上下文.
 */
export const IdeaPageContext = createContext({
  init: defaultContext, 
  actions: {
    /**
     * 跳转至链接.
     */
    openPath: (_, path: string) => {
      return {
        interactive: false,
        redirecting: path
      };
    },
    reset: () => ({
      ...defaultContext
    })
  }
});


/**
 * 页面：灵感页.
 * 选择本次练习的话题，然后承接练习页.
 */
const IdeaPage: React.FC = React.memo(function IdeaPage () {
  const { colorScheme } = PreferenceContext.useContext();
  const { redirecting } = IdeaPageContext.useContext();
  const darkMode = colorScheme === 'dark';

  const [isInit, setInit] = React.useState(true);
  
  const airRef = React.useRef<AudioInputReceiver>();

  React.useEffect(() => {
    airRef.current = airRef.current ?? new AudioInputReceiver({
      onLoad(this) {
        this.start();
        this.useStream(
          '/audio-upload',
          'all'
        );

        setTimeout(() => {
          this.stop();
          this.closeStream();
          this.close();
        }, 4000); // FIXME:
      }
    });
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      setInit(false);
    }, ANI_HIDE_MS);
    
    return () => {
      IdeaPageContext.actions.reset();
    };
  }, []);

  return (
    <Page darkMode={darkMode}>
      <PageHeader
        darkMode={darkMode}
        pageName="idea"
      />
      <PageBody
        darkMode={darkMode}
        onDoubleClick={() => airRef.current?.close()}
      >
      </PageBody>
      {isInit && (<PageShowAnimation />)}
      {redirecting && (<PageHideAnimation />)}
    </Page>
  );
});


export default IdeaPage;
