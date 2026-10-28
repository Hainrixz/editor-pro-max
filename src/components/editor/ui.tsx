import React from "react";
import {clipMeta, UI} from "./theme";

/**
 * Estados hover/active del editor. Van en un <style> porque los estilos
 * inline de React no pueden expresar :hover, y montar listeners de raton en
 * cada boton seria mas fragil que tres reglas CSS.
 */
export const EditorStyles: React.FC = () => (
  <style>{`
    .rne, .rne * { box-sizing: border-box; -webkit-font-smoothing: antialiased; user-select: none; }
    .rne-btn { transition: filter .12s ease, background .12s ease, border-color .12s ease, transform .06s ease; }
    .rne-btn:hover:not(:disabled) { filter: brightness(1.22); }
    .rne-btn:active:not(:disabled) { transform: translateY(1.5px); }
    .rne-block { transition: filter .1s ease; }
    .rne-block:hover { filter: brightness(1.35); }
    /* Scroll discreto dentro del dock: fino, oscuro y sin flechas, en vez
       de la barra gris del sistema que rompia la estetica del panel. */
    [data-rne-dock-root] *::-webkit-scrollbar { width: 8px; height: 8px; }
    [data-rne-dock-root] *::-webkit-scrollbar-track { background: transparent; }
    [data-rne-dock-root] *::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.14);
      border-radius: 8px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    [data-rne-dock-root] *::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.28); }
  `}</style>
);

/** Panel flotante estandar: mismo fondo, borde, radio y sombra en todos. */
export const panelStyle: React.CSSProperties = {
  background: UI.bg,
  border: UI.border,
  borderRadius: UI.radius,
  boxShadow: UI.shadow,
  backdropFilter: "blur(8px)",
};

export const Btn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "accent" | "danger" | "ghost";
  title?: string;
  icon?: React.ReactNode;
  square?: boolean;
  active?: boolean;
  children?: React.ReactNode;
}> = ({onClick, disabled, tone = "default", title, icon, square, active, children}) => {
  const palette = {
    default: {
      bg: "rgba(255,255,255,0.07)",
      color: UI.text,
      border: "1px solid rgba(255,255,255,0.12)",
    },
    accent: {bg: UI.accent, color: UI.accentInk, border: "1px solid transparent"},
    danger: {
      bg: "rgba(244,88,122,0.13)",
      color: UI.danger,
      border: "1px solid rgba(244,88,122,0.4)",
    },
    ghost: {bg: "transparent", color: UI.textDim, border: "1px solid transparent"},
  }[tone];

  return (
    <button
      type="button"
      className="rne-btn"
      disabled={disabled}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        appearance: "none",
        border: active ? `1px solid ${UI.accent}` : palette.border,
        borderRadius: 9,
        padding: square ? 8 : "8px 13px",
        fontFamily: UI.font,
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: 0.2,
        lineHeight: 1.2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.32 : 1,
        color: active ? UI.accent : palette.color,
        background: palette.bg,
      }}
    >
      {icon}
      {children}
    </button>
  );
};

/** Tecla dibujada para la leyenda de atajos. */
export const Kbd: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      fontFamily: UI.mono,
      fontSize: 15,
      fontWeight: 700,
      padding: "3px 9px",
      borderRadius: 7,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.16)",
      borderBottomWidth: 3,
      color: UI.text,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

/** Ficha de clip: punto de color + nombre corto. */
export const ClipChip: React.FC<{src: string; size?: number}> = ({src, size = 14}) => {
  const meta = clipMeta(src);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 999,
        background: meta.soft,
        border: `1px solid ${meta.color}55`,
        fontFamily: UI.mono,
        fontSize: size,
        fontWeight: 700,
        color: meta.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: meta.color,
          flexShrink: 0,
        }}
      />
      {meta.short}
    </span>
  );
};
