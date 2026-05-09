import { useSyncExternalStore } from "react";
import { NAV_MOBILE_MQ } from "../lib/responsive/breakpoints";

function subscribe(query: string, onStoreChange: () => void) {
  const mq = window.matchMedia(query);
  const onChange = () => onStoreChange();
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }
  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

function getServerSnapshot() {
  return false;
}

/**
 * Client-only breakpoint subscription (SSR / static HTML defaults to `false`).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => window.matchMedia(query).matches,
    getServerSnapshot,
  );
}

export function useNavMobileMatches(): boolean {
  return useMediaQuery(NAV_MOBILE_MQ);
}
