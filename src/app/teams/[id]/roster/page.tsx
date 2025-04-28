"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';
import axios from 'axios';

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
];

export default function TeamRosterPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [filterActive, setFilterActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    jerseyNumber: '',
    skillLevel: 3,
    active: true,
    preferredPositions: [] as string[],
    avoidPositions: [] as string[]
  });

  // Fetch team and players data on component mount
  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchPlayers();
    }
  }, [teamId]);

  // Function to fetch team from API
  const fetchTeam = async () => {
    try {
      const response = await axios.get(`/api/teams/${teamId}`);
      setTeam(response.data);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to load team details. Please try again.');
    }
  };

  // Function to fetch players from API
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/players?teamId=${teamId}`);
      setPlayers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get the filtered players based on active status and search term
  const filteredPlayers = players.filter(player => 
    (!filterActive || player.active) && 
    (player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     player.jerseyNumber?.includes(searchTerm))
  );

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Function to handle skill level change
  const handleSkillLevelChange = (level: number) => {
    setFormData({
      ...formData,
      skillLevel: level
    });
  };

  // Function to toggle position selection
  const togglePosition = (positionId: string, listType: 'preferredPositions' | 'avoidPositions') => {
    const currentList = [...formData[listType]];
    const index = currentList.indexOf(positionId);
    
    if (index === -1) {
      // Add to this list
      currentList.push(positionId);
      
      // If adding to preferred, remove from avoid (and vice versa)
      const otherListType = listType === 'preferredPositions' ? 'avoidPositions' : 'preferredPositions';
      const otherList = [...formData[otherListType]];
      const otherIndex = otherList.indexOf(positionId);
      
      if (otherIndex !== -1) {
        otherList.splice(otherIndex, 1);
        setFormData({
          ...formData,
          [listType]: currentList,
          [otherListType]: otherList
        });
      } else {
        setFormData({
          ...formData,
          [listType]: currentList
        });
      }
    } else {
      // Remove from list
      currentList.splice(index, 1);
      setFormData({
        ...formData,
        [listType]: currentList
      });
    }
  };

  // Function to open the player modal
  const openPlayerModal = (player = null) => {
    if (player) {
      // Map position preferences to arrays
      const preferredPositions = player.positionPreferences
        ?.filter(pref => pref.preferenceLevel >= 4 && pref.allowed)
        .map(pref => pref.position) || [];
      
      const avoidPositions = player.positionPreferences
        ?.filter(pref => pref.preferenceLevel <= 2 || !pref.allowed)
        .map(pref => pref.position) || [];
      
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        jerseyNumber: player.jerseyNumber || '',
        skillLevel: player.skillLevel,
        active: player.active,
        preferredPositions,
        avoidPositions
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        jerseyNumber: '',
        skillLevel: 3,
        active: true,
        preferredPositions: [],
        avoidPositions: []
      });
    }
    setShowPlayerModal(true);
  };

  // Function to close the modal
  const closePlayerModal = () => {
    setEditingPlayer(null);
    setShowPlayerModal(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert position preferences to the format expected by the API
      const positionPreferences = [
        ...formData.preferredPositions.map(position => ({
          position,
          preferenceLevel: 5,
          allowed: true
        })),
        ...formData.avoidPositions.map(position => ({
          position,
          preferenceLevel: 1,
          allowed: false
        })),
        // Add neutral positions (not in either list)
        ...positions
          .filter(pos => 
            !formData.preferredPositions.includes(pos.id) && 
            !formData.avoidPositions.includes(pos.id)
          )
          .map(pos => ({
            position: pos.id,
            preferenceLevel: 3,
            allowed: true
          }))
      ];
      
      const playerData = {
        teamId,
        name: formData.name,
        jerseyNumber: formData.jerseyNumber,
        skillLevel: formData.skillLevel,
        active: formData.active,
        positionPreferences
      };
      
      if (editingPlayer) {
        // Update existing player
        await axios.put(`/api/players/${editingPlayer.id}`, playerData);
      } else {
        // Create new player
        await axios.post('/api/players', playerData);
      }
      
      // Refresh the players list
      await fetchPlayers();
      
      // Close the modal
      closePlayerModal();
    } catch (err) {
      console.error('Error saving player:', err);
      setError('Failed to save player. Please try again.');
    }
  };

  // Function to delete a player
  const deletePlayer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/players/${id}`);
        
        // Refresh the players list
        await fetchPlayers();
      } catch (err) {
        console.error('Error deleting player:', err);
        setError('Failed to delete player. Please try again.');
      }
    }
  };

  // Function to toggle player active status
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`/api/players/${id}`, {
        active: !currentStatus
      });
      
      // Refresh the players list
      await fetchPlayers();
    } catch (err) {
      console.error('Error updating player status:', err);
      setError('Failed to update player status. Please try again.');
    }
  };

  // Function to render skill level stars
  const renderSkillLevel = (level: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= level ? (
              <FaStar className="text-thunder-secondary" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-thunder-dark">Team Roster</h1>
          {team && (
            <p className="text-gray-600">{team.name} • {team.season}</p>
          )}
        </div>
        <button
          onClick={() => openPlayerModal()}
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaPlus className="mr-2" />
          Add Player
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or jersey number"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activeOnly"
              className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
              checked={filterActive}
              onChange={() => setFilterActive(!filterActive)}
            />
            <label htmlFor="activeOnly" className="ml-2 block text-sm text-gray-700">
              Active players only
            </label>
          </div>
        </div>
      </div>

      {/* No players message */}
      {players.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <GiBaseballGlove className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-600">
            No players found for this team. Add your first player to get started!
          </p>
        </div>
      )}

      {/* Mobile view - cards */}
      {players.length > 0 && (
        <>
          <div className="block sm:hidden space-y-4">
            {filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                className={`bg-white rounded-lg shadow-md p-4 ${!player.active ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="bg-thunder-primary text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        {player.jerseyNumber}
                      </span>
                      <h2 className="text-lg font-semibold text-thunder-dark">{player.name}</h2>
                    </div>
                    <div className="mt-2">{renderSkillLevel(player.skillLevel)}</div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => toggleActive(player.id, player.active)}
                      className={`p-2 rounded-full ${
                        player.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      title={player.active ? 'Active' : 'Inactive'}
                    >
                      {player.active ? '✓' : '✗'}
                    </button>
                    <button 
                      onClick={() => openPlayerModal(player)}
                      className="bg-thunder-primary text-white p-2 rounded-full hover:bg-thunder-primary/90"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => deletePlayer(player.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Preferred Positions</h3>
                  <div className="flex flex-wrap gap-1">
                    {player.positionPreferences
                      ?.filter(pref => pref.preferenceLevel >= 4 && pref.allowed)
                      .map(pref => {
                        const position = positions.find(p => p.id === pref.position);
                        return (
                          <span key={pref.position} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-thunder-primary text-white">
                            {position?.abbreviation || pref.position}
                          </span>
                        );
                      })}
                  </div>
                </div>
                
                {player.positionPreferences?.some(pref => pref.preferenceLevel <= 2 || !pref.allowed) && (
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Avoid Positions</h3>
                    <div className="flex flex-wrap gap-1">
                      {player.positionPreferences
                        ?.filter(pref => pref.preferenceLevel <= 2 || !pref.allowed)
                        .map(pref => {
                          const position = positions.find(p => p.id === pref.position);
                          return (
                            <span key={pref.position} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {position?.abbreviation || pref.position}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop view - table */}
          <div className="hidden sm:block overflow-hidden bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferred Positions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avoid Positions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className={`hover:bg-gray-50 ${!player.active ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.jerseyNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderSkillLevel(player.skillLevel)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {player.positionPreferences
                          ?.filter(pref => pref.preferenceLevel >= 4 && pref.allowed)
                          .map(pref => {
                            const position = positions.find(p => p.id === pref.position);
                            return (
                              <span key={pref.position} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-thunder-primary text-white">
                                {position?.abbreviation || pref.position}
                              </span>
                            );
                          })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {player.positionPreferences
                          ?.filter(pref => pref.preferenceLevel <= 2 || !pref.allowed)
                          .map(pref => {
                            const position = positions.find(p => p.id === pref.position);
                            return (
                              <span key={pref.position} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {position?.abbreviation || pref.position}
                              </span>
                            );
                          })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          player.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {player.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => toggleActive(player.id, player.active)}
                          className={`p-1 rounded-full ${
                            player.active
                              ? 'text-green-600 hover:text-green-900'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title={player.active ? 'Set Inactive' : 'Set Active'}
                        >
                          {player.active ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => openPlayerModal(player)}
                          className="text-thunder-primary hover:text-thunder-primary/80"
                          title="Edit Player"
                        >
                          <FaEdit className="text-xl" />
                        </button>
                        <button
                          onClick={() => deletePlayer(player.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete Player"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Player Modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., John Smith"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number
                </label>
                <input
                  type="text"
                  name="jerseyNumber"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., 23"
                  value={formData.jerseyNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Level (1-5)
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className="p-1 focus:outline-none"
                      onClick={() => handleSkillLevelChange(level)}
                    >
                      {level <= formData.skillLevel ? (
                        <FaStar className="text-thunder-secondary text-2xl" />
                      ) : (
                        <FaRegStar className="text-gray-300 text-2xl" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Positions
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {positions.map((position) => (
                    <div 
                      key={position.id}
                      className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
                        formData.preferredPositions.includes(position.id)
                          ? 'bg-thunder-primary text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => togglePosition(position.id, 'preferredPositions')}
                    >
                      {position.abbreviation}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avoid Positions
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {positions.map((position) => (
                    <div 
                      key={position.id}
                      className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
                        formData.avoidPositions.includes(position.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => togglePosition(position.id, 'avoidPositions')}
                    >
                      {position.abbreviation}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="playerActive"
                  name="active"
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <label htmlFor="playerActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closePlayerModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90"
                >
                  {editingPlayer ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}