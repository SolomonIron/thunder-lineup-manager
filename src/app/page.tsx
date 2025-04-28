// src/app/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaBaseballBall, FaUserFriends, FaCalendarAlt } from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';

export default function Dashboard() {
  // Sample data
  const upcomingGames = [
    { id: 1, opponent: 'Red Sox', date: '2025-05-15', time: '10:00 AM', location: 'Field A' },
    { id: 2, opponent: 'Yankees', date: '2025-05-22', time: '1:00 PM', location: 'Field B' },
    { id: 3, opponent: 'Cubs', date: '2025-05-29', time: '3:30 PM', location: 'Field C' },
  ];

  const recentGames = [
    { id: 1, opponent: 'Tigers', date: '2025-05-01', result: 'W 12-5' },
    { id: 2, opponent: 'Royals', date: '2025-05-08', result: 'L 4-7' },
  ];

  const teamStats = {
    players: 13,
    games: 10,
    wins: 6,
    losses: 4,
  };

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Players" 
          value={teamStats.players} 
          icon={<FaUserFriends className="text-4xl text-thunder-primary" />} 
          href="/teams" 
        />
        <StatsCard 
          title="Games" 
          value={teamStats.games} 
          icon={<FaCalendarAlt className="text-4xl text-thunder-primary" />}
          href="/games" 
        />
        <StatsCard 
          title="Wins" 
          value={teamStats.wins} 
          icon={<FaBaseballBall className="text-4xl text-thunder-secondary" />}
          href="/analytics" 
        />
        <StatsCard 
          title="Losses" 
          value={teamStats.losses} 
          icon={<GiBaseballGlove className="text-4xl text-thunder-primary" />}
          href="/analytics" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-thunder-dark">Upcoming Games</h2>
            <Link href="/games" className="text-thunder-primary hover:text-thunder-primary/80">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingGames.map((game) => (
              <div key={game.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">vs {game.opponent}</h3>
                  <p className="text-sm text-gray-600">{game.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(game.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">{game.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-thunder-dark">Recent Games</h2>
            <Link href="/games" className="text-thunder-primary hover:text-thunder-primary/80">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentGames.map((game) => (
              <div key={game.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">vs {game.opponent}</h3>
                  <p className="text-sm text-gray-600">{new Date(game.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-white ${game.result.startsWith('W') ? 'bg-green-500' : 'bg-red-500'}`}>
                    {game.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-thunder-dark">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/lineups/create" className="bg-thunder-primary text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-thunder-primary/90 transition-colors">
            Create New Lineup
          </Link>
          <Link href="/teams/manage" className="bg-thunder-secondary text-thunder-dark py-4 px-6 rounded-lg flex items-center justify-center hover:bg-thunder-secondary/90 transition-colors">
            Manage Players
          </Link>
          <Link href="/games/create" className="bg-thunder-primary text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-thunder-primary/90 transition-colors">
            Schedule Game
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
const StatsCard = ({ title, value, icon, href }: { title: string, value: number, icon: React.ReactNode, href: string }) => {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-thunder-dark mt-1">{value}</p>
          </div>
          <div>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
};