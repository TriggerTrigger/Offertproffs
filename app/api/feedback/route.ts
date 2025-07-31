import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const feedbackData = await req.json();

    // Spara feedback till databasen
    const feedback = await prisma.feedback.create({
      data: {
        easyToUse: feedbackData.easyToUse,
        pdfWorks: feedbackData.pdfWorks,
        looksProfessional: feedbackData.looksProfessional,
        wouldRecommend: feedbackData.wouldRecommend,
        additionalComments: feedbackData.additionalComments || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback sparad',
      feedback
    });

  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid sparande av feedback' },
      { status: 500 }
    );
  }
} 