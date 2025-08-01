const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Användare att ta bort - ändra detta
const emailToDelete = 'test2@offertproffs.nu';

async function deleteSpecificUser() {
  try {
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
    await prisma.$disconnect();
  }
}

deleteSpecificUser(); 