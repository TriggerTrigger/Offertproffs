import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
      // Svar från kunden går till den inloggade företagaren om möjligt
      replyTo: userEmail && typeof userEmail === 'string' ? userEmail : process.env.EMAIL_USER,

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
