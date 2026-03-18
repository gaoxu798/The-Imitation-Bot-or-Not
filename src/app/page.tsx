"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerStats } from "@/lib/game-storage";
import { PlayerStats, getRank, RANKS } from "@/lib/game-types";
import Header from "@/components/Header";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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
        <div className="text-center mb-10">
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

        {/* Buttons */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push("/game")}
            className="neon-btn text-xl px-12 py-5 animate-pulse-glow glitch-hover"
          >
            START MATCH
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="neon-btn text-sm px-4 py-5"
            style={{
              borderColor: "rgba(157, 0, 255, 0.5)",
              color: "#9D00FF",
              background: "rgba(157, 0, 255, 0.1)",
            }}
          >
            ?
          </button>
        </div>

        {/* Stats + Rank in a compact row */}
        {stats && (
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl w-full items-start">
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3 flex-1">
              <div className="glass-card p-4 text-center">
                <div className="text-[10px] text-text-gray font-mono mb-1 uppercase tracking-wider">
                  Rank
                </div>
                <div className="text-lg font-mono font-bold text-neon-pink text-glow-pink">
                  {rank?.tier || "Unranked"}
                </div>
                <div className="text-[10px] text-text-gray">{rank?.label}</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-[10px] text-text-gray font-mono mb-1 uppercase tracking-wider">
                  Win Rate
                </div>
                <div className="text-lg font-mono font-bold text-neon-green text-glow-green">
                  {winRate}%
                </div>
                <div className="text-[10px] text-text-gray">
                  {stats.wins}W / {stats.losses}L
                </div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-[10px] text-text-gray font-mono mb-1 uppercase tracking-wider">
                  Score
                </div>
                <div className="text-lg font-mono font-bold text-neon-blue text-glow-blue">
                  {stats.score}
                </div>
                <div className="text-[10px] text-text-gray">
                  {stats.totalGames} games
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rank tiers - compact inline */}
        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          {RANKS.map((r) => (
            <div
              key={r.tier}
              className={`px-3 py-1.5 rounded text-[10px] font-mono border ${
                rank?.tier === r.tier
                  ? "border-neon-pink/50 bg-neon-pink/10 text-neon-pink"
                  : "border-white/5 bg-white/[0.02] text-text-gray"
              }`}
            >
              {r.tier} {r.minScore}+
            </div>
          ))}
        </div>

        {/* Guest notice */}
        {stats && stats.guestGamesLeft > 0 && (
          <div className="mt-4 text-xs font-mono text-text-gray text-center">
            Guest mode: {stats.guestGamesLeft} free game{stats.guestGamesLeft !== 1 ? "s" : ""} remaining
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-text-gray font-mono border-t border-neon-blue/10 space-y-1">
        <div>The Imitation © 2026 · v1.0 MVP</div>
        <div>
          Contact:{" "}
          <a href="mailto:nnianhuaa@outlook.com" className="text-neon-blue/60 hover:text-neon-blue transition-colors">
            nnianhuaa@outlook.com
          </a>
        </div>
      </footer>

      {/* How to Play Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="glass-card p-8 max-w-lg w-full relative glow-blue"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-text-gray hover:text-neon-blue font-mono transition-colors"
            >
              ✕
            </button>
            <div className="text-lg font-mono text-neon-blue text-glow-blue mb-6 text-center uppercase tracking-wider">
              How to Play
            </div>
            <div className="space-y-4">
              {[
                { icon: "🔍", title: "Match", desc: "Join the queue and get paired with an AI or a real player — you won't know which." },
                { icon: "🎭", title: "Identity", desc: "You're assigned as Human (interrogator) or AI (pretender). Your opponent doesn't know your role." },
                { icon: "💬", title: "Ask", desc: "As the Human, you have 3 questions. Each answer has a 2-minute time limit." },
                { icon: "🤔", title: "Guess", desc: "After all questions, decide: Bot, Human, or Unsure." },
                { icon: "🏆", title: "Score", desc: "Correct guess: +10 pts. Wrong: -5 pts. Unsure: 0 pts. Climb the ranks!" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="text-xl">{item.icon}</div>
                  <div>
                    <div className="text-sm font-mono text-neon-pink font-bold">{item.title}</div>
                    <div className="text-xs text-text-gray leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-[10px] text-text-gray/50 font-mono mt-6 border-t border-white/5 pt-4">
              Please be respectful — violence, sexual content, and hate speech are strictly prohibited.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
