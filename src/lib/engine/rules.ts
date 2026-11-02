import {
  HOME_LANES,
  SAFE_TRACK_INDICES,
  TRACK_PATH,
  trackIndexForProgress,
} from "@/src/lib/engine/board";
import type { GameState, Player, TokenState } from "@/src/types/game";
import type { Coordinate } from "@/src/types/game";

export const FINISH_PROGRESS = 57;
export const HOME_LANE_START = 52;

export function legalTokenIds(
  state: GameState,
  player: Player,
  diceValue: number,
): string[] {
  return state.tokens
    .filter((token) => token.playerId === player.id)
    .filter((token) => {
      if (token.progress === FINISH_PROGRESS) return false;
      if (token.progress === -1) return diceValue === 6;
      return token.progress + diceValue <= FINISH_PROGRESS;
    })
    .map((token) => token.id);
}

export function destinationProgress(
  token: TokenState,
  diceValue: number,
): number {
  return token.progress === -1 ? 0 : token.progress + diceValue;
}

export function tokenCoordinate(
  player: Player,
  progress: number,
): Coordinate | null {
  if (progress < 0 || progress > FINISH_PROGRESS) return null;
  if (progress >= HOME_LANE_START) {
    return HOME_LANES[player.color][progress - HOME_LANE_START] ?? null;
  }
  const index = trackIndexForProgress(player.startIndex, progress);
  return index === null ? null : TRACK_PATH[index];
}

export function capturedTokenIds(
  tokens: TokenState[],
  players: Player[],
  mover: Player,
  destination: number,
): string[] {
  const landingTrackIndex = trackIndexForProgress(
    mover.startIndex,
    destination,
  );
  if (
    landingTrackIndex === null ||
    SAFE_TRACK_INDICES.has(landingTrackIndex)
  ) {
    return [];
  }

  return tokens
    .filter((token) => token.playerId !== mover.id && token.progress >= 0)
    .filter((token) => {
      const owner = players.find((player) => player.id === token.playerId);
      if (!owner) return false;
      const index = trackIndexForProgress(owner.startIndex, token.progress);
      return index === landingTrackIndex;
    })
    .map((token) => token.id);
}
