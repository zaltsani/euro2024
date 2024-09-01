import './App.css';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/home';
import Match from './pages/match';

function App() {
  return (
    <Routes>

      <Route path='/' element={<Home />} />
      <Route path='/match/:matchId/' element={<Match />} />

    </Routes>
  );
}

export default App;
