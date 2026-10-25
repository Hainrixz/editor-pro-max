// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from "remotion";
import {loadDefaultFonts} from "../../presets/fonts";

export interface BeforeAfterProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeColor?: string;
  afterColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  children: [React.ReactNode, React.ReactNode];
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeLabel = "Before",
  afterLabel = "After",
  beforeColor = "#ef4444",
  afterColor = "#10b981",
  backgroundColor = "#0a0a0a",
  accentColor = "#ffffff",
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  loadDefaultFonts();

  // Wipe transition at midpoint
  const midpoint = Math.floor(durationInFrames / 2);
  const wipeProgress = interpolate(
    frame,
    [midpoint - 15, midpoint + 15],
    [0, 100],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <AbsoluteFill style={{backgroundColor}}>
      {/* Before */}
      <AbsoluteFill
        style={{
          clipPath: `inset(0 ${wipeProgress}% 0 0)`,
        }}
      >
        {children[0]}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            backgroundColor: beforeColor,
            color: accentColor,
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {beforeLabel}
        </div>
      </AbsoluteFill>

      {/* After */}
      <AbsoluteFill
        style={{
          clipPath: `inset(0 0 0 ${100 - wipeProgress}%)`,
        }}
      >
        {children[1]}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            backgroundColor: afterColor,
            color: accentColor,
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {afterLabel}
        </div>
      </AbsoluteFill>

      {/* Divider line */}
      {wipeProgress > 0 && wipeProgress < 100 && (
        <div
          style={{
            position: "absolute",
            left: `${100 - wipeProgress}%`,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: accentColor,
            boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
