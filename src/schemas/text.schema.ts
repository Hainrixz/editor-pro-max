// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {z} from "zod";
import {ColorSchema, AnimationStyleSchema} from "./common.schema";

export const AnimatedTitleSchema = z.object({
  text: z.string(),
  fontSize: z.number().optional().default(64),
  fontFamily: z.string().optional(),
  fontWeight: z.number().optional().default(700),
  color: ColorSchema.optional().default("#ffffff"),
  textAlign: z.enum(["left", "center", "right"]).optional().default("center"),
  enterAnimation: AnimationStyleSchema.optional().default("fade"),
  exitAnimation: AnimationStyleSchema.optional().default("fade"),
  enterDuration: z.number().optional().default(20),
  holdDuration: z.number().optional().default(60),
  exitDuration: z.number().optional().default(15),
});

export const LowerThirdSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  accentColor: ColorSchema.optional().default("#6366f1"),
  backgroundColor: ColorSchema.optional().default("rgba(0, 0, 0, 0.85)"),
  textColor: ColorSchema.optional().default("#ffffff"),
  position: z
    .enum(["bottomLeft", "bottomRight", "bottomCenter"])
    .optional()
    .default("bottomLeft"),
  enterDuration: z.number().optional().default(20),
  holdDuration: z.number().optional().default(90),
  exitDuration: z.number().optional().default(15),
});
