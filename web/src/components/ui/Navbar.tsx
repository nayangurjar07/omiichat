'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileModal } from '@/components/auth/ProfileModal';
import { FriendsModal } from '@/components/friends/FriendsModal';
import { getCachedUser } from '@/lib/auth';
import { getStoredRequests } from '@/lib/friends';
import { siteConfig } from '@/config/site';
import { UserProfile } from '@/types';
import {
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  onlineCount?: number;
  inChat?: boolean;
  isConnected?: boolean;
  activeStrangerNickname?: string;
  onRetryConnection?: () => void;
}

export function Navbar({
  onlineCount = 0,
  inChat = false,
  isConnected = true,
  activeStrangerNickname,
  onRetryConnection,
}: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingReqCount, setPendingReqCount] = useState(0);

  useEffect(() => {
    setCurrentUser(getCachedUser());
  }, []);

  useEffect(() => {
    const checkRequests = () => {
      const reqs = getStoredRequests();
      const incoming = reqs.filter((r) => r.direction === 'incoming');
      setPendingReqCount(incoming.length);
    };
    checkRequests();
    const interval = setInterval(checkRequests, 3000);
    return () => clearInterval(interval);
  }, [isFriendsOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-paper)]/95 backdrop-blur-md border-b border-[var(--border-line)] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Wordmark */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0 group">
            <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[var(--text-ink)] select-none">
              omii
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-dial)] inline-block mb-1 group-hover:scale-125 transition-transform" />
          </Link>

          {/* Connection Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-line)] text-xs text-[var(--text-muted)]">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isConnected
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-alert)] animate-pulse'
              }`}
            />
            <span className="font-medium text-[11px] sm:text-xs">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {!isConnected && onRetryConnection && (
              <button
                type="button"
                onClick={onRetryConnection}
                className="ml-1 text-[11px] font-semibold text-[var(--accent-dial)] hover:underline cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-2">
            {!inChat && (
              <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[var(--text-muted)] mr-2">
                <Link
                  href="/chat"
                  className="hover:text-[var(--text-ink)] transition-colors"
                >
                  Start chat
                </Link>
                <Link
                  href="/rooms"
                  className="hover:text-[var(--text-ink)] transition-colors"
                >
                  Topic rooms
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFriendsOpen(true)}
                  className="relative hover:text-[var(--text-ink)] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Friends</span>
                  {pendingReqCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold animate-pulse">
                      {pendingReqCount}
                    </span>
                  )}
                </button>
                <Link
                  href="/rules"
                  className="hover:text-[var(--text-ink)] transition-colors"
                >
                  Rules
                </Link>
              </nav>
            )}

            {/* Profile / Sign in */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] text-[var(--text-ink)] border border-[var(--border-line)] transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[var(--accent-dial)]" />
                <span className="truncate max-w-[90px]">{currentUser.nickname}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="min-h-[44px] hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-dial)] hover:opacity-90 text-white transition-opacity cursor-pointer"
              >
                Account
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            {!inChat && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="md:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && !inChat && (
          <div className="md:hidden border-t border-[var(--border-line)] bg-[var(--bg-surface)] px-4 py-4 space-y-3">
            <Link
              href="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[var(--text-ink)] hover:text-[var(--accent-dial)]"
            >
              Start chat
            </Link>
            <Link
              href="/rooms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[var(--text-ink)] hover:text-[var(--accent-dial)]"
            >
              Topic rooms
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsFriendsOpen(true);
              }}
              className="w-full text-left py-2 text-sm font-medium text-[var(--text-ink)] hover:text-[var(--accent-dial)] cursor-pointer flex items-center justify-between"
            >
              <span>Friends</span>
              {pendingReqCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {pendingReqCount} new
                </span>
              )}
            </button>
            <Link
              href="/rules"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[var(--text-ink)] hover:text-[var(--accent-dial)]"
            >
              Rules & Safety
            </Link>
            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
                className="w-full mt-2 py-2.5 rounded-lg text-center text-sm font-semibold bg-[var(--accent-dial)] text-white"
              >
                Sign in / Register
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUserUpdated={(updated) => setCurrentUser(updated)}
          onLogout={() => {
            setCurrentUser(null);
            setIsProfileOpen(false);
          }}
        />
      )}

      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
      />
    </>
  );
}
