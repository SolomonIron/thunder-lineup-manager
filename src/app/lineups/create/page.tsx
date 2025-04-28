"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowUp, FaArrowDown, FaRandom, FaSave } from 'react-icons/fa';
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
  { id: 'bench', name: 'Bench', abbreviation: 'Bench' },
];

export default function CreateLineupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [battingOrder, setBattingOrder] = useState([]);
  const [fieldingAssignments, setFieldingAssignments] = useState([]);
  const [innings, setInnings] = useState(6);
  const [outfielderCount, setOutfielderCount] = useState(4);
  const [activeTab, setActiveTab] = useState('batting');
  const [currentInning, setCurrentInning] = useState(1);
  const [autoAssignRules, setAutoAssignRules] = useState({
    rotateOutfield: true,
    ensureInfieldTime: true,
    respectPreferences: true,
    balancePositions: true,
    opponentDifficulty: 3,
  });
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  
  // Initialize from URL parameters if available
  useEffect(() => {
    fetchTeams();
    
    const gameId = searchParams.get('gameId');
    if (gameId) {
      setSelectedGame(gameId);
    }
  }, [searchParams]);
  
  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      
      // Set the first team as default
      if (response.data.length > 0) {
        setTeamId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    }
  };
  
  // Fetch games when selected team changes
  useEffect(() => {
    if (teamId) {
      fetchGames();
    }
  }, [teamId]);
  
  // Function to fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/games?teamId=${teamId}`);
      
      // Filter to games without lineups
      const filteredGames = response.data.filter(game => !game.hasLineup);
      setGames(filteredGames);
      
      // If a game was selected from URL param, validate it exists
      if (selectedGame) {
        const gameExists = response.data.some(g => g.id === selectedGame);
        if (!gameExists) {
          setSelectedGame('');
        } else {
          // Get game difficulty
          const game = response.data.find(g => g.id === selectedGame);
          if (game) {
            setInnings(game.innings || 6);
            setOutfielderCount(game.outfielderCount || 4);
            setAutoAssignRules(prev => ({
              ...prev,
              opponentDifficulty: game.opponentDifficulty || 3
            }));
          }
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch players when team changes
  useEffect(() => {
    if (teamId) {
      fetchPlayers();
    }
  }, [teamId]);
  
  // Function to fetch players from API
  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`/api/players?teamId=${teamId}`);
      
      // Filter to active players only
      const activePlayers = response.data.filter(player => player.active);
      setAvailablePlayers(activePlayers);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please try again.');
    }
  };
  
  // Function to fetch existing lineup if available
  const fetchLineup = async (gameId) => {
    try {
      const response = await axios.get(`/api/lineups/${gameId}`);
      
      // Set batting order
      if (response.data.battingOrder && response.data.battingOrder.length > 0) {
        setBattingOrder(response.data.battingOrder);
        setSelectedPlayers(response.data.battingOrder);
      }
      
      // Set fielding assignments
      if (response.data.fieldingAssignments && response.data.fieldingAssignments.length > 0) {
        setFieldingAssignments(response.data.fieldingAssignments);
      }
    } catch (err) {
      console.error('Error fetching lineup:', err);
      // If no lineup exists, that's fine, we'll create a new one
      // Don't set an error in this case
    }
  };

  // When a game is selected, reset the lineup
  useEffect(() => {
    if (selectedGame) {
      // Get game details
      const game = games.find(g => g.id === selectedGame);
      if (game) {
        setInnings(game.innings || 6);
        setOutfielderCount(game.outfielderCount || 4);
        setAutoAssignRules(prev => ({
          ...prev,
          opponentDifficulty: game.opponentDifficulty || 3
        }));
        
        // Check for existing lineup
        fetchLineup(selectedGame);
      }
      
      // Reset to defaults if no existing lineup
      setSelectedPlayers([]);
      setBattingOrder([]);
      setFieldingAssignments([]);
    }
  }, [selectedGame, games]);

  // When players are selected, initialize batting order with them
  useEffect(() => {
    if (selectedPlayers.length > 0 && battingOrder.length === 0) {
      setBattingOrder([...selectedPlayers]);
      
      // Initialize fielding assignments
      const newFieldingAssignments = [];
      for (let inning = 1; inning <= innings; inning++) {
        const inningAssignments = [];
        
        // Assign players to positions (very basic for now)
        const availablePositions = getAvailablePositionsForInning(outfielderCount);
        
        selectedPlayers.forEach((player, index) => {
          if (index < availablePositions.length) {
            inningAssignments.push({
              playerId: player.id,
              position: availablePositions[index].id
            });
          } else {
            inningAssignments.push({
              playerId: player.id,
              position: 'bench'
            });
          }
        });
        
        newFieldingAssignments.push(inningAssignments);
      }
      
      setFieldingAssignments(newFieldingAssignments);
    }
  }, [selectedPlayers, innings, outfielderCount]);

  // Function to get available positions based on outfielder count
  const getAvailablePositionsForInning = (outfielderCount) => {
    const infield = positions.filter(p => 
      !p.id.includes('field') && p.id !== 'bench'
    );
    
    let outfield;
    if (outfielderCount === 3) {
      outfield = positions.filter(p => 
        p.id === 'left_field' || p.id === 'right_field' || p.id === 'center_field'
      );
    } else {
      outfield = positions.filter(p => 
        p.id.includes('field') && p.id !== 'bench'
      );
    }
    
    return [...infield, ...outfield];
  };

  // Function to handle player selection
  const togglePlayerSelection = (player) => {
    if (selectedPlayers.some(p => p.id === player.id)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      // Add player
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  // Function to move a player up in the batting order
  const moveBatterUp = (index) => {
    if (index > 0) {
      const newOrder = [...battingOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setBattingOrder(newOrder);
    }
  };

  // Function to move a player down in the batting order
  const moveBatterDown = (index) => {
    if (index < battingOrder.length - 1) {
      const newOrder = [...battingOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setBattingOrder(newOrder);
    }
  };

  // Function to randomly shuffle the batting order
  const randomizeBattingOrder = () => {
    const newOrder = [...battingOrder];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    setBattingOrder(newOrder);
  };

  // Function to update a player's fielding position
  const updateFieldingPosition = (inning, playerIndex, position) => {
    const newAssignments = [...fieldingAssignments];
    
    // Make sure inning exists
    if (!newAssignments[inning - 1]) {
      newAssignments[inning - 1] = [];
    }
    
    // Make sure player assignment exists
    if (!newAssignments[inning - 1][playerIndex]) {
      newAssignments[inning - 1][playerIndex] = {
        playerId: selectedPlayers[playerIndex].id,
        position: 'bench'
      };
    }
    
    newAssignments[inning - 1][playerIndex].position = position;
    setFieldingAssignments(newAssignments);
  };

  // Function to automatically assign positions based on rules
  const autoAssignPositions = () => {
    // This is where we'll implement the automated lineup logic based on rules
    const newFieldingAssignments = [];
    
    for (let inning = 1; inning <= innings; inning++) {
      const inningAssignments = [];
      const availablePositions = [...getAvailablePositionsForInning(outfielderCount)];
      
      // Sort players based on skill level and opponent difficulty
      const sortedPlayers = [...selectedPlayers].sort((a, b) => {
        // If high difficulty, prioritize skill
        if (autoAssignRules.opponentDifficulty >= 4) {
          return b.skillLevel - a.skillLevel;
        }
        // If low difficulty, give less skilled players more opportunities
        else if (autoAssignRules.opponentDifficulty <= 2) {
          return a.skillLevel - b.skillLevel;
        }
        // Otherwise, keep original order with slight skill preference
        return 0;
      });
      
      // Create a mapping of positions to players for this inning
      const positionMap = {};
      
      // First pass: try to assign preferred positions if they're not already taken
      if (autoAssignRules.respectPreferences) {
        sortedPlayers.forEach(player => {
          // Find preferred positions from player's preferences
          const preferredPositions = player.positionPreferences
            ?.filter(pref => pref.preferenceLevel >= 4 && pref.allowed)
            .map(pref => pref.position) || [];
          
          if (preferredPositions.length > 0) {
            // Find preferred positions that are still available
            const availablePreferred = preferredPositions.filter(
              pos => availablePositions.some(p => p.id === pos)
            );
            
            if (availablePreferred.length > 0) {
              // Pick a random preferred position
              const chosenPos = availablePreferred[Math.floor(Math.random() * availablePreferred.length)];
              positionMap[chosenPos] = player.id;
              
              // Remove this position from available positions
              const index = availablePositions.findIndex(p => p.id === chosenPos);
              if (index >= 0) {
                availablePositions.splice(index, 1);
              }
            }
          }
        });
      }
      
      // Second pass: assign remaining positions
      sortedPlayers.forEach(player => {
        // Skip players already assigned
        if (Object.values(positionMap).includes(player.id)) {
          return;
        }
        
        // Find positions the player should avoid
        const avoidPositions = player.positionPreferences
          ?.filter(pref => pref.preferenceLevel <= 2 || !pref.allowed)
          .map(pref => pref.position) || [];
        
        // Filter out avoided positions if possible
        let possiblePositions = availablePositions.filter(
          pos => !avoidPositions.includes(pos.id)
        );
        
        // If no positions left, use any available position
        if (possiblePositions.length === 0 && availablePositions.length > 0) {
          possiblePositions = availablePositions;
        }
        
        if (possiblePositions.length > 0) {
          // Choose a random position from possible positions
          const randomIndex = Math.floor(Math.random() * possiblePositions.length);
          const chosenPosition = possiblePositions[randomIndex];
          
          positionMap[chosenPosition.id] = player.id;
          
          // Remove from available positions
          const index = availablePositions.findIndex(p => p.id === chosenPosition.id);
          if (index >= 0) {
            availablePositions.splice(index, 1);
          }
        } else {
          // If no positions available, assign to bench
          positionMap['bench'] = player.id;
        }
      });
      
      // Create the inning assignments
      selectedPlayers.forEach(player => {
        const assignedPosition = Object.entries(positionMap)
          .find(([pos, id]) => id === player.id)?.[0] || 'bench';
        
        inningAssignments.push({
          playerId: player.id,
          position: assignedPosition
        });
      });
      
      newFieldingAssignments.push(inningAssignments);
    }
    
    // Apply the balance/rotation rules to ensure equal playing time
    if (autoAssignRules.balancePositions) {
      balancePositionAssignments(newFieldingAssignments);
    }
    
    setFieldingAssignments(newFieldingAssignments);
  };
  
  // Function to balance positions and ensure equal playing time
  const balancePositionAssignments = (assignments) => {
    // Track position counts per player
    const playerPositionCounts = {};
    
    // Initialize player position counts
    selectedPlayers.forEach(player => {
      playerPositionCounts[player.id] = {
        infield: 0,
        outfield: 0,
        bench: 0,
        positions: {}
      };
      
      // Initialize all positions to 0
      positions.forEach(position => {
        playerPositionCounts[player.id].positions[position.id] = 0;
      });
    });
    
    // Count current assignments
    assignments.forEach(inningAssignments => {
      inningAssignments.forEach(assignment => {
        const { playerId, position } = assignment;
        
        // Increment position count
        playerPositionCounts[playerId].positions[position]++;
        
        // Track infield/outfield/bench counts
        if (position === 'bench') {
          playerPositionCounts[playerId].bench++;
        } else if (position.includes('field')) {
          playerPositionCounts[playerId].outfield++;
        } else {
          playerPositionCounts[playerId].infield++;
        }
      });
    });
    
    // Make adjustments if needed for extreme imbalances
    // This is a basic implementation that can be expanded
    
    // For example, ensure no player sits on bench more than once
    // if the number of players allows for it
    if (selectedPlayers.length <= innings + 1) {
      // Find players who are on bench more than once
      const benchPlayers = selectedPlayers.filter(
        player => playerPositionCounts[player.id].bench > 1
      );
      
      // Find players who are never on bench
      const neverBenchPlayers = selectedPlayers.filter(
        player => playerPositionCounts[player.id].bench === 0
      );
      
      // Swap positions in later innings
      benchPlayers.forEach(benchPlayer => {
        neverBenchPlayers.forEach(neverBenchPlayer => {
          // Look for an inning where the bench player is on bench
          // and the never-bench player is in the field
          for (let i = 0; i < assignments.length; i++) {
            const benchAssignment = assignments[i].find(
              a => a.playerId === benchPlayer.id && a.position === 'bench'
            );
            
            const fieldAssignment = assignments[i].find(
              a => a.playerId === neverBenchPlayer.id && a.position !== 'bench'
            );
            
            if (benchAssignment && fieldAssignment) {
              // Swap positions
              const tempPosition = benchAssignment.position;
              benchAssignment.position = fieldAssignment.position;
              fieldAssignment.position = tempPosition;
              
              // Update counts
              playerPositionCounts[benchPlayer.id].bench--;
              playerPositionCounts[neverBenchPlayer.id].bench++;
              
              // Only make one swap per player
              break;
            }
          }
        });
      });
    }
    
    // Return the modified assignments
    return assignments;
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!selectedGame || battingOrder.length === 0 || fieldingAssignments.length === 0) {
      setError('Please select a game and add players to the lineup.');
      return;
    }
    
    try {
      await axios.post('/api/lineups', {
        gameId: selectedGame,
        battingOrder,
        fieldingAssignments
      });
      
      // Redirect to the lineups page or to the game details
      router.push('/games');
    } catch (err) {
      console.error('Error saving lineup:', err);
      setError('Failed to save lineup. Please try again.');
    }
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // If no teams, show message
  if (teams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">You need to create a team before you can create lineups.</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-thunder-dark mb-4">Create Lineup</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block">{error}</span>
          </div>
        )}
        
        {/* Game selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="">Select a game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {new Date(game.gameDate).toLocaleDateString()} vs {game.opponentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Innings
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  value={innings}
                  onChange={(e) => setInnings(parseInt(e.target.value))}
                >
                  <option value="5">5 Innings</option>
                  <option value="6">6 Innings</option>
                  <option value="7">7 Innings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outfielders
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  value={outfielderCount}
                  onChange={(e) => setOutfielderCount(parseInt(e.target.value))}
                >
                  <option value="3">3 Outfielders</option>
                  <option value="4">4 Outfielders</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Player selection */}
        {selectedGame && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Select Players</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => togglePlayerSelection(player)}
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                    selectedPlayers.some(p => p.id === player.id)
                      ? 'border-thunder-primary bg-thunder-primary/10'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.some(p => p.id === player.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded mr-3"
                  />
                  <div className="flex items-center">
                    <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                      {player.jerseyNumber}
                    </span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {selectedPlayers.length} players selected
              </p>
            </div>
          </div>
        )}
        
        {/* Tabs for Batting and Fielding */}
        {selectedPlayers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-3 px-6 text-center font-medium text-sm focus:outline-none ${
                  activeTab === 'batting'
                    ? 'text-thunder-primary border-b-2 border-thunder-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('batting')}
              >
                Batting Order
              </button>
              <button
                className={`py-3 px-6 text-center font-medium text-sm focus:outline-none ${
                  activeTab === 'fielding'
                    ? 'text-thunder-primary border-b-2 border-thunder-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('fielding')}
              >
                Fielding Positions
              </button>
            </div>
            
            {/* Batting Order Tab */}
            {activeTab === 'batting' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Batting Order</h2>
                  <button
                    onClick={randomizeBattingOrder}
                    className="flex items-center px-3 py-1 bg-thunder-secondary text-thunder-dark rounded-lg hover:bg-thunder-secondary/90"
                  >
                    <FaRandom className="mr-1" />
                    Randomize
                  </button>
                </div>
                <div className="space-y-2">
                  {battingOrder.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 text-center font-bold">{index + 1}</div>
                      <div className="flex-1 flex items-center">
                        <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                          {player.jerseyNumber}
                        </span>
                        <span>{player.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => moveBatterUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded-lg ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-thunder-primary hover:bg-thunder-primary/10'
                          }`}
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          onClick={() => moveBatterDown(index)}
                          disabled={index === battingOrder.length - 1}
                          className={`p-1 rounded-lg ${
                            index === battingOrder.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-thunder-primary hover:bg-thunder-primary/10'
                          }`}
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Fielding Positions Tab */}
            {activeTab === 'fielding' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Fielding Positions</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={autoAssignPositions}
                      className="flex items-center px-3 py-1 bg-thunder-secondary text-thunder-dark rounded-lg hover:bg-thunder-secondary/90"
                    >
                      <FaRandom className="mr-1" />
                      Auto-Assign
                    </button>
                  </div>
                </div>
                
                {/* Inning selector */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {Array.from({ length: innings }, (_, i) => i + 1).map((inning) => (
                    <button
                      key={inning}
                      onClick={() => setCurrentInning(inning)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentInning === inning
                          ? 'bg-thunder-primary text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Inning {inning}
                    </button>
                  ))}
                </div>
                
                {/* Position assignments */}
                {fieldingAssignments.length > 0 && fieldingAssignments[currentInning - 1] && (
                  <div className="space-y-2">
                    {selectedPlayers.map((player, playerIndex) => {
                      const assignment = fieldingAssignments[currentInning - 1]?.find(
                        (a) => a.playerId === player.id
                      );
                      const position = assignment ? assignment.position : 'bench';
                      
                      return (
                        <div
                          key={player.id}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 flex items-center">
                            <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                              {player.jerseyNumber}
                            </span>
                            <span>{player.name}</span>
                          </div>
                          <div>
                            <select
                              value={position}
                              onChange={(e) => updateFieldingPosition(currentInning, playerIndex, e.target.value)}
                              className="p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-thunder-primary text-sm"
                            >
                              {positions.map((pos) => (
                                <option key={pos.id} value={pos.id}>
                                  {pos.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Auto-assign rules panel */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-2">Auto-Assign Rules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rotateOutfield"
                        checked={autoAssignRules.rotateOutfield}
                        onChange={() => setAutoAssignRules({
                          ...autoAssignRules,
                          rotateOutfield: !autoAssignRules.rotateOutfield
                        })}
                        className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                      />
                      <label htmlFor="rotateOutfield" className="ml-2 block text-sm text-gray-700">
                        Rotate Outfield
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ensureInfieldTime"
                        checked={autoAssignRules.ensureInfieldTime}
                        onChange={() => setAutoAssignRules({
                          ...autoAssignRules,
                          ensureInfieldTime: !autoAssignRules.ensureInfieldTime
                        })}
                        className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                      />
                      <label htmlFor="ensureInfieldTime" className="ml-2 block text-sm text-gray-700">
                        Ensure Infield Time
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="respectPreferences"
                        checked={autoAssignRules.respectPreferences}
                        onChange={() => setAutoAssignRules({
                          ...autoAssignRules,
                          respectPreferences: !autoAssignRules.respectPreferences
                        })}
                        className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                      />
                      <label htmlFor="respectPreferences" className="ml-2 block text-sm text-gray-700">
                        Respect Position Preferences
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="balancePositions"
                        checked={autoAssignRules.balancePositions}
                        onChange={() => setAutoAssignRules({
                          ...autoAssignRules,
                          balancePositions: !autoAssignRules.balancePositions
                        })}
                        className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                      />
                      <label htmlFor="balancePositions" className="ml-2 block text-sm text-gray-700">
                        Balance Positions
                      </label>
                    </div>
                    <div className="col-span-1 sm:col-span-2 mt-2">
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                        Opponent Difficulty (1-5)
                      </label>
                      <input
                        type="range"
                        id="difficulty"
                        min="1"
                        max="5"
                        value={autoAssignRules.opponentDifficulty}
                        onChange={(e) => setAutoAssignRules({
                          ...autoAssignRules,
                          opponentDifficulty: parseInt(e.target.value)
                        })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Easier (Play Everyone)</span>
                        <span>Harder (Best Lineup)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Save button */}
        {selectedPlayers.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
            >
              <FaSave className="mr-2" />
              Save Lineup
            </button>
          </div>
        )}
      </div>
    </div>
  );