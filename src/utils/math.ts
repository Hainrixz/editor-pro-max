// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {interpolate, spring} from "remotion";

/** Clamp a value between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Linear interpolation between a and b */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Remap a value from one range to another */
export const remap = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  const t = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, clamp(t, 0, 1));
};

/** Create a fade-in interpolation */
export const fadeIn = (
  frame: number,
  startFrame: number,
  duration: number,
): number =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Create a fade-out interpolation */
export const fadeOut = (
  frame: number,
  startFrame: number,
  duration: number,
): number =>
  interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Create a slide-in from a direction */
export const slideIn = (
  frame: number,
  startFrame: number,
  duration: number,
  distance: number,
  fps: number,
): number => {
  const progress = spring({
    fps,
    frame: frame - startFrame,
    config: {damping: 12, stiffness: 100},
  });
  return interpolate(progress, [0, 1], [distance, 0]);
};

/** Create enter-hold-exit opacity pattern */
export const enterHoldExit = (
  frame: number,
  enterDuration: number,
  holdDuration: number,
  exitDuration: number,
): number => {
  const exitStart = enterDuration + holdDuration;
  if (frame < enterDuration) {
    return interpolate(frame, [0, enterDuration], [0, 1], {
      extrapolateRight: "clamp",
    });
  }
  if (frame < exitStart) {
    return 1;
  }
  return interpolate(frame, [exitStart, exitStart + exitDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
