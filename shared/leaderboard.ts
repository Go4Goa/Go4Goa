export type LeaderboardMetric = 'overall' | 'reports' | 'meetups';

export interface LeaderboardEntry {
  username: string;
  totalPoints: number;
  reportPoints: number;
  meetupPoints: number;
  reports: number;
  meetups: number;
}

export interface RankedLeaderboardEntry extends LeaderboardEntry { rank: number; }

function metricValue(entry: LeaderboardEntry, metric: LeaderboardMetric) {
  return metric === 'reports' ? entry.reports : metric === 'meetups' ? entry.meetups : entry.totalPoints;
}

export function rankLeaderboard(entries: LeaderboardEntry[], metric: LeaderboardMetric): RankedLeaderboardEntry[] {
  const sorted=[...entries].sort((a,b)=>{
    const primary=metricValue(b,metric)-metricValue(a,metric);
    if(primary)return primary;
    const points=b.totalPoints-a.totalPoints;if(points)return points;
    const reports=b.reports-a.reports;if(reports)return reports;
    const meetups=b.meetups-a.meetups;if(meetups)return meetups;
    return a.username.localeCompare(b.username);
  });
  let previous:number|undefined,rank=0;
  return sorted.map((entry,index)=>{const value=metricValue(entry,metric);if(value!==previous)rank=index+1;previous=value;return{...entry,rank};});
}
