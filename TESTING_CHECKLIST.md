# Testing Checklist - @forki/features Integration

## ✅ Automated Checks (Completed)

- [x] **Build succeeds** - `npm run build` passes
- [x] **No TypeScript errors** - All type issues resolved
- [x] **No linter errors** - Code passes linting
- [x] **SSR-safe** - All localStorage access guarded
- [x] **Dev server starts** - `npm run dev` runs successfully
- [x] **Landing page loads** - `/landing` route accessible
- [x] **Package integration** - `@forki/features` imports work
- [x] **DatabaseService uses package** - `foodLogger` integration verified
- [x] **CameraCapture uses package** - `cameraCapture` integration verified

## 🧪 Manual Testing Required

### 1. Camera Capture Flow
**Test Path:** Navigate to `/add-food` → Click "Add Food" → Use Camera

- [ ] Camera permission prompt appears
- [ ] Camera stream displays correctly
- [ ] "Take Photo" button captures image
- [ ] Preview shows captured image
- [ ] "Analyze Food" button triggers analysis
- [ ] Analysis results display (food type, calories, macros)
- [ ] "Retake Photo" button restarts camera (no black screen)
- [ ] "Yes, Submit" button saves to Supabase
- [ ] Success message appears after submission

### 2. Food Analysis Accuracy
**Test Path:** Capture different food items

- [ ] **Banana** - Should show ~100-120 calories (not 12!)
- [ ] **Chicken** - Should identify correctly (not "chicken sandwich" if just chicken)
- [ ] **Macros display** - Protein, Carbs, Fat shown correctly
- [ ] **Analyzer source** - Shows which analyzer was used (Supabase/OpenAI/Stub)
- [ ] **Fallback indicator** - Shows if fallback was used

### 3. Food Logging to Supabase
**Test Path:** After capturing food → Submit

- [ ] Food log appears in dashboard immediately
- [ ] Food log persists after page refresh
- [ ] Check Supabase dashboard - log appears in `food_logs` table
- [ ] Log includes: `food_type`, `calories`, `weight_g`, `protein_g`, `carbs_g`, `fat_g`
- [ ] Log has correct `user_id` (UUID from localStorage)
- [ ] Log has `created_at` timestamp

### 4. User ID Persistence
**Test Path:** Open app → Check localStorage → Close and reopen

- [ ] `forki-user-id` exists in localStorage
- [ ] User ID is UUID v4 format
- [ ] Same user ID persists across sessions
- [ ] Food logs from previous session load on mount

### 5. Error Handling
**Test Path:** Various error scenarios

- [ ] **No camera permission** - Shows user-friendly error with retry
- [ ] **Network error** - Falls back to stub analyzer
- [ ] **Analysis timeout** - Shows timeout error after 30s
- [ ] **Supabase error** - Falls back to localStorage, shows warning
- [ ] **Invalid image** - Shows validation error

### 6. Package Integration (For Janice)
**Test Path:** Verify package exports work

- [ ] `import { foodAnalyzer } from '@forki/features'` works
- [ ] `import { foodLogger } from '@forki/features'` works
- [ ] `import { cameraCapture } from '@forki/features'` works
- [ ] Pre-configured instances use shared env vars
- [ ] No configuration needed - works out of the box

## 🔍 Browser Console Checks

Open browser DevTools → Console tab, check for:

- [ ] No `localStorage is not defined` errors
- [ ] No `ReferenceError: window is not defined` errors
- [ ] No TypeScript type errors
- [ ] No missing module errors
- [ ] `[DemoContext]` logs appear (for debugging)
- [ ] `[analyze-food]` logs appear (for API calls)

## 📊 Supabase Dashboard Verification

1. Go to Supabase Dashboard → Table Editor → `food_logs`
2. Verify:
   - [ ] New logs appear after submission
   - [ ] All columns populated: `food_type`, `calories`, `weight_g`, `protein_g`, `carbs_g`, `fat_g`
   - [ ] `user_id` is UUID format
   - [ ] `logged_at` and `created_at` timestamps are correct

## 🚨 Known Issues to Watch For

1. **Banana showing 12 calories** - Should be ~100-120 (fixed in Edge Function)
2. **Chicken misidentified** - Should be "chicken" not "chicken sandwich" (fixed in prompt)
3. **Camera black screen on retake** - Should restart cleanly (fixed in ImprovedCameraCapture)
4. **Food not logging** - Should save to Supabase (fixed in DemoContext)

## ✅ Quick Test Commands

```bash
# Start dev server
npm run dev

# Check build
npm run build

# Check types
npx tsc --noEmit

# Check linting
npm run lint
```

## 📝 Test Results Template

After testing, fill in:

```
Date: ___________
Tester: ___________

Camera Capture: [ ] Pass [ ] Fail - Notes: ___________
Food Analysis: [ ] Pass [ ] Fail - Notes: ___________
Food Logging: [ ] Pass [ ] Fail - Notes: ___________
User ID Persistence: [ ] Pass [ ] Fail - Notes: ___________
Error Handling: [ ] Pass [ ] Fail - Notes: ___________
Package Integration: [ ] Pass [ ] Fail - Notes: ___________

Overall: [ ] Ready for Production [ ] Needs Fixes

Issues Found:
1. ___________
2. ___________
3. ___________
```

