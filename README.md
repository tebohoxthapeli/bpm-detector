# BPM Detector

A simple web application that uses a device's microphone to detect the BPM (beats per minute) of playing music.

## Tech Stack

- **Bun** - Package manager and runtime
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS v4** - Styling
- **shadcn/ui** - UI component library
- **realtime-bpm-analyzer** - BPM detection
- **lucide-react** - Icons

## Features

- Real-time BPM detection from microphone
- Clean, minimalist UI with light mode
- Emerald theme with neutral base colors
- Automatic timeout after 15 seconds
- Error handling for microphone permissions

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Usage

1. Open the application in your browser
2. Allow microphone access when prompted
3. Tap the large circular button to start listening
4. Play music nearby or hold your device near a music source
5. Wait for BPM detection (up to 15 seconds)
6. View the detected BPM
7. Click "Back" to detect again

## Browser Support

Requires a browser that supports:
- Web Audio API
- getUserMedia for microphone access

Most modern browsers (Chrome, Firefox, Safari, Edge) are supported.

## License

MIT
