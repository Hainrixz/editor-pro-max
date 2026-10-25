// Copyright (c) 2026 Enrique Rocha (@soyenriquerocha)
// SPDX-License-Identifier: MIT
// id: er-be2c9690
import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

// Deterministic pseudo-random number generator
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const generateParticles = (count: number, width: number, height: number): Particle[] => {
  return Array.from({length: count}, (_, i) => ({
    x: seededRandom(i * 3 + 1) * width,
    y: seededRandom(i * 3 + 2) * height,
    size: 2 + seededRandom(i * 3 + 3) * 4,
    speed: 0.2 + seededRandom(i * 3 + 4) * 0.8,
    opacity: 0.2 + seededRandom(i * 3 + 5) * 0.6,
  }));
};

export interface ParticleFieldProps {
  count?: number;
  color?: string;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  style?: React.CSSProperties;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 50,
  color = "rgba(255,255,255,0.5)",
  speed = 1,
  direction = "up",
  style,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const particles = React.useMemo(
    () => generateParticles(count, width, height),
    [count, width, height],
  );

  return (
    <AbsoluteFill style={style}>
      <svg width={width} height={height}>
        {particles.map((p, i) => {
          const movement = frame * p.speed * speed;
          let cx = p.x;
          let cy = p.y;

          switch (direction) {
            case "up":
              cy = ((p.y - movement) % height + height) % height;
              break;
            case "down":
              cy = (p.y + movement) % height;
              break;
            case "left":
              cx = ((p.x - movement) % width + width) % width;
              break;
            case "right":
              cx = (p.x + movement) % width;
              break;
          }

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={p.size}
              fill={color}
              opacity={p.opacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
