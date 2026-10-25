// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
export const PLATFORMS = {
  tiktok: {width: 1080, height: 1920, fps: 30, name: "TikTok"},
  instagram_reel: {width: 1080, height: 1920, fps: 30, name: "Instagram Reel"},
  instagram_post: {width: 1080, height: 1080, fps: 30, name: "Instagram Post"},
  instagram_story: {width: 1080, height: 1920, fps: 30, name: "Instagram Story"},
  youtube: {width: 1920, height: 1080, fps: 30, name: "YouTube"},
  youtube_short: {width: 1080, height: 1920, fps: 60, name: "YouTube Short"},
  twitter: {width: 1080, height: 1080, fps: 30, name: "Twitter/X"},
  linkedin: {width: 1920, height: 1080, fps: 30, name: "LinkedIn"},
  facebook: {width: 1080, height: 1080, fps: 30, name: "Facebook"},
} as const;

export type PlatformKey = keyof typeof PLATFORMS;

export const ASPECT_RATIOS = {
  landscape: {width: 1920, height: 1080},
  portrait: {width: 1080, height: 1920},
  square: {width: 1080, height: 1080},
  cinematic: {width: 1920, height: 800},
  ultrawide: {width: 2560, height: 1080},
} as const;

export const secondsToFrames = (seconds: number, fps: number): number =>
  Math.round(seconds * fps);

export const framesToSeconds = (frames: number, fps: number): number =>
  frames / fps;
