import test from 'node:test';
import assert from 'node:assert/strict';
import { rankLeaderboard, type LeaderboardEntry } from '../shared/leaderboard.ts';

const entries: LeaderboardEntry[] = [
  { username: 'bravo', totalPoints: 30, reportPoints: 0, meetupPoints: 30, reports: 0, meetups: 2 },
  { username: 'charlie', totalPoints: 20, reportPoints: 20, meetupPoints: 0, reports: 2, meetups: 0 },
  { username: 'alpha', totalPoints: 30, reportPoints: 30, meetupPoints: 0, reports: 1, meetups: 0 },
];

test('leaderboard ranks verified contributions with stable ties', () => {
  assert.deepEqual(rankLeaderboard(entries, 'overall').map(({ username, rank }) => [username, rank]), [
    ['alpha', 1], ['bravo', 1], ['charlie', 3],
  ]);
  assert.deepEqual(rankLeaderboard(entries, 'reports').map(({ username, rank }) => [username, rank]), [
    ['charlie', 1], ['alpha', 2], ['bravo', 3],
  ]);
  assert.deepEqual(rankLeaderboard(entries, 'meetups').map(({ username, rank }) => [username, rank]), [
    ['bravo', 1], ['alpha', 2], ['charlie', 2],
  ]);
});
