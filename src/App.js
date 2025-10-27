import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HouseModule from './components/HouseModule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/houses" />} />
        <Route path="/houses" element={<HouseModule />} />
        {/* You can add more routes in future */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
