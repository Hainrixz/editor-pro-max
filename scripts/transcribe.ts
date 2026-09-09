#!/usr/bin/env npx tsx
/**
 * Transcribe audio using Whisper.cpp with word-level timestamps.
 * Usage: npx tsx scripts/transcribe.ts [audio-path]
 * Default audio: public/assets/audio.wav
 * Output: public/captions.json
 */
import path from "path";
import os from "os";
import {spawn} from "child_process";
import {writeFileSync, readFileSync, existsSync, rmSync} from "fs";

const MODEL = "medium.en";
const WHISPER_VERSION = "1.5.5";

const inputPath = path.resolve(process.argv[2] || path.join("public", "assets", "audio.wav"));
const whisperPath = path.join(process.cwd(), "whisper.cpp");
const outputPath = path.join("public", "captions.json");

if (!existsSync(inputPath)) {
  console.error(`Audio file not found: ${inputPath}`);
  console.error("Run extract-audio.ts first.");
  process.exit(1);
}

/**
 * Whisper emits one JSON entry per token. A multi-byte UTF-8 character (e.g. the
 * "MUSICAL NOTE" it emits for non-speech audio) gets split across two entries,
 * so neither entry is valid UTF-8 on its own. Decoding them independently turns
 * both halves into U+FFFD, silently corrupting the captions — so the bytes must
 * be rejoined before they are decoded.
 *
 * Returns how many trailing bytes form an incomplete UTF-8 sequence, or 0.
 */
const incompleteTailLength = (buf: Buffer): number => {
  for (let back = 1; back <= 4 && back <= buf.length; back++) {
    const byte = buf[buf.length - back];
    if ((byte & 0xc0) === 0x80) continue; // continuation byte — keep scanning back
    let needed = 0;
    if ((byte & 0xe0) === 0xc0) needed = 2;
    else if ((byte & 0xf0) === 0xe0) needed = 3;
    else if ((byte & 0xf8) === 0xf0) needed = 4;
    else return 0; // ASCII or a stray byte — nothing pending
    return back < needed ? back : 0;
  }
  return 0;
};

interface WhisperEntry {
  text: string;
  offsets: {from: number; to: number};
  timestamps: {from: string; to: string};
  tokens: {t_dtw: number; p: number}[];
}

/** Merge entries whose bytes were split mid-character, then decode as UTF-8. */
const repairEncoding = (entries: WhisperEntry[]): WhisperEntry[] => {
  const out: WhisperEntry[] = [];
  let bytes: Buffer | null = null;
  let pending: WhisperEntry | null = null;

  for (const entry of entries) {
    const entryBytes = Buffer.from(entry.text, "latin1");
    const head = pending;
    const merged: WhisperEntry =
      head && bytes
        ? {
            ...head,
            offsets: {from: head.offsets.from, to: entry.offsets.to},
            timestamps: {from: head.timestamps.from, to: entry.timestamps.to},
          }
        : entry;
    const mergedBytes: Buffer = head && bytes ? Buffer.concat([bytes, entryBytes]) : entryBytes;

    if (incompleteTailLength(mergedBytes) > 0) {
      // Wait for the rest of the character before decoding.
      pending = merged;
      bytes = mergedBytes;
      continue;
    }

    out.push({...merged, text: mergedBytes.toString("utf8")});
    bytes = null;
    pending = null;
  }

  if (pending && bytes) {
    const tail: WhisperEntry = pending;
    out.push({...tail, text: bytes.toString("utf8")});
  }
  return out;
};

const runWhisper = (modelPath: string, outBase: string) =>
  new Promise<void>((resolve, reject) => {
    const bin = os.platform() === "win32" ? "main.exe" : "./main";
    const task = spawn(
      path.join(whisperPath, bin),
      [
        "-f", inputPath,
        "-m", modelPath,
        "--output-file", outBase,
        "--output-json",
        "-ojf",
        "--max-len", "1",
        "--dtw", MODEL,
        "-l", "en",
        "-pp",
      ],
      {cwd: whisperPath},
    );
    let stderr = "";
    task.stderr.on("data", (d) => {
      stderr += d.toString("utf-8");
      process.stderr.write(d.toString("utf-8"));
    });
    task.on("error", reject);
    task.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Whisper exited with code ${code}\n${stderr}`)),
    );
  });

async function main() {
  const {installWhisperCpp, downloadWhisperModel, toCaptions} = await import(
    "@remotion/install-whisper-cpp"
  );

  // Step 1: Install Whisper.cpp
  console.log("Installing Whisper.cpp (first time only)...");
  const {alreadyExisted} = await installWhisperCpp({to: whisperPath, version: WHISPER_VERSION});
  console.log(alreadyExisted ? "Whisper.cpp already installed" : "Whisper.cpp installed");

  // Step 2: Download model
  console.log(`Downloading model (${MODEL})...`);
  await downloadWhisperModel({model: MODEL, folder: whisperPath});
  console.log("Model ready");

  // Step 3: Transcribe
  console.log(`Transcribing: ${inputPath}`);
  const outBase = path.join(os.tmpdir(), `whisper-${Date.now()}`);
  const jsonPath = `${outBase}.json`;
  await runWhisper(path.join(whisperPath, `ggml-${MODEL}.bin`), outBase);

  // Step 4: Read as latin1 so raw bytes survive, then repair split characters.
  // Reading as utf8 here is what corrupts multi-byte characters.
  const raw = JSON.parse(readFileSync(jsonPath, "latin1"));
  rmSync(jsonPath, {force: true});
  const transcription = repairEncoding(raw.transcription);

  // Step 5: Convert to captions
  const {captions} = toCaptions({
    whisperCppOutput: {...raw, transcription} as never,
  });

  writeFileSync(outputPath, JSON.stringify(captions, null, 2), "utf8");
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
