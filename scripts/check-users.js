const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== ALLA ANVÄNDARE I DATABASEN ===');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        companyName: true,
        companyPhone: true,
        firstLoginDate: true,
        testPeriodEnd: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('Inga användare hittades i databasen.');
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n--- Användare ${index + 1} ---`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Företagsnamn: ${user.companyName || 'Inget'}`);
      console.log(`Telefon: ${user.companyPhone || 'Inget'}`);
      console.log(`Första inlogg: ${user.firstLoginDate}`);
      console.log(`Testperiod slutar: ${user.testPeriodEnd}`);
      console.log(`Skapad: ${user.createdAt}`);
      console.log(`Uppdaterad: ${user.updatedAt}`);
    });

    console.log(`\n=== TOTALT ${users.length} ANVÄNDARE ===`);

  } catch (error) {
    console.error('Fel vid hämtning av användare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 