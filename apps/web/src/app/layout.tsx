import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { JsonLd } from '@/components/seo/json-ld';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'Synex - Turn Your Video Submissions Into Cash',
    template: '%s | Synex',
  },
  description:
    'Upload video content, pass automated quality verification, and earn direct payouts. Connect your creative work with monetized video opportunities.',
  keywords: [
    'video submission',
    'creator monetization',
    'earn money with videos',
    'video verification',
    'content creator platform',
    'video rewards',
  ],
  authors: [{ name: 'Synex Team' }],
  creator: 'Synex',
  publisher: 'Synex',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Synex - Turn Your Video Submissions Into Cash',
    description:
      'Upload video content, pass automated quality verification, and earn direct payouts.',
    url: baseUrl,
    siteName: 'Synex',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/synex_logo.png',
        width: 800,
        height: 800,
        alt: 'Synex Creator Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synex - Turn Your Video Submissions Into Cash',
    description:
      'Upload video content, pass automated quality verification, and earn direct payouts.',
    images: ['/synex_logo.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Synex',
    url: baseUrl,
    logo: `${baseUrl}/synex_logo.png`,
    description:
      'Creator platform enabling users to upload video content, pass quality verification, and earn rewards.',
    sameAs: [],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Synex',
    url: baseUrl,
    description: 'Turn your video submissions into earnings with Synex.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#FEFEFE] dark:bg-black text-zinc-900 dark:text-zinc-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
