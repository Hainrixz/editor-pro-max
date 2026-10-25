// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {useState, useEffect} from "react";
import {staticFile, delayRender, continueRender, cancelRender} from "remotion";

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  hasAudio: boolean;
}

export const useVideoMetadata = (
  metadataPath: string = "video-metadata.json",
): VideoMetadata | null => {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [handle] = useState(() => delayRender("Loading video metadata"));

  useEffect(() => {
    fetch(staticFile(metadataPath))
      .then((r) => r.json())
      .then((data: VideoMetadata) => {
        setMetadata(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [metadataPath, handle]);

  return metadata;
};
