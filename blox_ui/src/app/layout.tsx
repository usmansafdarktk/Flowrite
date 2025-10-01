import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@subframe/core';

export const metadata: Metadata = {
  title: 'BloX',
  description: 'AI assited blog writing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
