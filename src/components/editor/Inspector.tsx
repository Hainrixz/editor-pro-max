import React from "react";
import {
  CROP_W_NORM,
  type Cut,
  type ReelProps,
} from "../../compositions/RifaNebraskaReel";
import {sectionLabel, UI} from "./theme";
import {Btn, ClipChip, panelStyle} from "./ui";
import {
  IcBraces,
  IcChevronL,
  IcChevronR,
  IcClose,
  IcPin,
  IcPinOff,
  IcRedo,
  IcScissors,
  IcTarget,
  IcTrash,
  IcUndo,
} from "./icons";

type Shot = ReelProps["prizeShots"][number];

const CX_MIN = 0.16;
const CX_MAX = 0.84;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Celda de dato: etiqueta pequena arriba, valor mono grande abajo. */
const Stat: React.FC<{label: string; children: React.ReactNode}> = ({
  label,
  children,
}) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      background: UI.bgRaised,
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 9,
      padding: "7px 11px",
    }}
  >
    <div style={{...sectionLabel, fontSize: 12, marginBottom: 2}}>{label}</div>
    <div
      style={{
        fontFamily: UI.mono,
        fontSize: 18,
        fontWeight: 700,
        color: UI.text,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Mini-mapa del encuadre: el rectangulo exterior es el ancho COMPLETO del
 * clip fuente (1024 px) y la ventana coral es el recorte 9:16 que se ve en el
 * reel, centrado en `cx`. Si el corte tiene encuadre fijado, la ventana se
 * arrastra en horizontal; el punto verde marca donde esta la cara.
 */
const FramingStrip: React.FC<{
  cx: number;
  faceCx: number;
  pinned: boolean;
  onCommitCx: (cx: number) => void;
}> = ({cx, faceCx, pinned, onCommitCx}) => {
  const [drag, setDrag] = React.useState<number | null>(null);
  const shown = drag ?? cx;

  const cxFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return clamp((e.clientX - rect.left) / rect.width, CX_MIN, CX_MAX);
  };

  return (
    <div
      onPointerDown={
        pinned
          ? (e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDrag(cxFromEvent(e));
            }
          : undefined
      }
      onPointerMove={
        pinned
          ? (e) => {
              if (drag !== null) setDrag(cxFromEvent(e));
            }
          : undefined
      }
      onPointerUp={
        pinned
          ? (e) => {
              if (drag !== null) onCommitCx(cxFromEvent(e));
              setDrag(null);
            }
          : undefined
      }
      title={
        pinned
          ? "Arrastra la ventana para mover el encuadre"
          : "Encuadre automático: sigue la cara del vendedor"
      }
      style={{
        position: "relative",
        height: 104,
        borderRadius: 9,
        background: UI.bgInset,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        cursor: pinned ? (drag !== null ? "grabbing" : "grab") : "default",
        touchAction: "none",
      }}
    >
      {/* Regla de decimas para ubicarse en el ancho de la fuente. */}
      {Array.from({length: 9}, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(i + 1) * 10}%`,
            width: 1,
            background: "rgba(255,255,255,0.06)",
          }}
        />
      ))}
      <span
        style={{
          position: "absolute",
          left: 10,
          bottom: 6,
          fontFamily: UI.mono,
          fontSize: 15,
          color: UI.textFaint,
        }}
      >
        0 · izquierda
      </span>
      <span
        style={{
          position: "absolute",
          right: 10,
          bottom: 6,
          fontFamily: UI.mono,
          fontSize: 15,
          color: UI.textFaint,
        }}
      >
        derecha · 1
      </span>

      {/* La cara detectada en este instante. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${faceCx * 100}%`,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: UI.ok,
            boxShadow: "0 0 14px rgba(87,217,163,0.8)",
          }}
        />
        <span style={{fontFamily: UI.mono, fontSize: 15, color: UI.ok}}>cara</span>
      </div>

      {/* La ventana de recorte 9:16. */}
      <div
        style={{
          position: "absolute",
          top: 5,
          bottom: 5,
          left: `${(shown - CROP_W_NORM / 2) * 100}%`,
          width: `${CROP_W_NORM * 100}%`,
          borderRadius: 8,
          border: `3px solid ${pinned ? UI.accent : "rgba(255,255,255,0.45)"}`,
          background: pinned
            ? "rgba(236,158,179,0.14)"
            : "rgba(255,255,255,0.07)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: UI.mono,
            fontSize: 18,
            fontWeight: 700,
            color: pinned ? UI.accent : UI.textDim,
            padding: 4,
          }}
        >
          {shown.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const Group: React.FC<{label: string; children: React.ReactNode}> = ({
  label,
  children,
}) => (
  <div style={{display: "flex", flexDirection: "column", gap: 5}}>
    <span style={{...sectionLabel, fontSize: 12}}>{label}</span>
    <div style={{display: "flex", gap: 6}}>{children}</div>
  </div>
);

/** Panel flotante con todo lo editable del corte seleccionado. */
export const Inspector: React.FC<{
  cut: Cut;
  index: number;
  count: number;
  sourceT: number | null;
  faceCx: number;
  shot: Shot | null;
  shotIndex: number;
  canSplit: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onTrimStart: (d: number) => void;
  onTrimEnd: (d: number) => void;
  onSplit: () => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPinShot: () => void;
  onSetShotCx: (cx: number) => void;
  onCenterFace: () => void;
  onShowJson: () => void;
  onUnpinShot: () => void;
  onDeselect: () => void;
}> = (p) => {
  const {cut, shot} = p;
  const dur = cut.endSeconds - cut.startSeconds;
  const cx = shot ? shot.cx : p.faceCx;

  return (
    <div
      className="rne"
      style={{width: "100%", pointerEvents: "auto"}}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{...panelStyle, padding: "12px 14px 14px"}}>
        {/* Cabecera del corte */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: UI.font,
              fontSize: 21,
              fontWeight: 800,
              color: UI.text,
              letterSpacing: 0.5,
            }}
          >
            Corte {p.index + 1}
            <span style={{color: UI.textFaint, fontWeight: 600}}>
              {" "}/ {p.count}
            </span>
          </span>
          <ClipChip src={cut.clip} />
          <div style={{flex: 1}} />
          <Btn tone="ghost" square title="Quitar selección (Esc)" onClick={p.onDeselect} icon={<IcClose size={26} />} />
        </div>

        {/* Datos del corte */}
        <div style={{display: "flex", gap: 8, marginBottom: 12}}>
          <Stat label="Entrada → salida">
            {cut.startSeconds.toFixed(2)}
            <span style={{color: UI.textFaint}}> → </span>
            {cut.endSeconds.toFixed(2)} s
          </Stat>
          <Stat label="Duración">{dur.toFixed(2)} s</Stat>
          <Stat label="Clip bajo el cursor">
            {p.sourceT === null ? (
              <span style={{color: UI.textFaint, fontSize: 20}}>
                fuera del corte
              </span>
            ) : (
              <span style={{color: UI.accent}}>{p.sourceT.toFixed(2)} s</span>
            )}
          </Stat>
        </div>

        {/* Encuadre */}
        <div style={{...sectionLabel, fontSize: 12, marginBottom: 6}}>Encuadre</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            fontFamily: UI.font,
            fontSize: 14,
          }}
        >
          {shot ? (
            <>
              <span style={{color: UI.accent, fontWeight: 700, display: "inline-flex"}}>
                <IcPin size={16} />
              </span>
              <span style={{color: UI.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                {shot.label || "(sin nombre)"}
              </span>
              <span style={{fontFamily: UI.mono, fontSize: 12, color: UI.textFaint, flexShrink: 0}}>
                prizeShots[{p.shotIndex}] · cx {shot.cx.toFixed(2)}
              </span>
            </>
          ) : (
            <span style={{color: UI.ok, fontWeight: 600}}>
              Rastreo de cara automático — la cámara sigue al vendedor
            </span>
          )}
        </div>

        <FramingStrip
          cx={cx}
          faceCx={p.faceCx}
          pinned={shot !== null}
          onCommitCx={p.onSetShotCx}
        />

        <div style={{display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10}}>
          {shot ? (
            <>
              <Btn
                title="Mover el encuadre 0.02 a la izquierda"
                onClick={() => p.onSetShotCx(clamp(shot.cx - 0.02, CX_MIN, CX_MAX))}
                icon={<IcChevronL size={24} />}
              >
                −0.02
              </Btn>
              <Btn
                title="Mover el encuadre 0.02 a la derecha"
                onClick={() => p.onSetShotCx(clamp(shot.cx + 0.02, CX_MIN, CX_MAX))}
                icon={<IcChevronR size={24} />}
              >
                +0.02
              </Btn>
              <Btn
                title="Centrar el encuadre en la cara detectada"
                onClick={p.onCenterFace}
                icon={<IcTarget size={24} />}
              >
                centrar en cara
              </Btn>
              <Btn
                title="Resaltar esta entrada en el panel de props"
                onClick={p.onShowJson}
                icon={<IcBraces size={24} />}
              >
                ver en JSON
              </Btn>
              <Btn
                tone="danger"
                title="Quitar el encuadre fijo: vuelve al rastreo de cara"
                onClick={p.onUnpinShot}
                icon={<IcPinOff size={24} />}
              >
                quitar
              </Btn>
            </>
          ) : (
            <Btn
              tone="accent"
              title="Crear un encuadre fijo para este corte (anula el rastreo)"
              onClick={p.onPinShot}
              icon={<IcPin size={24} />}
            >
              fijar encuadre en este corte
            </Btn>
          )}
        </div>

        {/* Edicion del corte */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Group label="Inicio">
            <Btn title="Adelantar el inicio 0.1 s" onClick={() => p.onTrimStart(-0.1)}>
              −0.1
            </Btn>
            <Btn title="Recortar el inicio 0.1 s  ( [ )" onClick={() => p.onTrimStart(+0.1)}>
              +0.1
            </Btn>
          </Group>
          <Group label="Fin">
            <Btn title="Recortar el fin 0.1 s  ( ] )" onClick={() => p.onTrimEnd(-0.1)}>
              −0.1
            </Btn>
            <Btn title="Alargar el fin 0.1 s" onClick={() => p.onTrimEnd(+0.1)}>
              +0.1
            </Btn>
          </Group>
          <Group label="Dividir">
            <Btn
              title="Partir el corte en el playhead (S)"
              onClick={p.onSplit}
              disabled={!p.canSplit}
              icon={<IcScissors size={24} />}
            >
              en el playhead
            </Btn>
          </Group>
          <Group label="Orden">
            <Btn
              square
              title="Intercambiar con el corte anterior"
              onClick={() => p.onMove(-1)}
              disabled={p.index === 0}
              icon={<IcChevronL size={24} />}
            />
            <Btn
              square
              title="Intercambiar con el corte siguiente"
              onClick={() => p.onMove(1)}
              disabled={p.index === p.count - 1}
              icon={<IcChevronR size={24} />}
            />
          </Group>
          <Group label="Historial">
            <Btn
              square
              title="Deshacer (Z)"
              onClick={p.onUndo}
              disabled={!p.canUndo}
              icon={<IcUndo size={24} />}
            />
            <Btn
              square
              title="Rehacer (⇧Z)"
              onClick={p.onRedo}
              disabled={!p.canRedo}
              icon={<IcRedo size={24} />}
            />
          </Group>
          <Group label="Corte">
            <Btn
              tone="danger"
              title="Borrar este corte (⌫)"
              onClick={p.onRemove}
              icon={<IcTrash size={24} />}
            >
              borrar
            </Btn>
          </Group>
        </div>
      </div>
    </div>
  );
};
