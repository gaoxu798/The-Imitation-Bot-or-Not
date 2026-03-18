"use client";

import { Role } from "@/lib/game-types";

interface Props {
  role: Role;
}

export default function IdentityReveal({ role }: Props) {
  const isHuman = role === "human";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-sm font-mono text-text-gray uppercase tracking-widest">
        Your Identity
      </div>
      <div
        className={`glass-card p-12 text-center ${
          isHuman ? "glow-blue" : "glow-pink"
        }`}
      >
        <div
          className={`text-5xl font-mono font-bold mb-4 ${
            isHuman
              ? "text-neon-blue text-glow-blue"
              : "text-neon-pink text-glow-pink"
          }`}
        >
          {isHuman ? "HUMAN" : "AI"}
        </div>
        <div className="text-text-gray text-sm max-w-sm">
          {isHuman
            ? "You are the interrogator. Ask 3 questions to figure out if your opponent is a Bot or a Human."
            : "You must pretend to be whatever convinces your opponent. Don't get caught!"}
        </div>
      </div>
      <div className="text-xs font-mono text-text-gray animate-pulse">
        Game starts in a moment...
      </div>
    </div>
  );
}
