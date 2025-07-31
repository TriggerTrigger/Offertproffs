
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OffertForm from '../../components/offert-form';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';

export default function OffertPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('1');

  useEffect(() => {
    const template = localStorage.getItem('selectedTemplate');
    if (template) {
      setSelectedTemplate(template);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Skapa ny offert</h1>
                <p className="text-gray-600">Fyll i informationen nedan för att skapa din offert</p>
              </div>
              
              <OffertForm selectedTemplate={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
