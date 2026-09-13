/** Read-only bridge from the camera's filtered MotionValue to the instrument. */
let progress = 0;
const listeners = new Set<() => void>();
export const readRoutePresentation = () => progress;
export function publishRoutePresentation(value: number) {
  progress = value;
  listeners.forEach((listener) => listener());
}
export function subscribeRoutePresentation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
