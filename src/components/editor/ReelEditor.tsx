import React from "react";
import {createPortal} from "react-dom";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {
  bodyFrames,
  clipOf,
  cutFrames,
  cutStartFrame,
  faceAt,
  REEL_FPS,
  resolveShots,
  type Cut,
  type ReelProps,
} from "../../compositions/RifaNebraskaReel";
import {persistProps, seekTo, showInJson, syncJsonHighlight} from "./studio";
import {DOCK, DOCK_VIRTUAL_W, sectionLabel, UI} from "./theme";
import {Btn, EditorStyles, Kbd, panelStyle} from "./ui";
import {
  IcBroom,
  IcChevronL,
  IcChevronR,
  IcCursor,
  IcKeyboard,
  IcRedo,
  IcScissors,
  IcUndo,
  IcWarn,
} from "./icons";
import {Timeline} from "./Timeline";
import {Inspector} from "./Inspector";
import {DataPanel} from "./DataPanel";

type Shot = ReelProps["prizeShots"][number];

/** Ningun corte baja de aqui: mas corto y el ojo no alcanza a asentarse. */
const MIN_CUT_SECONDS = 0.3;
/** Lo que mueve cada clic en los botones de recorte. */
const NUDGE_SECONDS = 0.1;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * Studio dibuja encima del preview una capa de contornos (los recuadros azules
 * que resaltan el elemento bajo el cursor) con `pointer-events: all`. Vive
 * fuera de la composicion, asi que ningun z-index nuestro la gana: se traga
 * todos los clics y el editor parece muerto.
 *
 * Mientras el editor esta encendido le quitamos los eventos a esa capa — es lo
 * mismo que hace el boton "Hide outlines" de la barra, pero sin que tengas que
 * acordarte de darle. Se revierte solo al apagar el editor.
 */
const useClicksReachTheCanvas = (enabled: boolean) => {
  React.useEffect(() => {
    if (!enabled) return;
    const style = document.createElement("style");
    style.textContent =
      'svg[aria-hidden="true"] polygon {pointer-events: none !important}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [enabled]);
};

/**
 * Con el editor encendido, el panel derecho de Studio ("Default Props", el
 * JSON crudo) sobra: el Panel de Datos lo reemplaza. Studio no expone API para
 * la barra, pero su boton de toggle es identificable por title, y el estado
 * persiste solo en localStorage ("remotion.sidebarRightCollapsing"). Al montar
 * la cerramos si esta abierta — con reintentos breves porque Studio la monta
 * despues que nosotros. El usuario puede reabrirla cuando quiera con ⌘+J o el
 * boton de la esquina superior derecha; no volvemos a pelear por ella.
 */
const useStudioJsonPanelCollapsed = (enabled: boolean) => {
  React.useEffect(() => {
    if (!enabled) return;
    const collapse = () => {
      const expanded =
        window.localStorage.getItem("remotion.sidebarRightCollapsing") ===
        "expanded";
      if (!expanded) return true;
      const btn = document.querySelector<HTMLElement>(
        '[title^="Toggle Right Sidebar"]',
      );
      if (!btn) return false;
      btn.click();
      return true;
    };
    if (collapse()) return;
    const timer = window.setInterval(() => {
      if (collapse()) window.clearInterval(timer);
    }, 400);
    const stop = window.setTimeout(() => window.clearInterval(timer), 5000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [enabled]);
};

/**
 * Studio centra el preview en el ancho total de la ventana sin saber que el
 * dock existe (es un overlay fijo montado por portal), asi que en ventanas
 * angostas el canvas se metia debajo del dock. Reservamos el ancho del dock
 * en el contenedor raiz de Studio (#__remotion-studio-container, id estable
 * de su index.html): el ResizeObserver del player detecta el cambio y
 * re-encuadra el preview solo. Al colapsar el dock se devuelve el ancho.
 */
const useReservedDockSpace = (open: boolean) => {
  React.useEffect(() => {
    if (!open) return;
    const style = document.createElement("style");
    // position:relative ademas del ancho: el armazon interno de Studio es un
    // div absolute cuyos ancestros son todos static, asi que sin esto resuelve
    // su tamano contra el viewport completo e ignora la reserva.
    // height explicita: al volverse relative, la altura del contenedor ya no
    // la aporta el armazon absolute de dentro y colapsaria a 0.
    style.textContent = `#__remotion-studio-container {position: relative !important; width: calc(100vw - ${DOCK.width}px) !important; height: 100vh !important;}`;
    document.head.appendChild(style);
    // Studio solo re-mide el canvas ante un resize de ventana (o al arrastrar
    // sus splitters); un cambio de CSS no dispara nada y el preview queda
    // descentrado, calculado con el ancho viejo. Se lo avisamos nosotros.
    const nudge = () => window.dispatchEvent(new Event("resize"));
    const raf = requestAnimationFrame(nudge);
    return () => {
      cancelAnimationFrame(raf);
      style.remove();
      requestAnimationFrame(nudge);
    };
  }, [open]);
};

/**
 * Un encuadre esta muerto si su rango es imposible (end <= start) o si ya no
 * toca ningun corte de su clip: no puede mandar sobre nada y solo estorba en
 * el JSON. Pasa, por ejemplo, al crear una entrada con el "+" del panel (nace
 * con start y end en 0) o al borrar el corte que encuadraba.
 */
const isDeadShot = (s: Shot, cuts: Cut[]) =>
  s.end <= s.start ||
  !cuts.some(
    (c) =>
      c.clip === s.clip &&
      Math.min(s.end, c.endSeconds) - Math.max(s.start, c.startSeconds) > 0,
  );

const SHORTCUTS: Array<[string, string]> = [
  ["← →", "corte anterior / siguiente"],
  ["S", "dividir en el playhead"],
  ["⌫", "borrar el corte"],
  ["[  ]", "recortar inicio / fin 0.1 s"],
  ["Z", "deshacer"],
  ["⇧ Z", "rehacer"],
  ["Esc", "quitar selección"],
];

/**
 * Editor de cortes dentro del propio preview, con timeline, inspector y
 * editor de encuadres. Cada boton reescribe los props de Root.tsx con
 * saveDefaultProps(), la misma via por la que Studio guarda los sliders: no
 * hay estado paralelo que se pueda desincronizar del archivo.
 *
 * Solo se monta en Studio (`getRemotionEnvironment().isStudio`), asi que no
 * hay manera de que se cuele en un render aunque dejes el prop encendido.
 */
export const ReelEditor: React.FC<{
  cuts: Cut[];
  shots: ReelProps["prizeShots"];
  selected: number | null;
  onSelect: (i: number | null) => void;
}> = ({cuts, shots, selected, onSelect}) => {
  const frame = useCurrentFrame();
  const [showKeys, setShowKeys] = React.useState(false);
  const [dockOpen, setDockOpen] = React.useState(true);

  useClicksReachTheCanvas(true);
  useStudioJsonPanelCollapsed(true);
  useReservedDockSpace(dockOpen);

  // Contenedor del portal: un div propio colgado de <body>. El dock se dibuja
  // ahi, en pixeles de pantalla y fuera del canvas 9:16, para no tapar el
  // video. Al vivir en el mismo arbol de React (via createPortal) los contextos
  // de Remotion siguen fluyendo: useCurrentFrame se actualiza en reproduccion.
  // Se crea al montar y se elimina al desmontar, sin fugas en hot-reload.
  const portalRef = React.useRef<HTMLDivElement | null>(null);
  if (portalRef.current === null && typeof document !== "undefined") {
    const el = document.createElement("div");
    el.setAttribute("data-rne-dock-root", "");
    portalRef.current = el;
  }
  React.useEffect(() => {
    const el = portalRef.current;
    if (!el) return;
    document.body.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);

  // Historial de verdad: cada mutacion (cortes O encuadres) guarda la foto
  // completa, asi deshacer tambien revierte pins y limpiezas. `future` da el
  // rehacer; se vacia en cuanto llega un cambio nuevo.
  type Snapshot = {cuts: Cut[]; prizeShots: Shot[]};
  const past = React.useRef<Snapshot[]>([]);
  const future = React.useRef<Snapshot[]>([]);

  const starts = React.useMemo(
    () => cuts.map((_, i) => cutStartFrame(cuts, i)),
    [cuts],
  );
  const resolved = React.useMemo(() => resolveShots(cuts, shots), [cuts, shots]);

  /** El corte bajo el cursor de reproduccion; null en la entrada o la salida. */
  const playing = React.useMemo(() => {
    const i = starts.findIndex(
      (s, k) => frame >= s && frame < s + cutFrames(cuts[k]),
    );
    return i === -1 ? null : i;
  }, [starts, cuts, frame]);

  const commit = React.useCallback(
    (
      patch: Partial<Snapshot>,
      opts: {focus?: number | null; seek?: number | null} = {},
    ) => {
      past.current.push({cuts, prizeShots: shots});
      future.current = [];
      persistProps(patch);
      if (opts.focus !== undefined) onSelect(opts.focus);
      if (opts.seek !== undefined && opts.seek !== null) seekTo(opts.seek);
    },
    [cuts, shots, onSelect],
  );

  const undo = React.useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push({cuts, prizeShots: shots});
    persistProps(prev);
    if (selected !== null && selected >= prev.cuts.length) {
      onSelect(prev.cuts.length > 0 ? prev.cuts.length - 1 : null);
    }
  }, [cuts, shots, selected, onSelect]);

  const redo = React.useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push({cuts, prizeShots: shots});
    persistProps(next);
    if (selected !== null && selected >= next.cuts.length) {
      onSelect(next.cuts.length > 0 ? next.cuts.length - 1 : null);
    }
  }, [cuts, shots, selected, onSelect]);

  const cut = selected === null ? null : cuts[selected];

  // Cuadro del reel en que estas parado dentro del corte seleccionado, si es
  // que el cursor esta dentro de el. Es lo que permite partirlo por aqui.
  const insideSelected = selected !== null && playing === selected;
  const sourceT =
    cut && insideSelected
      ? cut.startSeconds + (frame - starts[selected as number]) / REEL_FPS
      : null;

  // ---------------------------------------------------------- acciones corte

  const selectCut = (i: number) => {
    onSelect(i);
    seekTo(starts[i]);
  };

  const trimStart = (d: number) => {
    if (selected === null || !cut) return;
    const startSeconds = clamp(
      Number((cut.startSeconds + d).toFixed(2)),
      0,
      cut.endSeconds - MIN_CUT_SECONDS,
    );
    const next = cuts.map((c, i) =>
      i === selected ? {...c, startSeconds} : c,
    );
    commit({cuts: next}, {focus: selected, seek: cutStartFrame(next, selected)});
  };

  const trimEnd = (d: number) => {
    if (selected === null || !cut) return;
    const endSeconds = Math.max(
      cut.startSeconds + MIN_CUT_SECONDS,
      Number((cut.endSeconds + d).toFixed(2)),
    );
    const next = cuts.map((c, i) => (i === selected ? {...c, endSeconds} : c));
    // Salta al ultimo cuadro del corte: es donde se aprecia el nuevo fin.
    commit(
      {cuts: next},
      {
        focus: selected,
        seek: cutStartFrame(next, selected) + cutFrames(next[selected]) - 1,
      },
    );
  };

  const canSplit =
    cut !== null &&
    sourceT !== null &&
    sourceT - cut.startSeconds >= MIN_CUT_SECONDS &&
    cut.endSeconds - sourceT >= MIN_CUT_SECONDS;

  const split = () => {
    if (selected === null || !cut || sourceT === null || !canSplit) return;
    const left = {...cut, endSeconds: Number(sourceT.toFixed(2))};
    const right = {...cut, startSeconds: Number(sourceT.toFixed(2))};
    const next = [...cuts];
    next.splice(selected, 1, left, right);
    // Sin seek: el playhead ya esta exactamente en el punto de corte.
    commit({cuts: next}, {focus: selected});
  };

  const move = (d: -1 | 1) => {
    if (selected === null) return;
    const to = selected + d;
    if (to < 0 || to >= cuts.length) return;
    const next = [...cuts];
    [next[selected], next[to]] = [next[to], next[selected]];
    commit({cuts: next}, {focus: to, seek: cutStartFrame(next, to)});
  };

  const removeCut = () => {
    if (selected === null) return;
    const next = cuts.filter((_, i) => i !== selected);
    // Deja seleccionado el corte que ocupa ahora ese hueco, para poder ir
    // borrando en cadena sin tener que volver a apuntar.
    const focus = next.length === 0 ? null : Math.min(selected, next.length - 1);
    commit(
      {cuts: next},
      {focus, seek: focus === null ? null : cutStartFrame(next, focus)},
    );
  };

  // ------------------------------------ acciones corte por indice (DataPanel)
  //
  // El inspector opera siempre sobre el corte seleccionado; el Panel de Datos
  // edita cualquier fila a la vez, asi que necesita variantes por indice. Todas
  // pasan por `commit`, o sea que comparten el mismo undo/redo y autoguardado.

  const setCutStartAt = (i: number, value: number) => {
    const c = cuts[i];
    if (!c) return;
    const startSeconds = clamp(
      Number(value.toFixed(2)),
      0,
      c.endSeconds - MIN_CUT_SECONDS,
    );
    const next = cuts.map((x, k) => (k === i ? {...x, startSeconds} : x));
    commit({cuts: next}, {focus: i, seek: cutStartFrame(next, i)});
  };

  const setCutEndAt = (i: number, value: number) => {
    const c = cuts[i];
    if (!c) return;
    const endSeconds = clamp(
      Number(value.toFixed(2)),
      c.startSeconds + MIN_CUT_SECONDS,
      90,
    );
    const next = cuts.map((x, k) => (k === i ? {...x, endSeconds} : x));
    commit(
      {cuts: next},
      {focus: i, seek: cutStartFrame(next, i) + cutFrames(next[i]) - 1},
    );
  };

  const removeCutAt = (i: number) => {
    const next = cuts.filter((_, k) => k !== i);
    const focus = next.length === 0 ? null : Math.min(i, next.length - 1);
    commit(
      {cuts: next},
      {focus, seek: focus === null ? null : cutStartFrame(next, focus)},
    );
  };

  /**
   * Anade un corte RELLENO, nunca vacio: duplica el seleccionado (o el ultimo)
   * arrancando donde ese acaba y con 1 s de largo. Asi la fila nueva ya se ve
   * en el video en vez de nacer en 0→0 sin material.
   */
  const addCut = () => {
    const base = selected !== null ? cuts[selected] : cuts[cuts.length - 1];
    const startSeconds = base ? Number(base.endSeconds.toFixed(2)) : 0;
    const entry: Cut = {
      clip: base ? base.clip : "assets/nebraska01.mp4",
      startSeconds,
      endSeconds: Number((startSeconds + 1).toFixed(2)),
    };
    const insertAt = selected !== null ? selected + 1 : cuts.length;
    const next = [...cuts];
    next.splice(insertAt, 0, entry);
    commit({cuts: next}, {focus: insertAt, seek: cutStartFrame(next, insertAt)});
  };

  // ------------------------------------------------------- acciones encuadre

  // `resolveShots` devuelve los objetos tal cual salen de `prizeShots`, asi
  // que indexOf da la posicion real en el array: es la ruta que necesita el
  // panel de Studio para resaltar la entrada correcta.
  const shot = selected === null ? null : resolved[selected];
  const shotIndex = shot === null ? -1 : shots.indexOf(shot);

  // El punto de referencia para "donde esta la cara": el playhead si esta
  // dentro del corte, o el punto medio si no.
  const refT =
    cut === null
      ? 0
      : sourceT ?? (cut.startSeconds + cut.endSeconds) / 2;
  const faceCx = cut === null ? 0.5 : faceAt(clipOf(cut), refT);

  /**
   * Fija el encuadre de este corte. Nace ya relleno con el clip y los segundos
   * del corte, y con el cx donde esta la cara a mitad de la toma: si lo creas
   * desde el panel de Studio con el boton "+" salen `start` y `end` en 0, la
   * entrada no cubre nada y no hace absolutamente nada, sin avisar de por que.
   *
   * Un corte con encuadre fijo deja de perseguir la cara, que es justo lo que
   * quita el balanceo cuando el rastreo viene nervioso.
   */
  const pinShot = () => {
    if (selected === null || !cut) return;
    const middle = (cut.startSeconds + cut.endSeconds) / 2;
    const cx = clamp(Number(faceAt(clipOf(cut), middle).toFixed(2)), 0.16, 0.84);
    const next = [
      ...shots,
      {
        label: `${cut.clip.replace("assets/", "").replace(".mp4", "")} · corte ${selected + 1}`,
        clip: cut.clip,
        cx,
        start: cut.startSeconds,
        end: cut.endSeconds,
      },
    ];
    commit({prizeShots: next});
    showInJson(["prizeShots", next.length - 1]);
  };

  const setShotCx = (cx: number) => {
    if (shotIndex === -1) return;
    const next = shots.map((s, i) =>
      i === shotIndex
        ? {...s, cx: clamp(Number(cx.toFixed(2)), 0.16, 0.84)}
        : s,
    );
    commit({prizeShots: next});
  };

  const unpinShot = () => {
    if (shotIndex === -1) return;
    commit({prizeShots: shots.filter((_, i) => i !== shotIndex)});
  };

  // ---------------------------------- acciones encuadre por indice (DataPanel)

  const setShotLabelAt = (i: number, label: string) => {
    if (!shots[i]) return;
    commit({prizeShots: shots.map((s, k) => (k === i ? {...s, label} : s))});
  };

  const setShotFieldAt = (
    i: number,
    field: "cx" | "start" | "end",
    value: number,
  ) => {
    if (!shots[i]) return;
    const v =
      field === "cx"
        ? clamp(Number(value.toFixed(2)), 0.16, 0.84)
        : clamp(Number(value.toFixed(2)), 0, 90);
    commit({prizeShots: shots.map((s, k) => (k === i ? {...s, [field]: v} : s))});
  };

  const removeShotAt = (i: number) => {
    if (!shots[i]) return;
    commit({prizeShots: shots.filter((_, k) => k !== i)});
  };

  // -------------------------------------------------------------- saneador

  const deadCount = React.useMemo(
    () => shots.reduce((n, s) => n + (isDeadShot(s, cuts) ? 1 : 0), 0),
    [shots, cuts],
  );

  const cleanDeadShots = () => {
    if (deadCount === 0) return;
    commit({prizeShots: shots.filter((s) => !isDeadShot(s, cuts))});
  };

  // ---------------------------------------------------------------- teclado

  const selectStep = (d: -1 | 1) => {
    if (cuts.length === 0) return;
    const base =
      selected ?? playing ?? (d === 1 ? -1 : cuts.length);
    const to = clamp(base + d, 0, cuts.length - 1);
    selectCut(to);
  };

  // Los handlers cambian en cada render (capturan props frescos); el listener
  // se registra una sola vez y lee la version vigente a traves del ref.
  const keysApi = {
    selectStep,
    split,
    removeCut,
    undo,
    redo,
    trimStart,
    trimEnd,
    deselect: () => onSelect(null),
    hasSelection: selected !== null,
  };
  const keysRef = React.useRef(keysApi);
  keysRef.current = keysApi;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // No pisar los atajos de Studio (⌘Z, ⌘S, espacio...) ni robar teclas
      // mientras se escribe en el panel de props.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      ) {
        return;
      }
      const api = keysRef.current;
      switch (e.key) {
        case "ArrowLeft":
          api.selectStep(-1);
          break;
        case "ArrowRight":
          api.selectStep(1);
          break;
        case "s":
          api.split();
          break;
        case "Backspace":
        case "Delete":
          api.removeCut();
          break;
        case "z":
          api.undo();
          break;
        case "Z":
          api.redo();
          break;
        case "[":
          api.trimStart(+NUDGE_SECONDS);
          break;
        case "]":
          api.trimEnd(-NUDGE_SECONDS);
          break;
        case "Escape":
          if (!api.hasSelection) return;
          api.deselect();
          break;
        default:
          return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, {capture: true});
    return () =>
      window.removeEventListener("keydown", onKey, {capture: true});
  }, []);

  // ------------------------------------------------ sincronia panel de Studio
  //
  // Cuando cambia el corte seleccionado, salta el panel de props de Studio a
  // esa misma entrada (`cuts[i]`), asi el JSON crudo queda apuntando a lo que
  // se esta editando aqui. Con debounce para no dispararlo en cada flecha, y
  // NUNCA si el foco esta en un input (robaria el cursor mientras se escribe).
  React.useEffect(() => {
    if (selected === null || selected >= cuts.length) return;
    const id = window.setTimeout(() => {
      const a = document.activeElement as HTMLElement | null;
      if (
        a &&
        (a.tagName === "INPUT" ||
          a.tagName === "TEXTAREA" ||
          a.isContentEditable)
      ) {
        return;
      }
      syncJsonHighlight(["cuts", selected]);
    }, 400);
    return () => window.clearTimeout(id);
    // Solo depende de la seleccion: seguir cuts aqui lo relanzaria en cada
    // tecleo de un input y volveria a robar el foco.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // ----------------------------------------------------------------- render

  const bodySeconds = bodyFrames(cuts) / REEL_FPS;
  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  // Cabecera del dock: identidad, resumen, undo/redo, atajos, saneador y el
  // boton que contrae el dock entero.
  const header = (
    <div
      style={{
        ...panelStyle,
        display: "flex",
        flexDirection: "column",
        gap: 9,
        padding: "10px 12px",
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 9}}>
        <span style={{color: UI.accent, display: "inline-flex", flexShrink: 0}}>
          <IcScissors size={22} />
        </span>
        <div style={{minWidth: 0, flex: 1}}>
          <div
            style={{
              fontFamily: UI.font,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 1,
              color: UI.text,
            }}
          >
            EDITOR DE CORTES
          </div>
          <div style={{fontFamily: UI.mono, fontSize: 14, color: UI.textDim}}>
            Rifa Nebraska · {cuts.length} cortes · {bodySeconds.toFixed(1)} s
          </div>
        </div>
        <Btn
          square
          title="Contraer el panel (deja el video libre)"
          onClick={() => setDockOpen(false)}
          icon={<IcChevronR size={22} />}
        />
      </div>

      <div style={{display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap"}}>
        <Btn
          square
          title="Deshacer (Z)"
          onClick={undo}
          disabled={!canUndo}
          icon={<IcUndo size={22} />}
        />
        <Btn
          square
          title="Rehacer (⇧Z)"
          onClick={redo}
          disabled={!canRedo}
          icon={<IcRedo size={22} />}
        />
        <Btn
          square
          title="Atajos de teclado"
          active={showKeys}
          onClick={() => setShowKeys((v) => !v)}
          icon={<IcKeyboard size={22} />}
        />
        <div style={{flex: 1}} />
        {deadCount > 0 ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "4px 6px 4px 11px",
              borderRadius: 999,
              background: "rgba(245,183,78,0.12)",
              border: `1px solid rgba(245,183,78,0.45)`,
            }}
          >
            <span style={{color: UI.warn, display: "inline-flex"}}>
              <IcWarn size={16} />
            </span>
            <span
              style={{
                fontFamily: UI.font,
                fontSize: 13,
                fontWeight: 600,
                color: UI.warn,
              }}
            >
              {deadCount} muerto{deadCount > 1 ? "s" : ""}
            </span>
            <Btn
              title="Eliminar los encuadres que ya no tocan ningún corte"
              onClick={cleanDeadShots}
              icon={<IcBroom size={22} />}
            >
              limpiar
            </Btn>
          </span>
        ) : null}
      </div>
    </div>
  );

  // Contenido del dock, autorado en px "virtuales" y encogido por `zoom` a
  // tamaños reales de pantalla (~12 px de fuente base) en el contenedor de
  // abajo.
  const dockBody = (
    <div
      style={{
        zoom: DOCK.zoom,
        width: DOCK_VIRTUAL_W,
        padding: DOCK.pad,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: UI.font,
        // Estira hasta el fondo del dock para que el Panel de Datos (flex:1)
        // aproveche toda la altura; sin esto quedaba aire muerto debajo.
        flex: 1,
        minHeight: 0,
      }}
    >
      {header}

      {cut !== null && selected !== null ? (
        <Inspector
          cut={cut}
          index={selected}
          count={cuts.length}
          sourceT={sourceT}
          faceCx={faceCx}
          shot={shot}
          shotIndex={shotIndex}
          canSplit={canSplit}
          canUndo={canUndo}
          canRedo={canRedo}
          onTrimStart={trimStart}
          onTrimEnd={trimEnd}
          onSplit={split}
          onMove={move}
          onRemove={removeCut}
          onUndo={undo}
          onRedo={redo}
          onPinShot={pinShot}
          onSetShotCx={setShotCx}
          onCenterFace={() => setShotCx(faceCx)}
          onShowJson={() => showInJson(["prizeShots", shotIndex])}
          onUnpinShot={unpinShot}
          onDeselect={() => onSelect(null)}
        />
      ) : (
        <div
          style={{
            ...panelStyle,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 18px",
            fontFamily: UI.font,
            fontSize: 21,
            color: UI.textDim,
          }}
        >
          <span style={{color: UI.accent, display: "inline-flex", flexShrink: 0}}>
            <IcCursor size={24} />
          </span>
          Haz clic en el video o en un bloque del timeline para seleccionar un
          corte
        </div>
      )}

      {/* Panel de Datos: siempre accesible, con su propio scroll. */}
      <DataPanel
        cuts={cuts}
        shots={shots}
        resolved={resolved}
        selected={selected}
        playing={playing}
        onSelectCut={selectCut}
        onSetCutStart={setCutStartAt}
        onSetCutEnd={setCutEndAt}
        onRemoveCut={removeCutAt}
        onAddCut={addCut}
        onSetShotLabel={setShotLabelAt}
        onSetShotCx={(i, v) => setShotFieldAt(i, "cx", v)}
        onSetShotStart={(i, v) => setShotFieldAt(i, "start", v)}
        onSetShotEnd={(i, v) => setShotFieldAt(i, "end", v)}
        onRemoveShot={removeShotAt}
        onShowShotJson={(i) => showInJson(["prizeShots", i])}
        onAddShot={pinShot}
        canAddShot={selected !== null}
      />

      {/* Leyenda de atajos, colapsable desde la cabecera. */}
      {showKeys ? (
        <div style={{...panelStyle, padding: "16px 20px"}}>
          <div style={{...sectionLabel, marginBottom: 12}}>Atajos de teclado</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "10px 18px",
              alignItems: "center",
            }}
          >
            {SHORTCUTS.map(([key, desc]) => (
              <React.Fragment key={key}>
                <Kbd>{key}</Kbd>
                <span
                  style={{fontFamily: UI.font, fontSize: 20, color: UI.textDim}}
                >
                  {desc}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  const dock = dockOpen ? (
    <div
      className="rne"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: DOCK.top,
        right: 0,
        bottom: 0,
        width: DOCK.width,
        zIndex: DOCK.z,
        display: "flex",
        flexDirection: "column",
        background: UI.bg,
        borderLeft: UI.border,
        boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        fontFamily: UI.font,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {dockBody}
      </div>
    </div>
  ) : (
    // Pestañita para reabrir el dock: el video queda 100 % libre.
    <button
      type="button"
      className="rne rne-btn"
      title="Abrir el editor de cortes"
      onClick={() => setDockOpen(true)}
      style={{
        position: "fixed",
        top: DOCK.top + 18,
        right: 0,
        zIndex: DOCK.z,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "16px 10px",
        border: UI.border,
        borderRight: "none",
        borderRadius: "14px 0 0 14px",
        background: UI.bg,
        color: UI.accent,
        cursor: "pointer",
        boxShadow: UI.shadow,
        pointerEvents: "auto",
      }}
    >
      <IcChevronL size={22} />
      <IcScissors size={22} />
      <span
        style={{
          writingMode: "vertical-rl",
          fontFamily: UI.font,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 2,
          color: UI.textDim,
        }}
      >
        EDITOR
      </span>
    </button>
  );

  return (
    <AbsoluteFill style={{pointerEvents: "none", fontFamily: UI.font}}>
      <EditorStyles />

      {/* Capa de seleccion: un clic en el video toma el corte que se ve. */}
      <div
        onClick={() => onSelect(playing)}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "auto",
          cursor: playing === null ? "default" : "pointer",
        }}
      />

      {/* En el canvas queda solo lo espacial: la tira delgada de cortes. */}
      <Timeline
        cuts={cuts}
        starts={starts}
        selected={selected}
        playing={playing}
        frame={frame}
        onSelectCut={selectCut}
        onSeek={(f) => seekTo(f)}
        onDeselect={() => onSelect(null)}
      />

      {/* El resto de la UI vive en un dock fijo fuera del canvas (portal). */}
      {portalRef.current ? createPortal(dock, portalRef.current) : null}
    </AbsoluteFill>
  );
};
