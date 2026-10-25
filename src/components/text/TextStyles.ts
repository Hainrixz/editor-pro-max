// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {FONT_FAMILIES} from "../../presets/fonts";

export const TEXT_STYLES = {
  heading: {
    fontSize: 72,
    fontFamily: FONT_FAMILIES.heading,
    fontWeight: 800 as const,
    lineHeight: 1.1,
    letterSpacing: -1,
  },
  subheading: {
    fontSize: 36,
    fontFamily: FONT_FAMILIES.heading,
    fontWeight: 600 as const,
    lineHeight: 1.3,
    letterSpacing: 0,
  },
  body: {
    fontSize: 24,
    fontFamily: FONT_FAMILIES.body,
    fontWeight: 400 as const,
    lineHeight: 1.6,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 48,
    fontFamily: FONT_FAMILIES.heading,
    fontWeight: 800 as const,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  quote: {
    fontSize: 42,
    fontFamily: FONT_FAMILIES.elegant,
    fontWeight: 400 as const,
    lineHeight: 1.5,
    letterSpacing: 0.5,
    fontStyle: "italic" as const,
  },
  code: {
    fontSize: 28,
    fontFamily: FONT_FAMILIES.mono,
    fontWeight: 400 as const,
    lineHeight: 1.6,
    letterSpacing: 0,
  },
  display: {
    fontSize: 120,
    fontFamily: FONT_FAMILIES.display,
    fontWeight: 900 as const,
    lineHeight: 1.0,
    letterSpacing: -2,
  },
} as const;

export type TextStyleKey = keyof typeof TEXT_STYLES;
