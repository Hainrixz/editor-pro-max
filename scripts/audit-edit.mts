/**
 * Auditoría del montaje de RifaNebraskaReel: reproduce el motor de reencuadre
 * (faceAt / shotForCut / cutPath) con los datos reales y reporta, por corte y
 * por unión, saltos de encuadre, riesgo de jump cut, riesgo de cuadro negro
 * por redondeo y prizeShots muertos.
 *
 * Uso:
 *   npx tsx scripts/audit-edit.mts               # audita el defaultProps de Root.tsx
 *   npx tsx scripts/audit-edit.mts props.json    # audita un JSON de props propuesto
 */
import {readFileSync} from "fs";
import {dirname, resolve} from "path";
import {CLIPS} from "../src/data/nebraska";

const FPS = 24;
const INTRO_FRAMES = Math.round(3 * FPS);
const OUTRO_FRAMES = Math.round(5.5 * FPS);
const HALF = (576 * (9 / 16)) / 1024 / 2;
const MAX_PAN = 0.11;
const DEADBAND = 0.05;
const MIN_COVERAGE = 0.45;
const BRIDGE = 2.5;

type Cut = {clip: string; startSeconds: number; endSeconds: number};
type Shot = {label: string; clip: string; cx: number; start: number; end: number};

// process.argv[1] es la ruta de este script cuando se corre con `npx tsx`.
const HERE = dirname(resolve(process.argv[1] ?? "."));
const loadProps = (): {cuts: Cut[]; prizeShots: Shot[]; rampSeconds: number} => {
  const arg = process.argv[2];
  if (arg) return JSON.parse(readFileSync(resolve(process.cwd(), arg), "utf8"));
  const root = readFileSync(resolve(HERE, "../src/Root.tsx"), "utf8");
  const m = root.match(/defaultProps=\{(\{"cuts":.*?"editor":(?:true|false)\})\}/);
  if (!m) throw new Error("No encontré el literal defaultProps de RifaNebraskaReel en Root.tsx");
  return JSON.parse(m[1].replace(/ as const/g, ""));
};

const props = loadProps();
const cuts: Cut[] = props.cuts;
const shots: Shot[] = props.prizeShots;
const RAMP: number = props.rampSeconds;

const clipOf = (c: Cut) => CLIPS.find((x) => x.src === c.clip)!;
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
      const a = pts[i - 1], b = pts[i];
      return a.cx + (b.cx - a.cx) * ((t - a.t) / (b.t - a.t || 1));
    }
  }
  return pts[pts.length - 1].cx;
};
const framesOf = (s: number) => Math.round(s * FPS);
const cutFrames = (c: Cut) => framesOf(c.endSeconds - c.startSeconds);

const shotForCut = (cut: Cut) => {
  const len = cut.endSeconds - cut.startSeconds;
  let best: Shot | null = null;
  let bestCov = MIN_COVERAGE;
  for (const s of shots) {
    if (s.clip !== cut.clip) continue;
    const overlap = Math.min(s.end, cut.endSeconds) - Math.max(s.start, cut.startSeconds);
    const cov = overlap / len;
    if (cov > bestCov) { bestCov = cov; best = s; }
  }
  return best;
};

const resolved: (Shot | null)[] = cuts.map(shotForCut);
for (let i = 1; i < resolved.length - 1; i++) {
  if (resolved[i]) continue;
  const prev = resolved[i - 1], next = resolved[i + 1];
  if (!prev || !next) continue;
  const cut = cuts[i];
  const len = cut.endSeconds - cut.startSeconds;
  const same = cuts[i - 1].clip === cut.clip && cuts[i + 1].clip === cut.clip;
  if (len <= BRIDGE && same && Math.abs(prev.cx - next.cx) < 0.12) resolved[i] = prev;
}

const cutPath = (cut: Cut, shot: Shot | null) => {
  const clip = clipOf(cut);
  const frames = cutFrames(cut);
  const step = MAX_PAN / FPS;
  const targets: number[] = [];
  let held = 0;
  for (let f = 0; f < frames; f++) {
    const t = cut.startSeconds + f / FPS;
    if (shot) { targets.push(shot.cx); continue; }
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

// ---- tabla por corte ----
console.log("== CORTES ==");
console.log("idx | clip | src range | dur s | reel frames | reel s | shot | cx path start→end | pan range | face min..max");
let acc = INTRO_FRAMES;
const joins: {i: number; frameA: number; frameB: number; endCx: number; startCx: number; sameClip: boolean; srcGap: number | null}[] = [];
let prevEnd: {cx: number; cut: Cut} | null = null;
cuts.forEach((cut, i) => {
  const shot = resolved[i];
  const path = cutPath(cut, shot);
  const f0 = acc, f1 = acc + path.length - 1;
  const clip = clipOf(cut);
  let fmin = 1, fmax = 0;
  for (let f = 0; f < path.length; f++) {
    const fc = faceAt(clip, cut.startSeconds + f / FPS);
    fmin = Math.min(fmin, fc); fmax = Math.max(fmax, fc);
  }
  const panRange = Math.max(...path) - Math.min(...path);
  console.log(
    `${String(i + 1).padStart(2)} | ${cut.clip.replace("assets/nebraska", "n").replace(".mp4", "")} | ${cut.startSeconds.toFixed(2)}–${cut.endSeconds.toFixed(2)} | ${(cut.endSeconds - cut.startSeconds).toFixed(2)} | ${f0}–${f1} | ${(f0 / FPS).toFixed(2)}–${((f1 + 1) / FPS).toFixed(2)} | ${shot ? shot.label.slice(0, 30) : "(tracking)"} | ${path[0].toFixed(3)}→${path[path.length - 1].toFixed(3)} | ${panRange.toFixed(3)} | ${fmin.toFixed(2)}..${fmax.toFixed(2)}`,
  );
  if (prevEnd) {
    const sameClip = prevEnd.cut.clip === cut.clip;
    joins.push({
      i, frameA: f0 - 1, frameB: f0,
      endCx: prevEnd.cx, startCx: path[0],
      sameClip,
      srcGap: sameClip ? cut.startSeconds - prevEnd.cut.endSeconds : null,
    });
  }
  prevEnd = {cx: path[path.length - 1], cut};
  acc += path.length;
});
const body = acc - INTRO_FRAMES;
console.log(`\nbody: ${body} frames = ${(body / FPS).toFixed(2)}s; total ${(body + INTRO_FRAMES + OUTRO_FRAMES)} frames = ${((body + INTRO_FRAMES + OUTRO_FRAMES) / FPS).toFixed(2)}s`);

console.log("\n== UNIONES (corte i → i+1) ==");
console.log("join | reel frames A/B | cx A→B | Δcx | mismo clip | hueco fuente s");
joins.forEach((j) => {
  const d = Math.abs(j.startCx - j.endCx);
  console.log(
    `${j.i}→${j.i + 1} | ${j.frameA}/${j.frameB} | ${j.endCx.toFixed(3)}→${j.startCx.toFixed(3)} | ${d.toFixed(3)}${d > 0.15 ? " <SALTO GRANDE>" : d < 0.04 && j.sameClip && j.srcGap !== null && j.srcGap < 3 ? " <JUMPCUT RIESGO>" : ""} | ${j.sameClip} | ${j.srcGap === null ? "-" : j.srcGap.toFixed(2)}`,
  );
});

// ---- black-frame rounding check ----
// Guardia histórica: con trimAfter=framesOf(endSeconds) el redondeo podía
// dejar el último cuadro sin material (negro). El motor ya usa
// trimBefore+duración, pero esta comprobación avisa si el dato vuelve a
// quedar en zona de riesgo por si alguien revierte el fix.
console.log("\n== CUADRO NEGRO AL FINAL (redondeo trimAfter) ==");
let anyOverrun = false;
cuts.forEach((c, i) => {
  const s24 = framesOf(c.startSeconds);
  const d24 = cutFrames(c);
  const e24 = framesOf(c.endSeconds);
  if (s24 + d24 > e24) {
    anyOverrun = true;
    console.log(`  corte ${i + 1} (${c.clip} ${c.startSeconds}-${c.endSeconds}): ${s24}+${d24} > ${e24} -> riesgo si el motor usara framesOf(endSeconds)`);
  }
});
if (!anyOverrun) console.log("  ninguno");

// ---- prizeShots validation ----
console.log("\n== PRIZESHOTS ==");
shots.forEach((s, k) => {
  const owners = cuts
    .map((c, i) => ({c, i}))
    .filter(({c}) => c.clip === s.clip && Math.min(s.end, c.endSeconds) - Math.max(s.start, c.startSeconds) > 0)
    .map(({c, i}) => {
      const len = c.endSeconds - c.startSeconds;
      const cov = (Math.min(s.end, c.endSeconds) - Math.max(s.start, c.startSeconds)) / len;
      const wins = resolved[i] === s;
      return `cut${i + 1}(cov ${cov.toFixed(2)}${wins ? " MANDA" : ""})`;
    });
  console.log(`[${k}] ${s.label} | ${s.clip.replace("assets/", "")} ${s.start}–${s.end} cx ${s.cx} | ${owners.length ? owners.join(", ") : "SIN INTERSECCION — MUERTO"}`);
});
