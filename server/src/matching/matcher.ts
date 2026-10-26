import { IMatchingQueue, MatchResult } from './types';
import { logger } from '../utils/logger';

/**
 * Periodically runs the matching algorithm and fires a callback
 * for each successful match. Separating this from the queue lets
 * us change match frequency or add debouncing independently.
 */
export class Matcher {
  private interval: NodeJS.Timeout | null = null;

  constructor(
    private queue: IMatchingQueue,
    private onMatch: (result: MatchResult) => void,
  ) {}

  /** Start the matching loop */
  start(intervalMs = 1000): void {
    if (this.interval) return;
    logger.info(`Matcher started (interval: ${intervalMs}ms)`);

    this.interval = setInterval(() => {
      const matches = this.queue.findMatches();
      for (const match of matches) {
        // Remove matched users from queue
        this.queue.remove(match.user1.socketId);
        this.queue.remove(match.user2.socketId);

        logger.debug(
          `Matched ${match.user1.nickname} ↔ ${match.user2.nickname}` +
          (match.sharedInterests.length
            ? ` (shared: ${match.sharedInterests.join(', ')})`
            : ' (random)')
        );

        this.onMatch(match);
      }
    }, intervalMs);
  }

  /** Stop the matching loop */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('Matcher stopped');
    }
  }
}
