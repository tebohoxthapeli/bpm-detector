import { useCallback, useEffect, useRef, useState } from 'react';
import type { BpmAnalyzer, BpmCandidates } from 'realtime-bpm-analyzer';
import { createRealtimeBpmAnalyzer } from 'realtime-bpm-analyzer';

import { logger } from './logger';
import type { BpmState, UseBPMAnalyzerOptions } from './types';
import { getErrorMessage, isValidBpmData } from './utils';

export function useBPMAnalyzer(options: UseBPMAnalyzerOptions = {}) {
  const { detectionTimeout = 15000 } = options;

  const [bpmState, setBpmState] = useState<BpmState>({
    bpm: null,
    error: null,
    status: 'idle',
  });

  // Core audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<BpmAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Control refs
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const stopListeningRef = useRef<() => Promise<void>>();

  const clearDetectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cleanupAnalyzer = useCallback(() => {
    if (!analyzerRef.current) {
      return;
    }

    try {
      analyzerRef.current.stop();
      analyzerRef.current.disconnect();
    } catch (error) {
      logger.error('Error stopping analyzer:', error);
    }

    analyzerRef.current = null;
  }, []);

  const cleanupSource = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (error) {
        logger.error('Error disconnecting source:', error);
      }
      sourceRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    if (!streamRef.current) {
      return;
    }

    try {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
    } catch (error) {
      logger.error('Error stopping media tracks:', error);
    }

    streamRef.current = null;
  }, []);

  const suspendAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      return;
    }

    try {
      await audioContextRef.current.suspend();
    } catch (error) {
      logger.error('Error suspending audio context:', error);
    }
  }, []);

  const stopListening = useCallback(async () => {
    logger.log('stopListening called');

    if (!isRunningRef.current) {
      return;
    }

    isRunningRef.current = false;

    clearDetectionTimeout();
    cleanupAnalyzer();
    cleanupSource();
    cleanupStream();

    await suspendAudioContext();
    logger.log('stopListening complete');
  }, [
    clearDetectionTimeout,
    cleanupAnalyzer,
    cleanupSource,
    cleanupStream,
    suspendAudioContext,
  ]);

  stopListeningRef.current = stopListening;

  const handleDetectionTimeout = useCallback(async () => {
    logger.log('Detection timeout triggered after', detectionTimeout, 'ms');

    setBpmState({
      bpm: null,
      error: 'Could not detect BPM. Try with clearer rhythm or louder volume.',
      status: 'error',
    });

    await stopListening();
  }, [
    detectionTimeout,
    stopListening,
  ]);

  const startListening = useCallback(async () => {
    logger.log('startListening called, isRunning:', isRunningRef.current);

    if (isRunningRef.current) {
      logger.log('Already running, ignoring');
      return;
    }

    isRunningRef.current = true;

    try {
      setBpmState({
        bpm: null,
        error: null,
        status: 'listening',
      });

      // Get or create AudioContext
      const AudioContextConstructor =
        window.AudioContext
        || (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;

      const audioContext =
        audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = audioContext;

      logger.log('AudioContext state:', audioContext.state);

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        logger.log('AudioContext resumed');
      }

      // Request microphone with processing DISABLED
      // This is critical - we want the raw signal
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      streamRef.current = stream;
      logger.log('Microphone access granted');

      // Create source from microphone
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create BPM analyzer with settings tuned for live audio
      const analyzer = await createRealtimeBpmAnalyzer(audioContext, {
        continuousAnalysis: true,
        stabilizationTime: 5000, // Reduced from 10000 - faster initial detection
      });
      analyzerRef.current = analyzer;

      // Connect source DIRECTLY to analyzer - NO preprocessing
      // The library has its own internal AnalyserNode and frequency analysis
      source.connect(analyzer.node);

      logger.log('Audio graph: source -> analyzer.node (direct connection)');

      // Listen for stable BPM (high confidence)
      analyzer.once('bpmStable', (data: BpmCandidates) => {
        logger.log('bpmStable event:', data);

        if (!isValidBpmData(data)) {
          logger.log('Invalid BPM data in bpmStable, ignoring');
          return;
        }

        const detectedBpm = Math.round(data.bpm[0]?.tempo ?? 0);
        logger.log('Stable BPM detected:', detectedBpm);

        setBpmState({
          bpm: detectedBpm,
          error: null,
          status: 'detected',
        });

        clearDetectionTimeout();
        stopListeningRef.current?.();
      });

      // Listen for intermediate BPM updates (for early detection)
      analyzer.on('bpm', (data: BpmCandidates) => {
        logger.log('bpm event:', data);

        if (!isValidBpmData(data)) {
          return;
        }

        const candidate = data.bpm[0];

        // Only accept if we have enough confidence (count >= 10)
        // Increased from 5 to reduce false positives
        if (candidate && candidate.count >= 10) {
          const detectedBpm = Math.round(candidate.tempo);
          logger.log(
            'Confident BPM detected:',
            detectedBpm,
            'count:',
            candidate.count
          );

          setBpmState({
            bpm: detectedBpm,
            error: null,
            status: 'detected',
          });

          clearDetectionTimeout();
          stopListeningRef.current?.();
        }
      });

      analyzer.on('error', errorData => {
        logger.error('Analyzer error:', errorData.message);
      });

      // Set timeout for detection failure
      timeoutRef.current = setTimeout(handleDetectionTimeout, detectionTimeout);

      logger.log('Detection started, timeout:', detectionTimeout, 'ms');
    } catch (error) {
      logger.error('Error in startListening:', error);

      const errorMessage = getErrorMessage(error);

      setBpmState({
        bpm: null,
        error: errorMessage,
        status: 'error',
      });

      await stopListening();
    }
  }, [
    clearDetectionTimeout,
    detectionTimeout,
    handleDetectionTimeout,
    stopListening,
  ]);

  const stop = useCallback(() => {
    logger.log('[STOP] ===== stop() called =====');
    logger.log('[STOP] isRunningRef.current:', isRunningRef.current);
    logger.log('[STOP] Current bpmState:', bpmState);

    // Set running flag to false immediately
    isRunningRef.current = false;
    logger.log('[STOP] Set isRunningRef to false');

    // Clear timeout
    logger.log('[STOP] Calling clearDetectionTimeout');
    clearDetectionTimeout();

    // Cleanup all resources
    logger.log('[STOP] Calling cleanupAnalyzer');
    cleanupAnalyzer();
    logger.log('[STOP] Calling cleanupSource');
    cleanupSource();
    logger.log('[STOP] Calling cleanupStream');
    cleanupStream();

    // Suspend audio context (fire and forget)
    logger.log('[STOP] Suspending audioContext');
    audioContextRef.current?.suspend();

    // Set state to idle immediately
    logger.log('[STOP] Calling setBpmState to idle');
    setBpmState({
      bpm: null,
      error: null,
      status: 'idle',
    });

    logger.log('[STOP] ===== stop() complete =====');
  }, [
    bpmState,
    clearDetectionTimeout,
    cleanupAnalyzer,
    cleanupSource,
    cleanupStream,
  ]);

  const reset = useCallback(async () => {
    logger.log('reset called');

    await stopListening();

    if (analyzerRef.current) {
      try {
        analyzerRef.current.reset();
      } catch (error) {
        logger.error('Error resetting analyzer:', error);
      }
    }

    setBpmState({
      bpm: null,
      error: null,
      status: 'idle',
    });

    logger.log('reset complete');
  }, [
    stopListening,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logger.log('Component unmounting, cleaning up');

      clearDetectionTimeout();
      cleanupAnalyzer();
      cleanupSource();
      cleanupStream();

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          logger.error('Error closing AudioContext:', error);
        }
        audioContextRef.current = null;
      }

      isRunningRef.current = false;
    };
  }, [
    clearDetectionTimeout,
    cleanupAnalyzer,
    cleanupSource,
    cleanupStream,
  ]);

  return {
    bpm: bpmState.bpm,
    error: bpmState.error,
    reset,
    startListening,
    status: bpmState.status,
    stop,
  };
}

export type { BpmStatus, UseBPMAnalyzerOptions } from './types';
