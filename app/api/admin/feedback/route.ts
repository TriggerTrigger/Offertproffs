import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    console.log('=== DEBUG: Feedback API called ===');
    
    // Hämta all feedback sorterad efter datum (nyaste först)
    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${feedback.length} feedback items`);
    console.log('Feedback data:', feedback);

    const response = NextResponse.json({
      success: true,
      feedback
    });

    // Lägg till headers för att förhindra caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av feedback' },
      { status: 500 }
    );
  }
} 