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

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<BpmAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const stopListeningRef = useRef<() => Promise<void>>();

  logger.log('Component rendering with current state:', bpmState);
  logger.log('isRunning flag:', isRunningRef.current);

  logger.log('Refs state:', {
    analyser: !!analyserRef.current,
    analyzer: !!analyzerRef.current,
    audioContext: !!audioContextRef.current,
    source: !!sourceRef.current,
    stream: !!streamRef.current,
  });

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

  const cleanupAudioNodes = useCallback(() => {
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (error) {
        logger.error('Error disconnecting analyser:', error);
      }

      analyserRef.current = null;
    }

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
    cleanupAudioNodes();
    cleanupStream();

    await suspendAudioContext();
    logger.log('stopListening complete');
  }, [
    clearDetectionTimeout,
    cleanupAnalyzer,
    cleanupAudioNodes,
    cleanupStream,
    suspendAudioContext,
  ]);

  stopListeningRef.current = stopListening;

  const handleDetectionTimeout = useCallback(() => {
    logger.log('==================== TIMEOUT EVENT ====================');
    logger.log('Detection timeout triggered after', detectionTimeout, 'ms');

    setBpmState({
      bpm: null,
      error: 'Could not detect BPM. Please try again with louder volume.',
      status: 'error',
    });

    logger.log('State updated to error');
    logger.log('Calling stopListening to properly cleanup after timeout');

    stopListening();

    logger.log('==================== TIMEOUT COMPLETE ====================');
  }, [
    detectionTimeout,
    stopListening,
  ]);

  const startListening = useCallback(async () => {
    logger.log('==================== START LISTENING ====================');
    logger.log('Start listening called');
    logger.log('Current isRunning flag:', isRunningRef.current);

    if (isRunningRef.current) {
      logger.log('Already running, ignoring start request');
      return;
    }

    isRunningRef.current = true;
    logger.log('Set isRunning to true');

    try {
      logger.log('Setting state to listening');

      setBpmState({
        bpm: null,
        error: null,
        status: 'listening',
      });

      logger.log('Getting AudioContext constructor');

      const AudioContextConstructor =
        window.AudioContext
        || (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;

      logger.log('Checking existing audio context:', !!audioContextRef.current);

      const audioContext =
        audioContextRef.current ?? new AudioContextConstructor();

      audioContextRef.current = audioContext;

      logger.log('Audio context created/reused:', audioContext);
      logger.log('Audio context state:', audioContext.state);

      if (audioContext.state === 'suspended') {
        logger.log('Audio context is suspended, resuming...');
        await audioContext.resume();
        logger.log('Audio context resumed, new state:', audioContext.state);
      } else {
        logger.log(
          'Audio context is not suspended, state:',
          audioContext.state
        );
      }

      logger.log('Requesting microphone access');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      logger.log('Microphone access granted');

      logger.log(
        'Stream tracks:',
        stream.getAudioTracks().map(t => ({
          enabled: t.enabled,
          kind: t.kind,
          label: t.label,
          muted: t.muted,
        }))
      );

      streamRef.current = stream;
      logger.log('Creating media stream source');

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      logger.log('Creating BPM analyzer');

      const analyzer = await createRealtimeBpmAnalyzer(audioContext);
      analyzerRef.current = analyzer;

      logger.log('BPM analyzer created');

      analyzer.on('bpmStable', (data: BpmCandidates) => {
        logger.log('bpmStable event received:', data);

        if (!isValidBpmData(data)) {
          logger.log('Invalid BPM data, ignoring');
          return;
        }

        const bpm = Math.round(data.bpm[0]?.tempo ?? 0);
        logger.log('Valid BPM detected:', bpm);

        setBpmState({
          bpm,
          error: null,
          status: 'detected',
        });

        clearDetectionTimeout();
        stopListeningRef.current?.();
      });

      logger.log('bpmStable event listener attached');
      logger.log('Creating analyser node');

      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserRef.current = analyserNode;

      logger.log('Analyser node created with fftSize:', analyserNode.fftSize);
      logger.log('Connecting audio graph: source -> analyser & analyzer');

      source.connect(analyserNode);
      source.connect(analyzer.node);

      logger.log('Audio graph connected');
      logger.log('Setting detection timeout:', detectionTimeout, 'ms');

      timeoutRef.current = setTimeout(handleDetectionTimeout, detectionTimeout);

      logger.log('Timeout scheduled');
      logger.log('==================== START COMPLETE ====================');

      logger.log('All ref states after start:', {
        analyser: !!analyserRef.current,
        analyzer: !!analyzerRef.current,
        audioContext: !!audioContextRef.current,
        source: !!sourceRef.current,
        stream: !!streamRef.current,
        timeout: !!timeoutRef.current,
      });
    } catch (error) {
      logger.log('==================== ERROR ====================');
      logger.log('Error in startListening:', error);

      const errorMessage = getErrorMessage(error);

      setBpmState({
        bpm: null,
        error: errorMessage,
        status: 'error',
      });

      logger.log('State updated to error:', errorMessage);
      logger.log('Calling stopListening to clean up after error');

      stopListening();

      logger.log('==================== ERROR COMPLETE ====================');
    }
  }, [
    clearDetectionTimeout,
    detectionTimeout,
    handleDetectionTimeout,
    stopListening,
  ]);

  const reset = useCallback(() => {
    logger.log('==================== RESET ====================');
    logger.log('Reset called');
    logger.log('Current analyzer ref:', !!analyzerRef.current);

    if (analyzerRef.current) {
      logger.log('Calling analyzer.reset()');

      try {
        analyzerRef.current.reset();
        logger.log('Analyzer reset successfully');
      } catch (error) {
        logger.error('Error resetting analyzer:', error);
      }
    } else {
      logger.log('No analyzer to reset');
    }

    logger.log('Setting state to idle');

    setBpmState({
      bpm: null,
      error: null,
      status: 'idle',
    });

    logger.log('==================== RESET COMPLETE ====================');
  }, []);

  useEffect(() => {
    logger.log('==================== MOUNT ====================');
    logger.log('Component mounted');

    return () => {
      logger.log('==================== UNMOUNT ====================');
      logger.log('Component unmounting');
      logger.log('Closing audio context and cleaning up');

      if (audioContextRef.current) {
        logger.log('Closing audio context');

        try {
          audioContextRef.current.close();
          logger.log('Audio context closed');
        } catch (error) {
          logger.error('Error closing audio context:', error);
        }

        audioContextRef.current = null;
      }

      logger.log('Final cleanup complete');
      logger.log('==================== UNMOUNT COMPLETE ====================');
    };
  }, []);

  logger.log('Returning state and functions:', {
    bpm: bpmState.bpm,
    error: bpmState.error,
    hasReset: typeof reset === 'function',
    hasStart: typeof startListening === 'function',
    status: bpmState.status,
  });

  return {
    bpm: bpmState.bpm,
    error: bpmState.error,
    reset,
    startListening,
    status: bpmState.status,
  };
}

export type { BpmStatus, UseBPMAnalyzerOptions } from './types';
