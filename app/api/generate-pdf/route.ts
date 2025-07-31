
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { formData, selectedTemplate } = await req.json();

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

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Offert ${formData.quoteNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 32px; background-color: ${colors.bg}; padding: 20px; border-radius: 10px; }
          h1, h2, h3 { color: ${colors.primary}; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: ${colors.bg}; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${formData.companyName}</h1>
            <p>${formData.companyStreet}, ${formData.companyPostalCode} ${formData.companyCity}</p>
            <p>${formData.companyEmail}</p>
          </div>
          <div>
            <h2>Offert #${formData.quoteNumber}</h2>
            <p>Datum: ${formData.quoteDate}</p>
            <p>Giltig till: ${formData.validUntil}</p>
          </div>
        </div>

        ${formData.products?.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Benämning</th>
                <th>Antal</th>
                <th>Pris</th>
                <th>Rabatt %</th>
                <th>Moms %</th>
              </tr>
            </thead>
            <tbody>
              ${formData.products.map((p: any) => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.quantity}</td>
                  <td>${p.price}</td>
                  <td>${p.discount}</td>
                  <td>${p.vat}</td>
                </tr>`).join("")}
            </tbody>
          </table>` : ''}

        <p style="text-align:right; margin-top:40px;"><strong>Total: ${calculateTotal().toFixed(2)} kr</strong></p>
      </body>
      </html>
    `;

    const pdfRes = await fetch("https://din-pdf-server-url.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html })
    });

    if (!pdfRes.ok) throw new Error("Misslyckades att generera PDF");
    const pdfBuffer = await pdfRes.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="offert.pdf"',
      }
    });

  } catch (err) {
    console.error("Fel i PDF-generering:", err);
    return NextResponse.json({ error: 'PDF-generering misslyckades' }, { status: 500 });
  }
}
