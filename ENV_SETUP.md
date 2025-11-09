# 🔐 Environment Variables Setup

## 📁 File Location

Create a file named `.env.local` in your project root:

```
/Users/kya/Desktop/ai/.env.local
```

---

## 📝 File Contents

Copy and paste this into your `.env.local` file:

```bash
# OpenAI API Key
# Get it from: https://platform.openai.com/api-keys
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-actual-key-here

# Convex Configuration (already configured)
CONVEX_DEPLOYMENT=your-deployment-name
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## ✅ Why .env.local?

### **Security Benefits:**

1. **Git Ignored**: `.env.local` is already in `.gitignore`
2. **Never Committed**: Your API keys stay on your machine
3. **Team Safe**: Each developer has their own `.env.local`
4. **Production Safe**: Production uses different keys

### **Loading Priority:**

```
1. .env.local       ← Reads this FIRST (your secrets)
2. .env             ← Fallback (example/defaults)
```

---

## 🔄 Configuration

The app is configured in `app.config.js`:

```javascript
import dotenv from 'dotenv';

// Load from .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });

export default {
  expo: {
    extra: {
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    }
  }
};
```

---

## 📋 Quick Setup Steps

### **1. Create .env.local:**
```bash
touch .env.local
```

### **2. Add your OpenAI API key:**
```bash
echo "EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-your-key-here" > .env.local
```

### **3. Add Convex keys (if needed):**
```bash
echo "CONVEX_DEPLOYMENT=your-deployment" >> .env.local
echo "EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud" >> .env.local
```

### **4. Restart server:**
```bash
npx expo start --clear
```

---

## ✅ Verification

Check if your keys are loaded:

```bash
# The app will log at startup:
env: load .env.local .env
env: export EXPO_PUBLIC_OPENAI_API_KEY CONVEX_DEPLOYMENT EXPO_PUBLIC_CONVEX_URL
```

If you see this, your `.env.local` is loaded! ✅

---

## 🚫 What NOT to Do

❌ **Don't commit .env.local to Git**
```bash
# This is already in .gitignore, but don't remove it!
.env*.local
```

❌ **Don't share your API keys**
```bash
# Never share in:
- Screenshots
- Chat messages
- Public repositories
- Documentation
```

❌ **Don't use .env for secrets**
```bash
# .env is for examples only, use .env.local for real keys
```

---

## 🎯 Example .env.local

```bash
# OpenAI API Configuration
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx

# Convex Configuration
CONVEX_DEPLOYMENT=production-deployment-123
EXPO_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud
```

---

## 🔍 Troubleshooting

### **API key not working?**

1. Check `.env.local` exists in project root
2. Check key starts with `sk-proj-`
3. Restart server: `npx expo start --clear`
4. Check logs for "env: export EXPO_PUBLIC_OPENAI_API_KEY"

### **Still not loading?**

1. Delete `.expo` folder
2. Clear cache: `npx expo start --clear`
3. Restart Metro bundler

---

## 🎉 Done!

Your environment is now configured to:
- ✅ Read from `.env.local` (secure)
- ✅ Keep secrets out of Git
- ✅ Load OpenAI API key
- ✅ Work on any machine

Test it by scanning food! 📸🍕

