// src/app/positions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';

// Position data with categories
const infielderPositions = [
  { id: 'pitcher', name: 'Pitcher', abbreviation: 'P' },
  { id: 'catcher', name: 'Catcher', abbreviation: 'C' },
  { id: 'first_base', name: '1st Base', abbreviation: '1B' },
  { id: 'second_base', name: '2nd Base', abbreviation: '2B' },
  { id: 'third_base', name: '3rd Base', abbreviation: '3B' },
  { id: 'shortstop', name: 'Shortstop', abbreviation: 'SS' },
];

const outfielderPositions = [
  { id: 'left_field', name: 'Left Field', abbreviation: 'LF' },
  { id: 'left_center_field', name: 'Left-Center Field', abbreviation: 'LCF' },
  { id: 'center_field', name: 'Center Field', abbreviation: 'CF' },
  { id: 'right_center_field', name: 'Right-Center Field', abbreviation: 'RCF' },
  { id: 'right_field', name: 'Right Field', abbreviation: 'RF' },
];

const allPositions = [...infielderPositions, ...outfielderPositions];

// Position preference levels and opponent difficulty
const preferenceOptions = [
  { id: 'primary', label: 'Primary', level: 5, color: 'bg-thunder-primary text-white', icon: 'P' },
  { id: 'secondary', label: 'Secondary', level: 4, color: 'bg-thunder-primary/60 text-white', icon: 'S' },
  { id: 'development', label: 'Development', level: 3, color: 'bg-gray-200 text-gray-700', icon: '' },
  { id: 'avoid', label: 'Avoid', level: 1, color: 'bg-red-500 text-white', icon: 'X', allowed: false },
];

const opponentDifficulties = [
  { id: 'weak', label: 'Weak Opponent', color: 'bg-green-500' },
  { id: 'average', label: 'Average Opponent', color: 'bg-yellow-500' },
  { id: 'strong', label: 'Strong Opponent', color: 'bg-red-500' }
];

export default function PositionsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [positionData, setPositionData] = useState<Record<string, Record<string, any>>>({});
  const [showPrimaryOnly, setShowPrimaryOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('average');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

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

      const playersWithPreferences = await Promise.all(
        response.data.map(async (player: any) => {
          const playerDetails = await axios.get(`/api/players/${player.id}`);
          return {
            ...playerDetails.data,
            stats: playerDetails.data.stats || {
              infieldPercentage: 50,
              outfieldPercentage: 50,
              benchPercentage: 0,
              positionInnings: {}
            }
          };
        })
      );

      setPlayers(playersWithPreferences);

      const initialPositionData: Record<string, Record<string, any>> = {};
      playersWithPreferences.forEach(player => {
        initialPositionData[player.id] = {
          weak: {},
          average: {},
          strong: {}
        };

        player.positionPreferences.forEach((pref: any) => {
          let preferenceType = 'development';

          if (pref.preferenceLevel >= 5) {
            preferenceType = 'primary';
          } else if (pref.preferenceLevel >= 4) {
            preferenceType = 'secondary';
          } else if (pref.preferenceLevel <= 1 || !pref.allowed) {
            preferenceType = 'avoid';
          }

          initialPositionData[player.id].weak[pref.position] = preferenceType;
          initialPositionData[player.id].average[pref.position] = preferenceType;
          initialPositionData[player.id].strong[pref.position] = preferenceType;

          if (pref.opponentPreferences) {
            if (pref.opponentPreferences.weak) {
              initialPositionData[player.id].weak[pref.position] = pref.opponentPreferences.weak;
            }
            if (pref.opponentPreferences.average) {
              initialPositionData[player.id].average[pref.position] = pref.opponentPreferences.average;
            }
            if (pref.opponentPreferences.strong) {
              initialPositionData[player.id].strong[pref.position] = pref.opponentPreferences.strong;
            }
          }
        });
      });

      setPositionData(initialPositionData);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  // Toggle position preference
  const togglePositionPreference = (playerId: string, position: string, preference: string) => {
    setPositionData(prev => {
      const newData = { ...prev };
      if (!newData[playerId]) {
        newData[playerId] = { weak: {}, average: {}, strong: {} };
      }

      if (advancedMode) {
        const currentPref = newData[playerId][selectedDifficulty][position];
        newData[playerId][selectedDifficulty][position] = currentPref === preference ? 'development' : preference;
      } else {
        const difficulties = ['weak', 'average', 'strong'];
        difficulties.forEach(difficulty => {
          const currentPref = newData[playerId][difficulty][position];
          newData[playerId][difficulty][position] = currentPref === preference ? 'development' : preference;
        });
      }

      return newData;
    });
  };

  // Set a specific starting position for a player
  const setStartingPosition = (playerId: string, position: string, difficulty: string) => {
    setPositionData(prev => {
      const newData = { ...prev };
      if (!newData[playerId]) {
        newData[playerId] = { weak: {}, average: {}, strong: {} };
      }

      Object.keys(newData[playerId][difficulty]).forEach(pos => {
        if (newData[playerId][difficulty][pos] === 'starting') {
          newData[playerId][difficulty][pos] = 'development';
        }
      });

      newData[playerId][difficulty][position] = 'starting';
      return newData;
    });
  };

  // Toggle expanded player view
  const toggleExpandedPlayer = (playerId: string) => {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(playerId);
    }
  };

  // Save all position preferences
  const saveAllPositionPreferences = async () => {
    try {
      for (const playerId in positionData) {
        const playerPositions = positionData[playerId];
        const positionPreferences = [];

        allPositions.forEach(pos => {
          const position = pos.id;
          const basePreference = playerPositions.average[position] || 'development';
          const preferenceOption = preferenceOptions.find(opt => opt.id === basePreference);

          if (preferenceOption) {
            const preference = {
              position,
              preferenceLevel: preferenceOption.level,
              allowed: preferenceOption.allowed !== false,
              opponentPreferences: {} as any,
            };

            if (playerPositions.weak[position] !== basePreference) {
              preference.opponentPreferences.weak = playerPositions.weak[position];
            }
            if (playerPositions.strong[position] !== basePreference) {
              preference.opponentPreferences.strong = playerPositions.strong[position];
            }

            positionPreferences.push(preference);
          }
        });

        await axios.put(`/api/players/${playerId}`, { positionPreferences });
      }

      await fetchPlayers();
      setEditMode(false);
    } catch (err) {
      console.error('Error saving position preferences:', err);
      setError('Failed to save position preferences');
    }
  };

  // Helpers
  const getPositionCellClass = (preference: string) => {
    if (preference === 'starting') {
      return 'bg-blue-600 text-white font-bold';
    }
    const option = preferenceOptions.find(opt => opt.id === preference);
    return option ? option.color : 'bg-gray-100 text-gray-700';
  };

  const getPositionIcon = (preference: string) => {
    if (preference === 'starting') {
      return '★';
    }
    const option = preferenceOptions.find(opt => opt.id === preference);
    return option ? option.icon : '';
  };

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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-thunder-dark">Position Preferences</h1>
          <p className="text-gray-600">Configure player position preferences for lineup generation</p>
          {teams.length > 0 && (
            <div className="mt-2">
              <select
                className="border border-gray-300 rounded-lg p-1"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Positions
            </button>
          ) : (
            <>
              <button
                onClick={saveAllPositionPreferences}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <FaSave className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  fetchPlayers();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}

      {/* No Players Message */}
      {players.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No players found for this team.</p>
        </div>
      )}

      {/* Players Display */}
      {players.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Player
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50" colSpan={infielderPositions.length}>
                  Infield
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50" colSpan={outfielderPositions.length}>
                  Outfield
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
                {infielderPositions.map((position) => (
                  <th key={position.id} className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    {position.abbreviation}
                  </th>
                ))}
                {outfielderPositions.map((position) => (
                  <th key={position.id} className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                    {position.abbreviation}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <>
                  <tr key={player.id} className={expandedPlayer === player.id ? 'bg-gray-50' : ''}>
                    {/* Player Name */}
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white">
                      <div className="flex items-center">
                        <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                          {player.jerseyNumber}
                        </span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </td>
                    {/* Balance Bar */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${player.stats?.infieldPercentage || 0}%` }}></div>
                          </div>
                          <span className="ml-2 text-xs">{player.stats?.infieldPercentage || 0}% IF</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${player.stats?.outfieldPercentage || 0}%` }}></div>
                          </div>
                          <span className="ml-2 text-xs">{player.stats?.outfieldPercentage || 0}% OF</span>
                        </div>
                      </div>
                    </td>
                    {/* Infield Positions */}
                    {infielderPositions.map((position) => {
                      const difficulty = advancedMode ? selectedDifficulty : 'average';
                      const preferenceType = positionData[player.id]?.[difficulty]?.[position.id] || 'development';
                      return (
                        <td key={position.id} className="py-1 text-center">
                          {editMode ? (
                            <div className="flex flex-col space-y-1">
                              {preferenceOptions.map(option => (
                                <button
                                  key={option.id}
                                  onClick={() => togglePositionPreference(player.id, position.id, option.id)}
                                  className={`w-full text-xs py-1 px-2 rounded ${preferenceType === option.id ? getPositionCellClass(option.id) : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                  {option.icon || option.label.charAt(0)}
                                </button>
                              ))}
                              {advancedMode && (
                                <button
                                  onClick={() => setStartingPosition(player.id, position.id, difficulty)}
                                  className={`w-full text-xs py-1 px-2 rounded ${preferenceType === 'starting' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                  ★
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm ${getPositionCellClass(preferenceType)}`} title={`${preferenceType.charAt(0).toUpperCase() + preferenceType.slice(1)} ${position.name}`}>
                              {getPositionIcon(preferenceType)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {/* Outfield Positions */}
                    {outfielderPositions.map((position) => {
                      const difficulty = advancedMode ? selectedDifficulty : 'average';
                      const preferenceType = positionData[player.id]?.[difficulty]?.[position.id] || 'development';
                      return (
                        <td key={position.id} className="py-1 text-center">
                          {editMode ? (
                            <div className="flex flex-col space-y-1">
                              {preferenceOptions.map(option => (
                                <button
                                  key={option.id}
                                  onClick={() => togglePositionPreference(player.id, position.id, option.id)}
                                  className={`w-full text-xs py-1 px-2 rounded ${preferenceType === option.id ? getPositionCellClass(option.id) : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                  {option.icon || option.label.charAt(0)}
                                </button>
                              ))}
                              {advancedMode && (
                                <button
                                  onClick={() => setStartingPosition(player.id, position.id, difficulty)}
                                  className={`w-full text-xs py-1 px-2 rounded ${preferenceType === 'starting' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                  ★
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm ${getPositionCellClass(preferenceType)}`} title={`${preferenceType.charAt(0).toUpperCase() + preferenceType.slice(1)} ${position.name}`}>
                              {getPositionIcon(preferenceType)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {/* Actions Button */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpandedPlayer(player.id)}
                        className="text-thunder-primary hover:text-thunder-primary/80"
                      >
                        {expandedPlayer === player.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Player Info */}
                  {expandedPlayer === player.id && advancedMode && (
                    <tr>
                      <td colSpan={infielderPositions.length + outfielderPositions.length + 3} className="bg-gray-50 px-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                          {opponentDifficulties.map((difficulty) => (
                            <div key={difficulty.id} className="bg-white p-4 rounded-lg shadow">
                              <h3 className={`font-medium mb-2 ${difficulty.color} text-white inline-block px-3 py-1 rounded-lg`}>
                                {difficulty.label}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {allPositions.map((position) => {
                                  const pref = positionData[player.id]?.[difficulty.id]?.[position.id] || 'development';
                                  return (
                                    <div key={position.id} className="flex flex-col items-center">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${getPositionCellClass(pref)}`}>
                                        {position.abbreviation}
                                      </div>
                                      <span className="text-xs whitespace-nowrap">{getPositionIcon(pref)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {players.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const difficulty = advancedMode ? selectedDifficulty : 'average';
            return (
              <div key={player.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      {player.jerseyNumber}
                    </span>
                    <h2 className="text-lg font-semibold">{player.name}</h2>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => toggleExpandedPlayer(player.id)}
                      className="text-thunder-primary hover:text-thunder-primary/80"
                    >
                      {expandedPlayer === player.id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  )}
                </div>

                {/* Balance Meter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Position Balance</h3>
                  <div className="flex items-center">
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div className="bg-blue-500" style={{ width: `${player.stats?.infieldPercentage || 0}%` }}></div>
                        <div className="bg-green-500" style={{ width: `${player.stats?.outfieldPercentage || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="ml-2 text-xs text-gray-600 w-24 text-right">
                      {player.stats?.infieldPercentage || 0}% / {player.stats?.outfieldPercentage || 0}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Infield</span>
                    <span>Outfield</span>
                  </div>
                </div>

                {/* Positions Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Infield Positions */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Infield</h3>
                    <div className="space-y-2">
                      {infielderPositions.map((position) => {
                        const preferenceType = positionData[player.id]?.[difficulty]?.[position.id] || 'development';
                        if (showPrimaryOnly && !['primary', 'secondary', 'starting'].includes(preferenceType)) return null;
                        return (
                          <div key={position.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${getPositionCellClass(preferenceType)}`}>
                              {position.abbreviation}
                            </div>
                            <span className="text-sm">
                              {position.name}
                              {!editMode && (
                                <>
                                  {preferenceType === 'primary' && <span className="ml-1 text-xs text-green-600 font-medium">(Primary)</span>}
                                  {preferenceType === 'secondary' && <span className="ml-1 text-xs text-blue-600 font-medium">(Secondary)</span>}
                                  {preferenceType === 'avoid' && <span className="ml-1 text-xs text-red-600 font-medium">(Avoid)</span>}
                                  {preferenceType === 'starting' && <span className="ml-1 text-xs text-blue-600 font-medium">(Starting)</span>}
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Outfield Positions */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Outfield</h3>
                    <div className="space-y-2">
                      {outfielderPositions.map((position) => {
                        const preferenceType = positionData[player.id]?.[difficulty]?.[position.id] || 'development';
                        if (showPrimaryOnly && !['primary', 'secondary', 'starting'].includes(preferenceType)) return null;
                        return (
                          <div key={position.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${getPositionCellClass(preferenceType)}`}>
                              {position.abbreviation}
                            </div>
                            <span className="text-sm">
                              {position.name}
                              {!editMode && (
                                <>
                                  {preferenceType === 'primary' && <span className="ml-1 text-xs text-green-600 font-medium">(Primary)</span>}
                                  {preferenceType === 'secondary' && <span className="ml-1 text-xs text-blue-600 font-medium">(Secondary)</span>}
                                  {preferenceType === 'avoid' && <span className="ml-1 text-xs text-red-600 font-medium">(Avoid)</span>}
                                  {preferenceType === 'starting' && <span className="ml-1 text-xs text-blue-600 font-medium">(Starting)</span>}
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
