# Daily Nutrition Tracking System

## Overview
The Daily Nutrition Tracking System provides comprehensive tracking of daily food intake, including calories, protein, carbs, and fat. It automatically resets at midnight and provides real-time updates to the UI.

## Features

### 1. Recently Eaten (Daily Log)
- Tracks all foods added today
- Each entry displays: name, calories, macros, and time
- Automatically updates when new foods are added
- Clears at midnight for new day

### 2. Daily Totals & Progress Circles
- Real-time calculation of daily totals
- Progress circles show consumption vs. daily targets
- Updates automatically after each food entry
- Displays current consumption vs. target (e.g., "28.6g / 50g")

### 3. New Day Reset
- Automatically detects midnight
- Clears "Recently eaten" list
- Resets all progress circles to zero
- Starts fresh tracking for new day

### 4. Data Persistence
- Stores entries in Firestore with date field
- Maintains data across app sessions
- Automatically filters by current date

## Implementation Details

### Hook: `useDailyNutrition`
```typescript
const { 
  recentlyEaten,      // Array of today's food entries
  dailyTotals,        // Current day's totals
  loading,            // Loading state
  addFoodEntry,       // Function to add new food
  resetForNewDay,     // Function to reset for new day
  getProgressPercentages, // Calculate progress for UI circles
  currentDateKey      // Current date being tracked
} = useDailyNutrition(userId);
```

### Adding Food Entries
```typescript
await addFoodEntry({
  title: "2 Eggs",
  calories: 193,
  proteinG: 11.6,
  carbsG: 10,
  fatG: 14.3,
  imageUri: "path/to/image.jpg"
});
```

### Data Structure
Each food entry includes:
- `id`: Unique identifier
- `title`: Food name
- `calories`: Calorie content
- `proteinG`: Protein in grams
- `carbsG`: Carbohydrates in grams
- `fatG`: Fat in grams
- `imageUri`: Optional image path
- `createdAt`: Timestamp
- `date`: Date string (YYYY-MM-DD)

## Usage Examples

### 1. Basic Food Addition
When a user scans food or manually inputs nutrition data:
1. Call `addFoodEntry()` with food data
2. Entry automatically appears in "Recently eaten"
3. Daily totals update immediately
4. Progress circles reflect new consumption

### 2. Daily Progress Display
The home screen shows:
- Today's total calories, protein, carbs, and fat
- Progress circles with current vs. target values
- Chronological list of foods eaten today

### 3. Midnight Reset
- System automatically detects new day
- Clears all daily data
- Resets progress circles
- Prepares for fresh tracking

## Integration Points

### Scan Results Screen
- Uses `addFoodEntry()` when user confirms food
- Automatically adds to today's tracking
- No manual date management needed

### Home Screen
- Displays daily totals summary
- Shows "Recently eaten" list
- Updates progress circles in real-time

### Data Flow
1. User scans/inputs food → `addFoodEntry()`
2. Food added to Firestore with date
3. Local state updates immediately
4. UI reflects new totals and progress
5. At midnight, system resets automatically

## Benefits

1. **Real-time Updates**: UI updates immediately after adding food
2. **Automatic Date Management**: No manual date handling required
3. **Persistent Storage**: Data survives app restarts
4. **Automatic Reset**: Clean slate every day at midnight
5. **Progress Tracking**: Visual feedback on daily goals
6. **Efficient Queries**: Only fetches today's data

## Future Enhancements

- Weekly/monthly summaries
- Meal categorization (breakfast, lunch, dinner)
- Nutritional insights and recommendations
- Export functionality
- Goal setting and achievement tracking
