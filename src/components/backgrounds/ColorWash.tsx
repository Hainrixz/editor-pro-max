// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill} from "remotion";

export interface ColorWashProps {
  color: string;
  toColor?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

export const ColorWash: React.FC<ColorWashProps> = ({
  color,
  toColor,
  opacity = 1,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
        ...style,
      }}
    />
  );
};
