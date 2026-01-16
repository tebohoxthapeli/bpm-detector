import { MicButton } from './components/mic-button';
import { ResultScreen } from './components/result-screen';
import { useBPMAnalyzer } from './hooks/use-bpm-analyzer';

console.log('[App] Component rendering');

export default function App() {
  const { bpm, error, status, startListening, reset } = useBPMAnalyzer();

  console.log('[App] Hook state:', {
    bpm,
    error,
    status,
  });

  return (
    <div className='flex min-h-screen items-center justify-center bg-background text-foreground'>
      <div className='w-full max-w-md px-6'>
        <MicButton
          errorMessage={error}
          onReset={reset}
          onStart={startListening}
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
