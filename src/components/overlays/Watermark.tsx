// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {Img} from "remotion";

export type WatermarkCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface WatermarkProps {
  src?: string;
  text?: string;
  corner?: WatermarkCorner;
  opacity?: number;
  size?: number;
  margin?: number;
  color?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}

export const Watermark: React.FC<WatermarkProps> = ({
  src,
  text,
  corner = "bottomRight",
  opacity = 0.5,
  size = 80,
  margin = 30,
  color = "#ffffff",
  fontSize = 16,
  style,
}) => {
  const positionStyles: React.CSSProperties = {
    topLeft: {top: margin, left: margin},
    topRight: {top: margin, right: margin},
    bottomLeft: {bottom: margin, left: margin},
    bottomRight: {bottom: margin, right: margin},
  }[corner];

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        ...positionStyles,
        ...style,
      }}
    >
      {src ? (
        <Img
          src={src}
          style={{width: size, height: size, objectFit: "contain"}}
        />
      ) : text ? (
        <span style={{color, fontSize, fontWeight: 600}}>{text}</span>
      ) : null}
    </div>
  );
};
