/**
 * @forki/features - Modular food analysis and logging features
 * 
 * Framework-agnostic package for food calorie calculation and Supabase logging.
 * Uses shared infrastructure (same Supabase, Vercel, OpenAI).
 * 
 * @example
 * ```typescript
 * import { foodAnalyzer, foodLogger, cameraCapture } from '@forki/features';
 * 
 * // Analyze food image
 * const analysis = await foodAnalyzer.analyzeImage(imageBlob);
 * 
 * // Log to Supabase
 * const log = await foodLogger.saveLog({
 *   food_type: analysis.foodType,
 *   calories: analysis.calories,
 *   weight_g: analysis.weight,
 *   protein_g: analysis.macros.proteinG,
 *   carbs_g: analysis.macros.carbsG,
 *   fat_g: analysis.macros.fatG,
 *   emoji: analysis.emoji,
 *   ingredients: [analysis.foodType],
 *   portion_size: 'Standard serving',
 * });
 * ```
 */

import { getConfig, getFallbackChain, getAnalyzerAvailability } from './config/getConfig';
import { FoodAnalyzer } from './core/FoodAnalyzer';
import { FoodLogger } from './core/FoodLogger';
import { CameraCapture } from './core/CameraCapture';

// Export types
export type {
  FoodAnalysisResult,
  FoodLog,
  ForkiConfig,
  StorageAdapter,
  AnalyzeInput,
  AnalyzeOutput,
  AnalyzerSource,
} from './types';

// Export classes (for custom configuration)
export { FoodAnalyzer } from './core/FoodAnalyzer';
export { FoodLogger } from './core/FoodLogger';
export { CameraCapture } from './core/CameraCapture';

// Export config utilities
export { getConfig, getFallbackChain, getAnalyzerAvailability } from './config/getConfig';

// Get shared configuration from environment variables
// Note: We use lazy initialization to avoid errors if env vars aren't set at module load time
let _config: ReturnType<typeof getConfig> | null = null;
let _foodAnalyzer: FoodAnalyzer | null = null;
let _foodLogger: FoodLogger | null = null;
let _cameraCapture: CameraCapture | null = null;

function getConfigLazy() {
  if (!_config) {
    _config = getConfig();
  }
  return _config;
}

// Create pre-configured instances (lazy-loaded, uses shared env vars)
// These work out of the box - no configuration needed!
export const foodAnalyzer: FoodAnalyzer = new Proxy({} as FoodAnalyzer, {
  get(_target, prop) {
    if (!_foodAnalyzer) {
      const config = getConfigLazy();
      _foodAnalyzer = new FoodAnalyzer({
        apiUrl: config.apiUrl, // Uses shared Vercel API
        supabaseUrl: config.supabaseUrl, // Uses shared Supabase
        supabaseKey: config.supabaseKey, // Uses shared Supabase key
        openaiKey: typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : undefined,
      });
    }
    const value = (_foodAnalyzer as any)[prop];
    return typeof value === 'function' ? value.bind(_foodAnalyzer) : value;
  },
});

export const foodLogger: FoodLogger = new Proxy({} as FoodLogger, {
  get(_target, prop) {
    if (!_foodLogger) {
      const config = getConfigLazy();
      // Double-check: if still empty, try reading directly from process.env as fallback
      let supabaseUrl = config.supabaseUrl;
      let supabaseKey = config.supabaseKey;
      
      if (!supabaseUrl || !supabaseKey) {
        // Last resort: read directly (should work in Next.js)
        if (typeof process !== 'undefined' && process.env) {
          supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
          supabaseKey = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
        }
      }
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'FoodLogger requires Supabase credentials. ' +
          'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. ' +
          'Current values: ' +
          `supabaseUrl=${supabaseUrl ? 'set' : 'missing'}, ` +
          `supabaseKey=${supabaseKey ? 'set' : 'missing'}`
        );
      }
      _foodLogger = new FoodLogger({
        supabaseUrl, // Uses shared Supabase
        supabaseKey, // Uses shared Supabase key
        // Uses localStorage by default for user ID management
      });
    }
    const value = (_foodLogger as any)[prop];
    return typeof value === 'function' ? value.bind(_foodLogger) : value;
  },
});

export const cameraCapture: CameraCapture = new Proxy({} as CameraCapture, {
  get(_target, prop) {
    if (!_cameraCapture) {
      _cameraCapture = new CameraCapture();
    }
    const value = (_cameraCapture as any)[prop];
    return typeof value === 'function' ? value.bind(_cameraCapture) : value;
  },
});

/**
 * Main ForkiFeatures class for convenience
 * Provides all features in one place
 */
export class ForkiFeatures {
  analyzer: FoodAnalyzer;
  logger: FoodLogger;
  camera: CameraCapture;

  constructor(customConfig?: Partial<{
    apiUrl: string;
    supabaseUrl: string;
    supabaseKey: string;
    openaiKey: string;
    storage: import('./types').StorageAdapter;
  }>) {
    const baseConfig = getConfigLazy(); // Use lazy config getter
    const finalConfig = customConfig 
      ? { ...baseConfig, ...customConfig }
      : baseConfig;

    this.analyzer = new FoodAnalyzer({
      apiUrl: finalConfig.apiUrl,
      supabaseUrl: finalConfig.supabaseUrl,
      supabaseKey: finalConfig.supabaseKey,
      openaiKey: customConfig?.openaiKey || (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : undefined),
    });

    this.logger = new FoodLogger({
      supabaseUrl: finalConfig.supabaseUrl,
      supabaseKey: finalConfig.supabaseKey,
      storage: customConfig?.storage,
    });

    this.camera = new CameraCapture();
  }
}

// Export convenience instance
export const forki = new ForkiFeatures();

