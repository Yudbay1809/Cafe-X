import './globals.css';
import CustomerFonts from './CustomerFonts';

export const metadata = {
  title: 'Cafe-X Customer',
  description: 'Order from your table',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c8853c" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </head>
      <body>
        <CustomerFonts />
        {children}
      </body>
    </html>
  );
}
