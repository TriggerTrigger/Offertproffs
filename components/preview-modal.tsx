
'use client';

import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PreviewModalProps {
  formData: any;
  selectedTemplate: string;
  onClose: () => void;
}

export default function PreviewModal({ formData, selectedTemplate, onClose }: PreviewModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const getTemplateColors = (template: string) => {
    switch (template) {
      case '1': return { primary: '#3B82F6', secondary: '#1E40AF', bg: '#EFF6FF' };
      case '2': return { primary: '#10B981', secondary: '#047857', bg: '#ECFDF5' };
      case '3': return { primary: '#F59E0B', secondary: '#D97706', bg: '#FFFBEB' };
      case '4': return { primary: '#8B5CF6', secondary: '#7C3AED', bg: '#F3E8FF' };
      default: return { primary: '#3B82F6', secondary: '#1E40AF', bg: '#EFF6FF' };
    }
  };

  const colors = getTemplateColors(selectedTemplate);

  const calculateTotal = () => {
    return formData.products?.reduce((sum: number, product: any) => {
      const lineTotal = product.quantity * product.price;
      const discountAmount = lineTotal * (product.discount / 100);
      const afterDiscount = lineTotal - discountAmount;
      const vatAmount = afterDiscount * (product.vat / 100);
      return sum + afterDiscount + vatAmount;
    }, 0) || 0;
  };

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = contentRef.current;
      const opt = {
        margin: 10,
        filename: `offert-${formData.quoteNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Fel vid generering av PDF. Försök igen.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-semibold text-gray-800">Förhandsvisning av offert</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ladda ner PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div ref={contentRef} className="bg-white p-8" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8" style={{ backgroundColor: colors.bg, padding: '20px', borderRadius: '10px' }}>
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
                  {formData.companyName || 'Företagsnamn'}
                </h1>
                <div className="text-gray-600 space-y-1">
                  {(formData.companyStreet || formData.companyPostalCode || formData.companyCity) && (
                    <p>{[formData.companyStreet, formData.companyPostalCode, formData.companyCity].filter(Boolean).join(', ')}</p>
                  )}
                  {formData.companyPhone && <p>Tel: {formData.companyPhone}</p>}
                  {formData.companyEmail && <p>E-post: {formData.companyEmail}</p>}
                  {formData.companyOrgNr && <p>Org.nr: {formData.companyOrgNr}</p>}
                  {formData.companyVatNr && <p>Momsnr: {formData.companyVatNr}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>OFFERT</h2>
                <p className="text-gray-600">Nr: {formData.quoteNumber}</p>
                <p className="text-gray-600">Datum: {formData.quoteDate}</p>
                <p className="text-gray-600">Giltig till: {formData.validUntil}</p>
                {formData.validityPeriod && <p className="text-gray-600">Giltighetstid: {formData.validityPeriod}</p>}
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>Till:</h3>
              <div className="text-gray-700">
                {formData.customerCompany && <p className="font-semibold">{formData.customerCompany}</p>}
                {formData.customerName && <p>{formData.customerCompany ? 'Att: ' : ''}{formData.customerName}</p>}
                {(formData.customerStreet || formData.customerPostalCode || formData.customerCity) && (
                  <p>{[formData.customerStreet, formData.customerPostalCode, formData.customerCity].filter(Boolean).join(', ')}</p>
                )}
                {formData.customerEmail && <p>E-post: {formData.customerEmail}</p>}
                {formData.customerPhone && <p>Tel: {formData.customerPhone}</p>}
              </div>
            </div>

            {/* AI Generated Text */}
            {formData.aiGeneratedText && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-gray-700 whitespace-pre-wrap">{formData.aiGeneratedText}</div>
              </div>
            )}

            {/* Products Table */}
            {formData.products?.length > 0 && (
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: colors.primary }}>
                      <th className="text-left p-3 text-white">Benämning</th>
                      <th className="text-center p-3 text-white">Antal</th>
                      <th className="text-right p-3 text-white">Pris</th>
                      <th className="text-center p-3 text-white">Tidsuppskattning</th>
                      <th className="text-right p-3 text-white">Moms</th>
                      <th className="text-right p-3 text-white">Totalt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((product: any, index: number) => {
                      const lineTotal = product.quantity * product.price;
                      const discountAmount = lineTotal * (product.discount / 100);
                      const afterDiscount = lineTotal - discountAmount;
                      const vatAmount = afterDiscount * (product.vat / 100);
                      const total = afterDiscount + vatAmount;

                      return (
                        <tr key={product.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              {product.description && <p className="text-sm text-gray-600">{product.description}</p>}
                            </div>
                          </td>
                          <td className="p-3 text-center">{product.quantity}</td>
                          <td className="p-3 text-right">{product.price.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</td>
                          <td className="p-3 text-center text-sm">{product.timeEstimate || '-'}</td>
                          <td className="p-3 text-right">{product.vat}%</td>
                          <td className="p-3 text-right font-semibold">{total.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                  <div className="inline-block p-4 rounded-lg" style={{ backgroundColor: colors.bg }}>
                    <p className="text-xl font-bold" style={{ color: colors.primary }}>
                      Totalsumma: {calculateTotal().toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Leveransvillkor */}
            {(formData.deliveryTime || formData.deliveryMethod || formData.shippingCosts || formData.deliveryAddress) && (
              <div className="mb-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Leveransvillkor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  {formData.deliveryTime && (
                    <div>
                      <p className="font-semibold mb-1">Leveranstid:</p>
                      <p>{formData.deliveryTime}</p>
                    </div>
                  )}
                  {formData.deliveryMethod && (
                    <div>
                      <p className="font-semibold mb-1">Leveranssätt:</p>
                      <p>{formData.deliveryMethod}</p>
                    </div>
                  )}
                  {formData.shippingCosts && (
                    <div>
                      <p className="font-semibold mb-1">Fraktkostnader:</p>
                      <p>{formData.shippingCosts}</p>
                    </div>
                  )}
                  {formData.deliveryAddress && (
                    <div className="md:col-span-2">
                      <p className="font-semibold mb-1">Leveransadress:</p>
                      <p>{formData.deliveryAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Betalningsvillkor */}
            {(formData.paymentMethod || formData.paymentDueDate || formData.lateInterestRate || formData.paymentReference) && (
              <div className="mb-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Betalningsvillkor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  {formData.paymentMethod && (
                    <div>
                      <p className="font-semibold mb-1">Betalningsmetod:</p>
                      <p>{formData.paymentMethod}</p>
                    </div>
                  )}
                  {formData.paymentDueDate && (
                    <div>
                      <p className="font-semibold mb-1">Förfallotid:</p>
                      <p>{formData.paymentDueDate}</p>
                    </div>
                  )}
                  {formData.lateInterestRate && (
                    <div>
                      <p className="font-semibold mb-1">Dröjsmålsränta:</p>
                      <p>{formData.lateInterestRate}</p>
                    </div>
                  )}
                  {formData.paymentReference && (
                    <div>
                      <p className="font-semibold mb-1">Betalningsreferens:</p>
                      <p>{formData.paymentReference}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ROT/RUT-avdrag */}
            {(formData.rotDeduction || formData.rutDeduction) && (
              <div className="mb-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>ROT/RUT-avdrag</h3>
                <div className="text-sm text-gray-700">
                  {formData.rotDeduction && (
                    <div className="mb-2">
                      <p className="font-semibold text-green-600">✓ ROT-avdrag gäller (50% på arbetskostnad)</p>
                    </div>
                  )}
                  {formData.rutDeduction && (
                    <div className="mb-2">
                      <p className="font-semibold text-green-600">✓ RUT-avdrag gäller (50% på arbetskostnad)</p>
                    </div>
                  )}
                  {formData.deductionInfo && (
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <p className="font-semibold mb-1">Information om avdrag:</p>
                      <p>{formData.deductionInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tilläggsinformation */}
            {(formData.warranties || formData.additionalTerms || formData.specialNotes) && (
              <div className="mb-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Tilläggsinformation</h3>
                <div className="space-y-4 text-sm text-gray-700">
                  {formData.warranties && (
                    <div>
                      <p className="font-semibold mb-1">Garantier:</p>
                      <p>{formData.warranties}</p>
                    </div>
                  )}
                  {formData.additionalTerms && (
                    <div>
                      <p className="font-semibold mb-1">Övriga villkor:</p>
                      <p>{formData.additionalTerms}</p>
                    </div>
                  )}
                  {formData.specialNotes && (
                    <div>
                      <p className="font-semibold mb-1">Särskilda anmärkningar:</p>
                      <p>{formData.specialNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kontaktuppgifter för frågor */}
            {(formData.contactPersonQuestions || formData.contactPhoneQuestions || formData.contactEmailQuestions) && (
              <div className="mb-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Kontaktuppgifter för frågor</h3>
                <div className="text-sm text-gray-700">
                  {formData.contactPersonQuestions && <p><span className="font-semibold">Kontaktperson:</span> {formData.contactPersonQuestions}</p>}
                  {formData.contactPhoneQuestions && <p><span className="font-semibold">Telefon:</span> {formData.contactPhoneQuestions}</p>}
                  {formData.contactEmailQuestions && <p><span className="font-semibold">E-post:</span> {formData.contactEmailQuestions}</p>}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
