import type { Metadata, Viewport } from 'next';
import '../styles/global.css';
import { getEsubDetails } from '../api';
import { Providers } from './providers';

export const metadata: Metadata = { title: 'E-subscription' };

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const esubDetails = await getEsubDetails();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body>
        <Providers esubDetails={esubDetails}>{children}</Providers>
      </body>
    </html>
  );
}
