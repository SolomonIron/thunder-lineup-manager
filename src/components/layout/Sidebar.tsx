// src/components/layout/Sidebar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaBaseballBall,
  FaUserFriends,
  FaCalendarAlt,
  FaClipboardList,
  FaChartLine,
  FaChevronRight,
  FaCog,
  FaQuestionCircle,
  FaChevronLeft,
  FaChevronDown
} from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';
import axios from 'axios';

const Sidebar = () => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    teams: true,
    games: false,
    lineups: false
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      
      if (response.data.length > 0) {
        setActiveTeam(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections]
    });
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <div
      className={`${
        expanded ? 'w-64' : 'w-20'
      } bg-blue-700 text-white fixed left-0 top-0 h-full z-20 transition-all duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-20 border-b border-thunder-primary/20 px-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center bg-white rounded-full h-10 w-10 overflow-hidden">
              <FaBaseballBall className="text-thunder-primary text-2xl" />
            </div>
            {expanded && (
              <span className="ml-3 font-bold text-lg overflow-hidden whitespace-nowrap text-white">Thunder Lineup</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-thunder-primary/80 focus:outline-none text-white"
          >
            {expanded ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {/* Main Nav Items */}
            <NavItem 
              href="/" 
              icon={<FaHome />} 
              text="Dashboard" 
              expanded={expanded} 
              active={pathname === '/'}
            />

{/* Teams Section */}
<div className="pt-2">
              <button
                onClick={() => toggleSection('teams')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/teams') ? 'bg-yellow-400 text-gray-800' : 'text-white hover:bg-blue-600'
                }`}
              >
                <FaUserFriends className={`${expanded ? 'mr-3' : 'mx-auto'} text-xl`} />
                {expanded && (
                  <>
                    <span className="flex-1">Teams</span>
                    <FaChevronDown 
                      className={`transform transition-transform ${
                        expandedSections.teams ? 'rotate-180' : ''
                      }`} 
                    />
                  </>
                )}
              </button>
              
              {expanded && expandedSections.teams && (
                <div className="pl-10 mt-1 space-y-1">
                  <NavItem
                    href="/teams"
                    text="All Teams"
                    expanded={expanded}
                    active={pathname === '/teams'}
                    nested
                  />
                  {teams.map(team => (
                    <NavItem
                      key={team.id}
                      href={`/teams/${team.id}/roster`}
                      text={team.name}
                      expanded={expanded}
                      active={pathname?.includes(`/teams/${team.id}`)}
                      nested
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Games Section */}
            <div className="pt-2">
              <button
                onClick={() => toggleSection('games')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/games') ? 'bg-yellow-400 text-gray-800' : 'text-white hover:bg-blue-600'
                }`}
              >
                <FaCalendarAlt className={`${expanded ? 'mr-3' : 'mx-auto'} text-xl`} />
                {expanded && (
                  <>
                    <span className="flex-1">Games</span>
                    <FaChevronDown 
                      className={`transform transition-transform ${
                        expandedSections.games ? 'rotate-180' : ''
                      }`} 
                    />
                  </>
                )}
              </button>
              
              {expanded && expandedSections.games && (
                <div className="pl-10 mt-1 space-y-1">
                  <NavItem
                    href="/games"
                    text="All Games"
                    expanded={expanded}
                    active={pathname === '/games'}
                    nested
                  />
                  <NavItem
                    href="/games?filter=upcoming"
                    text="Upcoming Games"
                    expanded={expanded}
                    active={pathname === '/games' && pathname.includes('filter=upcoming')}
                    nested
                  />
                  <NavItem
                    href="/games?filter=past"
                    text="Past Games"
                    expanded={expanded}
                    active={pathname === '/games' && pathname.includes('filter=past')}
                    nested
                  />
                </div>
              )}
            </div>

            {/* Lineups Section */}
            <div className="pt-2">
              <button
                onClick={() => toggleSection('lineups')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/lineups') ? 'bg-yellow-400 text-gray-800' : 'text-white hover:bg-blue-600'
                }`}
              >
                <FaClipboardList className={`${expanded ? 'mr-3' : 'mx-auto'} text-xl`} />
                {expanded && (
                  <>
                    <span className="flex-1">Lineups</span>
                    <FaChevronDown 
                      className={`transform transition-transform ${
                        expandedSections.lineups ? 'rotate-180' : ''
                      }`} 
                    />
                  </>
                )}
              </button>
              
              {expanded && expandedSections.lineups && (
                <div className="pl-10 mt-1 space-y-1">
                  <NavItem
                    href="/lineups"
                    text="View Lineups"
                    expanded={expanded}
                    active={pathname === '/lineups'}
                    nested
                  />
                  <NavItem
                    href="/lineups/create"
                    text="Create Lineup"
                    expanded={expanded}
                    active={pathname === '/lineups/create'}
                    nested
                  />
                </div>
              )}
            </div>

            {/* Other Nav Items */}
            <NavItem 
              href="/positions" 
              icon={<GiBaseballGlove />} 
              text="Positions" 
              expanded={expanded} 
              active={isActive('/positions')}
            />
            
            <NavItem 
              href="/analytics" 
              icon={<FaChartLine />} 
              text="Analytics" 
              expanded={expanded} 
              active={isActive('/analytics')}
            />
            
            <div className="pt-4 mt-4 border-t border-thunder-primary/20">
              <NavItem 
                href="/settings" 
                icon={<FaCog />} 
                text="Settings" 
                expanded={expanded} 
                active={isActive('/settings')}
              />
              
              <NavItem 
                href="/help" 
                icon={<FaQuestionCircle />} 
                text="Help" 
                expanded={expanded} 
                active={isActive('/help')}
              />
            </div>
          </nav>
        </div>

        {/* Active Team Display */}
        {expanded && activeTeam && (
          <div className="p-4 border-t border-thunder-primary/20">
            <div className="flex items-center">
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center">
                <FaBaseballBall className="text-thunder-primary" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-white">{activeTeam.name}</div>
                <div className="text-xs text-white opacity-75">{activeTeam.season} Season</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// NavItem Component
const NavItem = ({ 
    href, 
    icon, 
    text, 
    expanded, 
    active,
    nested = false
  }: { 
    href: string, 
    icon?: React.ReactNode, 
    text: string, 
    expanded: boolean, 
    active: boolean,
    nested?: boolean
  }) => {
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          active 
            ? 'bg-yellow-400 text-gray-800' 
            : 'text-white hover:bg-blue-600'
        } ${nested ? 'text-xs' : ''}`}
      >
        {icon && (
          <span className={`${expanded ? 'mr-3' : 'mx-auto'} ${nested ? 'text-sm' : 'text-xl'}`}>
            {icon}
          </span>
        )}
        {expanded && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{text}</span>}
      </Link>
    );
  };

export default Sidebar;