import type { Metadata, Viewport } from 'next';
import './globals.css';
import CommandDock from './components/CommandDock';
import PwaRegister from './components/PwaRegister';

export const metadata: Metadata = {
  title: 'Unified Entity — Private Companion',
  description: 'Standalone cloud console for the unified persistent entity.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/edon-icon.svg', apple: '/edon-icon.svg' },
  applicationName: 'Edôn',
};

export const viewport: Viewport = {
  themeColor: '#020704',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<CommandDock/><PwaRegister/></body>
    </html>
  );
}
