// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export interface SlideshowProps {
  images: string[];
  transitionDuration?: number;
  fit?: "cover" | "contain";
  kenBurns?: boolean;
  style?: React.CSSProperties;
}

export const Slideshow: React.FC<SlideshowProps> = ({
  images,
  transitionDuration = 15,
  fit = "cover",
  kenBurns = true,
  style,
}) => {
  const {durationInFrames} = useVideoConfig();

  if (images.length === 0) return null;

  const slideDuration = Math.floor(durationInFrames / images.length);

  return (
    <AbsoluteFill style={style}>
      {images.map((src, i) => {
        const from = i * slideDuration;
        const duration = i === images.length - 1
          ? durationInFrames - from
          : slideDuration + transitionDuration;

        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <SlideImage
              src={src}
              fit={fit}
              kenBurns={kenBurns}
              index={i}
              slideDuration={slideDuration}
              transitionDuration={transitionDuration}
              isLast={i === images.length - 1}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

interface SlideImageProps {
  src: string;
  fit: "cover" | "contain";
  kenBurns: boolean;
  index: number;
  slideDuration: number;
  transitionDuration: number;
  isLast: boolean;
}

const SlideImage: React.FC<SlideImageProps> = ({
  src,
  fit,
  kenBurns,
  index,
  slideDuration,
  transitionDuration,
  isLast,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Fade in
  const fadeInOpacity = interpolate(frame, [0, transitionDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ken Burns: alternate between zoom in and pan
  const kbProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = kenBurns ? 1 + kbProgress * 0.08 : 1;

  return (
    <AbsoluteFill style={{opacity: index === 0 ? 1 : fadeInOpacity}}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
