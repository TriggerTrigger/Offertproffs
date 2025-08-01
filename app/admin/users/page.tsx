'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  companyName?: string;
  firstLoginDate?: string;
  testPeriodEnd?: string;
  createdAt: string;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    // Kontrollera att det är admin som är inloggad
    try {
      const user = JSON.parse(userData);
      if (user.email !== 'info@offertproffs.nu') {
        router.push('/');
        return;
      }
    } catch (error) {
      router.push('/');
      return;
    }
    
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Kunde inte hämta användare');
      }
    } catch (error) {
      setError('Ett fel uppstod');
    } finally {
      setIsLoading(false);
    }
  };

  const extendTestPeriod = async (userId: string, days: number) => {
    try {
      const response = await fetch('/api/admin/users/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, days }),
      });
      
      if (response.ok) {
        fetchUsers(); // Uppdatera listan
      } else {
        setError('Kunde inte förlänga test-perioden');
      }
    } catch (error) {
      setError('Ett fel uppstod');
    }
  };

  const calculateDaysLeft = (testPeriodEnd?: string) => {
    if (!testPeriodEnd) return null;
    const endDate = new Date(testPeriodEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatus = (testPeriodEnd?: string) => {
    if (!testPeriodEnd) return 'Ej startad';
    const daysLeft = calculateDaysLeft(testPeriodEnd);
    if (daysLeft === null) return 'Ej startad';
    if (daysLeft < 0) return 'Utgången';
    if (daysLeft <= 3) return 'Snart utgången';
    return 'Aktiv';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktiv': return 'text-green-600 bg-green-100';
      case 'Snart utgången': return 'text-yellow-600 bg-yellow-100';
      case 'Utgången': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar användare...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test-användare</h1>
          <p className="text-gray-600">Hantera test-perioder för användare</p>
          {/* FORCE UPDATE: Users Admin - 2025-08-01 15:23:00 */}
          <button
            onClick={fetchUsers}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Uppdatera lista
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Alla användare</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Företag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Första inlogg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test-period slutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dagar kvar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const daysLeft = calculateDaysLeft(user.testPeriodEnd);
                  const status = getStatus(user.testPeriodEnd);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.companyName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.firstLoginDate 
                          ? new Date(user.firstLoginDate).toLocaleDateString('sv-SE')
                          : 'Ej inloggad'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.testPeriodEnd 
                          ? new Date(user.testPeriodEnd).toLocaleDateString('sv-SE')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {daysLeft !== null ? daysLeft : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => extendTestPeriod(user.id, 7)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            +7 dagar
                          </button>
                          <button
                            onClick={() => extendTestPeriod(user.id, 14)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            +14 dagar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 