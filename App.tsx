
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { ContextForm } from './components/ContextForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { analyzePhytolith } from './services/geminiService';
import type { FormData, AnalysisResult } from './types';

type AppState = 'FORM' | 'ANALYZING' | 'RESULTS' | 'ERROR';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('FORM');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [image, setImage] = useState<{ file: File; previewUrl: string } | null>(null);

  const handleAnalysis = useCallback(async (formData: FormData) => {
    if (!image) {
      setError("Image not found. Please upload an image.");
      setAppState('ERROR');
      return;
    }

    setAppState('ANALYZING');
    setError(null);

    try {
      const result = await analyzePhytolith(image.file, formData);
      setAnalysisResult(result);
      setAppState('RESULTS');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      setAppState('ERROR');
    }
  }, [image]);

  const handleNewAnalysis = () => {
    setAppState('FORM');
    setAnalysisResult(null);
    setImage(null);
    setError(null);
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'ANALYZING':
        return <Loader />;
      case 'RESULTS':
        return analysisResult && image ? (
          <ResultsDisplay 
            result={analysisResult} 
            imagePreviewUrl={image.previewUrl} 
            onNewAnalysis={handleNewAnalysis} 
          />
        ) : null;
      case 'ERROR':
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleNewAnalysis}
              className="px-6 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      case 'FORM':
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <ImageUpload onImageUpload={setImage} image={image} />
              <ContextForm onFormSubmit={handleAnalysis} isImageUploaded={!!image} />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="bg-white min-h-screen text-black">
      <Header />
      {renderContent()}
    </div>
  );
};

export default App;
