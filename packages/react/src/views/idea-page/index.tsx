/*
 * @Author: Kanata You 
 * @Date: 2022-03-17 17:56:51 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-17 17:57:40
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
import CardList from '@components/card-list';
import PreferenceContext from '@context/preference';

import iconStart from '@public/images/icon_start.png';
import iconStartDark from '@public/images/icon_start_dark.png';
import iconLog from '@public/images/icon_log.png';
import iconLogDark from '@public/images/icon_log_dark.png';
import iconPref from '@public/images/icon_preference.png';
import iconPrefDark from '@public/images/icon_preference_dark.png';
import { createContext } from '@context/hibou/core';


interface IHomepageContext extends Record<string, any> {
  /** 页面交互是否响应 */
  interactive: boolean;
  /** 重定向链接 */
  redirecting: null | string;
}

const defaultContext: IHomepageContext = {
  interactive: true,
  redirecting: null
};

/**
 * 页面上下文.
 */
export const HomepageContext = createContext({
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
 * 页面：首页.
 * 提供跳转练习页的能力.
 */
const Homepage: React.FC = React.memo(() => {
  const { colorScheme } = PreferenceContext.useContext();
  const { redirecting } = HomepageContext.useContext();
  const darkMode = colorScheme === 'dark';

  const [isInit, setInit] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => {
      setInit(false);
    }, ANI_HIDE_MS);
    
    return () => {
      HomepageContext.actions.reset();
    };
  }, []);

  return (
    <Page darkMode={darkMode}>
      <PageHeader darkMode={darkMode}>
        ad-lib IDEA
      </PageHeader>
      <PageBody darkMode={darkMode}>
        <CardList
          cards={[{
            picSrcDark: iconStartDark,
            picSrcLight: iconStart,
            name: '开始',
            path: 'idea',
            desc: '开始一次练习。\n探索一个话题，并进行你的演讲。'
          }, {
            picSrcDark: iconLogDark,
            picSrcLight: iconLog,
            name: '日志',
            path: 'logs',
            desc: 'AdLib 记录了你在这台设备上进行过的所有练习。点击以查看你的练习日志。'
          }, {
            picSrcDark: iconPrefDark,
            picSrcLight: iconPref,
            name: '偏好设置',
            path: 'test',
            desc: '编辑你的自定义选项。'
          }]}
        />
      </PageBody>
      {isInit && (<PageShowAnimation />)}
      {redirecting && (<PageHideAnimation />)}
    </Page>
  );
});


export default Homepage;
