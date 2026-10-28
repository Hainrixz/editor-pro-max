import React from "react";
import {type Cut, type ReelProps} from "../../compositions/RifaNebraskaReel";
import {sectionLabel, UI} from "./theme";
import {Btn, ClipChip, panelStyle} from "./ui";
import {
  IcBraces,
  IcClose,
  IcFilm,
  IcPin,
  IcScissors,
  IcTarget,
  IcTrash,
  IcWarn,
} from "./icons";

type Shot = ReelProps["prizeShots"][number];

/**
 * Campo numerico editable con pasos ±. Guarda al salir del campo o con Enter,
 * nunca en cada tecla: asi puedes teclear "12" sin que "1" se aplique primero.
 * El texto es estado local para poder escribir libremente; cuando el valor de
 * fuera cambia (por un commit, un undo o un stepper) el efecto lo reengancha.
 *
 * Los steppers escriben directo con onCommit; el input valida y clampa al
 * confirmar. Cualquier tecla dentro de un INPUT ya no dispara los atajos del
 * editor (el listener global ignora inputs), asi que se escribe con normalidad.
 */
const NumField: React.FC<{
  value: number;
  onCommit: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  width?: number;
  tone?: "default" | "accent";
  title?: string;
}> = ({value, onCommit, step = 0.1, min, max, width = 56, tone = "default", title}) => {
  const [text, setText] = React.useState(value.toFixed(2));
  const editing = React.useRef(false);

  // Reengancha el texto al valor real cuando cambia por fuera, salvo mientras
  // el usuario tiene el foco puesto y esta escribiendo.
  React.useEffect(() => {
    if (!editing.current) setText(value.toFixed(2));
  }, [value]);

  const commitText = () => {
    editing.current = false;
    const n = Number(text.replace(",", "."));
    if (Number.isFinite(n)) onCommit(n);
    else setText(value.toFixed(2));
  };

  const bump = (d: number) => {
    let n = Number((value + d).toFixed(2));
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onCommit(n);
  };

  const stepBtn = (label: string, d: number) => (
    <button
      type="button"
      className="rne-btn"
      title={d < 0 ? "Restar 0.1" : "Sumar 0.1"}
      onClick={(e) => {
        e.stopPropagation();
        bump(d);
      }}
      style={{
        appearance: "none",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        color: UI.textDim,
        width: 22,
        height: 32,
        borderRadius: 6,
        fontFamily: UI.mono,
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );

  return (
    <span
      title={title}
      style={{display: "inline-flex", alignItems: "center", gap: 3}}
      onClick={(e) => e.stopPropagation()}
    >
      {stepBtn("−", -step)}
      <input
        value={text}
        inputMode="decimal"
        onChange={(e) => {
          editing.current = true;
          setText(e.target.value);
        }}
        onFocus={(e) => {
          editing.current = true;
          e.currentTarget.select();
        }}
        onBlur={commitText}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setText(value.toFixed(2));
            editing.current = false;
            e.currentTarget.blur();
          }
        }}
        style={{
          width,
          height: 32,
          textAlign: "center",
          appearance: "none",
          borderRadius: 6,
          border: `1px solid ${tone === "accent" ? UI.accent : "rgba(255,255,255,0.14)"}`,
          background: UI.bgInset,
          color: tone === "accent" ? UI.accent : UI.text,
          fontFamily: UI.mono,
          fontSize: 15,
          fontWeight: 700,
          padding: "0 4px",
          outline: "none",
        }}
      />
      {stepBtn("+", step)}
    </span>
  );
};

/** Input de texto para el nombre del encuadre. */
const TextField: React.FC<{
  value: string;
  onCommit: (v: string) => void;
}> = ({value, onCommit}) => {
  const [text, setText] = React.useState(value);
  const editing = React.useRef(false);
  React.useEffect(() => {
    if (!editing.current) setText(value);
  }, [value]);
  return (
    <input
      value={text}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        editing.current = true;
        setText(e.target.value);
      }}
      onFocus={() => (editing.current = true)}
      onBlur={() => {
        editing.current = false;
        if (text !== value) onCommit(text);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setText(value);
          editing.current = false;
          e.currentTarget.blur();
        }
      }}
      placeholder="(sin nombre)"
      style={{
        flex: 1,
        minWidth: 0,
        height: 32,
        appearance: "none",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.14)",
        background: UI.bgInset,
        color: UI.text,
        fontFamily: UI.font,
        fontSize: 15,
        fontWeight: 600,
        padding: "0 10px",
        outline: "none",
      }}
    />
  );
};

const HeadCell: React.FC<{children: React.ReactNode; width?: number | string}> = ({
  children,
  width,
}) => (
  <div style={{...sectionLabel, fontSize: 14, width, flexShrink: width ? 0 : undefined}}>
    {children}
  </div>
);

// ------------------------------------------------------------------- Cortes

const CutRow: React.FC<{
  cut: Cut;
  index: number;
  selected: boolean;
  playing: boolean;
  shotIndex: number;
  shotLabel: string | null;
  onSelect: () => void;
  onSetStart: (v: number) => void;
  onSetEnd: (v: number) => void;
  onRemove: () => void;
}> = ({
  cut,
  index,
  selected,
  playing,
  shotIndex,
  shotLabel,
  onSelect,
  onSetStart,
  onSetEnd,
  onRemove,
}) => {
  const dur = cut.endSeconds - cut.startSeconds;
  return (
    <div
      className="rne-block"
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 8px",
        borderRadius: 9,
        cursor: "pointer",
        // La fila viva (bajo el playhead) se resalta EN VIVO: es la entrada que
        // corresponde a lo que se ve en el video en este instante.
        background: playing
          ? "rgba(236,158,179,0.16)"
          : selected
            ? "rgba(255,255,255,0.05)"
            : "transparent",
        border: selected
          ? `2px solid ${UI.accent}`
          : playing
            ? `2px solid rgba(236,158,179,0.5)`
            : "2px solid transparent",
        boxShadow: playing ? "inset 4px 0 0 " + UI.accent : "none",
      }}
    >
      <div
        style={{
          width: 26,
          flexShrink: 0,
          fontFamily: UI.mono,
          fontSize: 15,
          fontWeight: 700,
          color: selected || playing ? UI.accent : UI.text,
          textAlign: "right",
        }}
      >
        {index + 1}
      </div>
      <div style={{width: 92, flexShrink: 0, overflow: "hidden"}}>
        <ClipChip src={cut.clip} size={12} />
      </div>
      <div style={{flexShrink: 0}}>
        <NumField value={cut.startSeconds} onCommit={onSetStart} min={0} title="Entrada (s del clip)" />
      </div>
      <span style={{color: UI.textFaint, fontFamily: UI.mono, fontSize: 14}}>→</span>
      <div style={{flexShrink: 0}}>
        <NumField value={cut.endSeconds} onCommit={onSetEnd} title="Salida (s del clip)" />
      </div>
      <div
        style={{
          width: 48,
          flexShrink: 0,
          textAlign: "center",
          fontFamily: UI.mono,
          fontSize: 14,
          fontWeight: 700,
          color: dur <= 0 ? UI.danger : UI.textDim,
        }}
      >
        {dur.toFixed(2)}s
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflow: "hidden",
        }}
      >
        {shotIndex === -1 ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontFamily: UI.font,
              fontSize: 13,
              color: UI.ok,
              whiteSpace: "nowrap",
            }}
            title="Rastreo de cara automático"
          >
            <IcTarget size={15} /> auto
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontFamily: UI.font,
              fontSize: 13,
              color: UI.accent,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={shotLabel ?? ""}
          >
            <IcPin size={14} />
            <span style={{overflow: "hidden", textOverflow: "ellipsis"}}>
              {shotLabel || `encuadre ${shotIndex + 1}`}
            </span>
          </span>
        )}
      </div>
      <Btn
        tone="danger"
        square
        title={`Borrar el corte ${index + 1}`}
        onClick={onRemove}
        icon={<IcTrash size={16} />}
      />
    </div>
  );
};

// ----------------------------------------------------------------- Encuadres

const ShotRow: React.FC<{
  shot: Shot;
  index: number;
  governs: number[];
  dead: boolean;
  onSetLabel: (v: string) => void;
  onSetCx: (v: number) => void;
  onSetStart: (v: number) => void;
  onSetEnd: (v: number) => void;
  onShowJson: () => void;
  onRemove: () => void;
}> = ({
  shot,
  index,
  governs,
  dead,
  onSetLabel,
  onSetCx,
  onSetStart,
  onSetEnd,
  onShowJson,
  onRemove,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "9px 10px",
        borderRadius: 9,
        background: "rgba(255,255,255,0.035)",
        border: dead
          ? `2px solid ${UI.danger}66`
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Cabecera: nº, chip, nombre editable, estado */}
      <div style={{display: "flex", alignItems: "center", gap: 8}}>
        <div
          style={{
            width: 26,
            flexShrink: 0,
            fontFamily: UI.mono,
            fontSize: 15,
            fontWeight: 700,
            color: UI.textDim,
            textAlign: "right",
          }}
        >
          {index + 1}
        </div>
        <div style={{flexShrink: 0}}>
          <ClipChip src={shot.clip} size={12} />
        </div>
        <TextField value={shot.label} onCommit={onSetLabel} />
        {dead ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              flexShrink: 0,
              padding: "4px 9px",
              borderRadius: 999,
              background: "rgba(244,88,122,0.15)",
              border: `1px solid ${UI.danger}`,
              fontFamily: UI.font,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              color: UI.danger,
            }}
            title="Este encuadre no gobierna ningún corte: no hace nada"
          >
            <IcWarn size={15} /> MUERTO
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
              fontFamily: UI.font,
              fontSize: 13,
              color: UI.ok,
              whiteSpace: "nowrap",
            }}
            title={`Gobierna los cortes: ${governs.map((i) => i + 1).join(", ")}`}
          >
            <IcScissors size={14} /> corte {governs.map((i) => i + 1).join(", ")}
          </span>
        )}
      </div>

      {/* Controles: cx / entrada / salida + acciones */}
      <div style={{display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"}}>
        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
          <span style={{...sectionLabel, fontSize: 12}}>cx</span>
          <NumField
            value={shot.cx}
            onCommit={onSetCx}
            step={0.02}
            min={0.16}
            max={0.84}
            width={54}
            tone="accent"
            title="Centro horizontal del recorte (0.16–0.84)"
          />
        </span>
        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
          <span style={{...sectionLabel, fontSize: 12}}>entrada</span>
          <NumField value={shot.start} onCommit={onSetStart} min={0} title="Segundo inicial del clip" />
        </span>
        <span style={{color: UI.textFaint, fontFamily: UI.mono, fontSize: 14}}>→</span>
        <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
          <span style={{...sectionLabel, fontSize: 12}}>salida</span>
          <NumField value={shot.end} onCommit={onSetEnd} min={0} title="Segundo final del clip" />
        </span>
        <div style={{flex: 1}} />
        <Btn
          tone="ghost"
          title="Resaltar esta entrada en el panel de props de Studio"
          onClick={onShowJson}
          icon={<IcBraces size={20} />}
        >
          ver en JSON
        </Btn>
        <Btn
          tone="danger"
          square
          title={`Borrar el encuadre ${index + 1}`}
          onClick={onRemove}
          icon={<IcTrash size={20} />}
        />
      </div>
    </div>
  );
};

// -------------------------------------------------------------- panel entero

export const DataPanel: React.FC<{
  cuts: Cut[];
  shots: Shot[];
  resolved: (Shot | null)[];
  selected: number | null;
  playing: number | null;
  onClose?: () => void;
  onSelectCut: (i: number) => void;
  onSetCutStart: (i: number, v: number) => void;
  onSetCutEnd: (i: number, v: number) => void;
  onRemoveCut: (i: number) => void;
  onAddCut: () => void;
  onSetShotLabel: (i: number, v: string) => void;
  onSetShotCx: (i: number, v: number) => void;
  onSetShotStart: (i: number, v: number) => void;
  onSetShotEnd: (i: number, v: number) => void;
  onRemoveShot: (i: number) => void;
  onShowShotJson: (i: number) => void;
  onAddShot: () => void;
  canAddShot: boolean;
}> = (p) => {
  const [tab, setTab] = React.useState<"cortes" | "encuadres">("cortes");

  // Que corte(s) gobierna cada encuadre (segun el motor, no la simple
  // superposicion): si la lista queda vacia, el encuadre esta muerto.
  const governedBy = React.useMemo(() => {
    const map: number[][] = p.shots.map(() => []);
    p.resolved.forEach((shot, ci) => {
      if (!shot) return;
      const si = p.shots.indexOf(shot);
      if (si !== -1) map[si].push(ci);
    });
    return map;
  }, [p.shots, p.resolved]);

  const deadCount = governedBy.reduce((n, g) => n + (g.length === 0 ? 1 : 0), 0);

  const TabBtn: React.FC<{
    id: "cortes" | "encuadres";
    label: string;
    count: number;
    icon: React.ReactNode;
  }> = ({id, label, count, icon}) => {
    const on = tab === id;
    return (
      <button
        type="button"
        className="rne-btn"
        onClick={(e) => {
          e.stopPropagation();
          setTab(id);
        }}
        style={{
          appearance: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 11px",
          borderRadius: 8,
          border: on ? `1px solid ${UI.accent}` : "1px solid transparent",
          background: on ? "rgba(236,158,179,0.14)" : "rgba(255,255,255,0.05)",
          color: on ? UI.accent : UI.textDim,
          fontFamily: UI.font,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {icon}
        {label}
        <span
          style={{
            fontFamily: UI.mono,
            fontSize: 12,
            fontWeight: 700,
            padding: "1px 7px",
            borderRadius: 999,
            background: on ? UI.accent : "rgba(255,255,255,0.1)",
            color: on ? UI.accentInk : UI.textDim,
          }}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div
      className="rne"
      // flex:1 + minHeight:0: el panel estira hasta el fondo del dock y la
      // lista scrollea por dentro, en vez de dejar aire muerto debajo.
      style={{
        width: "100%",
        pointerEvents: "auto",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          ...panelStyle,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Cabecera con pestañas */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{color: UI.accent, display: "inline-flex", flexShrink: 0}}>
            <IcFilm size={18} />
          </span>
          <span
            style={{
              fontFamily: UI.font,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 0.5,
              color: UI.text,
              flexShrink: 0,
            }}
          >
            DATOS
          </span>
          <TabBtn id="cortes" label="Cortes" count={p.cuts.length} icon={<IcScissors size={15} />} />
          <TabBtn
            id="encuadres"
            label="Encuadres"
            count={p.shots.length}
            icon={<IcPin size={15} />}
          />
          {deadCount > 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
                padding: "4px 9px",
                borderRadius: 999,
                background: "rgba(244,88,122,0.13)",
                border: `1px solid ${UI.danger}66`,
                fontFamily: UI.font,
                fontSize: 13,
                fontWeight: 700,
                color: UI.danger,
              }}
              title="Encuadres que no gobiernan ningún corte"
            >
              <IcWarn size={15} /> {deadCount}
            </span>
          ) : null}
          <div style={{flex: 1}} />
          {p.onClose ? (
            <Btn
              tone="ghost"
              square
              title="Cerrar el panel de datos"
              onClick={p.onClose}
              icon={<IcClose size={24} />}
            />
          ) : null}
        </div>

        {/* Cuerpo con scroll propio: la lista se desplaza sin mover el resto
            del dock, y la tabla ancha se corre en horizontal si hace falta. */}
        <div
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            flex: 1,
            minHeight: 0,
            padding: "8px 8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {tab === "cortes" ? (
            <>
              {/* Encabezado de columnas */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "0 8px 4px",
                }}
              >
                <HeadCell width={26}>Nº</HeadCell>
                <HeadCell width={92}>Clip</HeadCell>
                <HeadCell width={106}>Entrada</HeadCell>
                <span style={{width: 12}} />
                <HeadCell width={106}>Salida</HeadCell>
                <HeadCell width={48}>Dur.</HeadCell>
                <HeadCell>Encuadre</HeadCell>
              </div>
              {p.cuts.map((cut, i) => {
                const shot = p.resolved[i];
                const si = shot ? p.shots.indexOf(shot) : -1;
                return (
                  <CutRow
                    key={`${cut.clip}-${i}`}
                    cut={cut}
                    index={i}
                    selected={p.selected === i}
                    playing={p.playing === i}
                    shotIndex={si}
                    shotLabel={si === -1 ? null : p.shots[si].label}
                    onSelect={() => p.onSelectCut(i)}
                    onSetStart={(v) => p.onSetCutStart(i, v)}
                    onSetEnd={(v) => p.onSetCutEnd(i, v)}
                    onRemove={() => p.onRemoveCut(i)}
                  />
                );
              })}
              <div style={{marginTop: 6}}>
                <Btn
                  tone="accent"
                  title="Añadir un corte relleno (duplica el seleccionado desplazado)"
                  onClick={p.onAddCut}
                  icon={<IcScissors size={22} />}
                >
                  añadir corte
                </Btn>
              </div>
            </>
          ) : (
            <>
              {p.shots.map((shot, i) => (
                <ShotRow
                  key={`${shot.clip}-${i}`}
                  shot={shot}
                  index={i}
                  governs={governedBy[i]}
                  dead={governedBy[i].length === 0}
                  onSetLabel={(v) => p.onSetShotLabel(i, v)}
                  onSetCx={(v) => p.onSetShotCx(i, v)}
                  onSetStart={(v) => p.onSetShotStart(i, v)}
                  onSetEnd={(v) => p.onSetShotEnd(i, v)}
                  onShowJson={() => p.onShowShotJson(i)}
                  onRemove={() => p.onRemoveShot(i)}
                />
              ))}
              <div style={{marginTop: 6}}>
                <Btn
                  tone="accent"
                  disabled={!p.canAddShot}
                  title={
                    p.canAddShot
                      ? "Fijar un encuadre para el corte seleccionado (nace relleno)"
                      : "Selecciona antes un corte para fijarle un encuadre"
                  }
                  onClick={p.onAddShot}
                  icon={<IcPin size={22} />}
                >
                  añadir encuadre
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
