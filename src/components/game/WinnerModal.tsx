"use client";

import type { Player } from "@/src/types/game";

interface WinnerModalProps {
  winner: Player;
  onPlayAgain: () => void;
}

export default function WinnerModal({
  winner,
  onPlayAgain,
}: WinnerModalProps) {
  return (
    <div className="winner-backdrop">
      <section
        aria-labelledby="winner-title"
        aria-modal="true"
        className="winner-card"
        role="dialog"
      >
        <div aria-hidden="true" className="winner-trophy">
          🏆
        </div>
        <h2 className="winner-title" id="winner-title">
          {winner.name} menang!
        </h2>
        <p className="winner-message">
          Semua pion sudah sampai di rumah. Main satu ronde lagi?
        </p>
        <button className="primary-button" onClick={onPlayAgain} type="button">
          Main lagi <span aria-hidden="true">↻</span>
        </button>
      </section>
    </div>
  );
}
