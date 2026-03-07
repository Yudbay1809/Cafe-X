import './globals.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/components/I18nProvider';

export const metadata: Metadata = {
  title: 'Cafe-X Admin',
  description: 'Admin POS console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
