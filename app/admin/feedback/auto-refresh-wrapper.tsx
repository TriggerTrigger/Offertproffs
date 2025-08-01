'use client';

import { useEffect } from 'react';

interface AutoRefreshWrapperProps {
  children: React.ReactNode;
}

export default function AutoRefreshWrapper({ children }: AutoRefreshWrapperProps) {
  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
} 