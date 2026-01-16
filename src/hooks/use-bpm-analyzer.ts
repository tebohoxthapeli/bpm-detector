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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef<boolean>(false);

  console.log('[BPM Hook] Component rendering with current state:', bpmState);
  console.log('[BPM Hook] isRunning flag:', isRunningRef.current);
  console.log('[BPM Hook] Refs state:', {
    analyser: !!analyserRef.current,
    analyzer: !!analyzerRef.current,
    audioContext: !!audioContextRef.current,
    source: !!sourceRef.current,
    stream: !!streamRef.current,
  });

  const stopListening = useCallback(async () => {
    console.log(
      '[BPM Hook] ==================== STOP LISTENING ===================='
    );

    console.log(
      '[BPM Hook] Stop called, current isRunning:',
      isRunningRef.current
    );

    if (!isRunningRef.current) {
      console.log('[BPM Hook] Not running, skipping stop');
      return;
    }

    isRunningRef.current = false;
    console.log('[BPM Hook] Set isRunning to false');

    if (timeoutRef.current) {
      console.log('[BPM Hook] Clearing timeout');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    } else {
      console.log('[BPM Hook] No timeout to clear');
    }

    if (analyzerRef.current) {
      console.log('[BPM Hook] Removing bpmStable event listener');

      try {
        const bpmHandler = (data: BpmCandidates) => {
          console.log(
            '[BPM Hook] ==================== BPM DETECTION EVENT ===================='
          );

          console.log(
            '[BPM Hook] BpmDetection event received with data:',
            data
          );

          console.log('[BPM Hook] Data structure:', {
            bpmLength: data.bpm?.length,
            count: data.bpm?.[0]?.count,
            firstBpm: data.bpm?.[0],
            hasBpm: !!data.bpm,
            isBpmArray: Array.isArray(data.bpm),
            tempo: data.bpm?.[0]?.tempo,
          });

          if (
            !data.bpm
            || !Array.isArray(data.bpm)
            || data.bpm.length === 0
            || !data.bpm[0]
            || typeof data.bpm[0].tempo !== 'number'
            || Number.isNaN(data.bpm[0].tempo)
            || data.bpm[0].tempo <= 0
          ) {
            console.log('[BPM Hook] Invalid BPM data, ignoring detection');
            return;
          }

          const bpm = Math.round(data.bpm[0].tempo);
          console.log('[BPM Hook] Valid BPM detected:', bpm);
          console.log('[BPM Hook] Current state before update:', bpmState);

          setBpmState({
            bpm,
            error: null,
            status: 'detected',
          });

          console.log('[BPM Hook] State updated to detected with BPM:', bpm);

          if (timeoutRef.current) {
            console.log(
              '[BPM Hook] Clearing timeout after successful detection'
            );

            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          } else {
            console.log('[BPM Hook] No timeout to clear');
          }

          console.log(
            '[BPM Hook] Calling stopListening to properly cleanup after detection'
          );

          stopListening();

          console.log(
            '[BPM Hook] ==================== BPM DETECTION COMPLETE ===================='
          );
        };

        analyzerRef.current.on('bpmStable', bpmHandler);
        console.log('[BPM Hook] Event listener attached');
      } catch (error) {
        console.error('[BPM Hook] Error setting up event listener:', error);
      }

      console.log('[BPM Hook] Stopping and disconnecting analyzer');

      try {
        analyzerRef.current.stop();
        analyzerRef.current.disconnect();

        console.log(
          '[BPM Hook] Analyzer stopped and disconnected successfully'
        );
      } catch (error) {
        console.error('[BPM Hook] Error stopping analyzer:', error);
      }

      analyzerRef.current = null;
    } else {
      console.log('[BPM Hook] No analyzer to stop');
    }

    if (analyserRef.current) {
      console.log('[BPM Hook] Disconnecting analyser');

      try {
        analyserRef.current.disconnect();
        console.log('[BPM Hook] Analyser disconnected successfully');
      } catch (error) {
        console.error('[BPM Hook] Error disconnecting analyser:', error);
      }

      analyserRef.current = null;
    } else {
      console.log('[BPM Hook] No analyser to disconnect');
    }

    if (sourceRef.current) {
      console.log('[BPM Hook] Disconnecting source');

      try {
        sourceRef.current.disconnect();
        console.log('[BPM Hook] Source disconnected successfully');
      } catch (error) {
        console.error('[BPM Hook] Error disconnecting source:', error);
      }

      sourceRef.current = null;
    } else {
      console.log('[BPM Hook] No source to disconnect');
    }

    if (streamRef.current) {
      console.log('[BPM Hook] Stopping media tracks');

      try {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
          console.log('[BPM Hook] Stopping track:', track.kind, track.label);
          track.stop();
        });

        streamRef.current = null;
        console.log('[BPM Hook] All media tracks stopped');
      } catch (error) {
        console.error('[BPM Hook] Error stopping media tracks:', error);
      }
    } else {
      console.log('[BPM Hook] No stream to stop');
    }

    if (audioContextRef.current) {
      console.log('[BPM Hook] Suspending audio context (not closing)');

      try {
        await audioContextRef.current.suspend();
        console.log('[BPM Hook] Audio context suspended');
      } catch (error) {
        console.error('[BPM Hook] Error suspending audio context:', error);
      }
    } else {
      console.log('[BPM Hook] No audio context to suspend');
    }

    console.log('[BPM Hook] Stop completed, final ref state:', {
      analyser: !!analyserRef.current,
      analyzer: !!analyzerRef.current,
      audioContext: !!audioContextRef.current,
      source: !!sourceRef.current,
      stream: !!streamRef.current,
    });

    console.log(
      '[BPM Hook] ==================== STOP COMPLETE ===================='
    );
  }, [
    bpmState,
  ]);

  const getErrorMessage = useCallback((error: unknown): string => {
    console.log('[BPM Hook] Processing error:', error);

    if (error instanceof DOMException) {
      console.log(
        '[BPM Hook] DOMException detected:',
        error.name,
        error.message
      );

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

  const handleDetectionTimeout = useCallback(() => {
    console.log(
      '[BPM Hook] ==================== TIMEOUT EVENT ===================='
    );
    console.log(
      '[BPM Hook] Detection timeout triggered after',
      detectionTimeout,
      'ms'
    );

    setBpmState({
      bpm: null,
      error: 'Could not detect BPM. Please try again with louder volume.',
      status: 'error',
    });

    console.log('[BPM Hook] State updated to error');

    console.log(
      '[BPM Hook] Calling stopListening to properly cleanup after timeout'
    );
    stopListening();

    console.log(
      '[BPM Hook] ==================== TIMEOUT COMPLETE ===================='
    );
  }, [
    detectionTimeout,
    stopListening,
  ]);

  const startListening = useCallback(async () => {
    console.log(
      '[BPM Hook] ==================== START LISTENING ===================='
    );
    console.log('[BPM Hook] Start listening called');
    console.log('[BPM Hook] Current isRunning flag:', isRunningRef.current);

    if (isRunningRef.current) {
      console.log('[BPM Hook] Already running, ignoring start request');
      return;
    }

    isRunningRef.current = true;
    console.log('[BPM Hook] Set isRunning to true');

    try {
      console.log('[BPM Hook] Setting state to listening');
      setBpmState({
        bpm: null,
        error: null,
        status: 'listening',
      });

      console.log('[BPM Hook] Getting AudioContext constructor');
      const AudioContextConstructor =
        window.AudioContext
        || (
          window as unknown as {
            webkitAudioContext: typeof AudioContext;
          }
        ).webkitAudioContext;

      console.log(
        '[BPM Hook] Checking existing audio context:',
        !!audioContextRef.current
      );
      const audioContext =
        audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = audioContext;
      console.log('[BPM Hook] Audio context created/reused:', audioContext);
      console.log('[BPM Hook] Audio context state:', audioContext.state);

      if (audioContext.state === 'suspended') {
        console.log('[BPM Hook] Audio context is suspended, resuming...');
        await audioContext.resume();
        console.log(
          '[BPM Hook] Audio context resumed, new state:',
          audioContext.state
        );
      } else {
        console.log(
          '[BPM Hook] Audio context is not suspended, state:',
          audioContext.state
        );
      }

      console.log('[BPM Hook] Requesting microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      console.log('[BPM Hook] Microphone access granted');
      console.log(
        '[BPM Hook] Stream tracks:',
        stream.getAudioTracks().map(t => ({
          enabled: t.enabled,
          kind: t.kind,
          label: t.label,
          muted: t.muted,
        }))
      );

      streamRef.current = stream;

      console.log('[BPM Hook] Creating media stream source');
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      console.log('[BPM Hook] Creating BPM analyzer');
      const analyzer = await createRealtimeBpmAnalyzer(audioContext);
      analyzerRef.current = analyzer;
      console.log('[BPM Hook] BPM analyzer created');

      console.log('[BPM Hook] Creating analyser node');
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserRef.current = analyserNode;
      console.log(
        '[BPM Hook] Analyser node created with fftSize:',
        analyserNode.fftSize
      );

      console.log(
        '[BPM Hook] Connecting audio graph: source -> analyser & analyzer'
      );
      source.connect(analyserNode);
      source.connect(analyzer.node);
      console.log('[BPM Hook] Audio graph connected');

      console.log(
        '[BPM Hook] Setting detection timeout:',
        detectionTimeout,
        'ms'
      );
      timeoutRef.current = setTimeout(handleDetectionTimeout, detectionTimeout);
      console.log('[BPM Hook] Timeout scheduled');

      console.log(
        '[BPM Hook] ==================== START COMPLETE ===================='
      );
      console.log('[BPM Hook] All ref states after start:', {
        analyser: !!analyserRef.current,
        analyzer: !!analyzerRef.current,
        audioContext: !!audioContextRef.current,
        source: !!sourceRef.current,
        stream: !!streamRef.current,
        timeout: !!timeoutRef.current,
      });
    } catch (error) {
      console.log('[BPM Hook] ==================== ERROR ====================');
      console.log('[BPM Hook] Error in startListening:', error);

      const errorMessage = getErrorMessage(error);

      setBpmState({
        bpm: null,
        error: errorMessage,
        status: 'error',
      });

      console.log('[BPM Hook] State updated to error:', errorMessage);
      console.log('[BPM Hook] Calling stopListening to clean up after error');
      stopListening();

      console.log(
        '[BPM Hook] ==================== ERROR COMPLETE ===================='
      );
    }
  }, [
    detectionTimeout,
    getErrorMessage,
    handleDetectionTimeout,
    stopListening,
  ]);

  const reset = useCallback(() => {
    console.log('[BPM Hook] ==================== RESET ====================');
    console.log('[BPM Hook] Reset called');
    console.log('[BPM Hook] Current analyzer ref:', !!analyzerRef.current);

    if (analyzerRef.current) {
      console.log('[BPM Hook] Calling analyzer.reset()');
      try {
        analyzerRef.current.reset();
        console.log('[BPM Hook] Analyzer reset successfully');
      } catch (error) {
        console.error('[BPM Hook] Error resetting analyzer:', error);
      }
    } else {
      console.log('[BPM Hook] No analyzer to reset');
    }

    console.log('[BPM Hook] Setting state to idle');
    setBpmState({
      bpm: null,
      error: null,
      status: 'idle',
    });

    console.log(
      '[BPM Hook] ==================== RESET COMPLETE ===================='
    );
  }, []);

  useEffect(() => {
    console.log('[BPM Hook] ==================== MOUNT ====================');
    console.log('[BPM Hook] Component mounted');

    return () => {
      console.log(
        '[BPM Hook] ==================== UNMOUNT ===================='
      );
      console.log('[BPM Hook] Component unmounting');
      console.log('[BPM Hook] Closing audio context and cleaning up');

      if (audioContextRef.current) {
        console.log('[BPM Hook] Closing audio context');
        try {
          audioContextRef.current.close();
          console.log('[BPM Hook] Audio context closed');
        } catch (error) {
          console.error('[BPM Hook] Error closing audio context:', error);
        }
        audioContextRef.current = null;
      }

      console.log('[BPM Hook] Final cleanup complete');
      console.log(
        '[BPM Hook] ==================== UNMOUNT COMPLETE ===================='
      );
    };
  }, []);

  console.log('[BPM Hook] Returning state and functions:', {
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

type BpmStatus = 'idle' | 'listening' | 'detected' | 'error';

type BpmState = {
  bpm: number | null;
  status: BpmStatus;
  error: string | null;
};

type UseBPMAnalyzerOptions = {
  detectionTimeout?: number;
};

export type { BpmStatus };
