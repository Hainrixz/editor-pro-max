#!/usr/bin/env npx tsx
// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
/**
 * Transcribe audio using Whisper.cpp with word-level timestamps.
 * Usage: npx tsx scripts/transcribe.ts [audio-path]
 * Default audio: public/assets/audio.wav
 * Output: public/captions.json
 */
import path from "path";
import {writeFileSync, existsSync} from "fs";

const inputPath = process.argv[2] || path.join("public", "assets", "audio.wav");
const whisperPath = path.join(process.cwd(), "whisper.cpp");
const outputPath = path.join("public", "captions.json");

if (!existsSync(inputPath)) {
  console.error(`Audio file not found: ${inputPath}`);
  console.error("Run extract-audio.ts first.");
  process.exit(1);
}

async function main() {
  const {
    installWhisperCpp,
    downloadWhisperModel,
    transcribe,
    toCaptions,
  } = await import("@remotion/install-whisper-cpp");

  // Step 1: Install Whisper.cpp
  console.log("Installing Whisper.cpp (first time only)...");
  const {alreadyExisted} = await installWhisperCpp({
    to: whisperPath,
    version: "1.5.5",
  });
  console.log(alreadyExisted ? "Whisper.cpp already installed" : "Whisper.cpp installed");

  // Step 2: Download model
  console.log("Downloading model (medium.en)...");
  await downloadWhisperModel({
    model: "medium.en",
    folder: whisperPath,
  });
  console.log("Model ready");

  // Step 3: Transcribe
  console.log(`Transcribing: ${inputPath}`);
  const whisperOutput = await transcribe({
    model: "medium.en",
    whisperPath,
    whisperCppVersion: "1.5.5",
    inputPath,
    tokenLevelTimestamps: true,
  });

  // Step 4: Convert to captions
  const {captions} = toCaptions({whisperCppOutput: whisperOutput});

  writeFileSync(outputPath, JSON.stringify(captions, null, 2));
  console.log(`\nCaptions saved to ${outputPath}`);
  console.log(`  ${captions.length} caption segments`);
  if (captions.length > 0) {
    console.log(`  First: "${captions[0].text.trim()}" (${captions[0].startMs}ms)`);
    const last = captions[captions.length - 1];
    console.log(`  Last: "${last.text.trim()}" (${last.endMs}ms)`);
  }
}

main().catch((err) => {
  console.error("Transcription failed:", err.message);
  process.exit(1);
});
