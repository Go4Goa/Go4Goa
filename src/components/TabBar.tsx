import { Link, useLocation } from 'react-router-dom';
import { Map, Camera, CalendarDays, UserRound } from 'lucide-react';
import './tab-bar.css';

const tabs = [
  { path: '/', label: 'Map', Icon: Map },
  { path: '/report', label: 'Report', Icon: Camera },
  { path: '/events', label: 'Events', Icon: CalendarDays },
  { path: '/profile', label: 'Profile', Icon: UserRound },
] as const;

/** Web navigation with Apple HIG tab-bar hierarchy and accessible link semantics. */
export default function TabBar() {
  const { pathname } = useLocation();
  const selected = pathname === '/report' ? '/report'
    : pathname.startsWith('/events') ? '/events'
    : ['/profile', '/admin', '/privacy'].includes(pathname) ? '/profile'
    : pathname === '/' || pathname.startsWith('/reports/') ? '/' : null;

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map(({ path, label, Icon }) => (
        <Link key={path} to={path} className="tab-bar-item"
          aria-current={selected === path ? 'page' : undefined}>
          <Icon className="tab-bar-icon" size={24} strokeWidth={selected === path ? 2.1 : 1.8} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
