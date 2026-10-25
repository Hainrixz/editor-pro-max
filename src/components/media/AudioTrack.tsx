// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {useVideoConfig, interpolate} from "remotion";
import {Audio} from "@remotion/media";

export interface AudioTrackProps {
  src: string;
  volume?: number;
  fadeInDurationSeconds?: number;
  fadeOutDurationSeconds?: number;
  duckDuringSegments?: Array<{startSeconds: number; endSeconds: number}>;
  duckVolume?: number;
  loop?: boolean;
  trimStartSeconds?: number;
  trimEndSeconds?: number;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  src,
  volume = 0.3,
  fadeInDurationSeconds = 1,
  fadeOutDurationSeconds = 2,
  duckDuringSegments,
  duckVolume = 0.1,
  loop = true,
  trimStartSeconds = 0,
  trimEndSeconds,
}) => {
  const {fps, durationInFrames} = useVideoConfig();

  const fadeInFrames = Math.round(fadeInDurationSeconds * fps);
  const fadeOutFrames = Math.round(fadeOutDurationSeconds * fps);
  const trimBefore = Math.round(trimStartSeconds * fps);
  const trimAfter = trimEndSeconds !== undefined
    ? Math.round(trimEndSeconds * fps)
    : undefined;

  const volumeCallback = (frame: number): number => {
    // Fade in
    let vol = volume;
    if (frame < fadeInFrames) {
      vol *= interpolate(frame, [0, fadeInFrames], [0, 1], {
        extrapolateRight: "clamp",
      });
    }

    // Fade out
    const fadeOutStart = durationInFrames - fadeOutFrames;
    if (frame >= fadeOutStart) {
      vol *= interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
    }

    // Duck during speech segments
    if (duckDuringSegments) {
      const currentSeconds = frame / fps;
      const isDucking = duckDuringSegments.some(
        (seg) => currentSeconds >= seg.startSeconds && currentSeconds <= seg.endSeconds,
      );
      if (isDucking) {
        vol = duckVolume;
      }
    }

    return vol;
  };

  return (
    <Audio
      src={src}
      volume={volumeCallback}
      loop={loop}
      trimBefore={trimBefore}
      trimAfter={trimAfter}
    />
  );
};
