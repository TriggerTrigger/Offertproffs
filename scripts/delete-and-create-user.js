const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function deleteAndCreateUser() {
  try {
    // Ta bort den gamla användaren
    try {
      await prisma.user.delete({
        where: { email: 'test2@offertproffs.nu' }
      });
      console.log('Gammal användare borttagen');
    } catch (error) {
      if (error.code === 'P2025') {
        console.log('Användaren fanns inte, fortsätter...');
      } else {
        throw error;
      }
    }

    // Skapa en helt ny användare med tomma fält
    const hashedPassword = await bcrypt.hash('test456', 10);
    
    const newUser = await prisma.user.upsert({
      where: { email: 'test2@offertproffs.nu' },
      update: {
        // Sätt alla företagsfält till tomma strängar
        companyName: '',
        companyStreet: '',
        companyPostalCode: '',
        companyCity: '',
        companyPhone: '',
        companyEmail: '',
        companyOrgNr: '',
        companyVatNr: '',
        companyWebsite: '',
        companyBankAccount: '',
        password: hashedPassword,
        firstLoginDate: null,
        testPeriodEnd: null
      },
      create: {
        email: 'test2@offertproffs.nu',
        password: hashedPassword,
        // Alla företagsfält är tomma från början
        companyName: '',
        companyStreet: '',
        companyPostalCode: '',
        companyCity: '',
        companyPhone: '',
        companyEmail: '',
        companyOrgNr: '',
        companyVatNr: '',
        companyWebsite: '',
        companyBankAccount: '',
        firstLoginDate: null,
        testPeriodEnd: null
      }
    });

    console.log('Ny användare skapad:', newUser.email);
    console.log('Alla företagsfält är tomma');
    
  } catch (error) {
    console.error('Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAndCreateUser(); 