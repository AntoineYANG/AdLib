/*
 * @Author: Kanata You 
 * @Date: 2022-03-19 00:30:42 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-19 00:31:51
 */
     
import React from 'react';
import ReactDOM from 'react-dom';

import App from '@views';

import './index.scss';


const container = document.getElementById('root');
// @ts-ignore
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
