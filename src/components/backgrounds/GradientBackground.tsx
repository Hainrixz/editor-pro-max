// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

export interface GradientBackgroundProps {
  colors: readonly string[] | string[];
  angle?: number;
  animateAngle?: boolean;
  animateSpeed?: number;
  type?: "linear" | "radial";
  style?: React.CSSProperties;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors,
  angle = 135,
  animateAngle = false,
  animateSpeed = 1,
  type = "linear",
  style,
}) => {
  const frame = useCurrentFrame();

  const currentAngle = animateAngle
    ? angle + frame * animateSpeed
    : angle;

  const colorStops = colors
    .map((color, i) => {
      const position = (i / (colors.length - 1)) * 100;
      return `${color} ${position}%`;
    })
    .join(", ");

  const gradient =
    type === "radial"
      ? `radial-gradient(circle, ${colorStops})`
      : `linear-gradient(${currentAngle}deg, ${colorStops})`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
        ...style,
      }}
    />
  );
};
