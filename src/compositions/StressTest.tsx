import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {GradientBackground} from "../components/backgrounds/GradientBackground";
import {ParticleField} from "../components/backgrounds/ParticleField";
import {GridPattern} from "../components/backgrounds/GridPattern";
import {VideoClip} from "../components/media/VideoClip";
import {CaptionOverlay} from "../components/text/CaptionOverlay";
import {AnimatedTitle} from "../components/text/AnimatedTitle";
import {LowerThird} from "../components/text/LowerThird";
import {ProgressBar} from "../components/overlays/ProgressBar";
import {Watermark} from "../components/overlays/Watermark";
import {CallToAction} from "../components/overlays/CallToAction";

/**
 * Deliberately heavy composition: every layer type stacked at once over real
 * footage, upscaled 720x1280 -> 1080x1920. Used to stress the render pipeline.
 */
export const StressTest: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBackground
        colors={["#0f0f23", "#1a1a3e"]}
        angle={135}
        animateAngle
        animateSpeed={0.5}
      />

      <VideoClip
        src={staticFile("assets/video.mp4")}
        fit="cover"
        volume={0.9}
      />

      <GridPattern
        type="dots"
        spacing={40}
        size={2}
        color="rgba(255,255,255,0.12)"
        animate
        animateSpeed={0.5}
      />
      <ParticleField
        count={200}
        color="rgba(255,255,255,0.35)"
        speed={0.6}
        direction="up"
      />

      <CaptionOverlay
        captionsSource="captions.json"
        preset="glow"
        position="bottom"
        fontSize={64}
        highlightColor="#39E508"
      />

      <Sequence from={0} durationInFrames={90}>
        <AnimatedTitle
          text="STRESS TEST"
          fontSize={96}
          fontWeight={800}
          color="#ffffff"
          enterAnimation="slideUp"
          exitAnimation="fade"
          enterDuration={20}
          holdDuration={45}
          exitDuration={15}
          textShadow="0 4px 20px rgba(0,0,0,0.6)"
        />
      </Sequence>

      <Sequence from={100} durationInFrames={150}>
        <LowerThird
          name="Phoenix_Final.mp4"
          title="720x1280 - 24fps - 19.01s"
          accentColor="#6366f1"
          position="bottomLeft"
        />
      </Sequence>

      <Sequence from={380}>
        <CallToAction text="Render complete" subtext="All layers composited" />
      </Sequence>

      <ProgressBar color="#6366f1" height={6} position="bottom" />
      <Watermark text="@editor-pro-max" corner="topRight" opacity={0.5} />
    </AbsoluteFill>
  );
};
