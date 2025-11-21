import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayerList from '../components/PlayerList';
import Chat from '../components/Chat';
import { socket } from '../services/socket';
import { getRoom } from '../services/api';

interface LobbyPlayer {
  id: string;
  nickname: string;
  isHost?: boolean;
}

interface RoomResponse {
  roomCode: string;
  gameType: 'IMPOSTOR' | 'AGENTS';
  players: LobbyPlayer[];
}

export default function Lobby() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [messages, setMessages] = useState<{ author: string; content: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomCode) return;
    getRoom(roomCode).then(setRoom);
    socket.emit('join_room', { roomCode });
    socket.on('room_update', (payload: RoomResponse) => setRoom(payload));
    socket.on('game_started', (payload: { roomCode: string; gameType: 'IMPOSTOR' | 'AGENTS' }) => {
      const path = payload.gameType === 'IMPOSTOR' ? `/game/impostor/${payload.roomCode}` : `/game/agents/${payload.roomCode}`;
      navigate(path);
    });
    socket.on('chat_message', (payload) => setMessages((prev) => [...prev, payload]));
    return () => {
      socket.off('room_update');
      socket.off('game_started');
      socket.off('chat_message');
    };
  }, [roomCode, navigate]);

  if (!room) {
    return <p className="text-slate-300">Cargando sala...</p>;
  }

  const isHost = room.players[0]?.isHost;

  return (
    <section className="grid md:grid-cols-[2fr_1fr] gap-4">
      <div className="grid gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sala</p>
            <h1 className="text-3xl font-bold">{room.roomCode}</h1>
            <p className="text-sm text-slate-400">Juego: {room.gameType === 'IMPOSTOR' ? 'El Impostor' : 'Agentes Secretos'}</p>
          </div>
          {isHost && (
            <button className="button-primary" onClick={() => socket.emit('start_game', { roomCode })}>
              Empezar partida
            </button>
          )}
        </div>
        <PlayerList players={room.players} />
      </div>
      <Chat messages={messages} onSend={(content) => socket.emit('chat_message', { roomCode, content })} />
    </section>
  );
}
