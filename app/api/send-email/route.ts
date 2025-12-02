import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { to, subject, message, pdfBase64, pdfFileName, userEmail } = await req.json();

    // Validera PDF base64
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      try {
        // Testa att dekoda base64 för att säkerställa att det är giltigt
        const testBuffer = Buffer.from(pdfBase64, 'base64');
        if (testBuffer.length === 0) {
          throw new Error('PDF är tom');
        }
        console.log('PDF validation passed, size:', testBuffer.length, 'bytes');
      } catch (base64Error) {
        console.error('Invalid PDF base64:', base64Error);
        return NextResponse.json({ error: 'Ogiltig PDF-data' }, { status: 400 });
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465, // true för 465, annars false
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Hämta företagarens sparade kontaktadress (företagsprofil)
    let replyToAddress = process.env.EMAIL_USER;

    if (userEmail && typeof userEmail === 'string') {
      try {
        const user = await prisma.user.findUnique({
          where: { email: userEmail.trim().toLowerCase() },
        });

        if (user) {
          // Använd företagets sparade e-post om den finns, annars använd användarens e-post
          replyToAddress = user.companyEmail || user.email || replyToAddress;
        }
      } catch (profileError) {
        console.error('Kunde inte hämta användarprofil för replyTo:', profileError);
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
      // Svar från kunden går till företagets sparade kontaktadress
      replyTo: replyToAddress,

      attachments: pdfBase64
        ? [
            {
              filename: pdfFileName || 'offert.pdf',
              content: pdfBase64,
              encoding: 'base64',
              contentType: 'application/pdf',
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SMTP error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
