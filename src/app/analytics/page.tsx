"use client";

import { useState } from 'react';
import { FaFilter } from 'react-icons/fa';

// Mock players data with stats
const mockPlayers = [
  {
    id: '1',
    name: 'John Smith',
    jerseyNumber: '12',
    skillLevel: 4,
    stats: {
      avgBattingPosition: 3.5,
      gamesPlayed: 10,
      inningsPlayed: 54,
      infieldInnings: 36,
      outfieldInnings: 12,
      benchInnings: 6,
      positionCounts: {
        'pitcher': 12,
        'shortstop': 24,
        'second_base': 0,
        'third_base': 0,
        'first_base': 0,
        'catcher': 0,
        'left_field': 0,
        'left_center_field': 0,
        'right_center_field': 0,
        'right_field': 12,
        'bench': 6
      }
    }
  },
  {
    id: '2',
    name: 'Mike Johnson',
    jerseyNumber: '7',
    skillLevel: 3,
    stats: {
      avgBattingPosition: 4.2,
      gamesPlayed: 9,
      inningsPlayed: 48,
      infieldInnings: 30,
      outfieldInnings: 12,
      benchInnings: 6,
      positionCounts: {
        'pitcher': 0,
        'shortstop': 0,
        'second_base': 12,
        'third_base': 6,
        'first_base': 12,
        'catcher': 0,
        'left_field': 0,
        'left_center_field': 6,
        'right_center_field': 0,
        'right_field': 6,
        'bench': 6
      }
    }
  },
  {
    id: '3',
    name: 'Sarah Williams',
    jerseyNumber: '23',
    skillLevel: 5,
    stats: {
      avgBattingPosition: 2.1,
      gamesPlayed: 10,
      inningsPlayed: 60,
      infieldInnings: 42,
      outfieldInnings: 12,
      benchInnings: 6,
      positionCounts: {
        'pitcher': 18,
        'shortstop': 12,
        'second_base': 12,
        'third_base': 0,
        'first_base': 0,
        'catcher': 0,
        'left_field': 0,
        'left_center_field': 0,
        'right_center_field': 6,
        'right_field': 6,
        'bench': 6
      }
    }
  },
  {
    id: '4',
    name: 'Tyler Brown',
    jerseyNumber: '9',
    skillLevel: 2,
    stats: {
      avgBattingPosition: 8.7,
      gamesPlayed: 8,
      inningsPlayed: 42,
      infieldInnings: 6,
      outfieldInnings: 24,
      benchInnings: 12,
      positionCounts: {
        'pitcher': 0,
        'shortstop': 0,
        'second_base': 0,
        'third_base': 0,
        'first_base': 6,
        'catcher': 0,
        'left_field': 12,
        'left_center_field': 0,
        'right_center_field': 0,
        'right_field': 12,
        'bench': 12
      }
    }
  },
];

// Position data
const positions = [
  { id: 'pitcher', name: 'Pitcher', abbreviation: 'P' },
  { id: 'catcher', name: 'Catcher', abbreviation: 'C' },
  { id: 'first_base', name: '1st Base', abbreviation: '1B' },
  { id: 'second_base', name: '2nd Base', abbreviation: '2B' },
  { id: 'third_base', name: '3rd Base', abbreviation: '3B' },
  { id: 'shortstop', name: 'Shortstop', abbreviation: 'SS' },
  { id: 'left_field', name: 'Left Field', abbreviation: 'LF' },
  { id: 'left_center_field', name: 'Left-Center Field', abbreviation: 'LCF' },
  { id: 'right_center_field', name: 'Right-Center Field', abbreviation: 'RCF' },
  { id: 'right_field', name: 'Right Field', abbreviation: 'RF' },
  { id: 'bench', name: 'Bench', abbreviation: 'Bench' },
];

export default function AnalyticsPage() {
  const [players, setPlayers] = useState(mockPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Format a number as a percentage
  const formatPercentage = (value: number, total: number) => {
    return `${Math.round((value / total) * 100)}%`;
  };
  
  // Get the player detail for selected player
  const selectedPlayerData = selectedPlayer 
    ? players.find(p => p.id === selectedPlayer) 
    : null;

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-thunder-dark">Player Analytics</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaFilter className="mr-2" />
          Filters
        </button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              >
                <option value="all">All Games</option>
                <option value="last5">Last 5 Games</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opponent
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              >
                <option value="all">All Opponents</option>
                <option value="Red Sox">Red Sox</option>
                <option value="Yankees">Yankees</option>
                <option value="Cubs">Cubs</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content - split into two columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player list - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold">Players</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    selectedPlayer === player.id ? 'bg-thunder-primary/10 border-l-4 border-thunder-primary' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      {player.jerseyNumber}
                    </span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    <span className="mr-4">Games: {player.stats.gamesPlayed}</span>
                    <span>Avg. Batting: #{player.stats.avgBattingPosition.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Player details - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          {selectedPlayerData ? (
            <div className="bg-white rounded-lg shadow-md">
              {/* Player header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <span className="bg-thunder-primary text-white text-sm font-medium rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {selectedPlayerData.jerseyNumber}
                  </span>
                  <h2 className="text-xl font-semibold">{selectedPlayerData.name}</h2>
                </div>
              </div>
              
              {/* Player Stats */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Games Played</div>
                    <div className="text-2xl font-bold text-thunder-dark">
                      {selectedPlayerData.stats.gamesPlayed}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Avg. Batting Position</div>
                    <div className="text-2xl font-bold text-thunder-dark">
                      #{selectedPlayerData.stats.avgBattingPosition.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Innings Played</div>
                    <div className="text-2xl font-bold text-thunder-dark">
                      {selectedPlayerData.stats.inningsPlayed}
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-3">Playing Time Distribution</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-2">
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-500 mb-1">Infield</div>
                      <div className="text-xl font-bold text-thunder-primary">
                        {selectedPlayerData.stats.infieldInnings} innings
                        <span className="ml-1 text-sm font-normal">
                          ({formatPercentage(selectedPlayerData.stats.infieldInnings, selectedPlayerData.stats.inningsPlayed)})
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-500 mb-1">Outfield</div>
                      <div className="text-xl font-bold text-thunder-secondary">
                        {selectedPlayerData.stats.outfieldInnings} innings
                        <span className="ml-1 text-sm font-normal">
                          ({formatPercentage(selectedPlayerData.stats.outfieldInnings, selectedPlayerData.stats.inningsPlayed)})
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-500 mb-1">Bench</div>
                      <div className="text-xl font-bold text-gray-500">
                        {selectedPlayerData.stats.benchInnings} innings
                        <span className="ml-1 text-sm font-normal">
                          ({formatPercentage(selectedPlayerData.stats.benchInnings, selectedPlayerData.stats.inningsPlayed)})
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar representation */}
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-thunder-primary h-full" 
                        style={{ width: formatPercentage(selectedPlayerData.stats.infieldInnings, selectedPlayerData.stats.inningsPlayed) }}
                      ></div>
                      <div 
                        className="bg-thunder-secondary h-full" 
                        style={{ width: formatPercentage(selectedPlayerData.stats.outfieldInnings, selectedPlayerData.stats.inningsPlayed) }}
                      ></div>
                      <div 
                        className="bg-gray-400 h-full" 
                        style={{ width: formatPercentage(selectedPlayerData.stats.benchInnings, selectedPlayerData.stats.inningsPlayed) }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-3">Position Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Innings
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {positions.map((position) => {
                        const innings = selectedPlayerData.stats.positionCounts[position.id] || 0;
                        if (innings === 0) return null;
                        
                        return (
                          <tr key={position.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {position.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {innings}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div 
                                  className={`h-2 rounded-full mr-2 ${
                                    position.id === 'bench' ? 'bg-gray-400' :
                                    position.id.includes('field') ? 'bg-thunder-secondary' :
                                    'bg-thunder-primary'
                                  }`} 
                                  style={{ 
                                    width: `${Math.max(
                                      Math.round((innings / selectedPlayerData.stats.inningsPlayed) * 100), 
                                      4
                                    )}%` 
                                  }}
                                ></div>
                                {formatPercentage(innings, selectedPlayerData.stats.inningsPlayed)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-5xl text-gray-300 mb-4">⚾</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Player Selected</h3>
              <p className="text-gray-500">
                Select a player from the list to view detailed analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}