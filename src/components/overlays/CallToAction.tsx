// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useCurrentFrame, useVideoConfig, spring, interpolate} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface CallToActionProps {
  text: string;
  subtext?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  position?: "bottom" | "top" | "center";
  enterDelay?: number;
  style?: React.CSSProperties;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  text,
  subtext,
  backgroundColor = "rgba(99, 102, 241, 0.95)",
  textColor = "#ffffff",
  accentColor = "#c4b5fd",
  fontFamily = FONT_FAMILIES.heading,
  position = "bottom",
  enterDelay = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  const adjustedFrame = Math.max(0, frame - enterDelay);

  const progress = spring({
    fps,
    frame: adjustedFrame,
    config: {damping: 12, stiffness: 100},
  });

  const translateY = interpolate(progress, [0, 1], [100, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  if (adjustedFrame <= 0) return null;

  const positionStyles: React.CSSProperties = {
    bottom: {bottom: 80, left: 0, right: 0},
    top: {top: 80, left: 0, right: 0},
    center: {top: "50%", left: 0, right: 0, transform: "translateY(-50%)"},
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        ...positionStyles,
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: "20px 40px",
          borderRadius: 16,
          textAlign: "center",
          opacity,
          transform: `translateY(${translateY}px)`,
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: textColor,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: 18,
              fontFamily,
              fontWeight: 400,
              color: accentColor,
              marginTop: 6,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
