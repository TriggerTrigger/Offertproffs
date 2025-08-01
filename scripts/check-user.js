const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test2@offertproffs.nu' }
    });

    if (user) {
      console.log('Användardata för test2@offertproffs.nu:');
      console.log('companyName:', user.companyName);
      console.log('companyStreet:', user.companyStreet);
      console.log('companyPhone:', user.companyPhone);
      console.log('companyEmail:', user.companyEmail);
      console.log('companyOrgNr:', user.companyOrgNr);
      console.log('companyVatNr:', user.companyVatNr);
      console.log('companyWebsite:', user.companyWebsite);
      console.log('companyBankAccount:', user.companyBankAccount);
      
      // Kontrollera hasCompanyData
      const hasCompanyData = user.companyName || user.companyStreet || user.companyPhone || 
                            user.companyEmail || user.companyOrgNr || user.companyVatNr ||
                            user.companyWebsite || user.companyBankAccount;
      
      console.log('\nhasCompanyData:', hasCompanyData);
    } else {
      console.log('Användaren hittades inte');
    }
  } catch (error) {
    console.error('Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 