/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 17:26:00 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-16 00:00:58
 */

import React from 'react';

import { Page, PageBody } from '@components/structure';
import CardList from '@components/card-list';
import PreferenceContext from '@context/preference';


/**
 * 页面：首页.
 * 提供跳转练习页的能力.
 */
const Homepage: React.FC = React.memo(() => {
  const { colorScheme } = PreferenceContext.useContext();

  return (
    <Page>
      <PageBody darkMode={colorScheme === 'dark'}>
        <CardList
          cards={[{
            name: '测试',
            path: 'test'
          }, {
            name: '日志',
            path: 'test'
          }, {
            name: '更多',
            path: 'test'
          }]}
        />
      </PageBody>
    </Page>
  );
});


export default Homepage;
