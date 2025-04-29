import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Define types for better type checking
interface PositionPreference {
  position: string;
  preferenceLevel: number;
  allowed: boolean;
}

interface PlayerInfo {
  name: string;
  jerseyNumber: string;
  skillLevel: number;
  positionPreferences?: PositionPreference[];
}

async function createPlayer(teamId: string, playerInfo: PlayerInfo) {
  try {
    // Create the player
    const player = await prisma.player.create({
      data: {
        teamId,
        name: playerInfo.name,
        jerseyNumber: playerInfo.jerseyNumber,
        skillLevel: playerInfo.skillLevel
      }
    });

    // Create position preferences
    const allPositions = [
      'pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop',
      'left_field', 'center_field', 'right_field', 'left_center_field', 'right_center_field'
    ];

    // First, add explicit preferences
    if (playerInfo.positionPreferences) {
      for (const preference of playerInfo.positionPreferences) {
        await prisma.playerPositionPreference.create({
          data: {
            playerId: player.id,
            position: preference.position,
            preferenceLevel: preference.preferenceLevel,
            allowed: preference.allowed,
          }
        });
      }
    }

    // Then, add neutral preferences for remaining positions
    const specifiedPositions = playerInfo.positionPreferences 
      ? playerInfo.positionPreferences.map((p: PositionPreference) => p.position) 
      : [];
    const unspecifiedPositions = allPositions.filter(p => !specifiedPositions.includes(p));
    
    for (const position of unspecifiedPositions) {
      await prisma.playerPositionPreference.create({
        data: {
          playerId: player.id,
          position,
          preferenceLevel: 3, // Neutral default
          allowed: true,
        }
      });
    }

    console.log(`Created player: ${player.name} #${player.jerseyNumber}`);
    return player;
  } catch (error) {
    console.error(`Error creating player ${playerInfo.name}:`, error);
    throw error;
  }
}

async function importScheduleFromCsv(csvContent: string, teamId: string) {
  return new Promise<any[]>((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const games = results.data.map((row: any) => {
          // Convert the date format
          const dateParts = row['Date']?.split('/') || [];
          let formattedDate = '';
          if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
          }

          // Determine game type
          const isHome = !row['Game / Event Name'].toLowerCase().startsWith('at ');
          const isTournament = 
            row['Game / Event Name'].toLowerCase().includes('tournament') ||
            row['Game / Event Name'].toLowerCase().includes('scrimmage') ||
            row['Game / Event Name'].toLowerCase().includes('tentative');

          // Clean opponent name
          let opponentName = row['Game / Event Name']
            .replace(/^vs\.\s*/i, '')
            .replace(/^at\s*/i, '')
            .replace(/Tournament\s*/i, '')
            .replace(/Scrimmage\s*/i, '')
            .replace(/\*Tentative\*/i, '')
            .trim();

          // Handle special cases
          if (opponentName.toLowerCase().includes('tbd') || !opponentName) {
            opponentName = 'TBD';
          }

          return {
            teamId,
            opponentName,
            gameDate: formattedDate ? new Date(formattedDate) : null,
            location: row['Location'] || '',
            isHome,
            isTournament,
            opponentDifficulty: isTournament ? 4 : 3,
            outfielderCount: 4,
            playerCount: 11,
            notes: row['Game / Event Name'] || '',
          };
        });

        resolve(games);
      },
      error: (error: Error) => {
        console.error('CSV Parsing Error:', error);
        reject(error);
      }
    });
  });
}

// Full player data with type annotations
const playerData: PlayerInfo[] = [
  {
    name: 'R Gardner',
    jerseyNumber: '10',
    skillLevel: 4,
    positionPreferences: [
      { position: 'second_base', preferenceLevel: 5, allowed: true },
      { position: 'shortstop', preferenceLevel: 4, allowed: true },
      { position: 'pitcher', preferenceLevel: 3, allowed: true },
      { position: 'right_center_field', preferenceLevel: 4, allowed: true },
      { position: 'left_center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'F Couch',
    jerseyNumber: '0',
    skillLevel: 4,
    positionPreferences: [
      { position: 'shortstop', preferenceLevel: 5, allowed: true },
      { position: 'second_base', preferenceLevel: 4, allowed: true },
      { position: 'center_field', preferenceLevel: 4, allowed: true },
      { position: 'left_center_field', preferenceLevel: 4, allowed: true },
      { position: 'right_center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'O Ardo',
    jerseyNumber: '11',
    skillLevel: 5,
    positionPreferences: [
      { position: 'third_base', preferenceLevel: 5, allowed: true },
      { position: 'shortstop', preferenceLevel: 3, allowed: true },
      { position: 'pitcher', preferenceLevel: 4, allowed: true },
      { position: 'center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'B Bittner',
    jerseyNumber: '15',
    skillLevel: 5,
    positionPreferences: [
      { position: 'first_base', preferenceLevel: 5, allowed: true },
      { position: 'pitcher', preferenceLevel: 4, allowed: true },
      { position: 'left_field', preferenceLevel: 3, allowed: true },
      { position: 'right_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'K Barcomb',
    jerseyNumber: '27',
    skillLevel: 4,
    positionPreferences: [
      { position: 'center_field', preferenceLevel: 5, allowed: true },
      { position: 'shortstop', preferenceLevel: 4, allowed: true },
      { position: 'second_base', preferenceLevel: 3, allowed: true },
      { position: 'left_center_field', preferenceLevel: 4, allowed: true },
      { position: 'right_center_field', preferenceLevel: 4, allowed: true },
    ]
  },
  {
    name: 'T Reighard',
    jerseyNumber: '23',
    skillLevel: 4,
    positionPreferences: [
      { position: 'left_field', preferenceLevel: 5, allowed: true },
      { position: 'third_base', preferenceLevel: 4, allowed: true },
      { position: 'left_center_field', preferenceLevel: 4, allowed: true },
    ]
  },
  {
    name: 'S Cartellone',
    jerseyNumber: '2',
    skillLevel: 3,
    positionPreferences: [
      { position: 'right_field', preferenceLevel: 4, allowed: true },
      { position: 'catcher', preferenceLevel: 5, allowed: true },
      { position: 'right_center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'G Krysh',
    jerseyNumber: '7',
    skillLevel: 3,
    positionPreferences: [
      { position: 'pitcher', preferenceLevel: 4, allowed: true },
      { position: 'shortstop', preferenceLevel: 3, allowed: true },
      { position: 'left_field', preferenceLevel: 3, allowed: true },
      { position: 'center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'K Coy',
    jerseyNumber: '45',
    skillLevel: 3,
    positionPreferences: [
      { position: 'pitcher', preferenceLevel: 5, allowed: true },
      { position: 'right_field', preferenceLevel: 4, allowed: true },
      { position: 'right_center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'S Weldon',
    jerseyNumber: '42',
    skillLevel: 3,
    positionPreferences: [
      { position: 'center_field', preferenceLevel: 4, allowed: true },
      { position: 'left_field', preferenceLevel: 3, allowed: true },
      { position: 'left_center_field', preferenceLevel: 4, allowed: true },
      { position: 'right_center_field', preferenceLevel: 3, allowed: true },
    ]
  },
  {
    name: 'D Horner',
    jerseyNumber: '1',
    skillLevel: 3,
    positionPreferences: [
      { position: 'catcher', preferenceLevel: 4, allowed: true },
      { position: 'right_field', preferenceLevel: 5, allowed: true },
      { position: 'first_base', preferenceLevel: 3, allowed: true },
    ]
  }
];

async function main() {
  try {
    console.log('Starting comprehensive database seed...');

    // Create the 2025 Ohio Thunder team
    const team = await prisma.team.create({
      data: {
        name: '2025 Ohio Thunder',
        season: '2025',
        coachPitch: true,
      },
    });

    console.log(`Created team: ${team.name}`);

    // Create all players using Promise.all for concurrent creation
    console.log('Creating players...');
    const createdPlayers = await Promise.all(
      playerData.map(player => createPlayer(team.id, player))
    );

    // Import schedule from CSV
    console.log('Importing schedule...');
    try {
      const csvPath = path.join(process.cwd(), '2025 Thunder 8U Ardo schedule export.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        
        const importedGames = await importScheduleFromCsv(csvContent, team.id);

        console.log(`Attempting to create ${importedGames.length} games...`);
        for (const gameData of importedGames) {
          try {
            const game = await prisma.game.create({ data: gameData });
            console.log(`Created game: ${game.isHome ? 'vs' : 'at'} ${game.opponentName} on ${game.gameDate?.toLocaleDateString()}`);
          } catch (gameCreateError) {
            console.error(`Error creating game: ${gameData.opponentName}`, gameCreateError);
          }
        }
      } else {
        console.log('CSV schedule file not found. Skipping schedule import.');
      }
    } catch (csvImportError) {
      console.error('Error importing schedule:', csvImportError);
    }

    console.log('Seeding completed successfully!');
    console.log(`Created ${createdPlayers.length} players`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });