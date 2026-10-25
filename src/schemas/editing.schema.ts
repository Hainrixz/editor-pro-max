// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {z} from "zod";

export const SegmentSchema = z.object({
  startSeconds: z.number(),
  endSeconds: z.number(),
});

export const VideoClipSchema = z.object({
  src: z.string(),
  trimStartSeconds: z.number().optional().default(0),
  trimEndSeconds: z.number().optional(),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
  volume: z.number().min(0).max(1).optional().default(1),
  playbackRate: z.number().optional().default(1),
  muted: z.boolean().optional().default(false),
});

export const CaptionOverlaySchema = z.object({
  captionsSource: z.string(),
  preset: z.enum(["classic", "bold", "outline", "glow", "box"]).optional().default("bold"),
  position: z.enum(["top", "center", "bottom"]).optional().default("bottom"),
  fontSize: z.number().optional().default(64),
  highlightColor: z.string().optional().default("#39E508"),
  textColor: z.string().optional().default("#ffffff"),
  combineTokensWithinMs: z.number().optional().default(1200),
  offsetMs: z.number().optional().default(0),
});

export const JumpCutSchema = z.object({
  src: z.string(),
  segments: z.array(SegmentSchema),
  paddingSeconds: z.number().optional().default(0.1),
  volume: z.number().optional().default(1),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
});

export const TalkingHeadEditSchema = z.object({
  videoSrc: z.string().optional().default("assets/video.mp4"),
  captionsPath: z.string().optional(),
  silencePath: z.string().optional(),
  removeSilence: z.boolean().optional().default(false),
  showCaptions: z.boolean().optional().default(true),
  captionPreset: z.enum(["classic", "bold", "outline", "glow", "box"]).optional().default("bold"),
  title: z.string().optional(),
  speakerName: z.string().optional(),
  speakerTitle: z.string().optional(),
  ctaText: z.string().optional(),
  backgroundMusic: z.string().optional(),
  musicVolume: z.number().optional().default(0.15),
});

export const PodcastClipSchema = z.object({
  videoSrc: z.string().optional().default("assets/video.mp4"),
  clipStartSeconds: z.number().optional().default(0),
  clipEndSeconds: z.number().optional().default(30),
  captionsPath: z.string().optional(),
  showCaptions: z.boolean().optional().default(true),
  captionPreset: z.enum(["classic", "bold", "outline", "glow", "box"]).optional().default("bold"),
  title: z.string().optional(),
});
