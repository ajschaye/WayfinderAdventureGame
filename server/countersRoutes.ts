/**
 * Routes for game counters API
 */
import { Router } from 'express';
import { getCounters, incrementVisits, incrementGamesPlayed } from './gameCounters';

const router = Router();

// Get current counter values
router.get('/api/counters', (req, res) => {
  res.json(getCounters());
});

// Increment visits counter
router.post('/api/counters/visit', (req, res) => {
  const newCount = incrementVisits();
  res.json({ visitsCount: newCount });
});

// Increment games played counter
router.post('/api/counters/game-played', (req, res) => {
  const newCount = incrementGamesPlayed();
  res.json({ gamesPlayedCount: newCount });
});

export default router;