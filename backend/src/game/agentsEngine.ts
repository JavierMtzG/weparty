import { Player } from '../types/index.js';

export type AgentsPhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'CHOOSE_CHANCELLOR'
  | 'VOTING'
  | 'LEGISLATION_PRESIDENT'
  | 'LEGISLATION_AGENT'
  | 'POWER_RESOLUTION'
  | 'GAME_OVER';

export interface AgentsPlayer extends Player {
  faction: 'LEAL' | 'INFILTRADO';
  role: 'CIUDADANO' | 'INFILTRADO' | 'LIDER';
  alive: boolean;
}

export interface AgentsState {
  roomCode: string;
  phase: AgentsPhase;
  players: AgentsPlayer[];
  presidentId?: string;
  chancellorId?: string;
  infiltratedPolicies: number;
  loyalPolicies: number;
  chaos: number;
  deck: string[];
  discard: string[];
  hand?: string[];
  winner?: 'LEALES' | 'INFILTRADOS';
}

const deckBase = ['LEAL', 'LEAL', 'LEAL', 'LEAL', 'LEAL', 'LEAL', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO', 'INFILTRADO'];

const roleMap: Record<number, { leales: number; infiltrados: number; lider: number }> = {
  5: { leales: 3, infiltrados: 1, lider: 1 },
  6: { leales: 4, infiltrados: 1, lider: 1 },
  7: { leales: 4, infiltrados: 2, lider: 1 },
  8: { leales: 5, infiltrados: 2, lider: 1 },
  9: { leales: 5, infiltrados: 3, lider: 1 },
  10: { leales: 6, infiltrados: 3, lider: 1 },
};

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function startAgentsGame(roomCode: string, players: Player[]): AgentsState {
  const config = roleMap[players.length];
  const roles: AgentsPlayer[] = [];
  const shuffledPlayers = shuffle(players);
  const infiltratedCount = config?.infiltrados ?? 1;
  const loyalCount = config?.leales ?? Math.max(1, players.length - infiltratedCount - 1);

  let infiltratedAssigned = 0;
  let loyalAssigned = 0;
  let leaderAssigned = false;

  shuffledPlayers.forEach((p) => {
    if (!leaderAssigned) {
      roles.push({ ...p, faction: 'INFILTRADO', role: 'LIDER', alive: true });
      leaderAssigned = true;
    } else if (infiltratedAssigned < infiltratedCount) {
      roles.push({ ...p, faction: 'INFILTRADO', role: 'INFILTRADO', alive: true });
      infiltratedAssigned += 1;
    } else if (loyalAssigned < loyalCount) {
      roles.push({ ...p, faction: 'LEAL', role: 'CIUDADANO', alive: true });
      loyalAssigned += 1;
    } else {
      roles.push({ ...p, faction: 'LEAL', role: 'CIUDADANO', alive: true });
    }
  });

  const deck = shuffle(deckBase);

  return {
    roomCode,
    players: roles,
    phase: 'ROLE_REVEAL',
    presidentId: roles[0]?.id,
    chancellorId: undefined,
    infiltratedPolicies: 0,
    loyalPolicies: 0,
    chaos: 0,
    deck,
    discard: [],
  };
}

function drawCards(state: AgentsState, count: number) {
  let { deck } = state;
  const cards: string[] = [];
  while (cards.length < count) {
    if (deck.length === 0) {
      deck = shuffle([...state.discard]);
      state.discard = [];
    }
    const card = deck.shift();
    if (card) cards.push(card);
  }
  state.deck = deck;
  return cards;
}

export function chooseChancellor(state: AgentsState, presidentId: string, chancellorId: string): AgentsState {
  if (state.presidentId !== presidentId) return state;
  return { ...state, chancellorId, phase: 'VOTING' };
}

export function castAgentsVote(state: AgentsState, votes: Map<string, boolean>): AgentsState {
  const approvals = Array.from(votes.values()).filter(Boolean).length;
  const approved = approvals > state.players.length / 2;
  if (approved) {
    const hand = drawCards(state, 3);
    return { ...state, phase: 'LEGISLATION_PRESIDENT', hand };
  }
  const chaos = state.chaos + 1;
  if (chaos >= 3) {
    const top = drawCards(state, 1)[0];
    return applyPolicy({ ...state, chaos: 0 }, top);
  }
  const nextPresident = rotatePresident(state);
  return { ...state, chaos, presidentId: nextPresident, chancellorId: undefined };
}

export function presidentDiscard(state: AgentsState, cardIndex: number): AgentsState {
  if (!state.hand) return state;
  const hand = [...state.hand];
  const [discarded] = hand.splice(cardIndex, 1);
  state.discard.push(discarded);
  return { ...state, hand, phase: 'LEGISLATION_AGENT' };
}

export function chancellorDiscard(state: AgentsState, cardIndex: number): AgentsState {
  if (!state.hand) return state;
  const hand = [...state.hand];
  const [policy] = hand.splice(cardIndex, 1);
  const toDiscard = hand[0];
  if (toDiscard) state.discard.push(toDiscard);
  return applyPolicy({ ...state, hand: undefined }, policy);
}

export function applyPolicy(state: AgentsState, policy: string): AgentsState {
  if (policy === 'LEAL') {
    const loyalPolicies = state.loyalPolicies + 1;
    const winner = loyalPolicies >= 5 ? 'LEALES' : undefined;
    return {
      ...state,
      loyalPolicies,
      phase: winner ? 'GAME_OVER' : 'CHOOSE_CHANCELLOR',
      winner,
      presidentId: rotatePresident(state),
      chancellorId: undefined,
    };
  }
  const infiltratedPolicies = state.infiltratedPolicies + 1;
  const winner = infiltratedPolicies >= 6 ? 'INFILTRADOS' : undefined;
  return {
    ...state,
    infiltratedPolicies,
    phase: winner ? 'GAME_OVER' : 'POWER_RESOLUTION',
    winner,
  };
}

export function executePlayer(state: AgentsState, targetId: string): AgentsState {
  const players = state.players.map((p) => (p.id === targetId ? { ...p, alive: false } : p));
  const target = players.find((p) => p.id === targetId);
  if (target?.role === 'LIDER') {
    return { ...state, players, winner: 'LEALES', phase: 'GAME_OVER' };
  }
  return { ...state, players, phase: 'CHOOSE_CHANCELLOR', presidentId: rotatePresident(state), chancellorId: undefined };
}

function rotatePresident(state: AgentsState) {
  const alive = state.players.filter((p) => p.alive);
  const currentIndex = alive.findIndex((p) => p.id === state.presidentId);
  const next = alive[(currentIndex + 1) % alive.length];
  return next?.id;
}

export function restartAgents(state: AgentsState): AgentsState {
  return startAgentsGame(state.roomCode, state.players);
}
