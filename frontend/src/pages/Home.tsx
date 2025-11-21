import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from '../components/GameCard';
import RoomCodeInput from '../components/RoomCodeInput';
import { createRoom, joinRoom } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [selectedGame, setSelectedGame] = useState<'IMPOSTOR' | 'AGENTS'>('IMPOSTOR');

  const handleCreate = async () => {
    if (!nickname.trim()) return;
    const room = await createRoom(selectedGame, nickname);
    navigate(`/lobby/${room.roomCode}`);
  };

  const handleJoin = async (code: string) => {
    if (!nickname.trim()) return;
    const room = await joinRoom(code, nickname);
    navigate(`/lobby/${room.roomCode}`);
  };

  return (
    <section className="grid gap-8">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <div className="grid gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Bienvenida</p>
          <h1 className="text-4xl font-black leading-tight">Elige tu fiesta: deducción social en segundos</h1>
          <p className="text-lg text-slate-300 max-w-3xl">
            Crea o únete a salas para jugar a <strong>El Impostor</strong> y <strong>Agentes Secretos</strong>. UI responsive,
            sockets en tiempo real y Supabase para que cada ronda fluya sin registros obligatorios.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
            <label className="card p-4 grid gap-2">
              <span className="text-sm text-slate-400">Tu nick</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-500"
                placeholder="AgentSmith"
              />
            </label>
            <label className="card p-4 grid gap-2">
              <span className="text-sm text-slate-400">Juego preferido</span>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value as 'IMPOSTOR' | 'AGENTS')}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-100"
              >
                <option value="IMPOSTOR">El Impostor</option>
                <option value="AGENTS">Agentes Secretos</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="button-primary" type="button" onClick={handleCreate}>
              Crear sala ahora
            </button>
            <RoomCodeInput onSubmit={handleJoin} />
          </div>
        </div>
        <div className="card p-6 grid gap-4">
          <h3 className="text-lg font-semibold">Checklist rápido</h3>
          <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
            <li>1) Elige juego y tu nick.</li>
            <li>2) Crea sala o pega código para unirte.</li>
            <li>3) Invita con el código y entra al lobby.</li>
            <li>4) El host pulsa "Empezar" cuando estéis.</li>
          </ul>
          <div className="rounded-xl bg-slate-900/70 p-4 text-sm text-slate-400">
            El backend asigna roles, envía estado por sockets y la UI solo pinta según el <code>game_state</code> que recibe.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <GameCard
          title="El Impostor"
          description="Todos ven la palabra menos uno. Conversad por voz y votad al sospechoso. Lógica de fases y votos controlada por el servidor."
          cta="Abrir lobby"
          onClick={() => setSelectedGame('IMPOSTOR')}
        />
        <GameCard
          title="Agentes Secretos"
          description="Bandos Leales vs Infiltrados, con un Líder infiltrado. Gobierno, votaciones, políticas y poderes. Inspirado en roles ocultos clásicos."
          cta="Abrir lobby"
          onClick={() => setSelectedGame('AGENTS')}
        />
      </div>
    </section>
  );
}
