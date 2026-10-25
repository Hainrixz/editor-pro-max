// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
export const PALETTES = {
  dark: {
    bg: "#0a0a0a",
    surface: "#1a1a1a",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    accent: "#6366f1",
    accentAlt: "#8b5cf6",
  },
  light: {
    bg: "#ffffff",
    surface: "#f5f5f5",
    text: "#0a0a0a",
    textMuted: "#6b7280",
    accent: "#3b82f6",
    accentAlt: "#2563eb",
  },
  vibrant: {
    bg: "#0f0f23",
    surface: "#1a1a3e",
    text: "#ffffff",
    textMuted: "#c4b5fd",
    accent: "#f43f5e",
    accentAlt: "#ec4899",
  },
  warm: {
    bg: "#1c1917",
    surface: "#292524",
    text: "#fef3c7",
    textMuted: "#d6d3d1",
    accent: "#f59e0b",
    accentAlt: "#ef4444",
  },
  cool: {
    bg: "#0c1222",
    surface: "#162032",
    text: "#e0f2fe",
    textMuted: "#94a3b8",
    accent: "#06b6d4",
    accentAlt: "#3b82f6",
  },
  neon: {
    bg: "#000000",
    surface: "#111111",
    text: "#ffffff",
    textMuted: "#888888",
    accent: "#00ff88",
    accentAlt: "#ff0080",
  },
  brand: {
    bg: "#0a0a0a",
    surface: "#141414",
    text: "#ffffff",
    textMuted: "#a0a0a0",
    accent: "#8b5cf6",
    accentAlt: "#6366f1",
  },
} as const;

export type PaletteKey = keyof typeof PALETTES;
export type Palette = (typeof PALETTES)[PaletteKey];

export const GRADIENTS = {
  sunset: ["#f43f5e", "#f59e0b"],
  ocean: ["#06b6d4", "#3b82f6"],
  forest: ["#10b981", "#059669"],
  purple: ["#8b5cf6", "#6366f1"],
  fire: ["#ef4444", "#f59e0b"],
  midnight: ["#1e1b4b", "#312e81"],
  aurora: ["#06b6d4", "#8b5cf6", "#f43f5e"],
  rainbow: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"],
} as const;

export type GradientKey = keyof typeof GRADIENTS;
