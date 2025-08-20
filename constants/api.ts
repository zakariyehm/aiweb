import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

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
// Prefer values injected by app.config.ts extra, but also support EXPO_PUBLIC_* envs
const GOOGLE_API_KEY =
  (extra.googleApiKey as string | undefined) || (process.env.EXPO_PUBLIC_GOOGLE_API_KEY as string | undefined);
const USDA_API_KEY =
  (extra.usdaApiKey as string | undefined) || (process.env.EXPO_PUBLIC_USDA_API_KEY as string | undefined);

// Enhanced food detection keywords
const FOOD_KEYWORDS = [
  'food', 'dish', 'cuisine', 'meal', 'ingredient', 'vegetable', 'fruit', 
  'dessert', 'sandwich', 'pizza', 'pasta', 'rice', 'bread', 'meat', 'fish',
  'chicken', 'beef', 'pork', 'lamb', 'salad', 'soup', 'stew', 'curry',
  'cake', 'cookie', 'ice cream', 'yogurt', 'cheese', 'milk', 'egg',
  'potato', 'tomato', 'onion', 'carrot', 'broccoli', 'spinach', 'lettuce',
  'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry',
  'coffee', 'tea', 'juice', 'smoothie', 'shake', 'drink', 'beverage',
  'snack', 'chips', 'nuts', 'seeds', 'cereal', 'oatmeal', 'granola',
  'pancake', 'waffle', 'toast', 'bagel', 'muffin', 'donut', 'pastry',
  'burger', 'hot dog', 'taco', 'burrito', 'sushi', 'noodles', 'dumpling',
  'pie', 'pudding', 'gelato', 'sorbet', 'chocolate', 'candy', 'gum',
  'sauce', 'dressing', 'spread', 'butter', 'oil', 'vinegar', 'spice',
  'herb', 'seasoning', 'condiment', 'relish', 'pickle', 'olive'
];

// Non-food keywords that should definitely not be considered food
const NON_FOOD_KEYWORDS = [
  'textile', 'fabric', 'cloth', 'clothing', 'shirt', 'pants', 'dress',
  'electronic', 'device', 'gadget', 'computer', 'phone', 'tablet',
  'furniture', 'chair', 'table', 'desk', 'bed', 'sofa', 'couch',
  'building', 'house', 'office', 'room', 'wall', 'floor', 'ceiling',
  'vehicle', 'car', 'truck', 'bike', 'motorcycle', 'bus', 'train',
  'animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'horse',
  'plant', 'tree', 'flower', 'grass', 'bush', 'shrub',
  'tool', 'hammer', 'screwdriver', 'wrench', 'pliers',
  'book', 'magazine', 'newspaper', 'document', 'paper'
];

export async function analyzeFoodFromImage(uri: string): Promise<Nutrition | { notFood: true }> {
  // Basic runtime diagnostics (do not log secrets)
  if (!GOOGLE_API_KEY || !USDA_API_KEY) {
    console.error('[analyzeFoodFromImage] Missing API keys', {
      hasGoogleKey: Boolean(GOOGLE_API_KEY),
      hasUsdaKey: Boolean(USDA_API_KEY),
    });
    throw new Error('Missing API keys. Provide googleApiKey/usdaApiKey via app.config.ts extra or .env EXPO_PUBLIC_* vars.');
  }

  try {
    // 1) Convert local file URI to base64 for Google Vision
    const base64 = await fileUriToBase64(uri);
    console.log('[Vision] Prepared base64 image', { approxKB: Math.round(base64.length / 1.37 / 1024) });

    // 2) Call Google Vision to label the image and detect objects
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(GOOGLE_API_KEY)}`;
    const visionBody = {
      requests: [
        {
          image: { content: base64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 15 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
            { type: 'WEB_DETECTION', maxResults: 10 },
          ],
        },
      ],
    };

    const visionResp = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visionBody),
    });
    
    if (!visionResp.ok) {
      const txt = await visionResp.text();
      console.error('[Vision] HTTP error', { status: visionResp.status, body: txt.slice(0, 500) });
      throw new Error(`Vision error: ${visionResp.status} ${txt}`);
    }
    
    const visionJson = (await visionResp.json()) as any;
    const labels: string[] = (visionJson?.responses?.[0]?.labelAnnotations || [])
      .map((l: any) => String(l.description).toLowerCase());
    
    // Also check web detection for better food identification
    const webLabels: string[] = (visionJson?.responses?.[0]?.webDetection?.webEntities || [])
      .map((e: any) => String(e.description).toLowerCase());
    
    const allLabels = [...labels, ...webLabels];
    console.log('[Vision] All Labels', allLabels);

    // Enhanced food detection
    const isFoodLikely = allLabels.some((label) =>
      FOOD_KEYWORDS.some((keyword) => label.includes(keyword))
    );

    // Check if it's definitely not food (but only if we don't have strong food indicators)
    const hasStrongFoodIndicators = allLabels.some((label) =>
      ['food', 'ingredient', 'meal', 'dish', 'cuisine'].includes(label)
    );
    
    const isDefinitelyNotFood = !hasStrongFoodIndicators && allLabels.some((label) =>
      NON_FOOD_KEYWORDS.some((keyword) => label.includes(keyword))
    );

    console.log('[Analysis] Food detection analysis:', {
      allLabels,
      isFoodLikely,
      hasStrongFoodIndicators,
      isDefinitelyNotFood,
      foodKeywords: FOOD_KEYWORDS.slice(0, 10), // Show first 10 for reference
      nonFoodKeywords: NON_FOOD_KEYWORDS.slice(0, 10)
    });

    // If we have strong food indicators, proceed regardless of other labels
    if (hasStrongFoodIndicators) {
      console.log('[Analysis] Strong food indicators detected, proceeding with analysis');
    } else if (isDefinitelyNotFood) {
      console.warn('[Analysis] Definitely not food based on labels');
      return { notFood: true } as const;
    } else if (!isFoodLikely) {
      console.warn('[Analysis] Not food based on labels');
      return { notFood: true } as const;
    }

    console.log('[Analysis] Food detected! Proceeding to USDA lookup...');

    // 3) Try multi-food composition first for common plates (e.g., noodles + eggs + oil)
    const hasNoodles = allLabels.some(l => /noodle|pasta|spaghetti|fettuccine|ramen|macaroni|linguine/.test(l));
    const hasEgg = allLabels.some(l => /egg\b|eggs\b/.test(l));
    const looksStirFried = allLabels.some(l => /stir fry|fried|saute|oil|olive oil|wok|pan/.test(l));

    if (hasNoodles || hasEgg) {
      try {
        const composition: Array<{ name: string; grams: number; query: string }> = [];

        if (hasNoodles) {
          // Heuristic: cooked pasta on plate ≈ 160–220 g. Use 180 g default.
          composition.push({ name: 'Pasta, cooked', grams: 180, query: 'Pasta, cooked, fettuccine' });
        }
        if (hasEgg) {
          // Heuristic: 2 eggs ≈ 100 g total (50 g each)
          const eggsCount = 2;
          composition.push({ name: `${eggsCount} Eggs`, grams: eggsCount * 50, query: 'Egg, whole, raw' });
        }
        if (looksStirFried) {
          // Heuristic: ~1 tbsp oil (15 g)
          composition.push({ name: 'Olive oil', grams: 15, query: 'Oil, olive' });
        }

        if (composition.length > 0) {
          const per100Lookups = await Promise.all(
            composition.map(item => lookupUsdaPer100g(item.query))
          );

          let total = { calories: 0, carbsG: 0, proteinG: 0, fatG: 0 };
          const includedNames: string[] = [];
          for (let i = 0; i < composition.length; i++) {
            const item = composition[i];
            const per100 = per100Lookups[i];
            if (!per100) continue;
            includedNames.push(item.name);
            const scale = item.grams / 100;
            total.calories += per100.calories * scale;
            total.carbsG += per100.carbsG * scale;
            total.proteinG += per100.proteinG * scale;
            total.fatG += per100.fatG * scale;
          }

          if (includedNames.length >= 2) {
            const nutrition = {
              calories: Math.round(total.calories),
              carbsG: round1(total.carbsG),
              proteinG: round1(total.proteinG),
              fatG: round1(total.fatG),
            };
            const healthScore = calculateHealthScore(nutrition);
            const result: Nutrition = {
              title: includedNames.join(', '),
              calories: nutrition.calories,
              carbsG: nutrition.carbsG,
              proteinG: nutrition.proteinG,
              fatG: nutrition.fatG,
              healthScore,
              servingSize: `${Math.round(composition.reduce((s, i) => s + i.grams, 0))}g`,
            };
            console.log('[Analysis] Multi-food composition result', result);
            return result;
          }
        }
      } catch (e) {
        console.warn('[Analysis] Multi-food composition failed, falling back to single match', e);
      }
    }

    // If multi-food did not run, fall back to single best USDA match
    // 3) Pick the best candidate terms to query USDA
    const candidateTerms = allLabels
      .filter((l) => !['food', 'dish', 'cuisine', 'ingredient', 'meal', 'produce', 'breakfast', 'brunch', 'snack', 'fast food', 'staple food', 'finger food', 'side dish', 'full breakfast'].includes(l))
      .filter((l) => l.length > 2) // Only use terms longer than 2 characters
      .slice(0, 5); // Get more candidates for better matching
    
    const query = candidateTerms.join(' ') || 'food';
    console.log('[USDA] Query', { query, candidates: candidateTerms });

    // 4) Search USDA FoodData Central with better matching
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(USDA_API_KEY)}&query=${encodeURIComponent(
      query
    )}&pageSize=5&sortBy=dataType.keyword&sortOrder=asc`;
    
    console.log('[USDA] Searching with URL:', usdaUrl);
    
    const usdaSearch = await fetch(usdaUrl);
    if (!usdaSearch.ok) {
      const txt = await usdaSearch.text();
      console.error('[USDA] HTTP error', { status: usdaSearch.status, body: txt.slice(0, 500) });
      throw new Error(`USDA error: ${usdaSearch.status} ${txt}`);
    }
    
    const searchJson = (await usdaSearch.json()) as any;
    const foods = searchJson?.foods || [];
    
    console.log('[USDA] Search results:', { 
      query, 
      totalHits: searchJson?.totalHits || 0,
      foodsFound: foods.length,
      firstFood: foods[0]?.description || 'none'
    });
    
    if (foods.length === 0) {
      console.warn('[USDA] No food found for query', { query });
      return { notFood: true } as const;
    }

    // 5) Find the best matching food item
    const bestFood = findBestFoodMatch(foods, candidateTerms);
    if (!bestFood) {
      console.warn('[USDA] No suitable food match found, using fallback data');
      
      // Fallback: provide basic nutrition data based on detected food type
      const fallbackNutrition = getFallbackNutrition(allLabels, candidateTerms);
      if (fallbackNutrition) {
        return fallbackNutrition;
      }
      
      return { notFood: true } as const;
    }

    // 6) Extract comprehensive nutrition data
    const nutrition = extractNutritionData(bestFood);
    
    // 7) Calculate enhanced health score
    const healthScore = calculateHealthScore(nutrition);

    const result: Nutrition = {
      title: bestFood.description || candidateTerms[0] || 'Food',
      calories: nutrition.calories,
      carbsG: nutrition.carbsG,
      proteinG: nutrition.proteinG,
      fatG: nutrition.fatG,
      healthScore,
      fiberG: nutrition.fiberG,
      sugarG: nutrition.sugarG,
      sodiumMg: nutrition.sodiumMg,
      servingSize: bestFood.servingSize || '100g',
    };
    
    console.log('[Analysis] Result', result);
    return result;
  } catch (error) {
    console.error('[analyzeFoodFromImage] Failed', error);
    throw error instanceof Error ? error : new Error('Unknown analysis error');
  }
}

function findBestFoodMatch(foods: any[], candidateTerms: string[]): any {
  // Score each food based on how well it matches our candidate terms
  const scoredFoods = foods.map(food => {
    const description = String(food.description || '').toLowerCase();
    let score = 0;
    
    candidateTerms.forEach(term => {
      if (description.includes(term)) {
        score += 2; // Exact term match
      } else if (term.length > 3 && description.includes(term.substring(0, 3))) {
        score += 1; // Partial term match
      }
    });
    
    // Prefer branded foods (more accurate) over foundation foods
    if (food.dataType === 'Branded') {
      score += 3;
    } else if (food.dataType === 'Foundation') {
      score += 1;
    }
    
    return { food, score };
  });
  
  // Sort by score and return the best match
  scoredFoods.sort((a, b) => b.score - a.score);
  return scoredFoods[0]?.food;
}

function extractNutritionData(food: any) {
  const getNutrient = (needle: string, unit: string = 'g'): number => {
    const match = (food.foodNutrients || []).find((n: any) => {
      const name = String(n.nutrientName || '').toLowerCase();
      const unitName = String(n.unitName || '').toLowerCase();
      return name.includes(needle) && unitName.includes(unit);
    });
    
    if (match?.value !== undefined) {
      return Number(match.value);
    }
    
    // Fallback: try to find by name only
    const fallbackMatch = (food.foodNutrients || []).find((n: any) =>
      String(n.nutrientName || '').toLowerCase().includes(needle)
    );
    
    return fallbackMatch?.value !== undefined ? Number(fallbackMatch.value) : 0;
  };

  return {
    calories: getNutrient('energy', 'kcal') || getNutrient('energy', 'cal'),
    carbsG: getNutrient('carbohydrate'),
    proteinG: getNutrient('protein'),
    fatG: getNutrient('total lipid') || getNutrient('fat'),
    fiberG: getNutrient('fiber'),
    sugarG: getNutrient('sugars'),
    sodiumMg: getNutrient('sodium', 'mg'),
  };
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

async function lookupUsdaPer100g(query: string): Promise<{ calories: number; carbsG: number; proteinG: number; fatG: number } | null> {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(USDA_API_KEY as string)}&query=${encodeURIComponent(query)}&pageSize=1&sortBy=dataType.keyword&sortOrder=asc`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const json = await resp.json();
    const food = json?.foods?.[0];
    if (!food) return null;
    const nutrition = extractNutritionData(food);
    return {
      calories: nutrition.calories,
      carbsG: nutrition.carbsG,
      proteinG: nutrition.proteinG,
      fatG: nutrition.fatG,
    };
  } catch {
    return null;
  }
}

function getFallbackNutrition(allLabels: string[], candidateTerms: string[]): Nutrition | null {
  // Try to identify food type and provide basic nutrition data
  const foodType = identifyFoodType(allLabels, candidateTerms);
  
  if (!foodType) return null;
  
  console.log('[Fallback] Using fallback nutrition for:', foodType);
  
  // Basic nutrition data for common food types
  const fallbackData: { [key: string]: any } = {
    'egg': { calories: 70, proteinG: 6, carbsG: 0.6, fatG: 5, fiberG: 0, sugarG: 0.4, sodiumMg: 70 },
    'bread': { calories: 265, proteinG: 9, carbsG: 49, fatG: 3.2, fiberG: 2.7, sugarG: 5, sodiumMg: 400 },
    'toast': { calories: 265, proteinG: 9, carbsG: 49, fatG: 3.2, fiberG: 2.7, sugarG: 5, sodiumMg: 400 },
    'fruit': { calories: 60, proteinG: 1, carbsG: 15, fatG: 0.3, fiberG: 3, sugarG: 12, sodiumMg: 1 },
    'vegetable': { calories: 25, proteinG: 2, carbsG: 5, fatG: 0.2, fiberG: 2, sugarG: 3, sodiumMg: 20 },
    'meat': { calories: 250, proteinG: 25, carbsG: 0, fatG: 15, fiberG: 0, sugarG: 0, sodiumMg: 80 },
    'fish': { calories: 200, proteinG: 22, carbsG: 0, fatG: 12, fiberG: 0, sugarG: 0, sodiumMg: 100 },
    'dairy': { calories: 150, proteinG: 8, carbsG: 12, fatG: 8, fiberG: 0, sugarG: 12, sodiumMg: 100 },
    'grain': { calories: 300, proteinG: 10, carbsG: 60, fatG: 2, fiberG: 8, sugarG: 2, sodiumMg: 200 },
  };
  
  const nutrition = fallbackData[foodType];
  if (!nutrition) return null;
  
  return {
    title: candidateTerms[0] || foodType,
    calories: nutrition.calories,
    carbsG: nutrition.carbsG,
    proteinG: nutrition.proteinG,
    fatG: nutrition.fatG,
    healthScore: calculateHealthScore(nutrition),
    fiberG: nutrition.fiberG,
    sugarG: nutrition.sugarG,
    sodiumMg: nutrition.sodiumMg,
    servingSize: '100g',
  };
}

function identifyFoodType(allLabels: string[], candidateTerms: string[]): string | null {
  const labels = [...allLabels, ...candidateTerms].map(l => l.toLowerCase());
  
  if (labels.some(l => l.includes('egg'))) return 'egg';
  if (labels.some(l => l.includes('bread') || l.includes('toast'))) return 'bread';
  if (labels.some(l => l.includes('fruit') || l.includes('apple') || l.includes('banana'))) return 'fruit';
  if (labels.some(l => l.includes('vegetable') || l.includes('carrot') || l.includes('broccoli'))) return 'vegetable';
  if (labels.some(l => l.includes('meat') || l.includes('beef') || l.includes('chicken'))) return 'meat';
  if (labels.some(l => l.includes('fish') || l.includes('salmon') || l.includes('tuna'))) return 'fish';
  if (labels.some(l => l.includes('milk') || l.includes('cheese') || l.includes('yogurt'))) return 'dairy';
  if (labels.some(l => l.includes('rice') || l.includes('pasta') || l.includes('oatmeal'))) return 'grain';
  
  return null;
}

async function fileUriToBase64(uri: string): Promise<string> {
  // Use Expo FileSystem to read as base64
  const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return b64;
}