// src/app/positions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave, FaTimesCircle, FaQuestion } from 'react-icons/fa';

// Position data
const infieldPositions = [
  { id: 'pitcher', label: 'P', name: 'Pitcher' },
  { id: 'catcher', label: 'C', name: 'Catcher' },
  { id: 'firstBase', label: '1B', name: '1st Base' },
  { id: 'secondBase', label: '2B', name: '2nd Base' },
  { id: 'thirdBase', label: '3B', name: '3rd Base' },
  { id: 'shortstop', label: 'SS', name: 'Shortstop' },
];

const outfieldPositions = [
  { id: 'leftField', label: 'LF', name: 'Left Field' },
  { id: 'leftCenterField', label: 'LCF', name: 'Left-Center Field' },
  { id: 'centerField', label: 'CF', name: 'Center Field' },
  { id: 'rightCenterField', label: 'RCF', name: 'Right-Center Field' },
  { id: 'rightField', label: 'RF', name: 'Right Field' },
];

// All positions combined for dropdowns
const allPositions = [
  ...infieldPositions,
  ...outfieldPositions
];

// A simplified lookup from position ID to display name
const positionNameMap = allPositions.reduce((acc, pos) => {
  acc[pos.id] = pos.name;
  return acc;
}, {});

export default function PositionsPage() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [players, setPlayers] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showingDetail, setShowingDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  
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
      setError('Failed to load teams. Please try again.');
    }
  };
  
  // Fetch players with position preferences
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the API route we created
      // const response = await axios.get(`/api/positions?teamId=${selectedTeam}`);
      
      // For now, let's use mock data
      const mockPlayersData = [
        {
          id: '1',
          name: 'F Couch',
          jerseyNumber: '0',
          skillLevel: 4,
          infieldPreferences: {
            pitcher: 3,
            catcher: 0,
            firstBase: 0,
            secondBase: 4,
            thirdBase: 0,
            shortstop: 5, // Primary
          },
          outfieldPreferences: {
            leftField: 0,
            leftCenterField: 4,
            centerField: 4,
            rightCenterField: 3,
            rightField: 0,
          },
          startingPositions: {
            strong: 'shortstop',
            average: 'shortstop',
            weak: 'centerField',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
        {
          id: '2',
          name: 'K Barcomb',
          jerseyNumber: '27',
          skillLevel: 4,
          infieldPreferences: {
            pitcher: 0,
            catcher: 0,
            firstBase: 0,
            secondBase: 3,
            thirdBase: 0,
            shortstop: 4,
          },
          outfieldPreferences: {
            leftField: 0,
            leftCenterField: 4,
            centerField: 5, // Primary
            rightCenterField: 4,
            rightField: 0,
          },
          startingPositions: {
            strong: 'centerField',
            average: 'shortstop',
            weak: 'shortstop',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
        {
          id: '3',
          name: 'G Krysh',
          jerseyNumber: '7',
          skillLevel: 3,
          infieldPreferences: {
            pitcher: 4,
            catcher: 0,
            firstBase: 0,
            secondBase: 0,
            thirdBase: 0,
            shortstop: 3,
          },
          outfieldPreferences: {
            leftField: 3,
            leftCenterField: 0,
            centerField: 3,
            rightCenterField: 0,
            rightField: 0,
          },
          startingPositions: {
            strong: 'pitcher',
            average: 'pitcher',
            weak: 'shortstop',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
        {
          id: '4',
          name: 'D Horner',
          jerseyNumber: '1',
          skillLevel: 3,
          infieldPreferences: {
            pitcher: 0,
            catcher: 4,
            firstBase: 3,
            secondBase: 0,
            thirdBase: 0,
            shortstop: 0,
          },
          outfieldPreferences: {
            leftField: 0,
            leftCenterField: 0,
            centerField: 0,
            rightCenterField: 0,
            rightField: 5, // Primary
          },
          startingPositions: {
            strong: 'catcher',
            average: 'rightField',
            weak: 'rightField',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
        {
          id: '5',
          name: 'S Weldon',
          jerseyNumber: '42',
          skillLevel: 3,
          infieldPreferences: {
            pitcher: 0,
            catcher: 0,
            firstBase: 0,
            secondBase: 0,
            thirdBase: 0,
            shortstop: 0,
          },
          outfieldPreferences: {
            leftField: 3,
            leftCenterField: 4,
            centerField: 4,
            rightCenterField: 0,
            rightField: 4,
          },
          startingPositions: {
            strong: 'centerField',
            average: 'leftCenterField',
            weak: 'rightField',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
        {
          id: '6',
          name: 'O Ardo',
          jerseyNumber: '11',
          skillLevel: 5,
          infieldPreferences: {
            pitcher: 4,
            catcher: 0,
            firstBase: 0,
            secondBase: 0,
            thirdBase: 5, // Primary
            shortstop: 3,
          },
          outfieldPreferences: {
            leftField: 0,
            leftCenterField: 0,
            centerField: 3,
            rightCenterField: 0,
            rightField: 0,
          },
          startingPositions: {
            strong: 'thirdBase',
            average: 'thirdBase',
            weak: 'centerField',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
        {
          id: '7',
          name: 'R Gardner',
          jerseyNumber: '10',
          skillLevel: 4,
          infieldPreferences: {
            pitcher: 3,
            catcher: 0,
            firstBase: 0,
            secondBase: 5, // Primary
            thirdBase: 0,
            shortstop: 0,
          },
          outfieldPreferences: {
            leftField: 0,
            leftCenterField: 3,
            centerField: 0,
            rightCenterField: 4,
            rightField: 4,
          },
          startingPositions: {
            strong: 'secondBase',
            average: 'secondBase',
            weak: 'rightCenterField',
          },
          balance: {
            infield: 50,
            outfield: 50,
          }
        },
      ];
      
      setPlayers(mockPlayersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to get preference level display
  const getPreferenceDisplay = (level) => {
    if (level === 0) return '';
    if (level === 5) return '1st';
    if (level === 4) return '2nd';
    if (level === 3) return '3rd';
    if (level === 2) return '4th';
    if (level === 1) return 'No';
    return '';
  };
  
  // Get position visual status - empty, ranked, preferred, or avoid
  const getPositionStatus = (player, positionId, positionType) => {
    const preferences = positionType === 'infield' 
      ? player.infieldPreferences 
      : player.outfieldPreferences;
    
    const level = preferences[positionId];
    
    if (level === 0) return 'empty';
    if (level === 5) return 'primary';
    if (level >= 3) return 'preferred';
    if (level <= 2) return 'avoid';
    return 'empty';
  };
  
  // Start editing a player's preferences
  const startEditing = (playerId) => {
    const playerToEdit = players.find(p => p.id === playerId);
    setEditingPlayer({...playerToEdit});
    setShowingDetail(true);
  };
  
  // Save edited player preferences
  const savePlayerPreferences = async () => {
    try {
      // In a real app, this would make an API call
      // await axios.put(`/api/positions`, {
      //   playerId: editingPlayer.id,
      //   infieldPreferences: editingPlayer.infieldPreferences,
      //   outfieldPreferences: editingPlayer.outfieldPreferences,
      //   startingPositions: editingPlayer.startingPositions,
      // });
      
      // For now, let's just update the local state
      setPlayers(players.map(p => 
        p.id === editingPlayer.id ? editingPlayer : p
      ));
      
      // Reset editing state
      setEditingPlayer(null);
      setShowingDetail(false);
    } catch (err) {
      console.error('Error saving player positions:', err);
      setError('Failed to save player positions. Please try again.');
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingPlayer(null);
    setShowingDetail(false);
  };
  
  // Update position preference for the player being edited
  const updatePositionPreference = (positionId, positionType, level) => {
    if (!editingPlayer) return;
    
    const preferenceField = positionType === 'infield' 
      ? 'infieldPreferences' 
      : 'outfieldPreferences';
    
    // Create a copy of the preferences
    const updatedPreferences = {
      ...editingPlayer[preferenceField]
    };
    
    // If setting to primary (5), make sure no other position is primary
    if (level === 5) {
      Object.keys(updatedPreferences).forEach(pos => {
        if (updatedPreferences[pos] === 5) {
          updatedPreferences[pos] = 4; // Demote to secondary
        }
      });
    }
    
    updatedPreferences[positionId] = level;
    
    setEditingPlayer({
      ...editingPlayer,
      [preferenceField]: updatedPreferences
    });
  };
  
  // Update starting position based on opponent strength
  const updateStartingPosition = (positionId, opponentType) => {
    if (!editingPlayer) return;
    
    setEditingPlayer({
      ...editingPlayer,
      startingPositions: {
        ...editingPlayer.startingPositions,
        [opponentType]: positionId
      }
    });
  };
  
  // Toggle edit mode for the entire table
  const toggleEditMode = () => {
    setEditMode(!editMode);
    
    // If exiting edit mode, save all changes
    if (editMode) {
      // In a real implementation, this would batch save all player changes
      fetchPlayers();
    }
  };

  // If loading, show spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading position preferences...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-thunder-dark">Position Preferences</h1>
          <p className="text-gray-600">Configure player position preferences for lineup generation</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select 
            className="border border-gray-300 rounded p-2"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
            {/* Fallback if no teams are loaded yet */}
            {teams.length === 0 && (
              <option value="2025 Ohio Thunder">2025 Ohio Thunder</option>
            )}
          </select>
          <button
            onClick={toggleEditMode}
            className="px-4 py-2 bg-thunder-primary text-white rounded-lg flex items-center"
          >
            {editMode ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
            {editMode ? 'Save All' : 'Edit All'}
          </button>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-2 text-thunder-primary hover:bg-gray-100 rounded-full"
            title="Show Legend"
          >
            <FaQuestion />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}
      
      {/* Legend/Help Panel */}
      {showLegend && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Position Preference Legend</h2>
            <button 
              onClick={() => setShowLegend(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-thunder-primary rounded-full flex items-center justify-center text-white text-xs mr-2">
                1st
              </div>
              <span className="text-sm">Primary Position (1st choice)</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 border border-blue-300 rounded-full flex items-center justify-center text-xs mr-2">
                2nd
              </div>
              <span className="text-sm">Secondary Infield Position</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 text-green-600 border border-green-300 rounded-full flex items-center justify-center text-xs mr-2">
                2nd
              </div>
              <span className="text-sm">Secondary Outfield Position</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 text-red-600 border border-red-300 rounded-full flex items-center justify-center text-xs mr-2">
                No
              </div>
              <span className="text-sm">Position to Avoid</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs mr-2">
                -
              </div>
              <span className="text-sm">Neutral/Not Applicable</span>
            </div>
          </div>
          
          <h3 className="text-base font-medium mt-4 mb-2">Starting Position Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs mr-2 relative">
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <span className="text-sm">Strong Opponent Position</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs mr-2 relative">
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
              </div>
              <span className="text-sm">Average Opponent Position</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs mr-2 relative">
                <span className="absolute bottom-0 left-0 w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <span className="text-sm">Weak Opponent Position</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Editing:</strong> Click on a player's edit button to open the detailed editor, or toggle "Edit All" to quickly change preferences by clicking on position cells.</p>
          </div>
        </div>
      )}

      {/* Main table with position preferences */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Player
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Balance
              </th>
              <th colSpan={infieldPositions.length} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                Infield
              </th>
              <th colSpan={outfieldPositions.length} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                Outfield
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 w-24">
                Actions
              </th>
            </tr>
            <tr className="bg-gray-50">
              <th></th>
              <th></th>
              {infieldPositions.map(pos => (
                <th key={pos.id} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                  {pos.label}
                </th>
              ))}
              {outfieldPositions.map(pos => (
                <th key={pos.id} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                  {pos.label}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map(player => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-thunder-primary text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      {player.jerseyNumber}
                    </div>
                    <span className="font-medium text-gray-900">{player.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${player.balance.infield}%` }}
                        title={`${player.balance.infield}% Infield`}
                      ></div>
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${player.balance.outfield}%` }}
                        title={`${player.balance.outfield}% Outfield`}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{player.balance.infield}% IF</span>
                    <span>{player.balance.outfield}% OF</span>
                  </div>
                </td>
                {/* Infield Positions */}
                {infieldPositions.map(pos => (
                  <td key={pos.id} className="px-1 py-3 text-center border-l border-gray-200">
                    <div 
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium relative cursor-pointer
                        ${getPositionStatus(player, pos.id, 'infield') === 'primary' ? 'bg-thunder-primary text-white' : 
                          getPositionStatus(player, pos.id, 'infield') === 'preferred' ? 'bg-blue-100 text-blue-600 border border-blue-300' :
                          getPositionStatus(player, pos.id, 'infield') === 'avoid' ? 'bg-red-100 text-red-600 border border-red-300' : 
                          'bg-gray-100 text-gray-400'}`}
                      title={`${getPreferenceDisplay(player.infieldPreferences[pos.id])} Choice`}
                      onClick={() => {
                        if (editMode) {
                          // Create a copy of the player
                          const updatedPlayer = {...player};
                          
                          // Cycle through preference levels
                          let newLevel = (player.infieldPreferences[pos.id] + 1) % 6;
                          
                          // If setting to primary (5), demote any existing primary
                          if (newLevel === 5) {
                            Object.keys(updatedPlayer.infieldPreferences).forEach(p => {
                              if (updatedPlayer.infieldPreferences[p] === 5) {
                                updatedPlayer.infieldPreferences[p] = 4;
                              }
                            });
                          }
                          
                          // Update the preference
                          updatedPlayer.infieldPreferences[pos.id] = newLevel;
                          
                          // Update in the players array
                          setPlayers(players.map(p => p.id === player.id ? updatedPlayer : p));
                        }
                      }}
                    >
                      {getPreferenceDisplay(player.infieldPreferences[pos.id])}
                      {player.startingPositions?.strong === pos.id && 
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" title="Strong opponent starting position"/>}
                      {player.startingPositions?.average === pos.id && 
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" title="Average opponent starting position"/>}
                      {player.startingPositions?.weak === pos.id && 
                        <span className="absolute bottom-0 left-0 w-2 h-2 bg-green-500 rounded-full" title="Weak opponent starting position"/>}
                    </div>
                  </td>
                ))}
                
                {/* Outfield Positions */}
                {outfieldPositions.map(pos => (
                  <td key={pos.id} className="px-1 py-3 text-center border-l border-gray-200">
                    <div 
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium relative cursor-pointer
                        ${getPositionStatus(player, pos.id, 'outfield') === 'primary' ? 'bg-thunder-primary text-white' : 
                          getPositionStatus(player, pos.id, 'outfield') === 'preferred' ? 'bg-green-100 text-green-600 border border-green-300' :
                          getPositionStatus(player, pos.id, 'outfield') === 'avoid' ? 'bg-red-100 text-red-600 border border-red-300' : 
                          'bg-gray-100 text-gray-400'}`}
                      title={`${getPreferenceDisplay(player.outfieldPreferences[pos.id])} Choice`}
                      onClick={() => {
                        if (editMode) {
                          // Create a copy of the player
                          const updatedPlayer = {...player};
                          
                          // Cycle through preference levels
                          let newLevel = (player.outfieldPreferences[pos.id] + 1) % 6;
                          
                          // If setting to primary (5), demote any existing primary
                          if (newLevel === 5) {
                            Object.keys(updatedPlayer.outfieldPreferences).forEach(p => {
                              if (updatedPlayer.outfieldPreferences[p] === 5) {
                                updatedPlayer.outfieldPreferences[p] = 4;
                              }
                            });
                          }
                          
                          // Update the preference
                          updatedPlayer.outfieldPreferences[pos.id] = newLevel;
                          
                          // Update in the players array
                          setPlayers(players.map(p => p.id === player.id ? updatedPlayer : p));
                        }
                      }}
                    >
                      {getPreferenceDisplay(player.outfieldPreferences[pos.id])}
                      {player.startingPositions?.strong === pos.id && 
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" title="Strong opponent starting position"/>}
                      {player.startingPositions?.average === pos.id && 
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" title="Average opponent starting position"/>}
                      {player.startingPositions?.weak === pos.id && 
                        <span className="absolute bottom-0 left-0 w-2 h-2 bg-green-500 rounded-full" title="Weak opponent starting position"/>}
                    </div>
                  </td>
                ))}
                
                <td className="px-3 py-3 whitespace-nowrap text-center border-l border-gray-200">
                  <button
                    onClick={() => startEditing(player.id)}
                    className="text-thunder-primary hover:text-thunder-primary/80 p-2"
                    title="Edit Position Preferences"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Position preference editor modal */}
      {showingDetail && editingPlayer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl p-6 relative">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="bg-thunder-primary text-white text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center mr-2">
                {editingPlayer.jerseyNumber}
              </div>
              Edit Position Preferences for {editingPlayer.name}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Infield Preferences */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Infield Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {infieldPositions.map(position => (
                    <div key={position.id} className="border border-gray-200 rounded-lg bg-white p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{position.name}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateStartingPosition(position.id, 'strong')}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                              ${editingPlayer.startingPositions.strong === position.id 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-500'}`}
                            title="Strong opponent starter"
                          >
                            S
                          </button>
                          <button
                            onClick={() => updateStartingPosition(position.id, 'average')}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                              ${editingPlayer.startingPositions.average === position.id 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-gray-200 text-gray-500'}`}
                            title="Average opponent starter"
                          >
                            A
                          </button>
                          <button
                            onClick={() => updateStartingPosition(position.id, 'weak')}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                              ${editingPlayer.startingPositions.weak === position.id 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-500'}`}
                            title="Weak opponent starter"
                          >
                            W
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updatePositionPreference(position.id, 'infield', 5)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.infieldPreferences[position.id] === 5 
                              ? 'bg-thunder-primary text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          Primary
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'infield', 4)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.infieldPreferences[position.id] === 4 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          2nd
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'infield', 3)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.infieldPreferences[position.id] === 3 
                              ? 'bg-blue-400 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          3rd
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'infield', 2)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.infieldPreferences[position.id] === 2 
                              ? 'bg-red-300 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          4th
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'infield', 1)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.infieldPreferences[position.id] === 1 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          No
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'infield', 0)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.infieldPreferences[position.id] === 0 
                              ? 'bg-gray-400 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Outfield Preferences */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Outfield Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outfieldPositions.map(position => (
                    <div key={position.id} className="border border-gray-200 rounded-lg bg-white p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{position.name}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateStartingPosition(position.id, 'strong')}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                              ${editingPlayer.startingPositions.strong === position.id 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-500'}`}
                            title="Strong opponent starter"
                          >
                            S
                          </button>
                          <button
                            onClick={() => updateStartingPosition(position.id, 'average')}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                              ${editingPlayer.startingPositions.average === position.id 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-gray-200 text-gray-500'}`}
                            title="Average opponent starter"
                          >
                            A
                          </button>
                          <button
                            onClick={() => updateStartingPosition(position.id, 'weak')}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs 
                              ${editingPlayer.startingPositions.weak === position.id 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-500'}`}
                            title="Weak opponent starter"
                          >
                            W
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updatePositionPreference(position.id, 'outfield', 5)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.outfieldPreferences[position.id] === 5 
                              ? 'bg-thunder-primary text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          Primary
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'outfield', 4)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.outfieldPreferences[position.id] === 4 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          2nd
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'outfield', 3)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.outfieldPreferences[position.id] === 3 
                              ? 'bg-green-400 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          3rd
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'outfield', 2)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.outfieldPreferences[position.id] === 2 
                              ? 'bg-red-300 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          4th
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'outfield', 1)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.outfieldPreferences[position.id] === 1 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          No
                        </button>
                        <button
                          onClick={() => updatePositionPreference(position.id, 'outfield', 0)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium 
                            ${editingPlayer.outfieldPreferences[position.id] === 0 
                              ? 'bg-gray-400 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Starting Positions Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Starting Positions by Opponent Strength</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg bg-white p-3">
                  <h4 className="font-medium text-red-600 mb-2">Strong Opponents</h4>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">{positionNameMap[editingPlayer.startingPositions.strong] || 'Not set'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Position played against top teams</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg bg-white p-3">
                  <h4 className="font-medium text-yellow-600 mb-2">Average Opponents</h4>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">{positionNameMap[editingPlayer.startingPositions.average] || 'Not set'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Position played against typical teams</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg bg-white p-3">
                  <h4 className="font-medium text-green-600 mb-2">Weak Opponents</h4>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">{positionNameMap[editingPlayer.startingPositions.weak] || 'Not set'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Position played against weaker teams</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <FaTimesCircle className="mr-2" />
                Cancel
              </button>
              <button
                onClick={savePlayerPreferences}
                className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
              >
                <FaSave className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}