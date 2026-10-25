// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export type KenBurnsDirection = "zoomIn" | "zoomOut" | "panLeft" | "panRight" | "panUp" | "panDown";

export interface FitImageProps {
  src: string;
  fit?: "cover" | "contain" | "fill";
  kenBurns?: KenBurnsDirection;
  kenBurnsIntensity?: number;
  style?: React.CSSProperties;
}

export const FitImage: React.FC<FitImageProps> = ({
  src,
  fit = "cover",
  kenBurns,
  kenBurnsIntensity = 0.1,
  style,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  let transform = "";
  if (kenBurns) {
    const intensity = kenBurnsIntensity;
    switch (kenBurns) {
      case "zoomIn":
        transform = `scale(${1 + progress * intensity})`;
        break;
      case "zoomOut":
        transform = `scale(${1 + intensity - progress * intensity})`;
        break;
      case "panLeft":
        transform = `scale(${1 + intensity}) translateX(${-progress * intensity * 100}%)`;
        break;
      case "panRight":
        transform = `scale(${1 + intensity}) translateX(${progress * intensity * 100}%)`;
        break;
      case "panUp":
        transform = `scale(${1 + intensity}) translateY(${-progress * intensity * 100}%)`;
        break;
      case "panDown":
        transform = `scale(${1 + intensity}) translateY(${progress * intensity * 100}%)`;
        break;
    }
  }

  const objectFit =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  return (
    <AbsoluteFill style={{overflow: "hidden", ...style}}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          transform,
        }}
      />
    </AbsoluteFill>
  );
};
