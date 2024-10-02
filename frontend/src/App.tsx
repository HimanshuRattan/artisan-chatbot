import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
// import Home from './Home';
import ProtectedRoute from './ProtectedRoute';

const App: React.FC = () => {
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={
    //       <ProtectedRoute isProtected={false}>
    //         <Login />
    //       </ProtectedRoute>
    //     } />
    //     <Route path="/home" element={
    //       <ProtectedRoute isProtected={true}>
    //         <Home />
    //       </ProtectedRoute>
    //     } />
    //   </Routes>
    // </Router>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute />} />
      </Routes>
    </Router>
  );
};

export default App;