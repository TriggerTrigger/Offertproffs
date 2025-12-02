import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Gör denna API-route helt dynamisk så att den aldrig cache:as av Next/Vercel
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        firstLoginDate: true,
        testPeriodEnd: true,
        createdAt: true
      }
    });

    const response = NextResponse.json({
      success: true,
      users
    });

    // Lägg till headers för att förhindra caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av användare' },
      { status: 500 }
    );
  }
} 