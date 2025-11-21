import { Router } from 'express';
import { createRoom, getRoom, joinRoom } from '../utils/roomsStore.js';
import { GameType } from '../types/index.js';

const router = Router();

router.post('/rooms', (req, res) => {
  const { gameType, nickname, userId } = req.body as { gameType: GameType; nickname: string; userId: string };
  if (!gameType || !nickname) return res.status(400).json({ error: 'Faltan campos' });
  const room = createRoom(gameType, nickname, userId);
  res.json({ roomCode: room.code, gameType: room.gameType });
});

router.post('/rooms/:code/join', (req, res) => {
  const { code } = req.params;
  const { nickname, userId } = req.body as { nickname: string; userId: string };
  const room = joinRoom(code, nickname, userId);
  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
  res.json({ roomCode: room.code, gameType: room.gameType });
});

router.get('/rooms/:code', (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: 'Sala no encontrada' });
  res.json(room);
});

export default router;
