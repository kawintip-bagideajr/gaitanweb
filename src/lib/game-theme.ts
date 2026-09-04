/**
 * Per-game accent color, keyed loosely by game name or slug (normalized —
 * case/spaces/dashes ignored) so it works whether the caller has a
 * Game.slug or a Product.gameName. Purely visual — breaks up the
 * mono-violet look with a distinct color per game.
 */
export interface GameTheme {
  accent: string;
  glow: string;
  gradient: string;
}

const DEFAULT: GameTheme = {
  accent: "#8b5cf6",
  glow: "rgba(139, 92, 246, 0.45)",
  gradient: "linear-gradient(135deg, #8b5cf6, #c026d3)",
};

const THEMES: Record<string, GameTheme> = {
  roblox: {
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.45)",
    gradient: "linear-gradient(135deg, #8b5cf6, #c026d3)",
  },
  bloxfruits: {
    accent: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.45)",
    gradient: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
  },
  minecraft: {
    accent: "#4ade80",
    glow: "rgba(74, 222, 128, 0.45)",
    gradient: "linear-gradient(135deg, #4ade80, #16a34a)",
  },
  valorant: {
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.45)",
    gradient: "linear-gradient(135deg, #fb7185, #e11d48)",
  },
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getGameTheme(nameOrSlug: string): GameTheme {
  return THEMES[normalize(nameOrSlug)] ?? DEFAULT;
}
