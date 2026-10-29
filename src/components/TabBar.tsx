import { Link, useLocation } from 'react-router-dom';
import { Map, Camera, CalendarDays, BookOpen, CircleUserRound } from 'lucide-react';
import './tab-bar.css';

const tabs = [
  { path: '/', label: 'Map', Icon: Map },
  { path: '/report', label: 'Report', Icon: Camera },
  { path: '/events', label: 'Meetups', Icon: CalendarDays },
  { path: '/resources', label: 'Resources', Icon: BookOpen },
  { path: '/profile', label: 'Profile', Icon: CircleUserRound },
] as const;

/** Local adaptation of Dizko's compact, flush mobile dock. */
export default function TabBar() {
  const { pathname } = useLocation();
  const selected = pathname === '/report' ? '/report'
    : pathname.startsWith('/events') ? '/events'
    : pathname === '/resources' || pathname.startsWith('/resources/') ? '/resources'
    : pathname === '/directory' || pathname.startsWith('/directory/') ? '/resources'
    : ['/profile', '/admin', '/privacy'].includes(pathname) ? '/profile'
    : pathname === '/' || pathname.startsWith('/reports/') ? '/' : null;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-items">
        {tabs.map(({ path, label, Icon }) => (
          <Link key={path} to={path} className="bottom-nav-item"
            aria-current={selected === path ? 'page' : undefined}>
            <Icon className="bottom-nav-icon" size={22}
              strokeWidth={selected === path ? 2 : 1.5} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
