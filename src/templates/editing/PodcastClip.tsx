// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {VideoClip} from "../../components/media/VideoClip";
import {CaptionOverlay, type CaptionPreset} from "../../components/text/CaptionOverlay";
import {AnimatedTitle} from "../../components/text/AnimatedTitle";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {SafeArea} from "../../components/layout/SafeArea";
import {Watermark} from "../../components/overlays/Watermark";
import {loadDefaultFonts} from "../../presets/fonts";
import {BRAND} from "../../presets/brand";

export interface PodcastClipProps {
  videoSrc?: string;
  clipStartSeconds?: number;
  clipEndSeconds?: number;
  captionsPath?: string;
  showCaptions?: boolean;
  captionPreset?: CaptionPreset;
  title?: string;
  accentColor?: string;
}

export const PodcastClip: React.FC<PodcastClipProps> = ({
  videoSrc = "assets/video.mp4",
  clipStartSeconds = 0,
  clipEndSeconds = 30,
  captionsPath,
  showCaptions = true,
  captionPreset = "bold",
  title,
  accentColor = "#6366f1",
}) => {
  loadDefaultFonts();

  const src = staticFile(videoSrc);
  const offsetMs = clipStartSeconds * 1000;

  return (
    <AbsoluteFill>
      {/* Video clip */}
      <VideoClip
        src={src}
        trimStartSeconds={clipStartSeconds}
        trimEndSeconds={clipEndSeconds}
      />

      {/* Captions with time offset */}
      {showCaptions && captionsPath && (
        <CaptionOverlay
          captionsSource={captionsPath}
          preset={captionPreset}
          position="bottom"
          offsetMs={offsetMs}
        />
      )}

      {/* Title at start */}
      {title && (
        <Sequence from={0} durationInFrames={90}>
          <SafeArea>
            <AbsoluteFill style={{justifyContent: "flex-start", alignItems: "center", paddingTop: 60}}>
              <AnimatedTitle
                text={title}
                fontSize={42}
                fontWeight={700}
                color="#ffffff"
                enterAnimation="slideDown"
                exitAnimation="fade"
                enterDuration={15}
                holdDuration={50}
                exitDuration={15}
                textShadow="0 2px 10px rgba(0,0,0,0.8)"
              />
            </AbsoluteFill>
          </SafeArea>
        </Sequence>
      )}

      {/* Progress bar */}
      <ProgressBar color={accentColor} height={3} />

      {/* Brand watermark */}
      <Watermark text={BRAND.handle} corner="topRight" opacity={0.5} fontSize={14} color="#ffffff" margin={30} />
    </AbsoluteFill>
  );
};
