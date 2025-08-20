
export type Nutrition = {
  title: string;
  calories: number; // kcal
  carbsG: number;
  proteinG: number;
  fatG: number;
  healthScore: number; // 0..10
};

export async function analyzeFoodFromImage(imageUri: string): Promise<Nutrition> {
  try {
    // In a real app, you would send the image to your food analysis API
    // For now, returning mock data with realistic delay
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response - replace with actual API call
    // You can implement the real API call here:
    /*
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food.jpg',
    } as any);
    
    const response = await fetch('YOUR_API_URL', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_API_KEY`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
    */
    
    // Mock data for now
    return {
      title: "Grilled Chicken Salad",
      calories: 320,
      carbsG: 15.2,
      proteinG: 28.5,
      fatG: 18.3,
      healthScore: 8,
    };
  } catch (error) {
    console.error('Food analysis API error:', error);
    throw error;
  }
}
