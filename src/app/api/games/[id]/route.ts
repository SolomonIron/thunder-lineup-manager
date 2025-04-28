// src/app/api/games/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/games/[id] - Get a specific game
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
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
            { position: 'asc' },
          ],
        },
      },
    });
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

// PUT /api/games/[id] - Update a game
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    
    const { 
      opponentName, 
      gameDate, 
      time,
      location, 
      opponentDifficulty, 
      outfielderCount, 
      playerCount, 
      notes 
    } = body;
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    // Parse the date and time
    let parsedDate;
    if (gameDate) {
      parsedDate = new Date(gameDate);
      
      // Add time if provided
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        parsedDate.setHours(hours, minutes);
      }
    }
    
    const updatedGame = await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        opponentName,
        gameDate: parsedDate,
        location,
        opponentDifficulty,
        outfielderCount,
        playerCount,
        notes,
      },
    });
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

// DELETE /api/games/[id] - Delete a game
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    // Delete related records first
    await prisma.lineupBatting.deleteMany({
      where: {
        gameId,
      },
    });
    
    await prisma.lineupFielding.deleteMany({
      where: {
        gameId,
      },
    });
    
    // Delete the game
    await prisma.game.delete({
      where: {
        id: gameId,
      },
    });
    
    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}