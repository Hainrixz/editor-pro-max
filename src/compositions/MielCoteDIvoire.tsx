import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import {TransitionSeries} from "@remotion/transitions";
import {TRANSITION_PRESETS} from "../components/transitions/TransitionPresets";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {ParticleField} from "../components/backgrounds/ParticleField";
import {AnimatedTitle} from "../components/text/AnimatedTitle";
import {VideoClip} from "../components/media/VideoClip";
import {AudioTrack} from "../components/media/AudioTrack";
import {FONT_FAMILIES, loadDefaultFonts} from "../presets/fonts";

// « L'or de nos forêts » — Miel de Côte d'Ivoire
// 6 plans x 5s (150f @ 30fps) + end card 2s (60f), illustrated entirely in
// Remotion (SVG/CSS motion graphics — no external footage). Pass a
// `clips.planN` staticFile() path to swap any scene for real footage later;
// the illustration drops out automatically once a videoSrc is supplied.

const AMBER = "#C77B1E";
const GOLD = "#E8A317";
const CREAM = "#F5E6C8";
const FOREST = "#1F3D2B";

const SCENE_FRAMES = 150; // 5s @ 30fps
const END_CARD_FRAMES = 60; // 2s @ 30fps

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export interface MielCoteDIvoireClips {
  plan1?: string;
  plan2?: string;
  plan3?: string;
  plan4?: string;
  plan5?: string;
  plan6?: string;
}

export interface MielCoteDIvoireProps {
  clips?: MielCoteDIvoireClips;
  musicSrc?: string;
  voiceOverSrc?: string;
  showCaptions?: boolean;
}

const VoiceOverLine: React.FC<{
  text: string;
  startFrame: number;
  holdFrames?: number;
}> = ({text, startFrame, holdFrames = 90}) => {
  const exitDuration = 20;

  return (
    <Sequence from={startFrame} durationInFrames={holdFrames + exitDuration} layout="none">
      <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 90}}>
        <AnimatedTitle
          text={text}
          fontSize={40}
          fontFamily={FONT_FAMILIES.elegant}
          fontWeight={600}
          color={CREAM}
          enterAnimation="fade"
          exitAnimation="fade"
          enterDuration={15}
          holdDuration={holdFrames - 15}
          exitDuration={exitDuration}
          textShadow="0 2px 24px rgba(0,0,0,0.65)"
          maxWidth="70%"
          style={{position: "absolute", bottom: 0}}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

// ---------------------------------------------------------------------------
// PLAN 1 — L'Éveil : forêt à l'aube, rayons volumétriques
// ---------------------------------------------------------------------------

const SunRays: React.FC<{cx: number; cy: number}> = ({cx, cy}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const rotation = frame * 0.15;
  const rayCount = 10;
  const maxR = Math.hypot(width, height);

  return (
    <svg width={width} height={height} style={{position: "absolute", inset: 0, mixBlendMode: "screen"}}>
      <g transform={`rotate(${rotation} ${cx} ${cy})`}>
        {Array.from({length: rayCount}).map((_, i) => {
          const angle = (i / rayCount) * 360;
          const spread = 7;
          const rad1 = ((angle - spread) * Math.PI) / 180;
          const rad2 = ((angle + spread) * Math.PI) / 180;
          const x1 = cx + Math.cos(rad1) * maxR;
          const y1 = cy + Math.sin(rad1) * maxR;
          const x2 = cx + Math.cos(rad2) * maxR;
          const y2 = cy + Math.sin(rad2) * maxR;
          return (
            <polygon key={i} points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`} fill={GOLD} opacity={0.14} />
          );
        })}
      </g>
    </svg>
  );
};

const TreeLayer: React.FC<{color: string; baseY: number; amplitude: number; seedOffset: number; driftSpeed: number}> = ({
  color,
  baseY,
  amplitude,
  seedOffset,
  driftSpeed,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const drift = frame * driftSpeed;

  const path = React.useMemo(() => {
    const points = 14;
    let d = `M -60 ${height}`;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * (width + 120) - 60;
      const n = seededRandom(i + seedOffset);
      const y = height * baseY - n * amplitude;
      d += ` L ${x} ${y}`;
    }
    d += ` L ${width + 60} ${height} Z`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, baseY, amplitude, seedOffset]);

  return (
    <svg
      width={width}
      height={height}
      style={{position: "absolute", inset: 0, transform: `translateX(${-drift}px)`}}
    >
      <path d={path} fill={color} />
    </svg>
  );
};

const Mist: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{filter: "blur(30px)"}}>
      {[0, 1, 2].map((i) => {
        const y = height * (0.6 + i * 0.08);
        const x = Math.sin((frame + i * 40) * 0.01) * 50 + i * 30 - 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: width * 0.8,
              height: 60,
              background: "rgba(245,230,200,0.16)",
              borderRadius: "50%",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ForestDawnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const zoom = interpolate(frame, [0, SCENE_FRAMES], [1, 1.07], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: FOREST}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: "50% 60%"}}>
        <GradientBackground colors={[FOREST, "#2d5741", AMBER]} angle={100} />
        <AbsoluteFill
          style={{background: `radial-gradient(circle at 50% 38%, ${GOLD}bb 0%, ${GOLD}44 14%, transparent 42%)`}}
        />
        <SunRays cx={width / 2} cy={height * 0.38} />
        <TreeLayer color="#0f2015" baseY={0.98} amplitude={height * 0.22} seedOffset={0} driftSpeed={0.05} />
        <TreeLayer color="#183a26" baseY={0.85} amplitude={height * 0.18} seedOffset={7} driftSpeed={0.09} />
        <Mist />
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// PLAN 2 — La Fleur : macro fleurs, pollen, abeille
// ---------------------------------------------------------------------------

const Flower: React.FC<{x: number; y: number; scale: number; sway: number}> = ({x, y, scale, sway}) => {
  const frame = useCurrentFrame();
  const swayAngle = Math.sin(frame * 0.05 + sway) * 4;
  const petals = 6;

  return (
    <g transform={`translate(${x},${y}) rotate(${swayAngle}) scale(${scale})`}>
      {Array.from({length: petals}).map((_, i) => {
        const angle = (i / petals) * 360;
        const rad = (angle * Math.PI) / 180;
        const px = Math.cos(rad) * 16;
        const py = Math.sin(rad) * 16;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={13}
            ry={9}
            fill={CREAM}
            opacity={0.95}
            transform={`rotate(${angle} ${px} ${py})`}
          />
        );
      })}
      <circle cx={0} cy={0} r={9} fill={GOLD} />
    </g>
  );
};

const Bee: React.FC = () => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame * 1.6) * 0.5 + 0.5;

  return (
    <g>
      <ellipse cx={0} cy={-10} rx={10} ry={5} fill="rgba(255,255,255,0.6)" transform={`scale(1,${0.4 + flap * 0.6})`} />
      <ellipse cx={0} cy={-10} rx={10} ry={5} fill="rgba(255,255,255,0.6)" transform={`translate(10,0) scale(1,${0.4 + flap * 0.6})`} />
      <ellipse cx={0} cy={0} rx={14} ry={9} fill="#1a1a1a" />
      <rect x={-14} y={-4} width={28} height={2.6} fill="#F5C518" />
      <rect x={-14} y={2} width={28} height={2.6} fill="#F5C518" />
    </g>
  );
};

const FlowerFieldScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const flowerPositions = React.useMemo(
    () =>
      Array.from({length: 9}).map((_, i) => ({
        x: seededRandom(i * 2 + 1) * width,
        y: height * 0.45 + seededRandom(i * 2 + 2) * height * 0.4,
        scale: 1.4 + seededRandom(i * 2 + 3) * 1.6,
        sway: seededRandom(i * 2 + 4) * 10,
      })),
    [width, height],
  );

  const target = flowerPositions[2] ?? {x: width / 2, y: height / 2};
  const beeProgress = interpolate(frame, [20, 70], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const beeX = interpolate(beeProgress, [0, 1], [width * 1.1, target.x + 20]);
  const beeY = interpolate(beeProgress, [0, 1], [height * 0.1, target.y - 14]);

  return (
    <AbsoluteFill style={{backgroundColor: CREAM, overflow: "hidden"}}>
      <GradientBackground colors={[CREAM, "#f2d9a0", GOLD]} type="radial" />
      <ParticleField color={`${GOLD}90`} count={35} direction="up" speed={0.25} />
      <svg width={width} height={height} style={{position: "absolute", inset: 0}}>
        {flowerPositions.map((f, i) => (
          <Flower key={i} x={f.x} y={f.y} scale={f.scale} sway={f.sway} />
        ))}
        <g transform={`translate(${beeX},${beeY})`}>
          <Bee />
        </g>
      </svg>
      <Vignette strength={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// PLAN 3 — Le Rayon : rayon de cire, miel qui perle
// ---------------------------------------------------------------------------

const hexPoints = (cx: number, cy: number, r: number) =>
  Array.from({length: 6})
    .map((_, i) => {
      const angle = (Math.PI / 180) * (60 * i - 30);
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");

const HexGrid: React.FC = () => {
  const {width, height} = useVideoConfig();

  const hexes = React.useMemo(() => {
    const size = 46;
    const hexW = Math.sqrt(3) * size;
    const hexH = size * 2;
    const rows = Math.ceil(height / (hexH * 0.75)) + 2;
    const cols = Math.ceil(width / hexW) + 2;
    const list: {x: number; y: number}[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({x: c * hexW + (r % 2 ? hexW / 2 : 0), y: r * hexH * 0.75});
      }
    }
    return list;
  }, [width, height]);

  return (
    <svg width={width} height={height} style={{position: "absolute", inset: 0}}>
      <defs>
        <radialGradient id="hexFill" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={GOLD} stopOpacity={0.9} />
          <stop offset="100%" stopColor={AMBER} stopOpacity={0.55} />
        </radialGradient>
      </defs>
      {hexes.map((h, i) => (
        <polygon key={i} points={hexPoints(h.x, h.y, 43)} fill="url(#hexFill)" stroke={`${FOREST}33`} strokeWidth={2} />
      ))}
    </svg>
  );
};

const SeepingHoney: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cx = width * 0.52;
  const top = height * 0.42;
  const cycle = (frame % 75) / 75;
  const stretch = interpolate(cycle, [0, 0.7, 1], [0, 1, 0]);
  const dripLen = 110 * stretch;

  return (
    <svg width={width} height={height} style={{position: "absolute", inset: 0}}>
      <defs>
        <linearGradient id="seep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} />
          <stop offset="100%" stopColor={AMBER} />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - 6} ${top} Q ${cx} ${top + dripLen * 0.6} ${cx} ${top + dripLen}`}
        stroke="url(#seep)"
        strokeWidth={11}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={top + dripLen} r={9 + stretch * 5} fill={GOLD} />
    </svg>
  );
};

const HoneycombScene: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SCENE_FRAMES], [1, 1.14], {extrapolateRight: "clamp"});
  const roll = frame * 0.03;

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: AMBER}}>
      <AbsoluteFill style={{transform: `scale(${zoom}) rotate(${roll}deg)`}}>
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${GOLD} 0%, ${AMBER} 70%)`}} />
        <HexGrid />
      </AbsoluteFill>
      <SeepingHoney />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// PLAN 4 — La Main : apiculteur en contre-jour, cadre de ruche
// ---------------------------------------------------------------------------

const HiveFrame: React.FC = () => (
  <g>
    <rect x={-90} y={-60} width={180} height={120} rx={6} fill="#3a2415" />
    <rect x={-78} y={-48} width={156} height={96} fill={AMBER} opacity={0.85} />
    {Array.from({length: 4}).map((_, r) =>
      Array.from({length: 6}).map((_, c) => (
        <polygon
          key={`${r}-${c}`}
          points={hexPoints(-70 + c * 26 + (r % 2 ? 13 : 0), -35 + r * 22, 13)}
          fill={GOLD}
          opacity={0.6}
          stroke="#3a2415"
          strokeWidth={1}
        />
      )),
    )}
  </g>
);

const HandSilhouette: React.FC<{side: "left" | "right"}> = ({side}) => {
  const flip = side === "left" ? 1 : -1;
  return (
    <path
      d={`M ${flip * 10} 40 C ${flip * 45} 20, ${flip * 55} -10, ${flip * 35} -45 C ${flip * 28} -58 ${flip * 8} -60 ${flip * 0} -52 L ${flip * 0} 60 Z`}
      fill="#0c0a08"
    />
  );
};

const BeekeeperScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const riseY = interpolate(frame, [0, SCENE_FRAMES], [40, -15]);

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: FOREST}}>
      <GradientBackground colors={[FOREST, "#3a2a12", AMBER]} angle={200} animateAngle animateSpeed={0.04} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 72%, ${GOLD}99 0%, transparent 55%)`}} />
      <ParticleField color={`${GOLD}70`} count={30} direction="up" speed={0.35} />
      <svg width={width} height={height} style={{position: "absolute", inset: 0}}>
        <g transform={`translate(${width / 2},${height * 0.62 + riseY})`}>
          <HiveFrame />
          <g transform="translate(-95,30)">
            <HandSilhouette side="left" />
          </g>
          <g transform="translate(95,30)">
            <HandSilhouette side="right" />
          </g>
        </g>
      </svg>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// PLAN 5 — Le Héros : pot sur planche, orbite lente, reflet
// ---------------------------------------------------------------------------

const HeroJarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const sway = Math.sin(frame * 0.04) * 9;
  const dolly = interpolate(frame, [0, SCENE_FRAMES], [1, 1.05]);
  const sweepX = interpolate(frame, [0, SCENE_FRAMES], [-140, 300]);

  return (
    <AbsoluteFill style={{backgroundColor: CREAM, overflow: "hidden"}}>
      <AbsoluteFill style={{filter: "blur(40px)"}}>
        <GradientBackground colors={[CREAM, "#e9d3a0"]} angle={90} />
        <div style={{position: "absolute", left: "8%", top: "8%", width: 280, height: 280, borderRadius: "50%", background: "#3a6b45"}} />
        <div style={{position: "absolute", right: "6%", top: "18%", width: 240, height: 240, borderRadius: "50%", background: "#2d5233"}} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          perspective: 1200,
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${dolly}) rotateY(${sway}deg)`,
            marginBottom: height * 0.15,
          }}
        >
          <svg width={520} height={640} viewBox="0 0 340 420">
            <defs>
              <linearGradient id="jarShade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00000022" />
                <stop offset="45%" stopColor="#ffffff11" />
                <stop offset="100%" stopColor="#00000033" />
              </linearGradient>
            </defs>
            <ellipse cx={170} cy={400} rx={160} ry={18} fill="rgba(0,0,0,0.25)" />
            <g transform="translate(20,300)">
              <polygon points={hexPoints(0, 0, 30)} fill={GOLD} opacity={0.9} stroke={AMBER} strokeWidth={2} />
            </g>
            <g transform="translate(300,260) rotate(20)">
              <rect x={-4} y={-70} width={8} height={90} rx={4} fill="#8a5a2b" />
              <circle cx={0} cy={20} r={22} fill="#8a5a2b" />
              <circle cx={0} cy={20} r={16} fill={GOLD} />
            </g>
            <rect x={95} y={130} width={150} height={190} rx={22} fill={AMBER} />
            <rect x={95} y={130} width={150} height={190} rx={22} fill="url(#jarShade)" />
            <rect x={112} y={145} width={22} height={160} rx={11} fill="rgba(255,255,255,0.35)" />
            <rect x={110} y={95} width={120} height={40} rx={8} fill="#B8860B" />
            <rect x={104} y={112} width={132} height={16} rx={6} fill="#8c6508" />
            <rect x={108} y={200} width={124} height={90} rx={6} fill={CREAM} stroke="#8a5a2b" strokeWidth={2} />
            <text x={170} y={235} textAnchor="middle" fontFamily={FONT_FAMILIES.elegant} fontStyle="italic" fontSize={20} fill={FOREST}>
              Miel
            </text>
            <text x={170} y={255} textAnchor="middle" fontFamily={FONT_FAMILIES.mono} fontSize={9} letterSpacing={1} fill={AMBER}>
              CÔTE D&apos;IVOIRE
            </text>
            <rect x={118} y={268} width={35} height={8} fill="#FF8200" />
            <rect x={153} y={268} width={35} height={8} fill="#ffffff" />
            <rect x={188} y={268} width={35} height={8} fill="#009E60" />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 60,
              left: sweepX,
              width: 70,
              background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)",
              transform: "skewX(-18deg)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.16,
          background: "linear-gradient(180deg, #7a4e26, #4d2f16)",
        }}
      >
        {Array.from({length: 6}).map((_, i) => (
          <div
            key={i}
            style={{position: "absolute", left: 0, right: 0, top: 8 + i * 10, height: 1, background: "rgba(0,0,0,0.2)"}}
          />
        ))}
      </div>
      <Vignette strength={0.35} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// PLAN 6 — La Chute : fil de miel qui tombe et s'enroule, rack focus
// ---------------------------------------------------------------------------

const CoilingHoneyPourScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const dripperY = height * 0.18;
  const fallProgress = interpolate(frame, [0, 90], [0, 1], {extrapolateRight: "clamp"});
  const coilY = interpolate(fallProgress, [0, 1], [dripperY, height * 0.68]);

  const spiralPoints = React.useMemo(() => {
    const pts: string[] = [];
    const turns = 3;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = 30 * (1 - t * 0.4);
      const angle = t * turns * Math.PI * 2;
      pts.push(`${cx + Math.sin(angle) * r},${coilY + t * 34}`);
    }
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cx, coilY]);

  const rackFocus = interpolate(frame, [100, 140], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const bgBlur = rackFocus * 8;

  return (
    <AbsoluteFill style={{backgroundColor: AMBER, overflow: "hidden"}}>
      <AbsoluteFill style={{filter: `blur(${bgBlur}px)`}}>
        <GradientBackground colors={[AMBER, GOLD]} angle={135} />
        <svg width={width} height={height} style={{position: "absolute", inset: 0}}>
          <defs>
            <linearGradient id="pourThread" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} />
              <stop offset="100%" stopColor={AMBER} />
            </linearGradient>
          </defs>
          <g transform={`translate(${cx - 60},${dripperY - 60}) rotate(25)`}>
            <rect x={-4} y={-40} width={8} height={70} rx={4} fill="#8a5a2b" />
            <circle cx={0} cy={35} r={20} fill="#8a5a2b" />
            <circle cx={0} cy={35} r={14} fill={GOLD} />
          </g>
          <line x1={cx} y1={dripperY} x2={cx} y2={coilY} stroke="url(#pourThread)" strokeWidth={7} strokeLinecap="round" />
          <polyline points={spiralPoints} fill="none" stroke="url(#pourThread)" strokeWidth={7} strokeLinecap="round" />
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{opacity: rackFocus, alignItems: "center", justifyContent: "center"}}>
        <div
          style={{
            background: CREAM,
            border: "2px solid #8a5a2b",
            borderRadius: 8,
            padding: "18px 34px",
            fontFamily: FONT_FAMILIES.elegant,
            fontStyle: "italic",
            fontSize: 28,
            color: FOREST,
            boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          Miel · Côte d&apos;Ivoire
        </div>
      </AbsoluteFill>
      <Vignette strength={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// END CARD
// ---------------------------------------------------------------------------

const EndCard: React.FC<{voiceOverStartFrame: number}> = ({voiceOverStartFrame}) => {
  const frame = useCurrentFrame();
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{backgroundColor: CREAM, justifyContent: "center", alignItems: "center"}}>
      <div style={{opacity: logoOpacity, textAlign: "center"}}>
        <div style={{fontFamily: FONT_FAMILIES.display, fontWeight: 800, fontSize: 56, letterSpacing: 2, color: FOREST}}>
          MIEL DE CÔTE D&apos;IVOIRE
        </div>
        <div style={{fontFamily: FONT_FAMILIES.elegant, fontStyle: "italic", fontWeight: 600, fontSize: 32, color: AMBER, marginTop: 18}}>
          L&apos;or de nos forêts.
        </div>
      </div>
      <VoiceOverLine text="L'or de nos forêts." startFrame={voiceOverStartFrame} holdFrames={45} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// SCENE WRAPPER — swaps in real footage the moment a videoSrc is provided
// ---------------------------------------------------------------------------

const Scene: React.FC<{videoSrc?: string; illustration: React.ReactNode; children?: React.ReactNode}> = ({
  videoSrc,
  illustration,
  children,
}) => (
  <AbsoluteFill style={{backgroundColor: FOREST}}>
    {videoSrc ? <VideoClip src={videoSrc} fit="cover" /> : illustration}
    {children}
  </AbsoluteFill>
);

export const MielCoteDIvoire: React.FC<MielCoteDIvoireProps> = ({clips = {}, musicSrc, voiceOverSrc, showCaptions = true}) => {
  loadDefaultFonts();

  return (
    <AbsoluteFill style={{backgroundColor: FOREST}}>
      <TransitionSeries>
        {/* PLAN 1 — L'Éveil (0:00–0:05) */}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <Scene videoSrc={clips.plan1} illustration={<ForestDawnScene />}>
            {showCaptions && (
              <VoiceOverLine text="Il y a des matins où la forêt se réveille en or." startFrame={60} holdFrames={75} />
            )}
          </Scene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />

        {/* PLAN 2 — La Fleur (0:05–0:10) */}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <Scene videoSrc={clips.plan2} illustration={<FlowerFieldScene />} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition {...TRANSITION_PRESETS.fadeQuick} />

        {/* PLAN 3 — Le Rayon (0:10–0:15) */}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <Scene videoSrc={clips.plan3} illustration={<HoneycombScene />}>
            {showCaptions && (
              <VoiceOverLine text="Chaque goutte porte le soleil de la Côte d'Ivoire." startFrame={30} holdFrames={90} />
            )}
          </Scene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition {...TRANSITION_PRESETS.wipeLeft} />

        {/* PLAN 4 — La Main (0:15–0:20) */}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <Scene videoSrc={clips.plan4} illustration={<BeekeeperScene />} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />

        {/* PLAN 5 — Le Héros (0:20–0:25) */}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <Scene videoSrc={clips.plan5} illustration={<HeroJarScene />}>
            {showCaptions && (
              <VoiceOverLine text="Miel de Côte d'Ivoire. Cent pour cent naturel." startFrame={60} holdFrames={75} />
            )}
          </Scene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition {...TRANSITION_PRESETS.fadeQuick} />

        {/* PLAN 6 — La Chute (0:25–0:30) */}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <Scene videoSrc={clips.plan6} illustration={<CoilingHoneyPourScene />} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />

        {/* END CARD (0:30–0:32) */}
        <TransitionSeries.Sequence durationInFrames={END_CARD_FRAMES}>
          <EndCard voiceOverStartFrame={4} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {musicSrc && <AudioTrack src={musicSrc} volume={0.18} fadeInDurationSeconds={1.5} fadeOutDurationSeconds={2} />}
      {voiceOverSrc && (
        <AudioTrack src={voiceOverSrc} volume={1} loop={false} fadeInDurationSeconds={0} fadeOutDurationSeconds={0.5} />
      )}
    </AbsoluteFill>
  );
};

export const mielCoteDIvoireDefaultProps: MielCoteDIvoireProps = {
  clips: {},
  showCaptions: true,
};
