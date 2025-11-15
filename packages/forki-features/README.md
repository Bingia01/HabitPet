# @forki/features

Modular food analysis and logging features for Forki. Framework-agnostic package that provides accurate calorie calculation and Supabase logging.

## ✨ Features

- 🧮 **Accurate Calorie Calculation**: 3-path router (Label/Menu/Geometry) with fallback chain
- 📊 **Macro Tracking**: Protein, carbs, fat, and fiber calculation with 4-tier fallback
- 📸 **Camera Capture**: Framework-agnostic camera management
- 💾 **Supabase Logging**: Automatic food log saving with unique user IDs
- 🔄 **Zero Configuration**: Uses shared infrastructure (same Supabase, Vercel, OpenAI)

## 📦 Installation

This package is part of the HabitPet monorepo. To use it in your project:

### Option 1: Import from monorepo (Current Setup)

```typescript
import { foodAnalyzer, foodLogger, cameraCapture } from '@forki/features';
```

The TypeScript path mapping is already configured in `tsconfig.json`.

### Option 2: Publish to npm (Future)

```bash
npm install @forki/features
```

## 🚀 Quick Start

### Zero Configuration (Uses Shared Env Vars)

```typescript
import { foodAnalyzer, foodLogger, cameraCapture } from '@forki/features';

// Analyze food image
const analysis = await foodAnalyzer.analyzeImage(imageBlob);
// Returns: { foodType, calories, weight, macros, emoji, ... }

// Log to Supabase
const log = await foodLogger.saveLog({
  food_type: analysis.foodType,
  calories: analysis.calories,
  weight_g: analysis.weight,
  protein_g: analysis.macros.proteinG,
  carbs_g: analysis.macros.carbsG,
  fat_g: analysis.macros.fatG,
  emoji: analysis.emoji,
  ingredients: [analysis.foodType],
  portion_size: 'Standard serving',
});
```

### Custom Configuration (If Needed)

```typescript
import { ForkiFeatures } from '@forki/features';

const forki = new ForkiFeatures({
  apiUrl: 'https://your-api.com/api/analyze-food',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
});

const analysis = await forki.analyzer.analyzeImage(imageBlob);
const log = await forki.logger.saveLog({ ... });
```

## 📚 API Reference

### FoodAnalyzer

Analyzes food images and returns calorie/macro information.

```typescript
// Analyze image (Blob, File, base64 string, or URL)
const result = await foodAnalyzer.analyzeImage(image);

// Result:
interface FoodAnalysisResult {
  foodType: string;
  confidence: number;
  calories: number;
  weight: number; // grams
  emoji: string;
  macros?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
  };
  analyzerSource?: 'supabase' | 'openai' | 'stub';
  usedFallback?: boolean;
}
```

**Features:**
- Automatic fallback chain: Supabase → OpenAI → Stub
- Macro-based calorie calculation (most accurate)
- 3-path router: Label (OCR), Menu (database), Geometry (volume)

### FoodLogger

Saves and retrieves food logs from Supabase.

```typescript
// Save food log (user_id auto-filled if not provided)
const log = await foodLogger.saveLog({
  food_type: 'Grilled Chicken',
  calories: 250,
  weight_g: 150,
  protein_g: 30,
  carbs_g: 0,
  fat_g: 10,
  emoji: '🍗',
  ingredients: ['chicken'],
  portion_size: 'Standard serving',
  logged_at: new Date().toISOString(),
});

// Get logs
const logs = await foodLogger.getLogs(userId, limit, offset);

// Get logs by date range
const logs = await foodLogger.getLogsByDateRange(startDate, endDate, userId);

// Update log
await foodLogger.updateLog(logId, { calories: 300 });

// Delete log
await foodLogger.deleteLog(logId);

// Get daily/weekly calories
const daily = await foodLogger.getDailyCalories('2025-01-20', userId);
const weekly = await foodLogger.getWeeklyCalories('2025-01-20', userId);
```

**Features:**
- Automatic user ID management (UUID v4, stored in localStorage)
- Full CRUD operations
- Date range queries
- Calorie aggregation

### CameraCapture

Framework-agnostic camera management.

```typescript
// Start camera
const stream = await cameraCapture.startCamera({
  facingMode: 'environment', // or 'user'
  width: 1920,
  height: 1080,
});

// Attach to video element
videoElement.srcObject = stream;

// Capture photo
const blob = await cameraCapture.capturePhoto(videoElement, canvasElement);

// Stop camera
cameraCapture.stopCamera();
```

**Features:**
- Automatic error handling
- Image validation (size, dimensions)
- Stream management

## 🔧 Configuration

The package automatically reads from environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_VERCEL_URL` or `VERCEL_URL` - Vercel API URL (for `/api/analyze-food`)
- `OPENAI_API_KEY` - OpenAI API key (for fallback analyzer)

## 🎯 Usage Examples

### React/Next.js

```typescript
'use client';

import { foodAnalyzer, foodLogger } from '@forki/features';
import { useState } from 'react';

export function FoodCapture() {
  const [analyzing, setAnalyzing] = useState(false);
  
  const handleImage = async (image: File) => {
    setAnalyzing(true);
    try {
      // Analyze
      const analysis = await foodAnalyzer.analyzeImage(image);
      
      // Log
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
      });
      
      alert(`Logged ${analysis.calories} calories!`);
    } finally {
      setAnalyzing(false);
    }
  };
  
  return <input type="file" onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />;
}
```

### Vue.js

```typescript
<script setup lang="ts">
import { foodAnalyzer, foodLogger } from '@forki/features';
import { ref } from 'vue';

const analyzing = ref(false);

const handleImage = async (file: File) => {
  analyzing.value = true;
  try {
    const analysis = await foodAnalyzer.analyzeImage(file);
    await foodLogger.saveLog({
      food_type: analysis.foodType,
      calories: analysis.calories,
      // ... rest of fields
    });
  } finally {
    analyzing.value = false;
  }
};
</script>
```

### Vanilla JavaScript

```javascript
import { foodAnalyzer, foodLogger } from '@forki/features';

async function logFood(imageFile) {
  const analysis = await foodAnalyzer.analyzeImage(imageFile);
  const log = await foodLogger.saveLog({
    food_type: analysis.foodType,
    calories: analysis.calories,
    weight_g: analysis.weight,
    // ... rest of fields
  });
  console.log('Logged:', log);
}
```

## 🏗️ Architecture

```
User Image
    ↓
FoodAnalyzer
    ├─ Try Supabase Edge Function (3-path router)
    ├─ Fallback to OpenAI Vision API
    └─ Fallback to Stub (always works)
    ↓
FoodAnalysisResult (calories, macros, weight)
    ↓
FoodLogger.saveLog()
    ↓
Supabase Database (food_logs table)
```

## 📋 Requirements

- **Supabase Project**: Shared Supabase instance (same URL/key)
- **Vercel API**: Shared Vercel deployment with `/api/analyze-food` endpoint
- **OpenAI API Key**: Shared OpenAI API key (for fallback)

## 🔒 Security

- All API keys read from environment variables
- No hardcoded credentials
- User IDs are UUID v4 (anonymous, stored locally)
- Supabase RLS policies apply

## 🐛 Troubleshooting

### "Supabase credentials missing"

Set environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "API URL not configured"

The package tries to detect Vercel URL automatically. If it fails, set:
- `NEXT_PUBLIC_VERCEL_URL` or `VERCEL_URL`

### "All analyzers failed"

Check that at least one analyzer is configured:
- Supabase: `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- OpenAI: `OPENAI_API_KEY`
- Stub: Always available (fallback)

## 📝 License

MIT

## 🤝 Contributing

This package is part of the HabitPet monorepo. Changes should be made in `packages/forki-features/` and tested before integration.

