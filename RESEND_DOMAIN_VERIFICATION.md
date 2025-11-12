# 🔐 Resend Domain Verification Guide

## Current Status

Hada Resend-ku wuxuu kuu ogolaadayaa inaad email u dirto **kaliya email-kaaga** (`abtisachs@gmail.com`).

Si aad u dirto email-ka **kasta**, waa inaad **domain verify garaysaa**.

## Error Message

```
You can only send testing emails to your own email address (abtisachs@gmail.com). 
To send emails to other recipients, please verify a domain at resend.com/domains, 
and change the `from` address to an email using this domain.
```

## Sidee Domain Verify Garaysaa

### Step 1: Tag Resend Dashboard
1. Tag: https://resend.com/domains
2. Login samee
3. "Add Domain" dhagsii

### Step 2: Domain-kaaga geli
1. Domain-kaaga geli (tusaale: `yourdomain.com`)
2. "Add Domain" dhagsii

### Step 3: DNS Records ku dar
Resend wuxuu kuu bixinayaa DNS records-ka aad u baahan tahay:

**SPF Record:**
```
Type: TXT
Name: @ (ama domain-kaaga)
Value: v=spf1 include:resend.com ~all
```

**DKIM Records:**
Resend wuxuu kuu bixinayaa 3 DKIM records - ku dar dhammaan.

**DMARC Record (Optional but Recommended):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

### Step 4: DNS Records Verify
1. DNS records-ka ku dar domain provider-kaaga (GoDaddy, Namecheap, Cloudflare, etc.)
2. 5-10 daqiiqo sug
3. Resend dashboard-ka "Verify" dhagsii

### Step 5: Code-ka Update
Marka domain-ka verify garayso, code-ka update samee:

**File: `convex/actions.ts`**
```typescript
from: "AI Nutrition Tracker <noreply@yourdomain.com>", // Domain-kaaga isticmaal
```

**File: `convex/users.ts`**
```typescript
// Remove this line once domain is verified:
code: verificationCode,
```

## Domain Providers

### Cloudflare (Recommended - Free & Easy)
1. Tag Cloudflare dashboard
2. Domain-kaaga dooro
3. DNS → Records
4. DNS records-ka ku dar
5. Verify in Resend

### GoDaddy
1. Tag GoDaddy dashboard
2. Domain-kaaga dooro
3. DNS Management
4. DNS records-ka ku dar
5. Verify in Resend

### Namecheap
1. Tag Namecheap dashboard
2. Domain List → Manage
3. Advanced DNS
4. DNS records-ka ku dar
5. Verify in Resend

## Testing

### Before Domain Verification:
- ✅ Email-kaaga (`abtisachs@gmail.com`) waa la diraa
- ❌ Email-ka kale ma la dirin karo

### After Domain Verification:
- ✅ Email-ka kasta waa la diraa
- ✅ Professional "from" address: `noreply@yourdomain.com`
- ✅ Better deliverability (spam folder ma dhici doono)

## Cost

- **Domain verification**: FREE
- **Resend free tier**: 3,000 emails/month
- **Domain cost**: ~$10-15/year (if you don't have one)

## Quick Setup (No Domain?)

Haddii aad domain lahayn, waxaad u baahan tahay:
1. Domain iibsasho (GoDaddy, Namecheap, etc.) - ~$10-15/year
2. Domain Resend-ka verify samee
3. DNS records-ka ku dar

## Alternative: Use Your Own Email for Testing

Haddii aad domain verify garayn, waxaad isticmaali kartaa:
- Email-kaaga (`abtisachs@gmail.com`) for testing
- Code-ka wali waa la soo bandhigayaa development-ka

---

**Note**: Code-ka hada wuxuu code-ka soo bandhigayaa haddii email-ka la dirin. Marka domain-ka verify garayso, code-ka remove samee.

