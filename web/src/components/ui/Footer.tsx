'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-line)] bg-[var(--bg-paper)] py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[var(--border-line)]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight text-[var(--text-ink)] select-none">
              omii
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Two strangers on the line.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
            <Link href="/chat" className="hover:text-[var(--text-ink)] transition-colors">
              Chat
            </Link>
            <Link href="/rooms" className="hover:text-[var(--text-ink)] transition-colors">
              Rooms
            </Link>
            <Link href="/rules" className="hover:text-[var(--text-ink)] transition-colors">
              Rules
            </Link>
            <Link href="/faq" className="hover:text-[var(--text-ink)] transition-colors">
              FAQ
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-ink)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-ink)] transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-[var(--text-ink)] transition-colors">
              Contact
            </Link>
            <Link href="/admin" className="hover:text-[var(--text-ink)] transition-colors">
              Admin
            </Link>
          </nav>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>
            Safe 1-on-1 conversations for everyone. Voice notes and photos vanish when chat ends.
          </p>
          <p>© {new Date().getFullYear()} {siteConfig.siteName}. Human-made.</p>
        </div>
      </div>
    </footer>
  );
}
