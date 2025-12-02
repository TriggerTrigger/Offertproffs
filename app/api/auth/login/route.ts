import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    if (!normalizedEmail || !trimmedPassword) {
      return NextResponse.json(
        { error: 'Fyll i både email och lösenord' },
        { status: 400 }
      );
    }

    // Temporär spärr: endast specifika konton är öppna under arbetet
    const allowedEmails = ['info@offertproffs.nu', 'linden_david@hotmail.com'];
    if (!allowedEmails.includes(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Just nu är endast utvalda konton aktiva medan vi uppdaterar systemet.' },
        { status: 403 }
      );
    }

    // Hitta användaren
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // Skapa automatiskt ett konto om det inte finns
    if (!user) {
      const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
      const firstLoginDate = new Date();
      const testPeriodEnd = new Date();
      testPeriodEnd.setFullYear(testPeriodEnd.getFullYear() + 1); // gratis i 12 månader

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          firstLoginDate,
          testPeriodEnd
        }
      });
    } else {
      // Verifiera lösenord
      const isValidPassword = await bcrypt.compare(trimmedPassword, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Felaktig email eller lösenord' },
          { status: 401 }
        );
      }

      // Kontrollera test-period för befintliga konton
      if (user.testPeriodEnd && user.testPeriodEnd < new Date()) {
        return NextResponse.json(
          { error: 'Din test-period har gått ut. Kontakta admin för förlängning.' },
          { status: 403 }
        );
      }

      // Sätt startdatum om det saknas
      if (!user.firstLoginDate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firstLoginDate: new Date(),
            testPeriodEnd: user.testPeriodEnd ?? (() => {
              const endDate = new Date();
              endDate.setFullYear(endDate.getFullYear() + 1);
              return endDate;
            })()
          }
        });
      }
    }

    // Returnera användardata (utan lösenord)
    const { password: _, ...userData } = user;

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