import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 0.1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

export async function analyzeImage(imageBase64: string): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please add it to your .env file.");
    }

    // Remove the data URL prefix if present
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const prompt = `Analyze the food photo to determine its calorific content.

**Instructions:**

* **Identify all visible ingredients and infer likely hidden ingredients.** (e.g., cooking oil, butter, sauces, dressings, seasonings).
* **For each ingredient, estimate:**
    * **Name:** Be specific (e.g., "grilled chicken breast" instead of just "chicken").
    * **Weight (grams):** Based on portion size in the photo.
    * **Calories:** Based on estimated weight and typical calorific values.
    * **Accuracy Percentage:**  A percentage indicating your confidence in the ingredient identification and weight/calorie estimation (e.g., 80% if highly confident, 60% if less certain).
* **For hidden ingredients, justify your estimation based on visual cues and common culinary practices.**
* **Provide an overall accuracy percentage** for the entire analysis, considering all ingredients.
* **Return the results in JSON format:**

json
{
  "ingredients": [
    {
      "name": "...",
      "grams": ...,
      "calories": ...,
      "accuracy_percentage": ...
    },
    ...
  ],
  "overall_accuracy_percentage": ...
}`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      },
      { text: prompt }
    ]);

    const response = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    return jsonMatch[0];
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze image with Gemini API');
  }
}