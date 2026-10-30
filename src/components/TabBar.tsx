import { Link, useLocation } from 'react-router-dom';
import { House, Map, Camera, CalendarDays, CircleUserRound } from 'lucide-react';
import './tab-bar.css';

const tabs = [
  { path: '/home', label: 'Home', Icon: House },
  { path: '/events', label: 'Meetups', Icon: CalendarDays },
  { path: '/map', label: 'Map', Icon: Map },
  { path: '/report', label: 'Document', Icon: Camera },
  { path: '/profile', label: 'Profile', Icon: CircleUserRound },
] as const;

/** Local adaptation of Dizko's compact, flush mobile dock. */
export default function TabBar() {
  const { pathname } = useLocation();
  const selected = pathname === '/home' || pathname.startsWith('/home/') ? '/home'
    : pathname === '/report' ? '/report'
    : pathname.startsWith('/events') ? '/events'
    : pathname.startsWith('/profile/') || ['/profile', '/admin', '/privacy'].includes(pathname) ? '/profile'
    : pathname === '/map' || pathname.startsWith('/reports/') ? '/map' : null;

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
