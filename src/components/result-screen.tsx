import { ArrowLeft } from 'lucide-react';

import { useBPMAnalyzer } from '../hooks/use-bpm-analyzer';
import { Button } from './ui/button';

export function ResultScreen() {
  const { bpm, status, reset } = useBPMAnalyzer();

  if (status !== 'detected') {
    return null;
  }

  return (
    <div className='flex flex-col items-center gap-8'>
      <Button
        className='absolute top-6 left-6'
        onClick={reset}
        size='sm'
        variant='ghost'
      >
        <ArrowLeft
          className='mr-2'
          size={16}
        />
        Back
      </Button>

      <div className='space-y-4 text-center'>
        <div className='text-lg text-muted-foreground'>Detected BPM</div>
        <div className='font-bold text-9xl text-primary'>{bpm}</div>
        <div className='text-muted-foreground text-xl'>BPM</div>
      </div>
    </div>
  );
}
