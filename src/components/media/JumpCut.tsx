// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Series, useVideoConfig} from "remotion";
import {VideoClip} from "./VideoClip";

export interface Segment {
  startSeconds: number;
  endSeconds: number;
}

export interface JumpCutProps {
  src: string;
  segments: Segment[];
  paddingSeconds?: number;
  volume?: number;
  fit?: "cover" | "contain" | "fill";
  muted?: boolean;
  style?: React.CSSProperties;
}

export const JumpCut: React.FC<JumpCutProps> = ({
  src,
  segments,
  paddingSeconds = 0.1,
  volume = 1,
  fit = "cover",
  muted = false,
  style,
}) => {
  const {fps} = useVideoConfig();

  if (segments.length === 0) return null;

  return (
    <AbsoluteFill style={style}>
      <Series>
        {segments.map((segment, i) => {
          const start = Math.max(0, segment.startSeconds - paddingSeconds);
          const end = segment.endSeconds + paddingSeconds;
          const durationSeconds = end - start;
          const durationInFrames = Math.round(durationSeconds * fps);

          if (durationInFrames <= 0) return null;

          return (
            <Series.Sequence key={i} durationInFrames={durationInFrames}>
              <VideoClip
                src={src}
                trimStartSeconds={start}
                trimEndSeconds={end}
                volume={volume}
                fit={fit}
                muted={muted}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};

/** Calculate the total duration in frames for a JumpCut */
export const calculateJumpCutDuration = (
  segments: Segment[],
  fps: number,
  paddingSeconds = 0.1,
): number => {
  return segments.reduce((total, seg) => {
    const start = Math.max(0, seg.startSeconds - paddingSeconds);
    const end = seg.endSeconds + paddingSeconds;
    return total + Math.round((end - start) * fps);
  }, 0);
};
