import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import GameImpostor from './pages/GameImpostor';
import GameAgents from './pages/GameAgents';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import { useState } from 'react';

function App() {
  const [booting] = useState(false);

  if (booting) {
    return <LoadingScreen message="Cargando experiencia de juego..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pb-12 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
          <Route path="/game/impostor/:roomCode" element={<GameImpostor />} />
          <Route path="/game/agents/:roomCode" element={<GameAgents />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
