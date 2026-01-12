import { useCallback, useEffect, useRef, useState } from 'react';
import type { BpmAnalyzer, BpmCandidates } from 'realtime-bpm-analyzer';
import { createRealtimeBpmAnalyzer } from 'realtime-bpm-analyzer';

export function useBPMAnalyzer(options: UseBPMAnalyzerOptions = {}) {
  const { detectionTimeout = 15000 } = options;

  const [bpmState, setBpmState] = useState<BpmState>({
    bpm: null,
    error: null,
    status: 'idle',
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<BpmAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopListening = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop analyzer (this also removes internal event listeners)
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current.disconnect();
      analyzerRef.current = null;
    }

    // Disconnect source node
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Stop media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });

      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
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
  }, []);

  const handleBpmDetection = useCallback(
    (data: BpmCandidates) => {
      // Validate that we have valid BPM data
      if (
        !data.bpm
        || !Array.isArray(data.bpm)
        || data.bpm.length === 0
        || !data.bpm[0]
        || typeof data.bpm[0].tempo !== 'number'
        || Number.isNaN(data.bpm[0].tempo)
        || data.bpm[0].tempo <= 0
      ) {
        return;
      }

      const bpm = Math.round(data.bpm[0].tempo);

      setBpmState({
        bpm,
        error: null,
        status: 'detected',
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      stopListening();
    },
    [
      stopListening,
    ]
  );

  const handleDetectionTimeout = useCallback(() => {
    setBpmState({
      bpm: null,
      error: 'Could not detect BPM. Please try again.',
      status: 'error',
    });

    stopListening();
  }, [
    stopListening,
  ]);

  const startListening = useCallback(async () => {
    try {
      setBpmState({
        bpm: null,
        error: null,
        status: 'listening',
      });

      const AudioContextConstructor =
        window.AudioContext
        || (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;

      const audioContext = new AudioContextConstructor();
      audioContextRef.current = audioContext;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyzer = await createRealtimeBpmAnalyzer(audioContext);
      analyzerRef.current = analyzer;

      source.connect(analyzer.node);

      analyzer.on('bpmStable', handleBpmDetection);

      timeoutRef.current = setTimeout(handleDetectionTimeout, detectionTimeout);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      setBpmState({
        bpm: null,
        error: errorMessage,
        status: 'error',
      });

      stopListening();
    }
  }, [
    detectionTimeout,
    getErrorMessage,
    handleBpmDetection,
    handleDetectionTimeout,
    stopListening,
  ]);

  const reset = useCallback(() => {
    stopListening();

    setBpmState({
      bpm: null,
      error: null,
      status: 'idle',
    });
  }, [
    stopListening,
  ]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [
    stopListening,
  ]);

  return {
    bpm: bpmState.bpm,
    error: bpmState.error,
    reset,
    startListening,
    status: bpmState.status,
  };
}

type BpmStatus = 'idle' | 'listening' | 'detected' | 'error';

type BpmState = {
  bpm: number | null;
  status: BpmStatus;
  error: string | null;
};

type UseBPMAnalyzerOptions = {
  detectionTimeout?: number; // in milliseconds
};
