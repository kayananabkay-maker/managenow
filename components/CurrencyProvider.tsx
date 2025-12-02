'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserPreferences } from '@/lib/actions/preferences.actions';

interface CurrencyContextType {
  currencySymbol: string;
  currencyCode: string;
  isLoading: boolean;
  refreshCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencySymbol: 'Rp',
  currencyCode: 'IDR',
  isLoading: true,
  refreshCurrency: async () => {},
});

export function CurrencyProvider({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId: string;
}) {
  const [currencySymbol, setCurrencySymbol] = useState('Rp');
  const [currencyCode, setCurrencyCode] = useState('IDR');
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrency = useCallback(async () => {
    try {
      const result = await getUserPreferences(userId);
      
      if (result.success && result.data) {
        const currency = result.data.currency;
        setCurrencyCode(currency);
        
        // Map currency codes to symbols
        const symbols: Record<string, string> = {
          'IDR': 'Rp',
          'USD': '$',
          'EUR': '€',
          'GBP': '£',
          'JPY': '¥',
          'SGD': 'S$',
          'MYR': 'RM',
        };
        
        setCurrencySymbol(symbols[currency] || currency);
      }
    } catch (error) {
      console.error('Error loading currency preferences:', error);
      // Fallback to default
      setCurrencyCode('IDR');
      setCurrencySymbol('Rp');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  const refreshCurrency = useCallback(async () => {
    await loadCurrency();
  }, [loadCurrency]);

  return (
    <CurrencyContext.Provider value={{ currencySymbol, currencyCode, isLoading, refreshCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
