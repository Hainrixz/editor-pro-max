// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {ParticleField} from "../../components/backgrounds/ParticleField";
import {CallToAction} from "../../components/overlays/CallToAction";
import {SafeArea} from "../../components/layout/SafeArea";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface AnnouncementProps {
  preTitle?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  ctaSubtext?: string;
  backgroundColors?: string[];
  accentColor?: string;
}

export const Announcement: React.FC<AnnouncementProps> = ({
  preTitle = "Introducing",
  title = "Your Title Here",
  subtitle,
  cta,
  ctaSubtext,
  backgroundColors = ["#0f0f23", "#1a1a3e"],
  accentColor = "#6366f1",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={135} animateAngle animateSpeed={0.3} />
      <ParticleField count={40} color={`${accentColor}30`} speed={0.3} />

      <SafeArea>
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
          {/* Pre-title */}
          {preTitle && (
            <Sequence from={0} durationInFrames={200}>
              <div style={{position: "absolute", top: "30%", width: "100%", textAlign: "center"}}>
                <AnimatedTitle
                  text={preTitle}
                  fontSize={24}
                  fontWeight={500}
                  color={accentColor}
                  enterAnimation="fade"
                  enterDuration={20}
                  holdDuration={140}
                  exitDuration={15}
                  letterSpacing={6}
                />
              </div>
            </Sequence>
          )}

          {/* Main title */}
          <Sequence from={20} durationInFrames={220}>
            <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
              <AnimatedTitle
                text={title}
                fontSize={72}
                fontWeight={900}
                color="#ffffff"
                enterAnimation="scale"
                exitAnimation="blur"
                enterDuration={25}
                holdDuration={150}
                exitDuration={20}
                textShadow={`0 0 40px ${accentColor}40`}
              />
            </AbsoluteFill>
          </Sequence>

          {/* Subtitle */}
          {subtitle && (
            <Sequence from={50} durationInFrames={190}>
              <div style={{position: "absolute", top: "58%", width: "100%", textAlign: "center"}}>
                <AnimatedTitle
                  text={subtitle}
                  fontSize={28}
                  fontWeight={400}
                  color="rgba(255,255,255,0.7)"
                  enterAnimation="slideUp"
                  exitAnimation="fade"
                  enterDuration={20}
                  holdDuration={130}
                  exitDuration={15}
                />
              </div>
            </Sequence>
          )}
        </AbsoluteFill>
      </SafeArea>

      {/* CTA */}
      {cta && (
        <Sequence from={80}>
          <CallToAction
            text={cta}
            subtext={ctaSubtext}
            backgroundColor={accentColor}
            enterDelay={0}
          />
        </Sequence>
      )}

      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={40} />
    </AbsoluteFill>
  );
};
