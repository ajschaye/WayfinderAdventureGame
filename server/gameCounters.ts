/**
 * Simple in-memory storage for game counters
 */

// Counter interface
export interface GameCounters {
  visitsCount: number;
  gamesPlayedCount: number;
}

// In-memory storage for counters
let counters: GameCounters = {
  visitsCount: 0,
  gamesPlayedCount: 0
};

/**
 * Get current counter values
 */
export function getCounters(): GameCounters {
  return { ...counters };
}

/**
 * Increment visit counter
 */
export function incrementVisits(): number {
  counters.visitsCount += 1;
  return counters.visitsCount;
}

/**
 * Increment games played counter
 */
export function incrementGamesPlayed(): number {
  counters.gamesPlayedCount += 1;
  return counters.gamesPlayedCount;
}

/**
 * Reset counters (for testing only)
 */
export function resetCounters(): void {
  counters = {
    visitsCount: 0,
    gamesPlayedCount: 0
  };
}