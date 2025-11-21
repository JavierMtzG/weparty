import { WordEntry, getRandomWord } from '../utils/wordLoader.js';
import { Player } from '../types/index.js';

export type ImpostorPhase = 'LOBBY' | 'WORD_REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULT';

export interface ImpostorPlayer extends Player {
  isImpostor: boolean;
  hasVoted: boolean;
  voteTargetId?: string;
}

export interface GameStateImpostor {
  roomCode: string;
  players: ImpostorPlayer[];
  phase: ImpostorPhase;
  secretWord: string | null;
  category?: string;
  difficulty?: 'facil' | 'medio' | 'dificil';
  impostorId?: string;
  winner?: 'CIVILIANS' | 'IMPOSTOR';
  votingResults?: { voterId: string; targetId: string }[];
  ready?: Set<string>;
}

export function createImpostorGame(roomCode: string, players: Player[], options?: {
  category?: string;
  difficulty?: 'facil' | 'medio' | 'dificil';
}): GameStateImpostor {
  const impostorPlayers: ImpostorPlayer[] = players.map((p) => ({ ...p, isImpostor: false, hasVoted: false }));
  return {
    roomCode,
    players: impostorPlayers,
    phase: 'LOBBY',
    secretWord: null,
    category: options?.category,
    difficulty: options?.difficulty,
    ready: new Set(),
  };
}

export function startImpostorRound(state: GameStateImpostor, words: WordEntry[]): GameStateImpostor {
  const impostorIndex = Math.floor(Math.random() * state.players.length);
  const impostorId = state.players[impostorIndex].id;
  const word = getRandomWord(words, state.category, state.difficulty);
  const players = state.players.map((p, idx) => ({
    ...p,
    isImpostor: idx === impostorIndex,
    hasVoted: false,
    voteTargetId: undefined,
  }));
  return { ...state, players, phase: 'WORD_REVEAL', secretWord: word.word, impostorId, ready: new Set() };
}

export function playerReadyWord(state: GameStateImpostor, playerId: string): GameStateImpostor {
  const ready = new Set(state.ready);
  ready.add(playerId);
  const allReady = ready.size >= state.players.length;
  return { ...state, ready, phase: allReady ? 'DISCUSSION' : state.phase };
}

export function advanceToVoting(state: GameStateImpostor): GameStateImpostor {
  return { ...state, phase: 'VOTING' };
}

export function castVote(state: GameStateImpostor, voterId: string, targetId: string): GameStateImpostor {
  const players = state.players.map((p) => (p.id === voterId ? { ...p, hasVoted: true, voteTargetId: targetId } : p));
  const everyoneVoted = players.every((p) => p.hasVoted);
  let nextState: GameStateImpostor = { ...state, players };
  if (everyoneVoted) {
    nextState = finalizeVoting({ ...state, players });
  }
  return nextState;
}

export function finalizeVoting(state: GameStateImpostor): GameStateImpostor {
  const tally = new Map<string, number>();
  state.players.forEach((p) => {
    if (p.voteTargetId) {
      tally.set(p.voteTargetId, (tally.get(p.voteTargetId) || 0) + 1);
    }
  });
  let topTarget: string | undefined;
  let topVotes = -1;
  tally.forEach((votes, targetId) => {
    if (votes > topVotes) {
      topVotes = votes;
      topTarget = targetId;
    }
  });

  const winner = topTarget === state.impostorId ? 'CIVILIANS' : 'IMPOSTOR';
  return {
    ...state,
    phase: 'RESULT',
    winner,
    votingResults: state.players
      .filter((p) => !!p.voteTargetId)
      .map((p) => ({ voterId: p.id, targetId: p.voteTargetId! })),
  };
}

export function restartImpostor(state: GameStateImpostor): GameStateImpostor {
  const players = state.players.map((p) => ({ ...p, hasVoted: false, voteTargetId: undefined }));
  return { ...state, players, phase: 'LOBBY', secretWord: null, winner: undefined, impostorId: undefined, ready: new Set() };
}
