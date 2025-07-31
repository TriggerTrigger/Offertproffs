
'use client';

import { useState } from 'react';
import { CheckCircleIcon, DocumentTextIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

const sidebarItems = [
  { id: 'company', label: 'Företagsinfo', icon: CogIcon, completed: false },
  { id: 'customer', label: 'Kundinfo', icon: UserIcon, completed: false },
  { id: 'details', label: 'Offertdetaljer', icon: DocumentTextIcon, completed: false },
  { id: 'products', label: 'Produkter/Tjänster', icon: DocumentTextIcon, completed: false },
  { id: 'terms', label: 'Villkor', icon: DocumentTextIcon, completed: false },
];

export default function Sidebar() {
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    if (completedSections.includes(sectionId)) {
      setCompletedSections(completedSections.filter(id => id !== sectionId));
    } else {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg h-screen sticky top-16 border-r">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Framsteg</h3>
        
        <div className="space-y-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isCompleted = completedSections.includes(item.id);
            
            return (
              <div
                key={item.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  isCompleted 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleSection(item.id)}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <Icon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <span className={`font-medium ${
                  isCompleted ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Tips</h4>
          <p className="text-sm text-blue-600">
            Klicka på sektionerna ovan för att markera dem som färdiga. 
            Detta hjälper dig att hålla koll på dina framsteg.
          </p>
        </div>
      </div>
    </div>
  );
}
