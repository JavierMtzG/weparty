import { Server } from 'socket.io';
import { getRoom, listPlayers } from '../utils/roomsStore.js';
import {
  GameStateImpostor,
  advanceToVoting,
  castVote as castImpostorVote,
  createImpostorGame,
  finalizeVoting,
  playerReadyWord,
  restartImpostor,
  startImpostorRound,
} from '../game/impostorEngine.js';
import {
  AgentsState,
  castAgentsVote,
  chancellorDiscard,
  chooseChancellor,
  executePlayer,
  investigatePlayer,
  markAgentsReady,
  presidentDiscard,
  restartAgents,
  startAgentsGame,
} from '../game/agentsEngine.js';
import path from 'path';
import { loadWordsFromCsv, WordEntry } from '../utils/wordLoader.js';

const impostorStates = new Map<string, GameStateImpostor>();
const agentsStates = new Map<string, AgentsState>();
let wordsCache: WordEntry[] = [];

async function ensureWordsLoaded() {
  if (wordsCache.length > 0) return;
  const filePath = path.join(process.cwd(), 'data', 'impostor_words.csv');
  wordsCache = await loadWordsFromCsv(filePath);
}

export function registerSockets(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join_room', ({ roomCode }) => {
      socket.join(roomCode);
      const players = listPlayers(roomCode);
      socket.to(roomCode).emit('room_update', { roomCode, players });
    });

    socket.on('start_game', async ({ roomCode, category, difficulty }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      const players = listPlayers(roomCode);
      if (room.gameType === 'IMPOSTOR') {
        const impostorState = createImpostorGame(roomCode, players, { category, difficulty });
        await ensureWordsLoaded();
        const started = startImpostorRound(impostorState, wordsCache);
        impostorStates.set(roomCode, started);
        io.to(roomCode).emit('game_started', { roomCode, gameType: 'IMPOSTOR' });
        io.to(roomCode).emit('game_state', started);
        return;
      }

      const agentsState = startAgentsGame(roomCode, players);
      agentsStates.set(roomCode, agentsState);
      io.to(roomCode).emit('game_started', { roomCode, gameType: 'AGENTS' });
      io.to(roomCode).emit('game_state', agentsState);
    });

    socket.on('join_impostor', ({ roomCode }) => {
      const state = impostorStates.get(roomCode);
      if (state) {
        socket.join(roomCode);
        socket.emit('game_state', state);
      }
    });

    socket.on('impostor_ready', ({ roomCode }) => {
      const state = impostorStates.get(roomCode);
      if (!state) return;
      const updated = playerReadyWord(state, socket.id);
      impostorStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('impostor_to_voting', ({ roomCode }) => {
      const state = impostorStates.get(roomCode);
      if (!state) return;
      const updated = advanceToVoting(state);
      impostorStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('impostor_vote', ({ roomCode, targetId }) => {
      const state = impostorStates.get(roomCode);
      if (!state) return;
      const updated = castImpostorVote(state, socket.id, targetId);
      impostorStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('impostor_restart', async ({ roomCode }) => {
      const state = impostorStates.get(roomCode);
      if (!state) return;
      const reset = restartImpostor(state);
      await ensureWordsLoaded();
      const started = startImpostorRound(reset, wordsCache);
      impostorStates.set(roomCode, started);
      io.to(roomCode).emit('game_state', started);
    });

    // Agents Secretos
    socket.on('join_agents', ({ roomCode }) => {
      const existing = agentsStates.get(roomCode);
      if (existing) {
        socket.join(roomCode);
        socket.emit('game_state', existing);
        return;
      }
      const players = listPlayers(roomCode);
      const state = startAgentsGame(roomCode, players);
      agentsStates.set(roomCode, state);
      socket.join(roomCode);
      io.to(roomCode).emit('game_state', state);
    });

    socket.on('agents_ready', ({ roomCode }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const updated = markAgentsReady(state, socket.id);
      agentsStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('agents_choose_chancellor', ({ roomCode, chancellorId }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const updated = chooseChancellor(state, socket.id, chancellorId);
      agentsStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    const voteStore = new Map<string, Map<string, boolean>>();

    socket.on('agents_vote', ({ roomCode, vote }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const votes = voteStore.get(roomCode) ?? new Map<string, boolean>();
      votes.set(socket.id, vote);
      voteStore.set(roomCode, votes);
      const alive = state.players.filter((p) => p.alive).length;
      if (votes.size >= alive) {
        const updated = castAgentsVote(state, votes);
        agentsStates.set(roomCode, updated);
        voteStore.delete(roomCode);
        io.to(roomCode).emit('game_state', updated);
      }
    });

    socket.on('agents_president_discard', ({ roomCode, cardIndex }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const updated = presidentDiscard(state, cardIndex);
      agentsStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('agents_chancellor_discard', ({ roomCode, cardIndex }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const updated = chancellorDiscard(state, cardIndex);
      agentsStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('agents_execute', ({ roomCode, targetId }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const updated = executePlayer(state, targetId);
      agentsStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('agents_investigate', ({ roomCode, targetId }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const updated = investigatePlayer(state, targetId);
      agentsStates.set(roomCode, updated);
      io.to(roomCode).emit('game_state', updated);
    });

    socket.on('agents_restart', ({ roomCode }) => {
      const state = agentsStates.get(roomCode);
      if (!state) return;
      const reset = restartAgents(state);
      agentsStates.set(roomCode, reset);
      io.to(roomCode).emit('game_state', reset);
    });
  });
}
