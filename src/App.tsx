import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import Results from './components/Results';
import PhotographyTips from './components/PhotographyTips'; // Import the new component
import { AnalysisResult } from './types';
import { analyzeImage } from './lib/gemini';
import { fileToBase64 } from './lib/imageUtils'; // Import the new utility
import { ChevronDown, ChevronUp } from 'lucide-react'; // Keep these for now, will remove if not needed in App.tsx

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // const [isTipsExpanded, setIsTipsExpanded] = useState(false); // This state is now managed within PhotographyTips

  const performAnalysis = async (base64Image: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Get analysis from Gemini
      const analysisJson = await analyzeImage(base64Image);
      
      try {
        const analysis = JSON.parse(analysisJson);
        
        if (!analysis.ingredients || !Array.isArray(analysis.ingredients)) {
          throw new Error('Invalid response format');
        }

        // Ensure all ingredients have the required properties
        const enrichedIngredients = analysis.ingredients.map((ingredient: any) => ({
          ...ingredient,
          name: ingredient.name.toLowerCase(),
          grams: ingredient.grams || 0,
          calories: ingredient.calories || 0,
          accuracy_percentage: ingredient.accuracy_percentage || 0
        }));

        const result = {
          ingredients: enrichedIngredients,
          overall_accuracy_percentage: analysis.overall_accuracy_percentage || 0
        };

        // Auto-expand tips if accuracy is low - this logic will be moved to PhotographyTips if needed
        // if (result.overall_accuracy_percentage < 70) {
        //   setIsTipsExpanded(true);
        // }

        setResult(result);
      } catch (parseError) {
        console.error('Failed to parse analysis result:', analysisJson);
        throw new Error('Failed to parse the analysis result');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSelect = async (file: File) => {
    // Use the new utility function to convert file to base64
    const base64 = await fileToBase64(file);

    setCurrentImage(base64);
    setResult(null); // Clear any previous results
  };

  const handleAnalyze = () => {
    if (currentImage) {
      performAnalysis(currentImage);
    }
  };

  const handleReanalyze = () => {
    if (currentImage) {
      setResult(null);
      performAnalysis(currentImage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div 
        className="relative h-48 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=2000&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Food Calorie Estimator
            </h1>
            <p className="text-gray-200 text-lg">
              Snap a photo, get instant calorie estimates
            </p>
          </div>
        </div>
      </div>

      <div className="py-8 px-4">
        <div className="max-w-md mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!result && (
            <>
              <ImageUpload 
                onImageSelect={handleImageSelect} 
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
              {isAnalyzing && (
                <div className="mt-4 text-center text-gray-600">
                  Analyzing your food...
                </div>
              )}
            </>
          )}

          {result && (
            <div className="space-y-4">
              <Results result={result} />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setResult(null);
                    setCurrentImage(null);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  New Photo
                </button>
                <button
                  onClick={handleReanalyze}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reanalyze Photo
                </button>
              </div>
            </div>
          )}

          {/* Render the new PhotographyTips component */}
          <PhotographyTips />
        </div>
      </div>
    </div>
  );
}

export default App;
