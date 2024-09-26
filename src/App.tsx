import React from 'react';
import ChatWidget from './ChatWidget';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Artisan AI</h1>
      <p>Full-stack Async Exercise</p>
      <ChatWidget />
    </div>
  );
};

export default App;