// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {ParticleField} from "../../components/backgrounds/ParticleField";
import {SafeArea} from "../../components/layout/SafeArea";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface YouTubeShortProps {
  title?: string;
  subtitle?: string;
  backgroundColors?: string[];
  accentColor?: string;
}

export const YouTubeShort: React.FC<YouTubeShortProps> = ({
  title = "Your Title Here",
  subtitle,
  backgroundColors = ["#0c1222", "#162032"],
  accentColor = "#ef4444",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={180} />
      <ParticleField count={30} color="rgba(255,255,255,0.1)" speed={0.5} />

      <SafeArea paddingHorizontal={60} paddingVertical={200}>
        <Sequence from={0}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={title}
              fontSize={60}
              fontWeight={900}
              color="#ffffff"
              enterAnimation="scale"
              enterDuration={20}
              holdDuration={999}
              exitDuration={0}
              textShadow={`0 4px 20px ${accentColor}50`}
            />
            {subtitle && (
              <div style={{marginTop: 20}}>
                <AnimatedTitle
                  text={subtitle}
                  fontSize={30}
                  fontWeight={400}
                  color="rgba(255,255,255,0.7)"
                  enterAnimation="slideUp"
                  enterDuration={25}
                  holdDuration={999}
                  exitDuration={0}
                />
              </div>
            )}
          </AbsoluteFill>
        </Sequence>
      </SafeArea>

      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={40} />
    </AbsoluteFill>
  );
};
