// src/app/api/positions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/positions?teamId=[teamId] - Get position preferences for a team
export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get('teamId');
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    // Get all active players for the team with their position preferences
    const players = await prisma.player.findMany({
      where: {
        teamId,
        active: true,
      },
      include: {
        positionPreferences: true,
        // Include lineup history to calculate balance stats
        fieldingLineups: {
          include: {
            game: true,
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Calculate infield/outfield balance for each player
    const playersWithStats = players.map(player => {
      // Count infield and outfield innings
      let infieldInnings = 0;
      let outfieldInnings = 0;
      let totalInnings = 0;
      
      // Process each inning they've played
      player.fieldingLineups.forEach(lineup => {
        const position = lineup.position;
        
        // Skip bench positions (not counted in balance)
        if (position === 'bench') return;
        
        totalInnings++;
        
        // Check if infield or outfield position
        if (['pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop'].includes(position)) {
          infieldInnings++;
        } else if (position.includes('field')) {
          outfieldInnings++;
        }
      });
      
      // Calculate percentages (default to 50/50 if no games played)
      const infieldPercentage = totalInnings > 0 ? Math.round((infieldInnings / totalInnings) * 100) : 50;
      const outfieldPercentage = totalInnings > 0 ? Math.round((outfieldInnings / totalInnings) * 100) : 50;
      
      // Process position preferences into a more usable format
      const infieldPreferences: Record<string, number> = {};
      const outfieldPreferences: Record<string, number> = {};
      const startingPositions: Record<string, string> = {
        strong: '',
        average: '',
        weak: ''
      };
      
      // Initialize with default values
      ['pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop'].forEach(pos => {
        infieldPreferences[pos] = 0;
      });
      
      ['left_field', 'left_center_field', 'center_field', 'right_center_field', 'right_field'].forEach(pos => {
        outfieldPreferences[pos] = 0;
      });
      
      // Fill in actual preferences
      player.positionPreferences.forEach(pref => {
        if (['pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop'].includes(pref.position)) {
          infieldPreferences[pref.position] = pref.preferenceLevel;
          
          // If this is primary position (level 5), set as default strong opponent position
          if (pref.preferenceLevel === 5 && !startingPositions.strong) {
            startingPositions.strong = pref.position;
          }
          
          // If this is a secondary position (level 4), set as default average opponent position
          if (pref.preferenceLevel === 4 && !startingPositions.average) {
            startingPositions.average = pref.position;
          }
        } else if (pref.position.includes('field')) {
          outfieldPreferences[pref.position] = pref.preferenceLevel;
          
          // If no infield position is primary, use best outfield position for strong
          if (pref.preferenceLevel === 5 && !startingPositions.strong) {
            startingPositions.strong = pref.position;
          }
          
          // For weak opponents, default to their best outfield position
          if (pref.preferenceLevel >= 4 && !startingPositions.weak) {
            startingPositions.weak = pref.position;
          }
        }
      });
      
      // Ensure starting positions are set (even if defaults)
      if (!startingPositions.strong) {
        // Find highest value in either infield or outfield
        const allPrefs = { ...infieldPreferences, ...outfieldPreferences };
        const highestPref = Object.entries(allPrefs).reduce(
          (highest, [pos, level]) => level > highest.level ? { pos, level } : highest,
          { pos: '', level: 0 }
        );
        startingPositions.strong = highestPref.pos;
      }
      
      if (!startingPositions.average) {
        startingPositions.average = startingPositions.strong;
      }
      
      if (!startingPositions.weak) {
        // Default to an outfield position for weak opponents
        const highestOutfieldPref = Object.entries(outfieldPreferences).reduce(
          (highest, [pos, level]) => level > highest.level ? { pos, level } : highest,
          { pos: 'center_field', level: 0 }
        );
        startingPositions.weak = highestOutfieldPref.pos;
      }
      
      // Transform to camelCase for React
      const camelCaseInfieldPrefs = {
        pitcher: infieldPreferences.pitcher,
        catcher: infieldPreferences.catcher,
        firstBase: infieldPreferences.first_base,
        secondBase: infieldPreferences.second_base,
        thirdBase: infieldPreferences.third_base,
        shortstop: infieldPreferences.shortstop,
      };
      
      const camelCaseOutfieldPrefs = {
        leftField: outfieldPreferences.left_field,
        leftCenterField: outfieldPreferences.left_center_field,
        centerField: outfieldPreferences.center_field,
        rightCenterField: outfieldPreferences.right_center_field,
        rightField: outfieldPreferences.right_field,
      };
      
      // Convert position names to camelCase
      const camelCaseStartingPositions = {
        strong: startingPositions.strong.replace(/_(.)/g, (_, c) => c.toUpperCase()),
        average: startingPositions.average.replace(/_(.)/g, (_, c) => c.toUpperCase()),
        weak: startingPositions.weak.replace(/_(.)/g, (_, c) => c.toUpperCase()),
      };
      
      return {
        id: player.id,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        skillLevel: player.skillLevel,
        infieldPreferences: camelCaseInfieldPrefs,
        outfieldPreferences: camelCaseOutfieldPrefs,
        startingPositions: camelCaseStartingPositions,
        balance: {
          infield: infieldPercentage,
          outfield: outfieldPercentage,
        }
      };
    });
    
    return NextResponse.json(playersWithStats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch position preferences' }, { status: 500 });
  }
}

// PUT /api/positions/[playerId] - Update player's position preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const playerId = body.playerId;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    
    const { 
      infieldPreferences, 
      outfieldPreferences, 
      startingPositions 
    } = body;
    
    // Delete existing preferences
    await prisma.playerPositionPreference.deleteMany({
      where: {
        playerId,
      },
    });
    
    // Create new infield preferences
    const infielPositionsMap = {
      pitcher: 'pitcher',
      catcher: 'catcher',
      firstBase: 'first_base',
      secondBase: 'second_base',
      thirdBase: 'third_base',
      shortstop: 'shortstop',
    };
    
    for (const [key, value] of Object.entries(infieldPreferences)) {
      const position = infielPositionsMap[key];
      const preferenceLevel = value as number;
      
      if (position) {
        await prisma.playerPositionPreference.create({
          data: {
            playerId,
            position,
            preferenceLevel,
            allowed: preferenceLevel >= 3, // Only allowed if preference is 3+
          },
        });
      }
    }
    
    // Create new outfield preferences
    const outfieldPositionsMap = {
      leftField: 'left_field',
      leftCenterField: 'left_center_field',
      centerField: 'center_field',
      rightCenterField: 'right_center_field',
      rightField: 'right_field',
    };
    
    for (const [key, value] of Object.entries(outfieldPreferences)) {
      const position = outfieldPositionsMap[key];
      const preferenceLevel = value as number;
      
      if (position) {
        await prisma.playerPositionPreference.create({
          data: {
            playerId,
            position,
            preferenceLevel,
            allowed: preferenceLevel >= 3, // Only allowed if preference is 3+
          },
        });
      }
    }
    
    // Store starting positions as custom player metadata
    // (This would require a new table in a real app, but we'll simplify for now)
    // In a real implementation, you would add a PlayerMetadata table or similar
    
    // Return updated player
    const updatedPlayer = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
      },
    });
    
    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update position preferences' }, { status: 500 });
  }
}