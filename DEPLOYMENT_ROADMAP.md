# 📱 Complete Deployment Roadmap - iOS App Store & Android Play Store

## Overview
This is a complete step-by-step guide to deploy your Expo React Native app to both iOS App Store and Google Play Store.

---

## Prerequisites

### For iOS App Store:
- ✅ **Apple Developer Account** ($99/year) - https://developer.apple.com/programs/
- ✅ **macOS** (required for iOS development)
- ✅ **Xcode** (latest version from Mac App Store)

### For Android Play Store:
- ✅ **Google Play Console Account** ($25 one-time fee) - https://play.google.com/console
- ✅ **Any OS** (Windows, macOS, or Linux)

### Common:
- ✅ **Node.js** (v18+)
- ✅ **Git** (for version control)
- ✅ **EAS CLI** (Expo Application Services)

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

Login to Expo:
```bash
eas login
```

If you don't have an Expo account, create one:
```bash
eas register
```

---

## Step 2: Configure EAS Build

The `eas.json` file is already created. Update it with your credentials:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "package": "com.abti33.ai"
      },
      "ios": {
        "bundleIdentifier": "com.abti33.ai"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path/to/api-key.json",
        "track": "internal"
      },
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

The configuration is already updated. Verify these settings:

- ✅ **App Name**: "AI Nutrition Tracker"
- ✅ **Bundle Identifier (iOS)**: "com.abti33.ai"
- ✅ **Package Name (Android)**: "com.abti33.ai"
- ✅ **Version**: "1.0.0"
- ✅ **Build Number**: "1" (iOS), "1" (Android)

---

## Step 4: Prepare Assets

### App Icon
- **Size**: 1024x1024 pixels
- **Format**: PNG (no transparency)
- **Location**: `./assets/images/icon.png`
- **Must be square**

### Splash Screen
- Already configured
- **Location**: `./assets/images/splash-icon.png`

### Android Adaptive Icon
- Already configured
- **Location**: `./assets/images/adaptive-icon.png`

---

## Step 5: Set Environment Variables

Set secrets in EAS (these will be used during build):

```bash
# Convex URL
eas secret:create --scope project --name EXPO_PUBLIC_CONVEX_URL --value "your-convex-production-url"

# OpenAI API Key
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "your-openai-api-key"
```

Or they will be read from `.env.local` during build.

---

## Step 6: Deploy Backend (Convex)

Make sure your Convex backend is deployed to production:

```bash
cd convex
npx convex deploy --prod
```

Note the production URL and update `EXPO_PUBLIC_CONVEX_URL` if needed.

---

# 🍎 iOS APP STORE DEPLOYMENT

## Step 7: Apple Developer Setup

### 7.1 Create Apple Developer Account
1. Go to: https://developer.apple.com/programs/
2. Sign up for Apple Developer Program ($99/year)
3. Complete enrollment (takes 24-48 hours)

### 7.2 Get Your Team ID
1. Go to: https://developer.apple.com/account
2. Click on "Membership"
3. Note your **Team ID** (10-character string)

---

## Step 8: Build iOS App

### First Build (EAS will handle certificates automatically):

```bash
eas build --platform ios --profile production
```

**First time prompts:**
- EAS will ask for Apple ID
- It will create certificates and provisioning profiles automatically
- Follow the prompts

**Build time**: 15-30 minutes

---

## Step 9: Create App in App Store Connect

### 9.1 Create App
1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: "AI Nutrition Tracker" (or your choice, max 30 chars)
   - **Primary Language**: English
   - **Bundle ID**: `com.abti33.ai` (must match app.config.js)
   - **SKU**: `ai-nutrition-001` (unique identifier)

### 9.2 App Information
Fill in:
- **Subtitle**: Short description (max 30 chars)
- **Description**: Full app description (max 4000 chars)
- **Keywords**: Search keywords (comma-separated, max 100 chars)
- **Support URL**: https://github.com/abti33/ai
- **Marketing URL**: (optional)
- **Privacy Policy URL**: https://github.com/abti33/ai

### 9.3 App Screenshots (REQUIRED)
You need screenshots for:
- **iPhone 6.7" Display** (1290 x 2796 pixels) - 3-10 screenshots
- **iPhone 6.5" Display** (1284 x 2778 pixels) - Optional
- **iPad Pro 12.9"** (2048 x 2732 pixels) - Optional

**How to take screenshots:**
1. Run app in iOS Simulator
2. Take screenshots (Cmd + S)
3. They will be saved to Desktop
4. Upload to App Store Connect

### 9.4 App Review Information
- **Contact Information**: Your email/phone
- **Demo Account**: (if needed)
- **Notes**: Any special instructions for reviewers

---

## Step 10: Submit iOS App

### Option A: Using EAS Submit (Recommended)

```bash
eas submit --platform ios
```

EAS will:
- Upload the build automatically
- Link it to your App Store Connect app
- You just need to submit for review in App Store Connect

### Option B: Manual Upload

1. Download `.ipa` file from EAS build page
2. Use **Transporter** app (from Mac App Store) or Xcode
3. Upload to App Store Connect

### Step 10.1: Submit for Review
1. Go to App Store Connect
2. Select your app
3. Go to the version you want to submit
4. Click **"Submit for Review"**
5. Answer App Review questions
6. Submit

**Review time**: Usually 24-48 hours

---

# 🤖 ANDROID PLAY STORE DEPLOYMENT

## Step 11: Google Play Console Setup

### 11.1 Create Google Play Console Account
1. Go to: https://play.google.com/console
2. Pay one-time $25 registration fee
3. Complete account setup

### 11.2 Create App
1. Click **"Create app"**
2. Fill in:
   - **App name**: "AI Nutrition Tracker"
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check required boxes

---

## Step 12: Build Android App

```bash
eas build --platform android --profile production
```

**Build time**: 15-30 minutes

**First time**: EAS will create a keystore automatically and store it securely.

---

## Step 13: Set Up Google Play API Access

### 13.1 Create Service Account
1. Go to: https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google Play Android Developer API**
4. Create **Service Account**
5. Download JSON key file
6. Save as `google-play-api-key.json` in project root

### 13.2 Link Service Account to Play Console
1. Go to Play Console → **Setup** → **API access**
2. Link your service account
3. Grant permissions:
   - **View app information and download bulk reports**
   - **Manage production releases**
   - **Manage testing track releases**

### 13.3 Update eas.json
Add the path to your service account key:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-play-api-key.json",
      "track": "internal"
    }
  }
}
```

---

## Step 14: Complete Play Store Listing

### 14.1 Store Listing
Fill in:
- **App name**: "AI Nutrition Tracker"
- **Short description**: (max 80 characters)
- **Full description**: (max 4000 characters)
- **App icon**: 512x512 pixels
- **Feature graphic**: 1024x500 pixels
- **Screenshots**: 
  - Phone: 16:9 or 9:16 ratio, min 320px, max 3840px
  - Tablet: (optional)
- **Category**: Health & Fitness
- **Contact details**: Your email
- **Privacy Policy URL**: https://github.com/abti33/ai

### 14.2 Content Rating
1. Complete content rating questionnaire
2. Answer questions about your app
3. Get rating certificate

### 14.3 App Access
- **All or some functionality is restricted**: Select based on your app
- If restricted, provide test account credentials

### 14.4 Data Safety
Answer questions about:
- Data collection
- Data sharing
- Security practices

### 14.5 Target Audience
- **Target age group**: Select appropriate
- **Content guidelines**: Confirm compliance

---

## Step 15: Submit Android App

### Option A: Using EAS Submit (Recommended)

```bash
eas submit --platform android
```

EAS will:
- Upload the build automatically
- Submit to the track you specified (internal/testing/production)

### Option B: Manual Upload

1. Download `.aab` file from EAS build page
2. Go to Play Console → **Production** → **Create new release**
3. Upload the `.aab` file
4. Add release notes
5. Review and roll out

### Step 15.1: Testing Tracks (Recommended First)
Before production, test on:
1. **Internal testing**: Quick testing with up to 100 testers
2. **Closed testing**: Beta testing with specific testers
3. **Open testing**: Public beta

**To create testing track:**
```bash
# Update eas.json to use "internal" track first
eas submit --platform android --track internal
```

---

## Step 16: Version Management

### Before Each Release:

1. **Update `app.config.js`:**
   ```javascript
   version: "1.0.1", // Increment version
   ios: {
     buildNumber: "2", // Increment for iOS
   },
   android: {
     versionCode: 2, // Increment for Android
   }
   ```

2. **Update `package.json`:**
   ```json
   "version": "1.0.1"
   ```

3. **Build new version:**
   ```bash
   # iOS
   eas build --platform ios --profile production
   
   # Android
   eas build --platform android --profile production
   ```

---

## Step 17: Monitoring & Updates

### App Store Connect (iOS)
- Monitor downloads, ratings, reviews
- Respond to user reviews
- Check crash reports
- View analytics

### Play Console (Android)
- Monitor installs, ratings, reviews
- Check crash reports and ANRs
- View user acquisition data
- A/B test store listings

---

## Quick Command Reference

### Build Commands
```bash
# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Build both
eas build --platform all --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

### Submit Commands
```bash
# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android

# Submit both
eas submit --platform all
```

### Environment Variables
```bash
# Create secret
eas secret:create --scope project --name EXPO_PUBLIC_CONVEX_URL --value "url"

# List secrets
eas secret:list

# Delete secret
eas secret:delete --name EXPO_PUBLIC_CONVEX_URL
```

---

## Cost Breakdown

### iOS App Store:
- **Apple Developer Program**: $99/year (required)
- **EAS Build**: Free tier available
- **EAS Submit**: Free
- **Total**: $99/year minimum

### Android Play Store:
- **Google Play Console**: $25 one-time (required)
- **EAS Build**: Free tier available
- **EAS Submit**: Free
- **Total**: $25 one-time minimum

### Combined:
- **First Year**: $124 ($99 + $25)
- **Subsequent Years**: $99/year (iOS only)

---

## Timeline Estimate

### iOS:
- **Setup**: 1-2 hours
- **First Build**: 15-30 minutes
- **TestFlight Testing**: 1-2 days
- **App Store Review**: 1-3 days
- **Total**: ~1 week

### Android:
- **Setup**: 1-2 hours
- **First Build**: 15-30 minutes
- **Internal Testing**: 1 day
- **Play Store Review**: 1-3 days
- **Total**: ~1 week

### Both Platforms:
- **Parallel Setup**: 2-3 hours
- **Builds**: 30-60 minutes
- **Testing**: 2-3 days
- **Reviews**: 1-3 days
- **Total**: ~1-2 weeks

---

## Common Issues & Solutions

### iOS Issues:

**Issue**: "Bundle identifier already exists"
- **Solution**: Change `bundleIdentifier` in `app.config.js` to something unique

**Issue**: "Missing app icon"
- **Solution**: Ensure `./assets/images/icon.png` is 1024x1024 PNG

**Issue**: "Code signing failed"
- **Solution**: Let EAS handle it automatically, or configure in Apple Developer portal

**Issue**: "App rejected - Missing privacy policy"
- **Solution**: Add privacy policy URL in App Store Connect

### Android Issues:

**Issue**: "Package name already exists"
- **Solution**: Change `package` in `app.config.js` to something unique

**Issue**: "Missing app icon"
- **Solution**: Ensure icon is 512x512 pixels

**Issue**: "Upload failed - Invalid AAB"
- **Solution**: Make sure you're uploading `.aab` file, not `.apk`

**Issue**: "App rejected - Missing data safety form"
- **Solution**: Complete Data Safety section in Play Console

---

## Pre-Launch Checklist

### iOS:
- [ ] Apple Developer account created
- [ ] App configured in App Store Connect
- [ ] Screenshots prepared (all required sizes)
- [ ] Privacy policy URL added
- [ ] App description and keywords filled
- [ ] Build created and uploaded
- [ ] TestFlight testing completed
- [ ] Submitted for review

### Android:
- [ ] Google Play Console account created
- [ ] Service account set up
- [ ] App listing completed
- [ ] Screenshots prepared
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Build created and uploaded
- [ ] Internal testing completed
- [ ] Submitted for production

### Both:
- [ ] Environment variables set in EAS
- [ ] Convex backend deployed to production
- [ ] App version and build numbers updated
- [ ] App icons and splash screens ready
- [ ] All features tested
- [ ] No critical bugs

---

## Post-Launch

### Monitor:
- User reviews and ratings
- Crash reports
- Analytics data
- Revenue (if applicable)

### Update Regularly:
- Fix bugs
- Add new features
- Respond to user feedback
- Update dependencies

---

## Resources

### Documentation:
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Play Console**: https://play.google.com/console
- **Expo Docs**: https://docs.expo.dev

### Support:
- **Expo Forums**: https://forums.expo.dev
- **Apple Developer Support**: https://developer.apple.com/support/
- **Google Play Support**: https://support.google.com/googleplay/android-developer

---

## Next Steps

1. ✅ Install EAS CLI: `npm install -g eas-cli`
2. ✅ Login: `eas login`
3. ✅ Set environment variables: `eas secret:create`
4. ✅ Deploy Convex backend: `npx convex deploy --prod`
5. ✅ Build iOS: `eas build --platform ios --profile production`
6. ✅ Build Android: `eas build --platform android --profile production`
7. ✅ Create apps in stores (App Store Connect & Play Console)
8. ✅ Submit: `eas submit --platform all`

Good luck with your deployment! 🚀

