/** ESPOIR TEMPLATE */
      
import React from 'react';
import {
  Routes,
  HashRouter as Router,
  Route,
} from 'react-router-dom';
import styled from 'styled-components';
import '@locales/i18n';

import TitleBar from '@components/title-bar';
import Menu from '@components/title-bar/menu';
import WelcomeWindow from '@components/welcome-window';
import Homepage from './homepage';
import IdeaPage from './idea-page';

import backgroundLight from '@public/images/background-0.png';
import TrainPage from './train-page';
import ConfigPage from './config-page';


const Main = styled.main({
  flexGrow: 1,
  flexShrink: 1,
  width: '100vw',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  backgroundSize: 'cover',

  '@media (prefers-color-scheme: dark)': {
    backgroundColor: '#131515',
  },
  '@media (prefers-color-scheme: light)': {
    backgroundColor: '#ecf3fb',
    backgroundImage: `url(${backgroundLight})`,
  },
});

const App: React.FC = React.memo(function App () {
  const [phase, setPhase] = React.useState<'welcome' | 'loaded'>('welcome');

  React.useEffect(() => {
    setTimeout(() => {
      setPhase('loaded');
    }, 2000);
  }, [setPhase]);

  React.useEffect(() => {
    if (phase === 'loaded') {
      electron.fullscreen();
    }
  }, [phase]);

  const menu = React.useMemo(() => {
    return new Menu();
  }, []);

  return phase === 'welcome' && 0 ? (
    <WelcomeWindow />
  ) : (
    <React.Fragment>
      <TitleBar
        menu={menu}
      />
      <Main>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/idea" element={<IdeaPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/configs" element={<ConfigPage />} />
          </Routes>
        </Router>
      </Main>
    </React.Fragment>
  );
});

export default App;
