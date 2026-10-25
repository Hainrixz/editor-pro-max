// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React, {useEffect, useMemo, useState} from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  delayRender,
  continueRender,
  cancelRender,
} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import {FONT_FAMILIES, loadGoogleFont} from "../../presets/fonts";

export type CaptionPreset = "classic" | "bold" | "outline" | "glow" | "box";

export interface CaptionOverlayProps {
  captionsSource: string;
  preset?: CaptionPreset;
  position?: "top" | "center" | "bottom";
  fontSize?: number;
  fontFamily?: string;
  highlightColor?: string;
  textColor?: string;
  combineTokensWithinMs?: number;
  offsetMs?: number;
  style?: React.CSSProperties;
}

const PRESET_STYLES: Record<CaptionPreset, {
  bg: string;
  shadow: string;
  stroke: string;
  highlightBg: string;
}> = {
  classic: {
    bg: "transparent",
    shadow: "2px 2px 4px rgba(0,0,0,0.8)",
    stroke: "none",
    highlightBg: "transparent",
  },
  bold: {
    bg: "transparent",
    shadow: "0 4px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)",
    stroke: "none",
    highlightBg: "transparent",
  },
  outline: {
    bg: "transparent",
    shadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
    stroke: "none",
    highlightBg: "transparent",
  },
  glow: {
    bg: "transparent",
    shadow: "0 0 20px rgba(99,102,241,0.8), 0 0 40px rgba(99,102,241,0.4)",
    stroke: "none",
    highlightBg: "transparent",
  },
  box: {
    bg: "rgba(0,0,0,0.75)",
    shadow: "none",
    stroke: "none",
    highlightBg: "rgba(99,102,241,0.9)",
  },
};

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  captionsSource,
  preset = "bold",
  position = "bottom",
  fontSize = 64,
  fontFamily = FONT_FAMILIES.heading,
  highlightColor = "#39E508",
  textColor = "#ffffff",
  combineTokensWithinMs = 1200,
  offsetMs = 0,
  style,
}) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));
  const {fps} = useVideoConfig();

  const fontName = fontFamily.replace(/'/g, "").split(",")[0].trim();
  loadGoogleFont(fontName);

  useEffect(() => {
    fetch(staticFile(captionsSource))
      .then((r) => r.json())
      .then((data: Caption[]) => {
        // Apply offset if extracting a clip
        const adjusted = offsetMs
          ? data.map((c) => ({
              ...c,
              startMs: c.startMs - offsetMs,
              endMs: c.endMs - offsetMs,
            }))
          : data;
        setCaptions(adjusted.filter((c) => c.startMs >= 0));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [captionsSource, offsetMs, handle]);

  const pages = useMemo(() => {
    if (!captions) return [];
    const result = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: combineTokensWithinMs,
    });
    return result.pages;
  }, [captions, combineTokensWithinMs]);

  if (!captions) return null;

  const positionStyles: React.CSSProperties = {
    top: {top: 80},
    center: {top: "50%", transform: "translateY(-50%)"},
    bottom: {bottom: 120},
  }[position];

  const presetStyle = PRESET_STYLES[preset];

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        ...positionStyles,
        ...style,
      }}
    >
      {pages.map((page, index) => {
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const nextStart = pages[index + 1]?.startMs ?? page.startMs + combineTokensWithinMs;
        const endFrame = Math.round((nextStart / 1000) * fps);
        const duration = endFrame - startFrame;

        if (duration <= 0) return null;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <CaptionPage
              page={page}
              fontSize={fontSize}
              fontFamily={fontFamily}
              textColor={textColor}
              highlightColor={highlightColor}
              presetStyle={presetStyle}
              preset={preset}
            />
          </Sequence>
        );
      })}
    </div>
  );
};

interface CaptionPageProps {
  page: TikTokPage;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  presetStyle: typeof PRESET_STYLES[CaptionPreset];
  preset: CaptionPreset;
}

const CaptionPage: React.FC<CaptionPageProps> = ({
  page,
  fontSize,
  fontFamily,
  textColor,
  highlightColor,
  presetStyle,
  preset,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "85%",
        padding: preset === "box" ? "12px 20px" : 0,
        borderRadius: preset === "box" ? 8 : 0,
        backgroundColor: preset === "box" ? presetStyle.bg : "transparent",
      }}
    >
      <span
        style={{
          fontSize,
          fontFamily,
          fontWeight: 800,
          lineHeight: 1.3,
          whiteSpace: "pre",
        }}
      >
        {page.tokens.map((token, i) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <span
              key={i}
              style={{
                color: isActive ? highlightColor : textColor,
                textShadow: presetStyle.shadow,
                backgroundColor: isActive && preset === "box"
                  ? presetStyle.highlightBg
                  : "transparent",
                borderRadius: preset === "box" ? 4 : 0,
                padding: preset === "box" ? "2px 4px" : 0,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </span>
    </div>
  );
};
