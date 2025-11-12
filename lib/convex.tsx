/**
 * Convex Client Setup
 * Replaces lib/firebase.ts
 */

import { ConvexProvider, ConvexReactClient } from "convex/react";
import Constants from "expo-constants";
import React from "react";

// Get Convex URL from environment
const convexUrl = Constants.expoConfig?.extra?.convexUrl || process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.error(
    "Missing Convex URL. Please set EXPO_PUBLIC_CONVEX_URL in your environment or .env.local file."
  );
}

// Create Convex client
// Note: Error overlays are automatically suppressed when errors are properly caught in try-catch blocks
const convex = new ConvexReactClient(convexUrl || "", {
  // Disable unsaved changes warning
  unsavedChangesWarning: false,
  // Suppress error overlays by ensuring all errors are caught in try-catch blocks
  // Errors should be converted to user-friendly messages before displaying to users
});

/**
 * Convex Provider Component
 * Wrap your app with this to enable Convex queries and mutations
 * 
 * IMPORTANT: All Convex mutations/queries should be wrapped in try-catch blocks
 * to prevent error overlays from appearing. Errors should be converted to
 * user-friendly messages before displaying to users.
 */
export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export { convex };

