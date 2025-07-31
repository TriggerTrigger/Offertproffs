const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash lösenordet
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Skapa testanvändare
    const user = await prisma.user.upsert({
      where: { email: 'info@offertproffs.nu' },
      update: {
        password: hashedPassword,
        companyName: '',
        companyPhone: '',
        companyEmail: 'info@offertproffs.nu',
        companyStreet: '',
        companyPostalCode: '',
        companyCity: '',
        companyOrgNr: '',
        companyVatNr: '',
        companyWebsite: '',
        companyBankAccount: '',
      },
      create: {
        email: 'info@offertproffs.nu',
        password: hashedPassword,
        companyName: '',
        companyPhone: '',
        companyEmail: 'info@offertproffs.nu',
        companyStreet: '',
        companyPostalCode: '',
        companyCity: '',
        companyOrgNr: '',
        companyVatNr: '',
        companyWebsite: '',
        companyBankAccount: '',
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