import './globals.css';
import type { Metadata } from 'next';
import { Sora } from 'next/font/google';

const sora = Sora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Cafe-X Customer',
  description: 'QR ordering app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.className}>{children}</body>
    </html>
  );
}