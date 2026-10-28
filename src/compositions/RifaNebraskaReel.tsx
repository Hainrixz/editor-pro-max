import React from "react";
import {
  AbsoluteFill,
  Audio,
  getRemotionEnvironment,
  Img,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {Video} from "@remotion/media";
import {z} from "zod";
import {CLIPS, WINNERS, type Clip} from "../data/nebraska";
import {loadGoogleFont} from "../presets/fonts";
import {ReelEditor} from "../components/editor/ReelEditor";

loadGoogleFont("Poppins", "400;600;700;800;900");
loadGoogleFont("JetBrains Mono", "400;700");

// Paleta de marca Patitas Peludas.
const CORAL = "#ec9eb3";
const VINO = "#8b3e64";
const CAFE = "#7b5436";
const CREAM = "#fff6ef";

export const REEL_FPS = 24;
const W = 1080;
const H = 1920;

// El material es 1024x576. Un 9:16 a altura completa mide 324 px de ancho:
// es el recorte mas ancho posible, o sea la mejor calidad alcanzable.
const SRC_W = 1024;
const SRC_H = 576;
export const CROP_W_NORM = (SRC_H * (9 / 16)) / SRC_W; // 0.3164
const HALF = CROP_W_NORM / 2;

// La escala que lleva la altura del original a 1920.
const SCALE = H / SRC_H;
const SCALED_W = SRC_W * SCALE;

// Menu desplegable, no texto libre: un `clip` mal escrito o vacio no coincide
// con nada y la entrada queda muerta sin avisar.
const clipSrc = z
  .enum([
    "assets/nebraska01.mp4",
    "assets/nebraska02.mp4",
    "assets/nebraska03.mp4",
  ])
  .default("assets/nebraska02.mp4");

/**
 * Todo esto sale como controles en el panel derecho de Remotion Studio.
 * Mueve un slider y el preview se actualiza en vivo; el boton de guardar
 * escribe los valores de vuelta a Root.tsx.
 */
export const reelSchema = z.object({
  /**
   * El montaje: un corte por entrada, en orden. Es la lista que edita el modo
   * editor (clic en el video), y tambien se puede tocar a mano desde el panel
   * de Studio. Borrar una entrada acorta el reel; la duracion se recalcula
   * sola via `calcReelMetadata`.
   */
  cuts: z
    .array(
      z.object({
        clip: clipSrc,
        /** Segundos DEL CLIP ORIGINAL. */
        startSeconds: z.number().min(0).max(90).step(0.01).default(0),
        endSeconds: z.number().min(0).max(90).step(0.01).default(1),
      }),
    )
    .describe("Cortes del montaje"),
  prizeShots: z
    .array(
      z.object({
        label: z.string().default("nuevo encuadre"),
        clip: clipSrc,
        /** Centro horizontal del recorte: 0 = izquierda, 1 = derecha. */
        cx: z.number().min(0.16).max(0.84).step(0.01).default(0.5),
        /** Segundos DEL CLIP ORIGINAL (los que muestra el editor). */
        start: z.number().min(0).max(90).step(0.01).default(0),
        end: z.number().min(0).max(90).step(0.01).default(0),
      }),
    )
    .describe("Encuadre de los premios"),
  /**
   * Fondo de las tarjetas de entrada y salida. "marca": degradado animado con
   * la paleta de Patitas (limpio, no compite con el texto). "video": la
   * version anterior, la tienda desenfocada — se conserva para poder regresar.
   */
  fondoTarjetas: z.enum(["marca", "video"]).default("marca"),
  /** Segundos que tarda el encuadre en viajar del vendedor al premio. */
  rampSeconds: z.number().min(0.1).max(1.5).step(0.05),
  musicVolume: z.number().min(0).max(1).step(0.05),
  /**
   * Editor de cortes sobre el preview: clic en el video para seleccionar el
   * corte que estas viendo, o clic en la tira de abajo para saltar a otro.
   * Con uno seleccionado puedes recortarlo, partirlo, moverlo o borrarlo, y
   * cada cambio se guarda solo en Root.tsx. Solo existe en Studio: nunca sale
   * en el render.
   */
  editor: z.boolean(),
});

export type ReelProps = z.infer<typeof reelSchema>;
export type Cut = ReelProps["cuts"][number];


const INTRO_SECONDS = 3;
const OUTRO_SECONDS = 5.5;

const framesOf = (s: number) => Math.round(s * REEL_FPS);

export const INTRO_FRAMES = framesOf(INTRO_SECONDS);
export const OUTRO_FRAMES = framesOf(OUTRO_SECONDS);

/** Los datos de cara van por archivo; los cortes ya solo guardan el nombre. */
const CLIP_BY_SRC = new Map(CLIPS.map((c) => [c.src, c]));
export const clipOf = (cut: Cut): Clip => CLIP_BY_SRC.get(cut.clip) ?? CLIPS[0];

export const cutFrames = (c: Cut) => framesOf(c.endSeconds - c.startSeconds);
export const bodyFrames = (cuts: Cut[]) =>
  cuts.reduce((n, c) => n + cutFrames(c), 0);

/** El primer cuadro del reel en que se ve el corte `i`. */
export const cutStartFrame = (cuts: Cut[], i: number) =>
  INTRO_FRAMES + bodyFrames(cuts.slice(0, i));

/**
 * La duracion sale de los cortes, asi que Remotion la tiene que recalcular
 * cada vez que cambian los props. Borra un corte y el reel se acorta solo.
 */
export const calcReelMetadata = ({props}: {props: ReelProps}) => ({
  durationInFrames:
    INTRO_FRAMES + bodyFrames(props.cuts ?? []) + OUTRO_FRAMES,
});

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Donde esta la cara del vendedor en el instante `t` del clip original. */
export const faceAt = (clip: Clip, t: number) => {
  const pts = clip.face;
  if (pts.length === 0) return 0.69;
  if (t <= pts[0].t) return pts[0].cx;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i].t) {
      const a = pts[i - 1];
      const b = pts[i];
      const k = (t - a.t) / (b.t - a.t || 1);
      return a.cx + (b.cx - a.cx) * k;
    }
  }
  return pts[pts.length - 1].cx;
};

// --------------------------------------------------------- motor de encuadre
//
// Tres reglas duras, porque sin ellas el encuadre se sentia brusco:
//
// 1. VELOCIDAD MAXIMA. El recorte 9:16 mide 0.316 del ancho original. Un paneo
//    de 1.5 cx/s cruza cinco anchos de encuadre por segundo: es un latigazo,
//    no un movimiento de camara. Se limita a MAX_PAN.
// 2. ENCUADRE ESTABLE. La cara nunca esta quieta. Seguirla literalmente hace
//    que el cuadro tiemble. Se sigue con holgura: solo se mueve si ella se
//    aleja mas de DEADBAND del centro, y entonces la reengancha por el borde.
// 3. UN ENCUADRE POR CORTE. Un premio solo manda si cubre buena parte del
//    corte; si apenas lo roza se ignora. Antes, un premio que empezaba a
//    media toma disparaba un paneo en medio del plano, y cortes vecinos
//    alternaban entre el vendedor y la repisa, que es el parpadeo que se veia.

/** cx por segundo. Un tercio del ancho del encuadre por segundo. */
const MAX_PAN = 0.11;
/** Cuanto puede alejarse la cara del centro antes de que la camara la siga. */
const DEADBAND = 0.05;
/** Un premio manda sobre el corte solo si cubre al menos esto de la toma. */
const MIN_COVERAGE = 0.45;

/** Un corte breve no basta para justificar irse y volver. */
const BRIDGE_SECONDS = 2.5;

type Shot = ReelProps["prizeShots"][number];

/** El premio que manda en este corte, si alguno lo cubre lo suficiente. */
const shotForCut = (cut: Cut, shots: ReelProps["prizeShots"]) => {
  const cutLength = cut.endSeconds - cut.startSeconds;
  let best: Shot | null = null;
  let bestCoverage = MIN_COVERAGE;

  for (const shot of shots) {
    if (shot.clip !== cut.clip) continue;
    const overlap =
      Math.min(shot.end, cut.endSeconds) - Math.max(shot.start, cut.startSeconds);
    const coverage = overlap / cutLength;
    if (coverage > bestCoverage) {
      bestCoverage = coverage;
      best = shot;
    }
  }
  return best;
};

/**
 * Resuelve el encuadre de TODOS los cortes de una vez, porque la decision de
 * uno depende de sus vecinos.
 *
 * Sin esto el encuadre rebotaba: premio -> vendedor -> premio -> vendedor, en
 * cortes de un segundo. Cada salto era de casi medio cuadro, y encadenados se
 * leian como un error de montaje. Un corte corto atrapado entre dos premios
 * hereda el premio: la camara se queda donde estaba en vez de ir y volver.
 */
export const resolveShots = (cuts: Cut[], shots: ReelProps["prizeShots"]) => {
  const resolved = cuts.map((cut) => shotForCut(cut, shots));

  for (let i = 1; i < resolved.length - 1; i++) {
    if (resolved[i]) continue;
    const prev = resolved[i - 1];
    const next = resolved[i + 1];
    if (!prev || !next) continue;
    // Solo puentea si el hueco es corto y ambos lados miran a lo mismo.
    const cut = cuts[i];
    const length = cut.endSeconds - cut.startSeconds;
    const sameClip =
      cuts[i - 1].clip === cut.clip && cuts[i + 1].clip === cut.clip;
    if (length <= BRIDGE_SECONDS && sameClip && Math.abs(prev.cx - next.cx) < 0.12) {
      resolved[i] = prev;
    }
  }
  return resolved;
};

/**
 * El recorrido completo del encuadre para un corte, cuadro a cuadro.
 * Se calcula de una vez porque el limite de velocidad es acumulativo: cada
 * cuadro depende del anterior.
 */
const cutPath = (cut: Cut, shot: Shot | null, ramp: number) => {
  const clip = clipOf(cut);
  const frames = cutFrames(cut);
  const step = MAX_PAN / REEL_FPS;

  // Objetivo por cuadro, antes de suavizar.
  const targets: number[] = [];
  let held = 0;
  for (let f = 0; f < frames; f++) {
    const t = cut.startSeconds + f / REEL_FPS;
    if (shot) {
      // El premio es un encuadre fijo: el corte entero lo mira.
      targets.push(shot.cx);
      continue;
    }
    const face = faceAt(clip, t);
    if (f === 0) {
      held = face;
    } else if (Math.abs(face - held) > DEADBAND) {
      // Solo reencuadra cuando se sale de la zona muerta, y la reengancha
      // por el borde: asi la camara "respira" en vez de perseguirlo.
      held = face > held ? face - DEADBAND : face + DEADBAND;
    }
    targets.push(held);
  }

  // Entrada suave al encuadre de premio, respetando la velocidad maxima.
  const path: number[] = [];
  let cur = targets[0] ?? 0.5;
  for (let f = 0; f < frames; f++) {
    const want = targets[f];
    const delta = want - cur;
    // Frena cerca del objetivo para que no llegue de golpe.
    const ease = smoothstep(Math.abs(delta) / (MAX_PAN * ramp));
    const move = Math.sign(delta) * Math.min(Math.abs(delta), step * ease);
    cur += move;
    path.push(clamp(cur, HALF, 1 - HALF));
  }
  return path;
};

/** Recorte 9:16 a sangre que sigue al sujeto que toca en cada momento. */
const Reframed: React.FC<{
  cut: Cut;
  shot: Shot | null;
  ramp: number;
}> = ({cut, shot, ramp}) => {
  const frame = useCurrentFrame();

  const path = React.useMemo(() => cutPath(cut, shot, ramp), [cut, shot, ramp]);

  const centre = path[clamp(frame, 0, path.length - 1)] ?? 0.5;
  const left = W / 2 - centre * SCALED_W;

  // Respiracion muy leve; sin zoom fuerte, que aqui cada pixel cuenta.
  const breathe =
    1 + Math.sin((frame / (REEL_FPS * 6)) * Math.PI * 2) * 0.008 + 0.008;

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: "#000"}}>
      <div
        style={{
          position: "absolute",
          left,
          top: 0,
          width: SCALED_W,
          height: H,
          transform: `scale(${breathe})`,
          transformOrigin: `${centre * SCALED_W}px center`,
        }}
      >
        <Video
          src={staticFile(cut.clip)}
          trimBefore={framesOf(cut.startSeconds)}
          // trimBefore + duracion de la Sequence, NO framesOf(endSeconds):
          // con endSeconds el redondeo puede dejar el ultimo frame sin
          // material y sale un cuadro negro.
          trimAfter={framesOf(cut.startSeconds) + cutFrames(cut)}
          volume={1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "fill",
            translate: "-3px 0px"
          }} />
      </div>
    </AbsoluteFill>
  );
};



// ------------------------------------------------------------------ editor
//
// El editor in-canvas vive en src/components/editor/ (ReelEditor). Solo se
// monta en Studio (`editor && getRemotionEnvironment().isStudio`), asi que no
// hay manera de que se cuele en un render aunque dejes el prop encendido.

/** El id con el que esta registrado en Root.tsx. saveDefaultProps lo necesita. */
export const REEL_ID = "RifaNebraskaReel";

// ----------------------------------------------------------------- escenas

/**
 * Tarjeta de entrada. Reconstruye el diseno de la tarjeta de ganadores del
 * video del sorteo: fondo de tienda desenfocado, logo arriba, titular a dos
 * tonos y una fila destacada en vino. Asi entrada y salida hacen juego.
 */
/**
 * Fondo de marca para la intro: cama oscura calida con el rosa y el vino de
 * Patitas respirando muy lento detras del texto, mas un bokeh tenue que sube
 * flotando. Todo determinista por frame y de bajo contraste a proposito: la
 * informacion es la protagonista.
 */
const FondoMarca: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / REEL_FPS;
  // Oscilaciones lentas y desfasadas para que el degradado "respire".
  const sway = (period: number, phase: number) =>
    Math.sin(((t / period) + phase) * Math.PI * 2);

  // Bokeh determinista: posiciones y tamanos fijos por indice (nada de
  // Math.random, que rompe el render reproducible).
  const dots = Array.from({length: 9}, (_, i) => {
    const seed = (i * 137.508) % 100; // angulo aureo: bien repartidos
    const x = 8 + (seed * 0.84) % 84;
    const size = 90 + ((i * 53) % 150);
    const rise = ((t * (14 + (i % 4) * 6) + i * 210) % 2200) - 140;
    return {
      x: x + sway(16 + i, i * 0.35) * 2.5,
      y: 1920 - rise,
      size,
      color: i % 3 === 0 ? CORAL : i % 3 === 1 ? VINO : CREAM,
      alpha: 0.05 + (i % 3) * 0.03,
    };
  });

  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(95% 58% at 50% ${45 + sway(9, 0) * 3}%, rgba(236,158,179,0.30), transparent 70%)`,
            `radial-gradient(75% 50% at ${26 + sway(12, 0.3) * 6}% 78%, rgba(139,62,100,0.48), transparent 72%)`,
            `radial-gradient(85% 55% at ${76 + sway(14, 0.6) * 5}% 20%, rgba(139,62,100,0.34), transparent 70%)`,
            `linear-gradient(180deg, #251a21 0%, #1e171d 46%, #150f13 100%)`,
          ].join(","),
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: d.y,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: d.color,
            opacity: d.alpha,
            filter: "blur(34px)",
          }}
        />
      ))}
      {/* Vineta: bordes oscuros para que el bloque central de texto mande. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 88% at 50% 50%, transparent 52%, rgba(10,6,9,0.55) 100%)," +
            "linear-gradient(180deg, rgba(10,6,9,0.5) 0%, transparent 18%, transparent 82%, rgba(10,6,9,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** El fondo anterior de las tarjetas: la tienda desenfocada. Se conserva tal
 * cual para poder regresar con fondoTarjetas: "video". */
const FondoVideo: React.FC<{src: string; fromSeconds: number; frames: number}> = ({
  src,
  fromSeconds,
  frames,
}) => (
  <Video
    src={staticFile(src)}
    trimBefore={framesOf(fromSeconds)}
    trimAfter={framesOf(fromSeconds) + frames}
    muted
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "blur(42px) brightness(0.58) saturate(1.25)",
      transform: "scale(1.3)",
    }}
  />
);

const Intro: React.FC<{
  musicVolume: number;
  fondo: ReelProps["fondoTarjetas"];
}> = ({musicVolume, fondo}) => {
  const frame = useCurrentFrame();
  const k = smoothstep(frame / framesOf(0.5));
  const float = Math.sin((frame / (REEL_FPS * 3)) * Math.PI * 2) * 5;

  const headline: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800,
    fontSize: 96,
    lineHeight: 1.0,
    letterSpacing: -1,
    textAlign: "center",
  };

  return (
    <AbsoluteFill style={{backgroundColor: "#1e171d"}}>
      {/* Musica de marca. El arranque de la pista; los fades van en el WAV. */}
      <Audio src={staticFile("assets/music_intro.wav")} volume={musicVolume} />

      {/* La cama de la tarjeta, conmutable desde el panel (fondoTarjetas). */}
      {fondo === "video" ? (
        <FondoVideo src="assets/nebraska01.mp4" fromSeconds={2} frames={INTRO_FRAMES} />
      ) : (
        <FondoMarca />
      )}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          padding: "0 90px",
          opacity: k,
        }}
      >
        <Img
          src={staticFile("assets/logo.png")}
          style={{
            width: 250,
            objectFit: "contain",
            transform: `translateY(${float}px) scale(${0.9 + k * 0.1})`,
            filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.5))",
          }}
        />

        <div>
          <h1 style={{...headline, color: CREAM}}>RIFA PATITAS</h1>
          <div style={{position: "relative", marginTop: 6}}>
            <h1
              style={{
                ...headline,
                fontSize: 132,
                color: "transparent",
                WebkitTextStroke: `14px ${CREAM}`,
              }}
            >
              2026
            </h1>
            <h1
              style={{
                ...headline,
                fontSize: 132,
                color: CORAL,
                position: "absolute",
                inset: 0,
              }}
            >
              2026
            </h1>
          </div>
        </div>

        {/* Fila destacada, igual que la del ganador del balon. */}
        <div
          style={{
            marginTop: 10,
            background: VINO,
            borderRadius: 30,
            padding: "22px 64px",
            textAlign: "center",
            boxShadow: "0 14px 36px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: 3,
              color: CORAL,
            }}
          >
            SUCURSAL
          </div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 54,
              color: CREAM,
            }}
          >
            Nebraska
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: 30,
            color: CORAL,
          }}
        >
          patitaspeludas.mx
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Tarjeta de ganadores, con el mismo diseno que la entrada.
 * Los nombres salen de lo que dicta el vendedor en nebraska02.
 */
const Outro: React.FC<{
  musicVolume: number;
  fondo: ReelProps["fondoTarjetas"];
}> = ({musicVolume, fondo}) => {
  const frame = useCurrentFrame();
  const k = smoothstep(frame / framesOf(0.5));
  const float = Math.sin((frame / (REEL_FPS * 3)) * Math.PI * 2) * 5;

  const headline: React.CSSProperties = {
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800,
    fontSize: 82,
    lineHeight: 1.0,
    textAlign: "center",
  };

  return (
    <AbsoluteFill style={{backgroundColor: "#1e171d"}}>
      {/* La misma pista, continuando donde la dejo la entrada. */}
      <Audio src={staticFile("assets/music_outro.wav")} volume={musicVolume} />

      {/* La misma cama que la tarjeta de entrada (fondoTarjetas). */}
      {fondo === "video" ? (
        <FondoVideo src="assets/nebraska02.mp4" fromSeconds={30} frames={OUTRO_FRAMES} />
      ) : (
        <FondoMarca />
      )}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 78px",
          opacity: k,
        }}
      >
        <Img
          src={staticFile("assets/logo.png")}
          style={{
            width: 170,
            objectFit: "contain",
            transform: `translateY(${float}px)`,
            filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.5))",
          }}
        />

        <div style={{marginTop: 26, marginBottom: 42}}>
          <h1 style={{...headline, color: CREAM}}>¡YA TENEMOS</h1>
          <div style={{position: "relative", marginTop: 4}}>
            <h1
              style={{
                ...headline,
                fontSize: 92,
                color: "transparent",
                WebkitTextStroke: `12px ${CREAM}`,
              }}
            >
              GANADORES!
            </h1>
            <h1
              style={{
                ...headline,
                fontSize: 92,
                color: CORAL,
                position: "absolute",
                inset: 0,
              }}
            >
              GANADORES!
            </h1>
          </div>
        </div>

        {/* El premio mayor, destacado como en la tarjeta de referencia. */}
        <div
          style={{
            width: "100%",
            background: VINO,
            borderRadius: 30,
            padding: "20px 40px",
            textAlign: "center",
            boxShadow: "0 14px 36px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: 3,
              color: CORAL,
            }}
          >
            {WINNERS.headline.prize}
          </div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 56,
              color: CREAM,
            }}
          >
            {WINNERS.headline.name}
          </div>
        </div>

        {WINNERS.rows.map((row, i) => {
          const rowK = smoothstep((frame - framesOf(0.35) - i * 3) / framesOf(0.3));
          return (
            <div
              key={row.name}
              style={{
                width: "100%",
                marginTop: 18,
                background: CREAM,
                borderRadius: 999,
                padding: "20px 38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                opacity: rowK,
                transform: `translateX(${(1 - rowK) * -26}px)`,
                boxShadow: "0 8px 22px rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: 27,
                  color: CAFE,
                }}
              >
                {row.prize}
              </span>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: 38,
                  color: VINO,
                  textAlign: "right",
                }}
              >
                {row.name}
              </span>
            </div>
          );
        })}

        <div
          style={{
            marginTop: 44,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: 40,
            color: CREAM,
          }}
        >
          ¡Gracias por participar!
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: 28,
            color: CORAL,
          }}
        >
          patitaspeludas.mx
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RifaNebraskaReel: React.FC<ReelProps> = ({
  cuts,
  prizeShots,
  fondoTarjetas,
  rampSeconds,
  musicVolume,
  editor,
}) => {
  // El encuadre de un corte depende de sus vecinos, asi que se resuelven todos
  // juntos antes de dibujar nada.
  const resolved = React.useMemo(
    () => resolveShots(cuts, prizeShots),
    [cuts, prizeShots],
  );

  const [selected, setSelected] = React.useState<number | null>(null);

  const body = bodyFrames(cuts);
  const showEditor = editor && getRemotionEnvironment().isStudio;

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <Sequence durationInFrames={INTRO_FRAMES}>
        <Intro musicVolume={musicVolume} fondo={fondoTarjetas} />
      </Sequence>

      <Sequence from={INTRO_FRAMES} durationInFrames={body}>
        <AbsoluteFill>
          <Series>
            {cuts.map((cut, i) => (
              <Series.Sequence
                key={`${cut.clip}-${cut.startSeconds}-${i}`}
                durationInFrames={cutFrames(cut)}
              >
                <Reframed cut={cut} shot={resolved[i]} ramp={rampSeconds} />
              </Series.Sequence>
            ))}
          </Series>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={INTRO_FRAMES + body} durationInFrames={OUTRO_FRAMES}>
        <Outro musicVolume={musicVolume} fondo={fondoTarjetas} />
      </Sequence>

      {/* Fuera de los Sequence: asi ve el cuadro global del reel, no el del corte. */}
      {showEditor ? (
        <ReelEditor
          cuts={cuts}
          shots={prizeShots}
          selected={selected}
          onSelect={setSelected}
        />
      ) : null}
    </AbsoluteFill>
  );
};
