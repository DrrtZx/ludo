"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { PLAYER_COLORS, type Player } from "@/src/types/game";
import { playDiceRollSound } from "@/src/lib/audio/sounds";

const PIPS: Record<number, number[]> = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

interface DicePanelProps {
  player: Player;
  diceValue: number | null;
  lastRoll: number | null;
  canRoll: boolean;
  isActive: boolean;
  onRoll: () => void;
}

export default function DicePanel({
  player,
  diceValue,
  lastRoll,
  canRoll,
  isActive,
  onRoll,
}: DicePanelProps) {
  const [rolling, setRolling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [rollPreview, setRollPreview] = useState<number | null>(null);
  const displayedValue = rollPreview ?? diceValue ?? lastRoll ?? 0;
  const pipPositions = PIPS[displayedValue] ?? [];

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  function handleRoll() {
    if (!canRoll || rolling) return;
    playDiceRollSound();
    setRolling(true);
    setRollPreview(Math.floor(Math.random() * 6) + 1);
    intervalRef.current = setInterval(() => {
      setRollPreview(Math.floor(Math.random() * 6) + 1);
    }, 90);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      onRoll();
      setRollPreview(null);
      setRolling(false);
    }, 780);
  }

  return (
    <div
      className={`dice-control${isActive ? " is-active" : ""}`}
      style={{ "--player-color": PLAYER_COLORS[player.color].hex } as CSSProperties}
    >
      <button
        aria-label={`${rolling ? "Dadu sedang menggelinding" : canRoll ? `Lempar dadu untuk ${player.name}` : `Dadu ${player.name}, menunggu giliran`}. ${displayedValue ? `Nilai ${displayedValue}.` : "Belum dilempar."}`}
        className={`dice-stage${rolling ? " is-rolling" : ""}`}
        disabled={!canRoll || rolling}
        onClick={handleRoll}
        type="button"
      >
        <div className="dice-perspective">
          <span aria-hidden="true" className="dice-face">
            {Array.from({ length: 9 }, (_, index) => (
              <span
                aria-hidden="true"
                className={`dice-pip${pipPositions.includes(index) ? "" : " is-hidden"}`}
                key={index}
              />
            ))}
          </span>
        </div>
      </button>
      <span aria-live="polite" className="dice-hint">
        {rolling
          ? "Menggelinding..."
          : isActive
            ? `${player.name} · lempar`
            : `${player.name} · tunggu`}
      </span>
    </div>
  );
}
