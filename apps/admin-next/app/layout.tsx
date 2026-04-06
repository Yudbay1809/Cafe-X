import './globals.css';
import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import { QueryProvider } from '@/components/QueryProvider';

const sora = Sora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Cafe-X Admin',
  description: 'Admin POS console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.className}>
        <I18nProvider>
          <QueryProvider>{children}</QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}