"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  gameReducer,
  initialGameState,
  type GameAction,
} from "@/src/lib/engine/reducer";
import type { GameState, PlayerSetup } from "@/src/types/game";

interface GameStore {
  game: GameState;
  pathHintEnabled: boolean;
  togglePathHint: () => void;
  setup: (payload: PlayerSetup) => void;
  rollDice: () => void;
  moveToken: (tokenId: string) => void;
  resetGame: () => void;
  backToMenu: () => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

function dispatch(state: GameStore, action: GameAction): GameState {
  return gameReducer(state.game, action);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: initialGameState,
      pathHintEnabled: false,
      togglePathHint: () =>
        set((state) => ({ pathHintEnabled: !state.pathHintEnabled })),
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setup: (payload) =>
        set((state) => ({ game: dispatch(state, { type: "setup", payload }) })),
      rollDice: () =>
        set((state) => ({
          game: dispatch(state, {
            type: "roll",
            payload: { value: Math.floor(Math.random() * 6) + 1 },
          }),
        })),
      moveToken: (tokenId) =>
        set((state) =>
          ({ game: dispatch(state, { type: "move", payload: { tokenId } }) }),
        ),
      resetGame: () =>
        set((state) => ({ game: dispatch(state, { type: "reset" }) })),
      backToMenu: () => set({ game: initialGameState }),
    }),
    {
      name: "ludoo-game",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        game: state.game,
        pathHintEnabled: state.pathHintEnabled,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.error("Gagal memulihkan permainan Ludo:", error);
      },
    },
  ),
);
