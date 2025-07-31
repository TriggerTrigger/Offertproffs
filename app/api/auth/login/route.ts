import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Hitta användaren
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Felaktig email eller lösenord' },
        { status: 401 }
      );
    }

    // Verifiera lösenord
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Felaktig email eller lösenord' },
        { status: 401 }
      );
    }

    // Kontrollera test-period
    if (user.testPeriodEnd && user.testPeriodEnd < new Date()) {
      return NextResponse.json(
        { error: 'Din test-period har gått ut. Kontakta admin för förlängning.' },
        { status: 403 }
      );
    }

    // Uppdatera första inloggning och test-period om det är första gången
    let updatedUser = user;
    if (!user.firstLoginDate) {
      const testPeriodEnd = new Date();
      testPeriodEnd.setDate(testPeriodEnd.getDate() + 14); // 14 dagar

      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstLoginDate: new Date(),
          testPeriodEnd: testPeriodEnd
        }
      });
    }

    // Returnera användardata (utan lösenord)
    const { password: _, ...userData } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid inloggning' },
      { status: 500 }
    );
  }
} 