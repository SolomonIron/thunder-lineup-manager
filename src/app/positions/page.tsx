"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

// Position data (matching the schema)
const allPositions = [
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

export default function PositionsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [players, setPlayers] = useState<any[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch players when team is selected
  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers();
    }
  }, [selectedTeam]);

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      
      // Set first team as default if available
      if (response.data.length > 0) {
        setSelectedTeam(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    }
  };

  // Fetch players for selected team
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/players?teamId=${selectedTeam}`);
      
      // Include position preferences with the players
      const playersWithPreferences = await Promise.all(
        response.data.map(async (player: any) => {
          const playerDetails = await axios.get(`/api/players/${player.id}`);
          return playerDetails.data;
        })
      );
      
      setPlayers(playersWithPreferences);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a player's positions
  const startEditingPlayer = (player: any) => {
    setEditingPlayer({
      ...player,
      preferredPositions: player.positionPreferences
        .filter((pref: any) => pref.preferenceLevel >= 4 && pref.allowed)
        .map((pref: any) => pref.position),
      avoidPositions: player.positionPreferences
        .filter((pref: any) => (pref.preferenceLevel <= 2 || !pref.allowed))
        .map((pref: any) => pref.position)
    });
  };

  // Toggle position in preferred or avoid list
  const togglePosition = (position: string, listType: 'preferredPositions' | 'avoidPositions') => {
    if (!editingPlayer) return;

    const currentList = editingPlayer[listType];
    const otherListType = listType === 'preferredPositions' ? 'avoidPositions' : 'preferredPositions';

    const updatedList = currentList.includes(position)
      ? currentList.filter((p: string) => p !== position)
      : [...currentList, position];

    // Remove from other list if present
    const updatedOtherList = editingPlayer[otherListType].filter((p: string) => p !== position);

    setEditingPlayer({
      ...editingPlayer,
      [listType]: updatedList,
      [otherListType]: updatedOtherList
    });
  };

  // Save player position preferences
  const savePlayerPositions = async () => {
    if (!editingPlayer) return;

    try {
      // Prepare position preferences
      const positionPreferences = [
        ...editingPlayer.preferredPositions.map((position: string) => ({
          position,
          preferenceLevel: 5,
          allowed: true
        })),
        ...editingPlayer.avoidPositions.map((position: string) => ({
          position,
          preferenceLevel: 1,
          allowed: false
        })),
        // Add neutral positions (not in either list)
        ...allPositions
          .filter(pos => 
            !editingPlayer.preferredPositions.includes(pos.id) && 
            !editingPlayer.avoidPositions.includes(pos.id)
          )
          .map(pos => ({
            position: pos.id,
            preferenceLevel: 3,
            allowed: true
          }))
      ];

      // Update player
      await axios.put(`/api/players/${editingPlayer.id}`, {
        positionPreferences
      });

      // Refresh players
      await fetchPlayers();

      // Clear editing state
      setEditingPlayer(null);
    } catch (err) {
      console.error('Error saving player positions:', err);
      setError('Failed to save player positions');
    }
  };

  // If loading, show spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-thunder-dark">Position Preferences</h1>
          {teams.length > 0 && (
            <div className="mt-2">
              <select
                className="border border-gray-300 rounded-lg p-1"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
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
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}

      {/* No players message */}
      {players.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No players found for this team.</p>
        </div>
      )}

      {/* Players list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div 
            key={player.id} 
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                  {player.jerseyNumber}
                </span>
                <h2 className="text-lg font-semibold">{player.name}</h2>
              </div>
              {editingPlayer?.id !== player.id ? (
                <button
                  onClick={() => startEditingPlayer(player)}
                  className="text-thunder-primary hover:text-thunder-primary/80"
                >
                  <FaEdit className="text-xl" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={savePlayerPositions}
                    className="text-green-600 hover:text-green-700"
                  >
                    <FaSave className="text-xl" />
                  </button>
                  <button
                    onClick={() => setEditingPlayer(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              )}
            </div>

            {/* Viewing Mode */}
            {editingPlayer?.id !== player.id && (
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Preferred Positions</h3>
                  <div className="flex flex-wrap gap-1">
                    {player.positionPreferences
                      ?.filter(pref => pref.preferenceLevel >= 4 && pref.allowed)
                      .map(pref => {
                        const position = allPositions.find(p => p.id === pref.position);
                        return (
                          <span 
                            key={pref.position} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-thunder-primary text-white"
                          >
                            {position?.abbreviation || pref.position}
                          </span>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Avoided Positions</h3>
                  <div className="flex flex-wrap gap-1">
                    {player.positionPreferences
                      ?.filter(pref => pref.preferenceLevel <= 2 || !pref.allowed)
                      .map(pref => {
                        const position = allPositions.find(p => p.id === pref.position);
                        return (
                          <span 
                            key={pref.position} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {position?.abbreviation || pref.position}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Editing Mode */}
            {editingPlayer?.id === player.id && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Positions</h3>
                  <div className="flex flex-wrap gap-2">
                    {allPositions.map((position) => (
                      <button
                        key={position.id}
                        onClick={() => togglePosition(position.id, 'preferredPositions')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          editingPlayer.preferredPositions.includes(position.id)
                            ? 'bg-thunder-primary text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {position.abbreviation}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Avoided Positions</h3>
                  <div className="flex flex-wrap gap-2">
                    {allPositions.map((position) => (
                      <button
                        key={position.id}
                        onClick={() => togglePosition(position.id, 'avoidPositions')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          editingPlayer.avoidPositions.includes(position.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {position.abbreviation}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}