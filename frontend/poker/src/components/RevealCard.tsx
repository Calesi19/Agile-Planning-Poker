import { useState, useEffect } from "preact/hooks";

interface RevealCardProps {
  name: string;
  value: string;
  isHost: boolean;
  hasVoted: boolean;
  revealed: boolean;
  delay: number;
}

export function RevealCard({ name, value, isHost, hasVoted, revealed, delay }: RevealCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (revealed) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsFlipped(false);
    }
  }, [revealed, delay]);

  return (
    <div class="perspective-1000">
      <div
        class={`relative w-full aspect-[3/4] transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Card Back (visible before flip) */}
        <div
          class={`absolute inset-0 backface-hidden rounded-2xl shadow-xl flex items-center justify-center transition-all transition-opacity duration-300 ${
            hasVoted ? "card-back-pattern" : "card-back-pattern-black"
          } ${isFlipped ? "opacity-0" : "opacity-100"}`}
          aria-hidden={isFlipped}
        >
          <div class="text-white text-center relative z-10">
            <div class="text-lg font-bold mb-1 drop-shadow-lg">{name}</div>
            {isHost && (
              <div class="text-xs bg-white/20 px-2 py-1 rounded-full inline-block">
                HOST
              </div>
            )}
            {!hasVoted && (
              <div class="text-xs mt-2 opacity-75">Not voted</div>
            )}
          </div>
        </div>

        {/* Card Front (visible after flip) */}
        <div
          class={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white shadow-xl border-4 border-indigo-500 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${
            isFlipped ? "opacity-100" : "opacity-0"
          }`}
        >
          <div class="text-6xl font-bold text-indigo-600 mb-2">{value || "?"}</div>
          <div class="text-sm font-semibold text-gray-700 text-center">{name}</div>
          {isHost && (
            <div class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full mt-2">
              HOST
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
