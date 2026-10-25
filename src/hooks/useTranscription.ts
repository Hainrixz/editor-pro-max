// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {useState, useEffect, useMemo} from "react";
import {staticFile, delayRender, continueRender, cancelRender} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";

export interface TranscriptionData {
  captions: Caption[];
  pages: TikTokPage[];
  isLoading: boolean;
}

export const useTranscription = (
  captionsPath: string = "captions.json",
  combineTokensWithinMs: number = 1200,
): TranscriptionData => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading transcription"));

  useEffect(() => {
    fetch(staticFile(captionsPath))
      .then((r) => r.json())
      .then((data: Caption[]) => {
        setCaptions(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [captionsPath, handle]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: combineTokensWithinMs,
    }).pages;
  }, [captions, combineTokensWithinMs]);

  return {
    captions: captions || [],
    pages,
    isLoading: !captions,
  };
};
