"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  coordinateKey,
  HOME_BASE_COORDS,
  HOME_LANES,
  SAFE_TRACK_INDICES,
  START_INDICES,
  TRACK_PATH,
} from "@/src/lib/engine/board";
import { tokenCoordinate } from "@/src/lib/engine/rules";
import { playTokenStepSound } from "@/src/lib/audio/sounds";
import {
  PLAYER_COLORS,
  type Coordinate,
  type Player,
  type PlayerColor,
  type TokenState,
} from "@/src/types/game";
import DicePanel from "./DicePanel";
import Token from "./Token";

const TRACK_CELLS = new Map(
  TRACK_PATH.map((coordinate, index) => [coordinateKey(coordinate), index]),
);

interface AnimatedToken {
  id: string;
  coordinate: Coordinate;
  step: number;
  color: string;
}

function tokenBaseCoordinate(token: TokenState, player: Player): Coordinate {
  const slot = Number(token.id.slice(token.id.lastIndexOf("-") + 1)) - 1;
  return HOME_BASE_COORDS[player.color][slot] ?? HOME_BASE_COORDS[player.color][0];
}

function baseColorForCell(row: number, col: number): PlayerColor | null {
  if (row < 6 && col < 6) return "coral";
  if (row < 6 && col > 8) return "sky";
  if (row > 8 && col > 8) return "mint";
  if (row > 8 && col < 6) return "amber";
  return null;
}

function cellStyle(color: PlayerColor): CSSProperties {
  const profile = PLAYER_COLORS[color];
  return {
    "--player-color": profile.hex,
    "--player-soft": profile.soft,
  } as CSSProperties;
}

interface LudoBoardProps {
  players: Player[];
  tokens: TokenState[];
  currentPlayer: Player;
  validTokenIds: string[];
  diceValue: number | null;
  currentPlayerId: string;
  lastRollByPlayer: Record<string, number | null>;
  onRoll: () => void;
  onMove: (tokenId: string) => void;
}

export default function LudoBoard({
  players,
  tokens,
  currentPlayer,
  validTokenIds,
  diceValue,
  currentPlayerId,
  lastRollByPlayer,
  onRoll,
  onMove,
}: LudoBoardProps) {
  const coordinates = useMemo(() => {
    const result = new Map<string, TokenState[]>();
    for (const token of tokens) {
      const owner = players.find((player) => player.id === token.playerId);
      if (!owner) continue;
      const coordinate =
        token.progress === -1
          ? tokenBaseCoordinate(token, owner)
          : tokenCoordinate(owner, token.progress);
      if (!coordinate) continue;
      const key = coordinateKey(coordinate);
      result.set(key, [...(result.get(key) ?? []), token]);
    }
    return result;
  }, [players, tokens]);

  const startCells = useMemo(
    () =>
      new Map(
        players.map((player) => [
          coordinateKey(TRACK_PATH[START_INDICES[player.color]]),
          player.color,
        ]),
      ),
    [players],
  );
  const laneCells = useMemo(() => {
    const result = new Map<string, PlayerColor>();
    for (const player of players) {
      for (const coordinate of HOME_LANES[player.color]) {
        result.set(coordinateKey(coordinate), player.color);
      }
    }
    return result;
  }, [players]);
  const validIds = new Set(validTokenIds);
  const [animatedToken, setAnimatedToken] = useState<AnimatedToken | null>(null);
  const movingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function animateMove(tokenId: string) {
    if (movingRef.current) return;
    const token = tokens.find((candidate) => candidate.id === tokenId);
    const owner = players.find((candidate) => candidate.id === token?.playerId);
    if (!token || !owner) return;

    const source =
      token.progress === -1
        ? tokenBaseCoordinate(token, owner)
        : tokenCoordinate(owner, token.progress);
    if (!source) return;

    const route = [source];
    if (token.progress === -1) {
      const start = tokenCoordinate(owner, 0);
      if (start) route.push(start);
    } else {
      if (diceValue === null) return;
      for (
        let progress = token.progress + 1;
        progress <= token.progress + diceValue;
        progress += 1
      ) {
        const coordinate = tokenCoordinate(owner, progress);
        if (coordinate) route.push(coordinate);
      }
    }

    movingRef.current = true;
    setAnimatedToken({
      id: tokenId,
      coordinate: source,
      step: 0,
      color: PLAYER_COLORS[owner.color].hex,
    });

    let step = 0;
    const advance = () => {
      step += 1;
      playTokenStepSound(step);
      if (step >= route.length) {
        onMove(tokenId);
        setAnimatedToken(null);
        movingRef.current = false;
        timerRef.current = null;
        return;
      }
      setAnimatedToken({
        id: tokenId,
        coordinate: route[step],
        step,
        color: PLAYER_COLORS[owner.color].hex,
      });
      timerRef.current = setTimeout(advance, 125);
    };

    timerRef.current = setTimeout(advance, 35);
  }

  return (
    <div className="board-card">
      <div className="board-heading">
        <h2>Papan permainan</h2>
        <span className="board-hint">
          {validIds.size > 0
            ? "Pilih pion yang menyala"
            : "Bawa 4 pionmu ke tengah"}
        </span>
      </div>
      <div className="board-frame">
        <div aria-label="Dadu pemain di base" className="base-dice-layer">
          {players.map((player) => {
            const active = player.id === currentPlayerId;
            return (
              <div
                className={`base-dice-position base-dice-${player.color}`}
                key={player.id}
              >
                <DicePanel
                  canRoll={active && diceValue === null}
                  diceValue={active ? diceValue : null}
                  isActive={active}
                  lastRoll={lastRollByPlayer[player.id] ?? null}
                  onRoll={onRoll}
                  player={player}
                />
              </div>
            );
          })}
        </div>
        <div
          aria-label="Papan Ludo"
          className="ludo-board"
          role="group"
        >
          {Array.from({ length: 225 }, (_, index) => {
            const row = Math.floor(index / 15);
            const col = index % 15;
            const key = `${row},${col}`;
            const trackIndex = TRACK_CELLS.get(key);
            const laneColor = laneCells.get(key);
            const baseColor = baseColorForCell(row, col);
            const isBasePad =
              (row === 1 || row === 4 || row === 10 || row === 13) &&
              (col === 1 || col === 4 || col === 10 || col === 13) &&
              baseColor !== null;
            const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
            const startColor = startCells.get(key);
            const occupants = coordinates.get(key) ?? [];
            const styleColor = laneColor ?? startColor ?? baseColor;
            const classNames = [
              "board-cell",
              baseColor ? "base-area" : "",
              isBasePad ? "home-pad" : "",
              trackIndex !== undefined ? "track-cell" : "",
              trackIndex !== undefined && SAFE_TRACK_INDICES.has(trackIndex)
                ? "safe-cell"
                : "",
              startColor ? "start-cell" : "",
              laneColor ? "home-lane-cell" : "",
              isCenter ? "center-cell" : "",
              row === 7 && col === 7 ? "center-core" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                className={classNames}
                key={key}
                style={{
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  ...(styleColor ? cellStyle(styleColor) : {}),
                }}
              >
                {trackIndex !== undefined &&
                  SAFE_TRACK_INDICES.has(trackIndex) &&
                  occupants.length === 0 && (
                    <span aria-hidden="true" className="safe-star">
                      ★
                    </span>
                  )}
                {occupants.length > 0 && (
                  <div className="token-stack">
                    {occupants.map((token) => {
                      if (animatedToken?.id === token.id) return null;
                      const owner = players.find(
                        (player) => player.id === token.playerId,
                      );
                      if (!owner) return null;
                      const profile = PLAYER_COLORS[owner.color];
                      const selectable = validIds.has(token.id);
                      const onCurrentPlayer = owner.id === currentPlayer.id;
                      return (
                        <Token
                          color={profile.hex}
                          id={token.id}
                          key={token.id}
                          label={`${owner.name}, pion ${token.id.slice(-1)}${selectable ? ", pilih untuk bergerak" : ""}`}
                          onClick={() => animateMove(token.id)}
                          selectable={selectable}
                          small={!onCurrentPlayer && occupants.length > 1}
                        />
                      );
                    })}
                    {animatedToken && (
                      <div
                        aria-hidden="true"
                        className="animated-token"
                        key={animatedToken.id}
                        style={{
                          left: `${((animatedToken.coordinate.col + 0.5) / 15) * 100}%`,
                          top: `${((animatedToken.coordinate.row + 0.5) / 15) * 100}%`,
                          "--player-color": animatedToken.color,
                          "--hop-y": animatedToken.step % 2 === 1 ? "-7px" : "0px",
                          "--hop-scale": animatedToken.step % 2 === 1 ? "1.08" : "1",
                        } as CSSProperties}
                      >
                        <span className="token-shine" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div aria-label="Warna pemain" className="board-footer">
        {players.map((player) => (
          <span className="legend-item" key={player.id}>
            <span
              className="legend-dot"
              style={{ "--player-color": PLAYER_COLORS[player.color].hex } as CSSProperties}
            />
            {player.name}
          </span>
        ))}
      </div>
    </div>
  );
}
