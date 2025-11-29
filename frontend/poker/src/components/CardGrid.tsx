interface CardGridProps {
  cards: string[];
  selectedCard?: string;
  onSelectCard: (value: string) => void;
  disabled?: boolean;
}

export function CardGrid({ cards, selectedCard, onSelectCard, disabled }: CardGridProps) {
  return (
    <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
      {cards.map((card) => {
        const isSelected = selectedCard === card;

        return (
          <button
            key={card}
            onClick={() => !disabled && onSelectCard(card)}
            disabled={disabled}
            class={`
              relative aspect-[2/3] rounded-2xl shadow-lg transition-all duration-200
              flex items-center justify-center font-bold text-3xl
              bg-white hover:bg-gray-50
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer transform active:scale-95"}
              ${isSelected ? "ring-4 ring-yellow-400 scale-105 bg-yellow-50" : ""}
              text-gray-800
            `}
          >
            <span class={isSelected ? "text-indigo-600" : ""}>{card}</span>
            {isSelected && (
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span class="text-white text-lg">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
