#!/usr/bin/env npx tsx
/** Reproduce la matematica del motor de encuadre y busca movimientos bruscos. */
import {readFileSync} from "fs";
import {CLIPS} from "../src/data/nebraska";

const FPS = 24;
const INTRO = 72;
const HALF = (576 * (9 / 16)) / 1024 / 2;
const MAX_PAN = 0.11;
const DEADBAND = 0.05;
const MIN_COVERAGE = 0.45;

const root = readFileSync("src/Root.tsx", "utf8");
const raw = root.match(/\{"prizeShots".*?"showSourceTime":(?:true|false)\}/s)![0];
const props = JSON.parse(raw.replace(/ as const/g, ""));
const SHOTS = props.prizeShots as {
  clip: string;
  label: string;
  cx: number;
  start: number;
  end: number;
}[];
const RAMP: number = props.rampSeconds;

const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smoothstep = (t: number) => {
  const x = clampN(t, 0, 1);
  return x * x * (3 - 2 * x);
};

const faceAt = (clip: (typeof CLIPS)[number], t: number) => {
  const pts = clip.face;
  if (t <= pts[0].t) return pts[0].cx;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i].t) {
      const a = pts[i - 1];
      const b = pts[i];
      return a.cx + (b.cx - a.cx) * ((t - a.t) / (b.t - a.t || 1));
    }
  }
  return pts[pts.length - 1].cx;
};

const shotForCut = (src: string, seg: {startSeconds: number; endSeconds: number}) => {
  const len = seg.endSeconds - seg.startSeconds;
  let best: (typeof SHOTS)[number] | null = null;
  let bestCov = MIN_COVERAGE;
  for (const s of SHOTS) {
    if (s.clip !== src) continue;
    const overlap =
      Math.min(s.end, seg.endSeconds) - Math.max(s.start, seg.startSeconds);
    const cov = overlap / len;
    if (cov > bestCov) {
      bestCov = cov;
      best = s;
    }
  }
  return best;
};

const cutPath = (clip: (typeof CLIPS)[number], seg: {startSeconds: number; endSeconds: number}, shot: any) => {
  const frames = Math.round((seg.endSeconds - seg.startSeconds) * FPS);
  const step = MAX_PAN / FPS;
  const targets: number[] = [];
  let held = 0;
  for (let f = 0; f < frames; f++) {
    const t = seg.startSeconds + f / FPS;
    if (shot) {
      targets.push(shot.cx);
      continue;
    }
    const face = faceAt(clip, t);
    if (f === 0) held = face;
    else if (Math.abs(face - held) > DEADBAND)
      held = face > held ? face - DEADBAND : face + DEADBAND;
    targets.push(held);
  }
  const path: number[] = [];
  let cur = targets[0] ?? 0.5;
  for (let f = 0; f < frames; f++) {
    const delta = targets[f] - cur;
    const ease = smoothstep(Math.abs(delta) / (MAX_PAN * RAMP));
    cur += Math.sign(delta) * Math.min(Math.abs(delta), step * ease);
    path.push(clampN(cur, HALF, 1 - HALF));
  }
  return path;
};

const BRIDGE = 2.5;
const FLAT = CLIPS.flatMap((clip) => clip.segments.map((segment) => ({clip, segment})));
const resolved = FLAT.map(({clip, segment}) => shotForCut(clip.src, segment));
for (let i = 1; i < resolved.length - 1; i++) {
  if (resolved[i]) continue;
  const prev = resolved[i - 1];
  const next = resolved[i + 1];
  if (!prev || !next) continue;
  const {segment, clip} = FLAT[i];
  const len = segment.endSeconds - segment.startSeconds;
  const same = FLAT[i - 1].clip.src === clip.src && FLAT[i + 1].clip.src === clip.src;
  if (len <= BRIDGE && same && Math.abs(prev.cx - next.cx) < 0.12) resolved[i] = prev;
}

type Row = {reelFrame: number; clip: string; cx: number; segIdx: number; label: string};
const rows: Row[] = [];
let body = 0;
let segIdx = 0;
for (const {clip, segment: seg} of FLAT) {
  {
    const shot = resolved[segIdx];
    const path = cutPath(clip, seg, shot);
    path.forEach((cx, f) =>
      rows.push({
        reelFrame: INTRO + body + f,
        clip: clip.src.replace("assets/", ""),
        cx,
        segIdx,
        label: shot ? shot.label : "",
      }),
    );
    body += path.length;
    segIdx++;
  }
}

console.log("=== 1. VELOCIDAD DE PANEO DENTRO DE UN CORTE ===");
let peak = 0;
let over = 0;
for (let i = 1; i < rows.length; i++) {
  if (rows[i].segIdx !== rows[i - 1].segIdx) continue;
  const v = Math.abs(rows[i].cx - rows[i - 1].cx) * FPS;
  peak = Math.max(peak, v);
  if (v > MAX_PAN + 1e-6) over++;
}
console.log(`  velocidad pico: ${peak.toFixed(3)} cx/s  (limite ${MAX_PAN})`);
console.log(`  cuadros por encima del limite: ${over}`);

console.log("");
console.log("=== 2. SALTOS DE ENCUADRE ENTRE CORTES ===");
const jumps: {t: number; d: number; from: number; to: number}[] = [];
for (let i = 1; i < rows.length; i++) {
  if (rows[i].segIdx === rows[i - 1].segIdx) continue;
  const d = Math.abs(rows[i].cx - rows[i - 1].cx);
  jumps.push({t: rows[i].reelFrame / FPS, d, from: rows[i - 1].cx, to: rows[i].cx});
}
jumps.sort((a, b) => b.d - a.d);
const big = jumps.filter((j) => j.d > 0.15);
console.log(`  saltos >0.15: ${big.length} de ${jumps.length} cortes`);
for (const j of big.slice(0, 8))
  console.log(
    `    reel ${j.t.toFixed(1)}s | cx ${j.from.toFixed(2)} -> ${j.to.toFixed(2)} (${j.d.toFixed(2)})`,
  );

console.log("");
console.log("=== 3. PARPADEO (encuadre que va y viene en cortes seguidos) ===");
const perCut: {idx: number; cx: number; label: string; t: number}[] = [];
for (const r of rows) {
  const last = perCut[perCut.length - 1];
  if (!last || last.idx !== r.segIdx)
    perCut.push({idx: r.segIdx, cx: r.cx, label: r.label, t: r.reelFrame / FPS});
}
let flips = 0;
for (let i = 2; i < perCut.length; i++) {
  const a = perCut[i - 2];
  const b = perCut[i - 1];
  const c = perCut[i];
  // vuelve al punto de partida despues de irse lejos
  if (Math.abs(a.cx - b.cx) > 0.2 && Math.abs(b.cx - c.cx) > 0.2 && Math.abs(a.cx - c.cx) < 0.12) {
    flips++;
    console.log(
      `    reel ${a.t.toFixed(1)}-${c.t.toFixed(1)}s | ${a.cx.toFixed(2)} -> ${b.cx.toFixed(2)} -> ${c.cx.toFixed(2)}`,
    );
  }
}
if (flips === 0) console.log("  ninguno");

console.log("");
console.log("=== 4. CORTES CORTOS (<0.6 s) ===");
let short = 0;
for (const clip of CLIPS)
  for (const seg of clip.segments)
    if (seg.endSeconds - seg.startSeconds < 0.6) {
      short++;
      console.log(`    ${clip.src} ${seg.startSeconds}-${seg.endSeconds}`);
    }
if (short === 0) console.log("  ninguno");
console.log("");
console.log(`total cortes: ${segIdx}`);
