// src/components/lineup/AutomaticLineupGenerator.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRandom, FaArrowRight, FaInfoCircle } from 'react-icons/fa';

// Types for position data
interface Position {
  id: string;
  name: string;
  abbreviation: string;
}

interface Player {
  id: string;
  name: string;
  jerseyNumber: string;
  skillLevel: number;
  active: boolean;
  positionPreferences: PositionPreference[];
  stats?: PositionStats;
}

interface PositionPreference {
  position: string;
  preferenceLevel: number;
  allowed: boolean;
}

interface PositionStats {
  infieldPercentage: number;
  outfieldPercentage: number;
  benchPercentage: number;
  infieldInnings: number;
  outfieldInnings: number;
  benchInnings: number;
  totalInnings: number;
  positionInnings: Record<string, number>;
}

interface FieldingAssignment {
  playerId: string;
  position: string;
}

interface GeneratedLineup {
  battingOrder: Player[];
  fieldingAssignments: FieldingAssignment[][];
}

interface LineupRules {
  balanceInfieldOutfield: boolean;
  respectPreferences: boolean;
  rotateWeakerPlayers: boolean;
  ensureEqualBenchTime: boolean;
  opponentDifficulty: number;
}

// Position data
const infielderPositions: Position[] = [
  { id: 'pitcher', name: 'Pitcher', abbreviation: 'P' },
  { id: 'catcher', name: 'Catcher', abbreviation: 'C' },
  { id: 'first_base', name: '1st Base', abbreviation: '1B' },
  { id: 'second_base', name: '2nd Base', abbreviation: '2B' },
  { id: 'third_base', name: '3rd Base', abbreviation: '3B' },
  { id: 'shortstop', name: 'Shortstop', abbreviation: 'SS' },
];

const outfielderPositions: Position[] = [
  { id: 'left_field', name: 'Left Field', abbreviation: 'LF' },
  { id: 'left_center_field', name: 'Left-Center Field', abbreviation: 'LCF' },
  { id: 'center_field', name: 'Center Field', abbreviation: 'CF' },
  { id: 'right_center_field', name: 'Right-Center Field', abbreviation: 'RCF' },
  { id: 'right_field', name: 'Right Field', abbreviation: 'RF' },
];

const positionsByType: Record<string, Position[]> = {
  infield: infielderPositions,
  outfield: outfielderPositions
};

const AutomaticLineupGenerator: React.FC<{
  gameId: string;
  teamId: string;
  players: Player[];
  innings: number;
  outfielderCount: number;
  onLineupGenerated: (lineup: GeneratedLineup) => void;
}> = ({ gameId, teamId, players, innings, outfielderCount, onLineupGenerated }) => {
  const [rules, setRules] = useState<LineupRules>({
    balanceInfieldOutfield: true,
    respectPreferences: true,
    rotateWeakerPlayers: true,
    ensureEqualBenchTime: true,
    opponentDifficulty: 3
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [generatedLineup, setGeneratedLineup] = useState<GeneratedLineup | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle rule changes
  const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setRules({
      ...rules,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    });
  };

  // Generate lineup based on rules
  const generateLineup = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // 1. Generate batting order
      const battingOrder = await generateBattingOrder();
      
      // 2. Generate fielding assignments
      const fieldingAssignments = await generateFieldingAssignments(battingOrder);
      
      // Set the generated lineup
      const lineup: GeneratedLineup = {
        battingOrder,
        fieldingAssignments
      };
      
      setGeneratedLineup(lineup);
      onLineupGenerated(lineup);
    } catch (err) {
      console.error('Error generating lineup:', err);
      setError('Failed to generate lineup. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate batting order based on rules
  const generateBattingOrder = async (): Promise<Player[]> => {
    // Start with active players
    const activePlayers = players.filter(player => player.active);
    
    // Create a copy of player list for modification
    let orderedPlayers = [...activePlayers];
    
    // For weak opponents, give weaker players better spots
    if (rules.opponentDifficulty <= 2 && rules.rotateWeakerPlayers) {
      // Sort by skill level (ascending) - weaker players bat first
      orderedPlayers.sort((a, b) => a.skillLevel - b.skillLevel);
    }
    // For strong opponents, put stronger players in better spots
    else if (rules.opponentDifficulty >= 4) {
      // Sort by skill level (descending) - stronger players bat first
      orderedPlayers.sort((a, b) => b.skillLevel - a.skillLevel);
    }
    // For average opponents, mix it up but with some structure
    else {
      // Create a balanced lineup considering previous batting positions
      orderedPlayers = createBalancedBattingOrder(activePlayers);
    }
    
    return orderedPlayers;
  };

  // Create a balanced batting order for average difficulty opponents
  const createBalancedBattingOrder = (players: Player[]): Player[] => {
    // Get a copy of the players
    const playersCopy = [...players];
    
    // Mix skilled and less skilled players
    playersCopy.sort((a, b) => {
      // Get previous batting stats if available
      const aAvgPosition = a.stats?.positionInnings?.['battingPosition'] || 5;
      const bAvgPosition = b.stats?.positionInnings?.['battingPosition'] || 5;
      
      // Calculate a score based on skill and previous batting positions
      const aScore = a.skillLevel * 0.7 + (10 - aAvgPosition) * 0.3;
      const bScore = b.skillLevel * 0.7 + (10 - bAvgPosition) * 0.3;
      
      return bScore - aScore;
    });
    
    // Create the balanced order by alternating between top and bottom half
    const balancedOrder: Player[] = [];
    const midpoint = Math.ceil(playersCopy.length / 2);
    
    for (let i = 0; i < midpoint; i++) {
      // Add a player from the top half
      balancedOrder.push(playersCopy[i]);
      
      // Add a player from the bottom half if available
      if (i + midpoint < playersCopy.length) {
        balancedOrder.push(playersCopy[i + midpoint]);
      }
    }
    
    return balancedOrder;
  };

  // Generate fielding assignments based on rules
  const generateFieldingAssignments = async (battingOrder: Player[]): Promise<FieldingAssignment[][]> => {
    const assignments: FieldingAssignment[][] = [];
    
    // Get available positions based on outfielder count
    const availablePositions = [...infielderPositions];
    if (outfielderCount === 3) {
      availablePositions.push(
        { id: 'left_field', name: 'Left Field', abbreviation: 'LF' },
        { id: 'center_field', name: 'Center Field', abbreviation: 'CF' },
        { id: 'right_field', name: 'Right Field', abbreviation: 'RF' }
      );
    } else {
      availablePositions.push(...outfielderPositions);
    }
    
    // Calculate how many players sit each inning (if needed)
    const playersPerInning = availablePositions.length;
    const benchPlayersPerInning = Math.max(0, battingOrder.length - playersPerInning);
    
    // Track assigned positions for each player
    const playerAssignments: Record<string, {
      infield: number;
      outfield: number;
      bench: number;
      positions: Record<string, number>;
    }> = {};
    
    // Initialize tracking
    battingOrder.forEach(player => {
      playerAssignments[player.id] = {
        infield: 0,
        outfield: 0,
        bench: 0,
        positions: {}
      };
    });
    
    // Generate assignments for each inning
    for (let inning = 1; inning <= innings; inning++) {
      const inningAssignments: FieldingAssignment[] = [];
      
      // Get all active players not yet assigned for this inning
      const availablePlayers = [...battingOrder];
      
      // Determine bench players for this inning
      const benchPlayers = selectBenchPlayers(availablePlayers, benchPlayersPerInning, playerAssignments, inning);
      
      // Remove bench players from available players
      const fieldingPlayers = availablePlayers.filter(player => !benchPlayers.includes(player));
      
      // Assign bench players
      benchPlayers.forEach(player => {
        inningAssignments.push({
          playerId: player.id,
          position: 'bench'
        });
        
        // Update player's assignments
        playerAssignments[player.id].bench += 1;
      });
      
      // Assign fielding players to positions
      const fieldingAssignments = assignFieldingPositions(
        fieldingPlayers, 
        availablePositions, 
        playerAssignments,
        inning
      );
      
      // Add fielding assignments
      inningAssignments.push(...fieldingAssignments);
      
      // Update player assignments tracking
      fieldingAssignments.forEach(assignment => {
        const position = assignment.position;
        const playerId = assignment.playerId;
        
        // Track position count
        playerAssignments[playerId].positions[position] = 
          (playerAssignments[playerId].positions[position] || 0) + 1;
        
        // Track infield/outfield count
        if (infielderPositions.some(p => p.id === position)) {
          playerAssignments[playerId].infield += 1;
        } else if (outfielderPositions.some(p => p.id === position)) {
          playerAssignments[playerId].outfield += 1;
        }
      });
      
      // Add this inning's assignments
      assignments.push(inningAssignments);
    }
    
    // Balance assignments if needed
    return balanceFieldingAssignments(assignments, playerAssignments, battingOrder);
  };

  // Select players to sit on bench for an inning
  const selectBenchPlayers = (
    players: Player[],
    benchCount: number,
    assignmentTracking: Record<string, any>,
    inning: number
  ): Player[] => {
    if (benchCount === 0) {
      return [];
    }
    
    // Copy players array
    const playersList = [...players];
    
    // Score players based on how much bench time they've had
    playersList.sort((a, b) => {
      // Get bench counts
      const aBenchCount = assignmentTracking[a.id]?.bench || 0;
      const bBenchCount = assignmentTracking[b.id]?.bench || 0;
      
      // Player with least bench time should be benched first
      return aBenchCount - bBenchCount;
    });
    
    // For strong opponents, try not to bench skilled players
    if (rules.opponentDifficulty >= 4) {
      // Re-sort giving weight to skill level
      playersList.sort((a, b) => {
        const aBenchCount = assignmentTracking[a.id]?.bench || 0;
        const bBenchCount = assignmentTracking[b.id]?.bench || 0;
        
        // Combine bench count and skill level (inverse)
        const aScore = aBenchCount * 3 + (6 - a.skillLevel) * 2;
        const bScore = bBenchCount * 3 + (6 - b.skillLevel) * 2;
        
        return aScore - bScore;
      });
    }
    
    // For weak opponents, bench skilled players more often
    if (rules.opponentDifficulty <= 2 && rules.rotateWeakerPlayers) {
      // Re-sort giving weight to skill level
      playersList.sort((a, b) => {
        const aBenchCount = assignmentTracking[a.id]?.bench || 0;
        const bBenchCount = assignmentTracking[b.id]?.bench || 0;
        
        // Combine bench count and skill level
        const aScore = aBenchCount * 3 + a.skillLevel * 2;
        const bScore = bBenchCount * 3 + b.skillLevel * 2;
        
        return aScore - bScore;
      });
    }
    
    // Return the first benchCount players to bench
    return playersList.slice(0, benchCount);
  };

  // Assign fielding positions to players
  const assignFieldingPositions = (
    players: Player[],
    availablePositions: Position[],
    assignmentTracking: Record<string, any>,
    inning: number
  ): FieldingAssignment[] => {
    const assignments: FieldingAssignment[] = [];
    
    // Copy arrays to avoid modifying originals
    const remainingPlayers = [...players];
    const remainingPositions = [...availablePositions];
    
    // First pass: Assign players to their primary positions if they're needed there
    if (rules.respectPreferences) {
      // Identify critical positions that need coverage (skill level 4-5 difficulty)
      const criticalPositions = rules.opponentDifficulty >= 4 
        ? ['pitcher', 'catcher', 'shortstop', 'first_base'] 
        : [];
      
      // Try to assign players to critical positions first
      for (const positionId of criticalPositions) {
        const position = remainingPositions.find(p => p.id === positionId);
        if (!position) continue;
        
        // Find the best player for this position
        const playerIndex = findBestPlayerForPosition(
          remainingPlayers,
          position,
          assignmentTracking
        );
        
        if (playerIndex !== -1) {
          const player = remainingPlayers[playerIndex];
          
          // Assign the player
          assignments.push({
            playerId: player.id,
            position: position.id
          });
          
          // Remove player and position from available lists
          remainingPlayers.splice(playerIndex, 1);
          remainingPositions.splice(remainingPositions.findIndex(p => p.id === position.id), 1);
        }
      }
      
      // Now try to assign based on player preferences and balance needs
      for (let i = remainingPlayers.length - 1; i >= 0; i--) {
        const player = remainingPlayers[i];
        
        // Find position preferences with level 5 (primary)
        const primaryPositions = player.positionPreferences
          .filter(pref => pref.preferenceLevel >= 5 && pref.allowed)
          .map(pref => pref.position);
        
        // See if any primary positions are available
        const availablePrimary = primaryPositions.filter(
          posId => remainingPositions.some(pos => pos.id === posId)
        );
        
        if (availablePrimary.length > 0) {
          // Choose position based on infield/outfield balance needs
          const chosenPosition = choosePositionBasedOnBalance(
            availablePrimary,
            player,
            assignmentTracking
          );
          
          if (chosenPosition) {
            // Assign the player
            assignments.push({
              playerId: player.id,
              position: chosenPosition
            });
            
            // Remove player and position from available lists
            remainingPlayers.splice(i, 1);
            remainingPositions.splice(
              remainingPositions.findIndex(p => p.id === chosenPosition),
              1
            );
          }
        }
      }
    }
    
    // Second pass: Assign players to any available position, considering balance needs
    while (remainingPlayers.length > 0 && remainingPositions.length > 0) {
      // Find the player with greatest need (least balanced currently)
      let playerIndex = 0;
      let maxImbalance = 0;
      
      remainingPlayers.forEach((player, index) => {
        const tracking = assignmentTracking[player.id];
        const totalAssigned = tracking.infield + tracking.outfield;
        
        // Skip if player has no assignments yet
        if (totalAssigned === 0) return;
        
        const imbalance = Math.abs(tracking.infield - tracking.outfield);
        if (imbalance > maxImbalance) {
          maxImbalance = imbalance;
          playerIndex = index;
        }
      });
      
      const player = remainingPlayers[playerIndex];
      
      // Determine if player needs more infield or outfield time
      const tracking = assignmentTracking[player.id];
      const needsMoreInfield = tracking.infield < tracking.outfield;
      
      // Find the best position for player
      let bestPosition: string | null = null;
      
      // Try to find position in needed area (infield/outfield)
      const neededPositions = needsMoreInfield
        ? remainingPositions.filter(p => infielderPositions.some(ip => ip.id === p.id))
        : remainingPositions.filter(p => outfielderPositions.some(op => op.id === p.id));
      
      if (neededPositions.length > 0) {
        // Filter out avoided positions
        const allowedPositions = neededPositions.filter(pos => 
          !player.positionPreferences.some(pref => 
            pref.position === pos.id && (pref.preferenceLevel <= 1 || !pref.allowed)
          )
        );
        
        if (allowedPositions.length > 0) {
          // Choose the first allowed position
          bestPosition = allowedPositions[0].id;
        }
      }
      
      // If no suitable position was found, just use any position
      if (!bestPosition && remainingPositions.length > 0) {
        // Filter out avoided positions if possible
        const nonAvoidedPositions = remainingPositions.filter(pos => 
          !player.positionPreferences.some(pref => 
            pref.position === pos.id && (pref.preferenceLevel <= 1 || !pref.allowed)
          )
        );
        
        if (nonAvoidedPositions.length > 0) {
          bestPosition = nonAvoidedPositions[0].id;
        } else {
          bestPosition = remainingPositions[0].id;
        }
      }
      
      if (bestPosition) {
        // Assign the player
        assignments.push({
          playerId: player.id,
          position: bestPosition
        });
        
        // Remove player and position from available lists
        remainingPlayers.splice(playerIndex, 1);
        remainingPositions.splice(
          remainingPositions.findIndex(p => p.id === bestPosition),
          1
        );
      }
    }
    
    return assignments;
  };

  // Find the best player for a specific position
  const findBestPlayerForPosition = (
    players: Player[],
    position: Position,
    assignmentTracking: Record<string, any>
  ): number => {
    let bestPlayerIndex = -1;
    let bestScore = -1;
    
    players.forEach((player, index) => {
      let score = 0;
      
      // Check if this is a primary position for the player
      const positionPref = player.positionPreferences.find(pref => pref.position === position.id);
      
      if (positionPref) {
        if (positionPref.preferenceLevel >= 5) {
          score += 50; // Primary position
        } else if (positionPref.preferenceLevel >= 4) {
          score += 30; // Secondary position
        } else if (positionPref.preferenceLevel >= 3) {
          score += 10; // Neutral position
        } else if (positionPref.preferenceLevel <= 1 || !positionPref.allowed) {
          score -= 40; // Avoided position
        }
      }
      
      // Add skill level factor
      score += player.skillLevel * 5;
      
      // Check if this position helps balance infield/outfield time
      const tracking = assignmentTracking[player.id];
      const isInfield = infielderPositions.some(p => p.id === position.id);
      const isOutfield = outfielderPositions.some(p => p.id === position.id);
      
      if (isInfield && tracking.infield < tracking.outfield) {
        score += 20; // Player needs more infield time
      } else if (isOutfield && tracking.outfield < tracking.infield) {
        score += 20; // Player needs more outfield time
      }
      
      // Update best player if this is the highest score so far
      if (score > bestScore) {
        bestScore = score;
        bestPlayerIndex = index;
      }
    });
    
    return bestPlayerIndex;
  };

  // Choose a position based on player's infield/outfield balance needs
  const choosePositionBasedOnBalance = (
    positionIds: string[],
    player: Player,
    assignmentTracking: Record<string, any>
  ): string | null => {
    // Get player tracking
    const tracking = assignmentTracking[player.id];
    
    // Determine if player needs more infield or outfield time
    const totalAssigned = tracking.infield + tracking.outfield;
    if (totalAssigned === 0) {
      // No preference yet, just pick the first position
      return positionIds[0];
    }
    
    const needsMoreInfield = tracking.infield < tracking.outfield;
    
    // Classify positions as infield or outfield
    const infieldPositionIds = positionIds.filter(id => 
      infielderPositions.some(p => p.id === id)
    );
    
    const outfieldPositionIds = positionIds.filter(id => 
      outfielderPositions.some(p => p.id === id)
    );
    
    // Choose based on need
    if (needsMoreInfield && infieldPositionIds.length > 0) {
      return infieldPositionIds[0];
    } else if (!needsMoreInfield && outfieldPositionIds.length > 0) {
      return outfieldPositionIds[0];
    }
    
    // If no position matches the need, return any position
    return positionIds[0];
  };

  // Balance fielding assignments to ensure fairness
  const balanceFieldingAssignments = (
    assignments: FieldingAssignment[][],
    playerAssignments: Record<string, any>,
    players: Player[]
  ): FieldingAssignment[][] => {
    if (!rules.balanceInfieldOutfield) {
      return assignments;
    }
    
    // Make a copy of the assignments
    const balancedAssignments = [...assignments.map(inning => [...inning])];
    
    // Identify players with significant imbalance
    const imbalancedPlayers = players.filter(player => {
      const tracking = playerAssignments[player.id];
      const totalFielding = tracking.infield + tracking.outfield;
      
      // Skip if not enough innings to judge
      if (totalFielding < 4) return false;
      
      // Check if significant imbalance exists (e.g., 75%/25% split or worse)
      const infieldPercentage = (tracking.infield / totalFielding) * 100;
      return infieldPercentage <= 25 || infieldPercentage >= 75;
    });
    
    // For each imbalanced player, try to swap one inning
    imbalancedPlayers.forEach(player => {
      const tracking = playerAssignments[player.id];
      const needsMoreInfield = tracking.infield < tracking.outfield;
      
      // Find an inning to swap
      for (let inningIndex = 0; inningIndex < balancedAssignments.length; inningIndex++) {
        const inningAssignments = balancedAssignments[inningIndex];
        
        // Find player's assignment
        const playerAssignmentIndex = inningAssignments.findIndex(
          a => a.playerId === player.id
        );
        
        if (playerAssignmentIndex === -1) continue;
        
        const playerAssignment = inningAssignments[playerAssignmentIndex];
        
        // Check if player is in the wrong type of position
        const isInfield = infielderPositions.some(p => p.id === playerAssignment.position);
        const isOutfield = outfielderPositions.some(p => p.id === playerAssignment.position);
        
        if ((needsMoreInfield && isOutfield) || (!needsMoreInfield && isInfield)) {
          // Find someone to swap with
          const swapCandidates = inningAssignments.filter(a => {
            if (a.playerId === player.id) return false;
            
            const isSwapInfield = infielderPositions.some(p => p.id === a.position);
            const isSwapOutfield = outfielderPositions.some(p => p.id === a.position);
            
            // Candidate should be in the opposite type of position
            return (needsMoreInfield && isSwapInfield) || (!needsMoreInfield && isSwapOutfield);
          });
          
          if (swapCandidates.length > 0) {
            // Find the best candidate to swap with
            let bestCandidateIndex = 0;
            
            // Prefer swapping with someone who doesn't have an imbalance in the opposite direction
            swapCandidates.forEach((candidate, index) => {
              const candidatePlayer = players.find(p => p.id === candidate.playerId);
              if (!candidatePlayer) return;
              
              const candidateTracking = playerAssignments[candidatePlayer.id];
              const candidateNeedsMoreInfield = candidateTracking.infield < candidateTracking.outfield;
              
              // If needs are complementary, this is a good swap
              if (needsMoreInfield !== candidateNeedsMoreInfield) {
                bestCandidateIndex = index;
              }
            });
            
            const swapWith = swapCandidates[bestCandidateIndex];
            
            // Perform the swap
            const tempPosition = playerAssignment.position;
            playerAssignment.position = swapWith.position;
            swapWith.position = tempPosition;
            
            // We've made a swap, so break out of the innings loop
            break;
          }
        }
      }
    });
    
    return balancedAssignments;
  };

  // Utility function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-thunder-dark">Automatic Lineup Generator</h2>
        <button
          onClick={() => setShowRules(!showRules)}
          className="mt-2 sm:mt-0 text-sm text-thunder-primary flex items-center"
        >
          <FaInfoCircle className="mr-1" />
          {showRules ? 'Hide Rules' : 'Show Rules'}
        </button>
      </div>
{/* Rules Panel */}
{showRules && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Lineup Generation Rules</h3>
          
          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-700 block mb-2">
                Opponent Difficulty (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="opponentDifficulty"
                  min="1"
                  max="5"
                  value={rules.opponentDifficulty}
                  onChange={handleRuleChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 font-medium">
                  {rules.opponentDifficulty}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easier</span>
                <span>Average</span>
                <span>Harder</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="balanceInfieldOutfield"
                  name="balanceInfieldOutfield"
                  checked={rules.balanceInfieldOutfield}
                  onChange={handleRuleChange}
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                />
                <label htmlFor="balanceInfieldOutfield" className="ml-2 block text-sm text-gray-700">
                  Balance Infield/Outfield Time
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="respectPreferences"
                  name="respectPreferences"
                  checked={rules.respectPreferences}
                  onChange={handleRuleChange}
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                />
                <label htmlFor="respectPreferences" className="ml-2 block text-sm text-gray-700">
                  Respect Position Preferences
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rotateWeakerPlayers"
                  name="rotateWeakerPlayers"
                  checked={rules.rotateWeakerPlayers}
                  onChange={handleRuleChange}
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                />
                <label htmlFor="rotateWeakerPlayers" className="ml-2 block text-sm text-gray-700">
                  Rotate Weaker Players (Easy Games)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ensureEqualBenchTime"
                  name="ensureEqualBenchTime"
                  checked={rules.ensureEqualBenchTime}
                  onChange={handleRuleChange}
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                />
                <label htmlFor="ensureEqualBenchTime" className="ml-2 block text-sm text-gray-700">
                  Ensure Equal Bench Time
                </label>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>What This Means:</strong></p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>
                  {rules.opponentDifficulty <= 2 && 
                    "For easier opponents, weaker players will get more opportunities to play preferred positions and bat higher in the order."
                  }
                  {rules.opponentDifficulty === 3 && 
                    "For average opponents, lineup will be balanced between player development and competitiveness."
                  }
                  {rules.opponentDifficulty >= 4 && 
                    "For stronger opponents, focus on putting players in their strongest positions."
                  }
                </li>
                {rules.balanceInfieldOutfield && (
                  <li>
                    Players who need more infield or outfield time will be prioritized to help achieve 50/50 balance.
                  </li>
                )}
                {rules.respectPreferences && (
                  <li>
                    Position assignments will respect each player's primary and secondary position preferences.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Difficulty Level Quick Buttons */}
      <div className="mb-6">
        <label className="font-medium text-gray-700 block mb-2">
          Quick Set Difficulty:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRules({...rules, opponentDifficulty: 1, rotateWeakerPlayers: true})}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              rules.opponentDifficulty === 1
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Easy Opponent
          </button>
          <button
            onClick={() => setRules({...rules, opponentDifficulty: 3, rotateWeakerPlayers: true})}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              rules.opponentDifficulty === 3
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Average Opponent
          </button>
          <button
            onClick={() => setRules({...rules, opponentDifficulty: 5, rotateWeakerPlayers: false})}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              rules.opponentDifficulty === 5
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Strong Opponent
          </button>
        </div>
      </div>
      
      {/* Results Preview Section */}
      {generatedLineup && (
        <div className="mb-6">
          <h3 className="font-medium mb-3">Generated Lineup Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-3">
              <h4 className="font-medium">Batting Order</h4>
              <span className="text-xs text-gray-500">{generatedLineup.battingOrder.length} Players</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
              {generatedLineup.battingOrder.map((player, index) => (
                <div key={player.id} className="flex items-center bg-white p-2 rounded border border-gray-200">
                  <span className="bg-thunder-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  <span className="text-sm truncate">{player.name}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mb-3">
              <h4 className="font-medium">Field Positions</h4>
              <span className="text-xs text-gray-500">{innings} Innings</span>
            </div>
            <div className="text-sm">
              <p>Fielding assignments have been generated for {innings} innings.</p>
              <p className="mt-1">
                <span className="text-thunder-primary font-medium">{Math.round(innings * 0.5)} players</span> will 
                get more balanced infield/outfield time than their current stats.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}
      
      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateLineup}
          disabled={isGenerating}
          className={`px-6 py-3 ${
            isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-thunder-primary hover:bg-thunder-primary/90'
          } text-white rounded-lg flex items-center justify-center min-w-[180px]`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <FaRandom className="mr-2" />
              Generate Lineup
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AutomaticLineupGenerator;