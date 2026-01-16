export type BpmStatus = 'idle' | 'listening' | 'detected' | 'error';

export type BpmState = {
  bpm: number | null;
  status: BpmStatus;
  error: string | null;
};

export type UseBPMAnalyzerOptions = {
  detectionTimeout?: number;
};
