import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResultScreen({ bpm, onReset }: ResultScreenProps) {
  if (bpm === null) {
    return null;
  }

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center gap-8'>
      <Button
        className='fixed top-6 left-6 border border-white/10 bg-white/5 text-muted-foreground backdrop-blur-md hover:bg-white/10 hover:text-foreground'
        onClick={onReset}
        size='sm'
        variant='ghost'
      >
        <ArrowLeft
          className='mr-2'
          size={16}
        />
        Back
      </Button>

      <div className='w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-black/35 shadow-xl backdrop-blur-md'>
        <div className='font-medium text-muted-foreground text-xs tracking-widest'>
          RESULT
        </div>

        <div className='mt-3 text-muted-foreground text-sm'>Detected tempo</div>

        <div className='mt-5 font-mono font-semibold text-8xl text-foreground tabular-nums leading-none tracking-tight'>
          {bpm}
        </div>

        <div className='mt-2 text-muted-foreground text-sm'>BPM</div>

        <div className='mt-7 flex justify-center'>
          <Button
            className='min-w-56'
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
