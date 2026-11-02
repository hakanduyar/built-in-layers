import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";

export function ramp(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

/** Keep both reading positions clear, in either direction of travel. */
export function signalPhase(progress: number, mobile = false) {
  const departure = sceneFocusProgress("jointledger", mobile);
  const arrival = sceneFocusProgress("dropspot", mobile);
  return ((progress - departure) / (arrival - departure) - 0.14) / 0.82;
}
