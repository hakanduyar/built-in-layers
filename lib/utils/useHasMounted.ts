import { useSyncExternalStore } from "react";

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// `subscribe` must actually notify React once, right after hydration commits,
// or `useSyncExternalStore` never re-checks the snapshot and stays on the
// server value forever -- confirmed empirically: a no-op subscribe left this
// permanently `false` in a real hydrated production page (Playwright caught
// it directly; jsdom/RTL never would have, since `render()` uses `createRoot`
// -- no `getServerSnapshot` phase to transition out of -- and reported
// `true` immediately regardless of this bug). `setTimeout(fn, 0)` is the
// scheduled notification; it fires once, shortly after mount, telling React
// to re-read `getClientSnapshot()` and re-render with the client value.
function subscribe(onStoreChange: () => void): () => void {
  const timeoutId = setTimeout(onStoreChange, 0);
  return () => clearTimeout(timeoutId);
}

/**
 * Returns `false` during SSR and the first client render (identical output,
 * no hydration mismatch), then `true` shortly after hydration commits. The
 * hydration-safe replacement for the `useState` +
 * `useEffect(() => setMounted(true), [])` pattern, which
 * `react-hooks/set-state-in-effect` correctly flags as a cascading-render
 * anti-pattern -- `useSyncExternalStore` reports the client/server
 * distinction natively instead of setting state from inside an effect body.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
