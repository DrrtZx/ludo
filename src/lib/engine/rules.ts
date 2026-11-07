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
      if (token.progress === -1) {
        return (
          diceValue === 6 &&
          !hasOpponentBlockadeOnPath(state, player, token, diceValue)
        );
      }
      return (
        token.progress + diceValue <= FINISH_PROGRESS &&
        !hasOpponentBlockadeOnPath(state, player, token, diceValue)
      );
    })
    .map((token) => token.id);
}

function trackOccupantsAt(
  state: GameState,
  trackIndex: number,
): TokenState[] {
  return state.tokens.filter((candidate) => {
    if (candidate.progress < 0 || candidate.progress > 51) return false;
    const owner = state.players.find(
      (player) => player.id === candidate.playerId,
    );
    return owner
      ? trackIndexForProgress(owner.startIndex, candidate.progress) === trackIndex
      : false;
  });
}

function hasOpponentBlockade(
  state: GameState,
  player: Player,
  trackIndex: number,
): boolean {
  const occupants = trackOccupantsAt(state, trackIndex);
  return state.players.some((owner) => {
    if (owner.id === player.id) return false;
    return (
      occupants.filter((token) => token.playerId === owner.id).length >= 2
    );
  });
}

export function hasOpponentBlockadeOnPath(
  state: GameState,
  player: Player,
  token: TokenState,
  diceValue: number,
): boolean {
  const startProgress = token.progress === -1 ? 0 : token.progress + 1;
  const endProgress =
    token.progress === -1 ? 0 : token.progress + diceValue;

  for (
    let progress = startProgress;
    progress <= endProgress && progress <= 51;
    progress += 1
  ) {
    const trackIndex = trackIndexForProgress(player.startIndex, progress);
    if (trackIndex !== null && hasOpponentBlockade(state, player, trackIndex)) {
      return true;
    }
  }
  return false;
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
