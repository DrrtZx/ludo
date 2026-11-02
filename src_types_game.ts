export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export type TokenStatus = 'base' | 'track' | 'home';

export interface Player {
  id: PlayerColor;
  name: string;
  color: PlayerColor;
  tokens: Token[];
  isWinner: boolean;
}

export interface Token {
  id: string; // e.g. "red-1"
  playerId: PlayerColor;
  index: number; // token index 0..3
  status: TokenStatus;
  position: number; // global board position for track, 0 = base, -1 = home
  hasLeftBase: boolean;
}

export interface DiceState {
  value: number | null;
  isRolling: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: DiceState;
  winner: PlayerColor | null;
  turnCount: number;
  status: 'setup' | 'playing' | 'finished';
  selectedTokenId: string | null;
  logs: string[];
}

export interface GameSettings {
  playerCount: 2 | 3 | 4;
  names: Record<PlayerColor, string>;
}