import type { Metadata } from 'next';
import './globals.css';
import CommandDock from './components/CommandDock';

export const metadata: Metadata = {
  title: 'Unified Entity — Private Companion',
  description: 'Standalone cloud console for the unified persistent entity.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<CommandDock/></body>
    </html>
  );
}
