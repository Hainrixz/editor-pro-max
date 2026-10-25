// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
export const FONT_FAMILIES = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  display: "'Poppins', sans-serif",
  elegant: "'Playfair Display', serif",
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

const loadedFonts = new Set<string>();

export const loadGoogleFont = (fontFamily: string, weights = "400;500;600;700;800;900") => {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(fontFamily)) return;

  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@${weights}&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
};

export const loadDefaultFonts = () => {
  loadGoogleFont("Inter");
  loadGoogleFont("Poppins");
  loadGoogleFont("Playfair Display");
  loadGoogleFont("JetBrains Mono", "400;500;700");
};
