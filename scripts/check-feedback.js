const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFeedback() {
  try {
    console.log('=== KONTROLLERAR FEEDBACK I DATABASEN ===');
    
    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Hittade ${feedback.length} feedback-poster:`);
    
    feedback.forEach((item, index) => {
      console.log(`\n--- Feedback ${index + 1} ---`);
      console.log(`ID: ${item.id}`);
      console.log(`Lätt att använda: ${item.easyToUse ? 'Ja' : 'Nej'}`);
      console.log(`PDF fungerar: ${item.pdfWorks ? 'Ja' : 'Nej'}`);
      console.log(`Ser professionellt ut: ${item.looksProfessional ? 'Ja' : 'Nej'}`);
      console.log(`Skulle rekommendera: ${item.wouldRecommend ? 'Ja' : 'Nej'}`);
      console.log(`Kommentarer: ${item.additionalComments || 'Inga'}`);
      console.log(`Skapad: ${item.createdAt}`);
    });
    
  } catch (error) {
    console.error('Fel vid kontroll av feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeedback(); 