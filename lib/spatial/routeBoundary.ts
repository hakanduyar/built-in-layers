/** Native contribution across the finite handoff band. Sample the gesture's
 * midpoint so an upward notch enters the blend continuously from native space.
 * The route side is always zero; no route budget or lead constant changes. */
export function boundaryNativeShare(y: number, delta: number, end: number, band: number): number {
  const position = y + Math.min(delta, 0) / 2;
  const t = Math.max(0, Math.min(1, (position - end) / band));
  return t * t * (3 - 2 * t);
}
