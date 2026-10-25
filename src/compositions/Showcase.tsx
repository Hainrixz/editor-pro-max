// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {AbsoluteFill, Sequence} from "remotion";
import {AnimatedTitle} from "../components/text/AnimatedTitle";
import {LowerThird} from "../components/text/LowerThird";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {ParticleField} from "../components/backgrounds/ParticleField";
import {Watermark} from "../components/overlays/Watermark";
import {BRAND} from "../presets/brand";
import {loadDefaultFonts} from "../presets/fonts";

export const ShowcaseComposition: React.FC = () => {
  loadDefaultFonts();

  return (
    <AbsoluteFill>
      {/* Background */}
      <GradientBackground
        colors={[BRAND.colors.bg, "#1a1a3e"]}
        angle={135}
        animateAngle
        animateSpeed={0.5}
      />
      <ParticleField count={30} color={`${BRAND.colors.primary}25`} speed={0.3} />

      {/* Main title */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
          <AnimatedTitle
            text={BRAND.name}
            fontSize={96}
            fontWeight={800}
            color={BRAND.colors.text}
            enterAnimation="scale"
            exitAnimation="blur"
            enterDuration={25}
            holdDuration={80}
            exitDuration={20}
            textShadow={`0 4px 30px ${BRAND.colors.primary}80`}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Subtitle */}
      <Sequence from={30} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <AnimatedTitle
            text={BRAND.tagline}
            fontSize={36}
            fontWeight={400}
            color={BRAND.colors.muted}
            enterAnimation="slideUp"
            exitAnimation="fade"
            enterDuration={20}
            holdDuration={60}
            exitDuration={15}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Brand handle */}
      <Sequence from={60} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 180,
          }}
        >
          <AnimatedTitle
            text={BRAND.handle}
            fontSize={28}
            fontWeight={600}
            color={BRAND.colors.primary}
            enterAnimation="fade"
            exitAnimation="fade"
            enterDuration={15}
            holdDuration={40}
            exitDuration={15}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Second scene */}
      <Sequence from={160} durationInFrames={130}>
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
          <AnimatedTitle
            text="Built with Remotion + Claude Code"
            fontSize={64}
            fontWeight={700}
            color={BRAND.colors.text}
            enterAnimation="typewriter"
            exitAnimation="slideLeft"
            enterDuration={40}
            holdDuration={50}
            exitDuration={15}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Lower third */}
      <Sequence from={170} durationInFrames={110}>
        <LowerThird
          name="Enrique Rocha"
          title={BRAND.handle}
          accentColor={BRAND.colors.primary}
          enterDuration={20}
          holdDuration={60}
          exitDuration={15}
        />
      </Sequence>

      {/* Watermark */}
      <Watermark
        text={BRAND.handle}
        corner="bottomRight"
        opacity={BRAND.watermark.opacity}
        fontSize={BRAND.watermark.fontSize}
        color={BRAND.colors.muted}
      />
    </AbsoluteFill>
  );
};
