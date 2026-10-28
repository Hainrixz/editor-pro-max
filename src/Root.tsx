// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {Composition, Folder} from "remotion";

// Compositions
import {ShowcaseComposition} from "./compositions/Showcase";

// Social templates
import {TikTokVideo} from "./templates/social/TikTokVideo";
import {InstagramReel} from "./templates/social/InstagramReel";
import {YouTubeShort} from "./templates/social/YouTubeShort";

// Content templates
import {Presentation} from "./templates/content/Presentation";
import {Testimonial} from "./templates/content/Testimonial";

// Promo templates
import {Announcement} from "./templates/promo/Announcement";
import {BeforeAfterDemo} from "./compositions/BeforeAfterDemo";

// Editing templates
import {TalkingHeadEdit} from "./templates/editing/TalkingHeadEdit";
import {PodcastClip} from "./templates/editing/PodcastClip";

// Patitas Peludas
import {
  RifaNebraskaReel,
  REEL_FPS,
  calcReelMetadata,
  reelSchema,
} from "./compositions/RifaNebraskaReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Examples">
        <Composition
          id="Showcase"
          component={ShowcaseComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Social">
        <Composition
          id="TikTok"
          component={TikTokVideo}
          durationInFrames={270}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "Did you know this?",
            body: "AI can edit videos now using just code.",
            cta: "Follow for more",
          }}
        />
        <Composition
          id="InstagramReel"
          component={InstagramReel}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "Your headline here",
            subtext: "Supporting text goes here",
            brandName: "Brand",
          }}
        />
        <Composition
          id="YouTubeShort"
          component={YouTubeShort}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "Your Title Here",
            subtitle: "Subtitle goes here",
          }}
        />
      </Folder>

      <Folder name="Content">
        <Composition
          id="Presentation"
          component={Presentation}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            slides: [
              {title: "Welcome", body: "This is slide one"},
              {title: "The Problem", body: "Here's what we're solving"},
              {title: "The Solution", body: "Here's how we solve it"},
            ],
          }}
        />
        <Composition
          id="Testimonial"
          component={Testimonial}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            quote:
              "This product completely changed how we work. Highly recommended.",
            author: "Jane Doe",
            role: "CEO at Company",
          }}
        />
      </Folder>

      <Folder name="Promo">
        <Composition
          id="Announcement"
          component={Announcement}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            preTitle: "Introducing",
            title: "Something Amazing",
            subtitle: "The future is here",
            cta: "Learn More",
          }}
        />
        <Composition
          id="BeforeAfter"
          component={BeforeAfterDemo}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Editing">
        <Composition
          id="TalkingHeadEdit"
          component={TalkingHeadEdit}
          durationInFrames={900}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            showCaptions: true,
            captionPreset: "bold" as const,
            removeSilence: false,
          }}
        />
        <Composition
          id="PodcastClip"
          component={PodcastClip}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            clipStartSeconds: 0,
            clipEndSeconds: 30,
            showCaptions: true,
            captionPreset: "bold" as const,
          }}
        />
      </Folder>

      <Folder name="Patitas">
        <Composition
          id="RifaNebraskaReel"
          component={RifaNebraskaReel}
          schema={reelSchema}
          // Literal a proposito: el boton "Save" de Studio y el editor de
          // cortes reescriben este objeto en el archivo, y para eso necesitan
          // encontrarlo aqui.
          defaultProps={{"cuts":[{"clip":"assets/nebraska01.mp4" as const,"startSeconds":0.92,"endSeconds":9.1},{"clip":"assets/nebraska01.mp4" as const,"startSeconds":11.7,"endSeconds":14.2},{"clip":"assets/nebraska01.mp4" as const,"startSeconds":14.8,"endSeconds":23.1},{"clip":"assets/nebraska01.mp4" as const,"startSeconds":23.9,"endSeconds":25.5},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":0.4,"endSeconds":4.4},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":5.7,"endSeconds":8.4},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":14.7,"endSeconds":16.9},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":18.8,"endSeconds":23},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":24,"endSeconds":25.6},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":31.2,"endSeconds":33.8},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":36.1,"endSeconds":37.5},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":44.4,"endSeconds":47.4},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":50.8,"endSeconds":56.8},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":60.5,"endSeconds":62.9},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":63.8,"endSeconds":69.4},{"clip":"assets/nebraska02.mp4" as const,"startSeconds":76.1,"endSeconds":79.2},{"clip":"assets/nebraska03.mp4" as const,"startSeconds":0.4,"endSeconds":8}],"prizeShots":[{"clip":"assets/nebraska01.mp4" as const,"label":"01 · Camina hacia la repisa","start":11.7,"end":14.2,"cx":0.84},{"clip":"assets/nebraska01.mp4" as const,"label":"01 · Señala el balón Adidas","start":15.12,"end":20.13,"cx":0.49},{"clip":"assets/nebraska01.mp4" as const,"label":"01 · Levanta el peluche del Tri","start":22.73,"end":25.5,"cx":0.8},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Presenta el tazón","start":0.4,"end":4.4,"cx":0.68},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Va a empezar la rifa","start":5.7,"end":8.4,"cx":0.8},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Saca la papeleta de Vania","start":14.7,"end":16.9,"cx":0.75},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Anuncia más ganadores","start":18.8,"end":23,"cx":0.68},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Toma el mini balón de la repisa","start":24,"end":25.6,"cx":0.42},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Toma una pelota de la repisa","start":35.53,"end":39.33,"cx":0.36},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Anuncia a Juan Carlos","start":44.4,"end":47.4,"cx":0.84},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Anuncia el peluche de Inglaterra","start":50.8,"end":56.8,"cx":0.76},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Se va para casita de Luca","start":60.5,"end":62.9,"cx":0.7},{"clip":"assets/nebraska02.mp4" as const,"label":"02 · Alcanza el balón y el peluche","start":64.05,"end":69.16,"cx":0.36},{"clip":"assets/nebraska03.mp4" as const,"label":"03 · Agradecimiento final","start":0.4,"end":8,"cx":0.62},{"label":"nebraska02 · corte 16","clip":"assets/nebraska02.mp4" as const,"cx":0.73,"start":76.1,"end":79.2}],"fondoTarjetas":"marca" as const,"rampSeconds":0.45,"musicVolume":0.5,"editor":true}}
          // La duracion depende de los cortes, asi que la calcula Remotion a
          // partir de los props en vez de ser una constante.
          calculateMetadata={calcReelMetadata}
          fps={REEL_FPS}
          width={1080}
          height={1920}
        />
      </Folder>
    </>
  );
};
