#!/usr/bin/env npx tsx
/**
 * Extract audio from video as 16kHz WAV for Whisper transcription.
 * Usage: npx tsx scripts/extract-audio.ts public/assets/video.mp4
 * Output: public/assets/audio.wav
 */
import {execFileSync} from "child_process";
import path from "path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npx tsx scripts/extract-audio.ts <video-path>");
  process.exit(1);
}

const outputPath = path.join("public", "assets", "audio.wav");

console.log(`Extracting audio from: ${inputPath}`);
console.log(`Output: ${outputPath}`);

// execFileSync with an argv array never invokes a shell, so a path like
// `x.mp4" & rm -rf ~ & echo "` is passed to ffmpeg as one literal filename
// instead of being re-parsed and able to inject extra commands (the
// previous execSync(`... "${inputPath}" ...`) built a shell string, which
// is exploitable regardless of the surrounding quotes).
try {
  execFileSync(
    "npx",
    ["remotion", "ffmpeg", "-i", inputPath, "-ar", "16000", "-ac", "1", "-y", outputPath],
    {stdio: "inherit"},
  );
  console.log("\nAudio extracted successfully (16kHz mono WAV)");
} catch (error) {
  console.error("Failed to extract audio. Is the video file valid?");
  process.exit(1);
}
