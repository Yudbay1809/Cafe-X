import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cafe-X — Your Modern Cafe Experience',
  description: 'Order, enjoy, repeat. Cafe-X brings you specialty coffee, seasonal pastries, and a seamless digital cafe experience — all in one place.',
  keywords: 'cafe, coffee, pastry, specialty drinks, Cafe-X',
  openGraph: {
    title: 'Cafe-X — Your Modern Cafe Experience',
    description: 'Order, enjoy, repeat. Specialty coffee & pastries, reimagined.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
