// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {GradientBackground} from "../../components/backgrounds/GradientBackground";
import {SafeArea} from "../../components/layout/SafeArea";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface Slide {
  title: string;
  body?: string;
}

export interface PresentationProps {
  slides?: Slide[];
  framesPerSlide?: number;
  backgroundColors?: string[];
  accentColor?: string;
  titleColor?: string;
  bodyColor?: string;
}

export const Presentation: React.FC<PresentationProps> = ({
  slides = [{title: "Slide 1", body: "Content here"}],
  framesPerSlide = 150,
  backgroundColors = ["#0a0a0a", "#1a1a2e"],
  accentColor = "#6366f1",
  titleColor = "#ffffff",
  bodyColor = "rgba(255,255,255,0.8)",
}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      <GradientBackground colors={backgroundColors} angle={135} />

      {slides.map((slide, i) => (
        <Sequence
          key={i}
          from={i * framesPerSlide}
          durationInFrames={framesPerSlide}
        >
          <SafeArea paddingHorizontal={100} paddingVertical={100}>
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "0 100px",
              }}
            >
              {/* Slide number */}
              <div
                style={{
                  fontSize: 18,
                  color: accentColor,
                  fontWeight: 600,
                  marginBottom: 16,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </div>

              <AnimatedTitle
                text={slide.title}
                fontSize={56}
                fontWeight={700}
                color={titleColor}
                textAlign="left"
                enterAnimation="slideUp"
                exitAnimation="fade"
                enterDuration={20}
                holdDuration={framesPerSlide - 50}
                exitDuration={15}
                maxWidth="100%"
              />

              {slide.body && (
                <div style={{marginTop: 24}}>
                  <AnimatedTitle
                    text={slide.body}
                    fontSize={28}
                    fontWeight={400}
                    color={bodyColor}
                    textAlign="left"
                    enterAnimation="fade"
                    exitAnimation="fade"
                    enterDuration={25}
                    holdDuration={framesPerSlide - 55}
                    exitDuration={15}
                    maxWidth="100%"
                  />
                </div>
              )}
            </AbsoluteFill>
          </SafeArea>

          {/* Accent line */}
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 100,
              bottom: 100,
              width: 3,
              backgroundColor: accentColor,
              borderRadius: 2,
            }}
          />
        </Sequence>
      ))}

      <Watermark text={BRAND.handle} corner="bottomRight" opacity={0.4} fontSize={14} color="#ffffff" />
    </AbsoluteFill>
  );
};
