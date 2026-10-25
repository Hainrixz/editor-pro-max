// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, OffthreadVideo} from "remotion";

export interface FitVideoProps {
  src: string;
  fit?: "cover" | "contain" | "fill";
  volume?: number | ((frame: number) => number);
  playbackRate?: number;
  muted?: boolean;
  style?: React.CSSProperties;
}

export const FitVideo: React.FC<FitVideoProps> = ({
  src,
  fit = "cover",
  volume = 1,
  playbackRate = 1,
  muted = false,
  style,
}) => {
  const objectFit =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  return (
    <AbsoluteFill style={style}>
      <OffthreadVideo
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
        }}
        volume={typeof volume === "function" ? volume : () => (muted ? 0 : volume)}
        playbackRate={playbackRate}
        muted={muted}
      />
    </AbsoluteFill>
  );
};
