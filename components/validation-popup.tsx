
'use client';

import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ValidationPopupProps {
  errors: string[];
  onClose: () => void;
  onContinueAnyway: () => void;
}

export default function ValidationPopup({ errors, onClose, onContinueAnyway }: ValidationPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-semibold text-gray-800">Ofullständig information</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Du har inte fyllt i alla obligatoriska uppgifter. Vill du fortsätta ändå?
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Saknade fält:</p>
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {errors.map((error, index) => (
                <li key={index} className="flex items-center space-x-2 text-red-600 text-sm">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-between p-6 border-t bg-gray-50 rounded-b-2xl space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Gå tillbaka och fyll i
          </button>
          <button
            onClick={onContinueAnyway}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fortsätt ändå
          </button>
        </div>
      </div>
    </div>
  );
}
