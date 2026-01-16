import type { BpmCandidates } from 'realtime-bpm-analyzer';

export function isValidBpmData(data: BpmCandidates): boolean {
  const tempo = data.bpm?.[0]?.tempo;
  return (
    Array.isArray(data.bpm)
    && data.bpm.length > 0
    && typeof tempo === 'number'
    && !Number.isNaN(tempo)
    && tempo > 0
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (
      error.name === 'NotAllowedError'
      || error.name === 'PermissionDeniedError'
    ) {
      return 'Microphone access denied. Please allow microphone access.';
    }

    if (error.name === 'NotFoundError') {
      return 'No microphone found. Please connect a microphone.';
    }

    if (error.name === 'NotSupportedError') {
      return 'Microphone not supported in this browser.';
    }
  }

  return 'An error occurred';
}
