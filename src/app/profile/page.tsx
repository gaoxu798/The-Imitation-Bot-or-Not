"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { getPlayerStats, savePlayerStats } from "@/lib/game-storage";
import { PlayerStats, getRank, RANKS } from "@/lib/game-types";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    paypal: any;
  }
}

export default function ProfilePage() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  useEffect(() => {
    const localStats = getPlayerStats();
    setStats(localStats);

    // Sync premium status from Supabase
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.is_premium && !localStats.isPremium) {
              localStats.isPremium = true;
              savePlayerStats(localStats);
              setStats({ ...localStats });
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    if (!paypalReady || !paypalRef.current || paypalRendered.current || stats?.isPremium) return;
    paypalRendered.current = true;

    window.paypal
      .Buttons({
        style: { color: "blue", shape: "rect", label: "pay", height: 44 },
        createOrder: (_: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              { amount: { value: "5.90", currency_code: "USD" } },
            ],
          });
        },
        onApprove: async (data: any) => {
          setPaying(true);
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token;

            if (!accessToken) {
              alert("请先登录账号再购买！");
              return;
            }

            const res = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, accessToken }),
            });

            if (res.ok) {
              const current = getPlayerStats();
              current.isPremium = true;
              current.stamina = current.maxStamina;
              savePlayerStats(current);
              setStats({ ...current });
            } else {
              alert("支付验证失败，请联系客服。");
            }
          } finally {
            setPaying(false);
          }
        },
        onError: () => {
          alert("支付出现错误，请重试。");
        },
      })
      .render(paypalRef.current);
  }, [paypalReady, stats?.isPremium]);

  if (!stats) return null;

  const rank = getRank(stats.score);
  const winRate =
    stats.totalGames > 0
      ? Math.round((stats.wins / stats.totalGames) * 100)
      : 0;

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
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        onLoad={() => setPaypalReady(true)}
      />
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
              {stats.isPremium ? "∞" : `${stats.stamina} / ${stats.maxStamina}`}
            </span>
          </div>
          {!stats.isPremium && (
            <div className="energy-bar">
              <div
                className="energy-bar-fill"
                style={{ width: `${(stats.stamina / stats.maxStamina) * 100}%` }}
              />
            </div>
          )}
          <div className="text-xs text-text-gray mt-1 font-mono">
            {stats.isPremium ? "Unlimited — Premium member" : "Recovery: 5 pts/min"}
          </div>
        </div>

        {/* Premium card */}
        {stats.isPremium ? (
          <div className="glass-card p-6 text-center glow-blue mb-6">
            <div className="text-lg font-mono font-bold text-neon-blue mb-1">
              ★ PREMIUM MEMBER
            </div>
            <div className="text-sm text-text-gray">
              无限体力 · 赢局+20分 · 无广告
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 glow-pink mb-6">
            <div className="text-lg font-mono font-bold text-neon-pink mb-1 text-center">
              GO PREMIUM
            </div>
            <div className="text-sm text-text-gray text-center mb-4">
              无限体力 · 赢局+20分（普通+10）· 无广告 · 一次性 $5.90
            </div>
            {paying ? (
              <div className="text-center text-neon-blue font-mono text-sm animate-pulse">
                处理中...
              </div>
            ) : (
              <div ref={paypalRef} />
            )}
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
                <span>{r.tier} ({r.label})</span>
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
