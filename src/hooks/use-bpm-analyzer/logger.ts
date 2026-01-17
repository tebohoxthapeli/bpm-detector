const DEBUG = true;

function formatArg(arg: unknown): unknown {
  if (arg === null || arg === undefined) {
    return arg;
  }

  if (typeof arg === 'object') {
    return JSON.stringify(arg, null, 2);
  }

  return arg;
}

function formatArgs(args: unknown[]): unknown[] {
  return args.map(formatArg);
}

export const logger = {
  error: (...args: unknown[]) =>
    DEBUG && console.error('[BPM]', ...formatArgs(args)),
  log: (...args: unknown[]) =>
    DEBUG && console.log('[BPM]', ...formatArgs(args)),
};
