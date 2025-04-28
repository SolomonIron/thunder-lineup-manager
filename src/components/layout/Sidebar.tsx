// src/components/layout/Sidebar.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBaseballBall, FaUserFriends, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { MdOutlineSettings, MdSportsCricket } from 'react-icons/md';
import { GiBaseballGlove } from 'react-icons/gi';

const Sidebar = () => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <FaBaseballBall className="text-xl" /> },
    { name: 'Teams', href: '/teams', icon: <FaUserFriends className="text-xl" /> },
    { name: 'Games', href: '/games', icon: <FaCalendarAlt className="text-xl" /> },
    { name: 'Lineups', href: '/lineups', icon: <MdSportsCricket className="text-xl" /> },
    { name: 'Positions', href: '/positions', icon: <GiBaseballGlove className="text-xl" /> },
    { name: 'Analytics', href: '/analytics', icon: <FaChartLine className="text-xl" /> },
    { name: 'Settings', href: '/settings', icon: <MdOutlineSettings className="text-xl" /> },
  ];

  return (
    <div
      className={`${
        expanded ? 'w-64' : 'w-20'
      } bg-thunder-primary text-white transition-width duration-300 ease-in-out h-screen shadow-lg fixed`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-20 border-b border-thunder-primary/20">
          <div className="flex items-center p-4">
            {/* Replace with actual logo */}
            <div className="flex items-center justify-center bg-white rounded-full h-10 w-10 overflow-hidden">
              <MdSportsCricket className="text-thunder-primary text-2xl" />
            </div>
            {expanded && (
              <span className="ml-3 font-bold text-lg">Thunder Lineup</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 pt-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg hover:bg-thunder-primary/80 transition-colors ${
                      pathname === item.href
                        ? 'bg-thunder-secondary text-thunder-dark font-medium'
                        : ''
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {item.icon}
                    </span>
                    {expanded && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-thunder-primary/20">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-thunder-primary/80 transition-colors"
          >
            <svg
              className={`h-6 w-6 transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;