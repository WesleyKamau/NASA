// Simple shared scheduler for SLS launches
// Keeps a single source of truth for the next launch timestamp so other components can sync.

let nextLaunchTimestamp: number | null = null;
const listeners = new Set<(ts: number) => void>();

export function getNextLaunchTimestamp() {
  return nextLaunchTimestamp;
}

export function setNextLaunchTimestamp(timestamp: number) {
  nextLaunchTimestamp = timestamp;
  listeners.forEach((listener) => listener(timestamp));
}

export function subscribeToNextLaunch(listener: (ts: number) => void) {
  listeners.add(listener);
  if (nextLaunchTimestamp !== null) {
    listener(nextLaunchTimestamp);
  }
  return () => listeners.delete(listener);
}
