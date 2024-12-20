'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type KidsModeContextType = {
  isKidsMode: boolean;
  toggleKidsMode: () => void;
};

const KidsModeContext = createContext<KidsModeContextType | undefined>(undefined);

export const KidsModeProvider = ({ children }: { children: ReactNode }) => {
  const [isKidsMode, setIsKidsMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 状態が初期化されたかを追跡

  const toggleKidsMode = () => {
    const newState = !isKidsMode;
    setIsKidsMode(newState);
    if (typeof window !== 'undefined') {
      localStorage?.setItem('isKidsMode', JSON.stringify(newState));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem('isKidsMode');
      if (storedState !== null) {
        setIsKidsMode(JSON.parse(storedState));
      }
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <KidsModeContext.Provider value={{ isKidsMode, toggleKidsMode }}>{children}</KidsModeContext.Provider>;
};

export const useKidsMode = () => {
  const context = useContext(KidsModeContext);

  if (context === undefined) {
    throw new Error('useKidsMode must be used within a KidsModeProvider');
  }

  return context;
};
