const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser2() {
  try {
    // Hash lösenordet
    const hashedPassword = await bcrypt.hash('test456', 10);

    // Skapa testanvändare
    const user = await prisma.user.upsert({
      where: { email: 'test2@offertproffs.nu' },
      update: {
        password: hashedPassword,
        companyName: '',
        companyPhone: '',
        companyEmail: 'test2@offertproffs.nu',
        companyStreet: '',
        companyPostalCode: '',
        companyCity: '',
        companyOrgNr: '',
        companyVatNr: '',
        companyWebsite: '',
        companyBankAccount: '',
      },
      create: {
        email: 'test2@offertproffs.nu',
        password: hashedPassword,
        companyName: '',
        companyPhone: '',
        companyEmail: 'test2@offertproffs.nu',
        companyStreet: '',
        companyPostalCode: '',
        companyCity: '',
        companyOrgNr: '',
        companyVatNr: '',
        companyWebsite: '',
        companyBankAccount: '',
      },
    });

    console.log('Testanvändare 2 skapad:', user.email);
    console.log('Lösenord: test456');
    console.log('Email: test2@offertproffs.nu');
  } catch (error) {
    console.error('Fel vid skapande av testanvändare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser2(); 