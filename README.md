# AI Nutrition Tracker

A React Native mobile application built with Expo that uses AI to analyze food images and track nutrition. The app features subscription-based billing via WaafiPay, daily nutrition tracking, and personalized meal planning.

## 🚀 Features

### Core Features
- **AI Food Analysis**: Scan food images using OpenAI GPT-4 Vision API to get instant nutritional information
- **Daily Nutrition Tracking**: Track calories, protein, carbs, and fat throughout the day
- **Subscription Plans**: Monthly and yearly subscription plans with 3-day free trial
- **Payment Integration**: WaafiPay payment gateway for mobile wallet payments
- **User Profiles**: Personalized profiles with goals, weight tracking, and preferences
- **Streak Tracking**: Daily streak counter to encourage consistent usage
- **Analytics Dashboard**: View nutrition trends and progress over time
- **Dark Mode Support**: Automatic dark/light mode based on system preferences

### Technical Features
- **Convex Backend**: Real-time database and serverless functions
- **Expo Router**: File-based routing for navigation
- **TypeScript**: Full type safety throughout the application
- **React Native**: Cross-platform iOS and Android support

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- Convex account (for backend)
- OpenAI API key (for food analysis)
- WaafiPay merchant account (for payments)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ai

# Install dependencies
npm install
```

### 2. Convex Setup

1. Create a Convex account at https://convex.dev
2. Initialize Convex in your project:
   ```bash
   npx convex dev
   ```
3. This will create a `convex` folder and configure your deployment

### 3. Environment Variables

#### Convex Environment Variables
Go to **Convex Dashboard → Settings → Environment Variables** and add:

**OpenAI API Key:**
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```
Get your key from: https://platform.openai.com/api-keys

**WaafiPay Credentials:**
```
WAAFI_MERCHANT_UID=your_merchant_uid_here
WAAFI_API_USER_ID=your_api_user_id_here
WAAFI_API_KEY=your_api_key_here
WAAFI_API_URL=https://api.waafipay.com
```
Get these from: https://docs.waafipay.com

**Resend API Key (for email verification):**
```
RESEND_API_KEY=your_resend_api_key_here
```
Get your key from: https://resend.com

### 4. Local Environment (Optional)

Create `.env.local` in the project root for local development:

```bash
# Convex Configuration
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
```

### 5. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 📁 Project Structure

```
ai/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── camera.tsx     # Camera screen
│   │   ├── analytics.tsx  # Analytics dashboard
│   │   ├── profile.tsx    # User profile
│   │   └── settings.tsx   # Settings screen
│   ├── onboarding/        # Onboarding flow
│   ├── billing.tsx        # Subscription billing
│   ├── scanResults.tsx    # Food scan results
│   └── _layout.tsx        # Root layout
├── convex/                # Convex backend
│   ├── actions.ts         # Server actions (API calls)
│   ├── auth.ts           # Authentication
│   ├── users.ts          # User mutations/queries
│   └── schema.ts         # Database schema
├── constants/             # App constants
│   ├── api.ts            # API functions
│   └── Colors.ts         # Theme colors
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and providers
└── config/               # Configuration files
    └── env.example        # Environment variables template
```

## 🔑 Key Components

### Authentication
- Email/password sign up and sign in
- Guest mode support
- Email verification via Resend API
- Anonymous authentication option

### Food Analysis Flow
1. User opens camera screen
2. Takes photo of food
3. Image is converted to base64
4. Sent to Convex action `analyzeFoodWithOpenAI`
5. OpenAI GPT-4 Vision analyzes the image
6. Returns nutritional data (calories, macros, health score)
7. User can save or edit the results

### Subscription Flow
1. User selects monthly or yearly plan
2. Enters phone number for WaafiPay
3. Preauthorization holds funds
4. Commit transaction charges the account
5. Subscription activated in database
6. User gains access to camera and features

### Payment Integration
- **Preauthorization**: Hold funds without charging
- **Commit**: Complete the transaction
- **Cancel**: Release held funds if needed
- All handled via WaafiPay `/asm` endpoint

## 🎨 Theming

The app supports automatic dark/light mode:
- Uses system preferences by default
- Colors defined in `constants/Colors.ts`
- Supports both light and dark themes
- Customizable per screen if needed

## 📱 App Screens

### Main Tabs
- **Home**: Today's meals, quick stats, add food
- **Camera**: Scan food items (requires subscription)
- **Analytics**: Nutrition trends, weight tracking, charts
- **Profile**: User profile, goals, settings
- **Settings**: App settings, account management

### Modal Screens
- **Scan Results**: View and edit scanned food data
- **Billing**: Subscription plans and payment
- **Fix Results**: AI-powered nutrition correction
- **Edit Screen**: Edit user profile information

## 🔒 Security

- API keys stored securely in Convex environment variables
- No sensitive data in client-side code
- User authentication via Convex Auth
- Secure payment processing via WaafiPay

## 🧪 Development

### Linting
```bash
npm run lint
```

### Type Checking
TypeScript is configured and will show errors in your IDE.

### Testing Payment Flow
For testing, prices are set to $0.01 in `app/billing.tsx`. Change back to production prices before release:
- Monthly: $9.99
- Yearly: $29.99

## 📦 Dependencies

### Core
- `expo`: Expo SDK
- `react-native`: React Native framework
- `expo-router`: File-based routing
- `convex`: Backend database and functions

### UI/UX
- `@expo/vector-icons`: Icon library
- `react-native-safe-area-context`: Safe area handling
- `expo-image-picker`: Image selection
- `expo-camera`: Camera access

### Utilities
- `@react-native-async-storage/async-storage`: Local storage
- `dotenv`: Environment variable loading

## 🚢 Deployment

### iOS
1. Configure `app.config.js` with your bundle identifier
2. Build with EAS: `eas build --platform ios`
3. Submit to App Store

### Android
1. Configure `app.config.js` with your package name
2. Build with EAS: `eas build --platform android`
3. Submit to Google Play Store

## 📝 Notes

- All API keys must be stored in Convex environment variables (not in `.env.local`)
- The app requires an active subscription to use the camera feature
- Food analysis uses OpenAI GPT-4 Vision API (costs apply)
- Payment processing via WaafiPay mobile wallet integration

## 🤝 Support

For issues or questions:
1. Check Convex dashboard for backend logs
2. Check Expo logs for client-side errors
3. Verify all environment variables are set correctly

## 📄 License

Private project - All rights reserved

