import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";

export function ramp(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export const projectTour = ["software-factory", "kivilcim", "jointledger", "dropspot"] as const;
export type TourProject = (typeof projectTour)[number];

/** Keep both reading positions clear, in either direction of travel. */
export function signalPhase(progress: number, mobile: boolean, from: TourProject, to: TourProject) {
  const departure = sceneFocusProgress(from, mobile);
  const arrival = sceneFocusProgress(to, mobile);
  return ((progress - departure) / (arrival - departure) - 0.14) / 0.82;
}
