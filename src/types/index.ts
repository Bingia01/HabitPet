export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  dietary_preferences: DietaryPreference[];
  food_preferences: FoodPreference[];
  daily_calorie_goal: number;
  weekly_calorie_goal: number;
  nutrition_goals: NutritionGoal[];
  created_at: string;
  updated_at: string;
}

export type DietaryPreference = 'vegetarian' | 'high-protein' | 'low-carb' | 'vegan' | 'balanced';

export type FoodPreference = '🍎' | '🥦' | '🍗' | '🥩' | '🐖' | '🐟' | '🧀' | '🍰' | '🍚' | '🥜' | '🥚';

export type NutritionGoal = 'high-protein' | 'more-veggies' | 'low-sugar' | 'balanced-meals';

export interface FoodLog {
  id: string;
  user_id: string;
  food_type: string;
  ingredients: string[];
  portion_size: string;
  calories: number;
  emoji: string;
  logged_at: string;
  created_at: string;
  weight_g?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
}

export type AvatarState = 'sad' | 'neutral' | 'happy' | 'excited';

export interface UserProgress {
  id: string;
  user_id: string;
  current_streak: number;
  level: number;
  daily_progress: number; // percentage 0-100
  weekly_progress: number; // percentage 0-100
  avatar_state: AvatarState;
  last_updated: string;
}

export interface AIFoodAnalysis {
  foodType: string;
  ingredients: string[];
  weight: number; // in grams
  calories: number;
  confidence: number;
}

export interface CalorieEstimate {
  calories: number;
  portion_description: string;
}