# 🚀 Resend API Key Setup - Tillaabooyinka

## API Key-gaaga:
```
re_ZkgYCR7c_H8bNAGZZHYxGc9PDiX47uoCY
```

## Tillaabooyinka:

### Step 1: Tag Convex Dashboard
1. Tag: https://dashboard.convex.dev
2. Login samee
3. Project-kaaga dooro

### Step 2: Environment Variables ku dar
1. Settings → Environment Variables (hadaad hoos u dhacdo)
2. "Add Variable" dhagsii
3. Ku dar:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_ZkgYCR7c_H8bNAGZZHYxGc9PDiX47uoCY`
4. "Save" dhagsii

### Step 3: Convex Functions redeploy
1. Terminal-ka gudaha:
   ```bash
   npx convex dev
   ```
2. Ama haddii production-ka tahay:
   ```bash
   npx convex deploy
   ```

### Step 4: Test samee
1. App-ka gudaha, email verification request samee
2. Email-ka waa inuu imanayaa inbox-ka
3. Code-ka email-ka ka soo qaad oo verify samee

## Important Notes:

⚠️ **Security**: 
- API key-ga maaha in code-ka gudaha la geliyo
- Convex environment variables ka kaliya ku dar
- Haddii code-ka commit sameeyso, API key-ga ma gelin

✅ **After Setup**:
- Email-ka waa la diraa dhabta ah
- Development mode-ka code-ka console-ka ma soo bixin doono
- Email-ka waa inuu imanayaa user-ka inbox-ka

## Troubleshooting:

### Email ma imanayo?
1. Spam folder check samee
2. Convex dashboard-ka verify samee in API key-ga la geliyay
3. Convex logs check samee errors-ka
4. Resend dashboard-ka check samee email-ka la diray

### "Invalid API key" error?
1. API key-ga verify samee in uu sax yahay
2. Spaces ma jiraan? (waxaad ka saari kartaa)
3. Convex functions redeploy samee

---

**Note**: API key-ga waa secret - ma share garayn kartid public-ka!

