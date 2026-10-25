// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export interface LowerThirdProps {
  name: string;
  title?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  position?: "bottomLeft" | "bottomRight" | "bottomCenter";
  enterDuration?: number;
  holdDuration?: number;
  exitDuration?: number;
  style?: React.CSSProperties;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  accentColor = "#6366f1",
  backgroundColor = "rgba(0, 0, 0, 0.85)",
  textColor = "#ffffff",
  fontFamily = FONT_FAMILIES.heading,
  position = "bottomLeft",
  enterDuration = 20,
  holdDuration = 90,
  exitDuration = 15,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  const totalDuration = enterDuration + holdDuration + exitDuration;
  const exitStart = enterDuration + holdDuration;

  if (frame > totalDuration) return null;

  // Enter animation
  const enterProgress = spring({
    fps,
    frame: Math.min(frame, enterDuration),
    config: {damping: 14, stiffness: 120},
  });

  // Exit animation
  const exitProgress =
    frame >= exitStart
      ? interpolate(frame, [exitStart, exitStart + exitDuration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const translateX = frame < exitStart
    ? interpolate(enterProgress, [0, 1], [-100, 0])
    : interpolate(exitProgress, [0, 1], [0, -100]);

  const opacity = frame < exitStart
    ? interpolate(enterProgress, [0, 1], [0, 1])
    : 1 - exitProgress;

  const positionStyles: React.CSSProperties = {
    bottomLeft: {bottom: 80, left: 60},
    bottomRight: {bottom: 80, right: 60},
    bottomCenter: {bottom: 80, left: "50%", transform: "translateX(-50%)"},
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles,
        opacity,
        transform: position === "bottomCenter"
          ? `translateX(calc(-50% + ${translateX}%))`
          : `translateX(${translateX}%)`,
        ...style,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          backgroundColor,
          padding: "16px 28px 16px 20px",
          marginLeft: 4,
          borderRadius: "0 6px 6px 0",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontFamily,
            fontWeight: 700,
            color: textColor,
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              fontSize: 18,
              fontFamily,
              fontWeight: 400,
              color: accentColor,
              marginTop: 4,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
        )}
      </div>
    </div>
  );
};
