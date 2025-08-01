const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    // Ta bort användaren test2@offertproffs.nu
    const deletedUser = await prisma.user.delete({
      where: { email: 'test2@offertproffs.nu' }
    });

    console.log('Användare borttagen:', deletedUser.email);
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('Användaren test2@offertproffs.nu finns inte i databasen');
    } else {
      console.error('Fel vid borttagning av användare:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser(); 