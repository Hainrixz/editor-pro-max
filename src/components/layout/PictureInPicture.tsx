// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill} from "remotion";

export type PipCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface PictureInPictureProps {
  main: React.ReactNode;
  pip: React.ReactNode;
  corner?: PipCorner;
  pipWidth?: number;
  pipHeight?: number;
  margin?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  main,
  pip,
  corner = "bottomRight",
  pipWidth = 360,
  pipHeight = 240,
  margin = 24,
  borderRadius = 12,
  borderColor = "rgba(255,255,255,0.2)",
  borderWidth = 2,
  shadow = true,
  style,
}) => {
  const positionStyles: React.CSSProperties = {
    topLeft: {top: margin, left: margin},
    topRight: {top: margin, right: margin},
    bottomLeft: {bottom: margin, left: margin},
    bottomRight: {bottom: margin, right: margin},
  }[corner];

  return (
    <AbsoluteFill style={style}>
      {/* Main content */}
      <AbsoluteFill>{main}</AbsoluteFill>

      {/* PiP overlay */}
      <div
        style={{
          position: "absolute",
          width: pipWidth,
          height: pipHeight,
          borderRadius,
          overflow: "hidden",
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: shadow ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
          ...positionStyles,
        }}
      >
        {pip}
      </div>
    </AbsoluteFill>
  );
};
