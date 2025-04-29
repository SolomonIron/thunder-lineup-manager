import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create the 2025 Ohio Thunder team
    const team = await prisma.team.create({
      data: {
        name: '2025 Ohio Thunder',
        season: '2025',
        coachPitch: true,
      },
    });

    console.log(`Created team: ${team.name}`);

    // Create the players from the data we have in the PDFs
    const players = [
      {
        name: 'R Gardner',
        jerseyNumber: '10',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'second_base', preferenceLevel: 5, allowed: true },
          { position: 'pitcher', preferenceLevel: 3, allowed: true },
          { position: 'shortstop', preferenceLevel: 4, allowed: true },
          { position: 'third_base', preferenceLevel: 3, allowed: true },
          { position: 'first_base', preferenceLevel: 3, allowed: true },
          { position: 'catcher', preferenceLevel: 2, allowed: true },
          { position: 'left_field', preferenceLevel: 3, allowed: true },
          { position: 'right_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'F Couch',
        jerseyNumber: '0',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'shortstop', preferenceLevel: 5, allowed: true },
          { position: 'center_field', preferenceLevel: 4, allowed: true },
          { position: 'second_base', preferenceLevel: 3, allowed: true },
          { position: 'third_base', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'O Ardo',
        jerseyNumber: '11',
        skillLevel: 5,
        teamId: team.id,
        positionPreferences: [
          { position: 'third_base', preferenceLevel: 5, allowed: true },
          { position: 'pitcher', preferenceLevel: 4, allowed: true },
          { position: 'catcher', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'B Bittner',
        jerseyNumber: '15',
        skillLevel: 5,
        teamId: team.id,
        positionPreferences: [
          { position: 'first_base', preferenceLevel: 5, allowed: true },
          { position: 'pitcher', preferenceLevel: 4, allowed: true },
        ]
      },
      {
        name: 'K Barcomb',
        jerseyNumber: '27',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'center_field', preferenceLevel: 5, allowed: true },
          { position: 'shortstop', preferenceLevel: 4, allowed: true },
        ]
      },
      {
        name: 'T Reighard',
        jerseyNumber: '23',
        skillLevel: 4,
        teamId: team.id,
        positionPreferences: [
          { position: 'left_field', preferenceLevel: 5, allowed: true },
          { position: 'third_base', preferenceLevel: 4, allowed: true },
        ]
      },
      {
        name: 'S Cartellone',
        jerseyNumber: '2',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'right_field', preferenceLevel: 4, allowed: true },
          { position: 'catcher', preferenceLevel: 5, allowed: true },
        ]
      },
      {
        name: 'G Krysh',
        jerseyNumber: '7',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'pitcher', preferenceLevel: 4, allowed: true },
          { position: 'shortstop', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'K Coy',
        jerseyNumber: '45',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'pitcher', preferenceLevel: 5, allowed: true },
          { position: 'right_field', preferenceLevel: 4, allowed: true },
        ]
      },
      {
        name: 'S Weldon',
        jerseyNumber: '42',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'center_field', preferenceLevel: 4, allowed: true },
          { position: 'left_field', preferenceLevel: 3, allowed: true },
        ]
      },
      {
        name: 'D Horner',
        jerseyNumber: '1',
        skillLevel: 3,
        teamId: team.id,
        positionPreferences: [
          { position: 'catcher', preferenceLevel: 4, allowed: true },
          { position: 'right_field', preferenceLevel: 5, allowed: true },
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

    // Create some sample games based on your PDFs
    const games = [
      {
        teamId: team.id,
        opponentName: '8U Nationals Red',
        gameDate: new Date('2025-04-23T18:00:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 12-5'
      },
      {
        teamId: team.id,
        opponentName: 'Ashville Avengers 8U',
        gameDate: new Date('2025-04-26T10:00:00'),
        location: 'Home Field',
        opponentDifficulty: 4,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 9-8'
      },
      {
        teamId: team.id,
        opponentName: 'Ashville Avengers 8U',
        gameDate: new Date('2025-04-27T13:00:00'),
        location: 'Home Field',
        opponentDifficulty: 4,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 12-7'
      },
      {
        teamId: team.id,
        opponentName: 'Big Walnut 8U Freedom',
        gameDate: new Date('2025-04-19T15:30:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 12-7'
      },
      {
        teamId: team.id,
        opponentName: 'Big Walnut 8U Freedom',
        gameDate: new Date('2025-04-27T16:00:00'),
        location: 'Home Field',
        opponentDifficulty: 3,
        outfielderCount: 4,
        playerCount: 11,
        notes: 'Ohio Thunder won 22-7'
      },
    ];

    for (const gameData of games) {
      const game = await prisma.game.create({
        data: gameData
      });
      console.log(`Created game: vs ${game.opponentName} on ${game.gameDate.toLocaleDateString()}`);
    }

    console.log(`Seeding completed successfully!`);
  } catch (error) {
    console.error('Error seeding database:', error);
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