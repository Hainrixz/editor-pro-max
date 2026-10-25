// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface CountdownTimerProps {
  startFrom: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  accentColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startFrom,
  fontSize = 120,
  fontFamily = FONT_FAMILIES.display,
  color = "#ffffff",
  accentColor = "#6366f1",
  showLabel = false,
  label = "Starting in",
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  const secondsRemaining = Math.max(0, Math.ceil((startFrom - frame) / fps));

  if (frame > startFrom) return null;

  // Scale pulse when number changes
  const frameInSecond = frame % fps;
  const scale = spring({
    fps,
    frame: frameInSecond,
    config: {damping: 8, stiffness: 200},
  });

  const scaleValue = interpolate(scale, [0, 1], [1.2, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {showLabel && (
        <div
          style={{
            fontSize: fontSize * 0.25,
            fontFamily,
            fontWeight: 400,
            color: accentColor,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontSize,
          fontFamily,
          fontWeight: 900,
          color,
          transform: `scale(${scaleValue})`,
          textShadow: `0 0 40px ${accentColor}`,
        }}
      >
        {secondsRemaining}
      </div>
    </div>
  );
};
