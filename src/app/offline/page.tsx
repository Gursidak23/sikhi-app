'use client';

/**
 * Offline Page — Shown when user is offline and content isn't cached
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-redirect when back online
      setTimeout(() => window.location.reload(), 1000);
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#fef9e7] to-[#fef3c7] p-6">
      <div className="text-center max-w-md">
        {/* Ik Onkar */}
        <div className="text-6xl text-neela-700 mb-4 font-gurmukhi">ੴ</div>
        
        <h1 className="text-2xl font-gurmukhi text-amber-900 mb-2">
          ਆਫ਼ਲਾਈਨ ਮੋਡ
        </h1>
        
        <p className="text-amber-700 mb-6 font-gurmukhi">
          ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਨਹੀਂ ਮਿਲ ਰਿਹਾ। ਸੇਵ ਕੀਤੀ ਸਮੱਗਰੀ ਅਜੇ ਵੀ ਉਪਲਬਧ ਹੈ।
        </p>
        
        <p className="text-amber-600 text-sm mb-8">
          You appear to be offline. Saved content is still available.
        </p>

        {/* Available offline sections */}
        <div className="space-y-3 mb-8">
          <Link href="/gurbani" className="block w-full px-4 py-3 bg-neela-600 text-white rounded-xl hover:bg-neela-700 transition-colors font-gurmukhi">
            📖 ਗੁਰਬਾਣੀ (ਸੇਵ ਕੀਤੇ ਅੰਗ)
          </Link>
          <Link href="/nitnem" className="block w-full px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-gurmukhi">
            🙏 ਨਿਤਨੇਮ ਬਾਣੀਆਂ
          </Link>
          <Link href="/itihaas" className="block w-full px-4 py-3 bg-kesri-600 text-white rounded-xl hover:bg-kesri-700 transition-colors font-gurmukhi">
            📜 ਇਤਿਹਾਸ
          </Link>
        </div>

        {/* Status indicator */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          {isOnline ? 'ਵਾਪਸ ਔਨਲਾਈਨ — ਰੀਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'ਆਫ਼ਲਾਈਨ'}
        </div>
      </div>
    </div>
  );
}
