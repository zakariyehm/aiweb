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

/**
 * Analyze food from image using Convex action (reads OpenAI API key from Convex environment variables)
 * @param uri - Local file URI of the image
 * @param analyzeAction - Convex action function to call (from useAction hook)
 * @param signal - Optional AbortSignal for cancellation
 */
export async function analyzeFoodFromImage(
  uri: string, 
  analyzeAction: (args: { imageBase64: string }) => Promise<Nutrition | { notFood: true }>,
  signal?: AbortSignal
): Promise<Nutrition | { notFood: true }> {
  try {
    console.log('[OpenAI] Starting food analysis...');
    
    // 1) Convert local file URI to base64
    const base64 = await fileUriToBase64(uri);
    console.log('[OpenAI] Prepared base64 image', { approxKB: Math.round(base64.length / 1.37 / 1024) });

    // Check if request was aborted before calling API
    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    // 2) Call Convex action which handles OpenAI API call server-side
    console.log('[OpenAI] Calling Convex action for OpenAI analysis...');
    const result = await analyzeAction({ imageBase64: base64 });

    // Check if request was aborted after response
    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    console.log('[OpenAI] Analysis complete:', result);
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

async function fileUriToBase64(uri: string): Promise<string> {
  // Use Expo FileSystem legacy API to read as base64
  const b64 = await FileSystem.readAsStringAsync(uri, { 
    encoding: FileSystem.EncodingType.Base64 
  });
  return b64;
}