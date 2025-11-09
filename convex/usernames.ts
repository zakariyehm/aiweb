/**
 * Username Management Functions
 * Replaces Firebase username reservation system
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if a username is available
 * Replaces: getDoc(doc(db, 'usernames', lower))
 */
export const checkAvailability = mutation({
  args: { 
    username: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const lower = args.username.toLowerCase().trim();
    
    // Validate format
    if (!/^[a-z0-9._]{3,20}$/.test(lower)) {
      return { available: false, reason: "invalid_format" };
    }
    
    const existing = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", lower))
      .first();
    
    if (existing) {
      // Check if it's the current user's own username
      if (existing.userId === args.userId) {
        return { available: true, isOwn: true };
      }
      return { available: false, reason: "taken", userId: existing.userId };
    }
    
    return { available: true };
  },
});

/**
 * Reserve a username for a user
 * Replaces: writeBatch for username reservation
 */
export const reserve = mutation({
  args: {
    userId: v.id("users"),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const lower = args.username.toLowerCase().trim();
    
    // Validate format
    if (!/^[a-z0-9._]{3,20}$/.test(lower)) {
      throw new Error("Invalid username format. Use 3-20 letters, numbers, dot, or underscore.");
    }
    
    // Check if already taken
    const existing = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", lower))
      .first();
    
    if (existing && existing.userId !== args.userId) {
      throw new Error("Username not available. Please choose another.");
    }
    
    // Get user's current username
    const user = await ctx.db.get(args.userId);
    const currentUsername = user?.profile?.usernameLower;
    
    // If user has a different username, release it
    if (currentUsername && currentUsername !== lower) {
      const oldReservation = await ctx.db
        .query("usernames")
        .withIndex("by_username", (q) => q.eq("username", currentUsername))
        .first();
      
      if (oldReservation && oldReservation.userId === args.userId) {
        await ctx.db.delete(oldReservation._id);
      }
    }
    
    // Reserve new username
    if (!existing) {
      await ctx.db.insert("usernames", {
        username: lower,
        userId: args.userId,
        updatedAt: Date.now(),
      });
    } else {
      // Update existing reservation
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
      });
    }
    
    // Update user profile
    await ctx.db.patch(args.userId, {
      profile: {
        ...user?.profile,
        username: args.username,
        usernameLower: lower,
        usernameManualChangedAt: Date.now(),
        usernameManualChanged: true,
      },
      updatedAt: Date.now(),
    });
    
    return { success: true, username: args.username };
  },
});

/**
 * Get username for a user
 */
export const getForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.profile?.username;
  },
});

/**
 * Find user by username
 */
export const findUser = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const lower = args.username.toLowerCase().trim();
    
    const reservation = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", lower))
      .first();
    
    if (!reservation) {
      return null;
    }
    
    return await ctx.db.get(reservation.userId);
  },
});

