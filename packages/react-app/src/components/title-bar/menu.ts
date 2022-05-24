/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 23:35:27 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-25 00:01:33
 */

import { getLanguage, setLanguage } from '@locales/i18n';

import type { MenuItemProps, MultipleMenuItemProps } from './menu-item';


const notImplemented = () => alert('This method is not implemented!');

export default class Menu {

  private static setShortcuts(menu: (MenuItemProps | MultipleMenuItemProps | '-')[], path?: string) {
    menu.forEach(e => {
      if (e === '-') {
        return;
      }

      const label = path ? `${path}.${e.label}` : `menu.${e.label}`;
      
      if ((e as MenuItemProps).callback && (e as MenuItemProps).accelerator) {
        shortcuts.set(
          label,
          () => {
            const disabled = (e as MenuItemProps).disabled?.() ?? false;
            console.log('shortcut:', label, (e as MenuItemProps), `disabled=${disabled}`);

            if (disabled) {
              return false;
            }

            return (e as MenuItemProps).callback();
          }
        );
      } else if ((e as MultipleMenuItemProps).subMenu?.length) {
        this.setShortcuts((e as MultipleMenuItemProps).subMenu, label);
      }
    });
  }

  getMenu(): (MenuItemProps | MultipleMenuItemProps)[] {
    const menu: (MenuItemProps | MultipleMenuItemProps)[] = [{
      label: 'app',
      subMenu: [
        {
          label: 'reload',
          callback: async () => {
            await electron.reload();
          },
          accelerator: 'Ctrl+Alt+R'
        },
        {
          label: 'exit',
          callback: async () => {
            await electron.close();
          },
          accelerator: 'Alt+W'
        },
      ]
    // }, {
    //   label: 'edit',
    //   subMenu: [
    //     {
    //       label: 'undo',
    //       callback: () => edit.undo(),
    //       accelerator: 'Ctrl+Z',
    //     },
    //     {
    //       label: 'redo',
    //       callback: () => edit.redo(),
    //       accelerator: 'Ctrl+Y',
    //     },
    //   ]
    }, {
      label: 'appearance',
      subMenu: [
        {
          label: 'dark_mode',
          callback: darkMode.toggle,
          accelerator: 'Alt+D',
          checked: () => window.matchMedia('(prefers-color-scheme: dark)').matches
        },
        {
          label: 'language',
          subMenu: [
            {
              label: '$简体中文',
              callback: () => setLanguage('zh'),
              checked: () => getLanguage().toLowerCase().includes('zh'),
            },
            {
              label: '$English',
              callback: () => setLanguage('en'),
              checked: () => getLanguage().toLowerCase().includes('en'),
            },
            {
              label: '$日本語',
              callback: () => setLanguage('ja'),
              checked: () => getLanguage().toLowerCase().includes('ja'),
            },
          ]
        }
      ]
    }];

    Menu.setShortcuts(menu);

    return menu;
  }

}
