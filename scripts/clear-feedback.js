const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearFeedback() {
  try {
    console.log('=== RENSAR ALLA FEEDBACK ===');
    
    const result = await prisma.feedback.deleteMany({});
    
    console.log(`Rensade ${result.count} feedback-poster`);
    console.log('Alla feedback har rensats från databasen');
    
  } catch (error) {
    console.error('Fel vid rensning av feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearFeedback(); 