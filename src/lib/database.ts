import { supabase } from './supabase';
import { User, UserPreferences, FoodLog, UserProgress, DietaryPreference, FoodPreference, NutritionGoal } from '@/types';
import { foodLogger } from '@forki/features';

export class DatabaseService {
  // User operations
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User preferences operations
  static async createUserPreferences(
    userId: string,
    preferences: {
      dietary_preferences: DietaryPreference[];
      food_preferences: FoodPreference[];
      daily_calorie_goal?: number;
      weekly_calorie_goal?: number;
      nutrition_goals?: NutritionGoal[];
    }
  ) {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert([{
        user_id: userId,
        ...preferences
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserPreferences(userId: string, updates: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Food log operations
  // Uses @forki/features foodLogger for modularity
  static async createFoodLog(foodLog: Omit<FoodLog, 'id' | 'created_at'>): Promise<FoodLog> {
    // Use foodLogger from @forki/features package
    const saved = await foodLogger.saveLog(foodLog);
    // Ensure id and created_at are present (database always returns them)
    if (!saved.id || !saved.created_at) {
      throw new Error('Database did not return id or created_at for food log');
    }
    // Cast to local FoodLog type (id and created_at are required)
    return saved as FoodLog;
  }

  static async getFoodLogs(userId: string, limit?: number, offset?: number): Promise<FoodLog[]> {
    // Use foodLogger from @forki/features package
    const logs = await foodLogger.getLogs(userId, limit, offset);
    // Ensure all logs have required id and created_at (database always returns them)
    return logs.map(log => {
      if (!log.id || !log.created_at) {
        throw new Error('Database returned food log without id or created_at');
      }
      return log as FoodLog;
    });
  }

  static async getFoodLogsByDateRange(userId: string, startDate: string, endDate: string) {
    // Use foodLogger from @forki/features package
    return await foodLogger.getLogsByDateRange(startDate, endDate, userId);
  }

  static async updateFoodLog(logId: string, updates: Partial<FoodLog>) {
    // Use foodLogger from @forki/features package
    return await foodLogger.updateLog(logId, updates);
  }

  static async deleteFoodLog(logId: string) {
    // Use foodLogger from @forki/features package
    await foodLogger.deleteLog(logId);
  }

  // User progress operations
  static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUserProgress(userId: string, updates: Partial<UserProgress>) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        ...updates
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics and aggregations
  static async getDailyCalories(userId: string, date: string) {
    const { data, error } = await supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00Z`)
      .lt('logged_at', `${date}T23:59:59Z`);

    if (error) throw error;

    return data.reduce((total, log) => total + log.calories, 0);
  }

  static async getWeeklyCalories(userId: string, startDate: string) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data, error } = await supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', userId)
      .gte('logged_at', `${startDate}T00:00:00Z`)
      .lte('logged_at', `${endDate.toISOString().split('T')[0]}T23:59:59Z`);

    if (error) throw error;

    return data.reduce((total, log) => total + log.calories, 0);
  }

  // Utility function to recalculate user progress
  static async recalculateProgress(userId: string) {
    const { error } = await supabase.rpc('calculate_user_progress', {
      target_user_id: userId
    });

    if (error) throw error;
  }
}