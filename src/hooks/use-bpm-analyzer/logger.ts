const DEBUG = false;

export const logger = {
  error: (...args: unknown[]) => DEBUG && console.error('[BPM]', ...args),
  log: (...args: unknown[]) => DEBUG && console.log('[BPM]', ...args),
};
