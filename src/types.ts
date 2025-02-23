export interface Ingredient {
  name: string;
  grams: number;
  calories?: number; // calories per 100g
  accuracy_percentage?: number; // confidence level in the analysis
}

export interface AnalysisResult {
  ingredients: Ingredient[];
  overall_accuracy_percentage?: number;
}