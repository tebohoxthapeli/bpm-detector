import { useCallback } from 'react';

import { MicButton } from './components/mic-button';
import { ResultScreen } from './components/result-screen';
import { useBPMAnalyzer } from './hooks/use-bpm-analyzer';
import { logger } from './hooks/use-bpm-analyzer/logger';

logger.log('[App] Component rendering');

export default function App() {
  const { bpm, error, status, startListening, reset, stop } = useBPMAnalyzer();

  logger.log('[App] Hook state:', {
    bpm,
    error,
    status,
  });

  const handleRetry = useCallback(async () => {
    await reset();
    startListening();
  }, [
    reset,
    startListening,
  ]);

  return (
    <div className='flex min-h-svh items-center justify-center px-6 py-14 text-foreground'>
      <div className='w-full max-w-lg'>
        <MicButton
          errorMessage={error}
          onReset={reset}
          onRetry={handleRetry}
          onStart={startListening}
          onStop={stop}
          status={status}
        />
        <ResultScreen
          bpm={bpm}
          onReset={reset}
        />
      </div>
    </div>
  );
}
