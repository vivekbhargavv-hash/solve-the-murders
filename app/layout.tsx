import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solve the Murders — AI Detective Game',
  description:
    'An AI-powered detective game. Interrogate suspects, gather evidence, and solve murders before your Detective Points run out.',
  keywords: ['murder mystery', 'detective game', 'AI game', 'interactive mystery'],
  openGraph: {
    title: 'Solve the Murders',
    description: 'AI-powered interactive detective game',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="noise-overlay antialiased">{children}</body>
    </html>
  );
}
