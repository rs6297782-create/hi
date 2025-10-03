'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ApiKeys {
  geminiApiKey: string;
  vercelToken: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

function GenerationPageContent() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pludoCoder_apiKeys');
    if (stored) {
      try {
        const keys = JSON.parse(stored);
        setApiKeys(keys);
      } catch (e) {
        router.push('/');
      }
    } else {
      router.push('/');
    }

    const initialPrompt = sessionStorage.getItem('initialPrompt');
    if (initialPrompt) {
      setPrompt(initialPrompt);
      sessionStorage.removeItem('initialPrompt');
      setTimeout(() => handleGenerate(initialPrompt), 500);
    }
  }, [router]);

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim() || !apiKeys) return;

    setIsGenerating(true);
    setGeneratedFiles([]);
    setDeploymentUrl(null);
    setGenerationProgress('Initializing generation...');

    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          apiKey: apiKeys.geminiApiKey
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let currentFiles: GeneratedFile[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setGenerationProgress(data.message);
              } else if (data.type === 'file') {
                const file: GeneratedFile = {
                  path: data.path,
                  content: data.content,
                  language: getLanguageFromPath(data.path)
                };
                currentFiles.push(file);
                setGeneratedFiles([...currentFiles]);
                if (!selectedFile) setSelectedFile(file.path);
              } else if (data.type === 'complete') {
                setGenerationProgress('Generation complete!');
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationProgress('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async () => {
    if (!apiKeys || generatedFiles.length === 0) return;

    setIsDeploying(true);
    setGenerationProgress('Deploying to Vercel...');

    try {
      const response = await fetch('/api/deploy-vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: generatedFiles.map(f => ({ path: f.path, content: f.content })),
          vercelToken: apiKeys.vercelToken
        })
      });

      if (!response.ok) throw new Error('Deployment failed');

      const data = await response.json();
      setDeploymentUrl(data.url);
      setGenerationProgress('Deployed successfully!');
    } catch (error) {
      console.error('Deployment error:', error);
      setGenerationProgress('Deployment failed. Please check your Vercel token.');
    } finally {
      setIsDeploying(false);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'js': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    };
    return langMap[ext || ''] || 'text';
  };

  const selectedFileContent = generatedFiles.find(f => f.path === selectedFile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Pludo Coder</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left Panel - Code Editor */}
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-slate-900/80 px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Generated Code</h2>
            </div>

            {/* Prompt Input */}
            <div className="p-4 border-b border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                  placeholder="Describe what you want to build..."
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {generationProgress && (
                <p className="mt-2 text-sm text-blue-300">{generationProgress}</p>
              )}
            </div>

            {/* File Explorer */}
            {generatedFiles.length > 0 && (
              <div className="flex-shrink-0 px-4 py-3 border-b border-white/10">
                <div className="flex flex-wrap gap-2">
                  {generatedFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file.path)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedFile === file.path
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {file.path.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Code Display */}
            <div className="flex-1 overflow-auto">
              {selectedFileContent ? (
                <SyntaxHighlighter
                  language={selectedFileContent.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent',
                    fontSize: '14px'
                  }}
                  showLineNumbers
                >
                  {selectedFileContent.content}
                </SyntaxHighlighter>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No code generated yet. Enter a prompt to get started!</p>
                </div>
              )}
            </div>

            {/* Deploy Button */}
            {generatedFiles.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  {isDeploying ? 'Deploying...' : '🚀 Deploy to Vercel'}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-slate-900/80 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Live Preview</h2>
              {deploymentUrl && (
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Open in new tab →
                </a>
              )}
            </div>

            <div className="flex-1 bg-white">
              {deploymentUrl ? (
                <iframe
                  ref={iframeRef}
                  src={deploymentUrl}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-lg font-medium">Preview will appear here</p>
                    <p className="text-sm mt-2">Generate code and deploy to see your website</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GenerationPageContent />
    </Suspense>
  );
}
