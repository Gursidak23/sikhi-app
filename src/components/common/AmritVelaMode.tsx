'use client';

// ============================================================================
// AMRIT VELA (AMBROSIAL HOURS) THEME PROVIDER
// ============================================================================
// Auto-switches to a special serene theme between 1 AM - 6 AM
// Overrides dark mode with a deep blue, meditative color scheme
// ============================================================================

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface AmritVelaContextType {
  isAmritVela: boolean;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  timeUntilAmritVela: string;
}

const AmritVelaContext = createContext<AmritVelaContextType>({
  isAmritVela: false,
  enabled: true,
  setEnabled: () => {},
  timeUntilAmritVela: '',
});

export function useAmritVela() {
  return useContext(AmritVelaContext);
}

function checkAmritVela(): boolean {
  const hour = new Date().getHours();
  return hour >= 1 && hour < 6;
}

function getTimeUntilAmritVela(): string {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 1 && hour < 6) return 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਚੱਲ ਰਿਹਾ ਹੈ';
  
  // Calculate time until 1 AM
  const target = new Date(now);
  if (hour >= 6) {
    target.setDate(target.getDate() + 1);
  }
  target.setHours(1, 0, 0, 0);
  
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

export function AmritVelaProvider({ children }: { children: ReactNode }) {
  const [isAmritVela, setIsAmritVela] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [timeUntilAmritVela, setTimeUntilAmritVela] = useState('');

  // Load preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sikhi-amritvela-mode');
      if (saved === 'false') setEnabled(false);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      setIsAmritVela(checkAmritVela());
      setTimeUntilAmritVela(getTimeUntilAmritVela());
    };
    
    update();
    const interval = setInterval(update, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sikhi-amritvela-mode', String(enabled));
    }
  }, [enabled]);

  // Apply Amrit Vela class to document
  useEffect(() => {
    if (enabled && isAmritVela) {
      document.documentElement.classList.add('amrit-vela');
    } else {
      document.documentElement.classList.remove('amrit-vela');
    }
    return () => {
      document.documentElement.classList.remove('amrit-vela');
    };
  }, [enabled, isAmritVela]);

  return (
    <AmritVelaContext.Provider value={{ isAmritVela, enabled, setEnabled, timeUntilAmritVela }}>
      {children}
    </AmritVelaContext.Provider>
  );
}

// Mini toggle for Nav / Settings
export function AmritVelaToggle({ className }: { className?: string }) {
  const { isAmritVela, enabled, setEnabled, timeUntilAmritVela } = useAmritVela();

  return (
    <div className={className}>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all min-h-[44px] ${
          enabled
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
        }`}
        title={`Amrit Vela Mode: ${enabled ? 'ON' : 'OFF'}\n${isAmritVela ? 'Active now!' : `Next: ${timeUntilAmritVela}`}`}
      >
        <span>{isAmritVela && enabled ? '🌙' : '⏰'}</span>
        <span className="hidden sm:inline">
          {isAmritVela && enabled ? 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ' : 'Amrit Vela'}
        </span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-indigo-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
      </button>
    </div>
  );
}
