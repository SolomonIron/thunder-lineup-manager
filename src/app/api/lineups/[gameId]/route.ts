// src/app/api/lineups/[gameId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/lineups/[gameId] - Get lineup for a specific game
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const gameId = params.gameId;
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    // Get the game with lineups
    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        battingLineups: {
          include: {
            player: true,
          },
          orderBy: {
            battingOrder: 'asc',
          },
        },
        fieldingLineups: {
          include: {
            player: true,
          },
          orderBy: [
            { inning: 'asc' },
            { playerId: 'asc' },
          ],
        },
      },
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Format the response to be more usable by the frontend
    const battingOrder = game.battingLineups.map(lineup => ({
      ...lineup.player,
      battingOrder: lineup.battingOrder,
    }));
    
    // Group fielding assignments by inning
    const fieldingAssignments = [];
    
    // Get the number of innings from the fielding assignments
    const innings = [...new Set(game.fieldingLineups.map(lineup => lineup.inning))].sort();
    
    for (const inning of innings) {
      const inningAssignments = game.fieldingLineups
        .filter(lineup => lineup.inning === inning)
        .map(lineup => ({
          playerId: lineup.playerId,
          playerName: lineup.player.name,
          jerseyNumber: lineup.player.jerseyNumber,
          position: lineup.position,
        }));
      
      fieldingAssignments.push(inningAssignments);
    }
    
    return NextResponse.json({
      game,
      battingOrder,
      fieldingAssignments,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch lineup' }, { status: 500 });
  }
}