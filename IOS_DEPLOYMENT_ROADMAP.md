# 📱 iOS Deployment Roadmap

## Overview
This guide will help you deploy your Expo React Native app to iOS App Store.

---

## Prerequisites

### 1. Apple Developer Account
- **Required**: Apple Developer Program membership ($99/year)
- Sign up at: https://developer.apple.com/programs/
- You need this to:
  - Build iOS apps
  - Submit to App Store
  - Test on physical devices

### 2. Development Tools
- **macOS** (required for iOS development)
- **Xcode** (latest version from App Store)
- **Node.js** (already installed)
- **Expo CLI** or **EAS CLI**

---

## Step 1: Install EAS CLI

EAS (Expo Application Services) is the recommended way to build and deploy Expo apps.

```bash
npm install -g eas-cli
```

Login to Expo:
```bash
eas login
```

---

## Step 2: Configure EAS Build

Create `eas.json` configuration file:

```bash
eas build:configure
```

This will create an `eas.json` file. Update it with:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.yourcompany.ai"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

---

## Step 3: Update app.config.js

Add iOS-specific configuration:

```javascript
export default {
  expo: {
    name: "AI Nutrition Tracker", // App name (max 30 chars)
    slug: "ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#9246FF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.ai", // Change to your bundle ID
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to camera to scan food items for nutrition analysis.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photos to let you share food images."
      }
    },
    // ... rest of config
  }
};
```

**Important**: Change `bundleIdentifier` to your unique identifier (e.g., `com.yourname.ai`)

---

## Step 4: Prepare Assets

### App Icon
- Size: 1024x1024 pixels
- Format: PNG (no transparency)
- Location: `./assets/images/icon.png`
- Must be square

### Splash Screen
- Already configured in `app.config.js`
- Location: `./assets/images/splash-icon.png`

---

## Step 5: Build for iOS

### Option A: Build on EAS (Recommended - Cloud Build)

```bash
# Build for iOS simulator (testing)
eas build --platform ios --profile preview

# Build for physical device (TestFlight/App Store)
eas build --platform ios --profile production
```

**First time setup:**
- EAS will ask for Apple credentials
- It will create certificates and provisioning profiles automatically
- Follow the prompts

### Option B: Build Locally (Requires macOS + Xcode)

```bash
# Install dependencies
npm install

# Build locally
eas build --platform ios --local
```

---

## Step 6: Test the Build

### Option A: TestFlight (Recommended)

1. **Upload to App Store Connect:**
   ```bash
   eas submit --platform ios
   ```

2. **Or manually:**
   - Download the `.ipa` file from EAS
   - Upload via App Store Connect or Transporter app

3. **Add Testers:**
   - Go to App Store Connect
   - Navigate to TestFlight
   - Add internal/external testers
   - Share TestFlight link

### Option B: Direct Install (Development)

```bash
# Install on connected device
eas build --platform ios --profile development
```

---

## Step 7: App Store Submission

### 7.1 Create App in App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Your app name
   - **Primary Language**: English (or your choice)
   - **Bundle ID**: Same as in `app.config.js`
   - **SKU**: Unique identifier (e.g., `ai-nutrition-001`)

### 7.2 Prepare App Store Listing

Required information:
- **App Name** (max 30 characters)
- **Subtitle** (max 30 characters)
- **Description** (max 4000 characters)
- **Keywords** (for search)
- **Support URL**: Your website or GitHub
- **Privacy Policy URL**: https://github.com/abti33/ai
- **Screenshots** (required):
  - iPhone 6.7" (1290 x 2796 pixels) - 3-10 screenshots
  - iPhone 6.5" (1284 x 2778 pixels) - Optional
  - iPad Pro 12.9" (2048 x 2732 pixels) - Optional

### 7.3 Submit for Review

```bash
# Submit using EAS
eas submit --platform ios
```

Or manually:
1. Upload build via App Store Connect
2. Fill in all required information
3. Answer App Review questions
4. Submit for review

---

## Step 8: Environment Variables

Make sure all environment variables are set in EAS:

```bash
# Set environment variables
eas secret:create --scope project --name EXPO_PUBLIC_CONVEX_URL --value "your-convex-url"
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "your-openai-key"
```

Or use `.env` files (EAS will use them automatically during build).

---

## Step 9: Backend (Convex) Setup

### Deploy Convex Backend

```bash
# Make sure Convex is deployed
cd convex
npx convex deploy
```

### Update Environment Variables
- Ensure `EXPO_PUBLIC_CONVEX_URL` is set correctly
- This should point to your production Convex deployment

---

## Step 10: Version Management

### Update Version Before Each Release

1. **Update `app.config.js`:**
   ```javascript
   version: "1.0.1", // Increment version
   ios: {
     buildNumber: "2", // Increment build number
   }
   ```

2. **Update `package.json`:**
   ```json
   "version": "1.0.1"
   ```

---

## Common Issues & Solutions

### Issue: "Bundle identifier already exists"
**Solution**: Change `bundleIdentifier` in `app.config.js` to something unique

### Issue: "Missing app icon"
**Solution**: Ensure `./assets/images/icon.png` is 1024x1024 PNG

### Issue: "Code signing failed"
**Solution**: Let EAS handle it automatically, or configure in Apple Developer portal

### Issue: "Build failed"
**Solution**: Check EAS build logs for specific errors

---

## Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

---

## Timeline Estimate

- **Setup**: 1-2 hours
- **First Build**: 15-30 minutes
- **TestFlight Testing**: 1-2 days
- **App Store Review**: 1-3 days (usually 24-48 hours)

**Total**: ~1 week from start to App Store

---

## Cost Breakdown

- **Apple Developer Program**: $99/year (required)
- **EAS Build**: Free tier available (limited builds/month)
- **EAS Submit**: Free
- **Total**: $99/year minimum

---

## Next Steps

1. ✅ Install EAS CLI
2. ✅ Create Apple Developer account
3. ✅ Configure `eas.json`
4. ✅ Update `app.config.js` with bundle identifier
5. ✅ Build first iOS app
6. ✅ Test on TestFlight
7. ✅ Submit to App Store

---

## Resources

- **EAS Documentation**: https://docs.expo.dev/build/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com
- **Expo Docs**: https://docs.expo.dev

---

## Support

If you encounter issues:
1. Check EAS build logs
2. Review Apple Developer documentation
3. Check Expo forums: https://forums.expo.dev

Good luck with your deployment! 🚀

