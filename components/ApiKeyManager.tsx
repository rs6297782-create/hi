'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeys {
  geminiApiKey: string;
  vercelToken: string;
}

export default function ApiKeyManager({ onKeysConfigured }: { onKeysConfigured: (keys: ApiKeys) => void }) {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pludoCoder_apiKeys');
    if (stored) {
      try {
        const keys = JSON.parse(stored);
        if (keys.geminiApiKey && keys.vercelToken) {
          setGeminiApiKey(keys.geminiApiKey);
          setVercelToken(keys.vercelToken);
          setIsConfigured(true);
          onKeysConfigured(keys);
        }
      } catch (e) {
        console.error('Failed to parse stored keys');
      }
    }
  }, [onKeysConfigured]);

  const handleSave = () => {
    if (!geminiApiKey.trim() || !vercelToken.trim()) {
      alert('Please enter both API keys');
      return;
    }

    const keys = { geminiApiKey: geminiApiKey.trim(), vercelToken: vercelToken.trim() };
    localStorage.setItem('pludoCoder_apiKeys', JSON.stringify(keys));
    setIsConfigured(true);
    onKeysConfigured(keys);
  };

  const handleClear = () => {
    localStorage.removeItem('pludoCoder_apiKeys');
    setGeminiApiKey('');
    setVercelToken('');
    setIsConfigured(false);
  };

  if (isConfigured) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-800">API Keys Configured</span>
        </div>
        <button
          onClick={handleClear}
          className="ml-auto text-sm text-green-700 hover:text-green-900 underline"
        >
          Change Keys
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Configure API Keys</h3>
          <p className="text-sm text-gray-600">
            To use Pludo Coder, you need to provide your own API keys. Your keys are stored securely in your browser.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gemini 2.0 Flash API Key
          </label>
          <div className="relative">
            <input
              type={showKeys ? 'text' : 'password'}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
          >
            Get your Gemini API key →
          </a>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vercel API Token
          </label>
          <div className="relative">
            <input
              type={showKeys ? 'text' : 'password'}
              value={vercelToken}
              onChange={(e) => setVercelToken(e.target.value)}
              placeholder="Enter your Vercel token"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
          <a
            href="https://vercel.com/account/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
          >
            Get your Vercel token →
          </a>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showKeys"
            checked={showKeys}
            onChange={(e) => setShowKeys(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showKeys" className="text-sm text-gray-600 cursor-pointer">
            Show API keys
          </label>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
        >
          Save & Continue
        </button>
      </div>
    </motion.div>
  );
}
