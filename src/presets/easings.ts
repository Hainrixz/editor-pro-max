// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {Easing} from "remotion";

export const EASINGS = {
  linear: Easing.linear,
  easeIn: Easing.ease,
  easeInOut: Easing.inOut(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  bounceIn: Easing.bounce,
  bounceOut: Easing.out(Easing.bounce),
  elastic: Easing.elastic(1),
  backIn: Easing.back(1.5),
  backOut: Easing.out(Easing.back(1.5)),
  sharp: Easing.bezier(0.4, 0, 0.2, 1),
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
  snappy: Easing.bezier(0.68, -0.55, 0.265, 1.55),
} as const;

export type EasingKey = keyof typeof EASINGS;
