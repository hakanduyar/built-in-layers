/** Desktop wheel delivery only; the camera filter and intent target are unchanged. */
export const LOWER_WORLD_CEILING_RATIO = 0.85;

/** Ease the first 70ms and the last few pixels of an intent, within its budget.
 * No velocity is stored: reversing an intent reverses the next frame immediately.
 * The one-pixel tail floor prevents rounded scroll writes from stalling forever.
 */
export function wheelMotionStep(
  remaining: number,
  budget: number,
  dtMs: number,
  ageMs: number,
): number {
  if (dtMs <= 0 || budget <= 0 || ageMs <= 0) return 0;
  const onset = Math.min(ageMs / 70, 1);
  const tail = Math.max(1, Math.abs(remaining) * -Math.expm1(-dtMs / 55));
  return Math.sign(remaining) * Math.min(Math.abs(remaining), budget * onset, tail);
}
