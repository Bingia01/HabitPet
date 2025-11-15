/**
 * Core types for Forki Features package
 * Framework-agnostic types for food analysis and logging
 */

export type AnalyzerSource = 'supabase' | 'openai' | 'stub';

export interface AnalyzeInput {
  imageUrl?: string;
  imageBase64?: string;
  region?: string;
}

export interface AnalyzeItem {
  label: string;
  confidence: number;
  calories?: number;
  weightGrams?: number;
  volumeML?: number;
  priors?: {
    kcalPerG: { mu: number; sigma: number };
    density: { mu: number; sigma: number };
  };
  evidence?: string[];
  macros?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
  };
}

export interface AnalyzeOutput {
  items: AnalyzeItem[];
  meta?: {
    used: AnalyzerSource[];
    latencyMs?: number;
    isFallback?: boolean;
  };
}

export interface Analyzer {
  analyze(input: AnalyzeInput): Promise<AnalyzeOutput>;
}

export interface FoodLog {
  id?: string;
  user_id: string;
  food_type: string;
  ingredients: string[];
  portion_size: string;
  calories: number;
  emoji: string;
  logged_at: string;
  created_at?: string;
  weight_g?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
}

export interface FoodAnalysisResult {
  foodType: string;
  confidence: number;
  calories: number;
  weight: number;
  emoji: string;
  macros?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
  };
  analyzerSource?: string;
  usedFallback?: boolean;
}

export interface ForkiConfig {
  apiUrl?: string; // Optional: defaults to reading from env
  supabaseUrl?: string; // Optional: defaults to reading from env
  supabaseKey?: string; // Optional: defaults to reading from env
  storage?: StorageAdapter; // Optional: for user ID management
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

