import { CalendarCheck,Flag,Leaf,Trophy } from 'lucide-react';
import { useMemo,useState } from 'react';
import { ErrorNotice,Loading,PageTitle } from '../components/common';
import SegmentedControl from '../components/arc/segmented-control/segmented-control';
import { useData } from '../api';
import { rankLeaderboard,type LeaderboardEntry,type LeaderboardMetric } from '../../shared/leaderboard.ts';
import './leaderboard.css';

const options=[
  {value:'overall',label:'Overall'},
  {value:'reports',label:'Reports'},
  {value:'meetups',label:'Meetups'},
];

export default function Leaderboard(){
  const [metric,setMetric]=useState<LeaderboardMetric>('overall');
  const {data,error,loading}=useData<{entries:LeaderboardEntry[]}>('/leaderboard');
  const entries=useMemo(()=>rankLeaderboard(data?.entries||[],metric),[data,metric]);
  return <div className="page narrow leaderboard-page">
    <PageTitle title="Leaderboard" description="People helping Goa through verified reports and confirmed meetup attendance."/>
    <section className="leaderboard-intro" aria-label="How the leaderboard works">
      <Trophy size={22} aria-hidden="true"/><p>Approved report <strong>+10</strong> · Resolved report <strong>+20</strong> · Confirmed meetup <strong>+15</strong></p>
    </section>
    <div className="leaderboard-controls">
      <SegmentedControl options={options} value={metric} onValueChange={value=>setMetric(value as LeaderboardMetric)} label="Rank people by"/>
      <p>Only verified actions count. Points have no cash value.</p>
    </div>
    {loading?<Loading/>:<><ErrorNotice message={error}/>{!error&&!entries.length?<div className="leaderboard-empty"><Leaf size={30}/><h2>No contributions yet</h2><p>The first verified report or confirmed meetup attendance will appear here.</p></div>:<ol className="leaderboard-list" aria-label={`${options.find(option=>option.value===metric)?.label} leaderboard`}>
      {entries.map(entry=><li key={entry.username} className="leaderboard-row">
        <span className="leaderboard-rank" aria-label={`Rank ${entry.rank}`}>{entry.rank}</span>
        <div className="leaderboard-person"><strong>{entry.username}</strong><span>{entry.totalPoints} contribution points</span></div>
        <dl className="leaderboard-stats">
          <div className={metric==='reports'?'selected':undefined}><dt><Flag size={15}/>Reports</dt><dd>{entry.reports}</dd></div>
          <div className={metric==='meetups'?'selected':undefined}><dt><CalendarCheck size={15}/>Meetups</dt><dd>{entry.meetups}</dd></div>
          <div className={metric==='overall'?'selected':undefined}><dt><Leaf size={15}/>Points</dt><dd>{entry.totalPoints}</dd></div>
        </dl>
      </li>)}
    </ol>}</>}
  </div>;
}
