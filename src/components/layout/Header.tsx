// src/components/layout/Header.tsx
"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaUser } from 'react-icons/fa';

const Header = () => {
  const pathname = usePathname();
  const [activeTeam, setActiveTeam] = useState("2025 Ohio Thunder");
  
  // Get the page title based on the current path
  const getPageTitle = () => {
    const path = pathname || '';
    if (path === '/') return 'Dashboard';
    return path.split('/')[1].charAt(0).toUpperCase() + path.split('/')[1].slice(1);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-thunder-dark">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <select 
            className="appearance-none bg-thunder-background border border-gray-300 text-thunder-dark py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
            value={activeTeam}
            onChange={(e) => setActiveTeam(e.target.value)}
          >
            <option value="2025 Ohio Thunder">2025 Ohio Thunder</option>
            <option value="2026 Ohio Thunder">2026 Ohio Thunder</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-thunder-primary rounded-full h-8 w-8 flex items-center justify-center text-white">
            <FaUser />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;