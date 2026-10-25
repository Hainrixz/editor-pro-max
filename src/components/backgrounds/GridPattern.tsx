// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

export interface GridPatternProps {
  type?: "dots" | "lines" | "crosses";
  spacing?: number;
  size?: number;
  color?: string;
  opacity?: number;
  animate?: boolean;
  animateSpeed?: number;
  style?: React.CSSProperties;
}

export const GridPattern: React.FC<GridPatternProps> = ({
  type = "dots",
  spacing = 40,
  size = 2,
  color = "rgba(255,255,255,0.15)",
  opacity = 1,
  animate = false,
  animateSpeed = 0.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const offset = animate ? (frame * animateSpeed) % spacing : 0;

  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;

  const elements: React.ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing - spacing + offset;
      const y = row * spacing - spacing + offset;

      if (type === "dots") {
        elements.push(
          <circle key={`${row}-${col}`} cx={x} cy={y} r={size} fill={color} />,
        );
      } else if (type === "crosses") {
        elements.push(
          <g key={`${row}-${col}`}>
            <line
              x1={x - size * 2}
              y1={y}
              x2={x + size * 2}
              y2={y}
              stroke={color}
              strokeWidth={size * 0.5}
            />
            <line
              x1={x}
              y1={y - size * 2}
              x2={x}
              y2={y + size * 2}
              stroke={color}
              strokeWidth={size * 0.5}
            />
          </g>,
        );
      }
    }
  }

  if (type === "lines") {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing - spacing + offset;
      elements.push(
        <line
          key={`v-${col}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={color}
          strokeWidth={size * 0.5}
        />,
      );
    }
    for (let row = 0; row < rows; row++) {
      const y = row * spacing - spacing + offset;
      elements.push(
        <line
          key={`h-${row}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={color}
          strokeWidth={size * 0.5}
        />,
      );
    }
  }

  return (
    <AbsoluteFill style={{opacity, ...style}}>
      <svg width={width} height={height}>
        {elements}
      </svg>
    </AbsoluteFill>
  );
};
