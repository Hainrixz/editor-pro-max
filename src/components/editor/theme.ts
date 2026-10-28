/**
 * Sistema visual del editor in-canvas. Paleta oscura tipo suite de edicion:
 * paneles casi negros, bordes sutiles y UN solo acento (el coral de marca).
 * Todo el editor bebe de aqui para que header, inspector y timeline se lean
 * como una sola herramienta y no como parches sueltos.
 */
import type {CSSProperties} from "react";

export const UI = {
  font: "'Poppins', sans-serif",
  mono: "'JetBrains Mono', monospace",

  bg: "rgba(15, 17, 21, 0.94)",
  bgRaised: "rgba(255, 255, 255, 0.05)",
  bgInset: "rgba(0, 0, 0, 0.38)",

  border: "1px solid rgba(255, 255, 255, 0.09)",
  borderStrong: "rgba(255, 255, 255, 0.18)",

  text: "#e9ecf2",
  textDim: "#98a1b0",
  textFaint: "#657084",

  accent: "#ec9eb3",
  accentInk: "#38101f",
  danger: "#f4587a",
  warn: "#f5b74e",
  ok: "#57d9a3",

  radius: 18,
  radiusSm: 12,
  shadow: "0 20px 60px rgba(0, 0, 0, 0.55)",
} as const;

/**
 * Dock lateral derecho. Los paneles del editor se dibujan a "escala de lienzo"
 * (fuentes de 20-30 px pensadas para un canvas de 1080 que Studio reduce). En
 * el portal se renderizan 1:1 en pixeles de pantalla, asi que los encogemos en
 * bloque con `zoom`: el contenido se autora a `virtualWidth` px y sale a
 * `width` px reales, con la tipografia base cayendo a ~12 px. Un solo factor
 * conserva intactas todas las proporciones del design system.
 */
export const DOCK = {
  width: 404, // ancho real en pantalla
  zoom: 0.6, // 20 px de fuente -> 12 px reales
  top: 44, // arranca debajo de la barra de menus de Studio
  pad: 13, // margen interno, en px de lienzo (virtuales)
  z: 2000000, // por encima del preview y de los overlays de Studio
} as const;

/** Ancho en px "virtuales" al que se autora el contenido antes del zoom. */
export const DOCK_VIRTUAL_W = Math.round(DOCK.width / DOCK.zoom); // ~673

/** Etiqueta gris de seccion (INICIO, FIN, ENCUADRE...). */
export const sectionLabel: CSSProperties = {
  fontFamily: UI.font,
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: 2.5,
  color: UI.textDim,
  textTransform: "uppercase",
};

/**
 * Cada clip fuente tiene su color en el timeline y en las fichas: de un
 * vistazo se ve que tramo del reel viene de que toma.
 */
export const CLIP_META: Record<string, {short: string; color: string; soft: string}> = {
  "assets/nebraska01.mp4": {short: "nebraska01", color: "#58b8f5", soft: "rgba(88, 184, 245, 0.26)"},
  "assets/nebraska02.mp4": {short: "nebraska02", color: "#b18cf9", soft: "rgba(177, 140, 249, 0.26)"},
  "assets/nebraska03.mp4": {short: "nebraska03", color: "#4ad39a", soft: "rgba(74, 211, 154, 0.26)"},
};

export const clipMeta = (src: string) =>
  CLIP_META[src] ?? {short: src, color: "#8a93a5", soft: "rgba(138, 147, 165, 0.22)"};
