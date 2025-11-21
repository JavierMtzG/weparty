export type GameType = 'IMPOSTOR' | 'AGENTS';

export interface Room {
  code: string;
  gameType: GameType;
  hostId: string;
  players: Player[];
}

export interface Player {
  id: string;
  userId: string;
  nickname: string;
  isHost?: boolean;
}
