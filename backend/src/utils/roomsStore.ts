import { randomUUID } from 'crypto';
import { GameType, Player, Room } from '../types/index.js';

const rooms = new Map<string, Room>();

function generateCode(length = 5) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function createRoom(gameType: GameType, nickname: string, userId: string): Room {
  const code = generateCode();
  const hostId = randomUUID();
  const player: Player = { id: hostId, userId, nickname, isHost: true };
  const room: Room = { code, gameType, hostId, players: [player] };
  rooms.set(code, room);
  return room;
}

export function joinRoom(code: string, nickname: string, userId: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player: Player = { id: randomUUID(), userId, nickname };
  room.players.push(player);
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | null {
  return rooms.get(code) || null;
}

export function listPlayers(code: string) {
  return rooms.get(code)?.players ?? [];
}

export function setRoom(room: Room) {
  rooms.set(room.code, room);
}
