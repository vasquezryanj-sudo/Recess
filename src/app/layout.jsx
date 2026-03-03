import '@/styles/globals.css';
import { GameProvider } from '@/lib/GameContext';

export const metadata = {
  title: 'Recess',
  description: 'Board game night tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Recess',
  },
  icons: {
    apple: '/icon.png',
    icon: '/icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B2A4A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Recess" />
      </head>
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
