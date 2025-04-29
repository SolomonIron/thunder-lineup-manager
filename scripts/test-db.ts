// This script tests the database connection
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test the connection by attempting to create a team
    const team = await prisma.team.create({
      data: {
        name: 'Test Team',
        season: '2025',
        coachPitch: true,
      },
    });
    
    console.log('Successfully connected to the database!');
    console.log('Created test team:', team);
    
    // Clean up - delete the test team
    await prisma.team.delete({
      where: {
        id: team.id,
      },
    });
    
    console.log('Cleaned up test data.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();