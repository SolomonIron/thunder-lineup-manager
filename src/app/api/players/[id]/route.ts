// src/app/api/players/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Interface for tracking position data
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

// GET /api/players/[id] - Get a specific player with position tracking data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    
    // Fetch the player with position preferences
    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
        fieldingLineups: {
          include: {
            game: true
          }
        }
      },
    });
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Calculate position statistics from fielding history
    const positionStats = calculatePositionStats(player.fieldingLineups);
    
    // Add position stats to the player object
    const playerWithStats = {
      ...player,
      stats: positionStats
    };
    
    return NextResponse.json(playerWithStats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
}

// PUT /api/players/[id] - Update a player
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    const body = await request.json();
    
    const { 
      name, 
      jerseyNumber, 
      skillLevel, 
      active, 
      positionPreferences 
    } = body;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    
    // Update player basic info if provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (skillLevel !== undefined) updateData.skillLevel = skillLevel;
    if (active !== undefined) updateData.active = active;
    
    const updatedPlayer = await prisma.player.update({
      where: {
        id: playerId,
      },
      data: updateData,
    });
    
    // Update position preferences if provided
    if (positionPreferences && positionPreferences.length > 0) {
      // Delete existing position preferences
      await prisma.playerPositionPreference.deleteMany({
        where: {
          playerId,
        },
      });
      
      // Create new position preferences
      await Promise.all(
        positionPreferences.map((pref: any) => 
          prisma.playerPositionPreference.create({
            data: {
              playerId,
              position: pref.position,
              preferenceLevel: pref.preferenceLevel || 3,
              allowed: pref.allowed !== false,
            },
          })
        )
      );
    }
    
    // Fetch updated player with preferences and stats
    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
        fieldingLineups: {
          include: {
            game: true
          }
        }
      },
    });
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found after update' }, { status: 404 });
    }
    
    // Calculate position statistics
    const positionStats = calculatePositionStats(player.fieldingLineups);
    
    // Add position stats to the player object
    const playerWithStats = {
      ...player,
      stats: positionStats
    };
    
    return NextResponse.json(playerWithStats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

// DELETE /api/players/[id] - Delete a player
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    
    // Delete player
    await prisma.player.delete({
      where: {
        id: playerId,
      },
    });
    
    return NextResponse.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}

// Helper function to calculate position statistics from fielding history
function calculatePositionStats(fieldingLineups: any[]): PositionStats {
  // Define infield and outfield positions
  const infieldPositions = ['pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop'];
  const outfieldPositions = ['left_field', 'center_field', 'right_field', 'left_center_field', 'right_center_field'];
  
  // Initialize stats
  const stats: PositionStats = {
    infieldPercentage: 0,
    outfieldPercentage: 0,
    benchPercentage: 0,
    infieldInnings: 0,
    outfieldInnings: 0,
    benchInnings: 0,
    totalInnings: 0,
    positionInnings: {}
  };
  
  // If no fielding data, return default stats
  if (!fieldingLineups || fieldingLineups.length === 0) {
    return {
      ...stats,
      infieldPercentage: 50, // Default to 50/50 balance if no data
      outfieldPercentage: 50
    };
  }
  
  // Count innings by position
  fieldingLineups.forEach(lineup => {
    const position = lineup.position;
    
    // Increment total innings
    stats.totalInnings++;
    
    // Increment position-specific counter
    stats.positionInnings[position] = (stats.positionInnings[position] || 0) + 1;
    
    // Classify as infield, outfield, or bench
    if (infieldPositions.includes(position)) {
      stats.infieldInnings++;
    } else if (outfieldPositions.includes(position)) {
      stats.outfieldInnings++;
    } else if (position === 'bench') {
      stats.benchInnings++;
    }
  });
  
  // Calculate percentages
  if (stats.totalInnings > 0) {
    stats.infieldPercentage = Math.round((stats.infieldInnings / stats.totalInnings) * 100);
    stats.outfieldPercentage = Math.round((stats.outfieldInnings / stats.totalInnings) * 100);
    stats.benchPercentage = Math.round((stats.benchInnings / stats.totalInnings) * 100);
  } else {
    // Default to 50/50 balance if no data
    stats.infieldPercentage = 50;
    stats.outfieldPercentage = 50;
  }
  
  return stats;
}

// POST /api/players/[id]/lineup-recommendations - Generate lineup recommendations
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    const body = await request.json();
    
    const { 
      gameId,
      opponentDifficulty,  // 1-5 scale
      totalInnings,        // Number of innings in the game
    } = body;
    
    if (!playerId || !gameId) {
      return NextResponse.json({ error: 'Player ID and Game ID are required' }, { status: 400 });
    }
    
    // Fetch player with position preferences and stats
    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
        fieldingLineups: {
          include: {
            game: true
          }
        }
      },
    });
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // Calculate position statistics
    const positionStats = calculatePositionStats(player.fieldingLineups);
    
    // Generate position recommendations based on difficulty level
    const recommendations = generatePositionRecommendations(
      player, 
      positionStats, 
      opponentDifficulty, 
      totalInnings
    );
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

// Generate position recommendations based on player's history, preferences, and opponent difficulty
function generatePositionRecommendations(
  player: any,
  stats: PositionStats,
  opponentDifficulty: number,
  totalInnings: number
) {
  // Define infield and outfield positions
  const infieldPositions = ['pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop'];
  const outfieldPositions = ['left_field', 'center_field', 'right_field', 'left_center_field', 'right_center_field'];
  
  // Determine if player needs more infield or outfield time for balance
  const currentImbalance = Math.abs(stats.infieldPercentage - 50);
  const needsMoreInfield = stats.infieldPercentage < 50;
  
  // Extract player's position preferences
  const preferredPositions = player.positionPreferences
    .filter((pref: any) => pref.preferenceLevel >= 4 && pref.allowed)
    .map((pref: any) => pref.position);
    
  const avoidPositions = player.positionPreferences
    .filter((pref: any) => pref.preferenceLevel <= 2 || !pref.allowed)
    .map((pref: any) => pref.position);
  
  // Get preferred infield and outfield positions
  const preferredInfield = preferredPositions.filter(pos => infieldPositions.includes(pos));
  const preferredOutfield = preferredPositions.filter(pos => outfieldPositions.includes(pos));
  
  // Generate different recommendations based on opponent difficulty
  let recommendations: any = {
    playerId: player.id,
    playerName: player.name,
    jerseyNumber: player.jerseyNumber,
    currentStats: stats,
    balanceTarget: {
      targetInfieldPercentage: 50,
      needsMoreInfield,
      currentImbalance
    },
    recommendations: []
  };
  
  // For weak opponents (1-2), prioritize balancing positions
  if (opponentDifficulty <= 2) {
    const focusArea = needsMoreInfield ? 'infield' : 'outfield';
    const targetInnings = Math.ceil(totalInnings * 0.67); // 67% of innings in needed area
    
    // Recommend positions in the area that needs more time
    if (focusArea === 'infield') {
      recommendations.recommendations.push({
        area: 'infield',
        suggestedInnings: targetInnings,
        reason: `Player needs more infield time to balance (currently ${stats.infieldPercentage}%)`,
        recommendedPositions: preferredInfield.length > 0 
          ? preferredInfield
          : infieldPositions.filter(pos => !avoidPositions.includes(pos)),
        priority: 'high'
      });
    } else {
      recommendations.recommendations.push({
        area: 'outfield',
        suggestedInnings: targetInnings,
        reason: `Player needs more outfield time to balance (currently ${stats.outfieldPercentage}%)`,
        recommendedPositions: preferredOutfield.length > 0 
          ? preferredOutfield
          : outfieldPositions.filter(pos => !avoidPositions.includes(pos)),
        priority: 'high'
      });
    }
  }
  // For average opponents (3), aim for 50/50 balance
  else if (opponentDifficulty === 3) {
    const inningsSplit = {
      infield: Math.round(totalInnings / 2),
      outfield: Math.round(totalInnings / 2)
    };
    
    recommendations.recommendations.push({
      area: 'infield',
      suggestedInnings: inningsSplit.infield,
      reason: 'Aiming for balanced playing time',
      recommendedPositions: preferredInfield.length > 0 
        ? preferredInfield
        : infieldPositions.filter(pos => !avoidPositions.includes(pos)),
      priority: 'medium'
    });
    
    recommendations.recommendations.push({
      area: 'outfield',
      suggestedInnings: inningsSplit.outfield,
      reason: 'Aiming for balanced playing time',
      recommendedPositions: preferredOutfield.length > 0 
        ? preferredOutfield
        : outfieldPositions.filter(pos => !avoidPositions.includes(pos)),
      priority: 'medium'
    });
  }
  // For strong opponents (4-5), prioritize preferred positions
  else {
    // Determine player's strength area (infield vs outfield)
    const isInfieldStrength = preferredInfield.length > preferredOutfield.length;
    const inningsSplit = isInfieldStrength 
      ? { infield: Math.ceil(totalInnings * 0.67), outfield: Math.floor(totalInnings * 0.33) }
      : { infield: Math.floor(totalInnings * 0.33), outfield: Math.ceil(totalInnings * 0.67) };
    
    // Recommend more time in strength area
    if (isInfieldStrength) {
      recommendations.recommendations.push({
        area: 'infield',
        suggestedInnings: inningsSplit.infield,
        reason: 'Prioritizing player strengths for difficult opponent',
        recommendedPositions: preferredInfield,
        priority: 'critical'
      });
      
      recommendations.recommendations.push({
        area: 'outfield',
        suggestedInnings: inningsSplit.outfield,
        reason: 'Limited outfield time for difficult opponent',
        recommendedPositions: preferredOutfield.length > 0 
          ? preferredOutfield
          : outfieldPositions.filter(pos => !avoidPositions.includes(pos)),
        priority: 'low'
      });
    } else {
      recommendations.recommendations.push({
        area: 'outfield',
        suggestedInnings: inningsSplit.outfield,
        reason: 'Prioritizing player strengths for difficult opponent',
        recommendedPositions: preferredOutfield,
        priority: 'critical'
      });
      
      recommendations.recommendations.push({
        area: 'infield',
        suggestedInnings: inningsSplit.infield,
        reason: 'Limited infield time for difficult opponent',
        recommendedPositions: preferredInfield.length > 0 
          ? preferredInfield
          : infieldPositions.filter(pos => !avoidPositions.includes(pos)),
        priority: 'low'
      });
    }
  }
  
  return recommendations;
}