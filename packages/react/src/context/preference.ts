/*
 * @Author: Kanata You 
 * @Date: 2022-03-15 18:06:21 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-15 20:03:54
 */

import { createContext } from './hibou/core';


export interface IPreferenceContext extends Record<string, any> {
  /** 浅/深色模式 */
  colorScheme: 'light' | 'dark';
}

const defaultPreference: IPreferenceContext = {
  colorScheme: (
    (window.matchMedia('(prefers-color-scheme: dark)')?.matches ?? 'dark') ?? false
  ) ? 'dark' : 'light'
};

/**
 * 上下文：用户设定.
 */
const PreferenceContext = createContext({
  init: defaultPreference, 
  actions: {
    setColorScheme: (_, colorScheme: IPreferenceContext['colorScheme']) => ({
      colorScheme
    })
  }
});

document.body.addEventListener('dblclick', () => {
  PreferenceContext.actions.setColorScheme(
    PreferenceContext.state.colorScheme === 'light' ? 'dark' : 'light'
  )
})

export default PreferenceContext;
