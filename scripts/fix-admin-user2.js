const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    // Sätt testperioden till ett mycket långt datum i framtiden för admin
    const farFutureDate = new Date('2030-12-31');
    
    const updatedUser = await prisma.user.update({
      where: { email: 'info@offertproffs.nu' },
      data: {
        firstLoginDate: new Date('2020-01-01'), // Sätt till ett tidigt datum
        testPeriodEnd: farFutureDate // Sätt till långt i framtiden
      }
    });

    console.log('Admin-användare uppdaterad:', updatedUser.email);
    console.log('Testperiod satt till:', farFutureDate);
    console.log('Admin har nu obegränsad tillgång');
    
  } catch (error) {
    console.error('Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser(); 