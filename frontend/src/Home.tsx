import React from 'react';
import ChatWidget from './components/ChatWidget';

function Home() {
  return (
    <div className="App">
      <h1>Artisan AI</h1>
      <p>Full-stack Async Exercise</p>
      <ChatWidget />
    </div>
  );
}

export default Home;