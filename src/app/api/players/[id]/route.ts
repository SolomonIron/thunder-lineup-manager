// src/app/api/players/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/players/[id] - Get a specific player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    
    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
      },
    });
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json(player);
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
    
    // Update player basic info
    const updatedPlayer = await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        name,
        jerseyNumber,
        skillLevel,
        active: active ?? true,
      },
    });
    
    // Delete existing position preferences
    await prisma.playerPositionPreference.deleteMany({
      where: {
        playerId,
      },
    });
    
    // Create new position preferences
    if (positionPreferences && positionPreferences.length > 0) {
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
    
    // Fetch updated player with preferences
    const updatedPlayerWithPreferences = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
      },
    });
    
    return NextResponse.json(updatedPlayerWithPreferences);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

interface PlayerPositionTracking {
  // Current season statistics
  seasonStats: {
    totalInnings: number;
    infieldInnings: number;
    outfieldInnings: number;
    positionInnings: {
      [position: string]: number;  // Track innings at each specific position
    };
    // Calculated fields (updated after each game)
    currentInfieldPercentage: number;  // e.g., 72%
    currentOutfieldPercentage: number; // e.g., 28%
    balanceTarget: {
      needsMoreInfield: boolean;
      needsMoreOutfield: boolean;
      percentageFromTarget: number;  // How far from 50/50 they are
    };
  };

  // Position capabilities/preferences
  positions: {
    infield: {
      primary: Position;
      secondary: Position;
      tertiary: Position;
      preferredPositions: Position[];    // Positions they play well
      developmentPositions: Position[];  // Positions we're working on
      avoidPositions: Position[];        // Positions they shouldn't play
    };
    outfield: {
      primary: Position;
      secondary: Position;
      preferredPositions: Position[];
      developmentPositions: Position[];
      avoidPositions: Position[];
    };
  };
}

// Logic for generating lineup recommendations
interface LineupRecommendation {
  gameType: 'Strong' | 'Average' | 'Weak';
  recommendations: {
    playerId: string;
    recommendedPositions: {
      position: Position;
      reason: string;
      priority: number;  // Higher number = stronger recommendation
    }[];
    balancingGoal: {
      targetArea: 'infield' | 'outfield';
      currentPercentage: number;
      recommendedInnings: number;
      explanation: string;
    };
  }[];
}

function generateLineupRecommendations(
  players: PlayerPositionTracking[],
  gameType: 'Strong' | 'Average' | 'Weak',
  totalInnings: number
): LineupRecommendation {
  const recommendations: LineupRecommendation = {
    gameType,
    recommendations: []
  };

  players.forEach(player => {
    const balancingNeeded = Math.abs(50 - player.seasonStats.currentInfieldPercentage);
    const needsMoreInfield = player.seasonStats.currentInfieldPercentage < 50;
    
    // For weak opponents, prioritize balancing
    if (gameType === 'Weak' && balancingNeeded > 10) { // More than 10% off from 50/50
      const recommendedPositions = needsMoreInfield 
        ? player.positions.infield.preferredPositions
        : player.positions.outfield.preferredPositions;

      recommendations.recommendations.push({
        playerId: player.id,
        recommendedPositions: recommendedPositions.map(pos => ({
          position: pos,
          reason: `Helping achieve 50/50 balance. Currently ${needsMoreInfield ? 'under' : 'over'} on infield time (${player.seasonStats.currentInfieldPercentage}%)`,
          priority: balancingNeeded // Higher priority for players further from 50/50
        })),
        balancingGoal: {
          targetArea: needsMoreInfield ? 'infield' : 'outfield',
          currentPercentage: needsMoreInfield ? 
            player.seasonStats.currentInfieldPercentage : 
            player.seasonStats.currentOutfieldPercentage,
          recommendedInnings: Math.ceil(totalInnings * 0.67), // Suggest playing 67% of innings in needed area
          explanation: `Player should focus on ${needsMoreInfield ? 'infield' : 'outfield'} to move closer to 50/50 balance`
        }
      });
    }
    
    // For strong opponents, prioritize preferred positions
    else if (gameType === 'Strong') {
      const strongPositions = [
        ...player.positions.infield.preferredPositions,
        ...player.positions.outfield.preferredPositions
      ].filter(pos => !player.positions.infield.developmentPositions.includes(pos) &&
                     !player.positions.outfield.developmentPositions.includes(pos));

      recommendations.recommendations.push({
        playerId: player.id,
        recommendedPositions: strongPositions.map(pos => ({
          position: pos,
          reason: 'Strong opponent - using preferred positions',
          priority: 100 // High priority for strong opponent games
        })),
        balancingGoal: {
          targetArea: needsMoreInfield ? 'infield' : 'outfield',
          currentPercentage: player.seasonStats.currentInfieldPercentage,
          recommendedInnings: Math.ceil(totalInnings * 0.5), // Still try for balance but prioritize strength
          explanation: 'Focus on strongest positions while maintaining reasonable balance'
        }
      });
    }
  });

  return recommendations;
}