import { Router } from 'express';
import { z } from 'zod';
import { pool } from './db.ts';
import { rate,clientIp } from './security.ts';
import type { LeaderboardEntry } from '../shared/leaderboard.ts';

export const leaderboard=Router();

leaderboard.get('/',async(req,res)=>{
  const metric=z.enum(['overall','reports','meetups']).default('overall').parse(req.query.metric);
  // Select only a fixed SQL ordering; user input is never interpolated into SQL.
  const order={overall:'total_points DESC,reports DESC,meetups DESC,p.username',reports:'reports DESC,total_points DESC,meetups DESC,p.username',meetups:'meetups DESC,total_points DESC,reports DESC,p.username'}[metric];
  await rate('leaderboard:'+clientIp(req),120,60);
  const rows=(await pool.query(`
    SELECT p.username,
      sum(l.points)::int AS total_points,
      coalesce(sum(l.points) FILTER (WHERE l.reason IN ('report_approved','report_resolved')),0)::int AS report_points,
      coalesce(sum(l.points) FILTER (WHERE l.reason='event_attendance'),0)::int AS meetup_points,
      count(DISTINCT l.source_id) FILTER (WHERE l.reason IN ('report_approved','report_resolved'))::int AS reports,
      count(DISTINCT l.source_id) FILTER (WHERE l.reason='event_attendance')::int AS meetups
    FROM points_ledger l
    JOIN profiles p ON p.id=l.user_id
    JOIN users_private u ON u.id=l.user_id
    WHERE u.deleted_at IS NULL
    GROUP BY p.id,p.username
    HAVING sum(l.points)>0
    ORDER BY ${order}
    LIMIT 100`)).rows;
  const entries:LeaderboardEntry[]=rows.map(row=>({
    username:row.username,totalPoints:row.total_points,reportPoints:row.report_points,
    meetupPoints:row.meetup_points,reports:row.reports,meetups:row.meetups,
  }));
  res.set('Cache-Control','public, max-age=30, stale-while-revalidate=120').json({entries,metric});
});
