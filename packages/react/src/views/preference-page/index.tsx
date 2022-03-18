/*
 * @Author: Kanata You 
 * @Date: 2022-03-18 22:48:10 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-19 00:17:36
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
import FormView from '@components/form-view';


interface IPreferencePageContext extends Record<string, any> {
  /** 页面交互是否响应 */
  interactive: boolean;
  /** 重定向链接 */
  redirecting: null | string;
}

const defaultContext: IPreferencePageContext = {
  interactive: true,
  redirecting: null
};

/**
 * 页面上下文.
 */
export const PreferencePageContext = createContext({
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
 * 页面：偏好设置.
 * 提供系统参数修改表单.
 */
const PreferencePage: React.FC = React.memo(function PreferencePage () {
  const { colorScheme } = PreferenceContext.useContext();
  const { redirecting } = PreferencePageContext.useContext();
  const darkMode = colorScheme === 'dark';

  const [isInit, setInit] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setInit(false);
    }, ANI_HIDE_MS);
    
    return () => {
      PreferencePageContext.actions.reset();
    };
  }, []);

  return (
    <Page darkMode={darkMode}>
      <PageHeader darkMode={darkMode} />
      <PageBody darkMode={darkMode}>
        <FormView />
      </PageBody>
      {isInit && (<PageShowAnimation />)}
      {redirecting && (<PageHideAnimation />)}
    </Page>
  );
});


export default PreferencePage;
