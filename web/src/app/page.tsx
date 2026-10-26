import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { HomePageClient } from '@/components/home/HomePageClient';

export const metadata: Metadata = {
  title: 'Omii: Stranger Chat – Talk to Random People Online (18+)',
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: 'Omii: Stranger Chat – Talk to Random People Online (18+)',
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omii: Stranger Chat – Talk to Random People Online (18+)',
    description: siteConfig.description,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
