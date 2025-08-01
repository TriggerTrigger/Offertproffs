const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    // Uppdatera admin-användaren för att ta bort testperiod
    const updatedUser = await prisma.user.update({
      where: { email: 'info@offertproffs.nu' },
      data: {
        firstLoginDate: null,
        testPeriodEnd: null
      }
    });

    console.log('Admin-användare uppdaterad:', updatedUser.email);
    console.log('Testperiod borttagen för admin');
    
  } catch (error) {
    console.error('Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser(); 