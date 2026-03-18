import { PlayerStats, MAX_STAMINA, GUEST_FREE_GAMES } from "./game-types";

const STORAGE_KEY = "imitation_player";

export function getPlayerStats(): PlayerStats {
  if (typeof window === "undefined") {
    return defaultStats();
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultStats();
  const stats: PlayerStats = JSON.parse(stored);
  // Recover stamina based on time
  const lastUpdate = localStorage.getItem(STORAGE_KEY + "_time");
  if (lastUpdate) {
    const elapsed = (Date.now() - parseInt(lastUpdate)) / 60000; // minutes
    stats.stamina = Math.min(stats.maxStamina, stats.stamina + Math.floor(elapsed * 2));
  }
  return stats;
}

export function savePlayerStats(stats: PlayerStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  localStorage.setItem(STORAGE_KEY + "_time", Date.now().toString());
}

function defaultStats(): PlayerStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    score: 0,
    stamina: MAX_STAMINA,
    maxStamina: MAX_STAMINA,
    guestGamesLeft: GUEST_FREE_GAMES,
    isPremium: false,
  };
}
