import dotenv from 'dotenv';

// Load from .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });

export default {
  expo: {
    name: "AI Nutrition Tracker",
    slug: "ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ai",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#9246FF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.abti33.ai",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to camera to scan food items for nutrition analysis.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photos to let you share food images."
      }
    },
    android: {
      package: "com.abti33.ai",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.CAMERA"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#9246FF"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    }
  }
};
