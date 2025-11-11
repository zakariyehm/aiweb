import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';

export type Nutrition = {
  title: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  healthScore: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  servingSize?: string;
};

const extra = (Constants.expoConfig?.extra as any) ?? {};
// OpenAI API Key
const OPENAI_API_KEY =
  (extra.openaiApiKey as string | undefined) || (process.env.EXPO_PUBLIC_OPENAI_API_KEY as string | undefined);


export async function analyzeFoodFromImage(uri: string, signal?: AbortSignal): Promise<Nutrition | { notFood: true }> {
  // Check for OpenAI API Key
  if (!OPENAI_API_KEY) {
    console.error('[analyzeFoodFromImage] Missing OpenAI API key');
    throw new Error('Missing OpenAI API key. Provide openaiApiKey via app.config.ts extra or .env EXPO_PUBLIC_OPENAI_API_KEY');
  }

  try {
    console.log('[OpenAI] Starting food analysis...');
    
    // 1) Convert local file URI to base64
    const base64 = await fileUriToBase64(uri);
    console.log('[OpenAI] Prepared base64 image', { approxKB: Math.round(base64.length / 1.37 / 1024) });

    // 2) Call OpenAI Vision API with GPT-4 Vision
    const openaiUrl = 'https://api.openai.com/v1/chat/completions';
    
    const prompt = `Analyze this food image and provide detailed nutritional information. 

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format, no additional text:

{
  "isFood": true/false,
  "title": "Name of the food dish",
  "calories": number (total calories),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams, optional),
  "sugar": number (grams, optional),
  "sodium": number (mg, optional),
  "servingSize": "estimated serving size (e.g., '250g', '1 plate')"
}

If the image does not contain food, set "isFood" to false and set all nutrition values to 0.

For the nutritional values, estimate based on:
- Visual appearance and portion size
- Common serving sizes for that type of food
- Standard nutritional databases

Be as accurate as possible with your estimates. Provide realistic numbers for a typical serving of the food shown.`;

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.2,
    };

    console.log('[OpenAI] Sending request to OpenAI Vision API...');
    
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: signal,
    });

    // Check if request was aborted
    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OpenAI] HTTP error', { 
        status: response.status, 
        statusText: response.statusText,
        body: errorText.slice(0, 500) 
      });
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    
    // Check if request was aborted after response
    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }
    
    console.log('[OpenAI] Received response from OpenAI');

    // Extract the text content from OpenAI response
    const content = responseData.choices?.[0]?.message?.content;
    if (!content) {
      console.error('[OpenAI] No content in response', responseData);
      throw new Error('No content in OpenAI response');
    }

    console.log('[OpenAI] Response content:', content);

    // Parse the JSON response
    let nutritionData: any;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        nutritionData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('[OpenAI] Failed to parse JSON response', { content, error: parseError });
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('[OpenAI] Parsed nutrition data:', nutritionData);

    // Check if it's food
    if (!nutritionData.isFood) {
      console.warn('[OpenAI] Not food detected');
      return { notFood: true } as const;
    }

    // Calculate health score
    const healthScore = calculateHealthScore({
      calories: nutritionData.calories || 0,
      carbsG: nutritionData.carbs || 0,
      proteinG: nutritionData.protein || 0,
      fatG: nutritionData.fat || 0,
      fiberG: nutritionData.fiber || 0,
      sugarG: nutritionData.sugar || 0,
      sodiumMg: nutritionData.sodium || 0,
    });

    const result: Nutrition = {
      title: nutritionData.title || 'Food',
      calories: Math.round(nutritionData.calories || 0),
      carbsG: round1(nutritionData.carbs || 0),
      proteinG: round1(nutritionData.protein || 0),
      fatG: round1(nutritionData.fat || 0),
      healthScore,
      fiberG: round1(nutritionData.fiber || 0),
      sugarG: round1(nutritionData.sugar || 0),
      sodiumMg: Math.round(nutritionData.sodium || 0),
      servingSize: nutritionData.servingSize || '1 serving',
    };

    console.log('[OpenAI] Final result:', result);
    return result;
  } catch (error: any) {
    // Don't log AbortError as an error - it's expected when user cancels
    if (error?.name === 'AbortError' || error?.message?.includes('Aborted')) {
      console.log('[analyzeFoodFromImage] Request cancelled');
      throw error; // Re-throw so caller knows it was cancelled
    }
    console.error('[analyzeFoodFromImage] Failed', error);
    throw error instanceof Error ? error : new Error('Unknown analysis error');
  }
}


function calculateHealthScore(nutrition: any): number {
  let score = 5; // Start with neutral score
  
  // Protein is good
  if (nutrition.proteinG > 10) score += 2;
  else if (nutrition.proteinG > 5) score += 1;
  
  // Fiber is good
  if (nutrition.fiberG > 3) score += 1;
  
  // Sugar is bad (in moderation)
  if (nutrition.sugarG > 20) score -= 2;
  else if (nutrition.sugarG > 10) score -= 1;
  
  // Sodium is bad (in moderation)
  if (nutrition.sodiumMg > 500) score -= 1;
  
  // Fat balance
  if (nutrition.fatG > 20) score -= 1;
  else if (nutrition.fatG > 10) score += 0;
  else score += 1;
  
  // Ensure score is between 0-10
  return Math.max(0, Math.min(10, score));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

async function fileUriToBase64(uri: string): Promise<string> {
  // Use Expo FileSystem legacy API to read as base64
  const b64 = await FileSystem.readAsStringAsync(uri, { 
    encoding: FileSystem.EncodingType.Base64 
  });
  return b64;
}