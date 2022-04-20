/** ESPOIR TEMPLATE */
      
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Homepage from '@views/homepage';
import IdeaPage from '@views/idea-page';
import PreferencePage from '@views/preference-page';


const App: React.FC = React.memo(function App () {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Homepage /> } />
        <Route path="/idea" element={ <IdeaPage /> } />
        <Route path="/preference" element={ <PreferencePage /> } />
        <Route path="/*" element={ <Homepage /> } />
      </Routes>
    </Router>
  );
});


export default App;
