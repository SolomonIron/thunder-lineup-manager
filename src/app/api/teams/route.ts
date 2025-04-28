// src/app/api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/teams - Get all teams
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            players: true,
            games: true,
          },
        },
      },
    });
    
    // Transform the response to include player and game counts directly
    const formattedTeams = teams.map(team => ({
      ...team,
      playerCount: team._count.players,
      gameCount: team._count.games,
      _count: undefined, // Remove the _count property
    }));
    
    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, season, coachPitch } = body;
    
    if (!name || !season) {
      return NextResponse.json({ error: 'Name and season are required' }, { status: 400 });
    }
    
    const team = await prisma.team.create({
      data: {
        name,
        season,
        coachPitch: coachPitch ?? true,
      },
    });
    
    return NextResponse.json(team);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}