'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ApiKeyManager from '@/components/ApiKeyManager';

interface ApiKeys {
  geminiApiKey: string;
  vercelToken: string;
}

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const router = useRouter();

  const handleKeysConfigured = (keys: ApiKeys) => {
    setApiKeys(keys);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!apiKeys) {
      alert('Please configure your API keys first');
      return;
    }

    sessionStorage.setItem('initialPrompt', prompt);
    router.push('/generation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <span className="text-3xl font-bold text-white">P</span>
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pludo Coder
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered website generation with instant deployment
          </p>
        </motion.header>

        {/* API Keys Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <ApiKeyManager onKeysConfigured={handleKeysConfigured} />
        </motion.div>

        {/* Main Input Form */}
        {apiKeys && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              What would you like to build?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to create... (e.g., 'A modern portfolio website with a hero section, projects gallery, and contact form')"
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-gray-800"
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                Generate Website →
              </button>
            </form>
          </motion.div>
        )}

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: '⚡',
              title: 'AI-Powered',
              description: 'Uses Gemini 2.0 Flash for fast, intelligent code generation'
            },
            {
              icon: '🚀',
              title: 'Instant Deploy',
              description: 'Automatically deploys to Vercel for immediate preview'
            },
            {
              icon: '💎',
              title: 'Production Ready',
              description: 'Generates clean, modern code with best practices'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>Powered by Gemini 2.0 Flash AI & Vercel Deployment</p>
        </motion.footer>
      </div>
    </div>
  );
}
