import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResultScreen({ bpm, onReset }: ResultScreenProps) {
  if (bpm === null) {
    return null;
  }

  return (
    <div className='mx-auto w-full max-w-lg'>
      <Button
        className='fixed top-6 left-6 border-border/60 bg-card/40 text-muted-foreground shadow-lg backdrop-blur-md hover:text-foreground'
        onClick={onReset}
        size='sm'
        variant='outline'
      >
        <ArrowLeft
          className='mr-2'
          size={16}
        />
        Back
      </Button>

      <div className='rounded-3xl border border-border/60 bg-card/45 p-7 text-center shadow-2xl backdrop-blur-md sm:p-10'>
        <div className='text-muted-foreground text-xs tracking-[0.32em]'>
          RESULT
        </div>

        <div className='mt-3 text-muted-foreground text-sm'>Detected tempo</div>

        <div className='mt-6 bg-gradient-to-b from-primary via-primary/80 to-primary/55 bg-clip-text font-semibold text-7xl text-transparent tabular-nums leading-none tracking-tight sm:text-8xl'>
          {bpm}
        </div>

        <div className='mt-2 text-muted-foreground text-sm'>BPM</div>

        <div className='mt-8 flex justify-center'>
          <Button
            className='min-w-60'
            onClick={onReset}
            size='lg'
          >
            Detect another
          </Button>
        </div>
      </div>
    </div>
  );
}

type ResultScreenProps = {
  bpm: number | null;
  onReset: () => void;
};
