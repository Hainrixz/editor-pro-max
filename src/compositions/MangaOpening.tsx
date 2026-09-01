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
import {GRADIENTS} from "../presets/colors";

const MANGA_FONT = "'Bangers', cursive";

const SpeedLines: React.FC<{color?: string; count?: number}> = ({
  color = "rgba(255,255,255,0.35)",
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

const ImpactBurst: React.FC<{color?: string; size?: number; spikes?: number}> = ({
  color = "#ffe400",
  size = 900,
  spikes = 16,
}) => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.15;
  const outerR = size / 2;
  const innerR = outerR * 0.7;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const x = outerR + Math.cos(angle) * r;
    const y = outerR + Math.sin(angle) * r;
    points.push(`${x},${y}`);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      <polygon points={points.join(" ")} fill={color} />
    </svg>
  );
};

const ComicPanelBorder: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 24,
      border: "10px solid #000000",
      pointerEvents: "none",
    }}
  />
);

const ImpactIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Bangers", "400");

  const shake = frame < 15 ? Math.sin(frame * 3) * (15 - frame) * 0.5 : 0;
  const scaleProgress = spring({fps, frame, config: {damping: 10, stiffness: 140}});
  const scale = interpolate(scaleProgress, [0, 1], [0.4, 1]);
  const subOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{backgroundColor: "#0a0a0a", overflow: "hidden"}}>
      <SpeedLines />
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <ImpactBurst color="#ffe400" size={1000} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{justifyContent: "center", alignItems: "center", flexDirection: "column"}}
      >
        <div
          style={{
            transform: `translateX(${shake}px) scale(${scale})`,
            fontFamily: MANGA_FONT,
            fontSize: 150,
            color: "#ff003c",
            WebkitTextStroke: "8px #000000",
            textAlign: "center",
            letterSpacing: 4,
          }}
        >
          MODE ANIME
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: MANGA_FONT,
            fontSize: 46,
            color: "#ffffff",
            WebkitTextStroke: "3px #000000",
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
  loadGoogleFont("Bangers", "400");

  return (
    <AbsoluteFill style={{backgroundColor: "#f5f2e8"}}>
      <GridPattern type="dots" spacing={26} size={2.5} color="rgba(0,0,0,0.35)" />
      <ComicPanelBorder />
      <AbsoluteFill
        style={{justifyContent: "center", alignItems: "center", padding: 100}}
      >
        <TypewriterText
          text={"CHAQUE HÉROS\nA UN COMMENCEMENT"}
          fontSize={72}
          fontFamily={MANGA_FONT}
          color="#0a0a0a"
          cursorColor="#ff003c"
          typingSpeed={2}
          startDelay={10}
          style={{textAlign: "center"}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  loadGoogleFont("Bangers", "400");

  return (
    <AbsoluteFill style={{backgroundColor: "#0a0a0a"}}>
      <GradientBackground
        colors={GRADIENTS.fire}
        angle={135}
        animateAngle
        animateSpeed={0.3}
      />
      <ParticleField count={60} color="rgba(255,255,255,0.6)" speed={1.2} direction="up" />
      <SpeedLines color="rgba(0,0,0,0.2)" count={30} />
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <AnimatedTitle
          text="À SUIVRE..."
          fontSize={110}
          fontFamily={MANGA_FONT}
          fontWeight={400}
          color="#ffffff"
          enterAnimation="scale"
          exitAnimation="fade"
          enterDuration={20}
          holdDuration={90}
          exitDuration={20}
          textShadow="6px 6px 0 #000000"
        />
      </AbsoluteFill>
      <CallToAction
        text="Abonne-toi"
        subtext="pour la suite de l'histoire"
        enterDelay={50}
        backgroundColor="rgba(0,0,0,0.85)"
        accentColor="#ffe400"
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
