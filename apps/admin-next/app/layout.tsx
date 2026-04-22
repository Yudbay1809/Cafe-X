import './globals.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/components/I18nProvider';
import { QueryProvider } from '@/components/QueryProvider';
import { Playfair_Display_SC, Karla } from 'next/font/google';

const playfair = Playfair_Display_SC({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair'
});

const karla = Karla({ 
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-karla'
});

export const metadata: Metadata = {
  title: 'Cafe-X Sultan Admin HQ',
  description: 'Enterprise Ops Console - Sultan Expansion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${playfair.variable} ${karla.variable}`}>
      <body className="font-karla bg-[#FEF3C7]/10">
        <a href="#main-content" className="skip-link sr-only">Skip to main content</a>
        <I18nProvider>
          <QueryProvider>{children}</QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
