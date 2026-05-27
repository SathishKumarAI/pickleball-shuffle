export interface Card {
  id: number;
  category: string;
  name: string;
  effect: string;
  vibe: string;
}

export const CATEGORIES = [
  "Shot Restriction",
  "Body & Movement",
  "Wild Card / Swap",
  "Penalty",
  "Bonus / Reward",
  "Social & Party",
  "Strategy / Skill",
  "Wacky / Chaos",
  "Court / Environment",
  "Meta & Game-Flow",
] as const;

export type DeckMode = "family" | "party" | "drill" | "tournament" | "chaos";

export const DECK_MODES: Record<DeckMode, { label: string; description: string; categories: string[]; emoji: string }> = {
  family: {
    label: "Family",
    description: "Fun for all ages",
    emoji: "👨‍👩‍👧‍👦",
    categories: ["Shot Restriction", "Body & Movement", "Bonus / Reward", "Strategy / Skill"],
  },
  party: {
    label: "Party",
    description: "Laughs, dares & drinks",
    emoji: "🎉",
    categories: ["Social & Party", "Wacky / Chaos", "Wild Card / Swap", "Penalty", "Bonus / Reward"],
  },
  drill: {
    label: "Drill",
    description: "Sharpen your game",
    emoji: "🎯",
    categories: ["Shot Restriction", "Strategy / Skill", "Body & Movement"],
  },
  tournament: {
    label: "Tournament",
    description: "Competitive twists",
    emoji: "🏆",
    categories: ["Shot Restriction", "Strategy / Skill", "Meta & Game-Flow"],
  },
  chaos: {
    label: "Chaos",
    description: "Anything goes",
    emoji: "🌀",
    categories: [...CATEGORIES],
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  "Shot Restriction": "from-red-500 to-orange-500",
  "Body & Movement": "from-orange-500 to-yellow-500",
  "Wild Card / Swap": "from-purple-500 to-pink-500",
  "Penalty": "from-gray-600 to-gray-800",
  "Bonus / Reward": "from-green-500 to-emerald-500",
  "Social & Party": "from-pink-500 to-rose-500",
  "Strategy / Skill": "from-blue-500 to-cyan-500",
  "Wacky / Chaos": "from-yellow-400 to-amber-500",
  "Court / Environment": "from-teal-500 to-green-500",
  "Meta & Game-Flow": "from-indigo-500 to-violet-500",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  "Shot Restriction": "🏓",
  "Body & Movement": "🤸",
  "Wild Card / Swap": "🔄",
  "Penalty": "⚠️",
  "Bonus / Reward": "⭐",
  "Social & Party": "🥳",
  "Strategy / Skill": "🧠",
  "Wacky / Chaos": "🤪",
  "Court / Environment": "🏟️",
  "Meta & Game-Flow": "🎲",
};

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getFilteredCards(cards: Card[], mode: DeckMode): Card[] {
  const cats = DECK_MODES[mode].categories;
  return cards.filter((c) => cats.includes(c.category));
}
