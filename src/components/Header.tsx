"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayerStats } from "@/lib/game-storage";
import { getRank } from "@/lib/game-types";

export default function Header({ onShowHelp }: { onShowHelp?: () => void }) {
  const [stats, setStats] = useState<ReturnType<typeof getPlayerStats> | null>(null);

  useEffect(() => {
    setStats(getPlayerStats());
  }, []);

  const rank = stats ? getRank(stats.score) : null;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-neon-blue/10">
      <Link href="/" className="font-mono text-xl font-bold text-neon-blue text-glow-blue glitch-hover">
        THE IMITATION
      </Link>
      <div className="flex items-center gap-6">
        {stats && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-gray">Score:</span>
              <span className="font-mono text-neon-green">{stats.score}</span>
            </div>
            {rank && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-gray">Rank:</span>
                <span className="font-mono text-neon-pink">{rank.tier}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-gray">⚡</span>
              <div className="energy-bar w-20">
                <div
                  className="energy-bar-fill"
                  style={{ width: `${(stats.stamina / stats.maxStamina) * 100}%` }}
                />
              </div>
              <span className="font-mono text-neon-blue text-xs">{stats.stamina}</span>
            </div>
          </>
        )}
        <Link
          href="/profile"
          className="font-mono text-sm font-semibold px-5 py-2 rounded-lg border border-neon-pink/50 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all"
        >
          Profile
        </Link>
        {onShowHelp && (
          <button
            onClick={onShowHelp}
            className="font-mono text-sm font-semibold px-5 py-2 rounded-lg border border-neon-purple/50 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 hover:shadow-[0_0_15px_rgba(157,0,255,0.3)] transition-all"
          >
            Guide
          </button>
        )}
      </div>
    </header>
  );
}
