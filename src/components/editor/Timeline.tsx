import React from "react";
import {
  bodyFrames,
  cutFrames,
  INTRO_FRAMES,
  OUTRO_FRAMES,
  REEL_FPS,
  type Cut,
} from "../../compositions/RifaNebraskaReel";
import {CLIP_META, clipMeta, UI} from "./theme";
import {panelStyle} from "./ui";

/**
 * Cursor de reproduccion vivo. Se dibuja DENTRO del bloque activo (intro,
 * corte u outro) con `left` proporcional: asi queda clavado al pixel aunque
 * los bloques tengan separacion entre si.
 */
const Playhead: React.FC<{frac: number}> = ({frac}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `${Math.min(100, Math.max(0, frac * 100))}%`,
      width: 0,
      pointerEvents: "none",
      zIndex: 2,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: -1.5,
        width: 3,
        background: "#fff",
        boxShadow: "0 0 12px rgba(255,255,255,0.9)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 0,
        left: -7,
        width: 0,
        height: 0,
        borderLeft: "7px solid transparent",
        borderRight: "7px solid transparent",
        borderTop: "9px solid #fff",
      }}
    />
  </div>
);

/** Bloque rayado de entrada/salida: cuenta en el tiempo pero no se edita. */
const ZoneBlock: React.FC<{
  label: string;
  frames: number;
  playheadFrac: number | null;
  onClick: () => void;
}> = ({label, frames, playheadFrac, onClick}) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={`${label} · ${(frames / REEL_FPS).toFixed(1)} s (fijo)`}
    style={{
      flexGrow: frames,
      flexBasis: 0,
      minWidth: 44,
      position: "relative",
      borderRadius: 10,
      overflow: "hidden",
      cursor: "pointer",
      border: "1px solid rgba(255,255,255,0.08)",
      background:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.055) 0 9px, rgba(255,255,255,0.015) 9px 18px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <span
      style={{
        fontFamily: UI.font,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: 3,
        color: UI.textFaint,
      }}
    >
      {label}
    </span>
    {playheadFrac !== null ? <Playhead frac={playheadFrac} /> : null}
  </div>
);

/**
 * Timeline inferior: intro y outro rayados en los extremos y un bloque por
 * corte, de ancho proporcional a su duracion y tenido con el color de su clip
 * fuente. Clic en un bloque = seleccionarlo y saltar a su inicio.
 */
export const Timeline: React.FC<{
  cuts: Cut[];
  starts: number[];
  selected: number | null;
  playing: number | null;
  frame: number;
  onSelectCut: (i: number) => void;
  onSeek: (frame: number) => void;
  onDeselect: () => void;
}> = ({cuts, starts, selected, playing, frame, onSelectCut, onSeek, onDeselect}) => {
  const body = bodyFrames(cuts);
  const total = INTRO_FRAMES + body + OUTRO_FRAMES;

  const inIntro = frame < INTRO_FRAMES;
  const inOutro = frame >= INTRO_FRAMES + body;

  return (
    <div
      className="rne"
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        bottom: 24,
        opacity: 0.92,
        pointerEvents: "auto",
      }}
    >
      <div style={{...panelStyle, padding: "12px 14px 10px"}}>
        {/* Bloques: tira delgada, solo lo espacial (seleccionar y saltar). */}
        <div style={{display: "flex", gap: 4, height: 62, alignItems: "stretch"}}>
          <ZoneBlock
            label="INTRO"
            frames={INTRO_FRAMES}
            playheadFrac={inIntro ? frame / INTRO_FRAMES : null}
            onClick={() => {
              onDeselect();
              onSeek(0);
            }}
          />

          {cuts.map((c, i) => {
            const meta = clipMeta(c.clip);
            const isSel = i === selected;
            const isPlaying = i === playing;
            const durS = c.endSeconds - c.startSeconds;
            return (
              <div
                key={`${c.clip}-${c.startSeconds}-${i}`}
                className="rne-block"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCut(i);
                }}
                title={`Corte ${i + 1} · ${meta.short} · ${c.startSeconds.toFixed(2)} → ${c.endSeconds.toFixed(2)} s (${durS.toFixed(2)} s)`}
                style={{
                  flexGrow: cutFrames(c),
                  flexBasis: 0,
                  minWidth: 16,
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  background: `linear-gradient(180deg, ${meta.soft}, rgba(0,0,0,0.42))`,
                  border: isSel
                    ? `3px solid ${UI.accent}`
                    : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isSel ? "0 0 0 4px rgba(236,158,179,0.22)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {/* Barra superior con el color del clip fuente. */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: meta.color,
                    opacity: 0.95,
                  }}
                />
                <span
                  style={{
                    fontFamily: UI.mono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: isSel ? UI.accent : UI.text,
                    lineHeight: 1.1,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontFamily: UI.mono,
                    fontSize: 14,
                    color: UI.textDim,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "94%",
                  }}
                >
                  {durS.toFixed(1)}s
                </span>
                {isPlaying ? (
                  <Playhead frac={(frame - starts[i]) / cutFrames(c)} />
                ) : null}
              </div>
            );
          })}

          <ZoneBlock
            label="OUTRO"
            frames={OUTRO_FRAMES}
            playheadFrac={
              inOutro ? (frame - INTRO_FRAMES - body) / OUTRO_FRAMES : null
            }
            onClick={() => {
              onDeselect();
              onSeek(INTRO_FRAMES + body);
            }}
          />
        </div>

        {/* Pie: reloj, leyenda de clips y recordatorio de autoguardado. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 12,
            padding: "0 4px",
          }}
        >
          <span style={{fontFamily: UI.mono, fontSize: 21, color: UI.text}}>
            {(frame / REEL_FPS).toFixed(1)}
            <span style={{color: UI.textFaint}}>
              {" "}/ {(total / REEL_FPS).toFixed(1)} s
            </span>
          </span>

          <span style={{display: "inline-flex", gap: 18, alignItems: "center"}}>
            {Object.entries(CLIP_META).map(([src, meta]) => (
              <span
                key={src}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: UI.mono,
                  fontSize: 17,
                  color: UI.textDim,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    background: meta.color,
                  }}
                />
                {meta.short}
              </span>
            ))}
          </span>

          <span style={{fontFamily: UI.font, fontSize: 17, color: UI.textFaint}}>
            {cuts.length} cortes · {(body / REEL_FPS).toFixed(1)} s de cuerpo ·
            guardado automático en Root.tsx
          </span>
        </div>
      </div>
    </div>
  );
};
