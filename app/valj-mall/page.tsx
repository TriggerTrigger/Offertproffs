
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/header';

const templates = [
  {
    id: 1,
    name: 'Modern Blå',
    color: 'bg-blue-500',
    preview: 'Elegant blå design med professionell layout',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Grön Naturlig',
    color: 'bg-green-500',
    preview: 'Naturinspirerad grön design för miljömedvetna företag',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    name: 'Orange Energi',
    color: 'bg-orange-500',
    preview: 'Energisk orange design som fångar uppmärksamhet',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 4,
    name: 'Lila Kreativ',
    color: 'bg-purple-500',
    preview: 'Kreativ lila design för innovativa företag',
    gradient: 'from-purple-500 to-purple-600'
  }
];

export default function ValjMallPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const handleSelectTemplate = (templateId: number) => {
    localStorage.setItem('selectedTemplate', templateId.toString());
    router.push('/offert');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Välj Offertmall</h2>
          <p className="text-gray-600 text-lg">Välj en professionell mall för dina offerter</p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Template Preview */}
              <div className={`h-48 bg-gradient-to-br ${template.gradient} p-6 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
                  <p className="text-white/90">{template.preview}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-4 h-4 rounded-full ${template.color}`}></div>
                    <span className="font-semibold text-gray-800">{template.name}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{template.preview}</p>
                </div>

                <button
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`w-full bg-gradient-to-r ${template.gradient} text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200`}
                >
                  Välj denna mall
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
