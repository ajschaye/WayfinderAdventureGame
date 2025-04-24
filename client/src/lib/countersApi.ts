/**
 * API client for game counters
 */

// Counter types
export interface GameCounters {
  visitsCount: number;
  gamesPlayedCount: number;
}

/**
 * Fetch current counter values from the server
 */
export async function getCounters(): Promise<GameCounters> {
  try {
    const response = await fetch('/api/counters');
    if (!response.ok) {
      throw new Error('Failed to fetch counters');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching counters:', error);
    // Return default values if request fails
    return { visitsCount: 0, gamesPlayedCount: 0 };
  }
}

/**
 * Increment the visits counter on the server
 */
export async function incrementVisits(): Promise<number> {
  try {
    const response = await fetch('/api/counters/visit', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to increment visits counter');
    }
    const data = await response.json();
    return data.visitsCount;
  } catch (error) {
    console.error('Error incrementing visits:', error);
    return 0;
  }
}

/**
 * Increment the games played counter on the server
 */
export async function incrementGamesPlayed(): Promise<number> {
  try {
    const response = await fetch('/api/counters/game-played', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Failed to increment games played counter');
    }
    const data = await response.json();
    return data.gamesPlayedCount;
  } catch (error) {
    console.error('Error incrementing games played:', error);
    return 0;
  }
}