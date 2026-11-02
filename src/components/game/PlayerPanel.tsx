"use client";

import type { CSSProperties } from "react";
import { PLAYER_COLORS, type Player, type TokenState } from "@/src/types/game";

interface PlayerPanelProps {
  player: Player;
  tokens: TokenState[];
  active: boolean;
}

export default function PlayerPanel({
  player,
  tokens,
  active,
}: PlayerPanelProps) {
  const profile = PLAYER_COLORS[player.color];
  const homeCount = tokens.filter(
    (token) => token.playerId === player.id && token.progress === 57,
  ).length;
  const style = {
    "--player-color": profile.hex,
    "--player-soft": profile.soft,
  } as CSSProperties;
  return (
    <section
      aria-label={`${player.name}${active ? ", giliran sekarang" : ""}`}
      className={`player-seat-info${active ? " is-active" : ""}`}
      style={style}
    >
      <div className="player-seat-info">
        <div aria-hidden="true" className="player-avatar">
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div className="player-copy">
          <p className="player-name">{player.name}</p>
          <p className="player-progress">{homeCount} / 4 di rumah</p>
        </div>
        {active && <span className="player-turn-tag">GILIRAN</span>}
      </div>
    </section>
  );
}
