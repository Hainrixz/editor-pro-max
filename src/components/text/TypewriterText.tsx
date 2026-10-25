// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useCurrentFrame} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface TypewriterTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  cursorColor?: string;
  showCursor?: boolean;
  typingSpeed?: number;
  startDelay?: number;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize = 48,
  fontFamily = FONT_FAMILIES.mono,
  fontWeight = 400,
  color = "#ffffff",
  cursorColor = "#6366f1",
  showCursor = true,
  typingSpeed = 2,
  startDelay = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  const adjustedFrame = Math.max(0, frame - startDelay);
  const charsToShow = Math.min(
    Math.floor(adjustedFrame / typingSpeed),
    text.length,
  );
  const displayText = text.slice(0, charsToShow);
  const isTyping = charsToShow < text.length && adjustedFrame > 0;

  const cursorOpacity =
    showCursor && (isTyping || adjustedFrame === 0)
      ? Math.round(frame / 8) % 2 === 0
        ? 1
        : 0
      : 0;

  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {displayText}
      {showCursor && (
        <span
          style={{
            color: cursorColor,
            opacity: cursorOpacity,
            fontWeight: 100,
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
