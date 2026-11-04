/**
 * Sliding-window rate limiter with repeat-message detection.
 * Enforces max 5 messages per 5 seconds per socket,
 * and rejects identical consecutive messages.
 */

interface RateLimitEntry {
  timestamps: number[];
  lastMessages: string[];
}

const MAX_MESSAGES = 5;
const WINDOW_MS = 5_000;
const REPEAT_BUFFER_SIZE = 3;

export class RateLimiter {
  private entries = new Map<string, RateLimitEntry>();

  /**
   * Check if a message should be allowed.
   * @returns Object with allowed status, retry delay, and repeat flag
   */
  check(socketId: string, message: string): {
    allowed: boolean;
    retryAfterMs: number;
    isRepeat: boolean;
  } {
    const now = Date.now();
    let entry = this.entries.get(socketId);

    if (!entry) {
      entry = { timestamps: [], lastMessages: [] };
      this.entries.set(socketId, entry);
    }

    // Prune timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);

    // Check for identical consecutive messages (reject spamming the exact same message back-to-back)
    const normalized = message.trim().toLowerCase();
    if (entry.lastMessages.length > 0) {
      const immediateLast = entry.lastMessages[entry.lastMessages.length - 1];
      if (immediateLast === normalized && normalized.length > 1) {
        return { allowed: false, retryAfterMs: 0, isRepeat: true };
      }
    }

    // Check rate limit
    if (entry.timestamps.length >= MAX_MESSAGES) {
      const oldest = entry.timestamps[0];
      const retryAfterMs = WINDOW_MS - (now - oldest);
      return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs), isRepeat: false };
    }

    // Allow — record the message
    entry.timestamps.push(now);
    entry.lastMessages.push(normalized);
    if (entry.lastMessages.length > REPEAT_BUFFER_SIZE) {
      entry.lastMessages.shift();
    }

    return { allowed: true, retryAfterMs: 0, isRepeat: false };
  }

  /** Clean up when a socket or IP disconnects */
  remove(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;
    const now = Date.now();
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) {
      this.entries.delete(key);
    }
  }
}
