# 📧 Sidee Email-ka Kasta Loogu Diraa - Tillaabooyinka Buuxa

## Problem:
Hada Resend-ku wuxuu kuu ogolaadayaa inaad email u dirto **kaliya email-kaaga** (`abtisachs@gmail.com`).  
Email-ka kale ma la dirin karo sababtoo ah domain-ka aan verify garayn.

## Solution:
**Domain verify samee Resend-ka** - markaas email-ka kasta waa la diraa.

---

## Tillaabooyinka (Step-by-Step):

### Step 1: Domain Haysi (Haddii aad domain lahayn)

#### Option A: Domain Iibsasho (Recommended)
1. **GoDaddy**: https://www.godaddy.com - ~$12/year
2. **Namecheap**: https://www.namecheap.com - ~$10/year  
3. **Cloudflare**: https://www.cloudflare.com/products/registrar - ~$8/year

**Tusaalooyin domain names:**
- `yourname.com`
- `yourapp.com`
- `yourbrand.io`

#### Option B: Domain Hore La Haysan
Haddii aad domain hore u haysatid, isticmaal.

---

### Step 2: Resend-ka Domain Ku Dar

1. **Tag Resend Dashboard:**
   - Tag: https://resend.com/domains
   - Login samee

2. **"Add Domain" dhagsii:**
   - "Add Domain" button-ka dhagsii
   - Domain-kaaga geli (tusaale: `yourdomain.com`)
   - "Add" dhagsii

3. **DNS Records-ka Aqri:**
   Resend wuxuu kuu bixinayaa DNS records-ka aad u baahan tahay:
   - **SPF Record** (1 record)
   - **DKIM Records** (3 records)
   - **DMARC Record** (1 record - optional)

---

### Step 3: DNS Records-ka Domain Provider-kaaga Ku Dar

#### Haddii aad Cloudflare Isticmaashid (Easiest):

1. Tag Cloudflare dashboard: https://dash.cloudflare.com
2. Domain-kaaga dooro
3. **DNS** → **Records** tag
4. **"Add record"** dhagsii
5. DNS records-ka Resend-ka ka soo qaad oo ku dar:
   - **SPF Record:**
     - Type: `TXT`
     - Name: `@` (ama domain-kaaga)
     - Content: `v=spf1 include:resend.com ~all`
     - TTL: Auto
   
   - **DKIM Records** (3 records):
     - Resend-ka ka soo qaad exact values-ka
     - Type: `TXT`
     - Name: (Resend-ka ka soo qaad)
     - Content: (Resend-ka ka soo qaad)
   
   - **DMARC Record** (Optional):
     - Type: `TXT`
     - Name: `_dmarc`
     - Content: `v=DMARC1; p=none;`

6. **Save** dhagsii

#### Haddii aad GoDaddy Isticmaashid:

1. Tag GoDaddy: https://www.godaddy.com
2. **My Products** → Domain-kaaga dooro
3. **DNS** → **Manage DNS**
4. DNS records-ka Resend-ka ka soo qaad oo ku dar
5. **Save** dhagsii

#### Haddii aad Namecheap Isticmaashid:

1. Tag Namecheap: https://www.namecheap.com
2. **Domain List** → Domain-kaaga dooro → **Manage**
3. **Advanced DNS** tag
4. DNS records-ka Resend-ka ka soo qaad oo ku dar
5. **Save** dhagsii

---

### Step 4: DNS Records Verify (5-10 daqiiqo sug)

1. DNS records-ka ku dar domain provider-kaaga
2. **5-10 daqiiqo sug** (DNS propagation)
3. Tag Resend dashboard: https://resend.com/domains
4. Domain-kaaga dooro
5. **"Verify"** button-ka dhagsii
6. Haddii verify garayso, waa **green checkmark** ✅

---

### Step 5: Code-ka Update

Marka domain-ka verify garayso, code-ka update samee:

#### File: `convex/actions.ts` (Line 38)

**Hore:**
```typescript
from: "AI Nutrition Tracker <onboarding@resend.dev>",
```

**Cusub:**
```typescript
from: "AI Nutrition Tracker <noreply@yourdomain.com>", // Domain-kaaga isticmaal
```

**Tusaale:**
```typescript
from: "AI Nutrition Tracker <noreply@abti33.com>",
```

---

### Step 6: Code-ka Remove (Optional - Security)

Marka domain-ka verify garayso oo email-ka si fiican u shaqeeyo, code-ka ka saar:

#### File: `convex/users.ts` (Line 462)

**Remove this line:**
```typescript
code: verificationCode, // Remove this once domain is verified
```

Markaas code-ka ma la soo bixin doono - email-ka kaliya ayaa la diraa.

---

## Testing

### Before Domain Verification:
- ✅ `abtisachs@gmail.com` → Email waa la diraa
- ❌ `user@example.com` → Email ma la dirin karo (Resend blocks)

### After Domain Verification:
- ✅ `abtisachs@gmail.com` → Email waa la diraa
- ✅ `user@example.com` → Email waa la diraa
- ✅ `anyemail@gmail.com` → Email waa la diraa
- ✅ **Email-ka kasta waa la diraa!**

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Domain (1 year) | $8-15 |
| Resend (Free tier) | FREE (3,000 emails/month) |
| DNS Setup | FREE |
| **Total (First Year)** | **$8-15** |

---

## Quick Checklist

- [ ] Domain iibsasho (haddii aad lahayn)
- [ ] Resend-ka domain ku dar
- [ ] DNS records-ka Resend-ka ka soo qaad
- [ ] DNS records-ka domain provider-kaaga ku dar
- [ ] 5-10 daqiiqo sug (DNS propagation)
- [ ] Resend-ka verify samee
- [ ] Code-ka update (`from` address)
- [ ] Test samee (email-ka kale u dir)
- [ ] Code-ka remove (optional - security)

---

## Troubleshooting

### Domain ma verify garayn?
1. DNS records-ka verify samee (exact values)
2. 10-15 daqiiqo sug (DNS propagation)
3. Resend dashboard-ka refresh samee
4. "Verify" mar kale dhagsii

### Email-ka ma imanayo?
1. Spam folder check samee
2. Resend dashboard-ka check samee (logs)
3. DNS records-ka verify samee
4. `from` address-ka verify samee

### "Invalid domain" error?
1. Domain-ka verify garayso Resend-ka
2. `from` address-ka update samee
3. Domain-kaaga isticmaal (maaha `resend.dev`)

---

## After Setup

Marka domain-ka verify garayso:
- ✅ Email-ka kasta waa la diraa
- ✅ Professional "from" address
- ✅ Better deliverability
- ✅ Spam folder ma dhici doono

**Code-ka hada waa la soo bixinayaa fallback. Marka domain-ka verify garayso, code-ka ka saar si aad u sameyso security.**

---

**Need Help?** Check `RESEND_DOMAIN_VERIFICATION.md` for more details.

