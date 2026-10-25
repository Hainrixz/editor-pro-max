// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {CallToAction} from "../../components/overlays/CallToAction";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {Watermark} from "../../components/overlays/Watermark";
import {SafeArea} from "../../components/layout/SafeArea";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface TikTokVideoProps {
  hook?: string;
  body?: string;
  cta?: string;
  backgroundColors?: string[];
  accentColor?: string;
  textColor?: string;
}

export const TikTokVideo: React.FC<TikTokVideoProps> = ({
  hook = "Your hook here",
  body = "Your message here",
  cta = "Follow for more",
  backgroundColors = ["#0f0f23", "#1a1a3e"],
  accentColor = "#f43f5e",
  textColor = "#ffffff",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={180} />

      <SafeArea paddingHorizontal={60} paddingVertical={120}>
        {/* Hook — appears immediately */}
        <Sequence from={0} durationInFrames={120}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={hook}
              fontSize={64}
              fontWeight={900}
              color={textColor}
              enterAnimation="scale"
              exitAnimation="slideLeft"
              enterDuration={15}
              holdDuration={70}
              exitDuration={15}
              textShadow={`0 4px 20px ${accentColor}40`}
            />
          </AbsoluteFill>
        </Sequence>

        {/* Body text */}
        <Sequence from={100} durationInFrames={140}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={body}
              fontSize={48}
              fontWeight={600}
              color={textColor}
              enterAnimation="slideUp"
              exitAnimation="fade"
              enterDuration={20}
              holdDuration={80}
              exitDuration={15}
            />
          </AbsoluteFill>
        </Sequence>
      </SafeArea>

      {/* CTA */}
      <Sequence from={200}>
        <CallToAction
          text={cta}
          backgroundColor={accentColor}
          enterDelay={0}
        />
      </Sequence>

      {/* Progress bar */}
      <ProgressBar color={accentColor} height={3} />

      {/* Brand watermark */}
      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={40} />
    </AbsoluteFill>
  );
};
