// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useCurrentFrame} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface CaptionWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface WordByWordCaptionProps {
  words: CaptionWord[];
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  highlightColor?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  maxWidth?: string;
  position?: "top" | "center" | "bottom";
  style?: React.CSSProperties;
}

export const WordByWordCaption: React.FC<WordByWordCaptionProps> = ({
  words,
  fontSize = 48,
  fontFamily = FONT_FAMILIES.heading,
  fontWeight = 800,
  color = "rgba(255,255,255,0.6)",
  highlightColor = "#ffffff",
  backgroundColor = "rgba(0,0,0,0.7)",
  padding = 16,
  borderRadius = 12,
  maxWidth = "80%",
  position = "bottom",
  style,
}) => {
  const frame = useCurrentFrame();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  // Find visible words (show a window around the active word)
  const activeWordIndex = words.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame,
  );

  if (activeWordIndex === -1) return null;

  // Show a group of words around the active word
  const windowSize = 5;
  const groupStart = Math.max(
    0,
    Math.floor(activeWordIndex / windowSize) * windowSize,
  );
  const groupEnd = Math.min(words.length, groupStart + windowSize);
  const visibleWords = words.slice(groupStart, groupEnd);

  const positionStyles: React.CSSProperties = {
    top: {top: 80},
    center: {top: "50%", transform: "translateY(-50%)"},
    bottom: {bottom: 120},
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        ...positionStyles,
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: `${padding}px ${padding * 1.5}px`,
          borderRadius,
          maxWidth,
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        {visibleWords.map((word, i) => {
          const isActive =
            frame >= word.startFrame && frame <= word.endFrame;

          return (
            <span
              key={groupStart + i}
              style={{
                fontSize,
                fontFamily,
                fontWeight,
                color: isActive ? highlightColor : color,
                marginRight: 12,
                transition: "none",
                display: "inline",
                textShadow: isActive
                  ? "0 2px 10px rgba(99, 102, 241, 0.5)"
                  : "none",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
