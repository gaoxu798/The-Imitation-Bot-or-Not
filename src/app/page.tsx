"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerStats } from "@/lib/game-storage";
import { PlayerStats, getRank, RANKS } from "@/lib/game-types";
import Header from "@/components/Header";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setStats(getPlayerStats());
  }, []);

  const rank = stats ? getRank(stats.score) : null;
  const winRate =
    stats && stats.totalGames > 0
      ? Math.round((stats.wins / stats.totalGames) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-neon-blue animate-breathe mb-4">
            THE IMITATION
          </h1>
          <div className="text-xl md:text-2xl font-mono text-neon-pink text-glow-pink mb-2">
            BOT OR NOT
          </div>
          <p className="text-text-gray text-sm font-mono">
            Can you tell bot from human?
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={() => router.push("/game")}
          className="neon-btn text-xl px-12 py-5 animate-pulse-glow mb-12 glitch-hover"
        >
          START MATCH
        </button>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
            <div className="glass-card p-5 text-center glow-blue">
              <div className="text-xs text-text-gray font-mono mb-1 uppercase tracking-wider">
                Rank
              </div>
              <div className="text-2xl font-mono font-bold text-neon-pink text-glow-pink">
                {rank?.tier || "Unranked"}
              </div>
              <div className="text-xs text-text-gray">{rank?.label}</div>
            </div>

            <div className="glass-card p-5 text-center glow-blue">
              <div className="text-xs text-text-gray font-mono mb-1 uppercase tracking-wider">
                Win Rate
              </div>
              <div className="text-2xl font-mono font-bold text-neon-green text-glow-green">
                {winRate}%
              </div>
              <div className="text-xs text-text-gray">
                {stats.wins}W / {stats.losses}L
              </div>
            </div>

            <div className="glass-card p-5 text-center glow-blue">
              <div className="text-xs text-text-gray font-mono mb-1 uppercase tracking-wider">
                Score
              </div>
              <div className="text-2xl font-mono font-bold text-neon-blue text-glow-blue">
                {stats.score}
              </div>
              <div className="text-xs text-text-gray">
                {stats.totalGames} games played
              </div>
            </div>
          </div>
        )}

        {/* Rank table */}
        <div className="glass-card p-6 mt-8 max-w-2xl w-full">
          <div className="text-sm font-mono text-neon-blue text-glow-blue mb-4 text-center uppercase tracking-wider">
            Rank Tiers
          </div>
          <div className="grid grid-cols-7 gap-2">
            {RANKS.map((r) => (
              <div
                key={r.tier}
                className={`text-center p-3 rounded-lg border ${
                  rank?.tier === r.tier
                    ? "border-neon-pink/50 bg-neon-pink/10"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className={`text-xs font-mono font-bold mb-1 ${
                  rank?.tier === r.tier ? "text-neon-pink" : "text-white/80"
                }`}>
                  {r.tier}
                </div>
                <div className="text-[10px] text-text-gray">{r.label}</div>
                <div className={`text-xs font-mono mt-1 ${
                  rank?.tier === r.tier ? "text-neon-pink" : "text-neon-blue/60"
                }`}>
                  {r.minScore}+
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest notice */}
        {stats && stats.guestGamesLeft > 0 && (
          <div className="mt-6 text-xs font-mono text-text-gray text-center">
            Guest mode: {stats.guestGamesLeft} free game{stats.guestGamesLeft !== 1 ? "s" : ""} remaining
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-text-gray font-mono border-t border-neon-blue/10">
        The Imitation © 2026 · v1.0 MVP
      </footer>
    </div>
  );
}
