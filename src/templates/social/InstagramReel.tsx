// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {Watermark} from "../../components/overlays/Watermark";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {SafeArea} from "../../components/layout/SafeArea";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface InstagramReelProps {
  headline?: string;
  subtext?: string;
  brandName?: string;
  backgroundColors?: string[];
  accentColor?: string;
}

export const InstagramReel: React.FC<InstagramReelProps> = ({
  headline = "Your headline here",
  subtext,
  brandName,
  backgroundColors = ["#1e1b4b", "#312e81"],
  accentColor = "#8b5cf6",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={135} animateAngle animateSpeed={0.3} />

      <SafeArea paddingHorizontal={60} paddingVertical={160}>
        <Sequence from={0} durationInFrames={200}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={headline}
              fontSize={56}
              fontWeight={800}
              color="#ffffff"
              enterAnimation="slideUp"
              exitAnimation="fade"
              enterDuration={20}
              holdDuration={140}
              exitDuration={20}
            />
          </AbsoluteFill>
        </Sequence>

        {subtext && (
          <Sequence from={30} durationInFrames={170}>
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 120,
              }}
            >
              <AnimatedTitle
                text={subtext}
                fontSize={32}
                fontWeight={400}
                color="rgba(255,255,255,0.8)"
                enterAnimation="fade"
                exitAnimation="fade"
                enterDuration={20}
                holdDuration={110}
                exitDuration={15}
              />
            </AbsoluteFill>
          </Sequence>
        )}
      </SafeArea>

      <Watermark text={brandName || BRAND.handle} corner="topRight" opacity={0.6} margin={60} fontSize={16} color="#ffffff" />

      <ProgressBar color={accentColor} height={3} />
    </AbsoluteFill>
  );
};
