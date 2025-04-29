import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');

    // Create the 2025 Ohio Thunder team
    const team = await prisma.team.create({
      data: {
        name: '2025 Ohio Thunder',
        season: '2025',
        coachPitch: true,
      },
    });

    console.log(`Created team: ${team.name}`);

    // Create the players with position preferences
    // Data derived from the game PDFs and position documents
    const players = [
      {
        name: 'R Gardner',
        jerseyNumber: '10',
        skillLevel: 4,
        teamId: team.id,
        // Position preferences derived from PDFs and 2025 Positions document
        positionPreferences: [
          { position: 'second_base', preferenceLevel: 5, allowed: true }, // Primary IF
          { position: 'shortstop', preferenceLevel: 4, allowed: true },   // Secondary IF
          { position: 'pitcher', preferenceLevel: 3, allowed: true },
          { position: 'right_center_field', preferenceLevel: 4, allowed: true }, // Primary OF
          { position: 'left_center_field', preferenceLevel: 3, allowed: true },  // Secondary OF
        ]
      },
      {
        name: 'F Couch',
        jerseyNumber: '0',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'shortstop', preferenceLevel: 5, allowed: true },   // Primary IF
          { position: 'second_base', preferenceLevel: 4, allowed: true }, // Secondary IF
          { position: 'center_field', preferenceLevel: 4, allowed: true },
          { position: 'left_center_field', preferenceLevel: 4, allowed: true }, // Primary OF
          { position: 'right_center_field', preferenceLevel: 3, allowed: true }, // Secondary OF
        ]
      },
      {
        name: 'O Ardo',
        jerseyNumber: '11',
        skillLevel: 5,
        teamId: team.id,
        positionPreferences: [
          { position: 'third_base', preferenceLevel: 5, allowed: true }, // Primary IF
          { position: 'shortstop', preferenceLevel: 3, allowed: true },  // Secondary IF
          { position: 'pitcher', preferenceLevel: 4, allowed: true },
          { position: 'center_field', preferenceLevel: 3, allowed: true }, // Secondary OF
        ]
      },
      {
        name: 'B Bittner',
        jerseyNumber: '15',
        skillLevel: 5,
        teamId: team.id,
        positionPreferences: [
          { position: 'first_base', preferenceLevel: 5, allowed: true }, // Primary IF
          { position: 'pitcher', preferenceLevel: 4, allowed: true },    // Secondary IF
          { position: 'left_field', preferenceLevel: 3, allowed: true },
          { position: 'right_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'K Barcomb',
        jerseyNumber: '27',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'center_field', preferenceLevel: 5, allowed: true }, // Primary OF
          { position: 'shortstop', preferenceLevel: 4, allowed: true },    // Primary IF
          { position: 'second_base', preferenceLevel: 3, allowed: true },  // Secondary IF
          { position: 'left_center_field', preferenceLevel: 4, allowed: true },
          { position: 'right_center_field', preferenceLevel: 4, allowed: true },
        ]
      },
      {
        name: 'T Reighard',
        jerseyNumber: '23',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'left_field', preferenceLevel: 5, allowed: true },  // Primary OF
          { position: 'third_base', preferenceLevel: 4, allowed: true },  // Primary IF
          { position: 'left_center_field', preferenceLevel: 4, allowed: true },
        ]
      },
      {
        name: 'S Cartellone',
        jerseyNumber: '2',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'right_field', preferenceLevel: 4, allowed: true },  // Primary OF
          { position: 'catcher', preferenceLevel: 5, allowed: true },      // Primary IF
          { position: 'right_center_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'G Krysh',
        jerseyNumber: '7',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'pitcher', preferenceLevel: 4, allowed: true },    // Primary IF
          { position: 'shortstop', preferenceLevel: 3, allowed: true },  // Secondary IF
          { position: 'left_field', preferenceLevel: 3, allowed: true },
          { position: 'center_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'K Coy',
        jerseyNumber: '45',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'pitcher', preferenceLevel: 5, allowed: true },    // Primary IF
          { position: 'right_field', preferenceLevel: 4, allowed: true }, // Primary OF
          { position: 'right_center_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'S Weldon',
        jerseyNumber: '42',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'center_field', preferenceLevel: 4, allowed: true },    // Primary OF
          { position: 'left_field', preferenceLevel: 3, allowed: true },      // Secondary OF
          { position: 'left_center_field', preferenceLevel: 4, allowed: true },
          { position: 'right_center_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'D Horner',
        jerseyNumber: '1',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'catcher', preferenceLevel: 4, allowed: true },     // Primary IF
          { position: 'right_field', preferenceLevel: 5, allowed: true }, // Primary OF
          { position: 'first_base', preferenceLevel: 3, allowed: true },  // Secondary IF
        ]
      },
    ];

    // Create each player and their position preferences
    for (const playerData of players) {
      const { positionPreferences, ...playerInfo } = playerData;
      
      const player = await prisma.player.create({
        data: playerInfo
      });
      
      console.log(`Created player: ${player.name} #${player.jerseyNumber}`);
      
      // Create position preferences for each player
      if (positionPreferences) {
        for (const preference of positionPreferences) {
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

      // Add default neutral preferences for positions not explicitly set
      const positions = [
        'pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop',
        'left_field', 'center_field', 'right_field', 'left_center_field', 'right_center_field'
      ];
      
      const specifiedPositions = positionPreferences?.map(p => p.position) || [];
      const unspecifiedPositions = positions.filter(p => !specifiedPositions.includes(p));
      
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
    }

    // Create games from PDF metadata
    // The games with detailed PDFs
    const completedGames = [
      {
        teamId: team.id,
        opponentName: '8U Nationals Red',
        gameDate: new Date('2025-04-23T17:30:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 12-5',
        result: 'W 12-5'
      },
      {
        teamId: team.id,
        opponentName: 'Ashville Avengers 8U',
        gameDate: new Date('2025-04-26T10:00:00'),
        location: 'Home Field',
        opponentDifficulty: 4,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 9-8',
        result: 'W 9-8'
      },
      {
        teamId: team.id,
        opponentName: 'Ashville Avengers 8U',
        gameDate: new Date('2025-04-27T13:00:00'),
        location: 'Home Field',
        opponentDifficulty: 4,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 12-7',
        result: 'W 12-7'
      },
      {
        teamId: team.id,
        opponentName: 'Big Walnut 8U Freedom',
        gameDate: new Date('2025-04-19T15:30:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 12-7',
        result: 'W 12-7'
      },
      {
        teamId: team.id,
        opponentName: 'Big Walnut 8U Freedom',
        gameDate: new Date('2025-04-27T16:00:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 22-7',
        result: 'W 22-7'
      },
      {
        teamId: team.id,
        opponentName: 'New Albany 8U',
        gameDate: new Date('2025-04-19T11:00:00'),
        location: 'Home Field',
        opponentDifficulty: 2,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 19-5',
        result: 'W 19-5'
      },
      {
        teamId: team.id,
        opponentName: 'Naturals 8U',
        gameDate: new Date('2025-04-14T18:00:00'),
        location: 'Away Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 17-7',
        result: 'W 17-7'
      },
      {
        teamId: team.id,
        opponentName: 'OV Jokers BC - Hannahs 8U',
        gameDate: new Date('2025-04-26T14:00:00'),
        location: 'Away Field',
        opponentDifficulty: 5,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder lost 12-17',
        result: 'L 12-17'
      },
      {
        teamId: team.id,
        opponentName: 'Ohio Thunder Pulizzi 8U',
        gameDate: new Date('2025-04-01T18:00:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 10,
        notes: 'Ohio Thunder won 23-5',
        result: 'W 23-5'
      },
      {
        teamId: team.id,
        opponentName: 'Olentangy Baseball Club 8U',
        gameDate: new Date('2025-04-12T10:00:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 18-10',
        result: 'W 18-10'
      },
      {
        teamId: team.id,
        opponentName: 'Prospects 8U Blanton',
        gameDate: new Date('2025-04-18T18:00:00'),
        location: 'Home Field',
        opponentDifficulty: 4,
        outfielderCount: 4,
        playerCount: 10,
        notes: 'Ohio Thunder won 13-9',
        result: 'W 13-9'
      }
    ];

    for (const gameData of completedGames) {
      const game = await prisma.game.create({
        data: gameData
      });
      console.log(`Created game: vs ${game.opponentName} on ${game.gameDate.toLocaleDateString()} - ${gameData.result}`);

      // Simple demonstration of a lineup - just for the first game
      if (game.opponentName === '8U Nationals Red') {
        // Find the player IDs for the lineup
        const playerRGardner = await prisma.player.findFirst({ where: { teamId: team.id, name: 'R Gardner' } });
        const playerFCouch = await prisma.player.findFirst({ where: { teamId: team.id, name: 'F Couch' } });
        const playerOArdo = await prisma.player.findFirst({ where: { teamId: team.id, name: 'O Ardo' } });
        const playerBBittner = await prisma.player.findFirst({ where: { teamId: team.id, name: 'B Bittner' } });
        const playerKBarcomb = await prisma.player.findFirst({ where: { teamId: team.id, name: 'K Barcomb' } });
        const playerTReighard = await prisma.player.findFirst({ where: { teamId: team.id, name: 'T Reighard' } });
        const playerKCoy = await prisma.player.findFirst({ where: { teamId: team.id, name: 'K Coy' } });
        const playerGKrysh = await prisma.player.findFirst({ where: { teamId: team.id, name: 'G Krysh' } });
        const playerSCartellone = await prisma.player.findFirst({ where: { teamId: team.id, name: 'S Cartellone' } });
        const playerSWeldon = await prisma.player.findFirst({ where: { teamId: team.id, name: 'S Weldon' } });
        const playerDHorner = await prisma.player.findFirst({ where: { teamId: team.id, name: 'D Horner' } });
        
        // Create batting lineup
        if (playerRGardner && playerFCouch && playerOArdo && playerBBittner && 
            playerKBarcomb && playerTReighard && playerKCoy && playerGKrysh && 
            playerSCartellone && playerSWeldon && playerDHorner) {
          
          // Create batting order
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerRGardner.id, battingOrder: 1 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerFCouch.id, battingOrder: 2 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerOArdo.id, battingOrder: 3 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerBBittner.id, battingOrder: 4 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerKBarcomb.id, battingOrder: 5 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerTReighard.id, battingOrder: 6 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerKCoy.id, battingOrder: 7 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerGKrysh.id, battingOrder: 8 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerSCartellone.id, battingOrder: 9 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerSWeldon.id, battingOrder: 10 } });
          await prisma.lineupBatting.create({ data: { gameId: game.id, playerId: playerDHorner.id, battingOrder: 11 } });
          
          // Create first inning fielding positions
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerRGardner.id, inning: 1, position: 'second_base' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerFCouch.id, inning: 1, position: 'shortstop' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerOArdo.id, inning: 1, position: 'third_base' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerBBittner.id, inning: 1, position: 'first_base' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerKBarcomb.id, inning: 1, position: 'center_field' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerTReighard.id, inning: 1, position: 'left_field' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerKCoy.id, inning: 1, position: 'pitcher' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerGKrysh.id, inning: 1, position: 'left_center_field' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerSCartellone.id, inning: 1, position: 'right_field' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerSWeldon.id, inning: 1, position: 'right_center_field' } });
          await prisma.lineupFielding.create({ data: { gameId: game.id, playerId: playerDHorner.id, inning: 1, position: 'catcher' } });
          
          console.log('Created lineup for Nationals Red game');
        }
      }
    }

    // Try to read and import schedule from CSV
    try {
      const csvPath = path.join(process.cwd(), '2025 Thunder 8U Ardo schedule export.csv');
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        
        // Simple CSV parser without papaparse
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        console.log(`CSV headers found: ${headers.join(', ')}`);
        console.log(`Found ${lines.length - 1} potential games in CSV`);
        
        // Start from line 1 (skipping headers)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          
          const values = line.split(',');
          
          // Make sure we have enough fields
          if (values.length < 3) continue;
          
          // Find the date column
          const dateIndex = headers.findIndex(h => h === 'Date');
          const startTimeIndex = headers.findIndex(h => h === 'Start Time');
          const gameNameIndex = headers.findIndex(h => h === 'Game / Event Name');
          const locationIndex = headers.findIndex(h => h === 'Location');
          const addressIndex = headers.findIndex(h => h === 'Address');
          const arrivalTimeIndex = headers.findIndex(h => h === 'Arrival Time');
          
          if (dateIndex === -1 || gameNameIndex === -1) {
            console.log('CSV format not recognized - missing Date or Game/Event Name columns');
            break;
          }
          
          // Get date value
          const dateStr = values[dateIndex];
          if (!dateStr) continue;
          
          // Parse date MM/DD/YYYY
          const dateParts = dateStr.split('/');
          if (dateParts.length !== 3) continue;
          
          const month = parseInt(dateParts[0]) - 1;
          const day = parseInt(dateParts[1]);
          const year = parseInt(dateParts[2]);
          
          let gameDate = new Date(year, month, day);
          
          // Add time if available
          if (startTimeIndex !== -1 && values[startTimeIndex]) {
            const timeParts = values[startTimeIndex].split(':');
            if (timeParts.length === 2) {
              const hours = parseInt(timeParts[0]);
              const minutes = parseInt(timeParts[1].substring(0, 2)); // Handle AM/PM
              
              if (!isNaN(hours) && !isNaN(minutes)) {
                gameDate.setHours(hours, minutes);
              }
            }
          }
          
          // Get opponent name
          let opponentName = values[gameNameIndex] || 'TBD';
          
          // Simplify opponent extraction
          if (opponentName.includes('vs')) {
            const parts = opponentName.split('vs');
            // Just get the last part after "vs"
            opponentName = parts[parts.length - 1].trim();
          }
          
          // Get location
          const location = locationIndex !== -1 ? values[locationIndex] || '' : '';
          
          // Check for duplicate
          const existingGame = await prisma.game.findFirst({
            where: {
              teamId: team.id,
              opponentName: {
                contains: opponentName,
                mode: 'insensitive'
              },
              gameDate: {
                gte: new Date(year, month, day),
                lt: new Date(year, month, day + 1)
              }
            }
          });
          
          if (existingGame) {
            console.log(`Skipping existing game: vs ${opponentName} on ${gameDate.toLocaleDateString()}`);
            continue;
          }
          
          // Notes from address and arrival time
          let notes = '';
          if (arrivalTimeIndex !== -1 && values[arrivalTimeIndex]) {
            notes += `Arrival: ${values[arrivalTimeIndex]}, `;
          }
          if (addressIndex !== -1 && values[addressIndex]) {
            notes += `Address: ${values[addressIndex]}`;
          }
          
          // Create game
          const game = await prisma.game.create({
            data: {
              teamId: team.id,
              opponentName,
              gameDate,
              location,
              opponentDifficulty: 3, // Default
              outfielderCount: 4,
              playerCount: 11,
              notes: notes || 'Imported from schedule'
            }
          });
          
          console.log(`Created game from CSV: vs ${game.opponentName} on ${game.gameDate.toLocaleDateString()}`);
        }
      } else {
        console.log('CSV schedule file not found, skipping import');
      }
    } catch (error) {
      console.error('Error importing schedule from CSV:', error);
    }

    console.log(`Seeding completed successfully!`);
  } catch (error) {
    console.error('Error seeding database:', error);
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