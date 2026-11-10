import { API_BASE, SOCKET_URL } from '@/lib/endpoints';

/**
 * Centralized site branding and configuration for Omii.
 * Every place that displays the product name, tagline, description, or domain reads from here.
 */
export const siteConfig = {
  siteName: 'OmiiChat',
  name: 'OmiiChat',
  fullTitle: 'OmiiChat | Free Omegle Alternative & Talk to Strangers Online',
  tagline: 'Free Omegle Alternative: Talk to Strangers Instantly',
  description:
    'Connect with people worldwide on OmiiChat, the ultimate free Omegle alternative. Talk to strangers via random text and video chat instantly with no sign-up.',
  domain: process.env.NEXT_PUBLIC_APP_URL || 'https://omiichat.antideploy.app',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://omiichat.antideploy.app',
  apiBase: API_BASE,
  socketUrl: SOCKET_URL,
  links: {
    github: 'https://github.com',
    rules: '/rules',
    faq: '/faq',
    privacy: '/privacy',
    terms: '/terms',
    contact: '/contact',
    rooms: '/rooms',
  },
  themeColor: '#2563EB',
  accentDial: '#2563EB',
  accentStranger: '#F1F5F9',
  bgDark: '#0B0F17',
  bgPaper: '#F2F4F7',
  creator: 'Omii Studio',
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Standard per-page title generator matching pattern "<Page> – Omii"
 */
export function getPageTitle(pageName: string): string {
  return `${pageName} – ${siteConfig.fullTitle}`;
}
