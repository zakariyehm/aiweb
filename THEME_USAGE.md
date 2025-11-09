# 🎨 Theme System Usage Guide

## Overview

The app uses a centralized theme system that supports both **Light** and **Dark** modes automatically.

---

## 📁 Theme File

**Location:** `/constants/Colors.ts`

Contains all colors used across the app, defined for both light and dark modes.

---

## 🎯 How to Use Theme Colors

### **1. Import the Hook**

```typescript
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
```

### **2. Get Current Color Scheme**

```typescript
export default function MyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Now use colors.background, colors.text, etc.
}
```

### **3. Use Theme Colors in Styles**

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,  // ✅ Adapts to theme
  },
  text: {
    color: colors.textPrimary,           // ✅ Adapts to theme
  },
});
```

---

## 🎨 Available Colors

### **Base Colors**
- `background` - Main background color
- `text` - Default text color
- `tint` - Tint/accent color

### **Text Variants**
- `textPrimary` - Primary text (#000 light, #fff dark)
- `textSecondary` - Secondary text (#666 light, #D1D5DB dark)
- `textTertiary` - Tertiary/muted text
- `textPlaceholder` - Input placeholder text

### **Card & Containers**
- `card` - Card background
- `cardSecondary` - Secondary card background
- `border` - Border color
- `divider` - Divider line color

### **Interactive Elements**
- `buttonPrimary` - Primary button color
- `buttonSecondary` - Secondary button color
- `buttonDisabled` - Disabled button color

### **Status Colors**
- `success` - Success state (green)
- `error` - Error state (red)
- `warning` - Warning state (yellow/orange)
- `info` - Info state (blue)

### **Nutrition Colors**
- `calories` - Calories indicator
- `protein` - Protein indicator (red)
- `carbs` - Carbs indicator (yellow)
- `fat` - Fat indicator (blue)

### **Input**
- `inputBackground` - Input field background
- `inputBorder` - Input field border
- `inputPlaceholder` - Input placeholder text

### **Modal/Overlay**
- `overlay` - Modal overlay/backdrop
- `modalBackground` - Modal content background

---

## ✅ Good Examples

### **Example 1: Basic Screen**

```typescript
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Hello World
      </Text>
    </View>
  );
}
```

### **Example 2: Themed StyleSheet**

```typescript
export default function MyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return <View style={styles.container}>...</View>;
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
    },
    text: {
      color: colors.textPrimary,
    },
  });
};
```

### **Example 3: Conditional Colors**

```typescript
<View style={{
  backgroundColor: isActive 
    ? colors.buttonPrimary 
    : colors.buttonDisabled
}}>
  <Text style={{ 
    color: isActive 
      ? colors.background 
      : colors.textTertiary 
  }}>
    Submit
  </Text>
</View>
```

---

## ❌ Bad Examples (Don't Do This!)

### **❌ Hardcoded Colors**

```typescript
// BAD - Won't adapt to dark mode
<View style={{ backgroundColor: '#fff' }}>
  <Text style={{ color: '#000' }}>Text</Text>
</View>
```

### **❌ Inline Colors**

```typescript
// BAD - Should use theme
<Text style={{ color: '#666' }}>Secondary Text</Text>
```

### **❌ Custom Theme Objects**

```typescript
// BAD - Don't create your own theme
const myTheme = {
  primary: '#FFFFFF',
  secondary: '#F5F5F5',
};
```

---

## 🔄 Migration Guide

If you have hardcoded colors, replace them:

### **Before:**
```typescript
backgroundColor: '#fff'
color: '#000'
borderColor: '#E5E7EB'
```

### **After:**
```typescript
backgroundColor: colors.background
color: colors.textPrimary
borderColor: colors.border
```

---

## 🧪 Testing Themes

### **Switch Between Themes:**

On iOS:
1. Settings → Display & Brightness
2. Toggle Light/Dark

On Android:
1. Settings → Display → Dark theme
2. Toggle on/off

Your app should adapt automatically! ✅

---

## 📊 Color Contrast Guidelines

- **Light mode:** Dark text on light background
- **Dark mode:** Light text on dark background
- **Always test readability** in both modes
- **Use semantic colors** (success, error, etc.) for consistency

---

## 🎯 Best Practices

1. ✅ **Always use theme colors**
2. ✅ **Test in both light and dark mode**
3. ✅ **Use semantic color names** (textPrimary vs text1)
4. ✅ **Keep consistent** across screens
5. ❌ **Never hardcode colors**
6. ❌ **Don't create custom theme objects**

---

## 🚀 Quick Reference

```typescript
// Import
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Get colors
const colorScheme = useColorScheme() ?? 'light';
const colors = Colors[colorScheme];

// Use
backgroundColor: colors.background
color: colors.textPrimary
borderColor: colors.border
```

---

**Happy Theming!** 🎨✨

