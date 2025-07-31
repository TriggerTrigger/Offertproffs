
export async function POST(request: Request) {
  try {
    const { companyName, customerCompany, products } = await request.json();

    const productList = products?.map((p: any) => `- ${p.name}: ${p.description || 'Ingen beskrivning'}`).join('\n') || 'Inga produkter angivna';

    const messages = [
      {
        role: "system",
        content: "Du är en professionell svensk affärsassistent som skriver offerttexter. Skriv alltid på svenska och använd en professionell, vänlig ton. Texten ska vara kort, tydlig och övertygande."
      },
      {
        role: "user",
        content: `Skriv en professionell offerttext på svenska för:

Från företag: ${companyName}
Till kund: ${customerCompany}

Produkter/tjänster:
${productList}

Texten ska vara cirka 100-150 ord, professionell men vänlig, och inkludera:
- Tack för intresset
- Kort beskrivning av vad vi erbjuder
- Varför kunden ska välja oss
- Uppmuntran att kontakta oss vid frågor

Skriv bara själva brödtexten, ingen rubrik eller underskrift.`
      }
    ];

    const apiKey = process.env.OPENAI_API_KEY;

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: messages,
    max_tokens: 500,
    temperature: 0.7
  }),
});

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
