// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {z} from "zod";

export const ColorSchema = z.string().describe("CSS color value");

export const AnimationStyleSchema = z.enum([
  "fade",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "scale",
  "typewriter",
  "blur",
]);

export const PositionSchema = z.enum([
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
  "center",
]);

export const PlatformSchema = z.enum([
  "tiktok",
  "instagram_reel",
  "instagram_post",
  "instagram_story",
  "youtube",
  "youtube_short",
  "twitter",
  "linkedin",
  "facebook",
]);

export const PaletteSchema = z.enum([
  "dark",
  "light",
  "vibrant",
  "warm",
  "cool",
  "neon",
]);
