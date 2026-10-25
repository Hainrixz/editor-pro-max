// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {VideoClip} from "../../components/media/VideoClip";
import {JumpCut} from "../../components/media/JumpCut";
import {CaptionOverlay, type CaptionPreset} from "../../components/text/CaptionOverlay";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {LowerThird} from "../../components/text/LowerThird";
import {CallToAction} from "../../components/overlays/CallToAction";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {AudioTrack} from "../../components/media/AudioTrack";
import {useSilenceSegments} from "../../hooks/useSilenceSegments";
import {buildCutList, mergeSegments} from "../../utils/editing";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface TalkingHeadEditProps {
  videoSrc?: string;
  captionsPath?: string;
  silencePath?: string;
  removeSilence?: boolean;
  showCaptions?: boolean;
  captionPreset?: CaptionPreset;
  title?: string;
  titleDuration?: number;
  speakerName?: string;
  speakerTitle?: string;
  ctaText?: string;
  ctaDuration?: number;
  backgroundMusic?: string;
  musicVolume?: number;
  accentColor?: string;
}

export const TalkingHeadEdit: React.FC<TalkingHeadEditProps> = ({
  videoSrc = "assets/video.mp4",
  captionsPath,
  silencePath,
  removeSilence = false,
  showCaptions = true,
  captionPreset = "bold",
  title,
  titleDuration = 90,
  speakerName,
  speakerTitle,
  ctaText,
  ctaDuration = 90,
  backgroundMusic,
  musicVolume = 0.15,
  accentColor = "#6366f1",
}) => {
  loadDefaultFonts();

  const silenceData = useSilenceSegments(silencePath ?? null);

  // Build cut list from speech segments
  const segments = silenceData
    ? mergeSegments(
        buildCutList(silenceData.speechSegments, {paddingSeconds: 0.15}),
        0.3,
      )
    : [];

  const src = staticFile(videoSrc);

  return (
    <AbsoluteFill>
      {/* Video layer — either jump-cut or full */}
      {removeSilence && segments.length > 0 ? (
        <JumpCut src={src} segments={segments} paddingSeconds={0} />
      ) : (
        <VideoClip src={src} />
      )}

      {/* Captions */}
      {showCaptions && captionsPath && (
        <CaptionOverlay
          captionsSource={captionsPath}
          preset={captionPreset}
          position="bottom"
        />
      )}

      {/* Title overlay at start */}
      {title && (
        <Sequence from={0} durationInFrames={titleDuration}>
          <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
            <AnimatedTitle
              text={title}
              fontSize={56}
              fontWeight={800}
              color="#ffffff"
              enterAnimation="scale"
              exitAnimation="fade"
              enterDuration={20}
              holdDuration={titleDuration - 40}
              exitDuration={15}
              textShadow={`0 4px 20px ${accentColor}40`}
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Lower third */}
      {speakerName && (
        <Sequence from={title ? titleDuration - 10 : 15} durationInFrames={150}>
          <LowerThird
            name={speakerName}
            title={speakerTitle}
            accentColor={accentColor}
            enterDuration={20}
            holdDuration={90}
            exitDuration={15}
          />
        </Sequence>
      )}

      {/* CTA at the end */}
      {ctaText && (
        <Sequence from={0}>
          <CallToAction
            text={ctaText}
            backgroundColor={accentColor}
            enterDelay={Math.max(0, (removeSilence && segments.length > 0
              ? segments.reduce((sum, s) => sum + (s.endSeconds - s.startSeconds), 0) * 30
              : 200) - ctaDuration)}
          />
        </Sequence>
      )}

      {/* Background music */}
      {backgroundMusic && (
        <AudioTrack
          src={staticFile(backgroundMusic)}
          volume={musicVolume}
          fadeInDurationSeconds={2}
          fadeOutDurationSeconds={3}
          loop
        />
      )}

      {/* Progress bar */}
      <ProgressBar color={accentColor} height={3} />

      {/* Brand watermark */}
      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={30} />
    </AbsoluteFill>
  );
};
