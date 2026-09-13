import type { Metadata } from 'next';
import '@/index.css';

export const metadata: Metadata = {
  title: 'DROID88 - Android Closed Testing Hub',
  description:
    'Marketplace and community for Android developers to publish apps, recruit tiered beta testers, track 14-day engagement analytics, and gather automated feedback with screenshot bug reporting.',
  openGraph: {
    title: 'DROID88 - Android Closed Testing Hub',
    description:
      'Marketplace and community for Android developers to publish apps, recruit tiered beta testers, track 14-day engagement analytics, and gather automated feedback with screenshot bug reporting.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Outfit:wght@400..800&family=JetBrains+Mono:wght@400..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
