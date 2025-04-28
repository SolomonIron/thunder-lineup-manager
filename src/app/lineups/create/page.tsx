"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowUp, FaArrowDown, FaRandom, FaBars, FaSave } from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';

// Mock positions data
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

// Mock games data
const mockGames = [
  { id: '1', opponent: 'Red Sox', date: '2025-05-15', time: '10:00 AM', location: 'Field A', difficulty: 3 },
  { id: '2', opponent: 'Yankees', date: '2025-05-22', time: '1:00 PM', location: 'Field B', difficulty: 5 },
  { id: '3', opponent: 'Cubs', date: '2025-05-29', time: '3:30 PM', location: 'Field C', difficulty: 1 },
];

// Mock players data (active only)
const mockPlayers = [
  {
    id: '1',
    name: 'John Smith',
    jerseyNumber: '12',
    skillLevel: 4,
    preferredPositions: ['pitcher', 'shortstop'],
    avoidPositions: ['catcher'],
  },
  {
    id: '2',
    name: 'Mike Johnson',
    jerseyNumber: '7',
    skillLevel: 3,
    preferredPositions: ['first_base', 'right_field'],
    avoidPositions: [],
  },
  {
    id: '3',
    name: 'Sarah Williams',
    jerseyNumber: '23',
    skillLevel: 5,
    preferredPositions: ['shortstop', 'second_base'],
    avoidPositions: ['catcher'],
  },
  {
    id: '4',
    name: 'Tyler Brown',
    jerseyNumber: '9',
    skillLevel: 2,
    preferredPositions: ['right_field', 'left_field'],
    avoidPositions: ['pitcher', 'first_base'],
  },
  {
    id: '5',
    name: 'Emily Garcia',
    jerseyNumber: '15',
    skillLevel: 3,
    preferredPositions: ['catcher', 'third_base'],
    avoidPositions: ['shortstop'],
  },
  {
    id: '6',
    name: 'Jacob Miller',
    jerseyNumber: '21',
    skillLevel: 4,
    preferredPositions: ['second_base', 'shortstop'],
    avoidPositions: ['pitcher'],
  },
  {
    id: '7',
    name: 'Lucas Wilson',
    jerseyNumber: '3',
    skillLevel: 3,
    preferredPositions: ['left_field', 'right_field'],
    avoidPositions: ['catcher'],
  },
  {
    id: '8',
    name: 'Olivia Davis',
    jerseyNumber: '17',
    skillLevel: 2,
    preferredPositions: ['right_field', 'left_center_field'],
    avoidPositions: ['shortstop', 'pitcher'],
  },
  {
    id: '9',
    name: 'William Martin',
    jerseyNumber: '5',
    skillLevel: 4,
    preferredPositions: ['pitcher', 'third_base'],
    avoidPositions: ['left_field'],
  },
  {
    id: '10',
    name: 'Sophia Thompson',
    jerseyNumber: '8',
    skillLevel: 3,
    preferredPositions: ['right_center_field', 'second_base'],
    avoidPositions: ['first_base'],
  },
];

export default function CreateLineupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [battingOrder, setBattingOrder] = useState<any[]>([]);
  const [fieldingAssignments, setFieldingAssignments] = useState<any[]>([]);
  const [innings, setInnings] = useState<number>(6);
  const [outfielderCount, setOutfielderCount] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<'batting' | 'fielding'>('batting');
  const [currentInning, setCurrentInning] = useState<number>(1);
  
  // Initialize from URL parameters if available
  useEffect(() => {
    const gameId = searchParams.get('gameId');
    if (gameId) {
      setSelectedGame(gameId);
    }
    
    // Default to all players being available
    setAvailablePlayers(mockPlayers);
  }, [searchParams]);

  // When a game is selected, reset the lineup
  useEffect(() => {
    if (selectedGame) {
      // Reset everything
      setSelectedPlayers([]);
      setBattingOrder([]);
      setFieldingAssignments([]);
      
      // Reset available players
      setAvailablePlayers(mockPlayers);
    }
  }, [selectedGame]);

  // When players are selected, initialize batting order with them
  useEffect(() => {
    if (selectedPlayers.length > 0) {
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
  const getAvailablePositionsForInning = (outfielderCount: number) => {
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
  const togglePlayerSelection = (player: any) => {
    if (selectedPlayers.some(p => p.id === player.id)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      // Add player
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  // Function to move a player up in the batting order
  const moveBatterUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...battingOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setBattingOrder(newOrder);
    }
  };

  // Function to move a player down in the batting order
  const moveBatterDown = (index: number) => {
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
  const updateFieldingPosition = (inning: number, playerIndex: number, position: string) => {
    const newAssignments = [...fieldingAssignments];
    newAssignments[inning - 1][playerIndex].position = position;
    setFieldingAssignments(newAssignments);
  };

  // Function to handle form submission
  const handleSubmit = () => {
    // Here you would save the lineup to your backend
    console.log({
      gameId: selectedGame,
      battingOrder,
      fieldingAssignments
    });
    
    // Redirect to the lineups page
    router.push('/lineups');
  };

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-thunder-dark mb-4">Create Lineup</h1>
        
        {/* Game selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="">Select a game</option>
                {mockGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {new Date(game.date).toLocaleDateString()} vs {game.opponent} ({game.time})
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
                      const assignment = fieldingAssignments[currentInning - 1].find(
                        (a: any) => a.playerId === player.id
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
}