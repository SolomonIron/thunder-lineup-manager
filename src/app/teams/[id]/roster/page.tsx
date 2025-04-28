"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';

// Mock data for players
const mockPlayers = [
  {
    id: '1',
    name: 'John Smith',
    jerseyNumber: '12',
    skillLevel: 4,
    active: true,
    preferredPositions: ['pitcher', 'shortstop'],
    avoidPositions: ['catcher'],
  },
  {
    id: '2',
    name: 'Mike Johnson',
    jerseyNumber: '7',
    skillLevel: 3,
    active: true,
    preferredPositions: ['first_base', 'right_field'],
    avoidPositions: [],
  },
  {
    id: '3',
    name: 'Sarah Williams',
    jerseyNumber: '23',
    skillLevel: 5,
    active: true,
    preferredPositions: ['shortstop', 'second_base'],
    avoidPositions: ['catcher'],
  },
  {
    id: '4',
    name: 'Tyler Brown',
    jerseyNumber: '9',
    skillLevel: 2,
    active: true,
    preferredPositions: ['right_field', 'left_field'],
    avoidPositions: ['pitcher', 'first_base'],
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
];

export default function TeamRosterPage() {
  const params = useParams();
  const teamId = params.id as string;
  
  const [players, setPlayers] = useState(mockPlayers);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [filterActive, setFilterActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Get the filtered players based on active status and search term
  const filteredPlayers = players.filter(player => 
    (!filterActive || player.active) && 
    (player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     player.jerseyNumber.includes(searchTerm))
  );

  const openPlayerModal = (player = null) => {
    setEditingPlayer(player);
    setShowPlayerModal(true);
  };

  const closePlayerModal = () => {
    setEditingPlayer(null);
    setShowPlayerModal(false);
  };

  const deletePlayer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, active: !player.active } : player
    ));
  };

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

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-thunder-dark">Team Roster</h1>
        <button
          onClick={() => openPlayerModal()}
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaPlus className="mr-2" />
          Add Player
        </button>
      </div>

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

      {/* Mobile view - cards */}
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
                  onClick={() => toggleActive(player.id)}
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
                {player.preferredPositions.map((pos) => {
                  const position = positions.find(p => p.id === pos);
                  return (
                    <span key={pos} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-thunder-primary text-white">
                      {position?.abbreviation || pos}
                    </span>
                  );
                })}
              </div>
            </div>
            
            {player.avoidPositions.length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Avoid Positions</h3>
                <div className="flex flex-wrap gap-1">
                  {player.avoidPositions.map((pos) => {
                    const position = positions.find(p => p.id === pos);
                    return (
                      <span key={pos} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {position?.abbreviation || pos}
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
                    {player.preferredPositions.map((pos) => {
                      const position = positions.find(p => p.id === pos);
                      return (
                        <span key={pos} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-thunder-primary text-white">
                          {position?.abbreviation || pos}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {player.avoidPositions.map((pos) => {
                      const position = positions.find(p => p.id === pos);
                      return (
                        <span key={pos} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {position?.abbreviation || pos}
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
                      onClick={() => toggleActive(player.id)}
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

      {showPlayerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., John Smith"
                  defaultValue={editingPlayer?.name || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., 23"
                  defaultValue={editingPlayer?.jerseyNumber || ''}
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
                    >
                      {level <= (editingPlayer?.skillLevel || 3) ? (
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
                        editingPlayer?.preferredPositions?.includes(position.id)
                          ? 'bg-thunder-primary text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
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
                        editingPlayer?.avoidPositions?.includes(position.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
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
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                  defaultChecked={editingPlayer?.active !== false}
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