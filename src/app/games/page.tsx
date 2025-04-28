"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';

// Mock games data
const mockGames = [
  { 
    id: '1', 
    opponent: 'Red Sox', 
    date: '2025-05-15', 
    time: '10:00 AM', 
    location: 'Field A', 
    difficulty: 3,
    hasLineup: true 
  },
  { 
    id: '2', 
    opponent: 'Yankees', 
    date: '2025-05-22', 
    time: '1:00 PM', 
    location: 'Field B', 
    difficulty: 5,
    hasLineup: true 
  },
  { 
    id: '3', 
    opponent: 'Cubs', 
    date: '2025-05-29', 
    time: '3:30 PM', 
    location: 'Field C', 
    difficulty: 1,
    hasLineup: false 
  },
  { 
    id: '4', 
    opponent: 'Dodgers', 
    date: '2025-06-05', 
    time: '10:00 AM', 
    location: 'Field A', 
    difficulty: 4,
    hasLineup: false 
  },
  { 
    id: '5', 
    opponent: 'Astros', 
    date: '2025-06-12', 
    time: '1:00 PM', 
    location: 'Field B', 
    difficulty: 2,
    hasLineup: false 
  },
];

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState(mockGames);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get the current date for filtering
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Filter games based on date and search term
  const filteredGames = games.filter(game => {
    const gameDate = new Date(game.date);
    gameDate.setHours(0, 0, 0, 0);
    
    // Date filter
    if (filter === 'upcoming' && gameDate < currentDate) {
      return false;
    }
    if (filter === 'past' && gameDate >= currentDate) {
      return false;
    }
    
    // Search term filter
    if (searchTerm && 
        !game.opponent.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !game.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Function to open the edit modal
  const openEditModal = (game: any = null) => {
    setEditingGame(game);
    setShowNewGameModal(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setEditingGame(null);
    setShowNewGameModal(false);
  };
  
  // Function to delete a game
  const deleteGame = (id: string) => {
    if (window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      setGames(games.filter(game => game.id !== id));
    }
  };
  
  // Function to determine the difficulty badge color
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-green-200 text-green-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 4:
        return 'bg-orange-100 text-orange-800';
      case 5:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to render difficulty text
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Moderate';
      case 3:
        return 'Average';
      case 4:
        return 'Challenging';
      case 5:
        return 'Hard';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-thunder-dark">Game Schedule</h1>
        <button
          onClick={() => openEditModal()}
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaPlus className="mr-2" />
          Schedule Game
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-1 flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-thunder-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'upcoming'
                  ? 'bg-thunder-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'past'
                  ? 'bg-thunder-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Past Games
            </button>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by opponent or location"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile view - cards */}
      <div className="block md:hidden space-y-4">
        {filteredGames.map((game) => {
          const gameDate = new Date(game.date);
          const isPast = gameDate < currentDate;
          
          return (
            <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`p-4 border-l-4 ${isPast ? 'border-gray-300' : 'border-thunder-primary'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-thunder-dark">vs {game.opponent}</h2>
                    <div className="mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-thunder-primary mr-1" />
                        <span>{new Date(game.date).toLocaleDateString()} at {game.time}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-gray-500">{game.location}</span>
                      </div>
                    </div>
                  </div>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(game.difficulty)}`}
                  >
                    {getDifficultyText(game.difficulty)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
                  {game.hasLineup ? (
                    <Link
                      href={`/lineups/${game.id}`}
                      className="w-full bg-thunder-secondary text-thunder-dark py-2 px-4 rounded-lg flex items-center justify-center hover:bg-thunder-secondary/90"
                    >
                      <FaClipboardList className="mr-2" />
                      View Lineup
                    </Link>
                  ) : (
                    <Link
                      href={`/lineups/create?gameId=${game.id}`}
                      className="w-full bg-thunder-primary text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-thunder-primary/90"
                    >
                      <FaClipboardList className="mr-2" />
                      Create Lineup
                    </Link>
                  )}
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => openEditModal(game)}
                      className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-200"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGame(game.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-red-600"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop view - table */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opponent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lineup
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGames.map((game) => {
                const gameDate = new Date(game.date);
                const isPast = gameDate < currentDate;
                
                return (
                  <tr key={game.id} className={`hover:bg-gray-50 ${isPast ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(game.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{game.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">vs {game.opponent}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{game.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getDifficultyColor(game.difficulty)
                        }`}
                      >
                        {getDifficultyText(game.difficulty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {game.hasLineup ? (
                        <Link
                          href={`/lineups/${game.id}`}
                          className="text-thunder-secondary hover:text-thunder-secondary/80"
                        >
                          <FaClipboardList className="inline-block text-xl" />
                        </Link>
                      ) : (
                        <Link
                          href={`/lineups/create?gameId=${game.id}`}
                          className="text-thunder-primary hover:text-thunder-primary/80"
                        >
                          <FaPlus className="inline-block text-xl" />
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => openEditModal(game)}
                          className="text-thunder-primary hover:text-thunder-primary/80"
                          title="Edit Game"
                        >
                          <FaEdit className="text-xl" />
                        </button>
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete Game"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredGames.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No games found. Schedule a new game to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New/Edit Game Modal */}
      {showNewGameModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              {editingGame ? 'Edit Game' : 'Schedule New Game'}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opponent
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., Red Sox"
                  defaultValue={editingGame?.opponent || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                    defaultValue={editingGame?.date || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                    defaultValue={editingGame?.time ? editingGame.time.substring(0, 5) : ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., Field A"
                  defaultValue={editingGame?.location || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opponent Difficulty (1-5)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    defaultValue={editingGame?.difficulty || 3}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 - Easy</span>
                  <span>3 - Average</span>
                  <span>5 - Hard</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90"
                >
                  {editingGame ? 'Update Game' : 'Schedule Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}