# Food Logging Verification Guide

## ✅ What's Been Implemented

### Web App
- ✅ Food logs save to Supabase with unique user IDs
- ✅ Macros (protein, carbs, fat, fiber) are saved
- ✅ History page displays all logs from Supabase
- ✅ Dashboard shows today's totals from database
- ✅ Error handling with localStorage fallback
- ✅ Success/error feedback messages
- ✅ Console logging for debugging

### iOS App
- ✅ FoodLogService created for Supabase integration
- ✅ Unique user ID generation (stored in UserDefaults)
- ✅ Automatic food log saving after camera capture
- ✅ Success/error feedback in UI
- ✅ Environment variable support

---

## 🧪 Testing Checklist

### 1. Web App Testing

#### Test Food Logging
1. **Open the app** → Go to `/add-food`
2. **Take a photo** or manually enter food
3. **Check browser console** (F12) for:
   - `[DemoContext] Saving food log to Supabase for user: <uuid>`
   - `[DemoContext] ✅ Food log saved successfully to Supabase`
4. **Verify in Supabase Dashboard**:
   - Go to Table Editor → `food_logs`
   - Should see new row with your food data
   - Check `user_id`, `calories`, `protein_g`, `carbs_g`, `fat_g` columns

#### Test History Page
1. **Navigate to `/history`**
2. **Check browser console** for:
   - `[DemoContext] Loading food logs from Supabase for user: <uuid>`
   - `[DemoContext] ✅ Successfully loaded X food logs from Supabase`
3. **Verify**:
   - All your logged foods appear
   - Macros are displayed (if available)
   - Dates are correct
   - Calories match what you logged

#### Test Dashboard
1. **Navigate to `/dashboard`**
2. **Verify**:
   - Today's calories total matches your logs
   - Weekly progress is calculated correctly
   - Recent Activity shows latest logs
   - Today's Macros card shows totals (if macros available)

#### Test User Persistence
1. **Log food** → Note your `user_id` in console
2. **Close browser** → Reopen
3. **Check console** → Should see same `user_id`
4. **Log more food** → Should use same `user_id`
5. **Verify in Supabase** → All logs have same `user_id`

---

### 2. iOS App Testing

#### Setup Environment Variables
1. **Open Xcode** → Select `CalorieCameraHost` scheme
2. **Edit Scheme** → Run → Arguments → Environment Variables
3. **Add**:
   - `SUPABASE_URL` = `https://uisjdlxdqfovuwurmdop.supabase.co` (base URL)
   - `SUPABASE_ANON_KEY` = Your anon key from Supabase Dashboard

#### Test Food Capture & Logging
1. **Run the app** on simulator or device
2. **Check Xcode console** for:
   - `✅ [FoodLogService] Initialized with Supabase URL: ...`
   - `✅ [FoodLogService] Food log saved successfully for user: <uuid>`
3. **Open Calorie Camera** → Capture food
4. **Verify**:
   - Success message appears: "✅ Saved to database!"
   - No error messages
5. **Check Supabase Dashboard**:
   - Go to Table Editor → `food_logs`
   - Should see new row from iOS app
   - `user_id` should be a UUID

#### Test User Persistence (iOS)
1. **Capture food** → Note `user_id` in console
2. **Close app** → Reopen
3. **Capture more food** → Should use same `user_id`
4. **Verify in Supabase** → All iOS logs have same `user_id`

---

## 🔍 Debugging

### If Food Logs Don't Appear

#### Check Browser Console
Look for these messages:
- ✅ `[DemoContext] ✅ Food log saved successfully to Supabase` → Success!
- ❌ `[DemoContext] ❌ Failed to save food log to database` → Error occurred
- ⚠️ `[DemoContext] ⚠️ Saved to local state only (offline mode)` → Database failed, using localStorage

#### Check Supabase Dashboard
1. **Table Editor** → `food_logs` table
2. **Refresh** the table
3. **Check**:
   - Are there any rows?
   - Do they have your `user_id`?
   - Are macro columns populated?

#### Common Issues

**Issue: "Could not find the 'carbs_g' column"**
- **Fix**: Run the migration SQL in Supabase SQL Editor
- See: `supabase/migrations/20250120_add_macros_to_food_logs.sql`

**Issue: "new row violates row-level security policy"**
- **Fix**: Run the RLS policy update SQL
- See: Previous conversation for SQL

**Issue: "foreign key constraint violation"**
- **Fix**: Run the foreign key removal SQL
- See: Previous conversation for SQL

**Issue: Food logs not loading on History page**
- **Check**: Browser console for loading errors
- **Check**: User ID is consistent
- **Check**: Supabase connection is working

---

## 📊 Verification Queries

### Check Your Food Logs in Supabase

```sql
-- Get all your food logs (replace with your user_id)
SELECT * FROM food_logs 
WHERE user_id = 'your-user-id-here'
ORDER BY logged_at DESC;

-- Count logs per user
SELECT user_id, COUNT(*) as log_count 
FROM food_logs 
GROUP BY user_id;

-- Check macros are populated
SELECT food_type, calories, protein_g, carbs_g, fat_g 
FROM food_logs 
WHERE protein_g IS NOT NULL 
LIMIT 10;
```

---

## ✅ Success Criteria

### Web App
- [ ] Food logs save to Supabase successfully
- [ ] History page shows all logs from database
- [ ] Dashboard calculates totals from database
- [ ] Macros are displayed correctly
- [ ] User ID persists across sessions
- [ ] Error handling works (offline mode)

### iOS App
- [ ] Food logs save to Supabase successfully
- [ ] Success message appears after capture
- [ ] User ID persists across app restarts
- [ ] No errors in Xcode console
- [ ] Logs appear in Supabase Dashboard

---

## 🎯 Next Steps After Verification

1. **Test on multiple devices** → Verify user isolation
2. **Test offline mode** → Verify localStorage fallback
3. **Test with different foods** → Verify macro calculation
4. **Check data consistency** → Verify no duplicates
5. **Performance testing** → Verify fast loading

---

## 📝 Notes

- **User IDs**: Each browser/device gets a unique UUID stored in localStorage (web) or UserDefaults (iOS)
- **Data Sync**: Web app loads from Supabase on mount, iOS saves immediately after capture
- **Offline Support**: Web app falls back to localStorage if Supabase fails
- **Macros**: Only available if camera analysis provides them (from OpenAI/Supabase analyzer)

