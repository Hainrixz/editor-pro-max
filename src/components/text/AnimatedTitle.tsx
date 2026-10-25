// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export type AnimationStyle =
  | "fade"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scale"
  | "typewriter"
  | "blur";

export interface AnimatedTitleProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  textAlign?: React.CSSProperties["textAlign"];
  enterAnimation?: AnimationStyle;
  exitAnimation?: AnimationStyle;
  enterDuration?: number;
  holdDuration?: number;
  exitDuration?: number;
  textShadow?: string;
  letterSpacing?: number;
  lineHeight?: number;
  maxWidth?: string;
  style?: React.CSSProperties;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  fontSize = 64,
  fontFamily = FONT_FAMILIES.heading,
  fontWeight = 700,
  color = "#ffffff",
  textAlign = "center",
  enterAnimation = "fade",
  exitAnimation = "fade",
  enterDuration = 20,
  holdDuration = 60,
  exitDuration = 15,
  textShadow,
  letterSpacing = 0,
  lineHeight = 1.2,
  maxWidth = "80%",
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Load font if it's a Google Font
  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  const totalDuration = enterDuration + holdDuration + exitDuration;
  const exitStart = enterDuration + holdDuration;

  // Calculate enter animation values
  const getEnterValues = () => {
    if (frame >= enterDuration) return {opacity: 1, transform: "none", filter: "none"};

    const enterProgress = spring({
      fps,
      frame,
      config: {damping: 14, stiffness: 120},
    });

    const opacity = interpolate(frame, [0, enterDuration * 0.6], [0, 1], {
      extrapolateRight: "clamp",
    });

    switch (enterAnimation) {
      case "slideUp":
        return {opacity, transform: `translateY(${interpolate(enterProgress, [0, 1], [60, 0])}px)`, filter: "none"};
      case "slideDown":
        return {opacity, transform: `translateY(${interpolate(enterProgress, [0, 1], [-60, 0])}px)`, filter: "none"};
      case "slideLeft":
        return {opacity, transform: `translateX(${interpolate(enterProgress, [0, 1], [80, 0])}px)`, filter: "none"};
      case "slideRight":
        return {opacity, transform: `translateX(${interpolate(enterProgress, [0, 1], [-80, 0])}px)`, filter: "none"};
      case "scale":
        return {opacity, transform: `scale(${interpolate(enterProgress, [0, 1], [0.5, 1])})`, filter: "none"};
      case "blur": {
        const blur = interpolate(frame, [0, enterDuration], [20, 0], {extrapolateRight: "clamp"});
        return {opacity, transform: "none", filter: `blur(${blur}px)`};
      }
      case "typewriter":
        return {opacity: 1, transform: "none", filter: "none"};
      default:
        return {opacity, transform: "none", filter: "none"};
    }
  };

  // Calculate exit animation values
  const getExitValues = () => {
    if (frame < exitStart || exitDuration === 0) return {opacity: 1, transform: "none", filter: "none"};

    const exitProgress = interpolate(frame, [exitStart, exitStart + exitDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const opacity = 1 - exitProgress;

    switch (exitAnimation) {
      case "slideUp":
        return {opacity, transform: `translateY(${interpolate(exitProgress, [0, 1], [0, -60])}px)`, filter: "none"};
      case "slideDown":
        return {opacity, transform: `translateY(${interpolate(exitProgress, [0, 1], [0, 60])}px)`, filter: "none"};
      case "slideLeft":
        return {opacity, transform: `translateX(${interpolate(exitProgress, [0, 1], [0, -80])}px)`, filter: "none"};
      case "slideRight":
        return {opacity, transform: `translateX(${interpolate(exitProgress, [0, 1], [0, 80])}px)`, filter: "none"};
      case "scale":
        return {opacity, transform: `scale(${interpolate(exitProgress, [0, 1], [1, 0.5])})`, filter: "none"};
      case "blur": {
        const blur = interpolate(exitProgress, [0, 1], [0, 20]);
        return {opacity, transform: "none", filter: `blur(${blur}px)`};
      }
      default:
        return {opacity, transform: "none", filter: "none"};
    }
  };

  // Typewriter: reveal characters progressively
  const displayText =
    enterAnimation === "typewriter" && frame < enterDuration
      ? text.slice(0, Math.floor(interpolate(frame, [0, enterDuration], [0, text.length], {extrapolateRight: "clamp"})))
      : text;

  const isExiting = frame >= exitStart && exitDuration > 0;
  const animValues = isExiting ? getExitValues() : getEnterValues();

  if (frame > totalDuration) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        ...style,
      }}
    >
      <h1
        style={{
          fontSize,
          fontFamily,
          fontWeight,
          color,
          textAlign,
          textShadow,
          letterSpacing,
          lineHeight,
          maxWidth,
          margin: 0,
          opacity: animValues.opacity,
          transform: animValues.transform,
          filter: animValues.filter,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {displayText}
      </h1>
    </div>
  );
};
