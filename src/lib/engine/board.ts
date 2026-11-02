import type { Coordinate, PlayerColor } from "@/src/types/game";

export const TRACK_PATH: Coordinate[] = [
  { row: 6, col: 1 },
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6 },
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  { row: 0, col: 7 },
  { row: 0, col: 8 },
  { row: 1, col: 8 },
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12 },
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  { row: 7, col: 14 },
  { row: 8, col: 14 },
  { row: 8, col: 13 },
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8 },
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  { row: 14, col: 7 },
  { row: 14, col: 6 },
  { row: 13, col: 6 },
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 2 },
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  { row: 7, col: 0 },
  { row: 6, col: 0 },
];

export const START_INDICES: Record<PlayerColor, number> = {
  coral: 0,
  sky: 13,
  mint: 26,
  amber: 39,
};

export const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const HOME_LANES: Record<PlayerColor, Coordinate[]> = {
  coral: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 6 },
  ],
  sky: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6, col: 7 },
  ],
  mint: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7, col: 8 },
  ],
  amber: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8, col: 7 },
  ],
};

export const HOME_BASE_COORDS: Record<PlayerColor, Coordinate[]> = {
  coral: [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 4, col: 1 },
    { row: 4, col: 4 },
  ],
  sky: [
    { row: 1, col: 10 },
    { row: 1, col: 13 },
    { row: 4, col: 10 },
    { row: 4, col: 13 },
  ],
  mint: [
    { row: 10, col: 10 },
    { row: 10, col: 13 },
    { row: 13, col: 10 },
    { row: 13, col: 13 },
  ],
  amber: [
    { row: 10, col: 1 },
    { row: 10, col: 4 },
    { row: 13, col: 1 },
    { row: 13, col: 4 },
  ],
};

export function trackIndexForProgress(
  startIndex: number,
  progress: number,
): number | null {
  if (progress < 0 || progress > 51) return null;
  return (startIndex + progress) % TRACK_PATH.length;
}

export function coordinateKey({ row, col }: Coordinate): string {
  return `${row},${col}`;
}
