/**
 * App Color System - Supports Light & Dark Mode
 * All colors used across the app are defined here
 */

const tintColorLight = '#000';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    // Base colors
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    
    // UI Elements
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Card & Container
    card: '#fff',
    cardSecondary: '#f8f9fa',
    border: '#E5E7EB',
    divider: '#E5E7EB',
    
    // Text variants
    textPrimary: '#000',
    textSecondary: '#666',
    textTertiary: '#9CA3AF',
    textPlaceholder: 'rgba(0, 0, 0, 0.4)',
    
    // Interactive elements
    buttonPrimary: '#000',
    buttonSecondary: '#fff',
    buttonDisabled: '#E5E5E5',
    
    // Status colors
    success: '#28a745',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Nutrition colors
    calories: '#000',
    protein: '#F87171',
    carbs: '#FBBF24',
    fat: '#3B82F6',
    
    // Shadows
    shadow: '#000',
    shadowLight: 'rgba(0, 0, 0, 0.1)',
    
    // Input
    inputBackground: '#fff',
    inputBorder: '#E5E7EB',
    inputPlaceholder: 'rgba(0, 0, 0, 0.4)',
    
    // Modal/Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#fff',
  },
  dark: {
    // Base colors - iOS style dark mode
    text: '#ECEDEE',
    background: '#000000',  // Pure black background like iOS
    tint: tintColorDark,
    
    // UI Elements
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    
    // Card & Container - Elevated surfaces in dark mode
    card: '#1C1C1E',           // iOS dark card color
    cardSecondary: '#2C2C2E',  // Slightly lighter for contrast
    border: '#38383A',         // Subtle borders
    divider: '#38383A',
    
    // Text variants - iOS dark mode text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#EBEBF5',  // iOS secondary label
    textTertiary: '#8E8E93',   // iOS tertiary label
    textPlaceholder: 'rgba(235, 235, 245, 0.3)',  // iOS placeholder
    
    // Interactive elements
    buttonPrimary: '#FFFFFF',
    buttonSecondary: '#1C1C1E',
    buttonDisabled: '#3A3A3C',
    
    // Status colors - Brighter for dark mode
    success: '#30D158',   // iOS green
    error: '#FF453A',     // iOS red
    warning: '#FFD60A',   // iOS yellow
    info: '#0A84FF',      // iOS blue
    
    // Nutrition colors - More vibrant for dark mode
    calories: '#FFFFFF',
    protein: '#FF453A',   // Bright red
    carbs: '#FFD60A',     // Bright yellow
    fat: '#0A84FF',       // Bright blue
    
    // Shadows - Deeper in dark mode
    shadow: '#000000',
    shadowLight: 'rgba(0, 0, 0, 0.5)',
    
    // Input - iOS style inputs
    inputBackground: '#1C1C1E',
    inputBorder: '#38383A',
    inputPlaceholder: 'rgba(235, 235, 245, 0.3)',
    
    // Modal/Overlay - iOS style
    overlay: 'rgba(0, 0, 0, 0.75)',
    modalBackground: '#1C1C1E',
  },
};
