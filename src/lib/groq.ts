const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export async function analyzeImage(imageBase64: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ API key not found. Please add it to your .env file.");
    }

    const prompt = `Analyze the provided food photo and identify all visible ingredients. For each ingredient, estimate its weight in grams based on the portion size shown. If there are likely hidden or uncertain ingredients (e.g., oil in cooking, butter in a dish, or sauce not fully visible), include reasonable estimates for those as well, using typical culinary assumptions where necessary. Return the results in JSON format with a list of ingredients, each containing the name and estimated weight in grams. Example output: {'ingredients': [{'name': 'chicken', 'grams': 120}, {'name': 'rice', 'grams': 80}, {'name': 'butter', 'grams': 10}]}. Be precise and realistic with the weight estimates.`;

    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                url: imageBase64
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API Error:', error);
      throw new Error('Failed to analyze image with Groq API');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    
    if (!result) {
      throw new Error('No response from Groq API');
    }
    
    return result;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to analyze image with Groq API');
  }
}