const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function deleteSpecificUser() {
  try {
    // Fråga efter email
    const emailToDelete = await new Promise((resolve) => {
      rl.question('Ange email för användare att ta bort: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!emailToDelete) {
      console.log('Ingen email angiven. Avbryter.');
      return;
    }

    // Bekräfta borttagning
    const confirm = await new Promise((resolve) => {
      rl.question(`Är du säker på att ta bort ${emailToDelete}? (ja/nej): `, (answer) => {
        resolve(answer.trim().toLowerCase());
      });
    });

    if (confirm !== 'ja' && confirm !== 'j') {
      console.log('Borttagning avbruten.');
      return;
    }

    const deletedUser = await prisma.user.delete({
      where: { email: emailToDelete }
    });

    console.log('Användare borttagen:', deletedUser.email);
    
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`Användaren ${emailToDelete} finns inte i databasen`);
    } else {
      console.error('Fel:', error);
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

deleteSpecificUser(); 