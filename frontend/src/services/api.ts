const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function createRoom(gameType: 'IMPOSTOR' | 'AGENTS', nickname: string) {
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameType, nickname, userId: 'anon' }),
  });
  if (!res.ok) throw new Error('No se pudo crear la sala');
  return res.json();
}

export async function joinRoom(roomCode: string, nickname: string) {
  const res = await fetch(`${API_URL}/rooms/${roomCode}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, userId: 'anon' }),
  });
  if (!res.ok) throw new Error('No se pudo unir a la sala');
  return res.json();
}

export async function getRoom(roomCode: string) {
  const res = await fetch(`${API_URL}/rooms/${roomCode}`);
  if (!res.ok) throw new Error('Sala no encontrada');
  return res.json();
}
