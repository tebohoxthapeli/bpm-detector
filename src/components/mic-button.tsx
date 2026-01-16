import { IconMicrophoneFilled } from '@tabler/icons-react';
import { Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { BpmStatus } from '@/hooks/use-bpm-analyzer';
import { cn } from '@/utils';

type MicButtonProps = {
  status: BpmStatus;
  errorMessage: string | null;
  onStart: () => void;
  onReset: () => void;
};

console.log('[MicButton] Component rendering');

export function MicButton({
  status,
  errorMessage,
  onStart,
  onReset,
}: MicButtonProps) {
  console.log(
    '[MicButton] Render call - status:',
    status,
    'error message:',
    errorMessage
  );

  if (status === 'detected') {
    console.log('[MicButton] Status is detected, returning null');
    return null;
  }

  if (status === 'error') {
    console.log('[MicButton] Status is error, rendering error UI');

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
              onClick={onReset}
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

  console.log('[MicButton] Status is idle or listening, rendering button UI');

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
            <div className='absolute -inset-6 rounded-full border border-primary/25' />
            <div className='absolute -inset-10 animate-ping rounded-full border border-primary/20' />
          </>
        ) : null}

        <Button
          aria-busy={status === 'listening'}
          className={cn(
            'relative h-44 w-44 rounded-full',
            'border border-white/10 bg-white/5 text-foreground',
            'shadow-black/35 shadow-xl',
            'backdrop-blur-md',
            'transition-all duration-200',
            'hover:bg-white/8 hover:shadow-2xl',
            'focus-visible:ring-2 focus-visible:ring-primary/40',
            '[&_svg]:h-11! [&_svg]:w-11!',
            status === 'listening'
              ? 'cursor-not-allowed ring-2 ring-primary/30'
              : 'active:scale-[0.98]'
          )}
          disabled={status === 'listening'}
          onClick={onStart}
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
          <div className='text-base text-muted-foreground'>
            <span className='animate-pulse'>Listening…</span>
          </div>
        ) : null}
      </div>

      <div className='text-center text-muted-foreground/80 text-xs leading-relaxed'>
        If detection is noisy: move closer, reduce reverb, and avoid clipping.
      </div>
    </div>
  );
}
