export type PlayerColor = "coral" | "sky" | "mint" | "amber";

export type GamePhase = "setup" | "playing" | "finished";

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  startIndex: number;
}

export interface TokenState {
  id: string;
  playerId: string;
  progress: number;
}

export interface TurnHistoryEntry {
  id: string;
  playerId: string;
  roll: number;
  message: string;
}

export interface Coordinate {
  row: number;
  col: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  tokens: TokenState[];
  currentPlayerIndex: number;
  diceValue: number | null;
  consecutiveSixes: number;
  history: TurnHistoryEntry[];
  validTokenIds: string[];
  winnerId: string | null;
  lastRoll: number | null;
  lastRollByPlayer: Record<string, number | null>;
  message: string;
}

export interface PlayerSetup {
  names: string[];
}

export const PLAYER_COLORS: Record<
  PlayerColor,
  { label: string; hex: string; soft: string }
> = {
  coral: { label: "Merah", hex: "#ef6758", soft: "#ffebe7" },
  sky: { label: "Biru", hex: "#4b9fe1", soft: "#e5f3ff" },
  mint: { label: "Hijau", hex: "#39ad8c", soft: "#e2f6ef" },
  amber: { label: "Kuning", hex: "#e7aa38", soft: "#fff3d9" },
};

export const COLOR_SEATS: PlayerColor[] = ["coral", "sky", "mint", "amber"];
