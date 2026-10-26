import { QueueUser, MatchResult, IMatchingQueue } from './types';

/**
 * How long to wait for an interest-based match before
 * falling back to matching with anyone available.
 */
const INTEREST_MATCH_TIMEOUT_MS = 10_000;

/**
 * In-memory matching queue.
 * For production, implement IMatchingQueue with Redis Sorted Sets.
 */
export class MemoryQueue implements IMatchingQueue {
  private queue = new Map<string, QueueUser>();

  add(user: QueueUser): void {
    this.queue.set(user.socketId, user);
  }

  remove(socketId: string): QueueUser | undefined {
    const user = this.queue.get(socketId);
    if (user) this.queue.delete(socketId);
    return user;
  }

  getBySocketId(socketId: string): QueueUser | undefined {
    return this.queue.get(socketId);
  }

  getBySessionId(sessionId: string): QueueUser | undefined {
    for (const user of this.queue.values()) {
      if (user.sessionId === sessionId) return user;
    }
    return undefined;
  }

  size(): number {
    return this.queue.size;
  }

  /**
   * Run the matching algorithm:
   * 1. Sort users by join time (longest-waiting first)
   * 2. For each unmatched user, score all valid candidates
   * 3. If user waited <10s and has interests, require affinity score > 0
   * 4. After 10s, fall back to any non-blocked user
   * 5. Pick highest score, break ties by wait time
   */
  findMatches(): MatchResult[] {
    const results: MatchResult[] = [];
    const matched = new Set<string>();
    const now = Date.now();

    const users = Array.from(this.queue.values())
      .sort((a, b) => a.joinedAt - b.joinedAt);

    for (const user of users) {
      if (matched.has(user.socketId)) continue;

      let bestCandidate: QueueUser | null = null;
      let bestScore = -1;
      let bestShared: string[] = [];
      const userWaitedLong = (now - user.joinedAt) > INTEREST_MATCH_TIMEOUT_MS;

      for (const candidate of users) {
        // Skip: self, already matched, same session, or blocked pair
        if (candidate.socketId === user.socketId) continue;
        if (matched.has(candidate.socketId)) continue;
        if (candidate.sessionId === user.sessionId) continue;
        if (user.blockedSids.includes(candidate.sessionId)) continue;
        if (candidate.blockedSids.includes(user.sessionId)) continue;

        // Calculate affinity score
        const shared = user.interests.filter(i =>
          candidate.interests.map(c => c.toLowerCase()).includes(i.toLowerCase())
        );
        let score = shared.length * 10;

        if (
          user.language && candidate.language &&
          user.language.toLowerCase() === candidate.language.toLowerCase()
        ) {
          score += 5;
        }

        const candidateWaitedLong = (now - candidate.joinedAt) > INTEREST_MATCH_TIMEOUT_MS;

        // If neither has waited long enough and no affinity, keep waiting
        if (!userWaitedLong && !candidateWaitedLong && score === 0) {
          // Exception: if neither user specified interests, match immediately
          if (user.interests.length > 0 || candidate.interests.length > 0) {
            continue;
          }
        }

        // Prefer higher score; tie-break by longest wait
        if (
          score > bestScore ||
          (score === bestScore && bestCandidate && candidate.joinedAt < bestCandidate.joinedAt)
        ) {
          bestCandidate = candidate;
          bestScore = score;
          bestShared = shared;
        }
      }

      if (bestCandidate) {
        matched.add(user.socketId);
        matched.add(bestCandidate.socketId);
        results.push({
          user1: user,
          user2: bestCandidate,
          sharedInterests: bestShared,
        });
      }
    }

    return results;
  }
}
