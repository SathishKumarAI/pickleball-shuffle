import {
  Users, PartyPopper, Target, Trophy, Shuffle,
  Ban, Activity, Repeat, AlertTriangle, Gift, Brain, Sparkles, LandPlot, Dice5,
  type LucideIcon,
} from "lucide-react";
import { DeckMode } from "@/lib/cards";

export const MODE_ICONS: Record<DeckMode, LucideIcon> = {
  family: Users,
  party: PartyPopper,
  drill: Target,
  tournament: Trophy,
  chaos: Shuffle,
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Shot Restriction": Ban,
  "Body & Movement": Activity,
  "Wild Card / Swap": Repeat,
  "Penalty": AlertTriangle,
  "Bonus / Reward": Gift,
  "Social & Party": PartyPopper,
  "Strategy / Skill": Brain,
  "Wacky / Chaos": Sparkles,
  "Court / Environment": LandPlot,
  "Meta & Game-Flow": Dice5,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] || Shuffle;
}
