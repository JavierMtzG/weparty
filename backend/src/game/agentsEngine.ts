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

export type PolicyCard = 'LEAL' | 'INFILTRADO';
export type PowerType = 'INVESTIGATE' | 'EXECUTE';

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
  deck: PolicyCard[];
  discard: PolicyCard[];
  hand?: PolicyCard[];
  pendingPower?: PowerType;
  lastInvestigation?: { targetId: string; faction: 'LEAL' | 'INFILTRADO' };
  winner?: 'LEALES' | 'INFILTRADOS';
  readyPlayerIds: string[];
}

const deckBase: PolicyCard[] = [
  'LEAL',
  'LEAL',
  'LEAL',
  'LEAL',
  'LEAL',
  'LEAL',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
  'INFILTRADO',
];

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

function rotatePresident(state: AgentsState): string | undefined {
  const alive = state.players.filter((p) => p.alive);
  if (alive.length === 0) return undefined;
  if (!state.presidentId) return alive[0]?.id;
  const currentIndex = state.players.findIndex((p) => p.id === state.presidentId);
  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const candidate = state.players[(currentIndex + offset) % state.players.length];
    if (candidate?.alive) return candidate.id;
  }
  return state.presidentId;
}

function drawCards(
  deck: PolicyCard[],
  discard: PolicyCard[],
  count: number,
): { cards: PolicyCard[]; deck: PolicyCard[]; discard: PolicyCard[] } {
  const cards: PolicyCard[] = [];
  let deckCopy = [...deck];
  let discardCopy = [...discard];

  while (cards.length < count) {
    if (deckCopy.length === 0) {
      deckCopy = shuffle(discardCopy);
      discardCopy = [];
    }
    const card = deckCopy.shift();
    if (card) cards.push(card);
  }

  return { cards, deck: deckCopy, discard: discardCopy };
}

export function startAgentsGame(roomCode: string, players: Player[]): AgentsState {
  const config = roleMap[players.length] ?? roleMap[5];
  const roleDeck: AgentsPlayer['role'][] = [
    ...Array(config.infiltrados).fill('INFILTRADO'),
    ...Array(config.leales).fill('CIUDADANO'),
    'LIDER',
  ];

  const shuffledRoles = shuffle(roleDeck);
  const assigned: AgentsPlayer[] = players.map((p, index) => {
    const role = shuffledRoles[index] ?? 'CIUDADANO';
    const faction = role === 'CIUDADANO' ? 'LEAL' : 'INFILTRADO';
    return { ...p, role, faction, alive: true };
  });

  const deck = shuffle(deckBase);
  const presidentId = assigned.find((p) => p.alive)?.id;

  return {
    roomCode,
    players: assigned,
    phase: 'ROLE_REVEAL',
    presidentId,
    chancellorId: undefined,
    infiltratedPolicies: 0,
    loyalPolicies: 0,
    chaos: 0,
    deck,
    discard: [],
    pendingPower: undefined,
    readyPlayerIds: [],
  };
}

export function markAgentsReady(state: AgentsState, playerId: string): AgentsState {
  const readySet = new Set(state.readyPlayerIds);
  readySet.add(playerId);
  const readyPlayerIds = Array.from(readySet);
  const everyoneReady = readyPlayerIds.length >= state.players.length;
  return { ...state, readyPlayerIds, phase: everyoneReady ? 'CHOOSE_CHANCELLOR' : state.phase };
}

export function chooseChancellor(state: AgentsState, presidentId: string, chancellorId: string): AgentsState {
  if (state.presidentId !== presidentId || state.phase !== 'CHOOSE_CHANCELLOR') return state;
  const target = state.players.find((p) => p.id === chancellorId && p.alive);
  if (!target || chancellorId === presidentId) return state;
  return { ...state, chancellorId, phase: 'VOTING', chaos: state.chaos };
}

export function castAgentsVote(state: AgentsState, votes: Map<string, boolean>): AgentsState {
  if (state.phase !== 'VOTING' || !state.chancellorId) return state;
  const alivePlayers = state.players.filter((p) => p.alive);
  const approvals = Array.from(votes.entries()).filter(([id, vote]) => {
    const voterAlive = alivePlayers.some((p) => p.id === id);
    return voterAlive && vote;
  }).length;
  const approved = approvals > alivePlayers.length / 2;

  if (approved) {
    if (state.infiltratedPolicies >= 3) {
      const chancellor = state.players.find((p) => p.id === state.chancellorId);
      if (chancellor?.role === 'LIDER') {
        return { ...state, winner: 'INFILTRADOS', phase: 'GAME_OVER' };
      }
    }

    const { cards, deck, discard } = drawCards(state.deck, state.discard, 3);
    return {
      ...state,
      phase: 'LEGISLATION_PRESIDENT',
      hand: cards,
      deck,
      discard,
      chaos: 0,
      pendingPower: undefined,
    };
  }

  const chaos = state.chaos + 1;
  if (chaos >= 3) {
    const { cards, deck, discard } = drawCards(state.deck, state.discard, 1);
    const policy = cards[0];
    if (!policy) return state;
    const applied = applyPolicy({ ...state, deck, discard, chaos: 0, chancellorId: undefined }, policy);
    return { ...applied, chaos: 0, chancellorId: undefined };
  }

  return {
    ...state,
    chaos,
    presidentId: rotatePresident(state),
    chancellorId: undefined,
    phase: 'CHOOSE_CHANCELLOR',
  };
}

export function presidentDiscard(state: AgentsState, cardIndex: number): AgentsState {
  if (state.phase !== 'LEGISLATION_PRESIDENT' || !state.hand || state.presidentId === undefined) return state;
  if (cardIndex < 0 || cardIndex >= state.hand.length) return state;
  const hand = [...state.hand];
  const [discarded] = hand.splice(cardIndex, 1);
  const discard = [...state.discard, discarded];
  return { ...state, hand, discard, phase: 'LEGISLATION_AGENT' };
}

export function chancellorDiscard(state: AgentsState, cardIndex: number): AgentsState {
  if (state.phase !== 'LEGISLATION_AGENT' || !state.hand || state.chancellorId === undefined) return state;
  if (cardIndex < 0 || cardIndex >= state.hand.length) return state;
  const hand = [...state.hand];
  const [kept] = hand.splice(cardIndex, 1);
  const discardCard = hand[0];
  const discard = discardCard ? [...state.discard, discardCard] : [...state.discard];
  return applyPolicy({ ...state, hand: undefined, discard }, kept);
}

export function applyPolicy(state: AgentsState, policy: PolicyCard): AgentsState {
  if (policy === 'LEAL') {
    const loyalPolicies = state.loyalPolicies + 1;
    const winner = loyalPolicies >= 5 ? 'LEALES' : undefined;
    return {
      ...state,
      loyalPolicies,
      phase: winner ? 'GAME_OVER' : 'CHOOSE_CHANCELLOR',
      winner,
      chaos: 0,
      hand: undefined,
      chancellorId: undefined,
      presidentId: winner ? state.presidentId : rotatePresident(state),
    };
  }

  const infiltratedPolicies = state.infiltratedPolicies + 1;
  const winner = infiltratedPolicies >= 6 ? 'INFILTRADOS' : undefined;
  const pendingPower: PowerType | undefined =
    infiltratedPolicies === 3 ? 'INVESTIGATE' : infiltratedPolicies === 4 || infiltratedPolicies === 5 ? 'EXECUTE' : undefined;
  const phase: AgentsPhase = winner ? 'GAME_OVER' : pendingPower ? 'POWER_RESOLUTION' : 'CHOOSE_CHANCELLOR';

  return {
    ...state,
    infiltratedPolicies,
    phase,
    winner,
    chaos: 0,
    hand: undefined,
    pendingPower,
    presidentId: phase === 'CHOOSE_CHANCELLOR' ? rotatePresident(state) : state.presidentId,
    chancellorId: phase === 'CHOOSE_CHANCELLOR' ? undefined : state.chancellorId,
  };
}

function endPowerAndRotate(state: AgentsState): AgentsState {
  return {
    ...state,
    pendingPower: undefined,
    phase: 'CHOOSE_CHANCELLOR',
    presidentId: rotatePresident(state),
    chancellorId: undefined,
    chaos: 0,
  };
}

export function executePlayer(state: AgentsState, targetId: string): AgentsState {
  if (state.pendingPower !== 'EXECUTE' || state.phase !== 'POWER_RESOLUTION') return state;
  const players = state.players.map((p) => (p.id === targetId ? { ...p, alive: false } : p));
  const target = players.find((p) => p.id === targetId);
  if (target?.role === 'LIDER') {
    return { ...state, players, winner: 'LEALES', phase: 'GAME_OVER', pendingPower: undefined };
  }
  return endPowerAndRotate({ ...state, players });
}

export function investigatePlayer(state: AgentsState, targetId: string): AgentsState {
  if (state.pendingPower !== 'INVESTIGATE' || state.phase !== 'POWER_RESOLUTION') return state;
  const target = state.players.find((p) => p.id === targetId);
  if (!target) return state;
  return endPowerAndRotate({ ...state, lastInvestigation: { targetId, faction: target.faction } });
}

export function restartAgents(state: AgentsState): AgentsState {
  return startAgentsGame(state.roomCode, state.players);
}
