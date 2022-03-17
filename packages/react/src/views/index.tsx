/** ESPOIR TEMPLATE */
      
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Homepage from '@views/homepage';
import IdeaPage from '@views/idea-page';


const App: React.FC = React.memo(() => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Homepage /> } />
        <Route path="/idea" element={ <IdeaPage /> } />
      </Routes>
    </Router>
  );
});


export default App;
