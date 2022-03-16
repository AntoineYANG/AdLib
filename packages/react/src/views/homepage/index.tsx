/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 17:26:00 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-16 19:08:07
 */

import React from 'react';

import { Page, PageBody, PageHeader } from '@components/structure';
import CardList from '@components/card-list';
import PreferenceContext from '@context/preference';

import iconStart from '@public/images/icon_start.png';
import iconStartDark from '@public/images/icon_start_dark.png';
import iconLog from '@public/images/icon_log.png';
import iconLogDark from '@public/images/icon_log_dark.png';
import iconPref from '@public/images/icon_preference.png';
import iconPrefDark from '@public/images/icon_preference_dark.png';


/**
 * 页面：首页.
 * 提供跳转练习页的能力.
 */
const Homepage: React.FC = React.memo(() => {
  const { colorScheme } = PreferenceContext.useContext();
  const darkMode = colorScheme === 'dark';

  return (
    <Page darkMode={darkMode}>
      <PageHeader darkMode={darkMode}>
        ad-lib
      </PageHeader>
      <PageBody darkMode={darkMode}>
        <CardList
          cards={[{
            pic: darkMode ? iconStartDark : iconStart,
            name: '开始',
            path: 'idea',
            desc: '开始一次练习。\n探索一个话题，并进行你的演讲。'
          }, {
            pic: darkMode ? iconLogDark : iconLog,
            name: '日志',
            path: 'logs',
            desc: 'AdLib 记录了你在这台设备上进行过的所有练习。点击以查看你的练习日志。'
          }, {
            pic: darkMode ? iconPrefDark : iconPref,
            name: '偏好设置',
            path: 'test',
            desc: '编辑你的自定义选项。'
          }, {
            pic: darkMode ? iconStartDark : iconStart,
            name: '开始',
            path: 'idea',
            desc: '开始一次练习。\n探索一个话题，并进行你的演讲。'
          }, {
            pic: darkMode ? iconLogDark : iconLog,
            name: '日志',
            path: 'logs',
            desc: 'AdLib 记录了你在这台设备上进行过的所有练习。点击以查看你的练习日志。'
          }, {
            pic: darkMode ? iconPrefDark : iconPref,
            name: '偏好设置',
            path: 'test',
            desc: '编辑你的自定义选项。'
          }, {
            pic: darkMode ? iconStartDark : iconStart,
            name: '开始',
            path: 'idea',
            desc: '开始一次练习。\n探索一个话题，并进行你的演讲。'
          }, {
            pic: darkMode ? iconLogDark : iconLog,
            name: '日志',
            path: 'logs',
            desc: 'AdLib 记录了你在这台设备上进行过的所有练习。点击以查看你的练习日志。'
          }, {
            pic: darkMode ? iconPrefDark : iconPref,
            name: '偏好设置',
            path: 'test',
            desc: '编辑你的自定义选项。'
          }, {
            pic: darkMode ? iconStartDark : iconStart,
            name: '开始',
            path: 'idea',
            desc: '开始一次练习。\n探索一个话题，并进行你的演讲。'
          }, {
            pic: darkMode ? iconLogDark : iconLog,
            name: '日志',
            path: 'logs',
            desc: 'AdLib 记录了你在这台设备上进行过的所有练习。点击以查看你的练习日志。'
          }, {
            pic: darkMode ? iconPrefDark : iconPref,
            name: '偏好设置',
            path: 'test',
            desc: '编辑你的自定义选项。'
          }]}
        />
      </PageBody>
    </Page>
  );
});


export default Homepage;
