import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsProps {
  result: AnalysisResult;
}

const ConfidencePieChart: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  const isLowAccuracy = percentage < 70;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="transform -rotate-90 w-14 h-14">
        {/* Background circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="fill-none stroke-gray-200"
          strokeWidth="5"
        />
        {/* Foreground circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          className={`fill-none ${isLowAccuracy ? 'stroke-red-500' : 'stroke-blue-500'}`}
          strokeWidth="5"
          strokeDasharray={strokeDasharray}
        />
      </svg>
      <span className={`absolute text-sm font-medium ${isLowAccuracy ? 'text-red-500' : ''}`}>
        {percentage}%
      </span>
    </div>
  );
};

export default function Results({ result }: ResultsProps) {
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const isLowAccuracy = (result.overall_accuracy_percentage || 0) < 70;
  
  const totalCalories = result.ingredients.reduce((sum, item) => {
    return sum + (item.calories || 0);
  }, 0);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
      
      <div className="space-y-6">
        {/* Summary Section - Always Visible */}
        <div className="space-y-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Calories</span>
            <span>{Math.round(totalCalories)} kcal</span>
          </div>
          
          <div className="flex justify-between items-center border-t border-b py-4">
            <div className="space-y-1">
              <h4 className="font-medium text-gray-700">Overall Analysis Confidence</h4>
              <p className="text-sm text-gray-500">Based on ingredient recognition and portion estimation</p>
            </div>
            <ConfidencePieChart percentage={result.overall_accuracy_percentage || 0} />
          </div>

          {isLowAccuracy && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <p className="text-red-700 font-medium">Low Accuracy Warning</p>
              <p className="text-red-600 text-sm">
                The analysis confidence is below 70%. For more accurate results, you can:
              </p>
              <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                <li>Try reanalyzing the current photo</li>
                <li>Take a new photo following our photography tips below</li>
              </ul>
            </div>
          )}
        </div>

        {/* Collapsible Ingredients Section */}
        <div className="space-y-4">
          <button
            onClick={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
            className="w-full flex items-center justify-between py-2 text-left text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg font-medium">Ingredient Details</span>
            {isIngredientsExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          
          {isIngredientsExpanded && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm text-gray-500 pb-2 border-b">
                <span className="flex-1">Ingredient</span>
                <div className="flex gap-4 text-right">
                  <span className="w-20">Weight</span>
                  <span className="w-24">Calories</span>
                  <span className="w-20">Accuracy</span>
                </div>
              </div>
              
              {result.ingredients.map((ingredient, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span className="capitalize flex-1">{ingredient.name}</span>
                  <div className="flex gap-4 text-right">
                    <span className="text-gray-600 w-20">{ingredient.grams}g</span>
                    <span className="text-gray-600 w-24">{ingredient.calories} kcal</span>
                    <span className="text-gray-600 w-20">{ingredient.accuracy_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}