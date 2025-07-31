
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { formData, selectedTemplate } = await req.json();

    console.log('Received formData:', Object.keys(formData));
    console.log('Selected template:', selectedTemplate);

    // Skapa HTML för offerten baserat på mall - samma som förhandsvisningen
    let html = '';
    
    // Hjälpfunktioner för färger och beräkningar (samma som i preview)
    const getTemplateColors = (template: string) => {
      switch (template) {
        case '1': return { primary: '#3B82F6', secondary: '#1E40AF', bg: '#EFF6FF' };
        case '2': return { primary: '#10B981', secondary: '#047857', bg: '#ECFDF5' };
        case '3': return { primary: '#F59E0B', secondary: '#D97706', bg: '#FFFBEB' };
        case '4': return { primary: '#8B5CF6', secondary: '#7C3AED', bg: '#F3E8FF' };
        default: return { primary: '#3B82F6', secondary: '#1E40AF', bg: '#EFF6FF' };
      }
    };

    const calculateTotal = () => {
      return formData.products?.reduce((sum: number, product: any) => {
        const lineTotal = product.quantity * product.price;
        const discountAmount = lineTotal * (product.discount / 100);
        const afterDiscount = lineTotal - discountAmount;
        const vatAmount = afterDiscount * (product.vat / 100);
        return sum + afterDiscount + vatAmount;
      }, 0) || 0;
    };

    const colors = getTemplateColors(selectedTemplate);
    
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offert ${formData.quoteNumber || 'OFF-33'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 10px;
            background-color: ${colors.bg};
          }
          .company-info h1 {
            color: ${colors.primary};
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .company-info p {
            margin: 2px 0;
            color: #666;
          }
          .offer-info h2 {
            color: ${colors.primary};
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .offer-info p {
            margin: 2px 0;
            color: #666;
          }
          .customer-section h3 {
            color: ${colors.secondary};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .customer-section p {
            margin: 2px 0;
            color: #333;
          }
          .ai-text {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
            white-space: pre-wrap;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background-color: ${colors.primary};
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .total-section {
            margin-top: 20px;
            text-align: right;
          }
          .total-box {
            display: inline-block;
            padding: 15px;
            border-radius: 5px;
            background-color: ${colors.bg};
          }
          .total-amount {
            color: ${colors.primary};
            font-size: 18px;
            font-weight: bold;
          }
          .delivery-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .delivery-section h3 {
            color: ${colors.secondary};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .delivery-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 14px;
          }
          .delivery-item p {
            margin: 2px 0;
          }
          .delivery-item .label {
            font-weight: bold;
            color: #666;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>${formData.companyName || 'Företagsnamn'}</h1>
            <div>
              ${(formData.companyStreet || formData.companyPostalCode || formData.companyCity) ? 
                `<p>${[formData.companyStreet, formData.companyPostalCode, formData.companyCity].filter(Boolean).join(', ')}</p>` : ''
              }
              ${formData.companyPhone ? `<p>Tel: ${formData.companyPhone}</p>` : ''}
              ${formData.companyEmail ? `<p>E-post: ${formData.companyEmail}</p>` : ''}
              ${formData.companyOrgNr ? `<p>Org.nr: ${formData.companyOrgNr}</p>` : ''}
              ${formData.companyVatNr ? `<p>Momsnr: ${formData.companyVatNr}</p>` : ''}
            </div>
          </div>
          <div class="offer-info">
            <h2>OFFERT</h2>
            <p>Nr: ${formData.quoteNumber || 'OFF-33'}</p>
            <p>Datum: ${formData.quoteDate || new Date().toLocaleDateString('sv-SE')}</p>
            ${formData.validUntil ? `<p>Giltig till: ${formData.validUntil}</p>` : ''}
            ${formData.validityPeriod ? `<p>Giltighetstid: ${formData.validityPeriod}</p>` : ''}
          </div>
        </div>

        <!-- Customer Info -->
        <div class="customer-section">
          <h3>Till:</h3>
          <div>
            ${formData.customerCompany ? `<p style="font-weight: bold;">${formData.customerCompany}</p>` : ''}
            ${formData.customerName ? `<p>${formData.customerCompany ? 'Att: ' : ''}${formData.customerName}</p>` : ''}
            ${(formData.customerStreet || formData.customerPostalCode || formData.customerCity) ? 
              `<p>${[formData.customerStreet, formData.customerPostalCode, formData.customerCity].filter(Boolean).join(', ')}</p>` : ''
            }
            ${formData.customerEmail ? `<p>E-post: ${formData.customerEmail}</p>` : ''}
            ${formData.customerPhone ? `<p>Tel: ${formData.customerPhone}</p>` : ''}
          </div>
        </div>

        <!-- AI Generated Text -->
        ${formData.aiGeneratedText ? `
          <div class="ai-text">
            ${formData.aiGeneratedText}
          </div>
        ` : ''}

        <!-- Products Table -->
        ${formData.products?.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Benämning</th>
                <th style="text-align: center;">Antal</th>
                <th style="text-align: right;">Pris</th>
                <th style="text-align: center;">Tidsuppskattning</th>
                <th style="text-align: right;">Moms</th>
                <th style="text-align: right;">Totalt</th>
              </tr>
            </thead>
            <tbody>
              ${formData.products.map((product: any, index: number) => {
                const lineTotal = product.quantity * product.price;
                const discountAmount = lineTotal * (product.discount / 100);
                const afterDiscount = lineTotal - discountAmount;
                const vatAmount = afterDiscount * (product.vat / 100);
                const total = afterDiscount + vatAmount;

                return `
                  <tr>
                    <td>
                      <div>
                        <p style="font-weight: bold;">${product.name}</p>
                        ${product.description ? `<p style="font-size: 12px; color: #666;">${product.description}</p>` : ''}
                      </div>
                    </td>
                    <td style="text-align: center;">${product.quantity}</td>
                    <td style="text-align: right;">${product.price.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</td>
                    <td style="text-align: center; font-size: 12px;">${product.timeEstimate || '-'}</td>
                    <td style="text-align: right;">${product.vat}%</td>
                    <td style="text-align: right; font-weight: bold;">${total.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <p class="total-amount">
                Totalsumma: ${calculateTotal().toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Leveransvillkor -->
        ${(formData.deliveryTime || formData.deliveryMethod || formData.shippingCosts || formData.deliveryAddress) ? `
          <div class="delivery-section">
            <h3>Leveransvillkor</h3>
            <div class="delivery-grid">
              ${formData.deliveryTime ? `
                <div class="delivery-item">
                  <p class="label">Leveranstid:</p>
                  <p>${formData.deliveryTime}</p>
                </div>
              ` : ''}
              ${formData.deliveryMethod ? `
                <div class="delivery-item">
                  <p class="label">Leveranssätt:</p>
                  <p>${formData.deliveryMethod}</p>
                </div>
              ` : ''}
              ${formData.shippingCosts ? `
                <div class="delivery-item">
                  <p class="label">Fraktkostnader:</p>
                  <p>${formData.shippingCosts}</p>
                </div>
              ` : ''}
              ${formData.deliveryAddress ? `
                <div class="delivery-item">
                  <p class="label">Leveransadress:</p>
                  <p>${formData.deliveryAddress}</p>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    console.log('Generated HTML length:', html.length);

    // Använd den externa PDF-servern som fungerar på Vercel
    const pdfRes = await fetch("https://pdf-server-production-66e0.up.railway.app/generate", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/pdf"
      },
      body: JSON.stringify({ 
        html,
        options: {
          format: 'A4',
          margin: {
            top: '10mm',
            right: '10mm', 
            bottom: '10mm',
            left: '10mm'
          },
          printBackground: true,
          preferCSSPageSize: true
        }
      })
    });

    if (!pdfRes.ok) {
      const errorText = await pdfRes.text();
      console.error('PDF server error:', errorText);
      throw new Error(`PDF-server fel: ${pdfRes.status} ${pdfRes.statusText}`);
    }
    
    const pdfBuffer = await pdfRes.arrayBuffer();
    
    // Kontrollera att vi faktiskt fick en PDF
    if (pdfBuffer.byteLength === 0) {
      throw new Error("PDF är tom");
    }

    console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="offert.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: `Misslyckades att generera PDF: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
