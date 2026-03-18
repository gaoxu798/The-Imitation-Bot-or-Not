export type Role = "human" | "ai";
export type OpponentType = "ai" | "real";
export type GuessChoice = "bot" | "human" | "unsure";

export type GamePhase =
  | "idle"
  | "matching"
  | "identity"
  | "questioning"
  | "guessing"
  | "result";

export interface Message {
  id: string;
  role: "questioner" | "responder";
  content: string;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  myRole: Role | null;
  opponentType: OpponentType | null;
  messages: Message[];
  questionCount: number;
  maxQuestions: number;
  guess: GuessChoice | null;
  score: number | null;
  timeLeft: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  score: number;
  stamina: number;
  maxStamina: number;
  guestGamesLeft: number;
  isPremium: boolean;
}

export type RankTier =
  | "Rookie"
  | "Scout"
  | "Analyst"
  | "Expert"
  | "Elite"
  | "Master"
  | "Legend";

export interface RankInfo {
  tier: RankTier;
  minScore: number;
  label: string;
}

export const RANKS: RankInfo[] = [
  { tier: "Rookie", minScore: 10, label: "新手" },
  { tier: "Scout", minScore: 50, label: "侦察员" },
  { tier: "Analyst", minScore: 100, label: "分析师" },
  { tier: "Expert", minScore: 150, label: "专家" },
  { tier: "Elite", minScore: 200, label: "精英" },
  { tier: "Master", minScore: 250, label: "大师" },
  { tier: "Legend", minScore: 300, label: "传奇" },
];

export function getRank(score: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].minScore) return RANKS[i];
  }
  return { tier: "Rookie", minScore: 0, label: "未定级" };
}

export const STAMINA_PER_GAME = 10;
export const STAMINA_RECOVERY_PER_MIN = 2;
export const MAX_STAMINA = 50;
export const GUEST_FREE_GAMES = 2;
export const MAX_QUESTIONS = 3;
export const ANSWER_TIME_LIMIT = 120; // seconds
export const SCORE_CORRECT = 10;
export const SCORE_WRONG = -5;
export const SCORE_UNSURE = 0;
