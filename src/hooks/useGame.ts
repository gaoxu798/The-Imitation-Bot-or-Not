"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GameState,
  GamePhase,
  GuessChoice,
  Message,
  OpponentType,
  Role,
  MAX_QUESTIONS,
  ANSWER_TIME_LIMIT,
  SCORE_CORRECT,
  SCORE_CORRECT_PREMIUM,
  SCORE_WRONG,
  SCORE_UNSURE,
  STAMINA_PER_GAME,
} from "@/lib/game-types";
import { getPlayerStats, savePlayerStats } from "@/lib/game-storage";
import { getAIResponse } from "@/lib/ai-opponent";

const initialState: GameState = {
  phase: "idle",
  myRole: null,
  opponentType: null,
  messages: [],
  questionCount: 0,
  maxQuestions: MAX_QUESTIONS,
  guess: null,
  score: null,
  timeLeft: ANSWER_TIME_LIMIT,
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const personaRef = useRef(Math.floor(Math.random() * 3));

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const setPhase = useCallback((phase: GamePhase) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  const startMatch = useCallback(() => {
    const stats = getPlayerStats();

    // Check stamina
    if (!stats.isPremium && stats.stamina < STAMINA_PER_GAME) {
      alert("体力不足！请等待恢复或升级会员。");
      return false;
    }

    // Check guest limit
    if (stats.guestGamesLeft <= 0 && stats.totalGames >= 2) {
      // In a real app, redirect to login
      alert("游客体验次数已用完，请注册账号继续游戏！");
      return false;
    }

    // Deduct stamina
    if (!stats.isPremium) {
      stats.stamina -= STAMINA_PER_GAME;
      savePlayerStats(stats);
    }

    setPhase("matching");
    personaRef.current = Math.floor(Math.random() * 3);

    // Simulate matching delay
    setTimeout(() => {
      const opponentType: OpponentType = Math.random() < 0.5 ? "ai" : "real";
      const myRole: Role = Math.random() < 0.5 ? "human" : "ai";

      setState((s) => ({
        ...s,
        phase: "identity",
        myRole,
        opponentType,
        messages: [],
        questionCount: 0,
        guess: null,
        score: null,
        timeLeft: ANSWER_TIME_LIMIT,
      }));

      // Show identity for 3 seconds, then start questioning
      setTimeout(() => {
        setPhase("questioning");
      }, 3000);
    }, 2000 + Math.random() * 2000);

    return true;
  }, [setPhase]);

  const startTimer = useCallback(() => {
    clearTimer();
    setState((s) => ({ ...s, timeLeft: ANSWER_TIME_LIMIT }));
    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.timeLeft <= 1) {
          clearTimer();
          return { ...s, timeLeft: 0 };
        }
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
  }, [clearTimer]);

  const sendQuestion = useCallback(
    async (question: string) => {
      if (state.questionCount >= MAX_QUESTIONS) return;

      const questionMsg: Message = {
        id: Date.now().toString(),
        role: "questioner",
        content: question,
        timestamp: Date.now(),
      };

      setState((s) => ({
        ...s,
        messages: [...s.messages, questionMsg],
        questionCount: s.questionCount + 1,
      }));

      // Start answer timer
      startTimer();
      setWaitingForAnswer(true);

      if (state.opponentType === "ai") {
        // Get AI response
        const history = state.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const answer = await getAIResponse(
          question,
          history,
          personaRef.current
        );
        clearTimer();

        const answerMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "responder",
          content: answer,
          timestamp: Date.now(),
        };

        setState((s) => {
          const newState = {
            ...s,
            messages: [...s.messages, answerMsg],
          };
          // If all questions asked, move to guessing
          if (newState.questionCount >= MAX_QUESTIONS) {
            newState.phase = "guessing";
          }
          return newState;
        });
      } else {
        // For real player matching (MVP: simulate with delayed response)
        setTimeout(() => {
          clearTimer();
          const simulatedResponses = [
            "hmm that's a hard one",
            "lol why would you ask that",
            "idk honestly, what do you think?",
            "yeah I guess so, but it depends",
            "not really sure tbh",
            "haha nice try, but I'm real",
          ];
          const answer =
            simulatedResponses[
              Math.floor(Math.random() * simulatedResponses.length)
            ];

          const answerMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "responder",
            content: answer,
            timestamp: Date.now(),
          };

          setState((s) => {
            const newState = {
              ...s,
              messages: [...s.messages, answerMsg],
            };
            if (newState.questionCount >= MAX_QUESTIONS) {
              newState.phase = "guessing";
            }
            return newState;
          });
        }, 3000 + Math.random() * 5000);
      }

      setWaitingForAnswer(false);
    },
    [state.questionCount, state.opponentType, state.messages, startTimer, clearTimer]
  );

  const makeGuess = useCallback(
    (guess: GuessChoice) => {
      let scoreChange: number;
      const isCorrect =
        (guess === "bot" && state.opponentType === "ai") ||
        (guess === "human" && state.opponentType === "real");

      // Update stats
      const stats = getPlayerStats();
      if (guess === "unsure") {
        scoreChange = SCORE_UNSURE;
      } else if (isCorrect) {
        scoreChange = stats.isPremium ? SCORE_CORRECT_PREMIUM : SCORE_CORRECT;
      } else {
        scoreChange = SCORE_WRONG;
      }
      stats.totalGames += 1;
      stats.score = Math.max(0, stats.score + scoreChange);
      if (guess !== "unsure") {
        if (isCorrect) stats.wins += 1;
        else stats.losses += 1;
      }
      if (stats.guestGamesLeft > 0) {
        stats.guestGamesLeft -= 1;
      }
      savePlayerStats(stats);

      setState((s) => ({
        ...s,
        phase: "result",
        guess,
        score: scoreChange,
      }));
    },
    [state.opponentType]
  );

  const resetGame = useCallback(() => {
    clearTimer();
    setState(initialState);
  }, [clearTimer]);

  return {
    state,
    waitingForAnswer,
    startMatch,
    sendQuestion,
    makeGuess,
    resetGame,
  };
}
