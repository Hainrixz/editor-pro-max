/**
 * `react-dom` no trae tipos propios y este proyecto no instala
 * `@types/react-dom`. El editor in-canvas solo usa `createPortal` (para colgar
 * el dock lateral de <body> sin salir del arbol de React), asi que declaramos
 * unicamente esa firma. Si algun dia se instalan los tipos oficiales, basta
 * con borrar este archivo.
 */
declare module "react-dom" {
  import type {ReactNode, ReactPortal} from "react";
  export function createPortal(
    children: ReactNode,
    container: Element | DocumentFragment,
    key?: string | null,
  ): ReactPortal;
}
