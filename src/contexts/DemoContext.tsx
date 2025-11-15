'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { User, UserPreferences, FoodLog, UserProgress } from '@/types';
import { calculateAvatarState } from '@/lib/avatar-logic';
import { DatabaseService } from '@/lib/database';

interface DemoState {
  user: User | null;
  preferences: UserPreferences | null;
  foodLogs: FoodLog[];
  progress: UserProgress | null;
  isOnboardingComplete: boolean;
}

type DemoAction =
  | { type: 'COMPLETE_ONBOARDING'; payload: { user: User; preferences: UserPreferences } }
  | { type: 'ADD_FOOD_LOG'; payload: FoodLog }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'RESET_DEMO' }
  | { type: 'LOAD_FROM_STORAGE'; payload: DemoState };

interface AppContextType {
  state: DemoState;
  dispatch: React.Dispatch<DemoAction>;
  addFoodLog: (foodLog: Omit<FoodLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, preferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  resetApp: () => void;
  getUserId: () => string;
}

const initialState: DemoState = {
  user: null,
  preferences: null,
  foodLogs: [],
  progress: null,
  isOnboardingComplete: false,
};

// Generate some sample food logs for demo (will be replaced by real data from Supabase)
const generateSampleLogs = (): FoodLog[] => {
  // Return empty array - real logs will be loaded from Supabase
  return [];
};

const calculateProgress = (foodLogs: FoodLog[], dailyGoal: number, weeklyGoal: number, userId: string): UserProgress => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  // Calculate today's calories
  const todayCalories = foodLogs
    .filter(log => new Date(log.logged_at) >= todayStart)
    .reduce((sum, log) => sum + log.calories, 0);

  // Calculate this week's calories
  const weekCalories = foodLogs
    .filter(log => new Date(log.logged_at) >= weekStart)
    .reduce((sum, log) => sum + log.calories, 0);

  const dailyProgress = Math.min(100, (todayCalories / dailyGoal) * 100);
  const weeklyProgress = Math.min(100, (weekCalories / weeklyGoal) * 100);

  // Calculate streak (simplified for demo)
  const currentStreak = dailyProgress >= 60 ? Math.floor(Math.random() * 5) + 1 : 0;
  const level = Math.floor(foodLogs.length / 5) + 1;

  // Determine avatar state
  const avatarStats = {
    dailyProgress,
    weeklyProgress,
    currentStreak,
    level,
    totalCaloriesLogged: foodLogs.reduce((sum, log) => sum + log.calories, 0),
    dailyGoal,
    weeklyGoal,
  };

  const avatarState = calculateAvatarState(avatarStats);

  return {
    id: `progress-${userId}`,
    user_id: userId,
    current_streak: currentStreak,
    level,
    daily_progress: dailyProgress,
    weekly_progress: weeklyProgress,
    avatar_state: avatarState.state,
    last_updated: new Date().toISOString(),
  };
};

const demoReducer = (state: DemoState, action: DemoAction): DemoState => {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      const newState = {
        ...state,
        user: action.payload.user,
        preferences: action.payload.preferences,
        isOnboardingComplete: true,
        foodLogs: generateSampleLogs().map(log => ({ ...log, user_id: action.payload.user.id })),
      };
      newState.progress = calculateProgress(
        newState.foodLogs,
        action.payload.preferences.daily_calorie_goal,
        action.payload.preferences.weekly_calorie_goal,
        action.payload.user.id
      );
      return newState;

    case 'ADD_FOOD_LOG':
      const updatedLogs = [...state.foodLogs, action.payload];
      const userId = action.payload.user_id;
      const updatedProgress = state.preferences
        ? calculateProgress(updatedLogs, state.preferences.daily_calorie_goal, state.preferences.weekly_calorie_goal, userId)
        : state.progress;

      return {
        ...state,
        foodLogs: updatedLogs,
        progress: updatedProgress,
      };

    case 'UPDATE_PREFERENCES':
      const updatedPreferences = { ...state.preferences!, ...action.payload };
      const userIdForProgress = state.user?.id || 'demo-user';
      const recalculatedProgress = calculateProgress(
        state.foodLogs,
        updatedPreferences.daily_calorie_goal,
        updatedPreferences.weekly_calorie_goal,
        userIdForProgress
      );

      return {
        ...state,
        preferences: updatedPreferences,
        progress: recalculatedProgress,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user!, ...action.payload },
      };

    case 'RESET_DEMO':
      return initialState;

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate or retrieve unique user ID
const getOrCreateUserId = (): string => {
  const STORAGE_KEY = 'forki-user-id';
  let userId = localStorage.getItem(STORAGE_KEY);
  
  if (!userId) {
    // Generate a UUID v4
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem(STORAGE_KEY, userId);
  }
  
  return userId;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const userIdRef = useRef<string>(getOrCreateUserId());
  const hasLoadedFromSupabaseRef = useRef(false);

  // Load food logs from Supabase on mount
  useEffect(() => {
    const loadFoodLogsFromSupabase = async () => {
      if (hasLoadedFromSupabaseRef.current) return;
      hasLoadedFromSupabaseRef.current = true;

      const userId = userIdRef.current;
      console.log(`[DemoContext] Loading food logs from Supabase for user: ${userId}`);

      try {
        const logs = await DatabaseService.getFoodLogs(userId, 100);
        console.log(`[DemoContext] Loaded ${logs?.length || 0} food logs from Supabase`);
        
        if (logs && logs.length > 0) {
          // Replace all logs with Supabase data (avoid duplicates)
          // We'll dispatch a custom action to replace all logs at once
          logs.forEach(log => {
            dispatch({ type: 'ADD_FOOD_LOG', payload: log });
          });
          console.log(`[DemoContext] ✅ Successfully loaded ${logs.length} food logs from Supabase`);
        } else {
          console.log(`[DemoContext] No food logs found in Supabase for user ${userId}`);
        }
      } catch (error) {
        console.error('[DemoContext] ❌ Failed to load food logs from Supabase:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('habitpet-app-state');
        if (saved) {
          try {
            const parsedState = JSON.parse(saved);
            dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
            console.log('[DemoContext] Loaded state from localStorage fallback');
          } catch (e) {
            console.error('[DemoContext] Failed to load app state from localStorage:', e);
          }
        }
      }
    };

    loadFoodLogsFromSupabase();
  }, []);

  // Load state from localStorage on mount (as fallback)
  useEffect(() => {
    if (hasLoadedFromSupabaseRef.current) return; // Skip if already loaded from Supabase
    
    const saved = localStorage.getItem('habitpet-app-state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
      } catch (e) {
        console.error('Failed to load app state:', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes (for offline support)
  useEffect(() => {
    localStorage.setItem('habitpet-app-state', JSON.stringify(state));
  }, [state]);

  const getUserId = () => userIdRef.current;

  const addFoodLog = async (foodLogData: Omit<FoodLog, 'id' | 'user_id' | 'created_at'>) => {
    const userId = userIdRef.current;
    console.log(`[DemoContext] Saving food log to Supabase for user: ${userId}`, foodLogData);
    
    try {
      // Save to Supabase first
      const savedLog = await DatabaseService.createFoodLog({
        ...foodLogData,
        user_id: userId,
      });
      
      console.log(`[DemoContext] ✅ Food log saved successfully to Supabase:`, savedLog);
      
      // Update local state with the saved log (includes database ID)
      dispatch({ type: 'ADD_FOOD_LOG', payload: savedLog });
      return savedLog; // Return saved log for success handling
    } catch (error) {
      console.error('[DemoContext] ❌ Failed to save food log to database:', error);
      // Fallback: save to local state only (for offline support)
      const foodLog: FoodLog = {
        ...foodLogData,
        id: Date.now().toString(),
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_FOOD_LOG', payload: foodLog });
      console.warn('[DemoContext] ⚠️ Saved to local state only (offline mode)');
      throw error; // Re-throw so caller can handle it
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const completeOnboarding = (
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'>,
    preferencesData: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    const userId = userIdRef.current;
    
    const user: User = {
      ...userData,
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const preferences: UserPreferences = {
      ...preferencesData,
      id: `preferences-${userId}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dispatch({ type: 'COMPLETE_ONBOARDING', payload: { user, preferences } });
  };

  const resetApp = () => {
    dispatch({ type: 'RESET_DEMO' });
    localStorage.removeItem('habitpet-app-state');
    // Note: We don't remove the user ID so the user keeps their identity
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addFoodLog,
        updatePreferences,
        updateUser,
        completeOnboarding,
        resetApp,
        getUserId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Keep old exports for compatibility during transition
export const useDemo = useApp;
export const DemoProvider = AppProvider;