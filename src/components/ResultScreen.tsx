"use client";

import { GuessChoice, OpponentType } from "@/lib/game-types";

interface Props {
  guess: GuessChoice;
  opponentType: OpponentType;
  score: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function ResultScreen({
  guess,
  opponentType,
  score,
  onPlayAgain,
  onGoHome,
}: Props) {
  const isCorrect =
    (guess === "bot" && opponentType === "ai") ||
    (guess === "human" && opponentType === "real");
  const isUnsure = guess === "unsure";

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[60vh] gap-8 ${
        isUnsure ? "" : isCorrect ? "flash-correct" : "flash-wrong"
      }`}
    >
      {/* Result title */}
      {isUnsure ? (
        <div className="text-4xl font-mono font-bold text-text-gray">
          NO GUESS
        </div>
      ) : isCorrect ? (
        <div className="text-5xl font-mono font-bold text-neon-green text-glow-green">
          CORRECT!
        </div>
      ) : (
        <div className="text-5xl font-mono font-bold text-neon-red">
          WRONG!
        </div>
      )}

      {/* Truth reveal */}
      <div className="glass-card p-8 text-center">
        <div className="text-sm text-text-gray mb-2 font-mono">
          Your opponent was:
        </div>
        <div
          className={`text-3xl font-mono font-bold mb-4 ${
            opponentType === "ai"
              ? "text-neon-pink text-glow-pink"
              : "text-neon-blue text-glow-blue"
          }`}
        >
          {opponentType === "ai" ? "🤖 A BOT" : "🧑 A HUMAN"}
        </div>
        <div className="text-sm text-text-gray font-mono">
          You guessed:{" "}
          <span className="text-white">
            {guess === "bot" ? "Bot" : guess === "human" ? "Human" : "Unsure"}
          </span>
        </div>
      </div>

      {/* Score change */}
      <div
        className={`text-2xl font-mono font-bold ${
          score > 0
            ? "text-neon-green"
            : score < 0
            ? "text-neon-red"
            : "text-text-gray"
        }`}
      >
        {score > 0 ? "+" : ""}
        {score} points
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={onPlayAgain} className="neon-btn">
          PLAY AGAIN
        </button>
        <button
          onClick={onGoHome}
          className="neon-btn"
          style={{
            borderColor: "rgba(136, 136, 136, 0.3)",
            color: "#888",
            background: "transparent",
          }}
        >
          HOME
        </button>
      </div>
    </div>
  );
}
