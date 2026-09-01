import {continueRender, delayRender} from "remotion";

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
  loadedFonts.add(fontFamily);

  // Delay rendering until the webfont is actually fetched, otherwise Remotion
  // can capture frames with the fallback font before the swap happens.
  const handle = delayRender(`Loading Google Font: ${fontFamily}`);

  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@${weights}&display=swap`;
  link.rel = "stylesheet";

  const finish = () => {
    const firstWeight = weights.split(";")[0] || "400";
    document.fonts
      .load(`${firstWeight} 16px "${fontFamily}"`)
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  };

  link.onload = finish;
  link.onerror = () => continueRender(handle);
  document.head.appendChild(link);
};

export const loadDefaultFonts = () => {
  loadGoogleFont("Inter");
  loadGoogleFont("Poppins");
  loadGoogleFont("Playfair Display");
  loadGoogleFont("JetBrains Mono", "400;500;700");
};
