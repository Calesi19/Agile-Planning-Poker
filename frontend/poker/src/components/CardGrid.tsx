interface CardGridProps {
  cards: string[];
  selectedCard?: string;
  onSelectCard: (value: string) => void;
  disabled?: boolean;
}

const CARD_COLORS = [
  "bg-indigo-500 hover:bg-indigo-600",
  "bg-purple-500 hover:bg-purple-600",
  "bg-pink-500 hover:bg-pink-600",
  "bg-rose-500 hover:bg-rose-600",
  "bg-orange-500 hover:bg-orange-600",
  "bg-amber-500 hover:bg-amber-600",
  "bg-lime-500 hover:bg-lime-600",
  "bg-emerald-500 hover:bg-emerald-600",
  "bg-teal-500 hover:bg-teal-600",
  "bg-cyan-500 hover:bg-cyan-600",
  "bg-sky-500 hover:bg-sky-600",
  "bg-blue-500 hover:bg-blue-600",
];

export function CardGrid({ cards, selectedCard, onSelectCard, disabled }: CardGridProps) {
  return (
    <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
      {cards.map((card, index) => {
        const isSelected = selectedCard === card;
        const colorClass = CARD_COLORS[index % CARD_COLORS.length];

        return (
          <button
            key={card}
            onClick={() => !disabled && onSelectCard(card)}
            disabled={disabled}
            class={`
              relative aspect-[2/3] rounded-2xl shadow-lg transition-all duration-200
              flex items-center justify-center text-white font-bold text-3xl
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer transform active:scale-95"}
              ${isSelected ? "ring-4 ring-white scale-105" : ""}
              ${colorClass}
            `}
          >
            <span class="drop-shadow-lg">{card}</span>
            {isSelected && (
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span class="text-green-500 text-lg">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
