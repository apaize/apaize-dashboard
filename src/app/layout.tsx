import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apaize Console',
  description: 'Back-office d\'administration Apaize',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
