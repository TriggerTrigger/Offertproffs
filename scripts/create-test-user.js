const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash lösenordet
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Skapa testanvändare
    const user = await prisma.user.upsert({
      where: { email: 'offertproffs@gmail.com' },
      update: {
        password: hashedPassword,
        companyName: 'Test Företag AB',
        companyPhone: '070-1234567',
        companyEmail: 'info@testföretag.se',
        companyStreet: 'Testgatan 1',
        companyPostalCode: '12345',
        companyCity: 'Stockholm',
        companyOrgNr: '556123-4567',
        companyVatNr: 'SE556123456701',
        companyWebsite: 'www.testföretag.se',
        companyBankAccount: '1234-5678',
      },
      create: {
        email: 'offertproffs@gmail.com',
        password: hashedPassword,
        companyName: 'Test Företag AB',
        companyPhone: '070-1234567',
        companyEmail: 'info@testföretag.se',
        companyStreet: 'Testgatan 1',
        companyPostalCode: '12345',
        companyCity: 'Stockholm',
        companyOrgNr: '556123-4567',
        companyVatNr: 'SE556123456701',
        companyWebsite: 'www.testföretag.se',
        companyBankAccount: '1234-5678',
      },
    });

    console.log('Testanvändare skapad:', user.email);
    console.log('Lösenord: test123');
  } catch (error) {
    console.error('Fel vid skapande av testanvändare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 