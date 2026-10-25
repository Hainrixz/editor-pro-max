// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill} from "remotion";

export interface SafeAreaProps {
  children: React.ReactNode;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: React.CSSProperties;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  paddingHorizontal = 60,
  paddingVertical = 60,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        padding: `${paddingVertical}px ${paddingHorizontal}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
