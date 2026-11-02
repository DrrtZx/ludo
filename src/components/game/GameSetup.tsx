"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/src/store/gameStore";
import {
  COLOR_SEATS,
  PLAYER_COLORS,
  type PlayerColor,
} from "@/src/types/game";

export default function GameSetup() {
  const router = useRouter();
  const setup = useGameStore((state) => state.setup);
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["Pemain 1", "Pemain 2", "Pemain 3", "Pemain 4"]);

  function updateName(index: number, value: string) {
    setNames((current) =>
      current.map((name, currentIndex) =>
        currentIndex === index ? value : name,
      ),
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar page-width">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            🎲
          </div>
          <div>
            <p className="brand-name">ludoo</p>
            <p className="brand-caption">main bareng, satu meja</p>
          </div>
        </div>
        <div className="local-badge">
          <span className="online-dot" />
          Pass &amp; play
        </div>
      </header>

      <section className="setup-wrap">
        <div className="setup-card">
          <div className="setup-hero">
            <div className="setup-illustration" aria-hidden="true">
              🎲
            </div>
            <p className="eyebrow">Game malam ini</p>
            <h1 className="setup-title">Siap main Ludo?</h1>
            <p className="setup-description">
              Kumpulkan teman di satu perangkat dan bawa semua pionmu pulang.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setup({ names: names.slice(0, playerCount) });
              router.push("/game");
            }}
          >
            <label className="form-label">Jumlah pemain</label>
            <div aria-label="Jumlah pemain" className="player-count-options" role="group">
              {[2, 3, 4].map((count) => (
                <button
                  aria-pressed={playerCount === count}
                  className={`count-option${playerCount === count ? " is-selected" : ""}`}
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  type="button"
                >
                  {count} pemain
                </button>
              ))}
            </div>

            <label className="form-label" htmlFor="player-name-0">
              Nama pemain
            </label>
            <div className="name-fields">
              {names.slice(0, playerCount).map((name, index) => {
                const setupColors: PlayerColor[] =
                  playerCount === 2
                    ? [COLOR_SEATS[0], COLOR_SEATS[2]]
                    : COLOR_SEATS.slice(0, playerCount);
                const color = setupColors[index];
                const profile = PLAYER_COLORS[color];
                return (
                  <div className="name-field-wrap" key={index}>
                    <span
                      aria-hidden="true"
                      className="name-color-dot"
                      style={{ "--player-color": profile.hex } as CSSProperties}
                    />
                    <input
                      autoComplete="off"
                      className="name-input"
                      id={`player-name-${index}`}
                      maxLength={18}
                      onChange={(event) => updateName(index, event.target.value)}
                      placeholder={`Pemain ${index + 1}`}
                      value={name}
                    />
                  </div>
                );
              })}
            </div>

            <button className="primary-button" type="submit">
              Mulai permainan <span aria-hidden="true">→</span>
            </button>
            <p className="setup-note">
              Semua pemain berbagi layar. Giliran berpindah otomatis setelah langkah.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
