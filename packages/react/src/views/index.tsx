/** ESPOIR TEMPLATE */
      
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Homepage from '@views/homepage';


const App: React.FC = React.memo(() => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Homepage /> } />
      </Routes>
    </Router>
  );
});


export default App;
