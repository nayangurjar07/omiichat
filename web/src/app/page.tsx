import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { HomePageClient } from '@/components/home/HomePageClient';

export const metadata: Metadata = {
  title: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
  description:
    'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
  alternates: {
    canonical: 'https://omiichat.antideploy.app/',
  },
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
  },
  openGraph: {
    title: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
    description:
      'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
    url: 'https://omiichat.antideploy.app/',
    siteName: 'OmiiChat',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
    description:
      'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
  },
};

export default function HomePage() {
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
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
