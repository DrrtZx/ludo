"use client";

import type { CSSProperties } from "react";
import { PLAYER_COLORS, type Player } from "@/src/types/game";

interface WinnerModalProps {
  players: Player[];
  finishOrder: string[];
  onPlayAgain: () => void;
}

const CONFETTI_COUNT = 16;
const MEDALS = ["🥇", "🥈", "🥉"];

export default function WinnerModal({
  players,
  finishOrder,
  onPlayAgain,
}: WinnerModalProps) {
  // Podium mengikuti jumlah pemain: 4 pemain tampil Juara 1-3,
  // 3 pemain Juara 1-2, 2 pemain Juara 1 saja.
  const podium = finishOrder
    .slice(0, Math.max(players.length - 1, 1))
    .flatMap((id, index) => {
      const player = players.find((candidate) => candidate.id === id);
      return player ? [{ rank: index + 1, player }] : [];
    });
  const champion = podium[0]?.player;

  return (
    <div className="winner-backdrop">
      <section
        aria-labelledby="winner-title"
        aria-modal="true"
        className="winner-card"
        role="dialog"
      >
        <div aria-hidden="true" className="confetti-burst">
          {Array.from({ length: CONFETTI_COUNT }, (_, index) => (
            <span
              className="confetti-piece"
              key={index}
              style={{ "--i": index } as CSSProperties}
            />
          ))}
        </div>
        <div aria-hidden="true" className="winner-trophy">
          🏆
        </div>
        <h2 className="winner-title" id="winner-title">
          {champion ? `${champion.name} menang!` : "Permainan selesai!"}
        </h2>
        {podium.length > 0 && (
          <div aria-label="Podium juara" className="podium-list">
            {podium.map(({ player, rank }) => (
              <div className="podium-row" key={player.id}>
                <span aria-hidden="true" className="podium-medal">
                  {MEDALS[rank - 1] ?? "🏅"}
                </span>
                <span className="podium-label">Juara {rank}</span>
                <span
                  aria-hidden="true"
                  className="podium-dot"
                  style={
                    { "--player-color": PLAYER_COLORS[player.color].hex } as CSSProperties
                  }
                />
                <strong className="podium-name">{player.name}</strong>
              </div>
            ))}
          </div>
        )}
        <button className="primary-button" onClick={onPlayAgain} type="button">
          Main lagi <span aria-hidden="true">↻</span>
        </button>
      </section>
    </div>
  );
}
