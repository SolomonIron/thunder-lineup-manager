"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaPrint } from 'react-icons/fa';
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

export default function LineupViewPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<any>(null);
  const [battingOrder, setBattingOrder] = useState<any[]>([]);
  const [fieldingAssignments, setFieldingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'batting' | 'fielding'>('batting');
  const [currentInning, setCurrentInning] = useState(1);
  
  // Fetch lineup data on component mount
  useEffect(() => {
    fetchLineup();
  }, [gameId]);
  
  // Function to fetch lineup data
  const fetchLineup = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lineups/${gameId}`);
      
      setGame(response.data.game);
      setBattingOrder(response.data.battingOrder);
      setFieldingAssignments(response.data.fieldingAssignments);
      setError(null);
    } catch (err) {
      console.error('Error fetching lineup:', err);
      setError('Failed to load lineup. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to print the lineup
  const printLineup = () => {
    window.print();
  };
  
  // Utility function to get position name from id
  const getPositionName = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    return position ? position.name : positionId;
  };
  
  // If loading, show spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lineup...</p>
        </div>
      </div>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block">{error}</span>
          <div className="mt-4">
            <Link
              href="/games"
              className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20 print:ml-0">
      <div className="flex items-center mb-6 print:hidden">
        <Link
          href="/games"
          className="mr-4 text-thunder-primary hover:text-thunder-primary/80"
        >
          <FaArrowLeft className="text-xl" />
        </Link>
        <h1 className="text-2xl font-bold text-thunder-dark">View Lineup</h1>
      </div>
      
      {/* Game Info */}
      {game && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-thunder-dark">vs {game.opponentName}</h2>
              <p className="text-sm text-gray-600">
                {new Date(game.gameDate).toLocaleDateString()} at {new Date(game.gameDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-sm text-gray-600">{game.location}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2 print:hidden">
              <Link
                href={`/lineups/create?gameId=${game.id}`}
                className="flex items-center px-3 py-1 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90"
              >
                <FaEdit className="mr-1" />
                Edit
              </Link>
              <button
                onClick={printLineup}
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                <FaPrint className="mr-1" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 print:shadow-none">
        <div className="flex border-b border-gray-200 print:hidden">
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
        
        {/* Print View - Always visible in print mode */}
        <div className="hidden print:block p-6">
          <h2 className="text-xl font-bold mb-4 text-center">{game?.opponentName} - {new Date(game?.gameDate).toLocaleDateString()}</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Batting order */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">Batting Order</h3>
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b border-r border-gray-300 text-left">#</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left">Player</th>
                  </tr>
                </thead>
                <tbody>
                  {battingOrder.map((player, index) => (
                    <tr key={player.id} className="border-b border-gray-300">
                      <td className="py-2 px-4 border-r border-gray-300 font-bold">{index + 1}</td>
                      <td className="py-2 px-4">
                        {player.jerseyNumber && (
                          <span className="inline-block bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 mr-2 text-center leading-5">
                            {player.jerseyNumber}
                          </span>
                        )}
                        {player.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Fielding assignments */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">Fielding Assignments</h3>
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b border-r border-gray-300 text-left">Player</th>
                    {fieldingAssignments.map((_, index) => (
                      <th key={index} className="py-2 px-4 border-b border-r border-gray-300 text-center">
                        {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {battingOrder.map((player) => {
                    return (
                      <tr key={player.id} className="border-b border-gray-300">
                        <td className="py-2 px-4 border-r border-gray-300">
                          {player.jerseyNumber && (
                            <span className="inline-block bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 mr-2 text-center leading-5">
                              {player.jerseyNumber}
                            </span>
                          )}
                          {player.name}
                        </td>
                        {fieldingAssignments.map((inning, index) => {
                          const assignment = inning.find(a => a.playerId === player.id);
                          const position = assignment ? assignment.position : 'bench';
                          const posObj = positions.find(p => p.id === position);
                          return (
                            <td key={index} className="py-2 px-4 border-r border-gray-300 text-center">
                              {posObj?.abbreviation || position}
                            </td>
                          );
                        })
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Batting Tab */}
        {activeTab === 'batting' && (
          <div className="p-6 print:hidden">
            <h2 className="text-lg font-semibold mb-4">Batting Order</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">{battingOrder.map((player, index) => (
                    <tr key={player.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {player.jerseyNumber && (
                            <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                              {player.jerseyNumber}
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900">{player.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Fielding Tab */}
        {activeTab === 'fielding' && (
          <div className="p-6 print:hidden">
            <h2 className="text-lg font-semibold mb-3">Fielding Positions</h2>
            
            {/* Inning selector */}
            <div className="mb-4 flex flex-wrap gap-1">
              {fieldingAssignments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInning(index + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentInning === index + 1
                      ? 'bg-thunder-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Inning {index + 1}
                </button>
              ))}
            </div>
            
            {/* Current inning fielding */}
            {fieldingAssignments.length > 0 && fieldingAssignments[currentInning - 1] && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {battingOrder.map((player) => {
                      const assignment = fieldingAssignments[currentInning - 1].find(
                        a => a.playerId === player.id
                      );
                      const position = assignment ? assignment.position : 'bench';
                      
                      return (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {player.jerseyNumber && (
                                <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                  {player.jerseyNumber}
                                </span>
                              )}
                              <span className="text-sm font-medium text-gray-900">{player.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              position === 'bench'
                                ? 'bg-gray-100 text-gray-800'
                                : position.includes('field')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {getPositionName(position)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Field visualization */}
            <div className="mt-8">
              <h3 className="text-md font-medium mb-3 text-center">Field View - Inning {currentInning}</h3>
              
              <div className="relative w-full max-w-lg mx-auto h-80 bg-green-100 rounded-lg overflow-hidden border border-green-300">
                {/* Home plate */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border border-gray-400"></div>

                {/* Field outline */}
                <div className="w-0 h-0 absolute bottom-4 left-1/2 transform -translate-x-1/2
                    border-l-[150px] border-r-[150px] border-t-[200px]
                    border-l-transparent border-r-transparent border-t-green-200"></div>
                
                {/* Infield diamond */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rotate-45 w-40 h-40 border-2 border-gray-400"></div>
                
                {/* Player positions */}
                {fieldingAssignments.length > 0 && fieldingAssignments[currentInning - 1] && (
                  <>
                    {/* Display players at their positions */}
                    {fieldingAssignments[currentInning - 1].map(assignment => {
                      if (assignment.position === 'bench') return null;
                      
                      const player = battingOrder.find(p => p.id === assignment.playerId);
                      if (!player) return null;
                      
                      let positionStyle = {};
                      
                      // Position coordinates
                      switch (assignment.position) {
                        case 'pitcher':
                          positionStyle = { top: '45%', left: '50%' };
                          break;
                        case 'catcher':
                          positionStyle = { bottom: '10px', left: '50%' };
                          break;
                        case 'first_base':
                          positionStyle = { top: '45%', right: '30%' };
                          break;
                        case 'second_base':
                          positionStyle = { top: '30%', left: '50%' };
                          break;
                        case 'third_base':
                          positionStyle = { top: '45%', left: '30%' };
                          break;
                        case 'shortstop':
                          positionStyle = { top: '35%', left: '35%' };
                          break;
                        case 'left_field':
                          positionStyle = { top: '15%', left: '25%' };
                          break;
                        case 'left_center_field':
                          positionStyle = { top: '10%', left: '40%' };
                          break;
                        case 'center_field':
                          positionStyle = { top: '5%', left: '50%' };
                          break;
                        case 'right_center_field':
                          positionStyle = { top: '10%', right: '40%' };
                          break;
                        case 'right_field':
                          positionStyle = { top: '15%', right: '25%' };
                          break;
                        default:
                          return null;
                      }
                      
                      return (
                        <div key={player.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={positionStyle}>
                          <div className="bg-thunder-primary text-white text-xs font-medium rounded-full w-7 h-7 flex items-center justify-center">
                            {player.jerseyNumber || '#'}
                          </div>
                        </div>
                      );
                    })
                  </>
                )}