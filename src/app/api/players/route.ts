// src/app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/players - Get all players for a team
export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get('teamId');
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    const players = await prisma.player.findMany({
      where: {
        teamId,
      },
      include: {
        positionPreferences: true,
      },
    });
    
    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      teamId, 
      name, 
      jerseyNumber, 
      skillLevel, 
      active, 
      positionPreferences 
    } = body;
    
    if (!teamId || !name) {
      return NextResponse.json({ error: 'Team ID and name are required' }, { status: 400 });
    }
    
    // Create the player
    const player = await prisma.player.create({
      data: {
        teamId,
        name,
        jerseyNumber,
        skillLevel: skillLevel || 3,
        active: active !== false,
      },
    });
    
    // Add position preferences if provided
    if (positionPreferences && positionPreferences.length > 0) {
      await Promise.all(
        positionPreferences.map((pref: any) =>
          prisma.playerPositionPreference.create({
            data: {
              playerId: player.id,
              position: pref.position,
              preferenceLevel: pref.preferenceLevel || 3,
              allowed: pref.allowed !== false,
            },
          })
        )
      );
    }
    
    // Return the player with position preferences
    const playerWithPreferences = await prisma.player.findUnique({
      where: {
        id: player.id,
      },
      include: {
        positionPreferences: true,
      },
    });
    
    return NextResponse.json(playerWithPreferences);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}