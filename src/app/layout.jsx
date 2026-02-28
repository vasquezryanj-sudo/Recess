import '@/styles/globals.css';
import { GameProvider } from '@/lib/GameContext';

export const metadata = {
  title: 'Recess',
  description: 'Board game night tracker',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1B2A4A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
