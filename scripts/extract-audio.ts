#!/usr/bin/env npx tsx
// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
/**
 * Extract audio from video as 16kHz WAV for Whisper transcription.
 * Usage: npx tsx scripts/extract-audio.ts public/assets/video.mp4
 * Output: public/assets/audio.wav
 */
import {execSync} from "child_process";
import path from "path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npx tsx scripts/extract-audio.ts <video-path>");
  process.exit(1);
}

const outputPath = path.join("public", "assets", "audio.wav");

console.log(`Extracting audio from: ${inputPath}`);
console.log(`Output: ${outputPath}`);

const cmd = `npx remotion ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -y "${outputPath}"`;

try {
  execSync(cmd, {stdio: "inherit"});
  console.log("\nAudio extracted successfully (16kHz mono WAV)");
} catch (error) {
  console.error("Failed to extract audio. Is the video file valid?");
  process.exit(1);
}
