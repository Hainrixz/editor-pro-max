// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import {PALETTES, type PaletteKey, type Palette} from "../presets/colors";

export const useColorScheme = (palette: PaletteKey = "dark"): Palette => {
  return PALETTES[palette];
};
