#!/usr/bin/env npx tsx
/**
 * Analyze a video file and extract metadata.
 * Usage: npx tsx scripts/analyze-video.ts public/assets/video.mp4
 * Output: public/video-metadata.json
 */
import {execFileSync} from "child_process";
import {writeFileSync} from "fs";
import path from "path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npx tsx scripts/analyze-video.ts <video-path>");
  process.exit(1);
}

console.log(`Analyzing: ${inputPath}`);

// execFileSync with an argv array never invokes a shell, so a crafted
// filename (e.g. `x.mp4" & someCommand & echo "`) can't break out and run
// arbitrary commands the way the previous execSync(`...${inputPath}...`)
// shell-string version could.
const output = execFileSync(
  "npx",
  ["remotion", "ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", inputPath],
  {encoding: "utf-8"},
);
const probe = JSON.parse(output);

const videoStream = probe.streams?.find((s: any) => s.codec_type === "video");
const audioStream = probe.streams?.find((s: any) => s.codec_type === "audio");

// r_frame_rate is a "num/den" fraction (e.g. "30/1", "24000/1001") coming
// straight from ffprobe's parse of the file's own container metadata —
// i.e. untrusted, attacker-influenceable input. eval()-ing it executed
// that string as JavaScript; parsing the fraction by hand removes the
// code-execution path entirely.
const parseFrameRate = (rate: string): number => {
  const [num, den] = rate.split("/").map(Number);
  return den ? num / den : num;
};

const metadata = {
  duration: parseFloat(probe.format?.duration || "0"),
  width: videoStream?.width || 0,
  height: videoStream?.height || 0,
  fps: videoStream?.r_frame_rate
    ? parseFrameRate(videoStream.r_frame_rate)
    : 30,
  videoCodec: videoStream?.codec_name || "unknown",
  audioCodec: audioStream?.codec_name || "none",
  bitrate: parseInt(probe.format?.bit_rate || "0", 10),
  fileSize: parseInt(probe.format?.size || "0", 10),
  hasAudio: !!audioStream,
};

const outputPath = path.join("public", "video-metadata.json");
writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

console.log(`Metadata saved to ${outputPath}`);
console.log(`  Duration: ${metadata.duration.toFixed(2)}s`);
console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);
console.log(`  FPS: ${Math.round(metadata.fps)}`);
console.log(`  Video codec: ${metadata.videoCodec}`);
console.log(`  Audio: ${metadata.hasAudio ? metadata.audioCodec : "none"}`);
