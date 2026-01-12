import { Loader2, Mic, X } from 'lucide-react';
import { useBPMAnalyzer } from '../hooks/use-bpm-analyzer';
import { Button } from './ui/button';

export function MicButton() {
  const { status, error, startListening, reset } = useBPMAnalyzer();

  if (status === 'detected') {
    return null;
  }

  if (status === 'error') {
    return (
      <div className='flex flex-col items-center gap-6'>
        <div className='text-center text-destructive'>{error}</div>
        <Button
          className='min-w-48'
          onClick={reset}
          size='lg'
          variant='outline'
        >
          <X
            className='mr-2'
            size={20}
          />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-6'>
      <Button
        className='h-48 w-48 rounded-full shadow-lg transition-all hover:shadow-xl'
        disabled={status === 'listening'}
        onClick={startListening}
        size='iconLg'
      >
        {status === 'listening' ? (
          <Loader2
            className='animate-spin'
            size={48}
          />
        ) : (
          <Mic size={48} />
        )}
      </Button>

      <div className='space-y-2 text-center'>
        {status === 'idle' && (
          <div className='text-lg text-muted-foreground'>Tap to detect BPM</div>
        )}

        {status === 'listening' && (
          <div className='animate-pulse text-lg text-muted-foreground'>
            Listening...
          </div>
        )}
      </div>
    </div>
  );
}
