import React from "react";

/**
 * Iconos SVG inline (trazos estilo Lucide). Heredan el color del texto via
 * `currentColor`, asi que cada boton los tine solo.
 */
const Svg: React.FC<{size?: number; children: React.ReactNode}> = ({
  size = 24,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{display: "block", flexShrink: 0}}
    aria-hidden={false}
  >
    {children}
  </svg>
);

type P = {size?: number};

export const IcScissors: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12" />
    <path d="M20 4 8.12 15.88" />
    <circle cx="6" cy="18" r="3" />
    <path d="M14.8 14.8 20 20" />
  </Svg>
);

export const IcTrash: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Svg>
);

export const IcChevronL: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const IcChevronR: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const IcUndo: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </Svg>
);

export const IcRedo: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </Svg>
);

export const IcPin: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M12 17v5" />
    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z" />
  </Svg>
);

export const IcPinOff: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M12 17v5" />
    <path d="M15 9.34V7h1a2 2 0 0 0 0-4H7.89" />
    <path d="m2 2 20 20" />
    <path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11" />
  </Svg>
);

export const IcBraces: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
    <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
  </Svg>
);

export const IcWarn: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const IcKeyboard: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="M6 8h.01" />
    <path d="M10 8h.01" />
    <path d="M14 8h.01" />
    <path d="M18 8h.01" />
    <path d="M6 12h.01" />
    <path d="M10 12h.01" />
    <path d="M14 12h.01" />
    <path d="M18 12h.01" />
    <path d="M7 16h10" />
  </Svg>
);

export const IcClose: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const IcSwap: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </Svg>
);

export const IcTarget: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
  </Svg>
);

export const IcBroom: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="m13 11 8-8" />
    <path d="M12.5 11.5 15 14c1 1 1 2.5 0 3.5L11.5 21c-2.5 0-6-1-8.5-3.5L9 11.5c1-1 2.5-1 3.5 0Z" />
    <path d="m7 16 2 2" />
  </Svg>
);

export const IcCursor: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <path d="m4 4 7.07 17 2.51-7.39L21 11.07z" />
  </Svg>
);

export const IcFilm: React.FC<P> = ({size}) => (
  <Svg size={size}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 3v18" />
    <path d="M17 3v18" />
    <path d="M3 8h4" />
    <path d="M3 16h4" />
    <path d="M17 8h4" />
    <path d="M17 16h4" />
  </Svg>
);
