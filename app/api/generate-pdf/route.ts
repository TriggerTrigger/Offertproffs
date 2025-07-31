
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const { formData, selectedTemplate } = await req.json();

    console.log('Received formData:', Object.keys(formData));
    console.log('Selected template:', selectedTemplate);

    // Skapa HTML för offerten baserat på mall - samma som förhandsvisningen
    let html = '';
    
    if (selectedTemplate === 'template1') {
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offert ${formData.offertNummer || 'OFF-33'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .client-info {
              flex: 1;
            }
            .offer-info {
              flex: 1;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Offert ${formData.offertNummer || 'OFF-33'}</h1>
            <p>Skapad: ${new Date().toLocaleDateString('sv-SE')}</p>
          </div>
          
          <div class="company-info">
            <div class="client-info">
              <h3>Företag</h3>
              <p><strong>${formData.foretagNamn || 'Företag AB'}</strong></p>
              <p>${formData.foretagAdress || 'Adress 123'}</p>
              <p>${formData.foretagTelefon || '070-123 45 67'}</p>
              <p>${formData.foretagEmail || 'info@foretag.se'}</p>
            </div>
            <div class="offer-info">
              <h3>Kund</h3>
              <p><strong>${formData.kundNamn || 'Kund AB'}</strong></p>
              <p>${formData.kundAdress || 'Kundadress 456'}</p>
              <p>${formData.kundTelefon || '070-987 65 43'}</p>
              <p>${formData.kundEmail || 'kund@kund.se'}</p>
            </div>
          </div>
          
          <h2>Produkter och tjänster</h2>
          <table>
            <thead>
              <tr>
                <th>Produkt/Tjänst</th>
                <th>Beskrivning</th>
                <th>Antal</th>
                <th>Enhetspris</th>
                <th>Summa</th>
              </tr>
            </thead>
            <tbody>
              ${formData.produkter ? formData.produkter.map((produkt: any, index: number) => `
                <tr>
                  <td>${produkt.namn || 'Produkt ' + (index + 1)}</td>
                  <td>${produkt.beskrivning || 'Beskrivning'}</td>
                  <td>${produkt.antal || 1}</td>
                  <td>${produkt.pris || 0} kr</td>
                  <td>${(produkt.antal || 1) * (produkt.pris || 0)} kr</td>
                </tr>
              `).join('') : `
                <tr>
                  <td>Exempel produkt</td>
                  <td>Beskrivning av produkt</td>
                  <td>1</td>
                  <td>1000 kr</td>
                  <td>1000 kr</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Offert gäller i 30 dagar från datum</p>
            <p>Villkor och betalningsvillkor enligt överenskommelse</p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Standardmall
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Offert</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Offert</h1>
            <p>Datum: ${new Date().toLocaleDateString('sv-SE')}</p>
          </div>
          
          <h2>Produkter</h2>
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Beskrivning</th>
                <th>Antal</th>
                <th>Pris</th>
                <th>Summa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Standard produkt</td>
                <td>Beskrivning</td>
                <td>1</td>
                <td>500 kr</td>
                <td>500 kr</td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;
    }

    console.log('Generated HTML length:', html.length);

    // Använd Puppeteer med html2pdf.js för att få samma resultat som förhandsvisningen
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Ladda html2pdf.js
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    });

    // Sätt HTML-innehållet
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Använd samma inställningar som förhandsvisningen
    const pdfBuffer = await page.evaluate(() => {
      return new Promise<Uint8Array>((resolve) => {
        const element = document.body;
        const opt = {
          margin: 10,
          filename: 'offert.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // @ts-ignore - html2pdf är tillgängligt via CDN
        const html2pdf = (window as any).html2pdf;
        html2pdf().set(opt).from(element).output('datauristring').then((dataUri: string) => {
          // Konvertera data URI till buffer
          const base64 = dataUri.split(',')[1];
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          resolve(bytes);
        });
      });
    });

    await browser.close();

    // Kontrollera att vi faktiskt fick en PDF
    if (pdfBuffer.length === 0) {
      throw new Error("PDF är tom");
    }

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    return new Response(pdfBuffer as Buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="offert.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: "Misslyckades att generera PDF" },
      { status: 500 }
    );
  }
}
