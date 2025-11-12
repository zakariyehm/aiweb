# 📧 Email Verification Setup Guide

## Overview
Hada email verification-ku waa development mode oo kaliya - code-ka waa la soo bandhigayaa console-ka. Production-ka, waxaad u baahan tahay inaad email service isticmaasho si uu u dirto email-ka dhabta ah.

## Email Services Options

### 1. **Resend** (Recommended - Easy & Free)
- **Free tier**: 3,000 emails/month
- **Price**: $20/month for 50,000 emails
- **Website**: https://resend.com
- **Easy setup**: Simple API, good documentation

### 2. **SendGrid**
- **Free tier**: 100 emails/day
- **Price**: $19.95/month for 50,000 emails
- **Website**: https://sendgrid.com

### 3. **AWS SES** (Cheapest for high volume)
- **Price**: $0.10 per 1,000 emails
- **More complex setup**

## Setup Steps (Using Resend - Recommended)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for free account
3. Verify your email
4. Go to API Keys section
5. Create new API key
6. Copy the API key (starts with `re_`)

### Step 2: Add API Key to Convex
1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (e.g., `re_abc123...`)
5. Click Save

### Step 3: Verify Domain (Optional but Recommended)
1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records to verify domain
4. This allows you to send from `noreply@yourdomain.com`

### Step 4: Update Code
The code has been updated to use Resend. Just add the API key to Convex environment variables.

## Environment Variables Needed

### In Convex Dashboard:
```
RESEND_API_KEY=re_your_api_key_here
```

### For Development (Optional):
You can also add to `.env.local`:
```
RESEND_API_KEY=re_your_api_key_here
```

## How It Works

1. User requests email verification code
2. Backend generates 6-digit code
3. Backend sends email using Resend API
4. User receives email with code
5. User enters code to verify

## Email Template

The email includes:
- Subject: "Verify Your Email Address"
- Body: 6-digit verification code
- Expires in: 15 minutes

## Testing

### Development Mode:
- Code is still logged to console for testing
- Email is also sent (if API key is set)

### Production Mode:
- Only email is sent (no console log)
- Code is NOT returned in API response

## Troubleshooting

### Email not sending?
1. Check Resend API key is correct
2. Check Convex environment variables
3. Check Resend dashboard for errors
4. Check spam folder

### "Invalid API key" error?
- Make sure API key starts with `re_`
- Check for extra spaces in environment variable

### Emails going to spam?
- Verify your domain in Resend
- Use a proper "from" email address
- Add SPF/DKIM records

## Cost Estimate

### Resend Free Tier:
- 3,000 emails/month = FREE
- Perfect for small apps

### If you need more:
- 50,000 emails/month = $20/month
- Very affordable for most apps

## Next Steps

1. ✅ Sign up for Resend
2. ✅ Get API key
3. ✅ Add to Convex environment variables
4. ✅ Test email sending
5. ✅ Deploy to production

---

**Note**: The code has been updated to support Resend. Just add your API key and it will work!

