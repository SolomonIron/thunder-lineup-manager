// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define settings file path
const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Default settings
const defaultSettings = {
  lineupRules: {
    minInningsInfield: 2,
    maxInningsInfield: 4,
    rotateOutfield: true,
    balancePositions: true,
    respectPreferences: true,
    benchRotation: true,
  },
  positions: [
    { id: 'pitcher', name: 'Pitcher', abbreviation: 'P', enabled: true },
    { id: 'catcher', name: 'Catcher', abbreviation: 'C', enabled: true },
    { id: 'first_base', name: '1st Base', abbreviation: '1B', enabled: true },
    { id: 'second_base', name: '2nd Base', abbreviation: '2B', enabled: true },
    { id: 'third_base', name: '3rd Base', abbreviation: '3B', enabled: true },
    { id: 'shortstop', name: 'Shortstop', abbreviation: 'SS', enabled: true },
    { id: 'left_field', name: 'Left Field', abbreviation: 'LF', enabled: true },
    { id: 'left_center_field', name: 'Left-Center Field', abbreviation: 'LCF', enabled: true },
    { id: 'right_center_field', name: 'Right-Center Field', abbreviation: 'RCF', enabled: true },
    { id: 'right_field', name: 'Right Field', abbreviation: 'RF', enabled: true },
    { id: 'bench', name: 'Bench', abbreviation: 'Bench', enabled: true },
  ],
  difficultyLevels: [
    { 
      level: 1, 
      name: 'Easy/Weak', 
      rules: {
        description: 'Weaker players get more time in preferred positions',
        rotateHighSkill: true,
        prioritizeLowSkill: true,
      }
    },
    { 
      level: 3, 
      name: 'Fair/Average', 
      rules: {
        description: 'Balance skill distribution across positions',
        rotateHighSkill: true,
        prioritizeLowSkill: false,
      }
    },
    { 
      level: 5, 
      name: 'Good/Strong', 
      rules: {
        description: 'Stronger players in key positions',
        rotateHighSkill: false,
        prioritizeLowSkill: false,
      }
    },
  ],
};

// GET /api/settings - Get application settings
export async function GET() {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(settingsFilePath)) {
      // If settings file doesn't exist, create it with default settings
      fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
      return NextResponse.json(defaultSettings);
    }
    
    const settingsData = fs.readFileSync(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings - Update application settings
export async function PUT(request: NextRequest) {
  try {
    ensureDataDirectory();
    
    const body = await request.json();
    
    // Save the updated settings
    fs.writeFileSync(settingsFilePath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}