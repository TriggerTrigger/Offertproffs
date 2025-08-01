const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'info@offertproffs.nu' }
    });

    if (user) {
      console.log('Admin-användare data:');
      console.log('Email:', user.email);
      console.log('firstLoginDate:', user.firstLoginDate);
      console.log('testPeriodEnd:', user.testPeriodEnd);
      console.log('companyName:', user.companyName);
      console.log('companyPhone:', user.companyPhone);
    } else {
      console.log('Admin-användare hittades inte');
    }
    
  } catch (error) {
    console.error('Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin(); 