import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import Results from './components/Results';
import { AnalysisResult } from './types';
import { analyzeImage } from './lib/gemini';
import { ChevronDown, ChevronUp } from 'lucide-react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);

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

        // Auto-expand tips if accuracy is low
        if (result.overall_accuracy_percentage < 70) {
          setIsTipsExpanded(true);
        }

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
    // Convert image to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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

          {/* Tips Section */}
          <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setIsTipsExpanded(!isTipsExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Tips to improve your photo accuracy
                </h2>
                <p className="text-sm text-gray-500">
                  Learn how to take photos that give you the most accurate results
                </p>
              </div>
              {isTipsExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {isTipsExpanded && (
              <div className="p-4 bg-gray-50 space-y-4 text-gray-700">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Lighting is Key</h3>
                    <p>Natural light is ideal. If indoors, try to photograph near a window. Avoid using your camera's flash if it creates strong shadows. Well-lit food is easier to analyze.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Show Everything</h3>
                    <p>Ensure all parts of your meal are visible. If items are stacked or hidden, try to spread them out slightly so they can be identified.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">One Plate, One Serving</h3>
                    <p>Focus on a single portion of food. This helps us accurately estimate the quantities.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Keep it Simple</h3>
                    <p>A plain, uncluttered background helps our system focus on the food itself. A solid-colored plate or placemat works well.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">The Right Angle</h3>
                    <p>A top-down photo (taken directly above the food) provides the best view for analysis. Avoid angled shots, as they can distort the perceived size of the portions.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">Size Matters (Optional)</h3>
                    <p>For even better accuracy, you can include a reference object of known size (like a standard fork, spoon, or credit card) next to the food. This helps us understand the scale of the meal. Place the object beside the food, not on top of it.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">No Filters, Please</h3>
                    <p>For the most accurate analysis, please upload photos without any filters applied. Filters can alter colors and make it harder to identify ingredients.</p>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">Important Reminder</p>
                    <p className="text-blue-600">Please remember that calorie estimations are approximate and intended for informational purposes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;