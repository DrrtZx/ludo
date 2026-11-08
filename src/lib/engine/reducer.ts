import {
  COLOR_SEATS,
  type GameState,
  type Player,
  type PlayerColor,
  type PlayerSetup,
  type TokenState,
} from "@/src/types/game";
import { START_INDICES } from "@/src/lib/engine/board";
import {
  capturedTokenIds,
  destinationProgress,
  FINISH_PROGRESS,
  legalTokenIds,
} from "@/src/lib/engine/rules";

export type GameAction =
  | { type: "setup"; payload: PlayerSetup }
  | { type: "roll"; payload: { value: number } }
  | { type: "move"; payload: { tokenId: string } }
  | { type: "reset" };

export const initialGameState: GameState = {
  phase: "setup",
  players: [],
  tokens: [],
  currentPlayerIndex: 0,
  diceValue: null,
  consecutiveSixes: 0,
  history: [],
  validTokenIds: [],
  winnerId: null,
  lastRoll: null,
  lastRollByPlayer: {},
  finishOrder: [],
  message: "Pilih jumlah pemain dan siapkan permainan.",
};

function freshMatch(players: Player[]): GameState {
  const tokens: TokenState[] = players.flatMap((player) =>
    Array.from({ length: 4 }, (_, index) => ({
      id: `${player.id}-token-${index + 1}`,
      playerId: player.id,
      progress: -1,
    })),
  );
  return {
    phase: "playing",
    players,
    tokens,
    currentPlayerIndex: 0,
    diceValue: null,
    consecutiveSixes: 0,
    history: [],
    validTokenIds: [],
    winnerId: null,
    lastRoll: null,
    lastRollByPlayer: Object.fromEntries(
      players.map((player) => [player.id, null]),
    ),
    finishOrder: [],
    message: `${players[0]?.name ?? "Pemain"} memulai permainan. Dapatkan 6 untuk mengeluarkan pion.`,
  };
}

function playersFromSetup({ names }: PlayerSetup): Player[] {
  const colors: PlayerColor[] =
    names.length === 2
      ? [COLOR_SEATS[0], COLOR_SEATS[2]]
      : COLOR_SEATS.slice(0, names.length);
  return names.map((name, index) => {
    const color = colors[index];
    return {
      id: `player-${index + 1}`,
      name: name.trim() || `Pemain ${index + 1}`,
      color,
      startIndex: START_INDICES[color],
    };
  });
}

function nextPlayerIndex(state: GameState): number {
  return (state.currentPlayerIndex + 1) % state.players.length;
}

function playersWhoFinished(
  tokens: TokenState[],
  players: Player[],
): string[] {
  return players
    .filter((player) =>
      tokens
        .filter((token) => token.playerId === player.id)
        .every((token) => token.progress === FINISH_PROGRESS),
    )
    .map((player) => player.id);
}

// Giliran berikutnya: pemain yang sudah finis dilewati.
function nextUnfinishedIndex(state: GameState, finishOrder: string[]): number {
  let index = nextPlayerIndex(state);
  while (finishOrder.includes(state.players[index]?.id ?? "")) {
    index = (index + 1) % state.players.length;
  }
  return index;
}

function addHistory(
  state: GameState,
  playerId: string,
  roll: number,
  message: string,
): GameState["history"] {
  const history = state.history ?? [];
  return [
    ...history,
    { id: `${playerId}-${history.length}-${roll}`, playerId, roll, message },
  ].slice(-8);
}

export function gameReducer(
  state: GameState,
  action: GameAction,
): GameState {
  switch (action.type) {
    case "setup": {
      if (action.payload.names.length < 2 || action.payload.names.length > 4) {
        return state;
      }
      return freshMatch(playersFromSetup(action.payload));
    }

    case "roll": {
      if (
        state.phase !== "playing" ||
        state.diceValue !== null ||
        !Number.isInteger(action.payload.value) ||
        action.payload.value < 1 ||
        action.payload.value > 6
      ) {
        return state;
      }

      const player = state.players[state.currentPlayerIndex];
      if (!player) return state;
      const consecutiveSixes =
        action.payload.value === 6 ? (state.consecutiveSixes ?? 0) + 1 : 0;
      const baseRollState = {
        lastRoll: action.payload.value,
        lastRollByPlayer: {
          ...state.lastRollByPlayer,
          [player.id]: action.payload.value,
        },
      };

      if (consecutiveSixes >= 3) {
        const nextIndex = nextUnfinishedIndex(state, state.finishOrder ?? []);
        const message = `${player.name} mendapat Triple 6. Lemparan ketiga dibatalkan.`;
        return {
          ...state,
          ...baseRollState,
          currentPlayerIndex: nextIndex,
          diceValue: null,
          consecutiveSixes: 0,
          validTokenIds: [],
          history: addHistory(
            state,
            player.id,
            action.payload.value,
            message,
          ),
          message,
        };
      }

      const moves = legalTokenIds(state, player, action.payload.value);
      if (moves.length === 0) {
        const nextIndex = nextUnfinishedIndex(state, state.finishOrder ?? []);
        const nextPlayer = state.players[nextIndex];
        const message = `${player.name} mendapat ${action.payload.value}, tetapi tidak ada langkah yang valid. Giliran ${nextPlayer.name}.`;
        return {
          ...state,
          ...baseRollState,
          currentPlayerIndex: nextIndex,
          diceValue: null,
          consecutiveSixes: 0,
          validTokenIds: [],
          history: addHistory(
            state,
            player.id,
            action.payload.value,
            message,
          ),
          message,
        };
      }
      const message =
        action.payload.value === 6
          ? `${player.name} mendapat 6! Pilih pion untuk melangkah.`
          : `${player.name}, pilih salah satu pion yang menyala.`;
      return {
        ...state,
        ...baseRollState,
        diceValue: action.payload.value,
        consecutiveSixes,
        validTokenIds: moves,
        history: addHistory(
          state,
          player.id,
          action.payload.value,
          message,
        ),
        message,
      };
    }

    case "move": {
      if (
        state.phase !== "playing" ||
        state.diceValue === null ||
        !state.validTokenIds.includes(action.payload.tokenId)
      ) {
        return state;
      }

      const player = state.players[state.currentPlayerIndex];
      const movingToken = state.tokens.find(
        (token) => token.id === action.payload.tokenId,
      );
      if (!player || !movingToken) return state;

      const nextProgress = destinationProgress(movingToken, state.diceValue);
      const capturedIds = capturedTokenIds(
        state.tokens,
        state.players,
        player,
        nextProgress,
      );
      const capturedSet = new Set(capturedIds);
      const tokens = state.tokens.map((token) => {
        if (token.id === movingToken.id) {
          return { ...token, progress: nextProgress };
        }
        return capturedSet.has(token.id)
          ? { ...token, progress: -1 }
          : token;
      });

      const finishOrder = state.finishOrder ?? [];
      const newFinishers = playersWhoFinished(tokens, state.players).filter(
        (id) => !finishOrder.includes(id),
      );
      const updatedFinishOrder = [...finishOrder, ...newFinishers];

      // Podium urutan finis: 4 pemain berhenti saat 3 orang finis,
      // 3 pemain saat 2 orang, 2 pemain saat 1 orang.
      if (updatedFinishOrder.length >= state.players.length - 1) {
        const champion = state.players.find(
          (candidate) => candidate.id === updatedFinishOrder[0],
        );
        return {
          ...state,
          phase: "finished",
          tokens,
          finishOrder: updatedFinishOrder,
          diceValue: null,
          consecutiveSixes: 0,
          validTokenIds: [],
          winnerId: champion?.id ?? null,
          message: `${champion?.name ?? player.name} menang! Permainan selesai.`,
        };
      }

      const captured = capturedIds.length > 0;
      const reachedHome = nextProgress === FINISH_PROGRESS;
      const moverFinished = newFinishers.includes(player.id);
      const extraTurn =
        !moverFinished && (state.diceValue === 6 || captured || reachedHome);
      const currentPlayerIndex = extraTurn
        ? state.currentPlayerIndex
        : nextUnfinishedIndex(state, updatedFinishOrder);
      const nextPlayer = state.players[currentPlayerIndex];
      const podiumPosition = updatedFinishOrder.indexOf(player.id) + 1;
      const eventMessages = [
        captured ? `CAPTURED! ${capturedIds.length} pion lawan kembali ke base.` : "",
        reachedHome && !moverFinished ? "HOME! Lempar lagi." : "",
        moverFinished
          ? `${player.name} finis di posisi ${podiumPosition}!`
          : "",
      ].filter(Boolean);
      const message = moverFinished
        ? `${eventMessages.join(" ")} Giliran ${nextPlayer?.name ?? "pemain berikutnya"}.`
        : extraTurn
          ? `${player.name} mendapat giliran tambahan! ${eventMessages.join(" ")}`
          : `${nextPlayer?.name ?? "Pemain berikutnya"} mendapat giliran. ${eventMessages.join(" ")}`;

      return {
        ...state,
        tokens,
        currentPlayerIndex,
        finishOrder: updatedFinishOrder,
        diceValue: null,
        consecutiveSixes: state.consecutiveSixes,
        validTokenIds: [],
        message,
      };
    }

    case "reset":
      return state.players.length > 0 ? freshMatch(state.players) : initialGameState;
  }
}
