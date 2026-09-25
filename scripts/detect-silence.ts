#!/usr/bin/env npx tsx
/**
 * Detect silence in a video/audio file using FFmpeg.
 * Usage: npx tsx scripts/detect-silence.ts public/assets/video.mp4 [noise-db] [min-duration]
 * Output: public/silence.json
 */
import {spawnSync} from "child_process";
import {writeFileSync} from "fs";
import path from "path";

const inputPath = process.argv[2];
const noiseDb = process.argv[3] || "-30dB";
const minDuration = process.argv[4] || "0.5";

if (!inputPath) {
  console.error("Usage: npx tsx scripts/detect-silence.ts <video-path> [noise-db] [min-duration]");
  console.error("  noise-db: silence threshold (default: -30dB)");
  console.error("  min-duration: minimum silence duration in seconds (default: 0.5)");
  process.exit(1);
}

console.log(`Detecting silence in: ${inputPath}`);
console.log(`  Noise threshold: ${noiseDb}`);
console.log(`  Min silence duration: ${minDuration}s`);

// spawnSync with an argv array never invokes a shell, so a crafted
// filename or noise/duration argument can't break out and run arbitrary
// commands the way the previous execSync(`...${inputPath}...`) shell-string
// version could. ffmpeg's silencedetect logs to stderr, so both streams
// are captured and combined the way the old `2>&1` shell redirect did.
const proc = spawnSync(
  "npx",
  ["remotion", "ffmpeg", "-i", inputPath, "-af", `silencedetect=noise=${noiseDb}:d=${minDuration}`, "-f", "null", "-"],
  {encoding: "utf-8"},
);
const output = (proc.stdout || "") + (proc.stderr || "");

// Parse silence_start and silence_end from stderr
const silenceSegments: Array<{start: number; end: number}> = [];
const lines = output.split("\n");

let currentStart: number | null = null;
for (const line of lines) {
  const startMatch = line.match(/silence_start:\s*([\d.]+)/);
  const endMatch = line.match(/silence_end:\s*([\d.]+)/);

  if (startMatch) {
    currentStart = parseFloat(startMatch[1]);
  }
  if (endMatch && currentStart !== null) {
    silenceSegments.push({
      start: currentStart,
      end: parseFloat(endMatch[1]),
    });
    currentStart = null;
  }
}

// Get total duration
const durationMatch = output.match(/Duration:\s*([\d:.]+)/);
let totalDuration = 0;
if (durationMatch) {
  const parts = durationMatch[1].split(":");
  totalDuration =
    parseFloat(parts[0]) * 3600 +
    parseFloat(parts[1]) * 60 +
    parseFloat(parts[2]);
}

// Compute speech segments (inverse of silence)
const speechSegments: Array<{start: number; end: number}> = [];
let cursor = 0;
for (const silence of silenceSegments) {
  if (silence.start > cursor) {
    speechSegments.push({start: cursor, end: silence.start});
  }
  cursor = silence.end;
}
if (cursor < totalDuration) {
  speechSegments.push({start: cursor, end: totalDuration});
}

const result = {
  silenceSegments,
  speechSegments,
  totalDuration,
  speechDuration: speechSegments.reduce((sum, s) => sum + (s.end - s.start), 0),
  silenceDuration: silenceSegments.reduce((sum, s) => sum + (s.end - s.start), 0),
};

const outputPath = path.join("public", "silence.json");
writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`\nResults saved to ${outputPath}`);
console.log(`  Total duration: ${totalDuration.toFixed(2)}s`);
console.log(`  Speech: ${result.speechDuration.toFixed(2)}s (${speechSegments.length} segments)`);
console.log(`  Silence: ${result.silenceDuration.toFixed(2)}s (${silenceSegments.length} segments)`);
console.log(`  Removal would save: ${((result.silenceDuration / totalDuration) * 100).toFixed(1)}%`);
