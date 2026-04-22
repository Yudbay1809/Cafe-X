import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

let echoInstance: any = null;

export const getEcho = () => {
  if (typeof window === 'undefined') return null;

  if (!echoInstance) {
    window.Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
    });
  }

  return echoInstance;
};
