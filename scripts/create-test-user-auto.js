const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hitta nästa lediga nummer
    let userNumber = 3;
    let email = `test${userNumber}@offertproffs.nu`;
    
    // Hitta första lediga nummer
    while (true) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      });
      
      if (!existingUser) {
        break; // Hittade ledig email
      }
      
      userNumber++;
      email = `test${userNumber}@offertproffs.nu`;
    }
    
    // Generera random lösenord
    const randomPassword = Math.random().toString(36).slice(-6); // 6 tecken
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    // Skapa användare med tomma företagsfält
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        // Alla företagsfält är tomma
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
        // Sätt testperiod till 14 dagar från nu
        firstLoginDate: new Date(),
        testPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dagar
      }
    });

    console.log('Ny test-användare skapad:');
    console.log('Email:', newUser.email);
    console.log('Lösenord:', randomPassword);
    console.log('Testperiod: 14 dagar');
    console.log('Alla företagsfält är tomma');
    
  } catch (error) {
    console.error('Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 