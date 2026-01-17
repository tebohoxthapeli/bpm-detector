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
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const meterRef = useRef<AnalyserNode | null>(null);
  const meterIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const stopListeningRef = useRef<() => Promise<void>>();

  logger.log('Component rendering with current state:', bpmState);
  logger.log('isRunning flag:', isRunningRef.current);

  logger.log('Refs state:', {
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
    if (meterIntervalRef.current) {
      clearInterval(meterIntervalRef.current);
      meterIntervalRef.current = null;
    }

    if (meterRef.current) {
      try {
        meterRef.current.disconnect();
      } catch (error) {
        logger.error('Error disconnecting meter:', error);
      }

      meterRef.current = null;
    }

    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch (error) {
        logger.error('Error disconnecting gain:', error);
      }

      gainRef.current = null;
    }

    if (compressorRef.current) {
      try {
        compressorRef.current.disconnect();
      } catch (error) {
        logger.error('Error disconnecting compressor:', error);
      }

      compressorRef.current = null;
    }

    if (filterRef.current) {
      try {
        filterRef.current.disconnect();
      } catch (error) {
        logger.error('Error disconnecting filter:', error);
      }

      filterRef.current = null;
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

  const handleDetectionTimeout = useCallback(async () => {
    logger.log('==================== TIMEOUT EVENT ====================');
    logger.log('Detection timeout triggered after', detectionTimeout, 'ms');

    setBpmState({
      bpm: null,
      error: 'Could not detect BPM. Please try again with louder volume.',
      status: 'error',
    });

    logger.log('State updated to error');
    logger.log('Calling stopListening to properly cleanup after timeout');

    await stopListening();

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

      logger.log('Requesting microphone access (with processing disabled)');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
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

      logger.log('Creating audio preprocessing chain');

      // 1. LowPass Filter: Isolate kick/bass frequencies (where the beat lives)
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      filter.Q.value = 1;
      filterRef.current = filter;

      logger.log('LowPass filter created at 150Hz');

      // 2. Compressor: Normalize dynamics so quiet beats hit same as loud beats
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressorRef.current = compressor;

      logger.log('Compressor created');

      // 3. Gain: Makeup gain after compression
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 10;
      gainRef.current = gainNode;

      logger.log('Gain node created with value:', gainNode.gain.value);

      // 4. Meter: Monitor signal levels for debugging
      const meter = audioContext.createAnalyser();
      meter.fftSize = 2048;
      meterRef.current = meter;

      const meterBuffer = new Float32Array(meter.fftSize);

      meterIntervalRef.current = window.setInterval(() => {
        meter.getFloatTimeDomainData(meterBuffer);

        let peak = 0;
        let sum = 0;

        for (const v of meterBuffer) {
          peak = Math.max(peak, Math.abs(v));
          sum += v * v;
        }

        const rms = Math.sqrt(sum / meterBuffer.length);

        console.log('[Signal Meter]', {
          peak: Number(peak.toFixed(4)),
          rms: Number(rms.toFixed(4)),
        });
      }, 1000);

      logger.log('Signal meter created');
      logger.log('Creating BPM analyzer');

      const analyzer = await createRealtimeBpmAnalyzer(audioContext, {
        continuousAnalysis: true,
        stabilizationTime: 10000,
      });
      analyzerRef.current = analyzer;

      logger.log('BPM analyzer created');

      analyzer.once('bpmStable', (data: BpmCandidates) => {
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

      analyzer.on('bpm', (data: BpmCandidates) => {
        console.log('[BPM Debug] bpm event:', data);
        logger.log('bpm event received:', data);

        if (!isValidBpmData(data)) {
          console.log('[BPM Debug] Invalid BPM data, skipping');
          return;
        }

        const candidate = data.bpm[0];
        console.log('[BPM Debug] candidate:', candidate);

        if (candidate && candidate.count >= 5) {
          const bpm = Math.round(candidate.tempo);
          console.log(
            '[BPM Debug] Accepting BPM:',
            bpm,
            'count:',
            candidate.count
          );
          logger.log('Confident BPM detected:', bpm, 'count:', candidate.count);

          setBpmState({
            bpm,
            error: null,
            status: 'detected',
          });

          clearDetectionTimeout();
          stopListeningRef.current?.();
        }
      });

      logger.log('bpm event listener attached');

      analyzer.on('error', errorData => {
        logger.error('Analyzer error:', errorData.message);
      });

      logger.log('error event listener attached');
      logger.log(
        'Connecting audio graph: source -> filter -> compressor -> gain -> meter -> analyzer'
      );

      source.connect(filter);
      filter.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(meter);
      meter.connect(analyzer.node);

      logger.log('Audio graph connected');
      logger.log('Setting detection timeout:', detectionTimeout, 'ms');

      timeoutRef.current = setTimeout(handleDetectionTimeout, detectionTimeout);

      logger.log('Timeout scheduled');
      logger.log('==================== START COMPLETE ====================');

      logger.log('All ref states after start:', {
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

      await stopListening();

      logger.log('==================== ERROR COMPLETE ====================');
    }
  }, [
    clearDetectionTimeout,
    detectionTimeout,
    handleDetectionTimeout,
    stopListening,
  ]);

  const reset = useCallback(async () => {
    logger.log('==================== RESET ====================');
    logger.log('Reset called');

    // Stop any active listening session first
    await stopListening();

    // Reset analyzer if it exists
    if (analyzerRef.current) {
      logger.log('Calling analyzer.reset()');

      try {
        analyzerRef.current.reset();
        logger.log('Analyzer reset successfully');
      } catch (error) {
        logger.error('Error resetting analyzer:', error);
      }
    }

    logger.log('Setting state to idle');

    setBpmState({
      bpm: null,
      error: null,
      status: 'idle',
    });

    logger.log('==================== RESET COMPLETE ====================');
  }, [
    stopListening,
  ]);

  useEffect(() => {
    logger.log('==================== MOUNT ====================');
    logger.log('Component mounted');

    return () => {
      logger.log('==================== UNMOUNT ====================');
      logger.log('Component unmounting');

      // Clean up all resources
      clearDetectionTimeout();
      cleanupAnalyzer();
      cleanupAudioNodes();
      cleanupStream();

      // Close AudioContext (final cleanup)
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

      isRunningRef.current = false;
      logger.log('==================== UNMOUNT COMPLETE ====================');
    };
  }, [
    clearDetectionTimeout,
    cleanupAnalyzer,
    cleanupAudioNodes,
    cleanupStream,
  ]);

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
