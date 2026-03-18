"use client";

import { useState, useRef, useEffect } from "react";
import { Message, MAX_QUESTIONS } from "@/lib/game-types";

interface Props {
  messages: Message[];
  questionCount: number;
  timeLeft: number;
  waitingForAnswer: boolean;
  onSendQuestion: (question: string) => void;
}

export default function ChatTerminal({
  messages,
  questionCount,
  timeLeft,
  waitingForAnswer,
  onSendQuestion,
}: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canAsk = questionCount < MAX_QUESTIONS && !waitingForAnswer;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canAsk) return;
    onSendQuestion(input.trim());
    setInput("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-blue/20">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-text-gray">
            Questions: {questionCount}/{MAX_QUESTIONS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < questionCount ? "bg-neon-blue" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
        {waitingForAnswer && (
          <div className="countdown-glow text-sm">
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
        {messages.length === 0 && (
          <div className="text-center text-text-gray font-mono text-sm py-8">
            &gt; Terminal ready. Ask your first question...
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "questioner" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-lg font-mono text-sm ${
                msg.role === "questioner"
                  ? "bg-neon-blue/10 border border-neon-blue/30 text-neon-blue"
                  : "bg-neon-pink/10 border border-neon-pink/30 text-neon-pink scanlines"
              }`}
            >
              <div className="text-[10px] opacity-50 mb-1">
                {msg.role === "questioner" ? "> YOU" : "< OPPONENT"}
              </div>
              {msg.content}
            </div>
          </div>
        ))}
        {waitingForAnswer && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-lg bg-neon-pink/5 border border-neon-pink/20 text-neon-pink font-mono text-sm">
              <span className="animate-pulse">typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neon-blue/20">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-blue/50 font-mono text-sm">
              &gt;
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                canAsk
                  ? "Type your question..."
                  : waitingForAnswer
                  ? "Waiting for response..."
                  : "No more questions"
              }
              disabled={!canAsk}
              className="terminal-input pl-8"
            />
          </div>
          <button
            type="submit"
            disabled={!canAsk || !input.trim()}
            className="neon-btn text-sm"
          >
            ASK
          </button>
        </div>
        {canAsk && (
          <div className="text-xs text-text-gray font-mono mt-2 pl-2">
            {MAX_QUESTIONS - questionCount} question{MAX_QUESTIONS - questionCount !== 1 ? "s" : ""} remaining
          </div>
        )}
      </form>
    </div>
  );
}
