import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../services/socket';
import PlayerList from '../components/PlayerList';
import { FactionIcon, InfiltratedTrack, LoyalTrack } from '../components/agents/Graphics';

interface AgentsPlayer {
  id: string;
  nickname: string;
  faction: 'LEAL' | 'INFILTRADO';
  role: 'CIUDADANO' | 'INFILTRADO' | 'LIDER';
  alive: boolean;
}

interface AgentsState {
  phase:
    | 'LOBBY'
    | 'ROLE_REVEAL'
    | 'CHOOSE_CHANCELLOR'
    | 'VOTING'
    | 'LEGISLATION_PRESIDENT'
    | 'LEGISLATION_AGENT'
    | 'POWER_RESOLUTION'
    | 'GAME_OVER';
  roomCode: string;
  presidentId?: string;
  chancellorId?: string;
  infiltratedPolicies: number;
  loyalPolicies: number;
  chaos: number;
  winner?: 'LEALES' | 'INFILTRADOS';
  players: AgentsPlayer[];
  hand?: string[];
  pendingPower?: 'INVESTIGATE' | 'EXECUTE';
  readyPlayerIds: string[];
  lastInvestigation?: { targetId: string; faction: 'LEAL' | 'INFILTRADO' };
}

export default function GameAgents() {
  const { roomCode } = useParams();
  const [state, setState] = useState<AgentsState | null>(null);
  const [vote, setVote] = useState<'SI' | 'NO' | null>(null);
  const me = useMemo(() => state?.players.find((p) => p.id === socket.id), [state]);

  useEffect(() => {
    socket.emit('join_agents', { roomCode });
    socket.on('game_state', (payload: AgentsState) => setState(payload));
    return () => {
      socket.off('game_state');
    };
  }, [roomCode]);

  if (!state || !me) return <p className="text-slate-300">Cargando mesa...</p>;

  const statusHeader = (
    <div className="card p-4 grid gap-2">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FactionIcon type={me.role === 'LIDER' ? 'LIDER' : me.role === 'INFILTRADO' ? 'INFILTRADO' : 'LEAL'} size={64} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tu rol</p>
            <h2 className="text-2xl font-bold">
              {me.role === 'LIDER' ? 'Líder infiltrado' : me.role === 'INFILTRADO' ? 'Infiltrado' : 'Leal'}
            </h2>
            <p className="text-sm text-slate-400">
              Preside: {state.players.find((p) => p.id === state.presidentId)?.nickname ?? 'Por asignar'} · Agente:{' '}
              {state.players.find((p) => p.id === state.chancellorId)?.nickname ?? 'Pendiente'}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-slate-300">Políticas Leales: {state.loyalPolicies} / 5</p>
          <p className="text-slate-300">Políticas Infiltradas: {state.infiltratedPolicies} / 6</p>
          <p className="text-slate-500 text-sm">Descontento: {state.chaos} / 3</p>
        </div>
      </div>
    </div>
  );

  const renderPhase = () => {
    switch (state.phase) {
      case 'ROLE_REVEAL':
        return (
          <div className="card p-6 grid gap-3 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Tu identidad</p>
            <h3 className="text-3xl font-bold text-accent">{me.role === 'LIDER' ? 'Líder infiltrado' : me.role === 'INFILTRADO' ? 'Infiltrado' : 'Leal'}</h3>
            <p className="text-slate-300">Protege a tu bando y coordínate según tus conocimientos.</p>
            <button className="button-primary mx-auto" onClick={() => socket.emit('agents_ready', { roomCode })}>
              Listo
            </button>
            <p className="text-xs text-slate-500">{state.readyPlayerIds.length} / {state.players.length} jugadores listos</p>
          </div>
        );
      case 'CHOOSE_CHANCELLOR':
        return (
            <div className="card p-6 grid gap-3">
              <h3 className="text-2xl font-bold">El Presidente elige agente</h3>
              {me.id === state.presidentId ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {state.players
                  .filter((p) => p.id !== me.id && p.alive)
                  .map((player) => (
                    <button
                      key={player.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left hover:border-accent"
                      onClick={() => socket.emit('agents_choose_chancellor', { roomCode, chancellorId: player.id })}
                    >
                      <p className="font-semibold">{player.nickname}</p>
                      <p className="text-xs text-slate-500">Elegir como agente</p>
                    </button>
                  ))}
              </div>
            ) : (
              <p className="text-slate-300">Esperando a que el presidente proponga un agente.</p>
            )}
          </div>
        );
      case 'VOTING':
        return (
            <div className="card p-6 grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Votación de gobierno</p>
                <h3 className="text-2xl font-bold">¿Aprobáis el gobierno?</h3>
                <p className="text-slate-300">Presidente {state.players.find((p) => p.id === state.presidentId)?.nickname} + Agente {state.players.find((p) => p.id === state.chancellorId)?.nickname}</p>
              </div>
            <div className="flex gap-3">
              <button
                className={`button-primary ${vote === 'SI' ? '!bg-loyal text-white' : ''}`}
                onClick={() => {
                  setVote('SI');
                  socket.emit('agents_vote', { roomCode, vote: true });
                }}
              >
                Votar SÍ
              </button>
              <button
                className={`button-ghost ${vote === 'NO' ? 'border-red-500 text-red-200' : ''}`}
                onClick={() => {
                  setVote('NO');
                  socket.emit('agents_vote', { roomCode, vote: false });
                }}
              >
                Votar NO
              </button>
            </div>
          </div>
        );
      case 'LEGISLATION_PRESIDENT':
        return (
          <div className="card p-6 grid gap-3">
            <h3 className="text-2xl font-bold">Descarta una carta</h3>
            <p className="text-slate-300">El presidente descarta 1 de las 3 cartas robadas.</p>
            {me.id === state.presidentId ? (
              <div className="flex gap-3 flex-wrap">
                {state.hand?.map((card, index) => (
                  <button
                    key={index}
                    className="button-ghost"
                    onClick={() => socket.emit('agents_president_discard', { roomCode, cardIndex: index })}
                  >
                    Descartar {card}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Esperando decisión del presidente…</p>
            )}
          </div>
        );
      case 'LEGISLATION_AGENT':
        return (
          <div className="card p-6 grid gap-3">
            <h3 className="text-2xl font-bold">Elige política a publicar</h3>
            {me.id === state.chancellorId ? (
              <div className="flex gap-3 flex-wrap">
                {state.hand?.map((card, index) => (
                  <button
                    key={index}
                    className="button-ghost"
                    onClick={() => socket.emit('agents_chancellor_discard', { roomCode, cardIndex: index })}
                  >
                    Descartar {card}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">El agente decidirá qué carta queda.</p>
            )}
          </div>
        );
      case 'POWER_RESOLUTION':
        return (
          <div className="card p-6 grid gap-3">
            <h3 className="text-2xl font-bold">Resolución de poder</h3>
            <p className="text-slate-300">El presidente ejecuta el poder especial desbloqueado.</p>
            {me.id === state.presidentId ? (
              <>
                {state.pendingPower === 'EXECUTE' && (
                  <div className="flex gap-2 flex-wrap">
                    {state.players
                      .filter((p) => p.alive && p.id !== me.id)
                      .map((p) => (
                        <button
                          key={p.id}
                          className="button-ghost"
                          onClick={() => socket.emit('agents_execute', { roomCode, targetId: p.id })}
                        >
                          Ejecutar {p.nickname}
                        </button>
                      ))}
                  </div>
                )}
                {state.pendingPower === 'INVESTIGATE' && (
                  <div className="flex gap-2 flex-wrap">
                    {state.players
                      .filter((p) => p.alive && p.id !== me.id)
                      .map((p) => (
                        <button
                          key={p.id}
                          className="button-ghost"
                          onClick={() => socket.emit('agents_investigate', { roomCode, targetId: p.id })}
                        >
                          Investigar {p.nickname}
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400">El presidente está usando el poder.</p>
            )}
            {state.lastInvestigation && state.pendingPower === undefined && (
              <p className="text-xs text-slate-500 text-center">
                Última investigación: {state.players.find((p) => p.id === state.lastInvestigation?.targetId)?.nickname} es{' '}
                {state.lastInvestigation?.faction === 'LEAL' ? 'Leal' : 'Infiltrado'}
              </p>
            )}
          </div>
        );
      case 'GAME_OVER':
        return (
          <div className="card p-6 grid gap-3 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fin de partida</p>
            <h3 className="text-3xl font-bold">{state.winner === 'LEALES' ? 'Ganan los Leales' : 'Ganan los Infiltrados'}</h3>
            <button className="button-primary mx-auto" onClick={() => socket.emit('agents_restart', { roomCode })}>
              Repetir
            </button>
          </div>
        );
      default:
        return <p className="text-slate-300">Preparando ronda...</p>;
    }
  };

  return (
    <section className="grid md:grid-cols-[2fr_1fr] gap-4">
      {statusHeader}
      <div className="card p-5 grid gap-4">
        <h4 className="text-sm uppercase tracking-[0.2em] text-slate-400">Tablero</h4>
        <LoyalTrack progress={state.loyalPolicies} />
        <InfiltratedTrack progress={state.infiltratedPolicies} />
      </div>
      {renderPhase()}
      <PlayerList
        title="Jugadores"
        players={state.players.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          isHost: p.id === state.presidentId,
          isAlive: p.alive,
          isYou: p.id === me.id,
        }))}
      />
    </section>
  );
}
