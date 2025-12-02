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

export async function DELETE(req: Request) {
  try {
    const { userIds, adminEmail } = await req.json();

    // Kontrollera att det är admin som gör anropet
    if (!adminEmail || adminEmail !== 'info@offertproffs.nu') {
      return NextResponse.json(
        { error: 'Otillåten åtgärd' },
        { status: 403 }
      );
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Inga användare valda för borttagning' },
        { status: 400 }
      );
    }

    // Hämta admin-användaren för att skydda den från att raderas av misstag
    const adminUser = await prisma.user.findUnique({
      where: { email: 'info@offertproffs.nu' },
      select: { id: true },
    });

    const protectedIds = new Set<string>();
    if (adminUser?.id) {
      protectedIds.add(adminUser.id);
    }

    // Filtrera bort skyddade ID:n
    const idsToDelete = userIds.filter((id: string) => !protectedIds.has(id));

    if (idsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'Inga användare raderades (admin-kontot skyddas alltid).',
      });
    }

    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Users delete error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid borttagning av användare' },
      { status: 500 }
    );
  }
}