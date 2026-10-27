'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import {
  setStoredNickname,
  getStoredNickname,
  setStoredInterests,
  getStoredInterests,
  setStoredLanguage,
  getStoredLanguage,
} from '@/lib/session';
import { useSocket } from '@/hooks/useSocket';
import { Dice5, X, Shield, ArrowRight } from 'lucide-react';

const RANDOM_NICKNAMES = [
  'Cedar',
  'Marlin',
  'Otter',
  'Rowan',
  'Finch',
  'Sable',
  'Loom',
  'Tide',
  'Birch',
  'Kite',
];

const SUGGESTED_INTERESTS = [
  'music',
  'books',
  'film',
  'code',
  'design',
  'philosophy',
  'gaming',
  'travel',
];

export function HomePageClient() {
  const router = useRouter();
  const { onlineCount, isConnected, connectionState, retryConnection } = useSocket();

  const [nickname, setNickname] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [reconnectCodeInput, setReconnectCodeInput] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    const savedNick = getStoredNickname();
    if (savedNick) setNickname(savedNick);
    const savedInterests = getStoredInterests();
    if (savedInterests.length > 0) setInterests(savedInterests);
  }, []);

  const handleRandomizeNickname = () => {
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setNickname(random);
    setStoredNickname(random);
  };

  const handleAddInterest = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
    if (!clean || interests.includes(clean)) return;
    if (interests.length >= 5) {
      setErrorNotice('You can add up to 5 interests.');
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }
    const next = [...interests, clean];
    setInterests(next);
    setStoredInterests(next);
    setInterestInput('');
  };

  const handleRemoveInterest = (tag: string) => {
    const next = interests.filter((i) => i !== tag);
    setInterests(next);
    setStoredInterests(next);
  };

  const handleStartChat = () => {
    const finalNick = nickname.trim() || 'Anonymous';
    setStoredNickname(finalNick);
    setStoredInterests(interests);
    router.push('/chat');
  };

  const handleJoinByReconnect = (e: React.FormEvent) => {
    e.preventDefault();
    const code = reconnectCodeInput.trim().toUpperCase();
    if (!code) return;
    router.push(`/chat?reconnect=${encodeURIComponent(code)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-paper)] text-[var(--text-ink)] transition-colors">
      <Navbar onlineCount={onlineCount} isConnected={isConnected} onRetryConnection={retryConnection} />

      {/* Disconnection Banner */}
      {!isConnected && (
        <div className="w-full bg-[var(--bg-subtle)] border-b border-[var(--border-line)] px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <span>Can't reach the server. Check your connection, then try again.</span>
          <button
            type="button"
            onClick={retryConnection}
            className="font-semibold text-[var(--accent-dial)] hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="space-y-10">
          {/* Hero Section */}
          <section className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-ink)] leading-[1.08]">
              Talk with someone new.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Instant, anonymous 1-to-1 conversations. Two people connected on a switchboard line. No account required.
            </p>
          </section>

          {/* Setup / Launch Box */}
          <section className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-line)] shadow-[var(--shadow-subtle)] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nickname Input */}
              <div className="space-y-2">
                <label htmlFor="nickname-input" className="block text-xs font-semibold text-[var(--text-ink)]">
                  Your nickname
                </label>
                <div className="flex gap-2">
                  <input
                    id="nickname-input"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value.slice(0, 20));
                      setStoredNickname(e.target.value.slice(0, 20));
                    }}
                    placeholder="Anonymous"
                    maxLength={20}
                    className="flex-1 min-h-[44px] px-3.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-line)] text-sm text-[var(--text-ink)] placeholder-[var(--text-muted)] focus:border-[var(--accent-dial)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeNickname}
                    title="Pick random nickname"
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-ink)] transition-colors cursor-pointer"
                  >
                    <Dice5 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interests Input */}
              <div className="space-y-2">
                <label htmlFor="interest-input" className="block text-xs font-semibold text-[var(--text-ink)]">
                  Interests (optional, max 5)
                </label>
                <div className="flex gap-2">
                  <input
                    id="interest-input"
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest(interestInput);
                      }
                    }}
                    placeholder="e.g. music, film, books"
                    className="flex-1 min-h-[44px] px-3.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-line)] text-sm text-[var(--text-ink)] placeholder-[var(--text-muted)] focus:border-[var(--accent-dial)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInterest(interestInput)}
                    className="min-h-[44px] px-4 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] text-xs font-semibold text-[var(--text-ink)] transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Interest Tags */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-dial-subtle)] text-[var(--accent-dial)] border border-[var(--accent-dial)]/20"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(tag)}
                      aria-label={`Remove interest ${tag}`}
                      className="cursor-pointer hover:opacity-75"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span>Try:</span>
              {SUGGESTED_INTERESTS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddInterest(tag)}
                  className="px-2 py-0.5 rounded text-xs bg-[var(--bg-paper)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-ink)] border border-[var(--border-line)] transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>

            {errorNotice && (
              <p className="text-xs text-[var(--color-alert)]">{errorNotice}</p>
            )}

            {/* Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartChat}
                className="w-full sm:w-auto min-h-[48px] px-8 rounded-lg bg-[var(--accent-dial)] hover:bg-[var(--accent-dial-hover)] text-white text-sm font-semibold tracking-wide transition-colors shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Start chatting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Real Preview Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              How a conversation starts
            </h2>
            <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-xl border border-[var(--border-line)] space-y-3 max-w-xl">
              {/* Stranger Message */}
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">Stranger</span>
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-[var(--accent-stranger)] text-[var(--accent-stranger-ink)] text-sm font-medium">
                  Have you listened to that new ambient record yet?
                </div>
              </div>

              {/* Self Message */}
              <div className="flex flex-col items-end space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">You</span>
                <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-[var(--accent-dial)] text-white text-sm font-medium">
                  Playing it right now. The third track is remarkable.
                </div>
              </div>
            </div>
          </section>

          {/* Reconnect with Previous Partner */}
          <section className="p-5 rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] space-y-3 max-w-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text-ink)]">Have a 6-digit reconnect code?</h3>
              <p className="text-xs text-[var(--text-muted)]">
                If you traded a reconnect code with a previous partner, enter it to pick up where you left off.
              </p>
            </div>
            <form onSubmit={handleJoinByReconnect} className="flex gap-2">
              <input
                type="text"
                value={reconnectCodeInput}
                onChange={(e) => setReconnectCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                className="w-36 min-h-[44px] px-3 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-line)] font-mono text-sm uppercase tracking-wider text-[var(--text-ink)] text-center focus:border-[var(--accent-dial)] transition-colors"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-line)] text-xs font-semibold text-[var(--text-ink)] transition-colors cursor-pointer"
              >
                Reconnect
              </button>
            </form>
          </section>

          {/* SEO FAQ Section */}
          <section className="space-y-4 pt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-ink)]">
              Frequently Asked Questions About Stranger Chat
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-1.5 shadow-xs">
                <h3 className="text-sm font-bold text-[var(--text-ink)]">
                  How do I start talking to strangers online on Omii?
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Enter an optional nickname and interests, then press <strong>Start chatting</strong>. Our matching system connects you directly with another person on a private 1-on-1 line in seconds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-1.5 shadow-xs">
                <h3 className="text-sm font-bold text-[var(--text-ink)]">
                  Is Omii a free Omegle alternative?
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Yes. Omii is completely free with no registration or downloads required. It was designed as a modern, clean, and safe alternative to Omegle with interest matching, ephemeral voice notes, and instant skip controls.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-1.5 shadow-xs">
                <h3 className="text-sm font-bold text-[var(--text-ink)]">
                  Are conversations recorded or monitored?
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  No. Omii is built on ephemeral in-memory sockets. When either person leaves the line or skips, all in-flight messages are permanently erased. No chat logs or IP tracking are saved to disk.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-line)] space-y-1.5 shadow-xs">
                <h3 className="text-sm font-bold text-[var(--text-ink)]">
                  What if my internet disconnects during a conversation?
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  You can trade a 6-digit Reconnect Code with your partner at any time. If either person disconnects, simply enter the code to resume chatting without exchanging phone numbers or social handles.
                </p>
              </div>
            </div>
          </section>

          {/* Honest Safety & Ephemerality Note */}
          <section className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-line)] text-xs text-[var(--text-muted)] leading-relaxed">
            <Shield className="w-4 h-4 text-[var(--accent-dial)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-ink)]">Safety & Privacy: </span>
              All chats are ephemeral. Voice notes and images are stored temporarily in memory and deleted when the session ends. No conversation logs or IP history are kept.
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
