// src/app/api/lineups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/lineups - Get all lineups for a team
export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get('teamId');
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    // Find all games for this team that have lineups
    const gamesWithLineups = await prisma.game.findMany({
      where: {
        teamId,
      },
      include: {
        _count: {
          select: {
            battingLineups: true,
          },
        },
      },
    });
    
    // Filter to games that have lineups
    const lineups = gamesWithLineups
      .filter(game => game._count.battingLineups > 0)
      .map(game => ({
        gameId: game.id,
        opponent: game.opponentName,
        date: game.gameDate,
        location: game.location,
      }));
    
    return NextResponse.json(lineups);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch lineups' }, { status: 500 });
  }
}

// POST /api/lineups - Create or update lineup for a game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      gameId, 
      battingOrder, 
      fieldingAssignments 
    } = body;
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Delete existing lineups if any
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
      
      // Create batting order
      if (battingOrder && battingOrder.length > 0) {
        await Promise.all(
          battingOrder.map((player: any, index: number) =>
            prisma.lineupBatting.create({
              data: {
                gameId,
                playerId: player.id,
                battingOrder: index + 1,
              },
            })
          )
        );
      }
      
      // Create fielding assignments
      if (fieldingAssignments && fieldingAssignments.length > 0) {
        const fielding = [];
        
        for (let inning = 0; inning < fieldingAssignments.length; inning++) {
          const inningAssignments = fieldingAssignments[inning];
          
          for (const assignment of inningAssignments) {
            fielding.push(
              prisma.lineupFielding.create({
                data: {
                  gameId,
                  playerId: assignment.playerId,
                  inning: inning + 1,
                  position: assignment.position,
                },
              })
            );
          }
        }
        
        await Promise.all(fielding);
      }
      
      // Return the game with updated lineups
      return prisma.game.findUnique({
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
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create lineup' }, { status: 500 });
  }
}