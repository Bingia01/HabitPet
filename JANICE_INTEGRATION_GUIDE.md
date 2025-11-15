# Integration Guide for Janice

## What We Built

We've created a **modular package** called `@forki/features` that contains all the core food analysis and logging features. Think of it like a toolbox - instead of having all the tools scattered around, we've organized them into one easy-to-use package.

## Why We Built It This Way

**The Problem:**
- Food analysis code was mixed into the web app
- Hard to reuse in different projects
- Difficult to maintain and update

**The Solution:**
- Extracted all core features into a separate package
- Made it work with any framework (React, Vue, vanilla JS, etc.)
- Zero configuration needed - automatically uses shared infrastructure

## What's Inside the Package

The package has three main parts:

### 1. Food Analyzer (`foodAnalyzer`)
**What it does:** Analyzes food photos and tells you what's in them

**How it works:**
- Takes a photo (as a file, blob, or image URL)
- Sends it to AI services (Supabase, OpenAI, or fallback)
- Returns: food name, calories, weight, and macros (protein, carbs, fat)

**Example:**
```typescript
const analysis = await foodAnalyzer.analyzeImage(photoFile);
// Returns: { foodType: "banana", calories: 105, weight: 118, macros: {...} }
```

### 2. Food Logger (`foodLogger`)
**What it does:** Saves food logs to the Supabase database

**How it works:**
- Automatically creates a unique user ID (stores it in browser storage)
- Saves food logs with all the details (calories, macros, etc.)
- Can retrieve, update, or delete logs

**Example:**
```typescript
await foodLogger.saveLog({
  food_type: "banana",
  calories: 105,
  weight_g: 118,
  protein_g: 1.3,
  carbs_g: 27,
  fat_g: 0.4
});
```

### 3. Camera Capture (`cameraCapture`)
**What it does:** Handles camera access and photo capture

**How it works:**
- Starts the camera stream
- Captures photos from the video
- Validates the image (size, dimensions)
- Returns the photo as a file you can use

**Example:**
```typescript
const stream = await cameraCapture.startCamera();
const photo = await cameraCapture.capturePhoto(videoElement, canvasElement);
```

## How to Use It in Your App

### Step 1: Import the Package

At the top of your file, import what you need:

```typescript
import { foodAnalyzer, foodLogger, cameraCapture } from '@forki/features';
```

That's it! No configuration needed - it automatically uses the shared Supabase, Vercel, and OpenAI setup.

### Step 2: Use the Features

#### Example: Complete Food Logging Flow

```typescript
// 1. Start camera
const stream = await cameraCapture.startCamera();
// (You'll need to attach this to a <video> element in your UI)

// 2. Capture photo (when user clicks "Take Photo")
const photo = await cameraCapture.capturePhoto(videoElement, canvasElement);

// 3. Analyze the photo
const analysis = await foodAnalyzer.analyzeImage(photo);
// Returns: { foodType, calories, weight, macros, emoji, ... }

// 4. Save to database
await foodLogger.saveLog({
  food_type: analysis.foodType,
  calories: analysis.calories,
  weight_g: analysis.weight,
  protein_g: analysis.macros?.proteinG,
  carbs_g: analysis.macros?.carbsG,
  fat_g: analysis.macros?.fatG,
  emoji: analysis.emoji,
  ingredients: [analysis.foodType],
  portion_size: 'Standard serving',
  logged_at: new Date().toISOString(),
});

// 5. Stop camera when done
cameraCapture.stopCamera(stream);
```

### Step 3: Display Food Logs

```typescript
// Get all logs for the current user
const logs = await foodLogger.getLogs();

// Get logs for a specific date range
const todayLogs = await foodLogger.getLogsByDateRange(
  '2024-01-20T00:00:00Z',
  '2024-01-20T23:59:59Z'
);

// Each log has: food_type, calories, weight_g, protein_g, carbs_g, fat_g, etc.
```

## Important Concepts Explained

### What is "Lazy Initialization"?

**The Problem:** When code runs, it tries to read environment variables (like Supabase URL). But sometimes those variables aren't ready yet, causing errors.

**The Solution:** Instead of creating things immediately, we wait until you actually use them. The first time you call `foodLogger.saveLog()`, that's when it sets everything up. By then, all the environment variables are ready.

**What this means for you:** Nothing! It just works. You don't need to worry about it.

### What is "Shared Infrastructure"?

We (you and I) use the same:
- **Supabase database** - where food logs are stored
- **Vercel API** - the backend that processes food photos
- **OpenAI** - the AI that identifies food

The package automatically reads these from environment variables, so you don't need to configure anything.

### What is "Framework-Agnostic"?

It means the package doesn't depend on React, Vue, or any specific framework. It's just plain TypeScript/JavaScript. This means:
- You can use it with any framework you want
- You can use it in vanilla JavaScript projects
- You can use it in mobile apps (with some adaptation)

## Common Tasks

### Task 1: Analyze a Food Photo

```typescript
// User takes a photo
const photoFile = /* from your camera component */;

// Analyze it
const result = await foodAnalyzer.analyzeImage(photoFile);

console.log(result);
// {
//   foodType: "grilled chicken breast",
//   calories: 231,
//   weight: 150,
//   macros: {
//     proteinG: 43.5,
//     carbsG: 0,
//     fatG: 5.0
//   },
//   emoji: "🍗",
//   confidence: 0.92
// }
```

### Task 2: Save a Food Log

```typescript
await foodLogger.saveLog({
  food_type: "grilled chicken breast",
  calories: 231,
  weight_g: 150,
  protein_g: 43.5,
  carbs_g: 0,
  fat_g: 5.0,
  emoji: "🍗",
  ingredients: ["chicken breast"],
  portion_size: "1 piece",
  logged_at: new Date().toISOString()
});
```

### Task 3: Get User's Food Logs

```typescript
// Get last 10 logs
const recentLogs = await foodLogger.getLogs(undefined, 10);

// Get logs for today
const today = new Date().toISOString().split('T')[0];
const todayLogs = await foodLogger.getLogsByDateRange(
  `${today}T00:00:00Z`,
  `${today}T23:59:59Z`
);
```

### Task 4: Update or Delete a Log

```typescript
// Update a log
await foodLogger.updateLog(logId, {
  calories: 250, // User corrected the calories
});

// Delete a log
await foodLogger.deleteLog(logId);
```

## Error Handling

The package handles errors gracefully:

```typescript
try {
  const analysis = await foodAnalyzer.analyzeImage(photo);
  await foodLogger.saveLog({ ...analysis });
} catch (error) {
  // Handle error (show message to user, retry, etc.)
  console.error('Failed to analyze or save food:', error);
}
```

**Common errors:**
- **Network error:** The AI service is down - the package will try fallback services
- **Invalid image:** Photo is too small or corrupted - check image before analyzing
- **Database error:** Supabase connection issue - show user-friendly message

## User ID Management

The package automatically:
1. Generates a unique ID for each user (UUID v4)
2. Stores it in browser localStorage (or your custom storage)
3. Uses the same ID for all their food logs

**You don't need to do anything** - it just works. The user ID persists across browser sessions.

If you want to use a different storage (like AsyncStorage in React Native):

```typescript
import { FoodLogger } from '@forki/features';

const customLogger = new FoodLogger({
  supabaseUrl: 'your-url',
  supabaseKey: 'your-key',
  storage: {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
  }
});
```

## Customization

### Option 1: Use Pre-configured Instances (Easiest)

```typescript
import { foodAnalyzer, foodLogger, cameraCapture } from '@forki/features';
// That's it! Uses shared infrastructure automatically
```

### Option 2: Create Custom Instances

```typescript
import { FoodAnalyzer, FoodLogger, CameraCapture } from '@forki/features';

const myAnalyzer = new FoodAnalyzer({
  apiUrl: 'https://your-api.com/analyze',
  supabaseUrl: 'your-supabase-url',
  supabaseKey: 'your-supabase-key',
  openaiKey: 'your-openai-key'
});
```

### Option 3: Use the Convenience Class

```typescript
import { ForkiFeatures } from '@forki/features';

const forki = new ForkiFeatures({
  // Optional: override any config
  openaiKey: 'custom-key'
});

await forki.analyzer.analyzeImage(photo);
await forki.logger.saveLog({ ... });
```

## What You Need to Do

### 1. Install Dependencies (if needed)

The package uses:
- `@supabase/supabase-js` - for database operations
- Standard browser APIs - for camera and file handling

Make sure these are in your `package.json`.

### 2. Set Up Environment Variables

The package reads from these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (optional, for better analysis)

**You already have these set up** (we share the same infrastructure), so you might not need to do anything.

### 3. Import and Use

Just import and start using:

```typescript
import { foodAnalyzer, foodLogger } from '@forki/features';

// Use it!
const analysis = await foodAnalyzer.analyzeImage(photo);
await foodLogger.saveLog({ ...analysis });
```

### 4. Build Your UI

The package handles the logic - you just need to build the user interface:
- Camera component (use `cameraCapture` for the logic)
- Food analysis display (use `foodAnalyzer` results)
- Food log list (use `foodLogger.getLogs()`)

## Example: Complete Component

Here's a complete example of a food logging component:

```typescript
import { useState } from 'react';
import { foodAnalyzer, foodLogger, cameraCapture } from '@forki/features';

function FoodLoggerComponent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handlePhoto = async (photoFile) => {
    setIsAnalyzing(true);
    try {
      // Analyze photo
      const analysis = await foodAnalyzer.analyzeImage(photoFile);
      setResult(analysis);

      // Save to database
      await foodLogger.saveLog({
        food_type: analysis.foodType,
        calories: analysis.calories,
        weight_g: analysis.weight,
        protein_g: analysis.macros?.proteinG,
        carbs_g: analysis.macros?.carbsG,
        fat_g: analysis.macros?.fatG,
        emoji: analysis.emoji,
        ingredients: [analysis.foodType],
        portion_size: 'Standard serving',
        logged_at: new Date().toISOString(),
      });

      alert('Food logged successfully!');
    } catch (error) {
      alert('Failed to analyze food: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      {/* Your camera UI here */}
      {isAnalyzing && <p>Analyzing...</p>}
      {result && (
        <div>
          <h3>{result.foodType} {result.emoji}</h3>
          <p>Calories: {result.calories}</p>
          <p>Protein: {result.macros?.proteinG}g</p>
          <p>Carbs: {result.macros?.carbsG}g</p>
          <p>Fat: {result.macros?.fatG}g</p>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### "Module not found: @forki/features"

**Solution:** Make sure the package is in your `packages/forki-features` directory and your `tsconfig.json` has the path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@forki/features": ["./packages/forki-features/src/index.ts"]
    }
  }
}
```

### "Supabase credentials not found"

**Solution:** Make sure your `.env.local` (or environment variables) has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Food analysis returns stub data"

**Solution:** This means the real analyzers (Supabase, OpenAI) aren't available. Check:
1. Environment variables are set correctly
2. Supabase project is active
3. OpenAI API key is valid (if using OpenAI)

The package will always fall back to stub data if real analyzers fail, so your app won't break.

## Summary

**What you get:**
- ✅ Food photo analysis (AI-powered)
- ✅ Automatic calorie and macro calculation
- ✅ Database logging (Supabase)
- ✅ Camera handling
- ✅ Zero configuration needed

**What you need to do:**
1. Import the package
2. Use the functions
3. Build your UI

**That's it!** The package handles all the complex logic, error handling, and database operations. You just need to call the functions and display the results.

## Questions?

If you have questions or run into issues:
1. Check the error message - it usually tells you what's wrong
2. Check environment variables are set correctly
3. Check the browser console for detailed error logs
4. The package includes helpful error messages to guide you

Good luck with your integration! 🚀

