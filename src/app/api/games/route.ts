// src/app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/games - Get all games for a team
export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get('teamId');
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    const games = await prisma.game.findMany({
      where: {
        teamId,
      },
      orderBy: {
        gameDate: 'asc',
      },
      include: {
        _count: {
          select: {
            battingLineups: true,
            fieldingLineups: true,
          },
        },
      },
    });
    
    // Transform to add a hasLineup property
    const formattedGames = games.map(game => ({
      ...game,
      hasLineup: game._count.battingLineups > 0,
      _count: undefined,
    }));
    
    return NextResponse.json(formattedGames);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      teamId, 
      opponentName, 
      gameDate, 
      time,
      location, 
      opponentDifficulty, 
      outfielderCount, 
      playerCount, 
      notes 
    } = body;
    
    if (!teamId || !opponentName || !gameDate) {
      return NextResponse.json({ 
        error: 'Team ID, opponent name, and game date are required' 
      }, { status: 400 });
    }
    
    // Parse the date and time
    let parsedDate = new Date(gameDate);
    
    // Add time if provided
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      parsedDate.setHours(hours, minutes);
    }
    
    const game = await prisma.game.create({
      data: {
        teamId,
        opponentName,
        gameDate: parsedDate,
        location,
        opponentDifficulty: opponentDifficulty || 3,
        outfielderCount: outfielderCount || 4,
        playerCount: playerCount || 10,
        notes,
      },
    });
    
    return NextResponse.json(game);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}