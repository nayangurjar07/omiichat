import { API_BASE, SOCKET_URL } from '@/lib/endpoints';

/**
 * Centralized site branding and configuration for Omii.
 * Every place that displays the product name, tagline, description, or domain reads from here.
 */
export const siteConfig = {
  siteName: 'Omii',
  name: 'Omii',
  fullTitle: 'Omii: Anonymous Stranger Chat',
  tagline: 'Connect two strangers on the line.',
  description:
    'Instant anonymous 1-to-1 conversations. No account, no tracking. Just two people on a line.',
  domain: process.env.NEXT_PUBLIC_APP_URL || 'https://omii.chat',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://omii.chat',
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
  themeColor: '#2A5BD7',
  accentDial: '#2A5BD7',
  accentStranger: '#F4D35E',
  bgDark: '#0F131B',
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
