import { Outlet } from 'react-router-dom';
import HomeButton from './HomeButton';
import GlobalNav from './GlobalNav';

export default function AppShell() {
  return (
    <div className="theme-shell">
      <div className="dreamy-orb one" />
      <div className="dreamy-orb two" />
      <GlobalNav />
      <div className="app-shell">
        <Outlet />
      </div>
      <HomeButton />
    </div>
  );
}
