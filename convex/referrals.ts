/**
 * Referral System Functions
 * Replaces Firebase promo codes and referral tracking
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate and reserve a promo code for a user
 * Replaces: setDoc(doc(db, 'promoCodes', code), {...})
 */
export const generatePromoCode = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.string(),
  },
  handler: async (ctx, args) => {
    const base = (args.firstName || 'N').trim().toUpperCase()[0] || 'N';
    let attempts = 0;
    let code = '';
    
    // Try to generate a unique code
    while (attempts < 6) {
      const num = Math.floor(100 + Math.random() * 900); // 100-999
      code = `${base}${num}`;
      
      const existing = await ctx.db
        .query("promoCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      
      if (!existing) {
        // Code is available
        break;
      }
      
      attempts++;
    }
    
    // Fallback: use userId prefix
    if (attempts >= 6) {
      const userId = args.userId.toString();
      code = `${base}${userId.slice(-5).toUpperCase()}`;
    }
    
    // Reserve the code
    await ctx.db.insert("promoCodes", {
      code,
      userId: args.userId,
      createdAt: Date.now(),
    });
    
    // Initialize referral data on user
    const user = await ctx.db.get(args.userId);
    await ctx.db.patch(args.userId, {
      referral: {
        promoCode: code,
        referredCount: 0,
        earningsCents: 0,
        referredPeople: [],
        ...user?.referral,
      },
      updatedAt: Date.now(),
    });
    
    return { code };
  },
});

/**
 * Apply referral code when a new user signs up
 * Replaces: writeBatch with increment and arrayUnion
 */
export const applyReferralCode = mutation({
  args: {
    newUserId: v.id("users"),
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    const code = args.referralCode.trim().toUpperCase();
    
    if (!code) {
      return { success: false, error: "No code provided" };
    }
    
    // Find the promo code
    const promoCode = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    
    if (!promoCode) {
      return { success: false, error: "Invalid code" };
    }
    
    const referrerId = promoCode.userId;
    
    // Can't refer yourself
    if (referrerId === args.newUserId) {
      return { success: false, error: "Cannot use your own code" };
    }
    
    // Get referrer
    const referrer = await ctx.db.get(referrerId);
    
    if (!referrer) {
      return { success: false, error: "Referrer not found" };
    }
    
    // Update referrer's stats
    const referral = referrer.referral || {
      promoCode: '',
      referredCount: 0,
      earningsCents: 0,
      referredPeople: [],
    };
    
    await ctx.db.patch(referrerId, {
      referral: {
        ...referral,
        referredCount: referral.referredCount + 1,
        earningsCents: referral.earningsCents + 100, // $1.00 per referral
        referredPeople: [...(referral.referredPeople || []), args.newUserId.toString()],
      },
      updatedAt: Date.now(),
    });
    
    // Update new user with referral info
    const newUser = await ctx.db.get(args.newUserId);
    const existingReferral = newUser?.referral || {
      promoCode: '',
      referredCount: 0,
      earningsCents: 0,
      referredPeople: [],
    };
    
    await ctx.db.patch(args.newUserId, {
      referral: {
        promoCode: existingReferral.promoCode,
        referredCount: existingReferral.referredCount,
        earningsCents: existingReferral.earningsCents,
        referredPeople: existingReferral.referredPeople,
        usedReferrerId: referrerId.toString(),
        usedReferrerCode: code,
      },
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Get referral stats for a user
 */
export const getStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user || !user.referral) {
      return {
        promoCode: '',
        referredCount: 0,
        earningsCents: 0,
        referredPeople: [],
      };
    }
    
    return user.referral;
  },
});

/**
 * Validate if a promo code exists and is valid
 */
export const validateCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const promoCode = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.trim().toUpperCase()))
      .first();
    
    return {
      valid: !!promoCode,
      userId: promoCode?.userId,
    };
  },
});

