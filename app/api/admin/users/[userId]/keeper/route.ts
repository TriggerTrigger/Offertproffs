import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { isKeeper, adminEmail } = await req.json();

    // Kontrollera att det är admin som gör anropet
    if (!adminEmail || adminEmail !== 'info@offertproffs.nu') {
      return NextResponse.json(
        { error: 'Otillåten åtgärd' },
        { status: 403 }
      );
    }

    if (typeof isKeeper !== 'boolean') {
      return NextResponse.json(
        { error: 'isKeeper måste vara true eller false' },
        { status: 400 }
      );
    }

    // Hämta användaren för att kontrollera att den finns
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Användare hittades inte' },
        { status: 404 }
      );
    }

    // Uppdatera keeper-flaggan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isKeeper },
      select: {
        id: true,
        email: true,
        isKeeper: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Keeper update error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid uppdatering av keeper-flaggan' },
      { status: 500 }
    );
  }
}

