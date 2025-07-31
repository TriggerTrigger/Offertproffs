
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { formData, selectedTemplate } = await req.json();

    console.log('Received formData:', Object.keys(formData));
    console.log('Selected template:', selectedTemplate);
    console.log('Full formData:', JSON.stringify(formData, null, 2));

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
           * {
             box-sizing: border-box;
           }
           body {
             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
             margin: 0;
             padding: 30px;
             background: white;
             color: #2c3e50;
             line-height: 1.6;
             font-size: 14px;
           }
                     .header {
             display: flex;
             justify-content: space-between;
             align-items: flex-start;
             margin-bottom: 32px;
             padding: 20px;
             border-radius: 10px;
             background-color: ${colors.bg};
           }
                     .company-info h1 {
             color: ${colors.primary};
             font-size: 30px;
             font-weight: 700;
             margin-bottom: 8px;
           }
                     .company-info p {
             margin: 2px 0;
             color: #666;
             font-size: 14px;
           }
                     .offer-info h2 {
             color: ${colors.primary};
             font-size: 24px;
             font-weight: 700;
             margin-bottom: 8px;
           }
                     .offer-info p {
             margin: 2px 0;
             color: #666;
             font-size: 14px;
           }
                     .customer-section h3 {
             color: ${colors.secondary};
             font-size: 18px;
             font-weight: 600;
             margin-bottom: 12px;
           }
                     .customer-section p {
             margin: 2px 0;
             color: #374151;
             font-size: 14px;
           }
                     .ai-text {
             margin: 32px 0;
             padding: 16px;
             background-color: #f9f9f9;
             border-radius: 8px;
             white-space: pre-wrap;
           }
                     table {
             width: 100%;
             border-collapse: collapse;
             margin: 32px 0;
             font-size: 14px;
           }
           th {
             background-color: ${colors.primary};
             color: white;
             padding: 12px;
             text-align: left;
             font-weight: 600;
             font-size: 14px;
           }
           td {
             padding: 12px;
             border-bottom: 1px solid #e9ecef;
             vertical-align: top;
           }
           tr:nth-child(even) {
             background-color: #f9f9f9;
           }
                     .total-section {
             margin-top: 16px;
             text-align: right;
           }
                     .total-box {
             display: inline-block;
             padding: 16px;
             border-radius: 8px;
             background-color: ${colors.bg};
           }
                     .total-amount {
             color: ${colors.primary};
             font-size: 20px;
             font-weight: 700;
           }
                     .delivery-section {
             margin-top: 32px;
             padding-top: 24px;
             border-top: 1px solid #eee;
           }
                     .delivery-section h3 {
             color: ${colors.secondary};
             font-size: 18px;
             font-weight: 600;
             margin-bottom: 15px;
           }
                     .delivery-grid {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 15px;
             font-size: 14px;
           }
                     .delivery-item p {
             margin: 4px 0;
           }
           .delivery-item .label {
             font-weight: 600;
             color: #666;
             font-size: 14px;
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
               ${formData.companyWebsite ? `<p>Webbplats: ${formData.companyWebsite}</p>` : ''}
               ${formData.companyBankAccount ? `<p>Bankkonto: ${formData.companyBankAccount}</p>` : ''}
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
             ${formData.customerOrgNr ? `<p>Org.nr: ${formData.customerOrgNr}</p>` : ''}
             ${formData.customerVatNr ? `<p>Momsnr: ${formData.customerVatNr}</p>` : ''}
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
                     <td style="vertical-align: top;">
                       <div>
                         <p style="font-weight: bold; margin: 0;">${product.name}</p>
                         ${product.description ? `<p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${product.description}</p>` : ''}
                       </div>
                     </td>
                     <td style="text-align: center; vertical-align: top;">${product.quantity}</td>
                     <td style="text-align: right; vertical-align: top;">${product.price.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</td>
                     <td style="text-align: center; vertical-align: top; font-size: 14px;">${product.timeEstimate || '-'}</td>
                     <td style="text-align: right; vertical-align: top;">${product.vat}%</td>
                     <td style="text-align: right; font-weight: bold; vertical-align: top;">${total.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</td>
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

         <!-- Betalningsvillkor -->
         ${(formData.paymentMethod || formData.paymentDueDate || formData.lateInterestRate || formData.paymentReference) ? `
           <div class="delivery-section">
             <h3>Betalningsvillkor</h3>
             <div class="delivery-grid">
               ${formData.paymentMethod ? `
                 <div class="delivery-item">
                   <p class="label">Betalningsmetod:</p>
                   <p>${formData.paymentMethod}</p>
                 </div>
               ` : ''}
               ${formData.paymentDueDate ? `
                 <div class="delivery-item">
                   <p class="label">Förfallotid:</p>
                   <p>${formData.paymentDueDate}</p>
                 </div>
               ` : ''}
               ${formData.lateInterestRate ? `
                 <div class="delivery-item">
                   <p class="label">Dröjsmålsränta:</p>
                   <p>${formData.lateInterestRate}</p>
                 </div>
               ` : ''}
               ${formData.paymentReference ? `
                 <div class="delivery-item">
                   <p class="label">Betalningsreferens:</p>
                   <p>${formData.paymentReference}</p>
                 </div>
               ` : ''}
             </div>
           </div>
         ` : ''}

                   <!-- ROT/RUT-avdrag -->
          ${(formData.rotDeduction || formData.rutDeduction) ? `
            <div class="delivery-section">
              <h3>ROT/RUT-avdrag</h3>
              <div style="font-size: 14px; color: #333;">
                ${formData.rotDeduction ? '<div style="margin-bottom: 8px;"><span style="font-weight: 600; color: #10B981;">✓ ROT-avdrag gäller (50% på arbetskostnad)</span></div>' : ''}
                ${formData.rutDeduction ? '<div style="margin-bottom: 8px;"><span style="font-weight: 600; color: #10B981;">✓ RUT-avdrag gäller (50% på arbetskostnad)</span></div>' : ''}
                ${formData.deductionInfo ? `
                  <div style="margin-top: 12px; padding: 12px; background-color: #ECFDF5; border-radius: 4px;">
                    <p style="font-weight: 600; margin-bottom: 4px;">Information om avdrag:</p>
                    <p>${formData.deductionInfo}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

                   <!-- Tilläggsinformation -->
          ${(formData.warranties || formData.additionalTerms || formData.specialNotes) ? `
            <div class="delivery-section">
              <h3>Tilläggsinformation</h3>
              <div style="font-size: 14px; color: #333;">
                ${formData.warranties ? `
                  <div style="margin-bottom: 16px;">
                    <p style="font-weight: 600; margin-bottom: 4px;">Garantier:</p>
                    <p>${formData.warranties}</p>
                  </div>
                ` : ''}
                ${formData.additionalTerms ? `
                  <div style="margin-bottom: 16px;">
                    <p style="font-weight: 600; margin-bottom: 4px;">Övriga villkor:</p>
                    <p>${formData.additionalTerms}</p>
                  </div>
                ` : ''}
                ${formData.specialNotes ? `
                  <div style="margin-bottom: 16px;">
                    <p style="font-weight: 600; margin-bottom: 4px;">Särskilda anmärkningar:</p>
                    <p>${formData.specialNotes}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

                   <!-- Kontaktuppgifter för frågor -->
          ${(formData.contactPersonQuestions || formData.contactPhoneQuestions || formData.contactEmailQuestions) ? `
            <div class="delivery-section">
              <h3>Kontaktuppgifter för frågor</h3>
              <div style="font-size: 14px; color: #333;">
                ${formData.contactPersonQuestions ? `<p><span style="font-weight: 600;">Kontaktperson:</span> ${formData.contactPersonQuestions}</p>` : ''}
                ${formData.contactPhoneQuestions ? `<p><span style="font-weight: 600;">Telefon:</span> ${formData.contactPhoneQuestions}</p>` : ''}
                ${formData.contactEmailQuestions ? `<p><span style="font-weight: 600;">E-post:</span> ${formData.contactEmailQuestions}</p>` : ''}
              </div>
            </div>
          ` : ''}

                   <!-- Övriga villkor -->
          ${formData.otherTerms ? `
            <div class="delivery-section">
              <h3>Övriga villkor</h3>
              <div style="font-size: 14px; color: #333;">
                ${formData.otherTerms}
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
             top: '15mm',
             right: '15mm', 
             bottom: '15mm',
             left: '15mm'
           },
           printBackground: true,
           preferCSSPageSize: true,
           displayHeaderFooter: false,
           scale: 1.0
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
