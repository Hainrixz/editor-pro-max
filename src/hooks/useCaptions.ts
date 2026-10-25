// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {useCurrentFrame} from "remotion";
import type {CaptionWord} from "../components/text/WordByWordCaption";

export interface CaptionEntry {
  text: string;
  startMs: number;
  endMs: number;
}

/** Convert millisecond-based captions (e.g., from Whisper) to frame-based CaptionWords */
export const captionsToWords = (
  captions: CaptionEntry[],
  fps: number,
): CaptionWord[] => {
  return captions.map((c) => ({
    text: c.text,
    startFrame: Math.round((c.startMs / 1000) * fps),
    endFrame: Math.round((c.endMs / 1000) * fps),
  }));
};

/** Hook that returns currently active caption text */
export const useCurrentCaption = (words: CaptionWord[]): string | null => {
  const frame = useCurrentFrame();

  const active = words.find(
    (w) => frame >= w.startFrame && frame <= w.endFrame,
  );

  return active?.text ?? null;
};
