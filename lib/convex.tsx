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
const convex = new ConvexReactClient(convexUrl || "");

/**
 * Convex Provider Component
 * Wrap your app with this to enable Convex queries and mutations
 */
export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export { convex };

