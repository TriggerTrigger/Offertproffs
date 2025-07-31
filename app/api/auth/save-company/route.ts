import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, companyData } = await req.json();

    // Uppdatera användarens företagsinformation
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        companyName: companyData.companyName,
        companyPhone: companyData.companyPhone,
        companyEmail: companyData.companyEmail,
        companyStreet: companyData.companyStreet,
        companyPostalCode: companyData.companyPostalCode,
        companyCity: companyData.companyCity,
        companyOrgNr: companyData.companyOrgNr,
        companyVatNr: companyData.companyVatNr,
        companyWebsite: companyData.companyWebsite,
        companyBankAccount: companyData.companyBankAccount,
      }
    });

    const { password: _, ...userData } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Save company error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid sparande av företagsinformation' },
      { status: 500 }
    );
  }
} 