let shuttingDown = false;

export function isServiceReady(): boolean {
  return !shuttingDown;
}

export function markShuttingDown(): void {
  shuttingDown = true;
}

export function resetReadiness(): void {
  shuttingDown = false;
}
