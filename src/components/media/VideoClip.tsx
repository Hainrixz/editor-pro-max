// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";
import {Video} from "@remotion/media";

export interface VideoClipProps {
  src: string;
  trimStartSeconds?: number;
  trimEndSeconds?: number;
  fit?: "cover" | "contain" | "fill";
  volume?: number | ((frame: number) => number);
  playbackRate?: number;
  muted?: boolean;
  style?: React.CSSProperties;
}

export const VideoClip: React.FC<VideoClipProps> = ({
  src,
  trimStartSeconds = 0,
  trimEndSeconds,
  fit = "cover",
  volume = 1,
  playbackRate = 1,
  muted = false,
  style,
}) => {
  const {fps} = useVideoConfig();

  const trimBefore = Math.round(trimStartSeconds * fps);
  const trimAfter = trimEndSeconds !== undefined
    ? Math.round(trimEndSeconds * fps)
    : undefined;

  const objectFit =
    fit === "cover" ? "cover" : fit === "contain" ? "contain" : "fill";

  return (
    <AbsoluteFill style={style}>
      <Video
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
        }}
        volume={typeof volume === "function" ? volume : () => (muted ? 0 : volume)}
        playbackRate={playbackRate}
        muted={muted}
        trimBefore={trimBefore}
        trimAfter={trimAfter}
      />
    </AbsoluteFill>
  );
};
