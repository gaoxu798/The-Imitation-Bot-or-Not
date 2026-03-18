"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlayerStats } from "@/lib/game-storage";
import { PlayerStats, getRank, RANKS } from "@/lib/game-types";
import Header from "@/components/Header";

export default function ProfilePage() {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setStats(getPlayerStats());
  }, []);

  if (!stats) return null;

  const rank = getRank(stats.score);
  const winRate =
    stats.totalGames > 0
      ? Math.round((stats.wins / stats.totalGames) * 100)
      : 0;

  // Find next rank
  const currentRankIndex = RANKS.findIndex((r) => r.tier === rank.tier);
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  const progressToNext = nextRank
    ? Math.min(
        100,
        ((stats.score - rank.minScore) / (nextRank.minScore - rank.minScore)) * 100
      )
    : 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-mono font-bold text-neon-blue text-glow-blue mb-8">
          PLAYER PROFILE
        </h1>

        {/* Rank card */}
        <div className="glass-card p-6 mb-6 glow-blue">
          <div className="text-sm text-text-gray font-mono mb-1">Current Rank</div>
          <div className="text-3xl font-mono font-bold text-neon-pink text-glow-pink mb-1">
            {rank.tier}
          </div>
          <div className="text-sm text-text-gray mb-4">{rank.label}</div>
          {nextRank && (
            <div>
              <div className="flex justify-between text-xs font-mono text-text-gray mb-1">
                <span>{rank.tier}</span>
                <span>{nextRank.tier}</span>
              </div>
              <div className="energy-bar">
                <div
                  className="energy-bar-fill"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <div className="text-xs text-text-gray font-mono mt-1">
                {stats.score} / {nextRank.minScore} points
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-neon-blue">
              {stats.totalGames}
            </div>
            <div className="text-xs text-text-gray font-mono">Total Games</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-neon-green">
              {winRate}%
            </div>
            <div className="text-xs text-text-gray font-mono">Win Rate</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-neon-green">
              {stats.wins}
            </div>
            <div className="text-xs text-text-gray font-mono">Correct</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-mono font-bold text-neon-red">
              {stats.losses}
            </div>
            <div className="text-xs text-text-gray font-mono">Wrong</div>
          </div>
        </div>

        {/* Stamina */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-mono text-text-gray">Stamina</span>
            <span className="font-mono text-neon-blue text-sm">
              {stats.stamina} / {stats.maxStamina}
            </span>
          </div>
          <div className="energy-bar">
            <div
              className="energy-bar-fill"
              style={{
                width: `${(stats.stamina / stats.maxStamina) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-text-gray mt-1 font-mono">
            Recovery: 5 pts/min
          </div>
        </div>

        {/* Premium */}
        {!stats.isPremium && (
          <div className="glass-card p-6 text-center glow-pink mb-6">
            <div className="text-lg font-mono font-bold text-neon-pink mb-2">
              GO PREMIUM
            </div>
            <div className="text-sm text-text-gray mb-4">
              Unlimited stamina · $5.9/month
            </div>
            <button className="neon-btn neon-btn-pink">
              UPGRADE NOW
            </button>
          </div>
        )}

        {/* Rank table */}
        <div className="glass-card p-4">
          <div className="text-sm font-mono text-text-gray mb-3">All Ranks</div>
          <div className="space-y-2">
            {RANKS.map((r) => (
              <div
                key={r.tier}
                className={`flex justify-between items-center px-3 py-2 rounded text-sm font-mono ${
                  r.tier === rank.tier
                    ? "bg-neon-blue/10 border border-neon-blue/30 text-neon-blue"
                    : "text-text-gray"
                }`}
              >
                <span>
                  {r.tier} ({r.label})
                </span>
                <span>{r.minScore}+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="neon-btn inline-block">
            BACK TO HOME
          </Link>
        </div>
      </main>
    </div>
  );
}
