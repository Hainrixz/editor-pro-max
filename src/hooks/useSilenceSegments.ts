// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {useState, useEffect} from "react";
import {staticFile, delayRender, continueRender, cancelRender} from "remotion";
import type {Segment} from "../components/media/JumpCut";

export interface SilenceData {
  silenceSegments: Segment[];
  speechSegments: Segment[];
  totalDuration: number;
  speechDuration: number;
  silenceDuration: number;
}

interface RawSegment {
  start?: number;
  end?: number;
  startSeconds?: number;
  endSeconds?: number;
}

const normalizeSegment = (s: RawSegment): Segment => ({
  startSeconds: s.startSeconds ?? s.start ?? 0,
  endSeconds: s.endSeconds ?? s.end ?? 0,
});

/**
 * Load silence detection results.
 * Pass null to skip loading (hook is always called, but does nothing when null).
 */
export const useSilenceSegments = (
  silencePath: string | null = "silence.json",
): SilenceData | null => {
  const [data, setData] = useState<SilenceData | null>(null);
  const [handle] = useState(() =>
    silencePath ? delayRender("Loading silence data") : null,
  );

  useEffect(() => {
    if (!silencePath || !handle) {
      return;
    }

    fetch(staticFile(silencePath))
      .then((r) => r.json())
      .then((result: any) => {
        setData({
          ...result,
          speechSegments: (result.speechSegments || []).map(normalizeSegment),
          silenceSegments: (result.silenceSegments || []).map(normalizeSegment),
        });
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [silencePath, handle]);

  return data;
};
