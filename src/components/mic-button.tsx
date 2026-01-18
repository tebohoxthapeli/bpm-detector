import { IconMicrophoneFilled } from '@tabler/icons-react';
import { Loader2, Square, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { BpmStatus } from '@/hooks/use-bpm-analyzer';
import { logger } from '@/hooks/use-bpm-analyzer/logger';
import { cn } from '@/utils';

type MicButtonProps = {
  status: BpmStatus;
  errorMessage: string | null;
  onStart: () => void;
  onReset: () => void;
  onRetry: () => void;
  onStop: () => void;
};

logger.log('[MicButton] Component rendering');

export function MicButton({
  status,
  errorMessage,
  onStart,
  onReset,
  onRetry,
  onStop,
}: MicButtonProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (status !== 'listening') {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    status,
  ]);

  logger.log(
    '[MicButton] Render call - status:',
    status,
    'error message:',
    errorMessage
  );

  if (status === 'detected') {
    logger.log('[MicButton] Status is detected, returning null');
    return null;
  }

  if (status === 'error') {
    logger.log('[MicButton] Status is error, rendering error UI');

    return (
      <div className='mx-auto w-full max-w-md'>
        <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-6 shadow-black/20 shadow-lg'>
          <div className='mb-2 font-medium text-destructive text-sm'>
            Mic error
          </div>

          <div className='text-destructive/90 text-sm leading-relaxed'>
            {errorMessage}
          </div>

          <div className='mt-6 flex justify-center'>
            <Button
              className='min-w-48 border-destructive/30 bg-background/40 text-foreground hover:bg-background/60'
              onClick={onRetry}
              size='lg'
              variant='outline'
            >
              <X
                className='mr-2'
                size={20}
              />
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  logger.log('[MicButton] Status is idle or listening, rendering button UI');

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center gap-8'>
      <div className='space-y-2 text-center'>
        <div className='font-medium text-muted-foreground text-xs tracking-widest'>
          BPM DETECTOR
        </div>

        <div className='font-semibold text-2xl text-foreground tracking-tight'>
          Find tempo in real time
        </div>

        <div className='text-muted-foreground text-sm leading-relaxed'>
          Point your mic at the speaker. Stable volume helps.
        </div>
      </div>

      <div className='relative'>
        <div className='absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl' />

        {status === 'listening' ? (
          <>
            <div className='pointer-events-none absolute -inset-6 rounded-full border border-primary/25' />
            <div className='pointer-events-none absolute -inset-10 animate-ping rounded-full border border-primary/20' />
          </>
        ) : null}

        <Button
          aria-busy={status === 'listening'}
          className={cn(
            'relative h-44 w-44 rounded-full',
            'shadow-black/35 shadow-xl',
            'backdrop-blur-md',
            'transition-all duration-200',
            'focus-visible:ring-2 focus-visible:ring-primary/40',
            '[&_svg]:h-11! [&_svg]:w-11!',
            'active:scale-[0.98]',
            status === 'listening'
              ? 'border-primary/30 bg-primary/20 text-primary ring-2 ring-primary/30 hover:bg-primary/30'
              : 'border border-white/10 bg-white/5 text-foreground hover:bg-white/8 hover:shadow-2xl'
          )}
          onClick={status === 'listening' ? onStop : onStart}
          size='iconLg'
        >
          {status === 'listening' ? (
            <Loader2 className='animate-spin' />
          ) : (
            <IconMicrophoneFilled />
          )}
        </Button>
      </div>

      <div className='space-y-2 text-center'>
        {status === 'idle' ? (
          <div className='text-base text-muted-foreground'>
            Tap to start listening
          </div>
        ) : null}

        {status === 'listening' ? (
          <div className='flex flex-col items-center gap-3'>
            <div className='text-base text-muted-foreground'>
              <span className='animate-pulse'>Listening…</span>
              <span className='ml-2 font-mono tabular-nums'>
                {elapsedSeconds}s
              </span>
            </div>
            <div className='text-muted-foreground/70 text-sm'>Tap to stop</div>
            <Button
              className='text-muted-foreground hover:text-foreground'
              onClick={() => {
                logger.log('[MicButton] Stop button clicked, calling onStop');
                logger.log('[MicButton] onStop type:', typeof onStop);
                onStop();
                logger.log('[MicButton] onStop returned');
              }}
              size='sm'
              variant='ghost'
            >
              <Square
                className='mr-1.5 fill-current'
                size={14}
              />
              Stop
            </Button>
          </div>
        ) : null}
      </div>

      <div className='text-center text-muted-foreground/80 text-xs leading-relaxed'>
        If detection is noisy: move closer, reduce reverb, and avoid clipping.
      </div>
    </div>
  );
}
