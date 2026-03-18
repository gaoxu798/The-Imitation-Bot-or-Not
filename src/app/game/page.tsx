"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import Header from "@/components/Header";
import MatchingScreen from "@/components/MatchingScreen";
import IdentityReveal from "@/components/IdentityReveal";
import ChatTerminal from "@/components/ChatTerminal";
import GuessScreen from "@/components/GuessScreen";
import ResultScreen from "@/components/ResultScreen";

export default function GamePage() {
  const router = useRouter();
  const { state, waitingForAnswer, startMatch, sendQuestion, makeGuess, resetGame } =
    useGame();

  useEffect(() => {
    startMatch();
  }, [startMatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        {state.phase === "matching" && <MatchingScreen />}

        {state.phase === "identity" && state.myRole && (
          <IdentityReveal role={state.myRole} />
        )}

        {state.phase === "questioning" && (
          <div className="glass-card max-w-2xl mx-auto overflow-hidden">
            <ChatTerminal
              messages={state.messages}
              questionCount={state.questionCount}
              timeLeft={state.timeLeft}
              waitingForAnswer={waitingForAnswer}
              onSendQuestion={sendQuestion}
            />
          </div>
        )}

        {state.phase === "guessing" && (
          <>
            <div className="glass-card max-w-2xl mx-auto overflow-hidden mb-8">
              <ChatTerminal
                messages={state.messages}
                questionCount={state.questionCount}
                timeLeft={state.timeLeft}
                waitingForAnswer={false}
                onSendQuestion={() => {}}
              />
            </div>
            <GuessScreen onGuess={makeGuess} />
          </>
        )}

        {state.phase === "result" &&
          state.guess &&
          state.opponentType &&
          state.score !== null && (
            <ResultScreen
              guess={state.guess}
              opponentType={state.opponentType}
              score={state.score}
              onPlayAgain={() => {
                resetGame();
                startMatch();
              }}
              onGoHome={() => router.push("/")}
            />
          )}
      </main>
    </div>
  );
}
