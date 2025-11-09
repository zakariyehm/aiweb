# 🎨 Theme Migration TODO

## Current Status

The theme system is now **expanded and ready**! ✅

**Colors.ts** now includes:
- ✅ 40+ colors for light mode
- ✅ 40+ colors for dark mode
- ✅ All semantic color names
- ✅ Complete coverage for all UI elements

---

## 📊 Hardcoded Colors Analysis

### **Files Using Hardcoded Colors:**

#### **High Priority** (Main User-Facing Screens):
1. **`app/(tabs)/index.tsx`** - Home Screen
   - ~50+ hardcoded colors
   - Status: ⚠️ Needs migration
   
2. **`app/(tabs)/profile.tsx`** - Profile Screen
   - ~40+ hardcoded colors
   - Status: ⚠️ Needs migration
   
3. **`app/(tabs)/analytics.tsx`** - Analytics Screen
   - ~30+ hardcoded colors
   - Status: ⚠️ Needs migration
   
4. **`app/(tabs)/settings.tsx`** - Settings Screen
   - ~20+ hardcoded colors
   - Status: ⚠️ Needs migration

#### **Medium Priority** (Action Dialogs):
5. **`app/actionDialog/scanResults.tsx`** - Scan Results
   - ~25+ hardcoded colors
   - Status: ⚠️ Needs migration
   
6. **`app/actionDialog/fixResults.tsx`** - Fix Results
   - ~15+ hardcoded colors
   - Status: ⚠️ Needs migration

#### **Low Priority** (Onboarding - Usually Fixed Theme):
7. **`app/onboarding/signin.tsx`**
8. **`app/onboarding/personal-info.tsx`**
9. **`app/onboarding/welcome.tsx`**
10. **`app/onboarding/splash.tsx`**

---

## 🔧 Migration Steps (For Each File)

### **Step 1: Import Theme**

Add at top of file:
```typescript
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
```

### **Step 2: Get Current Colors**

In component:
```typescript
const colorScheme = useColorScheme() ?? 'light';
const colors = Colors[colorScheme];
```

### **Step 3: Replace Hardcoded Colors**

Find & Replace:
```typescript
// Before:
backgroundColor: '#fff'
color: '#000'
borderColor: '#E5E7EB'

// After:
backgroundColor: colors.background
color: colors.textPrimary
borderColor: colors.border
```

### **Step 4: Update StyleSheet**

```typescript
// Option A: Dynamic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Remove backgroundColor from here
  },
});

// Then use inline:
<View style={[styles.container, { backgroundColor: colors.background }]}>

// Option B: Dynamic stylesheet function
const createStyles = (colors: typeof Colors.light) => 
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

const styles = createStyles(colors);
```

---

## 📝 Color Mapping Guide

### **Common Replacements:**

| Hardcoded | Theme Color | Usage |
|-----------|-------------|-------|
| `#fff` | `colors.background` | Background |
| `#000` | `colors.textPrimary` | Primary text |
| `#666` | `colors.textSecondary` | Secondary text |
| `#9CA3AF` | `colors.textTertiary` | Tertiary text |
| `#f8f9fa` | `colors.cardSecondary` | Card background |
| `#E5E7EB` | `colors.border` | Borders |
| `#EF4444` | `colors.error` | Error state |
| `#28a745` | `colors.success` | Success state |
| `#F87171` | `colors.protein` | Protein indicator |
| `#FBBF24` | `colors.carbs` | Carbs indicator |
| `#3B82F6` | `colors.fat` | Fat indicator |

---

## ✅ Example Migration

### **Before:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f8f9fa',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
```

### **After:**
```typescript
export default function MyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.cardSecondary,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return <View style={styles.container}>...</View>;
}
```

---

## 🎯 Priority Order

### **Phase 1: Core Screens** (Do First)
1. ✅ `constants/Colors.ts` - DONE!
2. ⚠️ `app/(tabs)/index.tsx` - Home
3. ⚠️ `app/(tabs)/profile.tsx` - Profile
4. ⚠️ `app/(tabs)/analytics.tsx` - Analytics
5. ⚠️ `app/(tabs)/settings.tsx` - Settings

### **Phase 2: Action Dialogs** (Do Second)
6. ⚠️ `app/actionDialog/scanResults.tsx`
7. ⚠️ `app/actionDialog/fixResults.tsx`
8. ⚠️ `app/actionDialog/upload.tsx`
9. ⚠️ `app/actionDialog/saved.tsx`

### **Phase 3: Onboarding** (Optional)
10. `app/onboarding/signin.tsx`
11. `app/onboarding/personal-info.tsx`
12. `app/onboarding/welcome.tsx`
13. `app/onboarding/splash.tsx`

---

## 🧪 Testing Checklist

After migration, test each screen in:

- [ ] **Light Mode** - All elements visible?
- [ ] **Dark Mode** - All elements visible?
- [ ] **Text Contrast** - Readable?
- [ ] **Buttons** - Visible in both modes?
- [ ] **Cards** - Properly distinguished?
- [ ] **Borders** - Visible but not harsh?
- [ ] **Icons** - Proper color?

---

## 🚀 Quick Migration Command

For each file:

```bash
# 1. Open file
# 2. Add imports at top
# 3. Add colorScheme and colors in component
# 4. Find/Replace hardcoded colors
# 5. Test in both light and dark mode
# 6. Commit changes
```

---

## 📊 Progress Tracking

- [x] Theme system expanded
- [x] Documentation created
- [ ] Home screen migrated
- [ ] Profile screen migrated
- [ ] Analytics screen migrated
- [ ] Settings screen migrated
- [ ] Scan results migrated
- [ ] Fix results migrated
- [ ] All screens tested

---

## 🎉 Benefits After Migration

✅ **Automatic dark mode support**
✅ **Consistent colors across app**
✅ **Easy to update theme**
✅ **Better user experience**
✅ **Professional appearance**
✅ **Accessibility improved**

---

**Ready to migrate!** Start with Home screen (`index.tsx`) 🚀

