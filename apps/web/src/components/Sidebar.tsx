"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// SVG Icon Components
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const QnsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BridgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 15a9 9 0 0 0 18 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Sidebar = () => {
  const currentUser = useCurrentUser();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="bg-black border-r border-border flex flex-col justify-between py-8 px-6">
      <div className="">
        <img src="/assets/logo.png" alt="Synq Logo" className="h-8 mb-12 px-2" />
        <nav className="space-y-8"> {/* Added space-y for consistent margin */}
          <div className="mb-8"> {/* Grouping for dashboard nav */}
            <h2 className="text-xs text-text-secondary font-medium tracking-wider mb-4 px-2">DASHBOARD</h2>
            <Link href="/dashboard/social" className={`flex items-center gap-3 py-3 px-2 rounded-lg text-text-secondary font-medium transition-all duration-200 ease-in-out hover:bg-surface hover:text-text-primary ${isActive('/dashboard/social') ? 'bg-primary text-text-primary' : ''}`}>
              <ActivityIcon className="w-5 h-5" />
              <span>Social Activity</span>
            </Link>
            <Link href="/qns/profile" className={`flex items-center gap-3 py-3 px-2 rounded-lg text-text-secondary font-medium transition-all duration-200 ease-in-out hover:bg-surface hover:text-text-primary ${isActive('/qns/profile') ? 'bg-primary text-text-primary' : ''}`}>
              <QnsIcon className="w-5 h-5" />
              <span>QNS</span>
            </Link>
            <Link href="/dashboard/bridge" className={`flex items-center gap-3 py-3 px-2 rounded-lg text-text-secondary font-medium transition-all duration-200 ease-in-out hover:bg-surface hover:text-text-primary ${isActive('/dashboard/bridge') ? 'bg-primary text-text-primary' : ''}`}>
              <BridgeIcon className="w-5 h-5" />
              <span>Bridge</span>
            </Link>
            <Link href="/dashboard/overview" className={`flex items-center gap-3 py-3 px-2 rounded-lg text-text-secondary font-medium transition-all duration-200 ease-in-out hover:bg-surface hover:text-text-primary ${isActive('/dashboard/overview') ? 'bg-primary text-text-primary' : ''}`}>
              <UserIcon className="w-5 h-5" />
              <span>User Overview</span>
            </Link>
            {/* <Link href="/dashboard/analytics" className="nav-link">
              <AnalyticsIcon />
              <span>Analytics</span>
            </Link> */}
          </div>
          <div> {/* Grouping for other nav */}
            <h2 className="text-xs text-text-secondary font-medium tracking-wider mb-4 px-2">OTHER</h2>
            <Link href="/dashboard/settings" className={`flex items-center gap-3 py-3 px-2 rounded-lg text-text-secondary font-medium transition-all duration-200 ease-in-out hover:bg-surface hover:text-text-primary ${isActive('/dashboard/settings') ? 'bg-primary text-text-primary' : ''}`}>
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>
      </div>
      <div className="pt-6 border-t border-border">
        <Link href="/dashboard/profile">
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-surface" >
              <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                <img src={currentUser.profileImg} className="w-auto h-full" alt="Your Profile Image" />
              </div>
              <div className="flex flex-col flex-grow">
                  <span className="font-medium text-text-primary">{currentUser.name}</span>
                  <span className="text-sm text-text-secondary">@{currentUser.username}</span>
              </div>
              <ChevronDownIcon className="text-text-secondary" />
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
