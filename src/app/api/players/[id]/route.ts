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
    
    // Update the player basic info
    const updatedPlayer = await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        name,
        jerseyNumber,
        skillLevel,
        active,
      },
    });
    
    // Update position preferences if provided
    if (positionPreferences) {
      // Delete existing preferences
      await prisma.playerPositionPreference.deleteMany({
        where: {
          playerId,
        },
      });
      
      // Add new preferences
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
    
    // Return the updated player with position preferences
    const playerWithPreferences = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        positionPreferences: true,
      },
    });
    
    return NextResponse.json(playerWithPreferences);
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
    
    // Delete position preferences first (handling the cascade manually)
    await prisma.playerPositionPreference.deleteMany({
      where: {
        playerId,
      },
    });
    
    // Delete the player
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