// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaBaseballBall, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const Header = () => {
  const pathname = usePathname();
  const [teams, setTeams] = useState<any[]>([]);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      
      if (response.data.length > 0) {
        // Check if there's a stored team preference
        const storedTeamId = localStorage.getItem('activeTeamId');
        
        if (storedTeamId) {
          const storedTeam = response.data.find((t: any) => t.id === storedTeamId);
          if (storedTeam) {
            setActiveTeam(storedTeam);
            return;
          }
        }
        
        // Default to first team
        setActiveTeam(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value;
    const team = teams.find(t => t.id === teamId);
    setActiveTeam(team);
    
    // Store preference
    localStorage.setItem('activeTeamId', teamId);
  };

  // Get the page title based on the current path
  const getPageTitle = () => {
    const path = pathname || '';
    
    if (path === '/') return 'Dashboard';
    
    // Handle dynamic routes
    if (path.startsWith('/teams/') && path.includes('/roster')) {
      return 'Team Roster';
    }
    
    if (path.startsWith('/lineups/') && !path.includes('create')) {
      return 'Lineup Details';
    }
    
    // Handle static routes
    const routes: {[key: string]: string} = {
      '/teams': 'Teams',
      '/games': 'Games',
      '/lineups': 'Lineups',
      '/lineups/create': 'Create Lineup',
      '/positions': 'Positions',
      '/analytics': 'Analytics',
      '/settings': 'Settings'
    };
    
    return routes[path] || path.split('/')[1].charAt(0).toUpperCase() + path.split('/')[1].slice(1);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Mobile menu button and Title */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-4 md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
            <div className="hidden md:flex md:items-center">
              <h1 className="text-xl font-semibold text-thunder-dark">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          {/* Mobile Title - Center */}
          <div className="flex items-center md:hidden">
            <h1 className="text-lg font-semibold text-thunder-dark">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side - Team selector and user menu */}
          <div className="flex items-center space-x-4">
            {teams.length > 0 && (
              <div className="relative">
                <select 
                  className="appearance-none bg-thunder-background border border-gray-300 text-thunder-dark py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  value={activeTeam?.id || ''}
                  onChange={handleTeamChange}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-thunder-primary rounded-full h-8 w-8 flex items-center justify-center text-white focus:outline-none"
              >
                <FaUser />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl z-20">
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <Link 
                    href="/help" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Help
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${showMobileMenu ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-4 space-y-1 bg-white border-b border-gray-200">
          <Link 
            href="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-thunder-primary text-base font-medium text-thunder-dark bg-thunder-primary/10"
            onClick={() => setShowMobileMenu(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/teams"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            onClick={() => setShowMobileMenu(false)}
          >
            Teams
          </Link>
          <Link 
            href="/games"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            onClick={() => setShowMobileMenu(false)}
          >
            Games
          </Link>
          <Link 
            href="/lineups"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            onClick={() => setShowMobileMenu(false)}
          >
            Lineups
          </Link>
          <Link 
            href="/analytics"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            onClick={() => setShowMobileMenu(false)}
          >
            Analytics
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;