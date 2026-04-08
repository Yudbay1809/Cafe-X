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
    <html lang="en">
      <body>
        <CustomerFonts />
        {children}
      </body>
    </html>
  );
}
