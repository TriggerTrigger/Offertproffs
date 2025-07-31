'use client';

import { useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface EmailModalProps {
  formData: any;
  selectedTemplate: string;
  onClose: () => void;
}

export default function EmailModal({ formData, selectedTemplate, onClose }: EmailModalProps) {
  const [emailData, setEmailData] = useState({
    to: formData.customerEmail || '',
    subject: `Offert ${formData.quoteNumber} från ${formData.companyName}`,
         message: `Hej ${formData.customerName || 'kund'},

Tack för ditt intresse! Bifogat finner du vår offert ${formData.quoteNumber}.

Vid frågor är du välkommen att kontakta oss.

Med vänliga hälsningar,
${formData.companyName}`
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Hjälpfunktioner för färger och beräkningar
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

  const generatePDFAsBase64 = async (): Promise<string> => {
    try {
      console.log('Starting PDF generation...');
      console.log('FormData keys:', Object.keys(formData));
      console.log('Selected template:', selectedTemplate);
      
      // Använd server-side PDF-generering
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          selectedTemplate,
        }),
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Kunde inte generera PDF: ${response.status} ${response.statusText}`);
      }

      // Hämta PDF som arrayBuffer och konvertera till base64
      const pdfBuffer = await response.arrayBuffer();
      
      if (pdfBuffer.byteLength === 0) {
        throw new Error('PDF är tom');
      }
      
      console.log('PDF generated successfully, size:', pdfBuffer.byteLength, 'bytes');
      
      // Konvertera ArrayBuffer till base64 - använd chunked approach för stora filer
      const uint8Array = new Uint8Array(pdfBuffer);
      let binary = '';
      const chunkSize = 8192; // Hantera i chunks för att undvika "too many arguments"
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk as any);
      }
      
      const base64 = btoa(binary);
      
      console.log('Generated PDF base64 length:', base64.length);
      console.log('PDF base64 preview:', base64.substring(0, 100) + '...');
      
      return base64;
      
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Förbättrad felhantering för PDF-generering
      let errorMessage = 'Okänt fel';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      throw new Error(`PDF-generering misslyckades: ${errorMessage}`);
    }
  };

  // --- SMTP via Misshosting ---
  const sendEmailSMTP = async () => {
    if (!emailData.to) {
      alert('E-postadress krävs');
      return;
    }

    setIsSending(true);
    setSendStatus('idle');

    try {
      const pdfBase64 = await generatePDFAsBase64();

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          pdfBase64,
          pdfFileName: `offert-${formData.quoteNumber}.pdf`,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Email API error:', errorText);
        throw new Error(`Kunde inte skicka e-post: ${res.status} ${res.statusText}`);
      }

      setSendStatus('success');

      // Spara offertnummer och öka för nästa
      const currentNumber = parseInt(formData.quoteNumber.split('-')[1] || '1');
      localStorage.setItem('lastQuoteNumber', (currentNumber + 1).toString());

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Email sending error:', err);
      setSendStatus('error');
      
      // Visa specifikt felmeddelande
      let errorMessage = 'Ett fel uppstod vid skickandet. Försök igen.';
      if (err instanceof Error) {
        errorMessage = `E-postfel: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `E-postfel: ${err}`;
      } else if (err && typeof err === 'object') {
        errorMessage = `E-postfel: ${JSON.stringify(err)}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Använd SMTP för e-postutskick
  const sendEmail = sendEmailSMTP;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Skicka offert via e-post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {sendStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    E-post skickad!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Offerten har skickats till {emailData.to}
                  </p>
                </div>
              </div>
            </div>
          )}

          {sendStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    Ett fel uppstod vid skickandet. Försök igen.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              Till:
            </label>
            <input
              type="email"
              id="to"
              value={emailData.to}
              onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="mottagare@exempel.se"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Ämne:
            </label>
            <input
              type="text"
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Meddelande:
            </label>
            <textarea
              id="message"
              rows={8}
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
                             <div className="ml-3">
                 <p className="text-sm text-blue-700">
                   Offerten kommer att bifogas som PDF-fil automatiskt.
                 </p>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={sendEmail}
            disabled={isSending || !emailData.to}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Skickar...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Skicka offert
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
