import {REEL_ID, type ReelProps} from "../../compositions/RifaNebraskaReel";

/**
 * @remotion/studio SOLO por import dinamico: el paquete no existe en el
 * bundle de render y un import estatico lo arrastraria. Estas funciones solo
 * se llaman desde el editor, que solo se monta dentro de Studio.
 */
const studio = () => import("@remotion/studio");

/** Escribe props en Root.tsx conservando lo que haya sin guardar en el panel. */
export const persistProps = async (patch: Partial<ReelProps>) => {
  const {saveDefaultProps} = await studio();
  await saveDefaultProps({
    compositionId: REEL_ID,
    defaultProps: ({unsavedDefaultProps}) => ({...unsavedDefaultProps, ...patch}),
  });
};

export const seekTo = async (frame: number) => {
  const {seek} = await studio();
  seek(frame);
};

/**
 * Resalta esa entrada en el panel de props de Studio SI esta visible.
 * focusDefaultPropsPath opera sobre el DOM: con la barra derecha cerrada
 * (el editor la colapsa al montar) no encuentra nada y devuelve
 * success:false sin efectos. Ideal para la sincronia pasiva de la seleccion,
 * que no debe reabrir el panel.
 */
export const syncJsonHighlight = async (path: (string | number)[]) => {
  const {focusDefaultPropsPath} = await studio();
  return focusDefaultPropsPath({path}).success;
};

/**
 * Accion explicita "ver en JSON": si la barra derecha esta cerrada, la abre
 * con su boton de toggle y reintenta el resaltado hasta que el panel monte.
 */
export const showInJson = async (path: (string | number)[]) => {
  if (await syncJsonHighlight(path)) return;
  document
    .querySelector<HTMLElement>('[title^="Toggle Right Sidebar"]')
    ?.click();
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await syncJsonHighlight(path)) return;
  }
};
