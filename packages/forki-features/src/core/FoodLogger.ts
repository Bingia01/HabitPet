import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { FoodLog, StorageAdapter } from '../types';

export interface FoodLoggerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  storage?: StorageAdapter; // For user ID management (localStorage, AsyncStorage, etc.)
  userIdKey?: string; // Key for storing user ID (default: 'forki-user-id')
}

export class FoodLogger {
  private supabase: SupabaseClient;
  private storage: StorageAdapter;
  private userIdKey: string;

  constructor(config: FoodLoggerConfig) {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error(
        'FoodLogger requires supabaseUrl and supabaseKey. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      );
    }
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.storage = config.storage || this.getDefaultStorage();
    this.userIdKey = config.userIdKey || 'forki-user-id';
  }

  /**
   * Gets or creates a unique user ID
   * Stores in provided storage adapter (or localStorage by default)
   */
  getOrCreateUserId(): string {
    const existingId = this.storage.getItem(this.userIdKey);
    if (existingId) {
      return existingId;
    }

    // Generate UUID v4
    const newId = this.generateUUID();
    this.storage.setItem(this.userIdKey, newId);
    return newId;
  }

  /**
   * Saves a food log to Supabase
   * @param log - Food log data (user_id will be auto-filled if not provided)
   * @returns Saved food log with database ID
   */
  async saveLog(log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'> & { user_id?: string }): Promise<FoodLog> {
    const userId = log.user_id || this.getOrCreateUserId();
    
    const foodLogData: Omit<FoodLog, 'id' | 'created_at'> = {
      ...log,
      user_id: userId,
      logged_at: log.logged_at || new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('food_logs')
      .insert([foodLogData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save food log: ${error.message}`);
    }

    return data as FoodLog;
  }

  /**
   * Gets food logs for a user
   * @param userId - User ID (optional, uses stored ID if not provided)
   * @param limit - Maximum number of logs to return
   * @param offset - Offset for pagination
   * @returns Array of food logs
   */
  async getLogs(userId?: string, limit?: number, offset?: number): Promise<FoodLog[]> {
    const targetUserId = userId || this.getOrCreateUserId();
    
    let query = this.supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', targetUserId)
      .order('logged_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get food logs: ${error.message}`);
    }

    return (data || []) as FoodLog[];
  }

  /**
   * Gets food logs within a date range
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param userId - User ID (optional, uses stored ID if not provided)
   * @returns Array of food logs
   */
  async getLogsByDateRange(startDate: string, endDate: string, userId?: string): Promise<FoodLog[]> {
    const targetUserId = userId || this.getOrCreateUserId();
    
    const { data, error } = await this.supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', targetUserId)
      .gte('logged_at', startDate)
      .lte('logged_at', endDate)
      .order('logged_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get food logs by date range: ${error.message}`);
    }

    return (data || []) as FoodLog[];
  }

  /**
   * Updates a food log
   * @param logId - Food log ID
   * @param updates - Partial food log data to update
   * @returns Updated food log
   */
  async updateLog(logId: string, updates: Partial<FoodLog>): Promise<FoodLog> {
    const { data, error } = await this.supabase
      .from('food_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update food log: ${error.message}`);
    }

    return data as FoodLog;
  }

  /**
   * Deletes a food log
   * @param logId - Food log ID
   */
  async deleteLog(logId: string): Promise<void> {
    const { error } = await this.supabase
      .from('food_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      throw new Error(`Failed to delete food log: ${error.message}`);
    }
  }

  /**
   * Gets daily calories for a user
   * @param date - Date string (YYYY-MM-DD)
   * @param userId - User ID (optional, uses stored ID if not provided)
   * @returns Total calories for the day
   */
  async getDailyCalories(date: string, userId?: string): Promise<number> {
    const targetUserId = userId || this.getOrCreateUserId();
    
    const { data, error } = await this.supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', targetUserId)
      .gte('logged_at', `${date}T00:00:00Z`)
      .lt('logged_at', `${date}T23:59:59Z`);

    if (error) {
      throw new Error(`Failed to get daily calories: ${error.message}`);
    }

    return (data || []).reduce((total, log) => total + log.calories, 0);
  }

  /**
   * Gets weekly calories for a user
   * @param startDate - Start date (YYYY-MM-DD)
   * @param userId - User ID (optional, uses stored ID if not provided)
   * @returns Total calories for the week
   */
  async getWeeklyCalories(startDate: string, userId?: string): Promise<number> {
    const targetUserId = userId || this.getOrCreateUserId();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data, error } = await this.supabase
      .from('food_logs')
      .select('calories')
      .eq('user_id', targetUserId)
      .gte('logged_at', `${startDate}T00:00:00Z`)
      .lte('logged_at', `${endDate.toISOString().split('T')[0]}T23:59:59Z`);

    if (error) {
      throw new Error(`Failed to get weekly calories: ${error.message}`);
    }

    return (data || []).reduce((total, log) => total + log.calories, 0);
  }

  /**
   * Gets default storage adapter (localStorage for browser, in-memory for Node.js)
   */
  private getDefaultStorage(): StorageAdapter {
    // Browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key: string) => window.localStorage.getItem(key),
        setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
      };
    }

    // Node.js environment - use in-memory storage
    const memoryStorage: Record<string, string> = {};
    return {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
      },
    };
  }

  /**
   * Generates a UUID v4
   */
  private generateUUID(): string {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

