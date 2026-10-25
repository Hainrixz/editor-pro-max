// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill} from "remotion";

export interface SplitScreenProps {
  direction?: "horizontal" | "vertical";
  ratio?: number;
  gap?: number;
  children: React.ReactNode[];
  style?: React.CSSProperties;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  direction = "horizontal",
  ratio = 0.5,
  gap = 0,
  children,
  style,
}) => {
  const panels = React.Children.toArray(children).slice(0, 4);
  const isHorizontal = direction === "horizontal";

  if (panels.length === 2) {
    const firstSize = `${ratio * 100}%`;
    const secondSize = `${(1 - ratio) * 100}%`;

    return (
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          gap,
          ...style,
        }}
      >
        <div
          style={{
            width: isHorizontal ? firstSize : "100%",
            height: isHorizontal ? "100%" : firstSize,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {panels[0]}
        </div>
        <div
          style={{
            width: isHorizontal ? secondSize : "100%",
            height: isHorizontal ? "100%" : secondSize,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {panels[1]}
        </div>
      </AbsoluteFill>
    );
  }

  // Grid layout for 3-4 panels
  return (
    <AbsoluteFill
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap,
        ...style,
      }}
    >
      {panels.map((panel, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {panel}
        </div>
      ))}
    </AbsoluteFill>
  );
};
