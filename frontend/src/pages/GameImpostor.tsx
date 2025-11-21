import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../services/socket';
import PlayerList from '../components/PlayerList';

interface ImpostorPlayerState {
  id: string;
  nickname: string;
  isImpostor: boolean;
  hasVoted: boolean;
  voteTargetId?: string;
}

interface VotingResult {
  voterId: string;
  targetId: string;
}

interface GameStateImpostor {
  roomCode: string;
  phase: 'LOBBY' | 'WORD_REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULT';
  players: ImpostorPlayerState[];
  secretWord?: string | null;
  impostorId?: string;
  winner?: 'CIVILIANS' | 'IMPOSTOR';
  votingResults?: VotingResult[];
}

export default function GameImpostor() {
  const { roomCode } = useParams();
  const [state, setState] = useState<GameStateImpostor | null>(null);
  const [ready, setReady] = useState(false);
  const [voteTarget, setVoteTarget] = useState<string | null>(null);

  const me = useMemo(() => state?.players.find((p) => p.id === socket.id), [state]);

  useEffect(() => {
    socket.emit('join_impostor', { roomCode });
    socket.on('game_state', (payload: GameStateImpostor) => setState(payload));
    return () => {
      socket.off('game_state');
    };
  }, [roomCode]);

  if (!state) return <p className="text-slate-300">Cargando partida...</p>;

  const renderContent = () => {
    switch (state.phase) {
      case 'WORD_REVEAL':
        return (
          <div className="card p-6 grid gap-3 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Palabra secreta</p>
            {me?.isImpostor ? (
              <>
                <h2 className="text-3xl font-bold text-amber-400">Eres el impostor</h2>
                <p className="text-slate-300">Finge que conoces la palabra y pasa desapercibido.</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-400">Esta es la palabra real para esta ronda:</p>
                <h2 className="text-4xl font-black">{state.secretWord}</h2>
              </>
            )}
            <button
              className="button-primary mx-auto"
              onClick={() => {
                setReady(true);
                socket.emit('impostor_ready', { roomCode });
              }}
              disabled={ready}
            >
              {ready ? 'Esperando al resto...' : 'Listo'}
            </button>
          </div>
        );
      case 'DISCUSSION':
        return (
          <div className="card p-6 grid gap-3 text-center">
            <h2 className="text-3xl font-bold">Fase de discusión</h2>
            <p className="text-slate-300">Hablad por voz. Cuando el host lo decida, pasaréis a la votación.</p>
            <button className="button-primary mx-auto" onClick={() => socket.emit('impostor_to_voting', { roomCode })}>
              Ir a votación (host)
            </button>
          </div>
        );
      case 'VOTING':
        return (
          <div className="card p-6 grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Votación</p>
              <h2 className="text-2xl font-bold">¿Quién es el impostor?</h2>
              <p className="text-slate-300 text-sm">Selecciona a un jugador y confirma tu voto.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {state.players.map((player) => (
                <button
                  key={player.id}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    voteTarget === player.id ? 'border-accent bg-accent/10' : 'border-slate-800 bg-slate-900/60'
                  }`}
                  disabled={player.id === me?.id}
                  onClick={() => setVoteTarget(player.id)}
                >
                  <p className="font-semibold">{player.nickname}</p>
                  {player.id === me?.id && <p className="text-xs text-slate-500">No puedes votarte a ti</p>}
                </button>
              ))}
            </div>
            <button
              className="button-primary w-fit"
              disabled={!voteTarget || me?.hasVoted}
              onClick={() => socket.emit('impostor_vote', { roomCode, targetId: voteTarget })}
            >
              {me?.hasVoted ? 'Voto enviado' : 'Confirmar voto'}
            </button>
          </div>
        );
      case 'RESULT':
        return (
          <div className="card p-6 grid gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resultado</p>
              <h2 className="text-3xl font-bold">{state.winner === 'IMPOSTOR' ? 'Gana el impostor' : 'Ganan los civiles'}</h2>
              <p className="text-slate-300">El impostor era {state.players.find((p) => p.id === state.impostorId)?.nickname}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Resumen de votos</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                {state.votingResults?.map((vote) => (
                  <li key={`${vote.voterId}-${vote.targetId}`}>
                    {state.players.find((p) => p.id === vote.voterId)?.nickname} →{' '}
                    {state.players.find((p) => p.id === vote.targetId)?.nickname}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button className="button-primary" onClick={() => socket.emit('impostor_restart', { roomCode })}>
                Repetir partida
              </button>
            </div>
          </div>
        );
      default:
        return <p className="text-slate-300">Esperando a que empiece la ronda...</p>;
    }
  };

  return (
    <section className="grid md:grid-cols-[2fr_1fr] gap-4">
      {renderContent()}
      <PlayerList players={state.players.map((p) => ({ ...p, isHost: p.id === state.players[0]?.id }))} title="Jugadores" />
    </section>
  );
}
