// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {z} from "zod";

export const FitVideoSchema = z.object({
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
  volume: z.number().min(0).max(1).optional().default(1),
  playbackRate: z.number().optional().default(1),
  muted: z.boolean().optional().default(false),
});

export const FitImageSchema = z.object({
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).optional().default("cover"),
  kenBurns: z
    .enum(["zoomIn", "zoomOut", "panLeft", "panRight", "panUp", "panDown"])
    .optional(),
  kenBurnsIntensity: z.number().optional().default(0.1),
});

export const SlideshowSchema = z.object({
  images: z.array(z.string()),
  transitionDuration: z.number().optional().default(15),
  fit: z.enum(["cover", "contain"]).optional().default("cover"),
  kenBurns: z.boolean().optional().default(true),
});
