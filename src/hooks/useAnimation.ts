// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {useCurrentFrame, useVideoConfig, interpolate, spring} from "remotion";

interface UseAnimationOptions {
  enterDuration?: number;
  holdDuration?: number;
  exitDuration?: number;
  type?: "spring" | "linear";
}

interface AnimationValues {
  opacity: number;
  enterProgress: number;
  exitProgress: number;
  isEntering: boolean;
  isHolding: boolean;
  isExiting: boolean;
  isVisible: boolean;
}

export const useAnimation = ({
  enterDuration = 20,
  holdDuration = 60,
  exitDuration = 15,
  type = "spring",
}: UseAnimationOptions = {}): AnimationValues => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const exitStart = enterDuration + holdDuration;
  const totalDuration = exitStart + exitDuration;

  const isEntering = frame < enterDuration;
  const isExiting = frame >= exitStart && frame <= totalDuration;
  const isHolding = frame >= enterDuration && frame < exitStart;
  const isVisible = frame <= totalDuration;

  let enterProgress: number;
  if (type === "spring") {
    enterProgress = spring({
      fps,
      frame: Math.min(frame, enterDuration),
      config: {damping: 14, stiffness: 120},
    });
  } else {
    enterProgress = interpolate(frame, [0, enterDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const exitProgress = isExiting
    ? interpolate(frame, [exitStart, totalDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const opacity = isExiting ? 1 - exitProgress : Math.min(enterProgress, 1);

  return {
    opacity,
    enterProgress,
    exitProgress,
    isEntering,
    isHolding,
    isExiting,
    isVisible,
  };
};
