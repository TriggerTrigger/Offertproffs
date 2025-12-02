import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';
import RefreshButton from './refresh-button';

// Gör sidan helt dynamisk så att ny feedback alltid syns direkt
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface Feedback {
  id: string;
  easyToUse: boolean;
  pdfWorks: boolean;
  looksProfessional: boolean;
  wouldRecommend: boolean;
  additionalComments?: string | null;
  createdAt: Date;
}

// Server-side data fetching
async function getFeedbackData(): Promise<Feedback[]> {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return feedback;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Feedback Admin'
};

export default async function FeedbackAdminPage() {
  const feedback = await getFeedbackData();

  const calculateStats = () => {
    if (feedback.length === 0) return null;

    const stats = {
      total: feedback.length,
      easyToUse: { yes: 0, no: 0 },
      pdfWorks: { yes: 0, no: 0 },
      looksProfessional: { yes: 0, no: 0 },
      wouldRecommend: { yes: 0, no: 0 },
      withComments: 0
    };

    feedback.forEach(item => {
      if (item.easyToUse) stats.easyToUse.yes++; else stats.easyToUse.no++;
      if (item.pdfWorks) stats.pdfWorks.yes++; else stats.pdfWorks.no++;
      if (item.looksProfessional) stats.looksProfessional.yes++; else stats.looksProfessional.no++;
      if (item.wouldRecommend) stats.wouldRecommend.yes++; else stats.wouldRecommend.no++;
      if (item.additionalComments && item.additionalComments.trim()) stats.withComments++;
    });

    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Feedback Översikt</h1>
            <p className="text-gray-600">Se vad användarna tycker om OffertProffs</p>
            <p className="text-sm text-gray-500">Senast uppdaterad: {new Date().toLocaleTimeString()}</p>
            <p className="text-xs text-gray-400">Klicka "Uppdatera" för att se senaste data</p>
            {/* FORCE UPDATE: Feedback Admin - 2025-08-01 15:32:49 */}
          </div>
          <div className="flex space-x-2">
            <a
              href={`/admin/feedback?t=${Date.now()}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Uppdatera</span>
            </a>
            <RefreshButton />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Totalt antal svar</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Lätt att använda</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Ja: {stats.easyToUse.yes}</span>
                  <span className="text-red-600">Nej: {stats.easyToUse.no}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.easyToUse.yes / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF fungerar</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Ja: {stats.pdfWorks.yes}</span>
                  <span className="text-red-600">Nej: {stats.pdfWorks.no}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.pdfWorks.yes / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ser professionellt ut</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-600">Ja: {stats.looksProfessional.yes}</span>
                  <span className="text-red-600">Nej: {stats.looksProfessional.no}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.looksProfessional.yes / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Alla Feedback-svar</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lätt att använda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF fungerar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ser professionellt ut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skulle rekommendera</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kommentarer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.createdAt).toLocaleDateString('sv-SE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.easyToUse 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.easyToUse ? 'Ja' : 'Nej'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.pdfWorks 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.pdfWorks ? 'Ja' : 'Nej'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.looksProfessional 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.looksProfessional ? 'Ja' : 'Nej'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.wouldRecommend 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.wouldRecommend ? 'Ja' : 'Nej'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.additionalComments ? (
                        <div className="max-w-xs">
                          <p className="text-gray-600">{item.additionalComments}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 