import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {TransitionSeries} from "@remotion/transitions";
import {TRANSITION_PRESETS} from "../components/transitions/TransitionPresets";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {GridPattern} from "../components/backgrounds/GridPattern";
import {ParticleField} from "../components/backgrounds/ParticleField";
import {AnimatedTitle} from "../components/text/AnimatedTitle";
import {TypewriterText} from "../components/text/TypewriterText";
import {CallToAction} from "../components/overlays/CallToAction";
import {Watermark} from "../components/overlays/Watermark";
import {loadGoogleFont} from "../presets/fonts";

// "Ink & seal" palette — a hanko (personal ink stamp) pressed into aged
// paper under a dusk sky, instead of the primary red/yellow/black and
// starburst that every AI take on "shonen manga" defaults to.
const INK = "#0b0b0c";
const PAPER = "#f2e9da";
const SEAL = "#b3122e";
const BRASS = "#c9a24b";
const DUSK_GRADIENT: [string, string] = ["#12162b", "#3b2a54"];

// Dela Gothic One is an actual Japanese poster/display gothic (the family
// of face used on real anime key-art and manga logos), used only for the
// two title cards. Zen Kaku Gothic New is its natural Japanese-gothic body
// partner, carrying narration/caption text — together they read as
// specifically "Japanese poster type," not the generic western comic-book
// look Bangers gives everything comic-adjacent.
const DISPLAY_FONT = "'Dela Gothic One', cursive";
const BODY_FONT = "'Zen Kaku Gothic New', sans-serif";

const SpeedLines: React.FC<{color?: string; count?: number}> = ({
  color = "rgba(242,233,218,0.32)",
  count = 40,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.hypot(width, height);
  const rotation = frame * 0.3;

  return (
    <svg
      width={width}
      height={height}
      style={{position: "absolute", inset: 0}}
    >
      <g transform={`rotate(${rotation} ${cx} ${cy})`}>
        {Array.from({length: count}).map((_, i) => {
          const angle = (i / count) * 360;
          const rad = (angle * Math.PI) / 180;
          const innerR = maxR * 0.18;
          const x1 = cx + Math.cos(rad) * innerR;
          const y1 = cy + Math.sin(rad) * innerR;
          const x2 = cx + Math.cos(rad) * maxR;
          const y2 = cy + Math.sin(rad) * maxR;
          const strokeWidth = i % 2 === 0 ? 6 : 2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={strokeWidth}
            />
          );
        })}
      </g>
    </svg>
  );
};

// The signature element: a hanko slamming down instead of a yellow
// starburst. A jittered (not perfectly circular) outline reads as
// hand-carved ink rather than a vector shape, and it punches in with an
// overshoot-then-settle spring — the thud of a seal hitting paper — rather
// than spinning in like a cartoon impact icon.
const HankoStamp: React.FC<{size?: number}> = ({size = 560}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const stampProgress = spring({fps, frame, config: {damping: 9, stiffness: 200}});
  const scale = interpolate(stampProgress, [0, 1], [2.6, 1]);
  const wobble = interpolate(stampProgress, [0, 1], [-6, 0]);

  const points = 28;
  const r = size / 2;
  const path =
    Array.from({length: points})
      .map((_, i) => {
        const angle = (i / points) * Math.PI * 2;
        const jitter = 1 + 0.035 * Math.sin(i * 2.6 + 1.3) + 0.02 * Math.cos(i * 5.1);
        const rr = r * jitter;
        const x = r + Math.cos(angle) * rr;
        const y = r + Math.sin(angle) * rr;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + "Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${wobble}deg)`,
      }}
    >
      <path d={path} fill={SEAL} />
      <circle
        cx={r}
        cy={r}
        r={r * 0.78}
        fill="none"
        stroke={PAPER}
        strokeWidth={size * 0.018}
        opacity={0.85}
      />
    </svg>
  );
};

// Two slightly offset, slightly rotated rectangles instead of one clean
// border — reads as an inked panel gutter redrawn by hand rather than a
// perfect CSS box.
const ComicPanelBorder: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 24,
        border: `9px solid ${INK}`,
        transform: "rotate(-0.35deg)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 27,
        border: `3px solid ${INK}`,
        opacity: 0.4,
        transform: "rotate(0.3deg)",
        pointerEvents: "none",
      }}
    />
  </>
);

const ImpactIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Dela Gothic One", "400");
  loadGoogleFont("Zen Kaku Gothic New", "500;700;900");

  const shake = frame < 15 ? Math.sin(frame * 3) * (15 - frame) * 0.5 : 0;
  const scaleProgress = spring({fps, frame, config: {damping: 10, stiffness: 140}});
  const scale = interpolate(scaleProgress, [0, 1], [0.4, 1]);
  const subOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{backgroundColor: INK, overflow: "hidden"}}>
      <SpeedLines />
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <HankoStamp size={560} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{justifyContent: "center", alignItems: "center", flexDirection: "column"}}
      >
        <div
          style={{
            transform: `translateX(${shake}px) scale(${scale})`,
            fontFamily: DISPLAY_FONT,
            fontSize: 118,
            lineHeight: 1,
            color: PAPER,
            textShadow: `5px 5px 0 ${INK}, 0 0 42px rgba(201,162,75,0.5)`,
            textAlign: "center",
          }}
        >
          MODE ANIME
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: BODY_FONT,
            fontWeight: 900,
            fontSize: 42,
            letterSpacing: 2,
            color: BRASS,
            textShadow: `2px 2px 0 ${INK}`,
            opacity: subOpacity,
          }}
        >
          ACTIVÉ !!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ComicPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Zen Kaku Gothic New", "500;700;900");

  // The panel slams into frame like a page turn (overshoot scale + slight
  // rotation settling to 0) instead of hard-cutting to a static panel, so
  // this scene carries the same impact energy as ImpactIntro/Outro rather
  // than going dead in the middle of the sequence.
  const entrance = spring({fps, frame, config: {damping: 14, stiffness: 160}});
  const scale = interpolate(entrance, [0, 1], [1.2, 1]);
  const rotate = interpolate(entrance, [0, 1], [-3, 0]);
  const flash = interpolate(frame, [0, 10], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <div style={{position: "absolute", inset: 0, transform: `scale(${scale}) rotate(${rotate}deg)`}}>
        <GridPattern
          type="dots"
          spacing={26}
          size={2.5}
          color="rgba(11,11,12,0.28)"
          animate
          animateSpeed={0.4}
        />
        <ComicPanelBorder />
      </div>
      <AbsoluteFill
        style={{justifyContent: "center", alignItems: "center", padding: 100}}
      >
        <TypewriterText
          text={"CHAQUE HÉROS\nA UN COMMENCEMENT"}
          fontSize={68}
          fontFamily={BODY_FONT}
          fontWeight={700}
          color={INK}
          cursorColor={SEAL}
          typingSpeed={2}
          startDelay={10}
          style={{textAlign: "center"}}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: PAPER, opacity: flash, pointerEvents: "none"}} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  loadGoogleFont("Dela Gothic One", "400");

  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <GradientBackground
        colors={DUSK_GRADIENT}
        angle={135}
        animateAngle
        animateSpeed={0.3}
      />
      <ParticleField count={60} color="rgba(201,162,75,0.6)" speed={1.2} direction="up" />
      <SpeedLines color="rgba(10,8,20,0.18)" count={30} />
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <AnimatedTitle
          text="À SUIVRE..."
          fontSize={110}
          fontFamily={DISPLAY_FONT}
          fontWeight={400}
          color={PAPER}
          enterAnimation="scale"
          exitAnimation="fade"
          enterDuration={20}
          holdDuration={90}
          exitDuration={20}
          textShadow={`4px 4px 0 ${INK}, 0 0 46px rgba(201,162,75,0.55)`}
        />
      </AbsoluteFill>
      <CallToAction
        text="Abonne-toi"
        subtext="pour la suite de l'histoire"
        enterDelay={50}
        backgroundColor="rgba(11,11,12,0.85)"
        accentColor={BRASS}
      />
      <Watermark text="@soyenriquerocha" corner="bottomRight" opacity={0.6} />
    </AbsoluteFill>
  );
};

export const MangaOpening: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={160}>
        <ImpactIntro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...TRANSITION_PRESETS.wipeRight} />
      <TransitionSeries.Sequence durationInFrames={160}>
        <ComicPanel />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...TRANSITION_PRESETS.crossfade} />
      <TransitionSeries.Sequence durationInFrames={170}>
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
