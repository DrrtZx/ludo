"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LudoBoard from "@/src/components/game/LudoBoard";
import WinnerModal from "@/src/components/game/WinnerModal";
import { useGameStore } from "@/src/store/gameStore";

export default function GameShell() {
  const router = useRouter();
  const game = useGameStore((state) => state.game);
  const rollDice = useGameStore((state) => state.rollDice);
  const moveToken = useGameStore((state) => state.moveToken);
  const resetGame = useGameStore((state) => state.resetGame);
  const backToMenu = useGameStore((state) => state.backToMenu);
  const hasHydrated = useGameStore((state) => state.hasHydrated);
  const setHasHydrated = useGameStore((state) => state.setHasHydrated);
  const pathHintEnabled = useGameStore((state) => state.pathHintEnabled);
  const togglePathHint = useGameStore((state) => state.togglePathHint);
  const [showResetOptions, setShowResetOptions] = useState(false);

  useEffect(() => {
    void Promise.resolve(useGameStore.persist.rehydrate())
      .catch((error: unknown) => {
        console.error("Gagal memuat permainan tersimpan:", error);
      })
      .finally(() => setHasHydrated(true));
  }, [setHasHydrated]);

  useEffect(() => {
    if (hasHydrated && game.phase === "setup") router.replace("/");
  }, [game.phase, hasHydrated, router]);

  if (!hasHydrated) return null;
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer) return null;
  const winner = game.players.find((player) => player.id === game.winnerId);

  return (
    <main className="app-shell game-page">
      <header className="topbar game-topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            🎲
          </div>
          <div>
            <p className="brand-name">ludoo</p>
            <p className="brand-caption">main bareng, satu meja</p>
          </div>
        </div>
        <div className="game-top-actions">
          <span className="local-badge">
            <span className="online-dot" />
            Pass &amp; play
          </span>
          <button
            aria-pressed={pathHintEnabled}
            className={`toggle-chip${pathHintEnabled ? " is-on" : ""}`}
            onClick={togglePathHint}
            type="button"
          >
            <span aria-hidden="true" className="toggle-dot" />
            Arah jalur: {pathHintEnabled ? "ON" : "OFF"}
          </button>
          <button className="secondary-button restart-button" onClick={() => setShowResetOptions(true)} type="button">
            <span aria-hidden="true">↻</span> Reset
          </button>
        </div>
      </header>

      <div className="game-room">
        <p aria-live="polite" className="game-status-message">
          {game.message}
        </p>
        <section aria-label="Permainan Ludo" className="game-board-area game-board-stage">
          <LudoBoard
            currentPlayer={currentPlayer}
            onMove={moveToken}
            players={game.players}
            tokens={game.tokens}
            validTokenIds={game.validTokenIds}
            currentPlayerId={currentPlayer.id}
            diceValue={game.diceValue}
            lastRollByPlayer={game.lastRollByPlayer}
            onRoll={rollDice}
          />
        </section>
        <aside aria-label="Riwayat giliran" className="turn-history">
          <strong>Riwayat dadu</strong>
          {(game.history ?? []).slice(-5).reverse().map((entry) => {
            const player = game.players.find(
              (candidate) => candidate.id === entry.playerId,
            );
            return (
              <span key={entry.id}>
                {player?.name ?? "Pemain"} · {entry.roll}
              </span>
            );
          })}
        </aside>
      </div>

      {winner && (
        <WinnerModal
          finishOrder={game.finishOrder ?? []}
          onPlayAgain={resetGame}
          players={game.players}
        />
      )}
      {showResetOptions && (
        <div className="winner-backdrop">
          <section
            aria-labelledby="reset-title"
            aria-modal="true"
            className="winner-card reset-card"
            role="dialog"
          >
            <h2 className="winner-title" id="reset-title">
              Mau ke mana?
            </h2>
            <p className="winner-message">
              Ulangi permainan dengan pemain yang sama, atau kembali ke menu.
            </p>
            <div className="reset-actions">
              <button
                className="primary-button"
                onClick={() => {
                  resetGame();
                  setShowResetOptions(false);
                }}
                type="button"
              >
                Reset game
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  backToMenu();
                  router.push("/");
                }}
                type="button"
              >
                Kembali ke menu
              </button>
              <button
                className="text-button"
                onClick={() => setShowResetOptions(false)}
                type="button"
              >
                Batal
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
