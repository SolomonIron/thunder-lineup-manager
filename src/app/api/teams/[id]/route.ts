// src/app/api/teams/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/teams/[id] - Get a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        players: {
          orderBy: {
            name: 'asc',
          },
        },
        games: {
          orderBy: {
            gameDate: 'asc',
          },
        },
      },
    });
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

// PUT /api/teams/[id] - Update a team
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    const body = await request.json();
    
    const { name, season, coachPitch } = body;
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name,
        season,
        coachPitch,
      },
    });
    
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    
    // Delete the team (cascading deletes will handle related records)
    await prisma.team.delete({
      where: {
        id: teamId,
      },
    });
    
    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}