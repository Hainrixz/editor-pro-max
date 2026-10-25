// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useCurrentFrame, useVideoConfig, interpolate} from "remotion";

export interface ProgressBarProps {
  color?: string;
  backgroundColor?: string;
  height?: number;
  position?: "top" | "bottom";
  borderRadius?: number;
  margin?: number;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  color = "#6366f1",
  backgroundColor = "rgba(255,255,255,0.15)",
  height = 4,
  position = "bottom",
  borderRadius = 2,
  margin = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: margin,
        right: margin,
        [position]: margin,
        height,
        backgroundColor,
        borderRadius,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius,
        }}
      />
    </div>
  );
};
