import React, { createContext, useContext, useState, useCallback } from 'react';
import { SentimentConfig, DEFAULT_SENTIMENT_CONFIG, SentimentResult } from '@/lib/sentiment';

interface SentimentContextType {
  config: SentimentConfig;
  updateConfig: (config: SentimentConfig) => void;
  resetConfig: () => void;
  conversationHistory: Array<{
    id: string;
    text: string;
    language: 'vi' | 'en';
    sentiment: SentimentResult;
    timestamp: number;
  }>;
  addToHistory: (item: {
    text: string;
    language: 'vi' | 'en';
    sentiment: SentimentResult;
  }) => void;
  clearHistory: () => void;
}

const SentimentContext = createContext<SentimentContextType | undefined>(undefined);

export function SentimentProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SentimentConfig>(DEFAULT_SENTIMENT_CONFIG);
  const [conversationHistory, setConversationHistory] = useState<SentimentContextType['conversationHistory']>([]);

  const updateConfig = useCallback((newConfig: SentimentConfig) => {
    setConfig(newConfig);
    // Save to localStorage
    localStorage.setItem('sentimentConfig', JSON.stringify(newConfig));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_SENTIMENT_CONFIG);
    localStorage.removeItem('sentimentConfig');
  }, []);

  const addToHistory = useCallback((item: {
    text: string;
    language: 'vi' | 'en';
    sentiment: SentimentResult;
  }) => {
    setConversationHistory(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        ...item,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  // Load config from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('sentimentConfig');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load sentiment config:', e);
      }
    }
  }, []);

  return (
    <SentimentContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        conversationHistory,
        addToHistory,
        clearHistory,
      }}
    >
      {children}
    </SentimentContext.Provider>
  );
}

export function useSentiment() {
  const context = useContext(SentimentContext);
  if (!context) {
    throw new Error('useSentiment must be used within SentimentProvider');
  }
  return context;
}
