# Food Nutrition Scanner - Setup Guide

This app uses Google Vision API and USDA Food Database to analyze food images and provide accurate nutrition information.

## Prerequisites

1. **Google Cloud Console Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Vision API

2. **USDA Food Database API Key**
   - Go to [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html)
   - Sign up for a free API key

## Setup Steps

### 1. Get API Keys

#### Google Vision API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. Copy the API key
6. (Optional) Restrict the key to Vision API only for security

#### USDA API Key:
1. Go to [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html)
2. Fill out the form and submit
3. Check your email for the API key
4. Copy the API key

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp config/env.example .env

# Edit the .env file with your actual API keys
nano .env
```

Add your API keys:

```env
# API Keys for Food Nutrition Analysis
EXPO_PUBLIC_GOOGLE_API_KEY=your_actual_google_api_key_here
EXPO_PUBLIC_USDA_API_KEY=your_actual_usda_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the App

```bash
npx expo start
```

## How It Works

1. **Image Capture**: User takes a photo of food using the camera
2. **Google Vision Analysis**: Image is sent to Google Vision API to identify food items
3. **USDA Database Lookup**: Identified food terms are used to search USDA's comprehensive food database
4. **Nutrition Calculation**: Accurate nutrition data is extracted including:
   - Calories
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   - Fiber (g)
   - Sugar (g)
   - Sodium (mg)
5. **Health Score**: AI-powered health score (0-10) based on nutrition composition
6. **Results Display**: Beautiful, detailed nutrition breakdown is shown to the user

## Features

- ✅ **Accurate Food Detection**: Uses Google's advanced AI to identify food items
- ✅ **Comprehensive Nutrition Data**: USDA database provides detailed nutritional information
- ✅ **Health Scoring**: Intelligent health score calculation
- ✅ **Beautiful UI**: Modern, intuitive interface
- ✅ **Real-time Analysis**: Instant results after photo capture
- ✅ **Additional Nutrients**: Shows fiber, sugar, sodium, and serving size

## Troubleshooting

### "Missing API keys" Error
- Ensure your `.env` file exists and contains valid API keys
- Check that the keys are not expired or restricted
- Verify the environment variable names match exactly

### "Vision error" or "USDA error"
- Check your internet connection
- Verify API keys are valid and have proper permissions
- Check API quotas and limits in Google Cloud Console

### Food Not Detected
- Ensure the food item is clearly visible in the photo
- Try taking the photo in better lighting
- Make sure the food item is the main subject of the photo

## API Limits

- **Google Vision API**: 1000 free requests per month, then $1.50 per 1000 requests
- **USDA Food Database**: Free tier with reasonable limits

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used client-side for this app
- Consider restricting Google API key to specific domains/IPs for production use

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your API keys are working in their respective consoles
3. Ensure all dependencies are properly installed
