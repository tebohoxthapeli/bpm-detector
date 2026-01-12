import { MicButton } from './components/mic-button';
import { ResultScreen } from './components/result-screen';

export default function App() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background text-foreground'>
      <div className='w-full max-w-md px-6'>
        <MicButton />
        <ResultScreen />
      </div>
    </div>
  );
}
