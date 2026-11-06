import type { CSSProperties } from 'react';
// import type { Listing, Unit } from '../api/types';

const DEFAULT_PALETTE = ['#B89B72', '#B5785B', '#8C9466', '#8E8A80', '#A07850', '#7E9480', '#A69A6A'];

/** A unit's own colour, else the listing palette by position, else the default palette. */
export function unitColor(): string {
  // if (unit.color) return unit.color;
  // const palette = listing.palette?.length ? listing.palette : DEFAULT_PALETTE;
  // const position = listing.units.findIndex((u) => u.id === unit.id);
  // return palette[Math.max(0, position) % palette.length];
  return DEFAULT_PALETTE[Math.floor(Math.random() * DEFAULT_PALETTE.length)];
}

/**
 * Blends two hex colours. `amount` is how much of `a` to keep (0–1).
 * Done here rather than with CSS color-mix() so older phones get the same colours.
 */
export function mixColors(a: string, b: string, amount: number): string {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  const mix = (x: number, y: number) => Math.round(x * amount + y * (1 - amount));
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

/** Light tint used for card backgrounds. */
export const softTint = (color: string) => mixColors(color, '#ffffff', 0.28);

/**
 * CSS variables that tint the page to the chosen unit:
 *   --accent         solid colour (slider handle, chips)
 *   --accent-soft    light tint (cards)
 *   --accent-strong  darker shade (deposit bar in the chart)
 */
export function accentVars(color: string): CSSProperties {
  return {
    '--accent': color,
    '--accent-soft': softTint(color),
    '--accent-strong': mixColors(color, '#14141a', 0.8),
  } as CSSProperties;
}

/** "#B89B72" or "#BBB" → [184, 155, 114]. Anything else falls back to grey. */
function toRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [200, 200, 200];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
