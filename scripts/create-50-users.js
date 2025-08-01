const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function create50Users() {
  try {
    console.log('🚀 Skapar 50 test-användare...\n');
    
    const users = [];
    
    for (let i = 1; i <= 50; i++) {
      // Generera unik email
      const email = `test${i}@offertproffs.nu`;
      
      // Generera slumpmässigt lösenord (6 tecken)
      const password = Math.random().toString(36).slice(-6);
      const hashedPassword = await bcrypt.hash(password, 10);
      
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
      
      users.push({
        email: email,
        password: password,
        id: newUser.id
      });
      
      console.log(`✅ Användare ${i}/50: ${email} - Lösenord: ${password}`);
    }
    
    console.log('\n🎉 Alla 50 användare skapade!');
    console.log('\n📧 Email-lista för massmail:');
    console.log('=====================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Lösenord: ${user.password}`);
    });
    
    console.log('\n💡 Tips för massmail:');
    console.log('- Använd BCC för att skydda användarnas integritet');
    console.log('- Inkludera individuella inloggningsuppgifter för varje användare');
    console.log('- Förklara att det är en 14-dagars testperiod');
    
  } catch (error) {
    console.error('❌ Fel vid skapande av användare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

create50Users(); 