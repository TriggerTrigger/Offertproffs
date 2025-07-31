import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, days } = await req.json();

    if (!userId || !days) {
      return NextResponse.json(
        { error: 'Användar-ID och antal dagar krävs' },
        { status: 400 }
      );
    }

    // Hitta användaren
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Användare hittades inte' },
        { status: 404 }
      );
    }

    // Beräkna nytt slutdatum
    let newEndDate: Date;
    if (user.testPeriodEnd && user.testPeriodEnd > new Date()) {
      // Förläng från nuvarande slutdatum
      newEndDate = new Date(user.testPeriodEnd);
      newEndDate.setDate(newEndDate.getDate() + days);
    } else {
      // Sätt nytt slutdatum från nu
      newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + days);
    }

    // Uppdatera användaren
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        testPeriodEnd: newEndDate
      }
    });

    return NextResponse.json({
      success: true,
      message: `Test-perioden förlängdes med ${days} dagar`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Extend test period error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid förlängning av test-perioden' },
      { status: 500 }
    );
  }
} 