
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import FeedbackModal from './feedback-modal';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Fel vid laddning av användardata:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('companyData');
    router.push('/');
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">OffertProffs</h1>
            <span className="text-sm text-gray-500">Professionell Offertplattform</span>
            {user && (
              <span className="text-sm text-gray-600">
                Inloggad som: {user.companyName || user.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFeedback(true)}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Feedback
            </button>
            <button
              onClick={() => router.push('/valj-mall')}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Byt mall
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Logga ut
            </button>
          </div>
        </div>
      </div>
      
      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
    </div>
  );
}
