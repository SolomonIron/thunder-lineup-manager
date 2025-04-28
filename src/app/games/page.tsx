"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
import axios from 'axios';

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [filter, setFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    teamId: '',
    opponentName: '',
    gameDate: '',
    time: '',
    location: '',
    opponentDifficulty: 3,
    outfielderCount: 4,
    playerCount: 10,
    notes: ''
  });

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch games when selected team changes
  useEffect(() => {
    if (teamId) {
      fetchGames();
    }
  }, [teamId]);

  // Function to fetch teams from API
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      
      // Set the first team as default if available
      if (response.data.length > 0) {
        setTeamId(response.data[0].id);
        setFormData(prev => ({
          ...prev,
          teamId: response.data[0].id
        }));
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    }
  };

  // Function to fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/games?teamId=${teamId}`);
      setGames(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'range') {
      setFormData({
        ...formData,
        [name]: parseInt(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Function to open the edit modal
  const openEditModal = (game = null) => {
    if (game) {
      // Format date for input field (YYYY-MM-DD)
      const gameDate = new Date(game.gameDate);
      const formattedDate = gameDate.toISOString().split('T')[0];
      
      // Get time (HH:MM)
      const hours = gameDate.getHours().toString().padStart(2, '0');
      const minutes = gameDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      setEditingGame(game);
      setFormData({
        teamId: game.teamId,
        opponentName: game.opponentName,
        gameDate: formattedDate,
        time: formattedTime,
        location: game.location || '',
        opponentDifficulty: game.opponentDifficulty,
        outfielderCount: game.outfielderCount,
        playerCount: game.playerCount,
        notes: game.notes || ''
      });
    } else {
      setEditingGame(null);
      setFormData({
        teamId,
        opponentName: '',
        gameDate: '',
        time: '',
        location: '',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 10,
        notes: ''
      });
    }
    setShowNewGameModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setEditingGame(null);
    setShowNewGameModal(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingGame) {
        // Update existing game
        await axios.put(`/api/games/${editingGame.id}`, formData);
      } else {
        // Create new game
        await axios.post('/api/games', formData);
      }
      
      // Refresh the games list
      await fetchGames();
      
      // Close the modal
      closeModal();
    } catch (err) {
      console.error('Error saving game:', err);
      setError('Failed to save game. Please try again.');
    }
  };

  // Function to delete a game
  const deleteGame = async (id) => {
    if (window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/games/${id}`);
        
        // Refresh the games list
        await fetchGames();
      } catch (err) {
        console.error('Error deleting game:', err);
        setError('Failed to delete game. Please try again.');
      }
    }
  };
  
  // Get the current date for filtering
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Filter games based on date and search term
  const filteredGames = games.filter(game => {
    const gameDate = new Date(game.gameDate);
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
        !game.opponentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !game.location?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());
  
  // Function to determine the difficulty badge color
  const getDifficultyColor = (difficulty) => {
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
  const getDifficultyText = (difficulty) => {
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

  // If no teams available, show message
  if (teams.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">You need to create a team before you can manage games.</p>
          <Link
            href="/teams"
            className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90"
          >
            Create a Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-thunder-dark">Game Schedule</h1>
          {teams.length > 0 && (
            <div className="mt-2">
              <select
                className="border border-gray-300 rounded-lg p-1"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          onClick={() => openEditModal()}
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaPlus className="mr-2" />
          Schedule Game
        </button>
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading games...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}

      {/* Filters */}
      {!loading && (
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
      )}

      {/* No games message */}
      {!loading && games.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaCalendarAlt className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-600">
            No games found for this team. Schedule your first game to get started!
          </p>
        </div>
      )}

      {/* Mobile view - cards */}
      {!loading && games.length > 0 && (
        <>
          <div className="block md:hidden space-y-4">
            {filteredGames.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No games found matching your filters.</p>
              </div>
            ) : (
              filteredGames.map((game) => {
                const gameDate = new Date(game.gameDate);
                const isPast = gameDate < currentDate;
                
                return (
                  <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className={`p-4 border-l-4 ${isPast ? 'border-gray-300' : 'border-thunder-primary'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-semibold text-thunder-dark">vs {game.opponentName}</h2>
                          <div className="mt-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="text-thunder-primary mr-1" />
                              <span>
                                {gameDate.toLocaleDateString()} at {gameDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-gray-500">{game.location}</span>
                            </div>
                          </div>
                        </div>
                        <span 
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(game.opponentDifficulty)}`}
                        >
                          {getDifficultyText(game.opponentDifficulty)}
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
              })
            )}
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
                  {filteredGames.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No games found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredGames.map((game) => {
                      const gameDate = new Date(game.gameDate);
                      const isPast = gameDate < currentDate;
                      
                      return (
                        <tr key={game.id} className={`hover:bg-gray-50 ${isPast ? 'bg-gray-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {gameDate.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {gameDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">vs {game.opponentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{game.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                getDifficultyColor(game.opponentDifficulty)
                              }`}
                            >
                              {getDifficultyText(game.opponentDifficulty)}
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* New/Edit Game Modal */}
      {showNewGameModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              {editingGame ? 'Edit Game' : 'Schedule New Game'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opponent
                </label>
                <input
                  type="text"
                  name="opponentName"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., Red Sox"
                  value={formData.opponentName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="gameDate"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                    value={formData.gameDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., Field A"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opponent Difficulty (1-5)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="opponentDifficulty"
                    min="1"
                    max="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.opponentDifficulty}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 - Easy</span>
                  <span>3 - Average</span>
                  <span>5 - Hard</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outfielders
                  </label>
                  <select
                    name="outfielderCount"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                    value={formData.outfielderCount}
                    onChange={handleInputChange}
                  >
                    <option value="3">3 Outfielders</option>
                    <option value="4">4 Outfielders</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Player Count
                  </label>
                  <input
                    type="number"
                    name="playerCount"
                    min="9"
                    max="20"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                    value={formData.playerCount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
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