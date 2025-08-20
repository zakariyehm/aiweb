// App Configuration
export const APP_CONFIG = {
  name: 'CalAI',
  version: '1.0.0',
  camera: {
    quality: 0.9,
    allowsEditing: false,
  },
  api: {
    // Replace with your actual API configuration
    foodAnalysisUrl: 'https://api.example.com/food-analysis',
    apiKey: 'your_api_key_here',
  },
};

// Environment variables (you can replace these with actual values)
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || APP_CONFIG.api.foodAnalysisUrl,
  API_KEY: process.env.API_KEY || APP_CONFIG.api.apiKey,
};
