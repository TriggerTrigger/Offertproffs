'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackData {
  easyToUse: boolean | null;
  pdfWorks: boolean | null;
  looksProfessional: boolean | null;
  wouldRecommend: boolean | null;
  additionalComments: string;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    easyToUse: null,
    pdfWorks: null,
    looksProfessional: null,
    wouldRecommend: null,
    additionalComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleQuestionChange = (question: keyof FeedbackData, value: boolean) => {
    setFeedback(prev => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async () => {
    // Kontrollera att alla frågor är besvarade
    if (feedback.easyToUse === null || 
        feedback.pdfWorks === null || 
        feedback.looksProfessional === null || 
        feedback.wouldRecommend === null) {
      alert('Vänligen svara på alla frågor');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setFeedback({
            easyToUse: null,
            pdfWorks: null,
            looksProfessional: null,
            wouldRecommend: null,
            additionalComments: ''
          });
        }, 2000);
      } else {
        alert('Ett fel uppstod. Försök igen.');
      }
    } catch (error) {
      alert('Ett fel uppstod. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tack för din feedback!</h3>
            <p className="text-gray-600">Din åsikt hjälper oss att förbättra OffertProffs.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-600">
              Hjälp oss förbättra OffertProffs genom att svara på några korta frågor:
            </p>

            {/* Fråga 1 */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                1. Är OffertProffs lätt att använda?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleQuestionChange('easyToUse', true)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.easyToUse === true
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => handleQuestionChange('easyToUse', false)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.easyToUse === false
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Nej
                </button>
              </div>
            </div>

            {/* Fråga 2 */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                2. Fungerar PDF-genereringen bra?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleQuestionChange('pdfWorks', true)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.pdfWorks === true
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => handleQuestionChange('pdfWorks', false)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.pdfWorks === false
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Nej
                </button>
              </div>
            </div>

            {/* Fråga 3 */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                3. Ser offerterna professionella ut?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleQuestionChange('looksProfessional', true)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.looksProfessional === true
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => handleQuestionChange('looksProfessional', false)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.looksProfessional === false
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Nej
                </button>
              </div>
            </div>

            {/* Fråga 4 */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                4. Skulle du rekommendera OffertProffs till andra?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleQuestionChange('wouldRecommend', true)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.wouldRecommend === true
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => handleQuestionChange('wouldRecommend', false)}
                  className={`px-4 py-2 rounded-lg border ${
                    feedback.wouldRecommend === false
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Nej
                </button>
              </div>
            </div>

            {/* Frivilligt textfält */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Har du några förslag på förbättringar eller andra kommentarer? (Frivilligt)
              </p>
              <textarea
                value={feedback.additionalComments}
                onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
                placeholder="Skriv dina kommentarer här..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Submit-knapp */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-70"
              >
                {isSubmitting ? 'Skickar...' : 'Skicka feedback'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 