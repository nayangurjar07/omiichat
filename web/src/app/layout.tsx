// web/src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
};

export const metadata: Metadata = {
  title: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
  description:
    'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
  keywords: [
    'omegle alternative',
    'talk to strangers',
    'random video chat',
    'anonymous text chat',
    'meet new people online',
    'omiichat',
    'free omegle alternative no login mobile',
    'anonymous text chat with strangers online',
    'random chat',
    'chat with strangers',
  ],
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
  alternates: {
    canonical: 'https://omiichat.antideploy.app/',
  },
  verification: {
    google: 'xoehmGRDTQUKHGQ-TnC9ZU8Bf0GN60bZzz541Nw8VHs',
  },
  metadataBase: new URL('https://omiichat.antideploy.app'),
  openGraph: {
    title: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
    description:
      'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
    url: 'https://omiichat.antideploy.app/',
    siteName: 'OmiiChat',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
    description:
      'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://omiichat.antideploy.app/#webapp',
        name: 'OmiiChat',
        url: 'https://omiichat.antideploy.app/',
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description:
          'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://omiichat.antideploy.app/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is OmiiChat free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, OmiiChat is 100% free with no hidden fees, premium subscriptions, or registration required. You can start chatting instantly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why is OmiiChat a good alternative to Omegle?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'OmiiChat offers high-speed anonymous matchmaking, topic/interest tags, photo sharing, voice notes, and real-time moderation to keep conversations clean and safe, making it a modern, reliable Omegle alternative.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I talk to strangers safely on OmiiChat?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You never have to reveal your real identity, email, or phone number. OmiiChat includes instant skip/disconnect buttons, proactive keyword filters, client-side moderation, and a one-click reporting system to block abusive users.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need to create an account or download an app?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. OmiiChat runs directly in your web browser on mobile and desktop without downloading any app or creating an account.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${outfit.variable} ${jetbrainsMono.variable} dark`}
    >
      <head>
        <meta name="google-site-verification" content="xoehmGRDTQUKHGQ-TnC9ZU8Bf0GN60bZzz541Nw8VHs" />
        <link rel="canonical" href="https://omiichat.antideploy.app/" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('omii_theme') || localStorage.getItem('theme');
                  var root = document.documentElement;
                  if (saved === 'light') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.setAttribute('data-theme', 'light');
                  } else {
                    root.classList.remove('light');
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-[100dvh] bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
