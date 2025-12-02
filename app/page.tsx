
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Fyll i både email och lösenord');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Spara användardata i localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        const isAdmin = data.user?.email === 'info@offertproffs.nu';
        router.push(isAdmin ? '/admin/users' : '/valj-mall');
      } else {
        setError(data.error || 'Inloggning misslyckades');
      }
    } catch (error) {
      setError('Ett fel uppstod vid inloggning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Bakgrundsbild */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Kontorsmiljö"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
      </div>

      {/* Login Box */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Logotyp */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">OffertProffs</h1>
            <p className="text-gray-600">
              Skapa konto eller logga in direkt – endast e-post & lösenord
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6 mt-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <input
                type="email"
                placeholder="E-postadress"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-70"
            >
              {isLoading ? 'Startar...' : 'Starta OffertProffs'}
            </button>
            <p className="text-sm text-gray-500">
              Inga verifieringsmejl behövs – ditt konto skapas automatiskt första gången.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
