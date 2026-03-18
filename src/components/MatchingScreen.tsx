"use client";

export default function MatchingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-2xl font-mono text-neon-blue animate-breathe">
        SEARCHING FOR OPPONENT...
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-neon-blue"
            style={{
              animation: `pulse-glow 1.5s ease-in-out ${i * 0.3}s infinite`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>
      <div className="text-sm text-text-gray font-mono">
        Connecting to the network...
      </div>
    </div>
  );
}
