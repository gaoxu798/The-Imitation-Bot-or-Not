"use client";

import { GuessChoice } from "@/lib/game-types";

interface Props {
  onGuess: (guess: GuessChoice) => void;
}

export default function GuessScreen({ onGuess }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8">
      <div className="text-center">
        <div className="text-sm font-mono text-text-gray uppercase tracking-widest mb-2">
          Time to decide
        </div>
        <div className="text-3xl font-mono font-bold text-neon-blue text-glow-blue">
          BOT OR NOT?
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onGuess("bot")}
          className="neon-btn-pink neon-btn text-lg px-8 py-4"
        >
          🤖 BOT
        </button>
        <button
          onClick={() => onGuess("unsure")}
          className="neon-btn text-lg px-8 py-4 opacity-60 hover:opacity-100"
          style={{
            borderColor: "rgba(136, 136, 136, 0.5)",
            color: "#888",
            background: "rgba(136, 136, 136, 0.05)",
          }}
        >
          🤷 UNSURE
        </button>
        <button
          onClick={() => onGuess("human")}
          className="neon-btn text-lg px-8 py-4"
        >
          🧑 HUMAN
        </button>
      </div>

      <div className="text-xs font-mono text-text-gray">
        +10 correct · -5 wrong · 0 unsure
      </div>
    </div>
  );
}
